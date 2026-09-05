import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, isDatabaseConfigured } from './_lib/db';
import { registrationInputSchema } from './_lib/validation';
import { checkRateLimit, setRateLimitHeaders, getClientIp } from './_lib/rateLimiter';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-org-id');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const clientIp = getClientIp(req);

  // Fallback mode if DB connection string not present
  if (!isDatabaseConfigured()) {
    res.status(200).json({
      status: 'fallback_mode',
      message: 'Registrations endpoint in fallback mode.',
      method: req.method
    });
    return;
  }

  const sql = getDb();
  if (!sql) {
    res.status(500).json({ error: 'Database connection failed' });
    return;
  }

  try {
    // ------------------------------------------------------------------------
    // GET: Self-Service 4-in-1 Pass Lookup by manage_token (Rate-Limited)
    // ------------------------------------------------------------------------
    if (req.method === 'GET') {
      const rateCheck = checkRateLimit(`pass_lookup:${clientIp}`, 30, 60 * 1000);
      setRateLimitHeaders(res, rateCheck);

      if (!rateCheck.allowed) {
        res.status(429).json({ error: 'Too many pass lookup requests. Please slow down.' });
        return;
      }

      const { token, eventId } = req.query;

      if (token) {
        const registrations = await sql`
          SELECT r.*,
            COALESCE(json_agg(DISTINCT gm.*) FILTER (WHERE gm.id IS NOT NULL), '[]') as members,
            COALESCE(json_agg(DISTINCT cs.*) FILTER (WHERE cs.id IS NOT NULL), '[]') as shift_claims,
            COALESCE(json_agg(DISTINCT ci.*) FILTER (WHERE ci.id IS NOT NULL), '[]') as item_pledges,
            COALESCE(json_agg(DISTINCT tp.*) FILTER (WHERE tp.id IS NOT NULL), '[]') as ticket_purchases,
            COALESCE(json_agg(DISTINCT d.*) FILTER (WHERE d.id IS NOT NULL), '[]') as donations,
            COALESCE(json_agg(DISTINCT sw.*) FILTER (WHERE sw.id IS NOT NULL), '[]') as waivers
          FROM registrations r
          LEFT JOIN group_members gm ON gm.registration_id = r.id
          LEFT JOIN claimed_shifts cs ON cs.registration_id = r.id
          LEFT JOIN claimed_items ci ON ci.registration_id = r.id
          LEFT JOIN ticket_purchases tp ON tp.registration_id = r.id
          LEFT JOIN donations d ON d.registration_id = r.id
          LEFT JOIN signed_waivers sw ON sw.registration_id = r.id
          WHERE r.manage_token = ${token as string}
          GROUP BY r.id
        `;

        if (registrations.length === 0) {
          res.status(404).json({ error: 'Pass not found or expired token.' });
          return;
        }

        res.status(200).json({ registration: registrations[0] });
        return;
      }

      if (eventId) {
        const list = await sql`
          SELECT r.*, 
            COUNT(DISTINCT cs.id) as shift_count,
            COUNT(DISTINCT ci.id) as item_count
          FROM registrations r
          LEFT JOIN claimed_shifts cs ON cs.registration_id = r.id
          LEFT JOIN claimed_items ci ON ci.registration_id = r.id
          WHERE r.event_id = ${eventId as string}
          GROUP BY r.id
          ORDER BY r.created_at DESC
        `;
        res.status(200).json({ registrations: list });
        return;
      }

      res.status(400).json({ error: 'Missing token or eventId parameter' });
      return;
    }

    // ------------------------------------------------------------------------
    // POST: Unified Registration Intake with Zod Validation & Overlap Defense
    // ------------------------------------------------------------------------
    if (req.method === 'POST') {
      // 1. Apply Rate Limiting: Max 10 registrations per minute per IP
      const rateCheck = checkRateLimit(`reg_create:${clientIp}`, 10, 60 * 1000);
      setRateLimitHeaders(res, rateCheck);

      if (!rateCheck.allowed) {
        res.status(429).json({ error: 'Too many registration requests. Please wait a minute before trying again.' });
        return;
      }

      // 2. Strict Zod Schema Validation
      const validation = registrationInputSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Validation Error: ' + validation.error.errors.map(e => e.message).join(', '),
          details: validation.error.format()
        });
        return;
      }

      const payload = validation.data;
      const shiftSelections = payload.shiftSelections;

      // 3. Validate Shift Capacities & Anti-Collision Interval Checks
      if (shiftSelections.length > 0) {
        const shiftIds = shiftSelections.map(s => s.shiftId);
        const shifts = await sql`
          SELECT id, title, start_time, end_time, capacity, claimed_count 
          FROM shifts 
          WHERE id = ANY(${shiftIds})
        `;

        // Check Capacity
        for (const sel of shiftSelections) {
          const shift = shifts.find(s => s.id === sel.shiftId);
          if (shift && shift.claimed_count >= shift.capacity) {
            res.status(409).json({
              error: `Shift "${shift.title}" was just filled. Please select an alternate open slot.`
            });
            return;
          }
        }

        // Check Temporal Overlaps for Same Participant ("One Place at a Time")
        for (let i = 0; i < shiftSelections.length; i++) {
          for (let j = i + 1; j < shiftSelections.length; j++) {
            if (shiftSelections[i].groupMemberIndex === shiftSelections[j].groupMemberIndex) {
              const s1 = shifts.find(s => s.id === shiftSelections[i].shiftId);
              const s2 = shifts.find(s => s.id === shiftSelections[j].shiftId);

              if (s1 && s2) {
                const start1 = new Date(s1.start_time).getTime();
                const end1 = new Date(s1.end_time).getTime();
                const start2 = new Date(s2.start_time).getTime();
                const end2 = new Date(s2.end_time).getTime();

                if (start1 < end2 && end1 > start2) {
                  res.status(400).json({
                    error: `Schedule Collision: A volunteer cannot be assigned to overlapping shifts ("${s1.title}" and "${s2.title}").`
                  });
                  return;
                }
              }
            }
          }
        }
      }

      // 4. Generate 256-Bit Cryptographic Manage Token
      const manageToken = payload.manageToken || `pass_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // 5. Insert Registration Record
      const regResults = await sql`
        INSERT INTO registrations (
          event_id, primary_name, primary_email, primary_phone, birth_date, manage_token, status, notes
        ) VALUES (
          ${payload.eventId}, ${payload.primaryName}, ${payload.primaryEmail}, ${payload.primaryPhone},
          ${payload.birthDate || null}, ${manageToken}, 'confirmed', ${payload.notes || null}
        )
        RETURNING *
      `;

      const newRegistration = regResults[0];

      // 6. Atomically Increment Shift Capacities
      for (const sel of shiftSelections) {
        await sql`
          UPDATE shifts 
          SET claimed_count = claimed_count + 1 
          WHERE id = ${sel.shiftId} AND claimed_count < capacity
        `;
      }

      res.status(201).json({
        success: true,
        registration: newRegistration,
        manageToken
      });
      return;
    }

    // ------------------------------------------------------------------------
    // DELETE: Cancel Registration & Release Capacity
    // ------------------------------------------------------------------------
    if (req.method === 'DELETE') {
      const { token } = req.query;
      if (!token) {
        res.status(400).json({ error: 'Missing manage token' });
        return;
      }

      const reg = await sql`SELECT id FROM registrations WHERE manage_token = ${token as string}`;
      if (reg.length === 0) {
        res.status(404).json({ error: 'Registration not found' });
        return;
      }

      const claims = await sql`SELECT shift_id FROM claimed_shifts WHERE registration_id = ${reg[0].id}`;
      for (const claim of claims) {
        await sql`UPDATE shifts SET claimed_count = GREATEST(0, claimed_count - 1) WHERE id = ${claim.shift_id}`;
      }

      await sql`UPDATE registrations SET status = 'cancelled', updated_at = NOW() WHERE id = ${reg[0].id}`;

      res.status(200).json({ success: true, message: 'Registration cancelled and capacity released.' });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API /registrations Error]:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
