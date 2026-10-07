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
  isAppAdmin?: boolean; // Global Platform Superuser flag (distinct from organization roles)
  isRegisteredUser?: boolean;
  accountStatus?: 'active' | 'suspended' | 'pending_verification';
  lastLoginAt?: string;
  lastIpAddress?: string;
  loginCount?: number;
  twoFactorEnabled?: boolean;
  suspensionReason?: string;
  createdAt?: string;
}

export interface OrgCommunicationDnsRecord {
  type: 'TXT' | 'CNAME' | 'MX';
  name: string;
  value: string;
  status: 'verified' | 'pending' | 'failed';
  purpose: 'DKIM' | 'SPF' | 'DMARC' | 'Return-Path';
  priority?: number;
}

export interface OrgCommunicationSettings {
  // Email Dispatch Settings
  emailDeliveryMode: 'managed' | 'custom_domain'; // 'managed' = R3Pro Shared Cloud Pool (Default), 'custom_domain' = Custom Domain
  customSendingDomain?: string; // e.g. "mail.lincolnpta.org"
  customFromName?: string; // e.g. "Lincoln High PTA Events"
  customFromEmail?: string; // e.g. "events@mail.lincolnpta.org"
  customReplyTo?: string; // e.g. "treasurer@lincolnpta.org"
  emailProvider: 'resend' | 'postmark' | 'ses' | 'smtp' | 'managed';
  emailApiKey?: string;
  dnsVerified?: boolean;
  dnsRecords?: OrgCommunicationDnsRecord[];
  
  // SMS 10DLC Gateway Settings
  smsDeliveryMode: 'managed_10dlc' | 'dedicated_10dlc'; // 'managed_10dlc' = R3Pro ISV Shared Campaign, 'dedicated_10dlc' = Dedicated Brand Number
  smsBrandPrefix: string; // e.g. "[Lincoln High PTA]"
  smsDedicatedNumber?: string; // e.g. "+1 (555) 234-8900"
  smsCadenceT72h: boolean; // 72 Hours Prior
  smsCadenceT24h: boolean; // 24 Hours Prior
  smsCadenceT2h: boolean; // 2 Hours Prior (with Gate QR Pass)
  smsEmergencyBroadcasts: boolean; // Urgent alerts
  smsTaxReceipts: boolean; // Real-time donation receipts
  smsOptInStatus: boolean; // Active 10DLC compliance toggle
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
  communicationSettings?: OrgCommunicationSettings;
  isProvisional?: boolean;
  claimStatus?: 'unclaimed_provisional' | 'claimed_active';
  organizerClaimToken?: string;
}

export type EventStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'archived';

export type EventVisibility = 'public' | 'restricted' | 'private';

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
  eventKey: string; // Unique human-readable code e.g. "EVT-2026-Q3-01"
  title: string;
  slug: string;
  tagline: string;
  description: string;
  tags?: string[]; // e.g. ["Family Friendly", "STEM", "Bake Sale"]
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
  dressCode?: string; // Global Event Volunteer Dress Code / Baseline Attire
  subPartIds: string[];
  
  // 3-Tier Visibility & Gated Access Controls
  visibility?: EventVisibility; // 'public' (default) | 'restricted' (application required) | 'private' (passcode/invite only)
  accessCode?: string; // e.g. "VIP2026" for private events
  screeningRequired?: boolean; // If true for restricted events
  screeningQuestions?: string[]; // e.g. ["Are you certified in First Aid?", "Prior volunteer experience?"]
  
  // Grassroots / Unlisted Event Creation on behalf of Organizer
  isProvisional?: boolean;
  claimStatus?: 'unclaimed_provisional' | 'claimed_active' | 'rejected';
  organizerClaimToken?: string; // 256-bit token for organizer verification link
  nominatedByVolunteer?: {
    name: string;
    email: string;
    phone?: string;
    roleClaimed: string;
    hoursServed: number;
    serviceDate: string;
    proofNotes?: string;
    nominatedAt: string;
  };
  organizerContact?: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
    organizationName?: string;
  };
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

export type ShiftDutyCategory = 
  | 'check_in' 
  | 'security_crowd' 
  | 'clean_up_teardown' 
  | 'deliveries_transport' 
  | 'food_hospitality' 
  | 'labor_setup' 
  | 'kids_games' 
  | 'first_aid_safety' 
  | 'ticket_sales' 
  | 'info_guiding' 
  | 'other';

