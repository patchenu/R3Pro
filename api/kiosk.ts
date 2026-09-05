import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, isDatabaseConfigured } from './_lib/db';
import { kioskCheckInInputSchema } from './_lib/validation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-org-id');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!isDatabaseConfigured()) {
    res.status(200).json({
      status: 'fallback_mode',
      message: 'Kiosk endpoint in fallback mode.',
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
    // GET: Search Volunteer by Phone or Name for Express Check-In
    // ------------------------------------------------------------------------
    if (req.method === 'GET') {
      const { eventId, query } = req.query;

      if (!eventId || !query) {
        res.status(400).json({ error: 'Missing eventId or query parameter' });
        return;
      }

      const q = `%${(query as string).trim()}%`;
      const matches = await sql`
        SELECT r.id, r.primary_name, r.primary_phone, r.primary_email,
          gm.id as member_id, gm.name as member_name, gm.is_minor,
          s.id as shift_id, s.title as shift_title, s.start_time, s.end_time,
          sp.name as department_name, sp.reporting_gate,
          cs.id as claim_id, cs.checked_in, cs.checked_in_at
        FROM registrations r
        JOIN group_members gm ON gm.registration_id = r.id
        JOIN claimed_shifts cs ON cs.group_member_id = gm.id
        JOIN shifts s ON cs.shift_id = s.id
        JOIN sub_parts sp ON s.sub_part_id = sp.id
        WHERE r.event_id = ${eventId as string}
          AND r.status = 'confirmed'
          AND (r.primary_phone ILIKE ${q} OR gm.name ILIKE ${q} OR r.primary_name ILIKE ${q})
      `;

      res.status(200).json({ matches });
      return;
    }

    // ------------------------------------------------------------------------
    // POST: 1-Tap Kiosk Door Check-In
    // ------------------------------------------------------------------------
    if (req.method === 'POST') {
      const validation = kioskCheckInInputSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Validation Error: ' + validation.error.errors.map(e => e.message).join(', '),
          details: validation.error.format()
        });
        return;
      }

      const { registrationId, shiftId, memberId, checkedInBy } = validation.data;

      const updated = await sql`
        UPDATE claimed_shifts SET
          checked_in = NOT checked_in,
          checked_in_at = CASE WHEN NOT checked_in THEN NOW() ELSE NULL END,
          checked_in_by = CASE WHEN NOT checked_in THEN ${checkedInBy || 'Door Kiosk Station'} ELSE NULL END
        WHERE registration_id = ${registrationId}
          AND shift_id = ${shiftId}
          AND group_member_id = ${memberId}
        RETURNING *
      `;

      if (updated.length === 0) {
        res.status(404).json({ error: 'Claimed shift record not found' });
        return;
      }

      res.status(200).json({
        success: true,
        checkedIn: updated[0].checked_in,
        checkedInAt: updated[0].checked_in_at
      });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API /kiosk Error]:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
