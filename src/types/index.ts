export type OrganizationType = 'school_pta' | 'non_profit' | 'youth_sports' | 'church_faith' | 'corporate_giving' | 'other';

export type UserRole = 'org_admin' | 'event_planner' | 'committee_lead' | 'vendor' | 'volunteer' | 'kiosk';

export interface OrgMembership {
  orgId: string;
  orgName: string;
  role: UserRole;
  assignedEventIds?: string[];
  assignedSubPartIds?: string[];
  invitedAt?: string;
  status: 'active' | 'pending_invite' | 'inactive';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  orgId: string;
  avatarUrl?: string;
  assignedSubPartIds?: string[]; // IDs of sub-parts this lead is responsible for
  memberships?: OrgMembership[]; // Multi-tenant role memberships
  isRegisteredUser?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  ein: string;
  contactEmail: string;
  phone: string;
  address: string;
  logoUrl: string;
  primaryColor: string;
  website?: string;
  signatoryOfficerName?: string;
  signatoryOfficerTitle?: string;
  signatorySignatureUrl?: string;
  volunteerCount: number;
  totalFundsRaised: number;
  settings: {
    defaultCurrency: string;
    approvalThresholdBudget: number; // e.g., $250
    approvalThresholdSlots: number;  // e.g., 5 spots
    defaultReminderCadence: 'standard' | 'intensive' | 'same_day' | 'custom';
  };
}

export type EventStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'archived';

export interface EventTheme {
  id: string;
  name: string;
  primaryColor: string; // Tailwind color class or hex
  accentColor: string;
  bgGradient: string;
}

export interface Event {
  id: string;
  orgId: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  startDate: string; // ISO String
  endDate: string;   // ISO String
  venueName: string;
  venueAddress: string;
  mapUrl?: string;
  isVirtual: boolean;
  virtualLink?: string;
  coverImageUrl: string;
  theme: EventTheme;
  fundraisingGoal: number;
  totalRaised: number;
  currency: string;
  status: EventStatus;
  approvalThresholdBudget: number;
  approvalThresholdSlots: number;
  reminderCadence: 'standard' | 'intensive' | 'same_day' | 'custom';
  allowFeeCoverage: boolean;
  subPartIds: string[];
}

export interface SubPart {
  id: string;
  eventId: string;
  name: string;
  category: 'labor_setup' | 'hospitality_food' | 'vendors_sponsors' | 'auction_fundraising' | 'registration_greeters' | 'other';
  leadUserId: string;
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  leadRadioChannel?: string;
  reportingGate: string;
  dressCodeNotes: string;
  suppliesNotes?: string;
  budgetAllocated: number;
  budgetSpent: number;
  shiftIds: string[];
  itemSlotIds: string[];
}

export interface Shift {
  id: string;
  subPartId: string;
  eventId: string;
  title: string;
  description: string;
  startTime: string; // e.g. "2026-09-15T08:00:00"
  endTime: string;   // e.g. "2026-09-15T11:00:00"
  capacity: number;
  claimedCount: number;
  minAge?: number;
  skillsRequired?: string[];
  requiresWaiver: boolean;
  waiverTemplateId?: string;
  isApproved: boolean; // For variable threshold queue
  reportingLocationOverride?: string;
}

export interface ItemSlot {
  id: string;
  subPartId: string;
  eventId: string;
  itemName: string;
  category: string;
  quantityNeeded: number;
  quantityPledged: number;
  unit: string; // e.g. "packs", "boxes", "tables", "trays"
  dropOffLocation: string;
  dropOffDeadline: string;
  estimatedFmvPerUnit?: number;
}

export type TicketType = 'admission_ticket' | 'vendor_booth' | 'sponsor_package' | 'raffle';

export interface TicketTier {
  id: string;
  eventId: string;
  title: string;
  type: TicketType;
  price: number;
  fairMarketValue: number; // For IRS tax deduction offset calculation
  capacity: number;
  claimedCount: number;
  instantCheckout: boolean; // false = requires lead review
  description: string;
  perks: string[];
  boothDimensions?: string; // For vendors e.g. "10x10" or "Food Truck"
  powerProvided?: boolean;
}

