import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, isDatabaseConfigured } from './_lib/db';
import { authSendOtpSchema, authVerifyOtpSchema } from './_lib/validation';
import { 
  generateSecureOtp, 
  verifyOtpTimingSafe, 
  createSessionJwt, 
  setSessionCookie, 
  clearSessionCookie, 
  extractSessionFromRequest 
} from './_lib/auth';
import { checkRateLimit, setRateLimitHeaders, getClientIp } from './_lib/rateLimiter';

// In-memory OTP store for active sessions (Identifier -> { code, expiresAt, attempts })
const activeOtpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-org-id');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const clientIp = getClientIp(req);
  const action = (req.query.action as string) || (req.body?.action as string);

  try {
    // ------------------------------------------------------------------------
    // 1. GET: Verify Active Session from HTTP-Only Cookie
    // ------------------------------------------------------------------------
    if (req.method === 'GET' && action === 'session') {
      const session = extractSessionFromRequest(req);
      if (!session) {
        res.status(401).json({ authenticated: false, session: null });
        return;
      }

      res.status(200).json({
        authenticated: true,
        session
      });
      return;
    }

    // ------------------------------------------------------------------------
    // 2. POST: Send Passwordless OTP (Rate Limited)
    // ------------------------------------------------------------------------
    if (req.method === 'POST' && action === 'send-otp') {
      // Apply Rate Limiting: Max 5 OTP requests per 15 minutes per IP
      const rateCheck = checkRateLimit(`otp_send:${clientIp}`, 5, 15 * 60 * 1000);
      setRateLimitHeaders(res, rateCheck);

      if (!rateCheck.allowed) {
        res.status(429).json({
          error: 'Too many OTP requests. Please wait 15 minutes before requesting a new code.',
          retryAfter: Math.ceil((rateCheck.resetAt - Date.now()) / 1000)
        });
        return;
      }

      const validation = authSendOtpSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0]?.message || 'Invalid input' });
        return;
      }

      const identifier = validation.data.identifier.toLowerCase();
      const code = generateSecureOtp();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL

      activeOtpStore.set(identifier, { code, expiresAt, attempts: 0 });

      // In production, dispatch via Postmark (Email) or Twilio (SMS)
      console.log(`[Security Auth] OTP Dispatched for ${identifier}: ${code} (Expires in 5m)`);

      res.status(200).json({
        success: true,
        message: `A 6-digit verification code was sent to ${identifier}.`,
        expiresIn: 300,
        // In dev / test mode, expose hint for automated test suites
        hint: process.env.NODE_ENV !== 'production' ? code : undefined
      });
      return;
    }

    // ------------------------------------------------------------------------
    // 3. POST: Timing-Safe OTP Verification & HTTP-Only Cookie Issuance
    // ------------------------------------------------------------------------
    if (req.method === 'POST' && action === 'verify-otp') {
      const validation = authVerifyOtpSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0]?.message || 'Invalid code format' });
        return;
      }

      const identifier = validation.data.identifier.toLowerCase();
      const providedCode = validation.data.code;

      // Rate limit verification attempts: Max 5 attempts per identifier per window
      const verifyRate = checkRateLimit(`otp_verify:${identifier}`, 5, 15 * 60 * 1000);
      setRateLimitHeaders(res, verifyRate);

      if (!verifyRate.allowed) {
        res.status(429).json({ error: 'Too many failed verification attempts. Please request a new code.' });
        return;
      }

      const stored = activeOtpStore.get(identifier);
      if (!stored) {
        res.status(400).json({ error: 'No active verification code found. Please request a new code.' });
        return;
      }

      if (Date.now() > stored.expiresAt) {
        activeOtpStore.delete(identifier);
        res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
        return;
      }

      stored.attempts += 1;
      const isMatch = verifyOtpTimingSafe(providedCode, stored.code);

      if (!isMatch) {
        res.status(400).json({
          error: 'Invalid verification code. Please check and try again.',
          remainingAttempts: Math.max(0, 5 - stored.attempts)
        });
        return;
      }

      // Successful verification -> clean up OTP
      activeOtpStore.delete(identifier);

      let user = {
        userId: `usr_${Date.now()}`,
        orgId: (req.headers['x-org-id'] as string) || 'org_1',
        role: 'volunteer',
        email: identifier.includes('@') ? identifier : 'volunteer@example.com',
        name: identifier.split('@')[0] || 'Volunteer'
      };

      // If live database is connected, lookup user in users table
      if (isDatabaseConfigured()) {
        const sql = getDb();
        if (sql) {
          const dbUsers = await sql`
            SELECT id, org_id, role, email, name 
            FROM users 
            WHERE email = ${identifier} OR phone = ${identifier}
            LIMIT 1
          `;
          if (dbUsers.length > 0) {
            user = {
              userId: dbUsers[0].id,
              orgId: dbUsers[0].org_id,
              role: dbUsers[0].role,
              email: dbUsers[0].email,
              name: dbUsers[0].name
            };
          }
        }
      }

      // Generate signed JWT and set HTTP-Only cookie
      const sessionToken = createSessionJwt(user);
      setSessionCookie(res, sessionToken);

      res.status(200).json({
        success: true,
        authenticated: true,
        user,
        sessionToken
      });
      return;
    }

    // ------------------------------------------------------------------------
    // 4. POST: Logout & Clear Cookie
    // ------------------------------------------------------------------------
    if (req.method === 'POST' && action === 'logout') {
      clearSessionCookie(res);
      res.status(200).json({ success: true, authenticated: false });
      return;
    }

    res.status(400).json({ error: 'Invalid auth action' });
  } catch (error: any) {
    console.error('[API /auth Error]:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
