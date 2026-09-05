import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, isDatabaseConfigured } from './_lib/db';
import { crmServiceInputSchema } from './_lib/validation';

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

  if (!isDatabaseConfigured()) {
    res.status(200).json({
      status: 'fallback_mode',
      message: 'CRM endpoint in fallback mode.',
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
      const { id } = req.query;

      if (id) {
        const profiles = await sql`
          SELECT p.*,
            COALESCE(json_agg(DISTINCT h.*) FILTER (WHERE h.id IS NOT NULL), '[]') as history
          FROM volunteer_crm_profiles p
          LEFT JOIN volunteer_event_history h ON h.volunteer_id = p.id
          WHERE p.id = ${id as string} ${orgId ? sql`AND p.org_id = ${orgId}` : sql``}
          GROUP BY p.id
        `;

        if (profiles.length === 0) {
          res.status(404).json({ error: 'Volunteer profile not found' });
          return;
        }

        res.status(200).json({ profile: profiles[0] });
        return;
      }

      // List all profiles for organization
      const profiles = await sql`
        SELECT p.*,
          COALESCE(json_agg(DISTINCT h.*) FILTER (WHERE h.id IS NOT NULL), '[]') as history
        FROM volunteer_crm_profiles p
        LEFT JOIN volunteer_event_history h ON h.volunteer_id = p.id
        ${orgId ? sql`WHERE p.org_id = ${orgId}` : sql``}
        GROUP BY p.id
        ORDER BY p.lifetime_hours DESC, p.last_active DESC
      `;

      res.status(200).json({ volunteers: profiles });
      return;
    }

    if (req.method === 'POST') {
      const { action, profile, serviceRecord, volunteerId } = req.body;

      if (action === 'log_service') {
        const validation = crmServiceInputSchema.safeParse(req.body);
        if (!validation.success) {
          res.status(400).json({
            error: 'Validation Error: ' + validation.error.errors.map(e => e.message).join(', '),
            details: validation.error.format()
          });
          return;
        }

        const validRecord = validation.data.serviceRecord;
        const validVolId = validation.data.volunteerId;

        // 1. Insert into history
        const newHistory = await sql`
          INSERT INTO volunteer_event_history (
            volunteer_id, event_title, event_date, roles_served, hours_contributed,
            items_donated, amount_donated, event_outcome_raised, verified_by
          ) VALUES (
            ${validVolId}, ${validRecord.eventTitle}, ${validRecord.eventDate},
            ${validRecord.rolesServed || []}, ${validRecord.hoursContributed || 0},
            ${validRecord.itemsDonated || null}, ${validRecord.amountDonated || 0},
            ${validRecord.eventOutcomeRaised || 0}, ${validRecord.verifiedBy || null}
          )
          RETURNING *
        `;

        // 2. Increment lifetime metrics on profile
        await sql`
          UPDATE volunteer_crm_profiles SET
            lifetime_hours = lifetime_hours + ${serviceRecord.hoursContributed || 0},
            lifetime_donations = lifetime_donations + ${serviceRecord.amountDonated || 0},
            events_participated = events_participated + 1,
            last_active = NOW(),
            updated_at = NOW()
          WHERE id = ${volunteerId}
        `;

        res.status(201).json({ success: true, historyRecord: newHistory[0] });
        return;
      }

      // Create new profile
      if (profile && profile.orgId && profile.name && profile.email) {
        const newProfile = await sql`
          INSERT INTO volunteer_crm_profiles (
            org_id, name, email, phone, tier, tags, internal_notes,
            lifetime_hours, lifetime_donations, events_participated, attendance_rate
          ) VALUES (
            ${profile.orgId}, ${profile.name}, ${profile.email}, ${profile.phone || null},
            ${profile.tier || 'contributor'}, ${profile.tags || []}, ${profile.internalNotes || null},
            ${profile.lifetimeHours || 0}, ${profile.lifetimeDonations || 0},
            ${profile.eventsParticipated || 0}, ${profile.attendanceRate || 100.0}
          )
          RETURNING *
        `;

        res.status(201).json({ volunteer: newProfile[0] });
        return;
      }

      res.status(400).json({ error: 'Invalid CRM payload' });
      return;
    }

    if (req.method === 'PUT') {
      const { id, updates } = req.body;
      if (!id || !updates) {
        res.status(400).json({ error: 'Missing id or updates' });
        return;
      }

      const updated = await sql`
        UPDATE volunteer_crm_profiles SET
          name = COALESCE(${updates.name}, name),
          email = COALESCE(${updates.email}, email),
          phone = COALESCE(${updates.phone}, phone),
          tier = COALESCE(${updates.tier}, tier),
          tags = COALESCE(${updates.tags}, tags),
          internal_notes = COALESCE(${updates.internalNotes}, internal_notes),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      res.status(200).json({ volunteer: updated[0] });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        res.status(400).json({ error: 'Missing id' });
        return;
      }

      await sql`DELETE FROM volunteer_crm_profiles WHERE id = ${id as string}`;
      res.status(200).json({ success: true, deletedId: id });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API /crm Error]:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
