import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, isDatabaseConfigured } from './_lib/db';
import { shiftInputSchema } from './_lib/validation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-org-id');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!isDatabaseConfigured()) {
    res.status(200).json({
      status: 'fallback_mode',
      message: 'Shifts endpoint in fallback mode.',
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
    if (req.method === 'GET') {
      const { eventId, subPartId } = req.query;

      const shifts = await sql`
        SELECT s.*, 
          GREATEST(0, s.capacity - s.claimed_count) as remaining_spots,
          ROUND((s.claimed_count::numeric / GREATEST(1, s.capacity)) * 100) as percent_filled,
          (s.claimed_count >= s.capacity) as is_full
        FROM shifts s
        WHERE 1=1
        ${eventId ? sql`AND s.event_id = ${eventId as string}` : sql``}
        ${subPartId ? sql`AND s.sub_part_id = ${subPartId as string}` : sql``}
        ORDER BY s.start_time ASC
      `;

      res.status(200).json({ shifts });
      return;
    }

    if (req.method === 'POST') {
      const validation = shiftInputSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Validation Error: ' + validation.error.errors.map(e => e.message).join(', '),
          details: validation.error.format()
        });
        return;
      }

      const payload = validation.data;
      const capacity = payload.capacity;

      // Check event variable approval threshold
      const event = await sql`SELECT approval_threshold_slots FROM events WHERE id = ${payload.eventId}`;
      const threshold = event[0]?.approval_threshold_slots || 5;
      const isAutoApproved = capacity <= threshold;

      const newShifts = await sql`
        INSERT INTO shifts (
          sub_part_id, event_id, title, description, start_time, end_time,
          capacity, claimed_count, min_age, skills_required, requires_waiver,
          waiver_template_id, is_approved, reporting_location_override
        ) VALUES (
          ${payload.subPartId}, ${payload.eventId}, ${payload.title}, ${payload.description || ''},
          ${payload.startTime}, ${payload.endTime}, ${capacity}, 0,
          ${payload.minAge || null}, ${payload.skillsRequired || []}, ${payload.requiresWaiver !== false},
          ${payload.waiverTemplateId || 'waiver_general_liability'}, ${isAutoApproved},
          ${payload.reportingLocationOverride || null}
        )
        RETURNING *
      `;

      res.status(201).json({
        shift: newShifts[0],
        autoApproved: isAutoApproved,
        threshold
      });
      return;
    }

    if (req.method === 'PUT') {
      const { id, updates } = req.body;
      if (!id || !updates) {
        res.status(400).json({ error: 'Missing shift id or updates' });
        return;
      }

      const updated = await sql`
        UPDATE shifts SET
          title = COALESCE(${updates.title}, title),
          description = COALESCE(${updates.description}, description),
          start_time = COALESCE(${updates.startTime}, start_time),
          end_time = COALESCE(${updates.endTime}, end_time),
          capacity = COALESCE(${updates.capacity}, capacity),
          requires_waiver = COALESCE(${updates.requiresWaiver}, requires_waiver),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      res.status(200).json({ shift: updated[0] });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        res.status(400).json({ error: 'Missing shift id' });
        return;
      }

      await sql`DELETE FROM shifts WHERE id = ${id as string}`;
      res.status(200).json({ success: true, deletedId: id });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API /shifts Error]:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