export interface Shift {
  id: string;
  subPartId: string;
  eventId: string;
  title: string;
  description: string;
  dutyCategory?: ShiftDutyCategory;
  startTime: string; // e.g. "2026-09-15T08:00:00"
  endTime: string;   // e.g. "2026-09-15T11:00:00"
  capacity: number;
  claimedCount: number;
  minAge?: number;
  skillsRequired?: string[];
  complianceRequirements?: string[]; // Standard compliance (e.g. "USA SafeSport", "LAUSD Tier II", "ServSafe")
  requiresWaiver: boolean;
  waiverTemplateId?: string;
  isApproved: boolean; // For variable threshold queue
  reportingLocationOverride?: string;
}

export type SupportNeedType = 'equipment' | 'financial' | 'volunteer' | 'supplies' | 'custom_service';
export type NeedAssignmentStatus = 'unassigned' | 'pending_confirmation' | 'confirmed' | 'delivered' | 'declined';

export interface NeedAssignment {
  assignedToName: string;
  assignedToEmail: string;
  assignedToPhone?: string;
  assignedAt: string;
  status: NeedAssignmentStatus;
  confirmationToken: string;
  dueDate?: string;
  confirmedAt?: string;
  confirmationNotes?: string;
  reminderSentAt?: string;
}

export interface ItemSlot {
  id: string;
  subPartId: string;
  eventId: string;
  itemName: string;
  category: string;
  needType?: SupportNeedType;
  quantityNeeded: number;
  quantityPledged: number;
  unit: string; // e.g. "packs", "boxes", "tables", "trays"
  dropOffLocation: string;
  dropOffDeadline: string;
  estimatedFmvPerUnit?: number;
  assignedTo?: NeedAssignment;
  reminderCadence?: 'standard' | 'intensive' | 'same_day';
}

export const DUTY_CATEGORIES: { id: ShiftDutyCategory; label: string; description: string; icon: string }[] = [
  { id: 'check_in', label: 'Check-In & Greeters', description: 'Welcome attendees, scan passes, distribute wristbands', icon: '🎫' },
  { id: 'food_hospitality', label: 'Food & Hospitality', description: 'Food prep, snack stations, hydration booths, dining area', icon: '🍔' },
  { id: 'labor_setup', label: 'Labor & Setup', description: 'Staging, canopy tents, tables, heavy equipment layout', icon: '🔨' },
  { id: 'security_crowd', label: 'Security & Crowd Control', description: 'Gate monitoring, perimeter watch, parking assistance', icon: '🛡️' },
  { id: 'clean_up_teardown', label: 'Clean-Up & Teardown', description: 'Waste management, breakdown of tents/tables, venue restoration', icon: '🧹' },
  { id: 'deliveries_transport', label: 'Deliveries & Transport', description: 'Item pickup, loading/unloading supplies, campus dispatch', icon: '🚚' },
  { id: 'kids_games', label: 'Kids, Arts & Games', description: 'Carnival booths, face painting, bounce house monitor', icon: '🎨' },
  { id: 'first_aid_safety', label: 'First Aid & Safety Station', description: 'First aid tent, emergency hydration, lost child desk', icon: '🩺' },
  { id: 'ticket_sales', label: 'Ticket & Merchandise Sales', description: 'Raffle sales, admission desk, donation box collection', icon: '🎟️' },
  { id: 'info_guiding', label: 'Information & Guiding', description: 'Directions, schedule questions, VIP escort', icon: '📣' },
  { id: 'other', label: 'General Operations', description: 'Ad-hoc support and coordinator floating', icon: '⚡' }
];

