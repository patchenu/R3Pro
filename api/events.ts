import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, isDatabaseConfigured } from './_lib/db';
import { eventInputSchema } from './_lib/validation';

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

  const orgId = (req.headers['x-org-id'] as string) || (req.query.orgId as string);

  // If live Vercel Postgres is not configured yet, return 200 with standard fallback response
  if (!isDatabaseConfigured()) {
    res.status(200).json({
      status: 'fallback_mode',
      message: 'Vercel Postgres (Neon) is operating in client-state fallback mode.',
      method: req.method,
      orgId
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
      const { id, slug } = req.query;

      if (id) {
        const events = await sql`SELECT * FROM events WHERE id = ${id as string} ${orgId ? sql`AND org_id = ${orgId}` : sql``}`;
        if (events.length === 0) {
          res.status(404).json({ error: 'Event not found' });
          return;
        }
        res.status(200).json({ event: events[0] });
        return;
      }

      if (slug) {
        const events = await sql`SELECT * FROM events WHERE slug = ${slug as string} ${orgId ? sql`AND org_id = ${orgId}` : sql``}`;
        if (events.length === 0) {
          res.status(404).json({ error: 'Event not found' });
          return;
        }
        res.status(200).json({ event: events[0] });
        return;
      }

      // List all events for organization
      const events = await sql`
        SELECT e.*, 
          COALESCE(json_agg(DISTINCT sp.*) FILTER (WHERE sp.id IS NOT NULL), '[]') as subparts
        FROM events e
        LEFT JOIN sub_parts sp ON sp.event_id = e.id
        ${orgId ? sql`WHERE e.org_id = ${orgId}` : sql``}
        GROUP BY e.id
        ORDER BY e.start_date DESC
      `;
      res.status(200).json({ events });
      return;
    }

    if (req.method === 'POST') {
      const validation = eventInputSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Validation Error: ' + validation.error.errors.map(e => e.message).join(', '),
          details: validation.error.format()
        });
        return;
      }

      const payload = validation.data;

      const newEvents = await sql`
        INSERT INTO events (
          org_id, event_key, title, slug, tagline, description, tags,
          start_date, end_date, venue_name, venue_address, map_url,
          is_virtual, cover_image_url, theme, fundraising_goal, total_raised,
          currency, status, approval_threshold_budget, approval_threshold_slots,
          reminder_cadence, allow_fee_coverage, dress_code
        ) VALUES (
          ${payload.orgId}, ${payload.eventKey || `EVT-${Date.now()}`}, ${payload.title},
          ${payload.slug || payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')},
          ${payload.tagline || ''}, ${payload.description || ''}, ${payload.tags || []},
          ${payload.startDate}, ${payload.endDate}, ${payload.venueName || ''},
          ${payload.venueAddress || ''}, ${payload.mapUrl || ''}, ${Boolean(payload.isVirtual)},
          ${payload.coverImageUrl || ''}, ${JSON.stringify(payload.theme || {})},
          ${payload.fundraisingGoal || 5000}, 0, ${payload.currency || 'USD'},
          ${payload.status || 'published'}, ${payload.approvalThresholdBudget || 250},
          ${payload.approvalThresholdSlots || 5}, ${payload.reminderCadence || 'standard'},
          ${payload.allowFeeCoverage !== false}, ${payload.dressCode || ''}
        )
        RETURNING *
      `;

      res.status(201).json({ event: newEvents[0] });
      return;
    }

    if (req.method === 'PUT') {
      const { id, updates } = req.body;
      if (!id || !updates) {
        res.status(400).json({ error: 'Missing event id or updates' });
        return;
      }

      const updated = await sql`
        UPDATE events SET
          title = COALESCE(${updates.title}, title),
          tagline = COALESCE(${updates.tagline}, tagline),
          description = COALESCE(${updates.description}, description),
          start_date = COALESCE(${updates.startDate}, start_date),
          end_date = COALESCE(${updates.endDate}, end_date),
          venue_name = COALESCE(${updates.venueName}, venue_name),
          venue_address = COALESCE(${updates.venueAddress}, venue_address),
          fundraising_goal = COALESCE(${updates.fundraisingGoal}, fundraising_goal),
          status = COALESCE(${updates.status}, status),
          updated_at = NOW()
        WHERE id = ${id} ${orgId ? sql`AND org_id = ${orgId}` : sql``}
        RETURNING *
      `;

      res.status(200).json({ event: updated[0] });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        res.status(400).json({ error: 'Missing event id' });
        return;
      }

      await sql`DELETE FROM events WHERE id = ${id as string} ${orgId ? sql`AND org_id = ${orgId}` : sql``}`;
      res.status(200).json({ success: true, deletedId: id });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API /events Error]:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
