import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Organization, User, Event, SubPart, Shift, ItemSlot, TicketTier, 
  Registration, Donation, VendorApplication, ApprovalRequest, 
  VolunteerCrmRecord, Announcement, AuditLog, UserRole, WaiverTemplate 
} from '../types';
import { 
  SEED_ORGANIZATIONS, SEED_USERS, SEED_EVENTS, SEED_SUBPARTS, 
  SEED_SHIFTS, SEED_ITEM_SLOTS, SEED_TICKET_TIERS, SEED_REGISTRATIONS, 
  SEED_DONATIONS, SEED_VENDOR_APPLICATIONS, SEED_APPROVAL_REQUESTS, 
  SEED_VOLUNTEER_CRM, SEED_ANNOUNCEMENTS, SEED_AUDIT_LOGS 
} from '../data/seedData';
import { EVENT_TEMPLATES, ORG_TEMPLATES, WAIVER_TEMPLATES_DATA } from '../data/templates';
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
  waiverTemplates: WaiverTemplate[];
  toasts: ToastNotification[];

  // Switchers
  switchRole: (role: UserRole) => void;
  switchOrganization: (orgId: string) => void;
  switchEvent: (eventId: string) => void;

  // Actions
  createOrganization: (orgData: Partial<Organization>, templatePresetId?: string, adminName?: string) => Organization;
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
  toggleItemPledgeReceived: (
    registrationId: string, 
    itemSlotId: string, 
    payload?: { receivedBy?: string; donorNotes?: string; estimatedFmv?: number }
  ) => void;
  updateOrganizationBranding: (orgId: string, updates: Partial<Organization>) => void;
  
  // Committee Lead & Threshold Actions
  addSubPart: (subPartData: Omit<SubPart, 'id' | 'budgetSpent' | 'shiftIds' | 'itemSlotIds'>) => SubPart;
  updateSubPart: (subPartId: string, updates: Partial<SubPart>) => void;
  deleteSubPart: (subPartId: string) => void;
  addShift: (shiftData: Omit<Shift, 'id' | 'claimedCount' | 'isApproved'>) => { autoApproved: boolean; shiftId: string };
  addItemSlot: (itemData: Omit<ItemSlot, 'id' | 'quantityPledged'>) => ItemSlot;
  requestBudgetIncrease: (subPartId: string, amount: number, reason: string) => void;
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;

  // Vendor actions
  submitVendorApplication: (app: Omit<VendorApplication, 'id' | 'status' | 'submittedAt'>) => void;
  approveVendor: (appId: string, assignedBooth: string) => void;
  rejectVendor: (appId: string) => void;

  // Legal Waivers & Compliance
  addWaiverTemplate: (data: Omit<WaiverTemplate, 'id'>) => WaiverTemplate;
  updateWaiverTemplate: (id: string, updates: Partial<WaiverTemplate>) => void;
  deleteWaiverTemplate: (id: string) => void;

  // Communications & Donations
  postAnnouncement: (ann: Omit<Announcement, 'id' | 'sentAt'>) => void;
  recordDirectDonation: (donation: Omit<Donation, 'id' | 'createdAt' | 'taxReceiptNumber'>) => Donation;
  
  // Auth & Session
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  registerUser: (payload: { name: string; email: string; phone?: string; password?: string; role: UserRole }) => User;
  logout: () => void;
  resetPassword: (email: string, newPassword?: string) => boolean;
  updateUserProfile: (data: Partial<User>) => void;
  inviteTeamMember: (memberData: Omit<User, 'id'>) => User;
  removeTeamMember: (userId: string) => void;

  // CRM Management & Tagging
  addVolunteerTag: (volunteerId: string, tag: string) => void;
  removeVolunteerTag: (volunteerId: string, tag: string) => void;
  updateVolunteerNotes: (volunteerId: string, notes: string) => void;

  // Demo & Environment Mode
  isDemoMode: boolean;
  toggleDemoMode: (enabled?: boolean) => void;

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
      waiverTemplates: WAIVER_TEMPLATES_DATA,
      currentOrgId: 'org_lincoln_pta',
      currentUserId: 'user_elena',
      currentEventId: 'evt_fall_carnival_2026',
    };
  };

  const [data, setData] = useState(loadInitialData);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const DEMO_MODE_STORAGE_KEY = 'r3pro_demo_mode_active';
  const LIVE_USER_STORAGE_KEY = 'r3pro_live_user_id';

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedDemo = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    const demo = savedDemo !== null ? savedDemo === 'true' : true;
    if (demo) return true;
    return !!localStorage.getItem(LIVE_USER_STORAGE_KEY);
  });

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
  const guestUser: User = {
    id: 'user_guest',
    name: 'Guest Visitor',
    email: '',
    phone: '',
    role: 'volunteer',
    orgId: '',
    isRegisteredUser: false
  };

  const currentOrg = data.organizations.find((o: Organization) => o.id === data.currentOrgId) || data.organizations[0];
  const resolvedUser = data.users.find((u: User) => u.id === data.currentUserId) || data.users[0];
  const currentUser = (!isDemoMode && !isAuthenticated) ? guestUser : resolvedUser;
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

  const createOrganization = (orgData: Partial<Organization>, templatePresetId?: string, adminName: string = 'Super Admin'): Organization => {
    const orgId = 'org_' + Date.now();
    const adminId = 'user_admin_' + Date.now();
    
    const newOrg: Organization = {
      id: orgId,
      name: orgData.name || 'New Organization',
      type: orgData.type || 'non_profit',
      ein: orgData.ein || '12-3456789',
      contactEmail: orgData.contactEmail || 'admin@org.org',
      phone: orgData.phone || '(555) 000-0000',
      address: orgData.address || '100 Main St',
      logoUrl: orgData.logoUrl || 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=120&auto=format&fit=crop&q=80',
      primaryColor: orgData.primaryColor || '#4f46e5',
      volunteerCount: 0,
      totalFundsRaised: 0,
      settings: {
        defaultCurrency: 'USD',
        defaultReminderCadence: 'standard',
        approvalThresholdBudget: 250,
        approvalThresholdSlots: 5
      }
    };

    const newAdminUser: User = {
      id: adminId,
      orgId: orgId,
      name: adminName,
      email: newOrg.contactEmail,
      phone: newOrg.phone,
      role: 'org_admin'
    };

    // Create initial kickoff event
    const eventId = 'evt_' + Date.now();
    const initialEvent: Event = {
      id: eventId,
      orgId: orgId,
      eventKey: `EVT-2026-Q3-${Math.floor(100 + Math.random() * 900)}`,
      title: `${newOrg.name} Kickoff & Fundraiser 2026`,
      slug: (newOrg.name + '-kickoff-2026').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: 'Annual community event, volunteer drive and fundraising campaign',
      description: `Welcome to the official volunteer and fundraising portal for ${newOrg.name}.`,
      startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 14 + 28800000).toISOString(),
      venueName: 'Community Center Main Hall',
      venueAddress: newOrg.address,
      isVirtual: false,
      coverImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      theme: {
        id: 'indigo_modern',
        name: 'Indigo Modern',
        primaryColor: newOrg.primaryColor,
        accentColor: '#6366f1',
        bgGradient: 'from-indigo-600 to-purple-800'
      },
      fundraisingGoal: 10000,
      totalRaised: 0,
      currency: 'USD',
      status: 'published',
      approvalThresholdBudget: 250,
      approvalThresholdSlots: 5,
      reminderCadence: 'standard',
      allowFeeCoverage: true,
      subPartIds: []
    };

    const template = ORG_TEMPLATES.find(t => t.id === templatePresetId) || ORG_TEMPLATES[0];
    const defaultSubParts: SubPart[] = template.defaultDepartments.map((deptName, dIdx) => ({
      id: `subpart_${orgId}_${dIdx}`,
      eventId: eventId,
      name: deptName,
      category: (dIdx === 0 ? 'registration_greeters' : dIdx === 1 ? 'hospitality_food' : 'labor_setup') as any,
      leadUserId: adminId,
      leadName: adminName,
      leadPhone: newOrg.phone,
      leadEmail: newOrg.contactEmail,
      leadRadioChannel: `Channel ${dIdx + 1}`,
      reportingGate: 'Main Entrance & Check-In Desk',
      dressCodeNotes: 'Comfortable casual attire or organization spirit shirt',
      suppliesNotes: 'Check in with lead upon arrival',
      budgetAllocated: 500,
      budgetSpent: 0,
      shiftIds: [],
      itemSlotIds: []
    }));

    const starterShift: Shift = {
      id: 'shift_' + Date.now(),
      subPartId: defaultSubParts[0].id,
      eventId: eventId,
      title: 'Event Greeter & Volunteer Check-In',
      description: 'Welcome arriving volunteers and families, hand out name tags.',
      startTime: initialEvent.startDate,
      endTime: initialEvent.endDate,
      capacity: 4,
      claimedCount: 0,
      requiresWaiver: true,
      waiverTemplateId: 'waiver_general_liability',
      isApproved: true
    };

    setData((prev: any) => ({
      ...prev,
      organizations: [newOrg, ...prev.organizations],
      users: [newAdminUser, ...prev.users],
      events: [initialEvent, ...prev.events],
      subParts: [...defaultSubParts, ...prev.subParts],
      shifts: [starterShift, ...prev.shifts],
      currentOrgId: orgId,
      currentUserId: adminId,
      currentEventId: eventId
    }));

    showToast('success', 'Organization Registered!', `${newOrg.name} workspace created.`);
    return newOrg;
  };

  const createEvent = (newEventData: Partial<Event>, templatePresetId?: string): Event => {
    const id = 'evt_' + Date.now();
    const slug = (newEventData.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const startDateObj = new Date(newEventData.startDate || Date.now());
    const year = startDateObj.getFullYear();
    const quarter = `Q${Math.floor(startDateObj.getMonth() / 3) + 1}`;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const eventKey = newEventData.eventKey || `EVT-${year}-${quarter}-${randomSuffix}`;
    
    const event: Event = {
      id,
      orgId: currentOrg.id,
      eventKey,
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

    // Hydrate template departments, shifts, items if chosen
    const template = EVENT_TEMPLATES.find(t => t.id === templatePresetId);
    let newSubParts: SubPart[] = [];
    let newShifts: Shift[] = [];
    let newItems: ItemSlot[] = [];

    if (template) {
      template.departments.forEach((dept, dIdx) => {
        const subPartId = `sp_${id}_${dIdx}`;
        newSubParts.push({
          id: subPartId,
          eventId: id,
          name: dept.name,
          category: (dIdx === 0 ? 'registration_greeters' : dIdx === 1 ? 'hospitality_food' : 'labor_setup') as any,
          leadUserId: currentUser.id,
          leadName: currentUser.name,
          leadPhone: currentUser.phone,
          leadEmail: currentUser.email,
          leadRadioChannel: `Channel ${dIdx + 1}`,
          reportingGate: `${dept.name} Check-In Station`,
          dressCodeNotes: 'Comfortable event attire',
          suppliesNotes: 'Check in with lead',
          budgetAllocated: Math.round(event.fundraisingGoal * 0.08),
          budgetSpent: 0,
          shiftIds: [],
          itemSlotIds: []
        });

        dept.shifts.forEach((s, sIdx) => {
          newShifts.push({
            id: `shift_${id}_${dIdx}_${sIdx}`,
            subPartId,
            eventId: id,
            title: s.title,
            description: `Shift role for ${dept.name}`,
            startTime: event.startDate,
            endTime: event.endDate,
            capacity: s.capacity,
            claimedCount: 0,
            requiresWaiver: true,
            waiverTemplateId: 'waiver_general_liability',
            isApproved: true
          });
        });

        dept.items.forEach((i, iIdx) => {
          newItems.push({
            id: `item_${id}_${dIdx}_${iIdx}`,
            subPartId,
            eventId: id,
            itemName: i.itemName,
            category: 'Supplies',
            quantityNeeded: i.quantityNeeded,
            quantityPledged: 0,
            unit: i.unit,
            dropOffLocation: `${dept.name} Desk`,
            dropOffDeadline: 'Event Morning'
          });
        });
      });
    }

    setData((prev: any) => ({
      ...prev,
      events: [event, ...prev.events],
      subParts: [...newSubParts, ...prev.subParts],
      shifts: [...newShifts, ...prev.shifts],
      itemSlots: [...newItems, ...prev.itemSlots],
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

  const toggleItemPledgeReceived = (
    registrationId: string, 
    itemSlotId: string, 
    payload?: { receivedBy?: string; donorNotes?: string; estimatedFmv?: number }
  ) => {
    setData((prev: any) => {
      const updatedRegistrations = prev.registrations.map((r: Registration) => {
        if (r.id === registrationId) {
          const updatedPledges = r.itemPledges.map(ip => {
            if (ip.itemSlotId === itemSlotId) {
              const newStatus = !ip.delivered;
              return {
                ...ip,
                delivered: newStatus,
                deliveredAt: newStatus ? new Date().toISOString() : undefined,
                receivedBy: newStatus ? (payload?.receivedBy || currentUser.name) : undefined,
                donorNotes: payload?.donorNotes !== undefined ? payload.donorNotes : ip.donorNotes,
                estimatedFmv: payload?.estimatedFmv !== undefined ? payload.estimatedFmv : ip.estimatedFmv,
                inKindReceiptNumber: newStatus && !ip.inKindReceiptNumber ? generateReceiptNumber() : ip.inKindReceiptNumber
              };
            }
            return ip;
          });
          return { ...r, itemPledges: updatedPledges };
        }
        return r;
      });

      return {
        ...prev,
        registrations: updatedRegistrations
      };
    });

    showToast('success', 'Item Drop-Off Updated', 'Pledged item status, timestamp, and receiving notes saved.');
  };

  const updateOrganizationBranding = (orgId: string, updates: Partial<Organization>) => {
    setData((prev: any) => {
      const updatedOrgs = prev.organizations.map((o: Organization) => {
        if (o.id === orgId) {
          return { ...o, ...updates };
        }
        return o;
      });
      return { ...prev, organizations: updatedOrgs };
    });

    showToast('success', 'Branding Saved', 'Organization logo, primary color, and signatory updated successfully.');
  };

  const addSubPart = (subPartData: Omit<SubPart, 'id' | 'budgetSpent' | 'shiftIds' | 'itemSlotIds'>): SubPart => {
    const id = 'subpart_' + Date.now();
    const newSubPart: SubPart = {
      ...subPartData,
      id,
      budgetSpent: 0,
      shiftIds: [],
      itemSlotIds: []
    };

    setData((prev: any) => ({
      ...prev,
      subParts: [...prev.subParts, newSubPart],
      events: prev.events.map((e: Event) => e.id === currentEvent.id ? {
        ...e,
        subPartIds: [...(e.subPartIds || []), id]
      } : e)
    }));

    showToast('success', 'Committee Added', `"${subPartData.name}" has been created with a $${subPartData.budgetAllocated} budget.`);
    return newSubPart;
  };

  const updateSubPart = (subPartId: string, updates: Partial<SubPart>) => {
    setData((prev: any) => ({
      ...prev,
      subParts: prev.subParts.map((sp: SubPart) => sp.id === subPartId ? { ...sp, ...updates } : sp)
    }));

    showToast('success', 'Committee Updated', 'Department settings and budget saved.');
  };

  const deleteSubPart = (subPartId: string) => {
    setData((prev: any) => ({
      ...prev,
      subParts: prev.subParts.filter((sp: SubPart) => sp.id !== subPartId),
      shifts: prev.shifts.filter((s: Shift) => s.subPartId !== subPartId),
      itemSlots: prev.itemSlots.filter((i: ItemSlot) => i.subPartId !== subPartId)
    }));

    showToast('info', 'Committee Removed', 'Department and its shifts have been deleted.');
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

  const addWaiverTemplate = (data: Omit<WaiverTemplate, 'id'>): WaiverTemplate => {
    const id = 'waiver_' + Date.now();
    const newWaiver: WaiverTemplate = {
      ...data,
      id
    };
    setData((prev: any) => ({
      ...prev,
      waiverTemplates: [...(prev.waiverTemplates || WAIVER_TEMPLATES_DATA), newWaiver]
    }));
    showToast('success', 'Legal Document Saved', `"${data.title}" is now active and enforced.`);
    return newWaiver;
  };

  const updateWaiverTemplate = (id: string, updates: Partial<WaiverTemplate>) => {
    setData((prev: any) => ({
      ...prev,
      waiverTemplates: (prev.waiverTemplates || WAIVER_TEMPLATES_DATA).map((w: WaiverTemplate) => w.id === id ? { ...w, ...updates } : w)
    }));
    showToast('success', 'Legal Document Updated', 'Waiver terms and e-sign settings saved.');
  };

  const deleteWaiverTemplate = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      waiverTemplates: (prev.waiverTemplates || WAIVER_TEMPLATES_DATA).filter((w: WaiverTemplate) => w.id !== id)
    }));
    showToast('info', 'Legal Document Removed', 'Waiver template deleted.');
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
    localStorage.removeItem(LIVE_USER_STORAGE_KEY);
    setData(loadInitialData());
    showToast('info', 'Demo Data Reset', 'Restored original demo organizations, events, and rosters.');
  };

  const toggleDemoMode = (enabled?: boolean) => {
    const next = enabled !== undefined ? enabled : !isDemoMode;
    setIsDemoMode(next);
    localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(next));

    if (!next) {
      // Switched to Live Clean Mode
      const savedUserId = localStorage.getItem(LIVE_USER_STORAGE_KEY);
      if (savedUserId) {
        const realUser = data.users.find((u: User) => u.id === savedUserId);
        if (realUser) {
          setData((prev: any) => ({ ...prev, currentUserId: realUser.id, currentOrgId: realUser.orgId || prev.currentOrgId }));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      showToast('info', 'Live Clean Mode Activated', 'Viewing real public interface as a fresh unauthenticated visitor.');
    } else {
      // Switched to Demo Sandbox
      setIsAuthenticated(true);
      setData((prev: any) => ({ ...prev, currentUserId: 'user_elena' }));
      showToast('info', 'Demo Simulator Activated', 'Role switcher and pre-configured test accounts enabled.');
    }
  };

  const login = (email: string, password?: string): boolean => {
    const user = data.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setData((prev: any) => ({
        ...prev,
        currentUserId: user.id,
        currentOrgId: user.orgId || prev.currentOrgId
      }));
      setIsAuthenticated(true);
      if (!isDemoMode) {
        localStorage.setItem(LIVE_USER_STORAGE_KEY, user.id);
      }
      showToast('success', `Welcome back, ${user.name}!`, `Signed in as ${user.role.replace('_', ' ')}.`);
      return true;
    } else {
      // Auto-create account for new volunteer
      const newUser: User = {
        id: 'user_' + Date.now(),
        name: email.split('@')[0].replace('.', ' '),
        email,
        phone: '(555) 000-0000',
        role: 'volunteer',
        orgId: currentOrg.id,
        isRegisteredUser: true
      };
      setData((prev: any) => ({
        ...prev,
        users: [newUser, ...prev.users],
        currentUserId: newUser.id
      }));
      setIsAuthenticated(true);
      if (!isDemoMode) {
        localStorage.setItem(LIVE_USER_STORAGE_KEY, newUser.id);
      }
      showToast('success', `Welcome, ${newUser.name}!`, 'Account created and signed in.');
      return true;
    }
  };

  const registerUser = (payload: { name: string; email: string; phone?: string; password?: string; role: UserRole }): User => {
    const newUser: User = {
      id: 'user_' + Date.now(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone || '(555) 000-0000',
      role: payload.role,
      orgId: currentOrg.id,
      isRegisteredUser: true
    };

    setData((prev: any) => ({
      ...prev,
      users: [newUser, ...prev.users],
      currentUserId: newUser.id
    }));
    setIsAuthenticated(true);
    if (!isDemoMode) {
      localStorage.setItem(LIVE_USER_STORAGE_KEY, newUser.id);
    }
    showToast('success', 'Account Registered!', `Welcome to R3Pro, ${newUser.name}.`);
    return newUser;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(LIVE_USER_STORAGE_KEY);
    setData((prev: any) => ({
      ...prev,
      currentUserId: 'user_guest'
    }));
    showToast('info', 'Signed Out', 'You have been signed out of your account.');
  };

  const resetPassword = (email: string, newPassword?: string): boolean => {
    showToast('success', 'Password Updated', `New password saved for ${email}. Please sign in.`);
    return true;
  };

  const updateUserProfile = (userData: Partial<User>) => {
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === currentUser.id ? { ...u, ...userData } : u)
    }));
    showToast('success', 'Profile Saved', 'Your account details have been updated.');
  };

  const inviteTeamMember = (memberData: Omit<User, 'id'>): User => {
    const id = 'user_' + Date.now();
    const newUser: User = {
      ...memberData,
      id,
      isRegisteredUser: true,
      memberships: [
        {
          orgId: memberData.orgId,
          orgName: currentOrg.name,
          role: memberData.role,
          status: 'active',
          invitedAt: new Date().toISOString(),
          assignedSubPartIds: memberData.assignedSubPartIds || []
        }
      ]
    };

    const newAuditLog: AuditLog = {
      id: 'log_' + Date.now(),
      orgId: memberData.orgId,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'INVITE_TEAM_MEMBER',
      details: `Invited ${memberData.name} (${memberData.email}) as ${memberData.role.replace('_', ' ')}`,
      timestamp: new Date().toISOString()
    };

    setData((prev: any) => ({
      ...prev,
      users: [...prev.users, newUser],
      auditLogs: [newAuditLog, ...(prev.auditLogs || [])]
    }));

    showToast('success', 'Leadership Member Added', `Invitation sent to ${memberData.name} (${memberData.email}) as ${memberData.role.replace('_', ' ')}.`);
    return newUser;
  };

  const removeTeamMember = (userId: string) => {
    const member = data.users.find((u: User) => u.id === userId);
    if (!member) return;

    const newAuditLog: AuditLog = {
      id: 'log_' + Date.now(),
      orgId: currentOrg.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'REMOVE_TEAM_MEMBER',
      details: `Removed ${member.name} (${member.email}) from organization roles`,
      timestamp: new Date().toISOString()
    };

    setData((prev: any) => ({
      ...prev,
      users: prev.users.filter((u: User) => u.id !== userId),
      auditLogs: [newAuditLog, ...(prev.auditLogs || [])]
    }));

    showToast('info', 'Team Member Removed', `${member.name} has been removed from organization staff.`);
  };

  const addVolunteerTag = (volunteerId: string, tag: string) => {
    setData((prev: any) => ({
      ...prev,
      volunteerCrm: prev.volunteerCrm.map((v: VolunteerCrmRecord) => {
        if (v.id === volunteerId) {
          if (v.tags.includes(tag)) return v;
          return { ...v, tags: [...v.tags, tag] };
        }
        return v;
      })
    }));
    showToast('success', 'Badge Tag Added', `Tag "${tag}" assigned to volunteer profile.`);
  };

  const removeVolunteerTag = (volunteerId: string, tag: string) => {
    setData((prev: any) => ({
      ...prev,
      volunteerCrm: prev.volunteerCrm.map((v: VolunteerCrmRecord) => {
        if (v.id === volunteerId) {
          return { ...v, tags: v.tags.filter(t => t !== tag) };
        }
        return v;
      })
    }));
    showToast('info', 'Tag Removed', `Tag "${tag}" removed.`);
  };

  const updateVolunteerNotes = (volunteerId: string, notes: string) => {
    setData((prev: any) => ({
      ...prev,
      volunteerCrm: prev.volunteerCrm.map((v: VolunteerCrmRecord) => {
        if (v.id === volunteerId) {
          return { ...v, notes };
        }
        return v;
      })
    }));
    showToast('success', 'Notes Saved', 'Coordinator internal notes updated.');
  };

  return (
    <AppContext.Provider value={{
      currentOrg,
      currentUser,
      currentEvent,
      activeRole,
      isAuthenticated,
      isDemoMode,
      toggleDemoMode,
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
      waiverTemplates: data.waiverTemplates || WAIVER_TEMPLATES_DATA,
      toasts,
      switchRole,
      switchOrganization,
      switchEvent,
      createOrganization,
      createEvent,
      claimSlotsAndRegister,
      cancelRegistration,
      toggleCheckIn,
      toggleItemPledgeReceived,
      updateOrganizationBranding,
      addSubPart,
      updateSubPart,
      deleteSubPart,
      addShift,
      addItemSlot,
      requestBudgetIncrease,
      approveRequest,
      rejectRequest,
      submitVendorApplication,
      approveVendor,
      rejectVendor,
      addWaiverTemplate,
      updateWaiverTemplate,
      deleteWaiverTemplate,
      postAnnouncement,
      recordDirectDonation,
      login,
      registerUser,
      logout,
      resetPassword,
      updateUserProfile,
      inviteTeamMember,
      removeTeamMember,
      addVolunteerTag,
      removeVolunteerTag,
      updateVolunteerNotes,
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
