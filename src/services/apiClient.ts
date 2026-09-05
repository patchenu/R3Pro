/**
 * REACH (R3Pro) Production API Client
 * Seamlessly interfaces with Vercel Serverless API Routes (/api/*)
 * Provides graceful fallback handling when running in static preview mode
 */

const API_BASE = '/api';

interface RequestOptions extends RequestInit {
  orgId?: string;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<{ data: T | null; error: string | null; isFallback: boolean }> {
  const { orgId, headers, ...rest } = options;

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> || {})
  };

  if (orgId) {
    reqHeaders['x-org-id'] = orgId;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...rest,
      headers: reqHeaders
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      return { data: null, error: errorBody.error || `HTTP ${response.status}`, isFallback: false };
    }

    const data = await response.json();
    const isFallback = data?.status === 'fallback_mode';
    return { data, error: null, isFallback };
  } catch (err: any) {
    // Graceful offline / static preview fallback
    console.debug(`[API Client] Endpoint ${endpoint} unreachable, operating in optimistic local mode:`, err.message);
    return { data: null, error: err.message, isFallback: true };
  }
}

export const apiClient = {
  // --------------------------------------------------------------------------
  // Events & Campaigns
  // --------------------------------------------------------------------------
  events: {
    list: (orgId: string) => request<{ events: any[] }>(`/events?orgId=${encodeURIComponent(orgId)}`, { orgId }),
    get: (id: string, orgId?: string) => request<{ event: any }>(`/events?id=${encodeURIComponent(id)}`, { orgId }),
    getBySlug: (slug: string, orgId?: string) => request<{ event: any }>(`/events?slug=${encodeURIComponent(slug)}`, { orgId }),
    create: (payload: any, orgId: string) => request<{ event: any }>('/events', { method: 'POST', body: JSON.stringify(payload), orgId }),
    update: (id: string, updates: any, orgId: string) => request<{ event: any }>('/events', { method: 'PUT', body: JSON.stringify({ id, updates }), orgId }),
    delete: (id: string, orgId: string) => request<{ success: boolean }>(`/events?id=${encodeURIComponent(id)}`, { method: 'DELETE', orgId })
  },

  // --------------------------------------------------------------------------
  // Registrations & Self-Service Passes
  // --------------------------------------------------------------------------
  registrations: {
    submit: (payload: any) => request<{ success: boolean; registration: any; manageToken: string }>('/registrations', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    getPass: (token: string) => request<{ registration: any }>(`/registrations?token=${encodeURIComponent(token)}`),
    cancel: (token: string) => request<{ success: boolean }>(`/registrations?token=${encodeURIComponent(token)}`, {
      method: 'DELETE'
    })
  },

  // --------------------------------------------------------------------------
  // Shifts & Multi-Volunteer Capacities
  // --------------------------------------------------------------------------
  shifts: {
    list: (eventId: string) => request<{ shifts: any[] }>(`/shifts?eventId=${encodeURIComponent(eventId)}`),
    create: (payload: any) => request<{ shift: any; autoApproved: boolean; threshold: number }>('/shifts', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
    update: (id: string, updates: any) => request<{ shift: any }>('/shifts', {
      method: 'PUT',
      body: JSON.stringify({ id, updates })
    }),
    delete: (id: string) => request<{ success: boolean }>(`/shifts?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
  },

  // --------------------------------------------------------------------------
  // Volunteer CRM & Historical Service Logging
  // --------------------------------------------------------------------------
  crm: {
    list: (orgId: string) => request<{ volunteers: any[] }>(`/crm?orgId=${encodeURIComponent(orgId)}`, { orgId }),
    get: (id: string, orgId: string) => request<{ profile: any }>(`/crm?id=${encodeURIComponent(id)}`, { orgId }),
    createProfile: (profile: any, orgId: string) => request<{ volunteer: any }>('/crm', {
      method: 'POST',
      body: JSON.stringify({ profile }),
      orgId
    }),
    logService: (volunteerId: string, serviceRecord: any, orgId: string) => request<{ success: boolean; historyRecord: any }>('/crm', {
      method: 'POST',
      body: JSON.stringify({ action: 'log_service', volunteerId, serviceRecord }),
      orgId
    }),
    updateProfile: (id: string, updates: any, orgId: string) => request<{ volunteer: any }>('/crm', {
      method: 'PUT',
      body: JSON.stringify({ id, updates }),
      orgId
    }),
    deleteProfile: (id: string, orgId: string) => request<{ success: boolean }>(`/crm?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      orgId
    })
  },

  // --------------------------------------------------------------------------
  // Door Kiosk Station
  // --------------------------------------------------------------------------
  kiosk: {
    search: (eventId: string, query: string) => request<{ matches: any[] }>(`/kiosk?eventId=${encodeURIComponent(eventId)}&query=${encodeURIComponent(query)}`),
    toggleCheckIn: (registrationId: string, shiftId: string, memberId: string, checkedInBy?: string) => request<{ success: boolean; checkedIn: boolean; checkedInAt?: string }>('/kiosk', {
      method: 'POST',
      body: JSON.stringify({ registrationId, shiftId, memberId, checkedInBy })
    })
  },

  // --------------------------------------------------------------------------
  // Variable Approval Queue
  // --------------------------------------------------------------------------
  approvals: {
    list: (eventId: string) => request<{ approvalRequests: any[] }>(`/approvals?eventId=${encodeURIComponent(eventId)}`),
    resolve: (requestId: string, action: 'approve' | 'reject', resolvedByName?: string) => request<{ success: boolean; approvalRequest: any }>('/approvals', {
      method: 'POST',
      body: JSON.stringify({ requestId, action, resolvedByName })
    })
  }
};
