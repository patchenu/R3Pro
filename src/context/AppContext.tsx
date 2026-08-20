import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Organization, User, Event, SubPart, Shift, ItemSlot, TicketTier, 
  Registration, Donation, VendorApplication, ApprovalRequest, 
  VolunteerCrmRecord, Announcement, AuditLog, UserRole 
} from '../types';
import { 
  SEED_ORGANIZATIONS, SEED_USERS, SEED_EVENTS, SEED_SUBPARTS, 
  SEED_SHIFTS, SEED_ITEM_SLOTS, SEED_TICKET_TIERS, SEED_REGISTRATIONS, 
  SEED_DONATIONS, SEED_VENDOR_APPLICATIONS, SEED_APPROVAL_REQUESTS, 
  SEED_VOLUNTEER_CRM, SEED_ANNOUNCEMENTS, SEED_AUDIT_LOGS 
} from '../data/seedData';
import { generateManageToken, generateReceiptNumber } from '../utils/formatters';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
}

interface AppContextType {
  // Active state
  currentOrg: Organization;
  currentUser: User;
  currentEvent: Event;
  activeRole: UserRole;
  
  // Data collections
  organizations: Organization[];
  users: User[];
  events: Event[];
  subParts: SubPart[];
  shifts: Shift[];
  itemSlots: ItemSlot[];
  ticketTiers: TicketTier[];
  registrations: Registration[];
  donations: Donation[];
  vendorApplications: VendorApplication[];
  approvalRequests: ApprovalRequest[];
  volunteerCrm: VolunteerCrmRecord[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  toasts: ToastNotification[];

  // Switchers
  switchRole: (role: UserRole) => void;
  switchOrganization: (orgId: string) => void;
  switchEvent: (eventId: string) => void;

  // Actions
  createEvent: (newEvent: Partial<Event>, templatePresetId?: string) => Event;
  claimSlotsAndRegister: (payload: {
    primaryName: string;
    primaryEmail: string;
    primaryPhone: string;
    notes?: string;
    members: { name: string; email?: string; phone?: string; relationship: any; isMinor: boolean; age?: number; emergencyContactName?: string; emergencyContactPhone?: string; dietaryNotes?: string; }[];
    shiftSelections: { shiftId: string; groupMemberIndex: number }[];
    itemSelections: { itemSlotId: string; quantity: number }[];
    ticketSelections: { ticketTierId: string; quantity: number }[];
    donationAmount: number;
    feeCovered: boolean;
    isAnonymous: boolean;
    paymentMethod?: any;
    waiverSignatures: { memberIndex: number; waiverTemplateId: string; waiverTitle: string; waiverText: string; signerName: string; signerRelationship: string; signatureData: string }[];
  }) => { success: boolean; registration?: Registration; error?: string };

  cancelRegistration: (manageToken: string) => boolean;
  toggleCheckIn: (registrationId: string, shiftId: string, memberId: string) => void;
  
  // Committee Lead & Threshold Actions
  addShift: (shiftData: Omit<Shift, 'id' | 'claimedCount' | 'isApproved'>) => { autoApproved: boolean; shiftId: string };
  addItemSlot: (itemData: Omit<ItemSlot, 'id' | 'quantityPledged'>) => ItemSlot;
  requestBudgetIncrease: (subPartId: string, amount: number, reason: string) => void;
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;

  // Vendor actions
  submitVendorApplication: (app: Omit<VendorApplication, 'id' | 'status' | 'submittedAt'>) => void;
  approveVendor: (appId: string, assignedBooth: string) => void;
  rejectVendor: (appId: string) => void;

  // Communications & Donations
  postAnnouncement: (ann: Omit<Announcement, 'id' | 'sentAt'>) => void;
  recordDirectDonation: (donation: Omit<Donation, 'id' | 'createdAt' | 'taxReceiptNumber'>) => Donation;
  
  // Utilities
  dismissToast: (id: string) => void;
  showToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'gather_raise_v1_data';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load stored state or seed
  const loadInitialData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse localStorage data', e);
      }
    }
    return {
      organizations: SEED_ORGANIZATIONS,
      users: SEED_USERS,
      events: SEED_EVENTS,
      subParts: SEED_SUBPARTS,
      shifts: SEED_SHIFTS,
      itemSlots: SEED_ITEM_SLOTS,
      ticketTiers: SEED_TICKET_TIERS,
      registrations: SEED_REGISTRATIONS,
      donations: SEED_DONATIONS,
      vendorApplications: SEED_VENDOR_APPLICATIONS,
      approvalRequests: SEED_APPROVAL_REQUESTS,
      volunteerCrm: SEED_VOLUNTEER_CRM,
      announcements: SEED_ANNOUNCEMENTS,
      auditLogs: SEED_AUDIT_LOGS,
      currentOrgId: 'org_lincoln_pta',
      currentUserId: 'user_elena',
      currentEventId: 'evt_fall_carnival_2026',
    };
  };

  const [data, setData] = useState(loadInitialData);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Persist on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const showToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = 'toast_' + Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message, timestamp: Date.now() }]);
    setTimeout(() => {
      dismissToast(id);
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Resolved active entities
  const currentOrg = data.organizations.find((o: Organization) => o.id === data.currentOrgId) || data.organizations[0];
  const currentUser = data.users.find((u: User) => u.id === data.currentUserId) || data.users[0];
  const currentEvent = data.events.find((e: Event) => e.id === data.currentEventId) || data.events[0];
  const activeRole = currentUser.role;

  const switchRole = (role: UserRole) => {
    let matchedUser = data.users.find((u: User) => u.role === role && u.orgId === currentOrg.id);
    if (!matchedUser) {
      matchedUser = data.users.find((u: User) => u.role === role) || data.users[0];
    }
    setData((prev: any) => ({ ...prev, currentUserId: matchedUser?.id || prev.currentUserId }));
    showToast('info', `Switched Role: ${role.toUpperCase()}`, `Now acting as ${matchedUser?.name} (${role})`);
  };

  const switchOrganization = (orgId: string) => {
    const org = data.organizations.find((o: Organization) => o.id === orgId);
    if (!org) return;
    const orgEvents = data.events.filter((e: Event) => e.orgId === orgId);
    const orgUsers = data.users.filter((u: User) => u.orgId === orgId);

    setData((prev: any) => ({
      ...prev,
      currentOrgId: orgId,
      currentEventId: orgEvents[0]?.id || prev.currentEventId,
      currentUserId: orgUsers[0]?.id || prev.currentUserId
    }));
    showToast('info', 'Organization Switched', `Active Organization: ${org.name}`);
  };

  const switchEvent = (eventId: string) => {
    const evt = data.events.find((e: Event) => e.id === eventId);
    if (!evt) return;
    setData((prev: any) => ({ ...prev, currentEventId: eventId }));
  };

  const createEvent = (newEventData: Partial<Event>, templatePresetId?: string): Event => {
    const id = 'evt_' + Date.now();
    const slug = (newEventData.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const event: Event = {
      id,
      orgId: currentOrg.id,
      title: newEventData.title || 'New Event',
      slug,
      tagline: newEventData.tagline || 'Community Event & Fundraiser',
      description: newEventData.description || 'Welcome to our event.',
      startDate: newEventData.startDate || new Date(Date.now() + 86400000 * 14).toISOString(),
      endDate: newEventData.endDate || new Date(Date.now() + 86400000 * 14 + 18000000).toISOString(),
      venueName: newEventData.venueName || 'Main Community Center',
      venueAddress: newEventData.venueAddress || '100 Main St',
      isVirtual: false,
      coverImageUrl: newEventData.coverImageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      theme: newEventData.theme || {
        id: 'indigo_modern',
        name: 'Indigo Modern',
        primaryColor: '#4f46e5',
        accentColor: '#6366f1',
        bgGradient: 'from-indigo-600 to-purple-800'
      },
      fundraisingGoal: newEventData.fundraisingGoal || 5000,
      totalRaised: 0,
      currency: 'USD',
      status: 'published',
      approvalThresholdBudget: currentOrg.settings.approvalThresholdBudget,
      approvalThresholdSlots: currentOrg.settings.approvalThresholdSlots,
      reminderCadence: currentOrg.settings.defaultReminderCadence,
      allowFeeCoverage: true,
      subPartIds: []
    };

    setData((prev: any) => ({
      ...prev,
      events: [event, ...prev.events],
      currentEventId: event.id
    }));

    showToast('success', 'Event Created Successfully', `${event.title} is now published and active.`);
    return event;
  };

  const claimSlotsAndRegister = (payload: {
    primaryName: string;
    primaryEmail: string;
    primaryPhone: string;
    notes?: string;
    members: { name: string; email?: string; phone?: string; relationship: any; isMinor: boolean; age?: number; emergencyContactName?: string; emergencyContactPhone?: string; dietaryNotes?: string; }[];
    shiftSelections: { shiftId: string; groupMemberIndex: number }[];
    itemSelections: { itemSlotId: string; quantity: number }[];
    ticketSelections: { ticketTierId: string; quantity: number }[];
    donationAmount: number;
    feeCovered: boolean;
    isAnonymous: boolean;
    paymentMethod?: any;
    waiverSignatures: { memberIndex: number; waiverTemplateId: string; waiverTitle: string; waiverText: string; signerName: string; signerRelationship: string; signatureData: string }[];
  }) => {
    // 1. Check for shift capacity
    for (const sel of payload.shiftSelections) {
      const shift = data.shifts.find((s: Shift) => s.id === sel.shiftId);
      if (shift && shift.claimedCount >= shift.capacity) {
        showToast('error', 'Slot Already Filled', `The shift "${shift.title}" was just filled by another participant.`);
        return { success: false, error: `Shift "${shift.title}" is full.` };
      }
    }

    const regId = 'reg_' + Date.now();
    const manageToken = generateManageToken();
    const timestamp = new Date().toISOString();

    // Map members
    const createdMembers = payload.members.map((m, idx) => ({
      id: `member_${regId}_${idx}`,
      registrationId: regId,
      name: m.name,
      email: m.email || payload.primaryEmail,
      phone: m.phone || payload.primaryPhone,
      relationship: m.relationship,
      isMinor: m.isMinor,
      age: m.age,
      emergencyContactName: m.emergencyContactName || (m.isMinor ? payload.primaryName : undefined),
      emergencyContactPhone: m.emergencyContactPhone || (m.isMinor ? payload.primaryPhone : undefined),
      dietaryNotes: m.dietaryNotes
    }));

    // Map signed waivers
    const signedWaivers = payload.waiverSignatures.map((ws, idx) => ({
      id: `waiver_signed_${regId}_${idx}`,
      registrationId: regId,
      groupMemberId: createdMembers[ws.memberIndex]?.id || createdMembers[0].id,
      waiverTemplateId: ws.waiverTemplateId,
      waiverTitle: ws.waiverTitle,
      waiverText: ws.waiverText,
      signerName: ws.signerName,
      signerRelationship: ws.signerRelationship,
      signatureData: ws.signatureData,
      signedAt: timestamp,
      ipAddress: '127.0.0.1 (Verified)',
      isVerifiedAtDoor: true
    }));

    // Shift claims
    const shiftClaims = payload.shiftSelections.map(sel => ({
      shiftId: sel.shiftId,
      groupMemberId: createdMembers[sel.groupMemberIndex]?.id || createdMembers[0].id,
      checkedIn: false
    }));

    // Item pledges
    const itemPledges = payload.itemSelections.map(sel => ({
      itemSlotId: sel.itemSlotId,
      quantity: sel.quantity,
      delivered: false
    }));

    // Ticket purchases
    const ticketPurchases = payload.ticketSelections.map(sel => ({
      ticketTierId: sel.ticketTierId,
      quantity: sel.quantity
    }));

    // Donations
    const donationsList = payload.donationAmount > 0 ? [{
      amount: payload.donationAmount,
      feeCovered: payload.feeCovered,
      totalPaid: payload.feeCovered ? payload.donationAmount * 1.029 + 0.30 : payload.donationAmount,
      isAnonymous: payload.isAnonymous,
      taxReceiptNumber: generateReceiptNumber()
    }] : [];

    const newRegistration: Registration = {
      id: regId,
      eventId: currentEvent.id,
      primaryName: payload.primaryName,
      primaryEmail: payload.primaryEmail,
      primaryPhone: payload.primaryPhone,
      manageToken,
      createdAt: timestamp,
      status: 'confirmed',
      notes: payload.notes,
      members: createdMembers,
      shiftClaims,
      itemPledges,
      ticketPurchases,
      donations: donationsList,
      waivers: signedWaivers
    };

    // Calculate total funds added (tickets + donation)
    let totalFundsAdded = 0;
    payload.ticketSelections.forEach(ts => {
      const tier = data.ticketTiers.find((t: TicketTier) => t.id === ts.ticketTierId);
      if (tier) totalFundsAdded += tier.price * ts.quantity;
    });
    totalFundsAdded += payload.donationAmount;

    // Create donation record if amount > 0
    const newDonationRecord: Donation | null = payload.donationAmount > 0 ? {
      id: 'don_' + Date.now(),
      eventId: currentEvent.id,
      donorName: payload.primaryName,
      donorEmail: payload.primaryEmail,
      amount: payload.donationAmount,
      feeAmount: payload.feeCovered ? 0 : payload.donationAmount * 0.029 + 0.30,
      netAmount: payload.donationAmount,
      feeCoveredByDonor: payload.feeCovered,
      paymentMethod: payload.paymentMethod || 'stripe_card',
      paymentStatus: 'completed',
      isAnonymous: payload.isAnonymous,
      taxReceiptNumber: donationsList[0].taxReceiptNumber,
      deductibleAmount: payload.donationAmount,
      createdAt: timestamp
    } : null;

    // Update state atomically
    setData((prev: any) => {
      // 1. Increment shift claimed count
      const updatedShifts = prev.shifts.map((s: Shift) => {
        const matchingClaims = payload.shiftSelections.filter(sc => sc.shiftId === s.id).length;
        if (matchingClaims > 0) {
          return { ...s, claimedCount: s.claimedCount + matchingClaims };
        }
        return s;
      });

      // 2. Increment item claimed count
      const updatedItems = prev.itemSlots.map((i: ItemSlot) => {
        const match = payload.itemSelections.find(is => is.itemSlotId === i.id);
        if (match) {
          return { ...i, quantityPledged: i.quantityPledged + match.quantity };
        }
        return i;
      });

      // 3. Increment ticket tier claimed count
      const updatedTickets = prev.ticketTiers.map((t: TicketTier) => {
        const match = payload.ticketSelections.find(ts => ts.ticketTierId === t.id);
        if (match) {
          return { ...t, claimedCount: t.claimedCount + match.quantity };
        }
        return t;
      });

      // 4. Update Event total raised
      const updatedEvents = prev.events.map((e: Event) => {
        if (e.id === currentEvent.id) {
          return { ...e, totalRaised: e.totalRaised + totalFundsAdded };
        }
        return e;
      });

      // 5. Update volunteer CRM record
      const existingCrm = prev.volunteerCrm.find((c: VolunteerCrmRecord) => c.email.toLowerCase() === payload.primaryEmail.toLowerCase());
      let updatedCrm = [...prev.volunteerCrm];
      if (existingCrm) {
        updatedCrm = updatedCrm.map(c => c.id === existingCrm.id ? {
          ...c,
          eventsParticipated: c.eventsParticipated + 1,
          lifetimeHours: c.lifetimeHours + (payload.shiftSelections.length * 2.5),
          lifetimeDonations: c.lifetimeDonations + payload.donationAmount,
          lastActive: timestamp.slice(0, 10)
        } : c);
      } else {
        updatedCrm.push({
          id: 'crm_' + Date.now(),
          orgId: currentOrg.id,
          name: payload.primaryName,
          email: payload.primaryEmail,
          phone: payload.primaryPhone,
          lifetimeHours: payload.shiftSelections.length * 2.5,
          lifetimeDonations: payload.donationAmount,
          eventsParticipated: 1,
          attendanceRate: 100,
          skills: [],
          tags: payload.donationAmount >= 100 ? ['Donor', 'New Volunteer'] : ['New Volunteer'],
          lastActive: timestamp.slice(0, 10)
        });
      }

      return {
        ...prev,
        shifts: updatedShifts,
        itemSlots: updatedItems,
        ticketTiers: updatedTickets,
        events: updatedEvents,
        registrations: [newRegistration, ...prev.registrations],
        donations: newDonationRecord ? [newDonationRecord, ...prev.donations] : prev.donations,
        volunteerCrm: updatedCrm
      };
    });

    showToast('success', 'Registration Confirmed!', `Thank you ${payload.primaryName}. Your confirmation pass is ready.`);
    return { success: true, registration: newRegistration };
  };

  const cancelRegistration = (manageToken: string): boolean => {
    const reg = data.registrations.find((r: Registration) => r.manageToken === manageToken);
    if (!reg) return false;

    setData((prev: any) => {
      // Revert shift counts
      const updatedShifts = prev.shifts.map((s: Shift) => {
        const claims = reg.shiftClaims.filter((c: any) => c.shiftId === s.id).length;
        if (claims > 0) {
          return { ...s, claimedCount: Math.max(0, s.claimedCount - claims) };
        }
        return s;
      });

      // Revert item counts
      const updatedItems = prev.itemSlots.map((i: ItemSlot) => {
        const pledge = reg.itemPledges.find((p: any) => p.itemSlotId === i.id);
        if (pledge) {
          return { ...i, quantityPledged: Math.max(0, i.quantityPledged - pledge.quantity) };
        }
        return i;
      });

      return {
        ...prev,
        shifts: updatedShifts,
        itemSlots: updatedItems,
        registrations: prev.registrations.map((r: Registration) => r.id === reg.id ? { ...r, status: 'cancelled' } : r)
      };
    });

    showToast('info', 'Registration Cancelled', 'Your shift and item claims have been released to other volunteers.');
    return true;
  };

  const toggleCheckIn = (registrationId: string, shiftId: string, memberId: string) => {
    setData((prev: any) => {
      const updatedRegistrations = prev.registrations.map((r: Registration) => {
        if (r.id === registrationId) {
          const updatedClaims = r.shiftClaims.map(sc => {
            if (sc.shiftId === shiftId && sc.groupMemberId === memberId) {
              const newStatus = !sc.checkedIn;
              return {
                ...sc,
                checkedIn: newStatus,
                checkedInAt: newStatus ? new Date().toISOString() : undefined,
                checkedInBy: newStatus ? currentUser.name : undefined
              };
            }
            return sc;
          });
          return { ...r, shiftClaims: updatedClaims };
        }
        return r;
      });
      return { ...prev, registrations: updatedRegistrations };
    });
  };

  const addShift = (shiftData: Omit<Shift, 'id' | 'claimedCount' | 'isApproved'>) => {
    const id = 'shift_' + Date.now();
    const exceedsThreshold = shiftData.capacity > currentEvent.approvalThresholdSlots;
    const isApproved = !exceedsThreshold;

    const newShift: Shift = {
      ...shiftData,
      id,
      claimedCount: 0,
      isApproved
    };

    if (exceedsThreshold) {
      const approvalReq: ApprovalRequest = {
        id: 'req_' + Date.now(),
        eventId: currentEvent.id,
        subPartId: shiftData.subPartId,
        subPartName: data.subParts.find((sp: SubPart) => sp.id === shiftData.subPartId)?.name || 'Department',
        requestedByUserId: currentUser.id,
        requestedByName: currentUser.name,
        type: 'shift_addition',
        title: `Add ${shiftData.capacity} Volunteer Spots: "${shiftData.title}"`,
        description: shiftData.description,
        amountOrCount: shiftData.capacity,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        payload: newShift
      };

      setData((prev: any) => ({
        ...prev,
        approvalRequests: [approvalReq, ...prev.approvalRequests]
      }));

      showToast('warning', 'Approval Required', `Adding ${shiftData.capacity} slots exceeds the ${currentEvent.approvalThresholdSlots}-slot limit and has been sent to the Event Planner.`);
      return { autoApproved: false, shiftId: id };
    }

    setData((prev: any) => ({
      ...prev,
      shifts: [newShift, ...prev.shifts]
    }));

    showToast('success', 'Shift Added', `"${shiftData.title}" is now published.`);
    return { autoApproved: true, shiftId: id };
  };

  const addItemSlot = (itemData: Omit<ItemSlot, 'id' | 'quantityPledged'>): ItemSlot => {
    const newItem: ItemSlot = {
      ...itemData,
      id: 'item_' + Date.now(),
      quantityPledged: 0
    };

    setData((prev: any) => ({
      ...prev,
      itemSlots: [newItem, ...prev.itemSlots]
    }));

    showToast('success', 'Item Wishlist Added', `"${itemData.itemName}" (${itemData.quantityNeeded} needed) added.`);
    return newItem;
  };

  const requestBudgetIncrease = (subPartId: string, amount: number, reason: string) => {
    const subPart = data.subParts.find((sp: SubPart) => sp.id === subPartId);
    const approvalReq: ApprovalRequest = {
      id: 'req_' + Date.now(),
      eventId: currentEvent.id,
      subPartId,
      subPartName: subPart?.name || 'Department',
      requestedByUserId: currentUser.id,
      requestedByName: currentUser.name,
      type: 'budget_increase',
      title: `Budget Increase Request: +$${amount}`,
      description: reason,
      amountOrCount: amount,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    setData((prev: any) => ({
      ...prev,
      approvalRequests: [approvalReq, ...prev.approvalRequests]
    }));

    showToast('info', 'Budget Request Submitted', `Request for +$${amount} sent to Event Planner.`);
  };

  const approveRequest = (requestId: string) => {
    const req = data.approvalRequests.find((r: ApprovalRequest) => r.id === requestId);
    if (!req) return;

    setData((prev: any) => {
      let updatedSubParts = prev.subParts;
      let updatedShifts = prev.shifts;

      if (req.type === 'budget_increase') {
        updatedSubParts = prev.subParts.map((sp: SubPart) => {
          if (sp.id === req.subPartId) {
            return { ...sp, budgetAllocated: sp.budgetAllocated + req.amountOrCount };
          }
          return sp;
        });
      } else if (req.type === 'shift_addition' && req.payload) {
        updatedShifts = [{ ...req.payload, isApproved: true }, ...prev.shifts];
      }

      return {
        ...prev,
        subParts: updatedSubParts,
        shifts: updatedShifts,
        approvalRequests: prev.approvalRequests.map((r: ApprovalRequest) => 
          r.id === requestId ? { ...r, status: 'approved', reviewedAt: new Date().toISOString(), reviewedBy: currentUser.name } : r
        )
      };
    });

    showToast('success', 'Request Approved', `Approved request from ${req.requestedByName}`);
  };

  const rejectRequest = (requestId: string) => {
    setData((prev: any) => ({
      ...prev,
      approvalRequests: prev.approvalRequests.map((r: ApprovalRequest) => 
        r.id === requestId ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: currentUser.name } : r
      )
    }));
    showToast('info', 'Request Declined', 'The request was rejected.');
  };

  const submitVendorApplication = (app: Omit<VendorApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApp: VendorApplication = {
      ...app,
      id: 'vapp_' + Date.now(),
      status: 'pending_review',
      submittedAt: new Date().toISOString()
    };

    setData((prev: any) => ({
      ...prev,
      vendorApplications: [newApp, ...prev.vendorApplications]
    }));

    showToast('success', 'Vendor Application Submitted', `Application for ${app.businessName} has been received for review.`);
  };

  const approveVendor = (appId: string, assignedBooth: string) => {
    setData((prev: any) => ({
      ...prev,
      vendorApplications: prev.vendorApplications.map((v: VendorApplication) => 
        v.id === appId ? { ...v, status: 'approved', assignedBoothNumber: assignedBooth, invoiceNumber: 'INV-' + Date.now().toString().slice(-4) } : v
      )
    }));
    showToast('success', 'Vendor Approved', `Assigned ${assignedBooth}. Invoice issued.`);
  };

  const rejectVendor = (appId: string) => {
    setData((prev: any) => ({
      ...prev,
      vendorApplications: prev.vendorApplications.map((v: VendorApplication) => 
        v.id === appId ? { ...v, status: 'rejected' } : v
      )
    }));
    showToast('info', 'Vendor Application Declined', 'Vendor was notified.');
  };

  const postAnnouncement = (ann: Omit<Announcement, 'id' | 'sentAt'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: 'ann_' + Date.now(),
      sentAt: new Date().toISOString()
    };

    setData((prev: any) => ({
      ...prev,
      announcements: [newAnn, ...prev.announcements]
    }));

    showToast('success', 'Announcement Broadcasted', `Sent to ${ann.subPartName || 'All Event Attendees'}.`);
  };

  const recordDirectDonation = (donation: Omit<Donation, 'id' | 'createdAt' | 'taxReceiptNumber'>): Donation => {
    const receiptNum = generateReceiptNumber();
    const newDonation: Donation = {
      ...donation,
      id: 'don_' + Date.now(),
      taxReceiptNumber: receiptNum,
      createdAt: new Date().toISOString()
    };

    setData((prev: any) => ({
      ...prev,
      donations: [newDonation, ...prev.donations],
      events: prev.events.map((e: Event) => e.id === currentEvent.id ? { ...e, totalRaised: e.totalRaised + donation.amount } : e)
    }));

    showToast('success', 'Donation Recorded', `Receipt #${receiptNum} issued for $${donation.amount}.`);
    return newDonation;
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(loadInitialData());
    showToast('info', 'Demo Data Reset', 'Restored original demo organizations, events, and rosters.');
  };

  return (
    <AppContext.Provider value={{
      currentOrg,
      currentUser,
      currentEvent,
      activeRole,
      organizations: data.organizations,
      users: data.users,
      events: data.events,
      subParts: data.subParts.filter((sp: SubPart) => sp.eventId === currentEvent.id),
      shifts: data.shifts.filter((s: Shift) => s.eventId === currentEvent.id),
      itemSlots: data.itemSlots.filter((i: ItemSlot) => i.eventId === currentEvent.id),
      ticketTiers: data.ticketTiers.filter((t: TicketTier) => t.eventId === currentEvent.id),
      registrations: data.registrations.filter((r: Registration) => r.eventId === currentEvent.id),
      donations: data.donations.filter((d: Donation) => d.eventId === currentEvent.id),
      vendorApplications: data.vendorApplications.filter((v: VendorApplication) => v.eventId === currentEvent.id),
      approvalRequests: data.approvalRequests.filter((a: ApprovalRequest) => a.eventId === currentEvent.id),
      volunteerCrm: data.volunteerCrm.filter((c: VolunteerCrmRecord) => c.orgId === currentOrg.id),
      announcements: data.announcements.filter((a: Announcement) => a.eventId === currentEvent.id),
      auditLogs: data.auditLogs,
      toasts,
      switchRole,
      switchOrganization,
      switchEvent,
      createEvent,
      claimSlotsAndRegister,
      cancelRegistration,
      toggleCheckIn,
      addShift,
      addItemSlot,
      requestBudgetIncrease,
      approveRequest,
      rejectRequest,
      submitVendorApplication,
      approveVendor,
      rejectVendor,
      postAnnouncement,
      recordDirectDonation,
      dismissToast,
      showToast,
      resetDemoData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
