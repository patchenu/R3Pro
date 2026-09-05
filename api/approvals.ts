import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, isDatabaseConfigured } from './_lib/db';

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
      message: 'Approvals endpoint in fallback mode.',
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
      const { eventId } = req.query;

      const requests = await sql`
        SELECT ar.*, sp.name as department_name
        FROM approval_requests ar
        LEFT JOIN sub_parts sp ON ar.sub_part_id = sp.id
        WHERE 1=1
        ${eventId ? sql`AND ar.event_id = ${eventId as string}` : sql``}
        ORDER BY ar.created_at DESC
      `;

      res.status(200).json({ approvalRequests: requests });
      return;
    }

    if (req.method === 'POST') {
      const { requestId, action, resolvedByName } = req.body;

      if (!requestId || !action || !['approve', 'reject'].includes(action)) {
        res.status(400).json({ error: 'Invalid approval payload' });
        return;
      }

      const status = action === 'approve' ? 'approved' : 'rejected';

      const updated = await sql`
        UPDATE approval_requests SET
          status = ${status},
          resolved_at = NOW(),
          resolved_by_name = ${resolvedByName || 'Event Planner'}
        WHERE id = ${requestId}
        RETURNING *
      `;

      if (updated.length === 0) {
        res.status(404).json({ error: 'Request not found' });
        return;
      }

      const reqRecord = updated[0];

      // If approved, apply mutations
      if (status === 'approved') {
        if (reqRecord.type === 'budget_increase' && reqRecord.sub_part_id && reqRecord.details?.amount) {
          await sql`
            UPDATE sub_parts 
            SET budget_allocated = budget_allocated + ${reqRecord.details.amount}
            WHERE id = ${reqRecord.sub_part_id}
          `;
        } else if (reqRecord.type === 'shift_capacity' && reqRecord.details?.shiftId) {
          await sql`
            UPDATE shifts 
            SET is_approved = true,
                capacity = COALESCE(${reqRecord.details.newCapacity}, capacity)
            WHERE id = ${reqRecord.details.shiftId}
          `;
        }
      }

      res.status(200).json({ success: true, approvalRequest: reqRecord });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API /approvals Error]:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