export interface GroupMember {
  id: string;
  registrationId: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: 'Self' | 'Child' | 'Spouse' | 'Team Member' | 'Friend';
  isMinor: boolean;
  age?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dietaryNotes?: string;
}

export interface SignedWaiver {
  id: string;
  registrationId: string;
  groupMemberId: string;
  waiverTemplateId: string;
  waiverTitle: string;
  waiverText: string;
  signerName: string;
  signerRelationship: string;
  signatureData: string; // Drawn canvas base64 or typed name
  signedAt: string; // ISO date
  ipAddress: string;
  isVerifiedAtDoor: boolean;
}

export interface Registration {
  id: string;
  eventId: string;
  primaryName: string;
  primaryEmail: string;
  primaryPhone: string;
  manageToken: string; // 256-bit high entropy token
  createdAt: string;
  status: 'confirmed' | 'cancelled';
  notes?: string;
  members: GroupMember[];
  shiftClaims: {
    shiftId: string;
    groupMemberId: string;
    checkedIn: boolean;
    checkedInAt?: string;
    checkedInBy?: string;
  }[];
  itemPledges: {
    itemSlotId: string;
    quantity: number;
    delivered: boolean;
    deliveredAt?: string;
    receivedBy?: string;
    donorNotes?: string;
    estimatedFmv?: number;
    inKindReceiptNumber?: string;
  }[];
  ticketPurchases: {
    ticketTierId: string;
    quantity: number;
    boothAssignedNumber?: string;
  }[];
  donations: {
    amount: number;
    feeCovered: boolean;
    totalPaid: number;
    isAnonymous: boolean;
    taxReceiptNumber: string;
  }[];
  waivers: SignedWaiver[];
}

export interface WaitlistEntry {
  id: string;
  shiftId: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  position: number;
  status: 'waiting' | 'promoted' | 'cancelled';
  createdAt: string;
  promotedAt?: string;
}

export interface Donation {
  id: string;
  eventId: string;
  subPartId?: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  feeCoveredByDonor: boolean;
  paymentMethod: 'stripe_card' | 'paypal' | 'apple_pay' | 'invoice_net30' | 'cash_check';
  paymentStatus: 'completed' | 'pending_invoice' | 'refunded';
  isAnonymous: boolean;
  taxReceiptNumber: string;
  deductibleAmount: number; // Gross minus FMV
  createdAt: string;
}

export interface VendorApplication {
  id: string;
  eventId: string;
  ticketTierId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  einTaxId: string;
  website?: string;
  electricityNeeded: 'none' | '110v_standard' | '220v_heavy' | 'self_generator';
  spaceRequirement: string;
  coiPolicyNumber?: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'paid';
  assignedBoothNumber?: string; // e.g. "Booth #A-14", "Food Truck Spot #2"
  invoiceNumber?: string;
  submittedAt: string;
}

export interface ApprovalRequest {
  id: string;
  eventId: string;
  subPartId: string;
  subPartName: string;
  requestedByUserId: string;
  requestedByName: string;
  type: 'budget_increase' | 'shift_addition' | 'vendor_approval';
  title: string;
  description: string;
  amountOrCount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  payload?: any;
}

export interface VolunteerCrmRecord {
  id: string;
  orgId: string;
  name: string;
  email: string;
  phone: string;
  lifetimeHours: number;
  lifetimeDonations: number;
  eventsParticipated: number;
  attendanceRate: number; // 0 - 100%
  skills: string[];
  tags: string[]; // e.g. "VIP Donor", "Certified First Aid", "Reliable Driver"
  lastActive: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  eventId: string;
  subPartId?: string; // null = all event
  subPartName?: string;
  senderName: string;
  senderRole: string;
  title: string;
  message: string;
  urgency: 'normal' | 'important' | 'urgent_emergency';
  channel: 'in_app' | 'sms_simulated' | 'email_simulated' | 'all';
  sentAt: string;
}

export interface WaiverTemplate {
  id: string;
  orgId: string;
  title: string;
  type: 'minor_consent' | 'general_liability' | 'food_safety' | 'photo_media';
  content: string;
  requiresMinorParentSignature: boolean;
  requiresEmergencyContact: boolean;
}

export interface AuditLog {
  id: string;
  orgId: string;
  eventId?: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