export const STANDARD_COMPLIANCE_REQUIREMENTS = [
  { id: 'open_all', name: 'Open to Anyone', category: 'General', badge: '🌱', description: 'No special clearance required' },
  { id: 'safesport', name: 'USA SafeSport Certified', category: 'Youth Safety', badge: '🛡️', description: 'Minor athlete abuse prevention training' },
  { id: 'lausd_tier2', name: 'School District / LAUSD Volunteer Tier II', category: 'Education', badge: '🏫', description: 'LiveScan fingerprint & TB risk assessment clearance' },
  { id: 'livescan_bg', name: 'LiveScan Background Check', category: 'Background Check', badge: '🔍', description: 'State/DOJ criminal background verification' },
  { id: 'servsafe', name: 'ServSafe / Food Safety Certified', category: 'Food Safety', badge: '🧑‍🍳', description: 'Commercial food handling and prep safety certificate' },
  { id: 'cpr_firstaid', name: 'Red Cross First Aid / CPR / AED', category: 'Medical & Safety', badge: '🩹', description: 'Current emergency resuscitation & first aid certification' },
  { id: 'driver_license', name: 'Valid Driver License & Auto Insurance', category: 'Transport', badge: '🚗', description: 'Clean DMV record and active vehicle liability coverage' },
  { id: 'heavy_lifting', name: 'Heavy Lifting (25+ lbs)', category: 'Physical', badge: '📦', description: 'Ability to safely lift and carry folding tables, pop-ups, coolers' },
  { id: 'adult_18_plus', name: 'Adult Volunteer Only (18+)', category: 'Age Requirement', badge: '🔞', description: 'Must be 18 years of age or older' }
];

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
  birthDate?: string; // YYYY-MM-DD for birthday milestone emails & automated age calculation
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

export type ParticipantVerificationStatus = 
  | 'unverified' 
  | 'identity_verified' 
  | 'waiver_compliant' 
  | 'attended_verified' 
  | 'supervisor_signed' 
  | 'flagged_review';

