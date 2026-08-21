import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Organization, User, Event, SubPart, Shift, ItemSlot, TicketTier, 
  Registration, Donation, VendorApplication, ApprovalRequest, 
  VolunteerCrmRecord, Announcement, AuditLog, UserRole, WaiverTemplate,
  PaidContractor, ProBonoPledge 
} from '../types';
import { 
  SEED_ORGANIZATIONS, SEED_USERS, SEED_EVENTS, SEED_SUBPARTS, 
  SEED_SHIFTS, SEED_ITEM_SLOTS, SEED_TICKET_TIERS, SEED_REGISTRATIONS, 
  SEED_DONATIONS, SEED_VENDOR_APPLICATIONS, SEED_APPROVAL_REQUESTS, 
  SEED_VOLUNTEER_CRM, SEED_ANNOUNCEMENTS, SEED_AUDIT_LOGS,
  SEED_CONTRACTORS, SEED_PRO_BONO_PLEDGES 
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
  contractors: PaidContractor[];
  proBonoPledges: ProBonoPledge[];
  toasts: ToastNotification[];

  // Switchers
  switchRole: (role: UserRole) => void;
  switchOrganization: (orgId: string) => void;
  switchEvent: (eventId: string) => void;

  // Actions
  createOrganization: (orgData: Partial<Organization>, templatePresetId?: string, adminName?: string) => Organization;
  createEvent: (
    newEvent: Partial<Event>, 
    templatePresetId?: string,
    customPayload?: {
      subParts?: Omit<SubPart, 'id' | 'budgetSpent' | 'shiftIds' | 'itemSlotIds'>[];
      shifts?: (Omit<Shift, 'id' | 'claimedCount' | 'isApproved'> & { departmentIndex?: number })[];
      itemSlots?: (Omit<ItemSlot, 'id' | 'quantityPledged'> & { departmentIndex?: number })[];
      ticketTiers?: Omit<TicketTier, 'id' | 'claimedCount'>[];
    }
  ) => Event;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
  deleteEvent: (eventId: string) => void;
  claimSlotsAndRegister: (payload: {
    primaryName: string;
    primaryEmail: string;
    primaryPhone: string;
    birthDate?: string;
    notes?: string;
    members: { name: string; email?: string; phone?: string; birthDate?: string; relationship: any; isMinor: boolean; age?: number; emergencyContactName?: string; emergencyContactPhone?: string; dietaryNotes?: string; }[];
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
  updateShift: (shiftId: string, updates: Partial<Shift>) => void;
  deleteShift: (shiftId: string) => void;
  addItemSlot: (itemData: Omit<ItemSlot, 'id' | 'quantityPledged'>) => ItemSlot;
  updateItemSlot: (itemSlotId: string, updates: Partial<ItemSlot>) => void;
  deleteItemSlot: (itemSlotId: string) => void;
  requestBudgetIncrease: (subPartId: string, amount: number, reason: string) => void;
  approveRequest: (requestId: string) => void;
  rejectRequest: (requestId: string) => void;

  // Ticket Tiers & Sponsor Packages Full CRUD
  createTicketTier: (tierData: Omit<TicketTier, 'id' | 'claimedCount'>) => TicketTier;
  updateTicketTier: (tierId: string, updates: Partial<TicketTier>) => void;
  deleteTicketTier: (tierId: string) => void;
  reorderTicketTiers: (orderedTiers: TicketTier[]) => void;

  // Vendor actions
  submitVendorApplication: (app: Omit<VendorApplication, 'id' | 'status' | 'submittedAt'>) => void;
  updateVendorApplication: (appId: string, updates: Partial<VendorApplication>) => void;
  approveVendor: (appId: string, assignedBooth: string) => void;
  rejectVendor: (appId: string) => void;

  // Paid Contractor & Service Provider Management (Accounts Payable)
  addContractor: (contractorData: Omit<PaidContractor, 'id' | 'createdAt'>) => PaidContractor;
  updateContractor: (contractorId: string, updates: Partial<PaidContractor>) => void;
  deleteContractor: (contractorId: string) => void;

  // Pro-Bono In-Kind Professional Services (Tax-Deductible)
  pledgeProBonoService: (pledgeData: Omit<ProBonoPledge, 'id' | 'inKindReceiptNumber' | 'createdAt' | 'status' | 'sponsorPerksGranted'>) => ProBonoPledge;
  updateProBonoPledge: (pledgeId: string, updates: Partial<ProBonoPledge>) => void;
  deleteProBonoPledge: (pledgeId: string) => void;

  // Legal Waivers & Compliance
  addWaiverTemplate: (data: Omit<WaiverTemplate, 'id'>) => WaiverTemplate;
  updateWaiverTemplate: (id: string, updates: Partial<WaiverTemplate>) => void;
  deleteWaiverTemplate: (id: string) => void;

  // Communications & Donations
  postAnnouncement: (ann: Omit<Announcement, 'id' | 'sentAt'>) => void;
  deleteAnnouncement: (announcementId: string) => void;
  recordDirectDonation: (donation: Omit<Donation, 'id' | 'createdAt' | 'taxReceiptNumber'>) => Donation;
  deleteDonation: (donationId: string) => void;
  
  // Auth & Session
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  loginWithCode: (identifier: string, code: string) => boolean;
  registerUser: (payload: { name: string; email: string; phone?: string; password?: string; role: UserRole }) => User;
  logout: () => void;
  resetPassword: (email: string, newPassword?: string) => boolean;
  updateUserProfile: (data: Partial<User>) => void;
  inviteTeamMember: (memberData: Omit<User, 'id'>) => User;
  updateTeamMember: (userId: string, updates: Partial<User>) => void;
  removeTeamMember: (userId: string) => void;

  // CRM Management & Tagging
  addVolunteer: (volunteer: Omit<VolunteerCrmRecord, 'id' | 'orgId' | 'lifetimeHours' | 'lifetimeDonations' | 'eventsParticipated' | 'attendanceRate' | 'lastActive'> & { lifetimeHours?: number; lifetimeDonations?: number }) => VolunteerCrmRecord;
  updateVolunteer: (volunteerId: string, updates: Partial<VolunteerCrmRecord>) => void;
  deleteVolunteer: (volunteerId: string) => void;
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
        const parsed = JSON.parse(saved);
        // Normalize loaded data to ensure full compatibility with current schema
        if (parsed.events && Array.isArray(parsed.events)) {
          parsed.events = parsed.events.map((e: any) => ({
            ...e,
            dressCode: e.dressCode || 'Casual spirit wear / Comfortable attire & sneakers'
          }));
        }
        if (parsed.users && Array.isArray(parsed.users)) {
          parsed.users = parsed.users.map((u: any) => ({
            ...u,
            role: (u.role === 'hospitality_lead' as any) ? 'committee_lead' : u.role
          }));
        }
        if (parsed.subParts && Array.isArray(parsed.subParts)) {
          parsed.subParts = parsed.subParts.map((sp: any) => ({
            ...sp,
            dressCodeNotes: sp.dressCodeNotes || 'Comfortable attire & closed-toe shoes',
            suppliesNotes: sp.suppliesNotes || 'Check in with lead at gate'
          }));
        }
        if (parsed.itemSlots && Array.isArray(parsed.itemSlots)) {
          parsed.itemSlots = parsed.itemSlots.map((item: any) => ({
            ...item,
            estimatedFmvPerUnit: item.estimatedFmvPerUnit !== undefined ? item.estimatedFmvPerUnit : 20
          }));
        }
        if (parsed.ticketTiers && Array.isArray(parsed.ticketTiers)) {
          parsed.ticketTiers = parsed.ticketTiers.map((tt: any) => ({
            ...tt,
            fairMarketValue: tt.fairMarketValue !== undefined ? tt.fairMarketValue : 0,
            instantCheckout: tt.instantCheckout !== undefined ? tt.instantCheckout : true
          }));
        }
        if (!parsed.contractors || !Array.isArray(parsed.contractors)) {
          parsed.contractors = SEED_CONTRACTORS;
        }
        if (!parsed.proBonoPledges || !Array.isArray(parsed.proBonoPledges)) {
          parsed.proBonoPledges = SEED_PRO_BONO_PLEDGES;
        }
        return parsed;
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
      contractors: SEED_CONTRACTORS,
      proBonoPledges: SEED_PRO_BONO_PLEDGES,
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
      dressCode: 'Casual spirit wear / Comfortable attire & sneakers',
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

  const createEvent = (
    newEventData: Partial<Event>, 
    templatePresetId?: string,
    customPayload?: {
      subParts?: Omit<SubPart, 'id' | 'budgetSpent' | 'shiftIds' | 'itemSlotIds'>[];
      shifts?: (Omit<Shift, 'id' | 'claimedCount' | 'isApproved'> & { departmentIndex?: number })[];
      itemSlots?: (Omit<ItemSlot, 'id' | 'quantityPledged'> & { departmentIndex?: number })[];
      ticketTiers?: Omit<TicketTier, 'id' | 'claimedCount'>[];
    }
  ): Event => {
    const id = 'evt_' + Date.now();
    const slug = (newEventData.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const startDateObj = new Date(newEventData.startDate || Date.now());
    const year = startDateObj.getFullYear();
    const quarter = `Q${Math.floor(startDateObj.getMonth() / 3) + 1}`;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const eventKey = newEventData.eventKey || `EVT-${year}-${quarter}-${randomSuffix}`;
    
    // Hydrate template departments, shifts, items, ticket tiers if customPayload or template chosen
    const template = EVENT_TEMPLATES.find(t => t.id === templatePresetId);

    const event: Event = {
      id,
      orgId: currentOrg.id,
      eventKey,
      title: newEventData.title || 'New Event',
      slug,
      tagline: newEventData.tagline || 'Community Event & Fundraiser',
      description: newEventData.description || 'Welcome to our event.',
      tags: newEventData.tags || ['Community Event', 'Family Friendly'],
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
      approvalThresholdBudget: newEventData.approvalThresholdBudget || currentOrg.settings.approvalThresholdBudget,
      approvalThresholdSlots: newEventData.approvalThresholdSlots || currentOrg.settings.approvalThresholdSlots,
      reminderCadence: currentOrg.settings.defaultReminderCadence,
      allowFeeCoverage: true,
      dressCode: newEventData.dressCode || template?.defaultDressCode || 'Casual spirit wear / Comfortable attire & sneakers',
      subPartIds: []
    };

    let newSubParts: SubPart[] = [];
    let newShifts: Shift[] = [];
    let newItems: ItemSlot[] = [];
    let newTicketTiers: TicketTier[] = [];

    if (customPayload && (customPayload.subParts || customPayload.ticketTiers || customPayload.shifts || customPayload.itemSlots)) {
      // Use customized payload from the step-by-step wizard
      (customPayload.subParts || []).forEach((dept, dIdx) => {
        const subPartId = `sp_${id}_${dIdx}_${Date.now()}`;
        newSubParts.push({
          ...dept,
          id: subPartId,
          eventId: id,
          budgetSpent: 0,
          shiftIds: [],
          itemSlotIds: []
        });
      });

      (customPayload.shifts || []).forEach((s, sIdx) => {
        const targetSubPartId = s.subPartId || (s.departmentIndex !== undefined && newSubParts[s.departmentIndex]?.id) || newSubParts[0]?.id || `sp_${id}_0`;
        newShifts.push({
          id: `shift_${id}_${sIdx}_${Date.now()}`,
          subPartId: targetSubPartId,
          eventId: id,
          title: s.title,
          description: s.description || '',
          startTime: s.startTime || event.startDate,
          endTime: s.endTime || event.endDate,
          capacity: s.capacity || 4,
          claimedCount: 0,
          requiresWaiver: s.requiresWaiver ?? true,
          waiverTemplateId: s.waiverTemplateId || 'waiver_general_liability',
          isApproved: true
        });
      });

      (customPayload.itemSlots || []).forEach((i, iIdx) => {
        const targetSubPartId = i.subPartId || (i.departmentIndex !== undefined && newSubParts[i.departmentIndex]?.id) || newSubParts[0]?.id || `sp_${id}_0`;
        newItems.push({
          id: `item_${id}_${iIdx}_${Date.now()}`,
          subPartId: targetSubPartId,
          eventId: id,
          itemName: i.itemName,
          category: i.category || 'Supplies',
          quantityNeeded: i.quantityNeeded || 1,
          quantityPledged: 0,
          unit: i.unit || 'units',
          dropOffLocation: i.dropOffLocation || 'Department Station',
          dropOffDeadline: i.dropOffDeadline || 'Event Morning',
          estimatedFmvPerUnit: i.estimatedFmvPerUnit || 20
        });
      });

      (customPayload.ticketTiers || []).forEach((tt, ttIdx) => {
        newTicketTiers.push({
          ...tt,
          id: `tier_${id}_${ttIdx}_${Date.now()}`,
          eventId: id,
          claimedCount: 0
        });
      });
    } else if (template) {
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
          dressCodeNotes: dept.dressCode || 'Comfortable event attire',
          suppliesNotes: 'Check in with lead',
          budgetAllocated: dept.suggestedBudget || Math.round(event.fundraisingGoal * 0.08),
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
            description: s.description || `Shift role for ${dept.name}`,
            startTime: event.startDate,
            endTime: event.endDate,
            capacity: s.capacity,
            claimedCount: 0,
            requiresWaiver: s.requiresWaiver,
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
            category: i.category || 'Supplies',
            quantityNeeded: i.quantityNeeded,
            quantityPledged: 0,
            unit: i.unit,
            dropOffLocation: `${dept.name} Desk`,
            dropOffDeadline: 'Event Morning',
            estimatedFmvPerUnit: 20
          });
        });
      });

      (template.ticketTiers || []).forEach((tt, ttIdx) => {
        newTicketTiers.push({
          id: `tier_${id}_${ttIdx}`,
          eventId: id,
          title: tt.title,
          type: tt.type,
          price: tt.price,
          fairMarketValue: tt.fairMarketValue,
          capacity: tt.capacity,
          claimedCount: 0,
          instantCheckout: tt.instantCheckout,
          description: tt.description,
          perks: tt.perks
        });
      });
    }

    setData((prev: any) => ({
      ...prev,
      events: [event, ...prev.events],
      subParts: [...newSubParts, ...prev.subParts],
      shifts: [...newShifts, ...prev.shifts],
      itemSlots: [...newItems, ...prev.itemSlots],
      ticketTiers: [...newTicketTiers, ...prev.ticketTiers],
      currentEventId: event.id
    }));

    showToast('success', 'Event Created Successfully', `${event.title} is now published and active.`);
    return event;
  };

  const claimSlotsAndRegister = (payload: {
    primaryName: string;
    primaryEmail: string;
    primaryPhone: string;
    birthDate?: string;
    notes?: string;
    members: { name: string; email?: string; phone?: string; birthDate?: string; relationship: any; isMinor: boolean; age?: number; emergencyContactName?: string; emergencyContactPhone?: string; dietaryNotes?: string; }[];
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
      birthDate: m.birthDate,
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
      birthDate: payload.birthDate,
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

  const updateShift = (shiftId: string, updates: Partial<Shift>) => {
    setData((prev: any) => ({
      ...prev,
      shifts: prev.shifts.map((s: Shift) => s.id === shiftId ? { ...s, ...updates } : s)
    }));
    showToast('success', 'Shift Updated', 'Volunteer shift details have been saved.');
  };

  const deleteShift = (shiftId: string) => {
    setData((prev: any) => ({
      ...prev,
      shifts: prev.shifts.filter((s: Shift) => s.id !== shiftId)
    }));
    showToast('info', 'Shift Removed', 'Volunteer shift has been deleted.');
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

  const updateItemSlot = (itemSlotId: string, updates: Partial<ItemSlot>) => {
    setData((prev: any) => ({
      ...prev,
      itemSlots: prev.itemSlots.map((i: ItemSlot) => i.id === itemSlotId ? { ...i, ...updates } : i)
    }));
    showToast('success', 'Wishlist Item Updated', 'Supply need details have been saved.');
  };

  const deleteItemSlot = (itemSlotId: string) => {
    setData((prev: any) => ({
      ...prev,
      itemSlots: prev.itemSlots.filter((i: ItemSlot) => i.id !== itemSlotId)
    }));
    showToast('info', 'Item Removed', 'Supply wishlist item has been removed.');
  };

  const createTicketTier = (tierData: Omit<TicketTier, 'id' | 'claimedCount'>): TicketTier => {
    const newTier: TicketTier = {
      ...tierData,
      id: 'tier_' + Date.now(),
      claimedCount: 0
    };

    setData((prev: any) => ({
      ...prev,
      ticketTiers: [...prev.ticketTiers, newTier]
    }));

    showToast('success', 'Package / Tier Created', `"${tierData.title}" is now published.`);
    return newTier;
  };

  const updateTicketTier = (tierId: string, updates: Partial<TicketTier>) => {
    setData((prev: any) => ({
      ...prev,
      ticketTiers: prev.ticketTiers.map((t: TicketTier) => t.id === tierId ? { ...t, ...updates } : t)
    }));

    showToast('success', 'Package / Tier Updated', 'Tier pricing, perks, and capacity saved.');
  };

  const deleteTicketTier = (tierId: string) => {
    setData((prev: any) => ({
      ...prev,
      ticketTiers: prev.ticketTiers.filter((t: TicketTier) => t.id !== tierId)
    }));

    showToast('info', 'Tier Removed', 'Package / Tier has been deleted.');
  };

  const reorderTicketTiers = (orderedTiers: TicketTier[]) => {
    setData((prev: any) => {
      const otherTiers = prev.ticketTiers.filter((t: TicketTier) => t.eventId !== currentEvent.id);
      return {
        ...prev,
        ticketTiers: [...orderedTiers, ...otherTiers]
      };
    });

    showToast('success', 'Tiers Reordered', 'Updated display order for tickets & sponsor packages.');
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

  const updateVendorApplication = (appId: string, updates: Partial<VendorApplication>) => {
    setData((prev: any) => ({
      ...prev,
      vendorApplications: prev.vendorApplications.map((v: VendorApplication) => 
        v.id === appId ? { ...v, ...updates } : v
      )
    }));
    showToast('success', 'Vendor Application Updated', 'Compliance details and documents saved successfully.');
  };

  // Paid Contractor & Service Provider Management (Accounts Payable)
  const addContractor = (contractorData: Omit<PaidContractor, 'id' | 'createdAt'>): PaidContractor => {
    const id = 'cont_' + Date.now();
    const newContractor: PaidContractor = {
      ...contractorData,
      id,
      createdAt: new Date().toISOString()
    };

    setData((prev: any) => {
      // Auto-update department budget spent
      const updatedSubParts = prev.subParts.map((sp: SubPart) => 
        sp.id === contractorData.subPartId 
          ? { ...sp, budgetSpent: sp.budgetSpent + Number(contractorData.contractAmount) }
          : sp
      );
      return {
        ...prev,
        contractors: [newContractor, ...(prev.contractors || [])],
        subParts: updatedSubParts
      };
    });

    showToast('success', 'Contractor Logged', `${contractorData.businessName} contracted for $${contractorData.contractAmount}.`);
    return newContractor;
  };

  const updateContractor = (contractorId: string, updates: Partial<PaidContractor>) => {
    setData((prev: any) => {
      const existing = (prev.contractors || []).find((c: PaidContractor) => c.id === contractorId);
      if (!existing) return prev;

      let updatedSubParts = prev.subParts;
      if (updates.contractAmount !== undefined && updates.contractAmount !== existing.contractAmount) {
        const diff = Number(updates.contractAmount) - Number(existing.contractAmount);
        updatedSubParts = prev.subParts.map((sp: SubPart) => 
          sp.id === (updates.subPartId || existing.subPartId)
            ? { ...sp, budgetSpent: Math.max(0, sp.budgetSpent + diff) }
            : sp
        );
      }

      return {
        ...prev,
        contractors: (prev.contractors || []).map((c: PaidContractor) => c.id === contractorId ? { ...c, ...updates } : c),
        subParts: updatedSubParts
      };
    });

    showToast('success', 'Contractor Updated', 'Contract terms, W-9 status, and payment saved.');
  };

  const deleteContractor = (contractorId: string) => {
    setData((prev: any) => {
      const existing = (prev.contractors || []).find((c: PaidContractor) => c.id === contractorId);
      let updatedSubParts = prev.subParts;
      if (existing) {
        updatedSubParts = prev.subParts.map((sp: SubPart) => 
          sp.id === existing.subPartId 
            ? { ...sp, budgetSpent: Math.max(0, sp.budgetSpent - Number(existing.contractAmount)) }
            : sp
        );
      }
      return {
        ...prev,
        contractors: (prev.contractors || []).filter((c: PaidContractor) => c.id !== contractorId),
        subParts: updatedSubParts
      };
    });

    showToast('info', 'Contractor Removed', 'Contractor deleted and department budget reconciled.');
  };

  // Pro-Bono In-Kind Professional Services
  const pledgeProBonoService = (pledgeData: Omit<ProBonoPledge, 'id' | 'inKindReceiptNumber' | 'createdAt' | 'status' | 'sponsorPerksGranted'>): ProBonoPledge => {
    const id = 'pbp_' + Date.now();
    const inKindReceiptNumber = 'INKIND-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newPledge: ProBonoPledge = {
      ...pledgeData,
      id,
      inKindReceiptNumber,
      status: 'pledged',
      sponsorPerksGranted: true,
      createdAt: new Date().toISOString()
    };

    setData((prev: any) => ({
      ...prev,
      proBonoPledges: [newPledge, ...(prev.proBonoPledges || [])]
    }));

    showToast('success', 'Pro-Bono Service Donated!', `Receipt #${inKindReceiptNumber} issued for $${pledgeData.estimatedFmv} FMV non-cash contribution.`);
    return newPledge;
  };

  const updateProBonoPledge = (pledgeId: string, updates: Partial<ProBonoPledge>) => {
    setData((prev: any) => ({
      ...prev,
      proBonoPledges: (prev.proBonoPledges || []).map((p: ProBonoPledge) => p.id === pledgeId ? { ...p, ...updates } : p)
    }));
    showToast('success', 'Pro-Bono Pledge Updated', 'Service details and sponsor recognition saved.');
  };

  const deleteProBonoPledge = (pledgeId: string) => {
    setData((prev: any) => ({
      ...prev,
      proBonoPledges: (prev.proBonoPledges || []).filter((p: ProBonoPledge) => p.id !== pledgeId)
    }));
    showToast('info', 'Pledge Removed', 'Pro-bono pledge record removed.');
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

  const loginWithCode = (identifier: string, code: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId || !code.trim()) {
      showToast('error', 'Verification Failed', 'Please enter your email/phone and 6-digit verification code.');
      return false;
    }

    // 1. Check if user exists with email or phone
    const existingUser = data.users.find((u: User) => 
      u.email.toLowerCase() === cleanId || 
      (u.phone && u.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
    );

    if (existingUser) {
      setData((prev: any) => ({
        ...prev,
        currentUserId: existingUser.id,
        currentOrgId: existingUser.orgId || prev.currentOrgId
      }));
      setIsAuthenticated(true);
      if (!isDemoMode) {
        localStorage.setItem(LIVE_USER_STORAGE_KEY, existingUser.id);
      }
      showToast('success', `Welcome back, ${existingUser.name}!`, 'One-time verification code confirmed.');
      return true;
    }

    // 2. Check if a registration matches email or phone
    const matchingReg = data.registrations.find((r: Registration) => 
      r.primaryEmail.toLowerCase() === cleanId || 
      r.primaryPhone.replace(/\D/g, '') === cleanId.replace(/\D/g, '')
    );

    const userName = matchingReg ? matchingReg.primaryName : (cleanId.includes('@') ? cleanId.split('@')[0] : 'Volunteer');
    const userEmail = matchingReg ? matchingReg.primaryEmail : (cleanId.includes('@') ? cleanId : `${cleanId.replace(/\D/g, '')}@volunteer.local`);
    const userPhone = matchingReg ? matchingReg.primaryPhone : cleanId;

    const newUser: User = {
      id: 'user_' + Date.now(),
      name: userName,
      email: userEmail,
      phone: userPhone,
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
    showToast('success', `Welcome, ${newUser.name}!`, 'Verified via 6-digit one-time passcode.');
    return true;
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
    showToast('success', 'Profile Saved', 'Your account information has been updated.');
  };

  const inviteTeamMember = (memberData: Omit<User, 'id'>): User => {
    const newMember: User = {
      ...memberData,
      id: 'user_' + Date.now()
    };

    const newAuditLog: AuditLog = {
      id: 'log_' + Date.now(),
      orgId: currentOrg.id,
      eventId: currentEvent.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'INVITE_TEAM_MEMBER',
      details: `Invited ${newMember.name} (${newMember.email}) with role "${newMember.role}".`,
      timestamp: new Date().toISOString()
    };

    setData((prev: any) => ({
      ...prev,
      users: [...prev.users, newMember],
      auditLogs: [newAuditLog, ...(prev.auditLogs || [])]
    }));

    showToast('success', 'Team Member Added', `Invitation sent to ${newMember.name} (${newMember.email}).`);
    return newMember;
  };

  const removeTeamMember = (userId: string) => {
    const memberToRemove = data.users.find((u: User) => u.id === userId);
    if (!memberToRemove) return;

    const newAuditLog: AuditLog = {
      id: 'log_' + Date.now(),
      orgId: currentOrg.id,
      eventId: currentEvent.id,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'REMOVE_TEAM_MEMBER',
      details: `Removed team member ${memberToRemove.name} (${memberToRemove.email}) from organization leadership.`,
      timestamp: new Date().toISOString()
    };

    setData((prev: any) => ({
      ...prev,
      users: prev.users.filter((u: User) => u.id !== userId),
      auditLogs: [newAuditLog, ...(prev.auditLogs || [])]
    }));

    showToast('info', 'Team Member Removed', `${memberToRemove.name} has been removed from organization leadership.`);
  };

  const updateTeamMember = (userId: string, updates: Partial<User>) => {
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => u.id === userId ? { ...u, ...updates } : u)
    }));
    showToast('success', 'Team Member Updated', 'Role permissions and assignments updated.');
  };

  const updateEvent = (eventId: string, updates: Partial<Event>) => {
    setData((prev: any) => ({
      ...prev,
      events: prev.events.map((e: Event) => e.id === eventId ? { ...e, ...updates } : e)
    }));
    showToast('success', 'Campaign Updated', 'Event details have been saved.');
  };

  const deleteEvent = (eventId: string) => {
    setData((prev: any) => {
      const remainingEvents = prev.events.filter((e: Event) => e.id !== eventId);
      const nextEventId = remainingEvents[0]?.id || prev.currentEventId;
      return {
        ...prev,
        events: remainingEvents,
        subParts: prev.subParts.filter((sp: SubPart) => sp.eventId !== eventId),
        shifts: prev.shifts.filter((s: Shift) => s.eventId !== eventId),
        itemSlots: prev.itemSlots.filter((i: ItemSlot) => i.eventId !== eventId),
        ticketTiers: prev.ticketTiers.filter((t: TicketTier) => t.eventId !== eventId),
        registrations: prev.registrations.filter((r: Registration) => r.eventId !== eventId),
        donations: prev.donations.filter((d: Donation) => d.eventId !== eventId),
        currentEventId: nextEventId
      };
    });
    showToast('info', 'Event Removed', 'Campaign and its associated records have been deleted.');
  };

  const addVolunteer = (volunteer: Omit<VolunteerCrmRecord, 'id' | 'orgId' | 'lifetimeHours' | 'lifetimeDonations' | 'eventsParticipated' | 'attendanceRate' | 'lastActive'> & { lifetimeHours?: number; lifetimeDonations?: number }): VolunteerCrmRecord => {
    const newVol: VolunteerCrmRecord = {
      id: 'vol_' + Date.now(),
      orgId: currentOrg.id,
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      birthDate: volunteer.birthDate,
      lifetimeHours: volunteer.lifetimeHours || 0,
      lifetimeDonations: volunteer.lifetimeDonations || 0,
      eventsParticipated: 0,
      attendanceRate: 100,
      skills: volunteer.skills || [],
      tags: volunteer.tags || ['New Supporter'],
      lastActive: new Date().toISOString(),
      notes: volunteer.notes || '',
      importanceRank: volunteer.importanceRank || 'New Supporter',
      eventHistory: []
    };
    setData((prev: any) => ({
      ...prev,
      volunteerCrm: [newVol, ...prev.volunteerCrm]
    }));
    showToast('success', 'Supporter Added', `${newVol.name} added to volunteer CRM.`);
    return newVol;
  };

  const updateVolunteer = (volunteerId: string, updates: Partial<VolunteerCrmRecord>) => {
    setData((prev: any) => ({
      ...prev,
      volunteerCrm: prev.volunteerCrm.map((v: VolunteerCrmRecord) => v.id === volunteerId ? { ...v, ...updates } : v)
    }));
    showToast('success', 'Contact Updated', 'Volunteer CRM record has been updated.');
  };

  const deleteVolunteer = (volunteerId: string) => {
    setData((prev: any) => ({
      ...prev,
      volunteerCrm: prev.volunteerCrm.filter((v: VolunteerCrmRecord) => v.id !== volunteerId)
    }));
    showToast('info', 'Contact Removed', 'Volunteer profile has been removed from CRM.');
  };

  const deleteAnnouncement = (announcementId: string) => {
    setData((prev: any) => ({
      ...prev,
      announcements: prev.announcements.filter((a: Announcement) => a.id !== announcementId)
    }));
    showToast('info', 'Announcement Deleted', 'Broadcast announcement removed.');
  };

  const deleteDonation = (donationId: string) => {
    setData((prev: any) => ({
      ...prev,
      donations: prev.donations.filter((d: Donation) => d.id !== donationId)
    }));
    showToast('info', 'Donation Voided', 'Donation contribution record has been removed.');
  };

  const addVolunteerTag = (volunteerId: string, tag: string) => {
    setData((prev: any) => ({
      ...prev,
      volunteerCrm: prev.volunteerCrm.map((v: VolunteerCrmRecord) => {
        if (v.id === volunteerId && !v.tags.includes(tag)) {
          return { ...v, tags: [...v.tags, tag] };
        }
        return v;
      })
    }));
    showToast('success', 'Tag Added', `Tag "${tag}" assigned to volunteer.`);
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
    showToast('success', 'Notes Saved', 'Internal volunteer notes updated.');
  };

  return (
    <AppContext.Provider value={{
      currentOrg,
      currentEvent,
      currentUser,
      activeRole: currentUser.role,
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
      contractors: data.contractors || SEED_CONTRACTORS,
      proBonoPledges: data.proBonoPledges || SEED_PRO_BONO_PLEDGES,
      toasts,
      switchRole,
      switchOrganization,
      switchEvent,
      createOrganization,
      createEvent,
      updateEvent,
      deleteEvent,
      claimSlotsAndRegister,
      cancelRegistration,
      toggleCheckIn,
      toggleItemPledgeReceived,
      updateOrganizationBranding,
      addSubPart,
      updateSubPart,
      deleteSubPart,
      addShift,
      updateShift,
      deleteShift,
      addItemSlot,
      updateItemSlot,
      deleteItemSlot,
      createTicketTier,
      updateTicketTier,
      deleteTicketTier,
      reorderTicketTiers,
      requestBudgetIncrease,
      approveRequest,
      rejectRequest,
      submitVendorApplication,
      updateVendorApplication,
      approveVendor,
      rejectVendor,
      addContractor,
      updateContractor,
      deleteContractor,
      pledgeProBonoService,
      updateProBonoPledge,
      deleteProBonoPledge,
      addWaiverTemplate,
      updateWaiverTemplate,
      deleteWaiverTemplate,
      postAnnouncement,
      deleteAnnouncement,
      recordDirectDonation,
      deleteDonation,
      login,
      loginWithCode,
      registerUser,
      logout,
      resetPassword,
      updateUserProfile,
      inviteTeamMember,
      updateTeamMember,
      removeTeamMember,
      addVolunteer,
      updateVolunteer,
      deleteVolunteer,
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
