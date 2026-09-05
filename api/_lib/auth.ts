import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_JWT_SECRET = process.env.JWT_SECRET || 'reach_super_secret_jwt_signing_key_2026_soc2';

export interface UserSessionPayload {
  userId: string;
  orgId: string;
  role: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

/**
 * Generates a cryptographically random 6-digit numeric OTP code
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Timing-Safe Comparison to eliminate side-channel timing attacks
 */
export function verifyOtpTimingSafe(providedCode: string, expectedCode: string): boolean {
  if (!providedCode || !expectedCode) return false;

  const bufProvided = Buffer.from(providedCode.trim());
  const bufExpected = Buffer.from(expectedCode.trim());

  if (bufProvided.length !== bufExpected.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

/**
 * Creates a signed JWT session token (HMAC-SHA256)
 */
export function createSessionJwt(payload: UserSessionPayload, secret: string = DEFAULT_JWT_SECRET, expiresInSeconds: number = 604800): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  
  const fullPayload: UserSessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies a signed JWT session token
 */
export function verifySessionJwt(token: string, secret: string = DEFAULT_JWT_SECRET): UserSessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, providedSignature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (providedSignature !== expectedSignature) {
    return null;
  }

  try {
    const payload: UserSessionPayload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Sets an HTTP-Only, Secure, SameSite=Strict cookie for session tokens
 */
export function setSessionCookie(res: VercelResponse, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = [
    `session_token=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=604800', // 7 days
    isProd ? 'Secure' : ''
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookieOptions);
}

/**
 * Clears the session cookie upon logout
 */
export function clearSessionCookie(res: VercelResponse): void {
  res.setHeader('Set-Cookie', 'session_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
}

/**
 * Extracts and verifies the session token from cookie headers or Authorization bearer
 */
export function extractSessionFromRequest(req: VercelRequest, secret: string = DEFAULT_JWT_SECRET): UserSessionPayload | null {
  const cookieHeader = req.headers.cookie;
  let token: string | null = null;

  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith('session_token='));
    if (sessionCookie) {
      token = sessionCookie.split('=')[1];
    }
  }

  if (!token && req.headers.authorization) {
    const auth = req.headers.authorization;
    if (auth.startsWith('Bearer ')) {
      token = auth.substring(7).trim();
    }
  }

  if (!token) return null;
  return verifySessionJwt(token, secret);
}
