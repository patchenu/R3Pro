// Core Domain Types for Honeycomb Booster & PTA Event Lifecycle Hub

export type LifecyclePhase = 'planning' | 'setup' | 'hosting' | 'cleanup' | 'wrapup';

export type EventStatus = 
  | 'draft_unclaimed' 
  | 'planning' 
  | 'setup' 
  | 'hosting' 
  | 'cleanup' 
  | 'wrapped_up';

export type EventPrivacy = 'public' | 'private';

export interface EventGoals {
  purpose: string;
  communityImpact: string;
  fundraisingTarget: number;
  fundsRaised: number;
}

export interface HoneycombEvent {
  id: string;
  name: string;
  organizationName: string;
  location: string;
  date: string;              // YYYY-MM-DD
  startTime: string;         // HH:MM
  lengthHours: number;
  privacy: EventPrivacy;
  accessCode?: string;       // e.g. "4921" for private events
  status: EventStatus;
  currentPhase: LifecyclePhase;
  
  // Registration origin
  registeredByRole: 'organizer' | 'volunteer';
  registeredByName: string;
  registeredByEmail: string;
  registeredByPhone?: string;
  
  // Formal organizer details
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string;
  isClaimed: boolean;
  claimToken?: string;
  
  // Lifecycle Goals
  goals: EventGoals;
  createdAt: string;
}

export type NeedType = 'equipment' | 'money' | 'volunteer';
export type NeedAssignmentStatus = 'unassigned' | 'pending' | 'confirmed' | 'delivered' | 'declined';

export interface NeedAssignment {
  name: string;            // e.g. "Minh"
  email: string;
  phone?: string;
  assignedAt: string;
  status: NeedAssignmentStatus;
  confirmationToken: string;
  confirmedAt?: string;
  declinedAt?: string;
  notes?: string;
  reminderSentAt?: string;
}

export interface SupportNeed {
  id: string;
  eventId: string;
  type: NeedType;
  title: string;           // e.g. "6-ft Folding Table", "10x10 Pop-Up Tent", "Referee Whistles"
  details: string;         // e.g. "Heavy duty table for registration gate"
  dueDate: string;         // YYYY-MM-DD
  dueTime: string;         // HH:MM
  quantityNeeded: number;
  quantityFulfilled: number;
  unit: string;            // "tables", "coolers", "dollars", "spots"
  estimatedFmv?: number;   // Fair Market Value for IRS In-Kind acknowledgement
  assignedTo?: NeedAssignment;
  fallbackOption: 'alert_organizer' | 'auto_public_wishlist' | 'both';
  dutyCategory?: DutyCategory;
}

export type DutyCategory = 
  | 'check_in' 
  | 'security' 
  | 'cleanup' 
  | 'deliveries' 
  | 'concessions' 
  | 'scorekeeping' 
  | 'setup' 
  | 'other';

export interface DutyCategoryDef {
  id: DutyCategory;
  label: string;
  icon: string;
  description: string;
}

export const DUTY_CATEGORIES: DutyCategoryDef[] = [
  { id: 'check_in', label: 'Check-In & Welcome', icon: '🎫', description: 'Hand out wristbands, greet guests' },
  { id: 'concessions', label: 'Snack Bar & Concessions', icon: '🍿', description: 'Serve snacks, drinks, and food' },
  { id: 'setup', label: 'Field & Event Setup', icon: '🔨', description: 'Put up tents, layout tables and equipment' },
  { id: 'scorekeeping', label: 'Scorekeeping & Timers', icon: '⏱️', description: 'Manage game clock and scorebook' },
  { id: 'deliveries', label: 'Deliveries & Errands', icon: '🚚', description: 'Transport ice, water, equipment' },
  { id: 'security', label: 'Safety & Crowd Help', icon: '🛡️', description: 'Monitor gates, parking & student safety' },
  { id: 'cleanup', label: 'Post-Event Clean Up', icon: '🧹', description: 'Trash pickup, pack up tents and gear' },
  { id: 'other', label: 'General Helper', icon: '✨', description: 'Float where needed, support leads' }
];

export type ComplianceType = 
  | 'none' 
  | 'safesport' 
  | 'lausd_tier2' 
  | 'servsafe' 
  | 'cpr_firstaid' 
  | 'custom';

export interface ComplianceRequirement {
  type: ComplianceType;
  title: string;
  badge: string;
  description: string;
  requiresUploadOrId: boolean; // Option B Audit-Ready
  customTitle?: string;
}

export const STANDARD_COMPLIANCE: Record<ComplianceType, ComplianceRequirement> = {
  none: {
    type: 'none',
    title: 'Open to Anyone',
    badge: '🌱',
    description: 'No special clearance required (Students & Parents welcome)',
    requiresUploadOrId: false
  },
  safesport: {
    type: 'safesport',
    title: 'USA SafeSport Certified',
    badge: '🛡️',
    description: 'Youth athlete safety & abuse prevention certification',
    requiresUploadOrId: true
  },
  lausd_tier2: {
    type: 'lausd_tier2',
    title: 'School District / LAUSD Volunteer Tier II',
    badge: '🏫',
    description: 'Fingerprint LiveScan and TB test clearance on file',
    requiresUploadOrId: true
  },
  servsafe: {
    type: 'servsafe',
    title: 'Food Safety / ServSafe',
    badge: '🧑‍🍳',
    description: 'Food handler or manager food safety certification',
    requiresUploadOrId: true
  },
  cpr_firstaid: {
    type: 'cpr_firstaid',
    title: 'First Aid / CPR Certified',
    badge: '🩹',
    description: 'Current emergency resuscitation & first aid certification',
    requiresUploadOrId: true
  },
  custom: {
    type: 'custom',
    title: 'Custom Requirement',
    badge: '⭐',
    description: 'Special credential specified by the organizer',
    requiresUploadOrId: true
  }
};

export interface Shift {
  id: string;
  eventId: string;
  title: string;
  dutyCategory: DutyCategory;
  startTime: string;       // HH:MM
  endTime: string;         // HH:MM
  reportLocation: string;  // e.g. "Gate 2 Visitor Entrance"
  dutiesDescription: string;
  capacity: number;
  filledCount: number;
  compliance: ComplianceRequirement;
}

export interface VolunteerRegistration {
  id: string;
  shiftId: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  isMinor: boolean;
  age?: number;
  parentName?: string;
  magicPassToken: string;
  complianceProof?: {
    credentialId?: string;
    documentName?: string;
    isVerified: boolean;
    verifiedByOrganizer?: boolean;
    verifiedAt?: string;
  };
  checkInStatus: 'pending' | 'checked_in' | 'no_show';
  checkedInAt?: string;
  hoursCompleted: number;
  hoursVerified: boolean;
  notes?: string;
  registeredAt: string;
}

export interface DirectDonation {
  id: string;
  eventId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  date: string;
  isConfirmed: boolean;
  taxReceiptNumber: string;
  taxLetterSent: boolean;
}

export interface EventOutcomesSummary {
  totalHoursServed: number;
  verifiedHoursCount: number;
  volunteersCount: number;
  totalFundsRaised: number;
  equipmentNeedsMetRatio: number; // 0 to 1
  communityGoalsMet: boolean;
  studentCertificatesIssued: number;
  irsLettersIssued: number;
}