export interface Registration {
  id: string;
  eventId: string;
  primaryName: string;
  primaryEmail: string;
  primaryPhone: string;
  birthDate?: string; // YYYY-MM-DD
  manageToken: string; // 256-bit high entropy token
  createdAt: string;
  status: 'confirmed' | 'pending_review' | 'cancelled';
  notes?: string;
  screeningAnswers?: { question: string; answer: string }[];
  members: GroupMember[];
  shiftClaims: {
    shiftId: string;
    groupMemberId: string;
    checkedIn: boolean;
    checkedInAt?: string;
    checkedInBy?: string;
    
    // 4-Pillar Participant Verification
    verificationStatus?: ParticipantVerificationStatus;
    verifiedByUserId?: string;
    verifiedByName?: string;
    verifiedAt?: string;
    verificationNotes?: string;
    serviceHoursAwarded?: number;
    certificateNumber?: string;
    supervisorSignatureData?: string;
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
  coiCarrierName?: string;
  coiExpirationDate?: string;
  coiDocumentName?: string;
  coiDocumentData?: string; // Base64 Data URL or document path
  coiStatus?: 'not_submitted' | 'pending_verification' | 'verified' | 'expired';
  status: 'pending_review' | 'approved' | 'rejected' | 'paid';
  assignedBoothNumber?: string; // e.g. "Booth #A-14", "Food Truck Spot #2"
  invoiceNumber?: string;
  taxReceiptNumber?: string;
  paymentMethod?: 'stripe_card' | 'ach_transfer' | 'check_net30' | 'offline_cash';
  paidAt?: string;
  logoUrl?: string;
  tagline?: string;
  submittedAt: string;
}

export interface VendorInquiry {
  id: string;
  eventId: string;
  vendorAppId?: string;
  businessName: string;
  authorName: string;
  category: 'logistics_loadin' | 'electrical_power' | 'booth_placement' | 'tax_payment' | 'general';
  question: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  isPublicFaq: boolean;
  createdAt: string;
}

export interface VendorLead {
  id: string;
  eventId: string;
  vendorAppId: string;
  businessName: string;
  attendeeName: string;
  email: string;
  phone?: string;
  companyOrRole?: string;
  interestTier: 'hot' | 'warm' | 'vip';
  notes?: string;
  capturedAt: string;
}

export interface VendorAddOn {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'furniture' | 'shelter' | 'power' | 'placement' | 'marketing';
  iconName: string;
}

export interface VendorAddOnOrder {
  id: string;
  vendorAppId: string;
  eventId: string;
  addOnId: string;
  addOnTitle: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'paid' | 'pending';
  orderedAt: string;
}

export interface CorporateSeasonPass {
  id: string;
  orgId: string;
  sponsorName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  einTaxId: string;
  fiscalYear: string; // e.g. "2026-2027"
  tierName: string; // e.g. "Premier Community Underwriter"
  bundledEventIds: string[];
  bundledEventTitles: string[];
  grossAmount: number;
  discountPercent: number; // e.g. 15 for 15% off
  netPaid: number;
  status: 'active' | 'pending_payment';
  taxReceiptNumber: string;
  perksSummary: string[];
  logoUrl?: string;
  createdAt: string;
}

export interface EventImpactMetrics {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  totalAttendeesEstimated: number;
  familiesEngaged: number;
  totalDollarsRaised: number;
  fundraisingGoal: number;
  goalAchievementPercent: number;
  studentVolunteersEngaged: number;
  totalVolunteerHoursLogged: number;
  digitalProgramImpressions: number;
  mainStageScreenRotations: number;
  boothFootTrafficAverage: number;
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

export interface VolunteerEventHistory {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  rolesServed: string[];
  hoursContributed: number;
  itemsDonated?: string[];
  amountDonated?: number;
  eventOutcomeRaised?: number;
  verifiedBy?: string;
}

export interface VolunteerCrmRecord {
  id: string;
  orgId: string;
  name: string;
  email: string;
  phone: string;
  birthDate?: string; // YYYY-MM-DD
  lifetimeHours: number;
  lifetimeDonations: number;
  eventsParticipated: number;
  attendanceRate: number; // 0 - 100%
  skills: string[];
  tags: string[]; // e.g. "VIP Donor", "Certified First Aid", "Reliable Driver", "Parent Volunteer"
  lastActive: string;
  notes?: string;
  importanceRank?: 'Tier 1 Key Pillar' | 'Tier 2 Dedicated Core' | 'Tier 3 Active Contributor' | 'New Supporter';
  eventHistory?: VolunteerEventHistory[];
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

export type ContractorPaymentStatus = 'draft' | 'contract_signed' | 'invoice_received' | 'paid_in_full';

export interface PaidContractor {
  id: string;
  eventId: string;
  subPartId: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceCategory: string; // 'Audio / Visual & DJ' | 'Security & Safety' | 'Tent & Equipment Rental' | 'Waste & Sanitation' | 'Catering & Hospitality' | 'Entertainment & Performers' | 'Other'
  contractAmount: number;
  w9Received: boolean;
  coiReceived: boolean;
  paymentStatus: ContractorPaymentStatus;
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface ProBonoPledge {
  id: string;
  eventId: string;
  subPartId?: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  serviceCategory: string;
  serviceDescription: string;
  estimatedFmv: number; // Fair market value for IRS 501(c)(3) deduction
  inKindReceiptNumber: string;
  status: 'pledged' | 'verified_delivered';
  sponsorPerksGranted: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// Observability, Sentry Diagnostics & Performance Types
// ----------------------------------------------------

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';
export type ErrorResolutionStatus = 'unresolved' | 'investigating' | 'resolved' | 'ignored';

export interface ErrorBreadcrumb {
  timestamp: string;
  category: 'ui_click' | 'navigation' | 'api_request' | 'state_change' | 'console';
  message: string;
  level?: string;
  data?: Record<string, any>;
}

export interface ErrorLogRecord {
  id: string;
  severity: ErrorSeverity;
  message: string;
  timestamp: string;
  component?: string;
  stackTrace?: string;
  status: ErrorResolutionStatus;
  userContext?: {
    userId: string;
    userName: string;
    role: UserRole;
    orgId: string;
  };
  deviceContext?: {
    browser: string;
    os: string;
    screenResolution: string;
    userAgent: string;
  };
  breadcrumbs?: ErrorBreadcrumb[];
  occurrencesCount: number;
  lastSeenAt: string;
}

export interface WebVitalsMetrics {
  lcp: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor'; threshold: number };
  inp: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor'; threshold: number };
  cls: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor'; threshold: number };
  fcp: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor'; threshold: number };
  ttfb: { value: number; unit: string; rating: 'good' | 'needs-improvement' | 'poor'; threshold: number };
}

export interface ApiLatencyMetric {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  requestsPerSec: number;
  errorRatePercent: number;
  status: 'healthy' | 'degraded' | 'down';
}

export interface HealthCheckItem {
  id: string;
  name: string;
  category: 'database' | 'edge_runtime' | 'email_gateway' | 'sms_gateway' | 'queue_worker' | 'backup_storage';
  status: 'operational' | 'degraded' | 'maintenance' | 'offline';
  latencyMs: number;
  uptimePercent: number;
  lastCheckedAt: string;
  details: string;
  region?: string;
}

export interface HealthCheckSuiteStatus {
  overallStatus: 'all_systems_operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';
  lastCheckedAt: string;
  checks: HealthCheckItem[];
}
