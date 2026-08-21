import { Organization, User, Event, SubPart, Shift, ItemSlot, TicketTier, Registration, Donation, VendorApplication, ApprovalRequest, VolunteerCrmRecord, Announcement, AuditLog } from '../types';

export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: 'org_lincoln_pta',
    name: 'Lincoln High School PTA',
    type: 'school_pta',
    ein: '94-2849102',
    contactEmail: 'treasurer@lincolnpta.org',
    phone: '(555) 234-8900',
    address: '1420 Lincoln Boulevard, Springfield, IL 62704',
    website: 'https://lincolnpta.org',
    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    primaryColor: '#4f46e5',
    signatoryOfficerName: 'Elena Rostova',
    signatoryOfficerTitle: 'PTA President & Authorized Signatory',
    signatorySignatureUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&auto=format&fit=crop&q=80',
    volunteerCount: 428,
    totalFundsRaised: 48500,
    settings: {
      defaultCurrency: 'USD',
      approvalThresholdBudget: 250,
      approvalThresholdSlots: 5,
      defaultReminderCadence: 'standard'
    }
  },
  {
    id: 'org_metro_foundation',
    name: 'Metro Community Foundation',
    type: 'non_profit',
    ein: '13-5892019',
    contactEmail: 'contact@metrohope.org',
    phone: '(555) 789-1234',
    address: '500 Civic Center Plaza, Suite 400, Chicago, IL 60601',
    website: 'https://metrohope.org',
    logoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=120&auto=format&fit=crop&q=80',
    primaryColor: '#059669',
    signatoryOfficerName: 'Marcus Vance',
    signatoryOfficerTitle: 'Executive Director',
    signatorySignatureUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&auto=format&fit=crop&q=80',
    volunteerCount: 890,
    totalFundsRaised: 215000,
    settings: {
      defaultCurrency: 'USD',
      approvalThresholdBudget: 500,
      approvalThresholdSlots: 8,
      defaultReminderCadence: 'intensive'
    }
  },
  {
    id: 'org_youth_soccer',
    name: 'Springfield Youth Soccer League',
    type: 'youth_sports',
    ein: '36-9812450',
    contactEmail: 'admin@springfieldsoccer.org',
    phone: '(555) 345-6789',
    address: '88 Soccer Park Way, Springfield, IL 62705',
    website: 'https://springfieldsoccer.org',
    logoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80',
    primaryColor: '#0284c7',
    signatoryOfficerName: 'Coach Sarah Jenkins',
    signatoryOfficerTitle: 'League Commissioner',
    signatorySignatureUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=160&auto=format&fit=crop&q=80',
    volunteerCount: 310,
    totalFundsRaised: 28400,
    settings: {
      defaultCurrency: 'USD',
      approvalThresholdBudget: 200,
      approvalThresholdSlots: 4,
      defaultReminderCadence: 'standard'
    }
  }
];

export const SEED_USERS: User[] = [
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    email: 'elena@lincolnpta.org',
    phone: '(555) 234-8901',
    role: 'org_admin',
    orgId: 'org_lincoln_pta',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_marcus',
    name: 'Marcus Vance',
    email: 'marcus@lincolnpta.org',
    phone: '(555) 234-8902',
    role: 'event_planner',
    orgId: 'org_lincoln_pta',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.food@lincolnpta.org',
    phone: '(555) 234-8903',
    role: 'committee_lead',
    orgId: 'org_lincoln_pta',
    assignedSubPartIds: ['subpart_carnival_food'],
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_mike',
    name: 'Mike Alvarez',
    email: 'mike.setup@lincolnpta.org',
    phone: '(555) 234-8904',
    role: 'committee_lead',
    orgId: 'org_lincoln_pta',
    assignedSubPartIds: ['subpart_carnival_labor'],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_artisan_vendor',
    name: 'Artisan Gourmet Bakery',
    email: 'events@artisanbakes.com',
    phone: '(555) 890-1234',
    role: 'vendor',
    orgId: 'org_lincoln_pta',
    avatarUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_david_volunteer',
    name: 'David Chen',
    email: 'david.chen@gmail.com',
    phone: '(555) 456-7890',
    role: 'volunteer',
    orgId: 'org_lincoln_pta',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'user_kiosk',
    name: 'Front Door Check-In Kiosk',
    email: 'kiosk1@lincolnpta.org',
    phone: '',
    role: 'kiosk',
    orgId: 'org_lincoln_pta'
  }
];

export const SEED_EVENTS: Event[] = [
  {
    id: 'evt_fall_carnival_2026',
    orgId: 'org_lincoln_pta',
    eventKey: 'EVT-2026-Q3-001',
    title: 'Lincoln High Fall Carnival & Bake Sale 2026',
    slug: 'lincoln-fall-carnival-2026',
    tagline: 'Join 500+ families for our biggest student fundraiser of the year!',
    description: 'The annual Lincoln High PTA Carnival brings together students, families, alumni, and local businesses for an unforgettable day of carnival games, inflatable obstacle courses, homemade baked goods, food truck delicacies, and raffle prizes. All proceeds support STEM classroom equipment and student scholarships.',
    startDate: '2026-09-19T09:00:00',
    endDate: '2026-09-19T17:00:00',
    venueName: 'Lincoln High Main Field & Gymnasium',
    venueAddress: '1420 Lincoln Blvd, Springfield, IL 62704',
    mapUrl: 'https://maps.google.com/?q=Springfield+IL',
    isVirtual: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop&q=80',
    theme: {
      id: 'sunset_coral',
      name: 'Sunset Festive Coral',
      primaryColor: '#f97316',
      accentColor: '#fb923c',
      bgGradient: 'from-amber-500 to-orange-600'
    },
    fundraisingGoal: 15000,
    totalRaised: 11450,
    currency: 'USD',
    status: 'published',
    approvalThresholdBudget: 250,
    approvalThresholdSlots: 5,
    reminderCadence: 'standard',
    allowFeeCoverage: true,
    subPartIds: ['subpart_carnival_games', 'subpart_carnival_food', 'subpart_carnival_labor', 'subpart_carnival_vendors']
  },
  {
    id: 'evt_spring_stem_night_2026',
    orgId: 'org_lincoln_pta',
    eventKey: 'EVT-2026-Q4-002',
    title: 'Lincoln STEM Fair & Robotics Showcase 2026',
    slug: 'lincoln-stem-night-2026',
    tagline: 'Empowering future engineers with 30 interactive student exhibits and live robotics arena.',
    description: 'An inspiring evening celebrating science, technology, engineering, and mathematics. Students display capstone inventions, compete in live robotics arena challenges, and raise funds for high school lab upgrades.',
    startDate: '2026-11-14T17:00:00',
    endDate: '2026-11-14T21:00:00',
    venueName: 'Lincoln High Gymnasium & Tech Wing',
    venueAddress: '1420 Lincoln Blvd, Springfield, IL 62704',
    mapUrl: 'https://maps.google.com/?q=Springfield+IL',
    isVirtual: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
    theme: {
      id: 'cyber_cyan',
      name: 'Electric Tech Cyan',
      primaryColor: '#0284c7',
      accentColor: '#38bdf8',
      bgGradient: 'from-blue-600 to-cyan-800'
    },
    fundraisingGoal: 10000,
    totalRaised: 4200,
    currency: 'USD',
    status: 'published',
    approvalThresholdBudget: 300,
    approvalThresholdSlots: 6,
    reminderCadence: 'standard',
    allowFeeCoverage: true,
    subPartIds: []
  },
  {
    id: 'evt_fall_carnival_2025',
    orgId: 'org_lincoln_pta',
    eventKey: 'EVT-2025-Q3-001',
    title: 'Lincoln High Fall Carnival & Bake Sale 2025',
    slug: 'lincoln-fall-carnival-2025',
    tagline: 'Completed Campaign: Funded the Lincoln High Computer Lab & 30 New Laptops!',
    description: 'Last year\'s historic carnival that brought together 600 attendees and exceeded our initial $9,000 goal, directly funding the school\'s 30-station digital media computer lab.',
    startDate: '2025-09-20T09:00:00',
    endDate: '2025-09-20T17:00:00',
    venueName: 'Lincoln High Main Quad',
    venueAddress: '1420 Lincoln Blvd, Springfield, IL 62704',
    mapUrl: 'https://maps.google.com/?q=Springfield+IL',
    isVirtual: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&auto=format&fit=crop&q=80',
    theme: {
      id: 'sunset_coral',
      name: 'Sunset Festive Coral',
      primaryColor: '#f97316',
      accentColor: '#fb923c',
      bgGradient: 'from-amber-500 to-orange-600'
    },
    fundraisingGoal: 10000,
    totalRaised: 12200,
    currency: 'USD',
    status: 'published',
    approvalThresholdBudget: 250,
    approvalThresholdSlots: 5,
    reminderCadence: 'standard',
    allowFeeCoverage: true,
    subPartIds: []
  },
  {
    id: 'evt_spring_gala_2026',
    orgId: 'org_metro_foundation',
    eventKey: 'EVT-2026-Q4-003',
    title: 'Hope for Tomorrow: Charity Gala & Silent Auction',
    slug: 'hope-gala-2026',
    tagline: 'An elegant evening celebrating 20 years of community impact and housing advocacy.',
    description: 'Experience an extraordinary black-tie evening at the Grand Chicago Hotel Ballroom. Features a 3-course dinner prepared by Michelin-starred guest chefs, live symphony performance, and our curated auction.',
    startDate: '2026-10-24T18:00:00',
    endDate: '2026-10-24T23:30:00',
    venueName: 'Grand Chicago Ballroom',
    venueAddress: '120 S Michigan Ave, Chicago, IL 60603',
    mapUrl: 'https://maps.google.com/?q=Chicago+IL',
    isVirtual: false,
    coverImageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&auto=format&fit=crop&q=80',
    theme: {
      id: 'emerald_gala',
      name: 'Emerald Gala Prestige',
      primaryColor: '#059669',
      accentColor: '#10b981',
      bgGradient: 'from-emerald-600 to-teal-800'
    },
    fundraisingGoal: 50000,
    totalRaised: 38200,
    currency: 'USD',
    status: 'published',
    approvalThresholdBudget: 500,
    approvalThresholdSlots: 8,
    reminderCadence: 'intensive',
    allowFeeCoverage: true,
    subPartIds: []
  }
];

export const SEED_SUBPARTS: SubPart[] = [
  {
    id: 'subpart_carnival_games',
    eventId: 'evt_fall_carnival_2026',
    name: 'Game & Activity Booths',
    category: 'registration_greeters',
    leadUserId: 'user_marcus',
    leadName: 'Marcus Vance',
    leadPhone: '(555) 234-8902',
    leadEmail: 'marcus@lincolnpta.org',
    leadRadioChannel: 'Channel 1 (Main Operations)',
    reportingGate: 'Courtyard Information Desk #1',
    dressCodeNotes: 'Lincoln High Spirit T-Shirt or casual comfortable athletic wear',
    suppliesNotes: 'Ticket punchers and prize stamps provided at check-in desk.',
    budgetAllocated: 800,
    budgetSpent: 550,
    shiftIds: ['shift_carnival_ringtoss', 'shift_carnival_facepaint', 'shift_carnival_inflatable'],
    itemSlotIds: ['item_carnival_prizes', 'item_carnival_facepaint']
  },
  {
    id: 'subpart_carnival_food',
    eventId: 'evt_fall_carnival_2026',
    name: 'Concessions & Bake Sale',
    category: 'hospitality_food',
    leadUserId: 'user_sarah',
    leadName: 'Sarah Jenkins',
    leadPhone: '(555) 234-8903',
    leadEmail: 'sarah.food@lincolnpta.org',
    leadRadioChannel: 'Channel 2 (Kitchen & Hospitality)',
    reportingGate: 'Cafeteria Kitchen Servery Door (West Entrance)',
    dressCodeNotes: 'Clean white/dark shirt, apron provided, hair tied back, closed-toe shoes',
    suppliesNotes: 'Food handling gloves and sanitizing wipes provided on-site.',
    budgetAllocated: 1200,
    budgetSpent: 850,
    shiftIds: ['shift_carnival_popcorn', 'shift_carnival_bakesale', 'shift_carnival_grill'],
    itemSlotIds: ['item_carnival_brownies', 'item_carnival_cupcakes', 'item_carnival_juice']
  },
  {
    id: 'subpart_carnival_labor',
    eventId: 'evt_fall_carnival_2026',
    name: 'Labor, Setup & Logistics Crew',
    category: 'labor_setup',
    leadUserId: 'user_mike',
    leadName: 'Mike Alvarez',
    leadPhone: '(555) 234-8904',
    leadEmail: 'mike.setup@lincolnpta.org',
    leadRadioChannel: 'Channel 3 (Logistics & Facilities)',
    reportingGate: 'Gymnasium Rear Loading Dock Bay 2',
    dressCodeNotes: 'Heavy-duty closed work boots/shoes, durable pants, work gloves',
    suppliesNotes: 'Safety glasses and lifting dollies available at the dock.',
    budgetAllocated: 600,
    budgetSpent: 380,
    shiftIds: ['shift_carnival_morningsetup', 'shift_carnival_eveningcleanup'],
    itemSlotIds: ['item_carnival_trashbags', 'item_carnival_canopies']
  },
  {
    id: 'subpart_carnival_vendors',
    eventId: 'evt_fall_carnival_2026',
    name: 'Vendor Marketplace & Food Trucks',
    category: 'vendors_sponsors',
    leadUserId: 'user_elena',
    leadName: 'Elena Rostova',
    leadPhone: '(555) 234-8901',
    leadEmail: 'elena@lincolnpta.org',
    leadRadioChannel: 'Channel 1 (Main Operations)',
    reportingGate: 'East Parking Lot Vendor Check-in Gate',
    dressCodeNotes: 'Professional business casual / branded staff uniform',
    suppliesNotes: 'Electrical hookup passes distributed upon proof of COI.',
    budgetAllocated: 400,
    budgetSpent: 120,
    shiftIds: ['shift_carnival_vendor_guide'],
    itemSlotIds: []
  }
];

export const SEED_SHIFTS: Shift[] = [
  {
    id: 'shift_carnival_morningsetup',
    subPartId: 'subpart_carnival_labor',
    eventId: 'evt_fall_carnival_2026',
    title: 'Morning Canopy & Heavy Table Setup',
    description: 'Erect 15 pop-up canopies, set up 40 folding banquet tables, and run heavy-duty power extension cords.',
    startTime: '2026-09-19T07:00:00',
    endTime: '2026-09-19T09:30:00',
    capacity: 10,
    claimedCount: 8,
    minAge: 16,
    skillsRequired: ['Heavy Lifting (30+ lbs)', 'Hand Tools'],
    requiresWaiver: true,
    waiverTemplateId: 'waiver_general_liability',
    isApproved: true
  },
  {
    id: 'shift_carnival_ringtoss',
    subPartId: 'subpart_carnival_games',
    eventId: 'evt_fall_carnival_2026',
    title: 'Ring Toss & Bean Bag Game Host',
    description: 'Collect carnival tickets from students, hand game rings, and award prize tickets to players.',
    startTime: '2026-09-19T09:30:00',
    endTime: '2026-09-19T12:30:00',
    capacity: 6,
    claimedCount: 5,
    minAge: 12,
    requiresWaiver: false,
    isApproved: true
  },
  {
    id: 'shift_carnival_facepaint',
    subPartId: 'subpart_carnival_games',
    eventId: 'evt_fall_carnival_2026',
    title: 'Face Painting & Glitter Tattoos Artist',
    description: 'Apply quick stencil face paint designs (superhero masks, flowers, school mascots) and temporary tattoos.',
    startTime: '2026-09-19T10:00:00',
    endTime: '2026-09-19T13:00:00',
    capacity: 4,
    claimedCount: 2, // GAPS: Under 50%
    minAge: 14,
    skillsRequired: ['Artistic / Stencils'],
    requiresWaiver: false,
    isApproved: true
  },
  {
    id: 'shift_carnival_inflatable',
    subPartId: 'subpart_carnival_games',
    eventId: 'evt_fall_carnival_2026',
    title: 'Inflatable Giant Obstacle Course Marshall',
    description: 'Safety supervisor ensuring kids remove footwear and keeping the participant queue orderly.',
    startTime: '2026-09-19T12:00:00',
    endTime: '2026-09-19T15:00:00',
    capacity: 6,
    claimedCount: 2, // GAPS: Critical alert (<50%)
    minAge: 18,
    skillsRequired: ['Safety Awareness', 'Crowd Management'],
    requiresWaiver: true,
    waiverTemplateId: 'waiver_general_liability',
    isApproved: true
  },
  {
    id: 'shift_carnival_popcorn',
    subPartId: 'subpart_carnival_food',
    eventId: 'evt_fall_carnival_2026',
    title: 'Popcorn Popping & Cotton Candy Machine Master',
    description: 'Operate the commercial theater popcorn maker and spin sweet cotton candy cones for attendees.',
    startTime: '2026-09-19T11:00:00',
    endTime: '2026-09-19T14:00:00',
    capacity: 4,
    claimedCount: 4, // 100% full
    minAge: 16,
    requiresWaiver: true,
    waiverTemplateId: 'waiver_food_safety',
    isApproved: true
  },
  {
    id: 'shift_carnival_bakesale',
    subPartId: 'subpart_carnival_food',
    eventId: 'evt_fall_carnival_2026',
    title: 'Bake Sale Cashier & Display Specialist',
    description: 'Receive donated homemade bakery treats, arrange on display trays, and manage cash/card payments.',
    startTime: '2026-09-19T09:00:00',
    endTime: '2026-09-19T12:00:00',
    capacity: 4,
    claimedCount: 3,
    minAge: 14,
    requiresWaiver: true,
    waiverTemplateId: 'waiver_food_safety',
    isApproved: true
  },
  {
    id: 'shift_carnival_grill',
    subPartId: 'subpart_carnival_food',
    eventId: 'evt_fall_carnival_2026',
    title: 'Master Grill Chef & Burger Assistant',
    description: 'Grill hot dogs, hamburgers, and veggie burgers on the large outdoor gas grills.',
    startTime: '2026-09-19T11:30:00',
    endTime: '2026-09-19T14:30:00',
    capacity: 4,
    claimedCount: 3,
    minAge: 18,
    skillsRequired: ['Grilling / Food Handling'],
    requiresWaiver: true,
    waiverTemplateId: 'waiver_food_safety',
    isApproved: true
  },
  {
    id: 'shift_carnival_eveningcleanup',
    subPartId: 'subpart_carnival_labor',
    eventId: 'evt_fall_carnival_2026',
    title: 'Evening Teardown, Trash & Table Fold Crew',
    description: 'Fold 40 banquet tables, collapse canopies, sweep grounds, and consolidate recyclable trash.',
    startTime: '2026-09-19T16:30:00',
    endTime: '2026-09-19T18:30:00',
    capacity: 8,
    claimedCount: 2, // GAPS: Critical alert
    minAge: 14,
    requiresWaiver: true,
    waiverTemplateId: 'waiver_general_liability',
    isApproved: true
  },
  {
    id: 'shift_carnival_vendor_guide',
    subPartId: 'subpart_carnival_vendors',
    eventId: 'evt_fall_carnival_2026',
    title: 'Vendor Marshall & Parking Concierge',
    description: 'Guide arriving food trucks and craft vendors to their assigned numbered spots.',
    startTime: '2026-09-19T07:30:00',
    endTime: '2026-09-19T10:00:00',
    capacity: 3,
    claimedCount: 3,
    minAge: 16,
    requiresWaiver: false,
    isApproved: true
  }
];

export const SEED_ITEM_SLOTS: ItemSlot[] = [
  {
    id: 'item_carnival_brownies',
    subPartId: 'subpart_carnival_food',
    eventId: 'evt_fall_carnival_2026',
    itemName: 'Homemade Chocolate Fudge Brownies (Plate of 12)',
    category: 'Bake Sale',
    quantityNeeded: 15,
    quantityPledged: 14,
    unit: 'plates',
    dropOffLocation: 'Cafeteria Drop-off Table',
    dropOffDeadline: 'Saturday by 8:30 AM'
  },
  {
    id: 'item_carnival_cupcakes',
    subPartId: 'subpart_carnival_food',
    eventId: 'evt_fall_carnival_2026',
    itemName: 'Decorated Cupcakes (Box of 12)',
    category: 'Bake Sale',
    quantityNeeded: 15,
    quantityPledged: 8, // GAPS: 7 needed
    unit: 'boxes',
    dropOffLocation: 'Cafeteria Drop-off Table',
    dropOffDeadline: 'Saturday by 8:30 AM'
  },
  {
    id: 'item_carnival_juice',
    subPartId: 'subpart_carnival_food',
    eventId: 'evt_fall_carnival_2026',
    itemName: 'Cases of 100% Juice Boxes (Apple/Berry 40ct)',
    category: 'Beverages',
    quantityNeeded: 10,
    quantityPledged: 10,
    unit: 'cases',
    dropOffLocation: 'Cafeteria Kitchen Walk-in',
    dropOffDeadline: 'Friday 3:00 PM or Saturday 8:00 AM'
  },
  {
    id: 'item_carnival_prizes',
    subPartId: 'subpart_carnival_games',
    eventId: 'evt_fall_carnival_2026',
    itemName: 'Novelty Toy Prize Assortment Packs',
    category: 'Prizes',
    quantityNeeded: 8,
    quantityPledged: 6,
    unit: 'packs',
    dropOffLocation: 'PTA Supply Room 104',
    dropOffDeadline: 'Thursday prior to event'
  },
  {
    id: 'item_carnival_facepaint',
    subPartId: 'subpart_carnival_games',
    eventId: 'evt_fall_carnival_2026',
    itemName: 'Hypoallergenic Washable Face Paint Kits',
    category: 'Supplies',
    quantityNeeded: 4,
    quantityPledged: 1, // GAPS: 3 needed
    unit: 'kits',
    dropOffLocation: 'Courtyard Booth #1',
    dropOffDeadline: 'Saturday 8:30 AM'
  },
  {
    id: 'item_carnival_trashbags',
    subPartId: 'subpart_carnival_labor',
    eventId: 'evt_fall_carnival_2026',
    itemName: 'Heavy Duty 55-Gallon Commercial Contractor Bags',
    category: 'Logistics',
    quantityNeeded: 6,
    quantityPledged: 6,
    unit: 'boxes',
    dropOffLocation: 'Facilities Dock',
    dropOffDeadline: 'Friday 3:00 PM'
  },
  {
    id: 'item_carnival_canopies',
    subPartId: 'subpart_carnival_labor',
    eventId: 'evt_fall_carnival_2026',
    itemName: '10x10 Pop-up Canopies with Sandbag Weights',
    category: 'Equipment',
    quantityNeeded: 12,
    quantityPledged: 5, // GAPS: 7 needed
    unit: 'tents',
    dropOffLocation: 'Gym Loading Dock',
    dropOffDeadline: 'Saturday 7:00 AM'
  }
];

export const SEED_TICKET_TIERS: TicketTier[] = [
  {
    id: 'tier_carnival_wristband',
    eventId: 'evt_fall_carnival_2026',
    title: 'All-Day Unlimited Carnival Wristband',
    type: 'admission_ticket',
    price: 25,
    fairMarketValue: 5,
    capacity: 400,
    claimedCount: 280,
    instantCheckout: true,
    description: 'Unlimited access to all 16 game booths, inflatable obstacle courses, and bounce houses. Includes 1 free popcorn bag.',
    perks: ['Unlimited Inflatables', 'Unlimited Games', 'Free Popcorn']
  },
  {
    id: 'tier_carnival_ticketbook',
    eventId: 'evt_fall_carnival_2026',
    title: 'Carnival Ticket Book (25 Tickets)',
    type: 'admission_ticket',
    price: 20,
    fairMarketValue: 0,
    capacity: 250,
    claimedCount: 145,
    instantCheckout: true,
    description: 'Individual tickets for games (2 tickets each), face painting (3 tickets), and bake sale treats.',
    perks: ['25 Universal Tickets']
  },
  {
    id: 'tier_carnival_artisan_booth',
    eventId: 'evt_fall_carnival_2026',
    title: 'Artisan & Local Craft 10x10 Booth',
    type: 'vendor_booth',
    price: 150,
    fairMarketValue: 0,
    capacity: 12,
    claimedCount: 9,
    instantCheckout: false,
    description: 'Reserved 10x10 space in the festival marketplace. 1 folding table and 2 chairs provided.',
    perks: ['10x10 Footprint', '1 Table + 2 Chairs', 'Access to 1,500+ Attendees'],
    boothDimensions: '10x10',
    powerProvided: false
  },
  {
    id: 'tier_carnival_foodtruck',
    eventId: 'evt_fall_carnival_2026',
    title: 'Food Truck Commercial Pitch',
    type: 'vendor_booth',
    price: 250,
    fairMarketValue: 0,
    capacity: 5,
    claimedCount: 4,
    instantCheckout: false,
    description: 'Dedicated parking pitch on the East Plaza with high foot traffic. 220V 50A or 110V 20A power drop included.',
    perks: ['Food Truck Spot', '220V/110V Electric Hookup', 'Promoted on Event Map'],
    boothDimensions: '30ft Truck Pitch',
    powerProvided: true
  },
  {
    id: 'tier_carnival_platinum_sponsor',
    eventId: 'evt_fall_carnival_2026',
    title: 'Family & Corporate Platinum Sponsor',
    type: 'sponsor_package',
    price: 1000,
    fairMarketValue: 120,
    capacity: 6,
    claimedCount: 4,
    instantCheckout: true,
    description: 'Prominent 3x8ft banner above main gate, logo on all event flyers, 4 unlimited wristbands, and social media spotlight.',
    perks: ['3x8ft Main Entrance Banner', 'Logo on 2,000 School Flyers', '4 VIP Wristbands', 'PTA Newsletter Feature']
  }
];

export const SEED_REGISTRATIONS: Registration[] = [
  {
    id: 'reg_david_chen',
    eventId: 'evt_fall_carnival_2026',
    primaryName: 'David Chen',
    primaryEmail: 'david.chen@gmail.com',
    primaryPhone: '(555) 456-7890',
    manageToken: 'tok_d83fa9b20184c7e1990a2',
    createdAt: '2026-08-15T14:22:10',
    status: 'confirmed',
    notes: 'Excited to help with morning setup and bake sale!',
    members: [
      {
        id: 'member_david',
        registrationId: 'reg_david_chen',
        name: 'David Chen',
        email: 'david.chen@gmail.com',
        phone: '(555) 456-7890',
        relationship: 'Self',
        isMinor: false,
        emergencyContactName: 'Linda Chen',
        emergencyContactPhone: '(555) 456-7899'
      },
      {
        id: 'member_emma',
        registrationId: 'reg_david_chen',
        name: 'Emma Chen',
        relationship: 'Child',
        isMinor: true,
        age: 15,
        emergencyContactName: 'David Chen',
        emergencyContactPhone: '(555) 456-7890',
        dietaryNotes: 'Peanut allergy'
      }
    ],
    shiftClaims: [
      {
        shiftId: 'shift_carnival_morningsetup',
        groupMemberId: 'member_david',
        checkedIn: false
      },
      {
        shiftId: 'shift_carnival_ringtoss',
        groupMemberId: 'member_emma',
        checkedIn: false
      }
    ],
    itemPledges: [
      {
        itemSlotId: 'item_carnival_brownies',
        quantity: 2,
        delivered: true,
        deliveredAt: '2026-09-19T08:15:00',
        receivedBy: 'Sarah Jenkins (Food Lead)',
        donorNotes: 'Gluten-free double fudge brownies in 2 sealed party platters',
        estimatedFmv: 30,
        inKindReceiptNumber: 'INK-2026-0101'
      }
    ],
    ticketPurchases: [
      {
        ticketTierId: 'tier_carnival_wristband',
        quantity: 2
      }
    ],
    donations: [
      {
        amount: 50,
        feeCovered: true,
        totalPaid: 51.75,
        isAnonymous: false,
        taxReceiptNumber: 'REC-2026-0841'
      }
    ],
    waivers: [
      {
        id: 'waiver_signed_david',
        registrationId: 'reg_david_chen',
        groupMemberId: 'member_david',
        waiverTemplateId: 'waiver_general_liability',
        waiverTitle: 'General Volunteer Assumption of Risk & Liability Release',
        waiverText: 'I hereby release and hold harmless the organization...',
        signerName: 'David Chen',
        signerRelationship: 'Self',
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signedAt: '2026-08-15T14:23:45',
        ipAddress: '192.168.1.45',
        isVerifiedAtDoor: true
      },
      {
        id: 'waiver_signed_emma',
        registrationId: 'reg_david_chen',
        groupMemberId: 'member_emma',
        waiverTemplateId: 'waiver_minor_consent',
        waiverTitle: 'Parental Consent & Minor Volunteer Safety Agreement',
        waiverText: 'I, the undersigned parent or legal guardian of Emma Chen...',
        signerName: 'David Chen',
        signerRelationship: 'Father / Legal Guardian',
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signedAt: '2026-08-15T14:24:12',
        ipAddress: '192.168.1.45',
        isVerifiedAtDoor: true
      }
    ]
  },
  {
    id: 'reg_jessica_taylor',
    eventId: 'evt_fall_carnival_2026',
    primaryName: 'Jessica Taylor',
    primaryEmail: 'jessica.taylor@outlook.com',
    primaryPhone: '(555) 789-0123',
    manageToken: 'tok_f91823bc0192847120aef',
    createdAt: '2026-08-16T10:15:00',
    status: 'confirmed',
    members: [
      {
        id: 'member_jessica',
        registrationId: 'reg_jessica_taylor',
        name: 'Jessica Taylor',
        relationship: 'Self',
        isMinor: false
      }
    ],
    shiftClaims: [
      {
        shiftId: 'shift_carnival_bakesale',
        groupMemberId: 'member_jessica',
        checkedIn: true,
        checkedInAt: '2026-09-19T08:50:00',
        checkedInBy: 'Sarah Jenkins'
      }
    ],
    itemPledges: [
      {
        itemSlotId: 'item_carnival_cupcakes',
        quantity: 2,
        delivered: true,
        deliveredAt: '2026-09-19T08:20:00',
        receivedBy: 'Sarah Jenkins (Food Lead)',
        donorNotes: 'Decorated vanilla & chocolate cupcakes with mascot sprinkles',
        estimatedFmv: 35,
        inKindReceiptNumber: 'INK-2026-0102'
      }
    ],
    ticketPurchases: [],
    donations: [
      {
        amount: 100,
        feeCovered: true,
        totalPaid: 103.20,
        isAnonymous: false,
        taxReceiptNumber: 'REC-2026-0842'
      }
    ],
    waivers: [
      {
        id: 'waiver_signed_jessica',
        registrationId: 'reg_jessica_taylor',
        groupMemberId: 'member_jessica',
        waiverTemplateId: 'waiver_food_safety',
        waiverTitle: 'Food Handler & Hospitality Safety Agreement',
        waiverText: 'I agree to adhere strictly to all food hygiene standards...',
        signerName: 'Jessica Taylor',
        signerRelationship: 'Self',
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signedAt: '2026-08-16T10:16:30',
        ipAddress: '192.168.1.92',
        isVerifiedAtDoor: true
      }
    ]
  },
  {
    id: 'reg_robert_miller',
    eventId: 'evt_fall_carnival_2026',
    primaryName: 'Robert Miller',
    primaryEmail: 'robert.miller@techcorp.com',
    primaryPhone: '(555) 321-7654',
    manageToken: 'tok_a8192bc0912401ba8',
    createdAt: '2026-08-16T14:10:00',
    status: 'confirmed',
    notes: 'Lucas needs verified high school service hours for Key Club.',
    members: [
      {
        id: 'member_robert',
        registrationId: 'reg_robert_miller',
        name: 'Robert Miller',
        relationship: 'Self',
        isMinor: false,
        phone: '(555) 321-7654'
      },
      {
        id: 'member_lucas',
        registrationId: 'reg_robert_miller',
        name: 'Lucas Miller',
        relationship: 'Child',
        isMinor: true,
        age: 14,
        emergencyContactName: 'Robert Miller',
        emergencyContactPhone: '(555) 321-7654'
      }
    ],
    shiftClaims: [
      {
        shiftId: 'shift_carnival_morningsetup',
        groupMemberId: 'member_robert',
        checkedIn: true,
        checkedInAt: '2026-09-19T06:55:00',
        checkedInBy: 'Mike Alvarez'
      },
      {
        shiftId: 'shift_carnival_obstacle',
        groupMemberId: 'member_lucas',
        checkedIn: false
      }
    ],
    itemPledges: [
      {
        itemSlotId: 'item_carnival_canopies',
        quantity: 2,
        delivered: true,
        deliveredAt: '2026-09-19T07:15:00',
        receivedBy: 'Mike Alvarez (Setup Lead)',
        donorNotes: 'Two heavy duty 10x10 commercial EZ-UP canopies with 4 sandbag weights',
        estimatedFmv: 180,
        inKindReceiptNumber: 'INK-2026-0103'
      }
    ],
    ticketPurchases: [
      {
        ticketTierId: 'tier_carnival_wristband',
        quantity: 1
      }
    ],
    donations: [
      {
        amount: 250,
        feeCovered: true,
        totalPaid: 257.55,
        isAnonymous: false,
        taxReceiptNumber: 'REC-2026-0843'
      }
    ],
    waivers: [
      {
        id: 'waiver_signed_robert',
        registrationId: 'reg_robert_miller',
        groupMemberId: 'member_robert',
        waiverTemplateId: 'waiver_general_liability',
        waiverTitle: 'General Volunteer Assumption of Risk & Liability Release',
        waiverText: 'I hereby release and hold harmless the organization...',
        signerName: 'Robert Miller',
        signerRelationship: 'Self',
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signedAt: '2026-08-16T14:11:20',
        ipAddress: '192.168.1.104',
        isVerifiedAtDoor: true
      },
      {
        id: 'waiver_signed_lucas',
        registrationId: 'reg_robert_miller',
        groupMemberId: 'member_lucas',
        waiverTemplateId: 'waiver_minor_consent',
        waiverTitle: 'Parental Consent & Minor Volunteer Safety Agreement',
        waiverText: 'I, the undersigned parent or legal guardian of Lucas Miller...',
        signerName: 'Robert Miller',
        signerRelationship: 'Father / Legal Guardian',
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signedAt: '2026-08-16T14:12:05',
        ipAddress: '192.168.1.104',
        isVerifiedAtDoor: true
      }
    ]
  },
  {
    id: 'reg_amanda_white',
    eventId: 'evt_fall_carnival_2026',
    primaryName: 'Amanda White',
    primaryEmail: 'amanda.arts@gmail.com',
    primaryPhone: '(555) 987-6543',
    manageToken: 'tok_c91823bc019284',
    createdAt: '2026-08-17T09:30:00',
    status: 'confirmed',
    members: [
      {
        id: 'member_amanda',
        registrationId: 'reg_amanda_white',
        name: 'Amanda White',
        relationship: 'Self',
        isMinor: false
      }
    ],
    shiftClaims: [
      {
        shiftId: 'shift_carnival_facepainting',
        groupMemberId: 'member_amanda',
        checkedIn: false
      }
    ],
    itemPledges: [
      {
        itemSlotId: 'item_carnival_facepaint',
        quantity: 1,
        delivered: false
      }
    ],
    ticketPurchases: [],
    donations: [],
    waivers: [
      {
        id: 'waiver_signed_amanda',
        registrationId: 'reg_amanda_white',
        groupMemberId: 'member_amanda',
        waiverTemplateId: 'waiver_general_liability',
        waiverTitle: 'General Volunteer Assumption of Risk & Liability Release',
        waiverText: 'I hereby release and hold harmless the organization...',
        signerName: 'Amanda White',
        signerRelationship: 'Self',
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signedAt: '2026-08-17T09:31:40',
        ipAddress: '192.168.1.120',
        isVerifiedAtDoor: true
      }
    ]
  },
  {
    id: 'reg_carlos_gomez',
    eventId: 'evt_fall_carnival_2026',
    primaryName: 'Carlos Gomez',
    primaryEmail: 'carlos.gomez@springfield.org',
    primaryPhone: '(555) 432-1098',
    manageToken: 'tok_e01928471ba98',
    createdAt: '2026-08-17T11:45:00',
    status: 'confirmed',
    members: [
      {
        id: 'member_carlos',
        registrationId: 'reg_carlos_gomez',
        name: 'Carlos Gomez',
        relationship: 'Self',
        isMinor: false
      },
      {
        id: 'member_sofia',
        registrationId: 'reg_carlos_gomez',
        name: 'Sofia Gomez',
        relationship: 'Child',
        isMinor: true,
        age: 16,
        emergencyContactName: 'Carlos Gomez',
        emergencyContactPhone: '(555) 432-1098'
      }
    ],
    shiftClaims: [
      {
        shiftId: 'shift_carnival_afternooncleanup',
        groupMemberId: 'member_carlos',
        checkedIn: false
      },
      {
        shiftId: 'shift_carnival_ringtoss',
        groupMemberId: 'member_sofia',
        checkedIn: false
      }
    ],
    itemPledges: [
      {
        itemSlotId: 'item_carnival_trashbags',
        quantity: 2,
        delivered: true
      }
    ],
    ticketPurchases: [
      {
        ticketTierId: 'tier_carnival_ticketbook',
        quantity: 2
      }
    ],
    donations: [
      {
        amount: 75,
        feeCovered: true,
        totalPaid: 77.45,
        isAnonymous: false,
        taxReceiptNumber: 'REC-2026-0844'
      }
    ],
    waivers: [
      {
        id: 'waiver_signed_carlos',
        registrationId: 'reg_carlos_gomez',
        groupMemberId: 'member_carlos',
        waiverTemplateId: 'waiver_general_liability',
        waiverTitle: 'General Volunteer Assumption of Risk & Liability Release',
        waiverText: 'I hereby release and hold harmless the organization...',
        signerName: 'Carlos Gomez',
        signerRelationship: 'Self',
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signedAt: '2026-08-17T11:46:15',
        ipAddress: '192.168.1.135',
        isVerifiedAtDoor: true
      },
      {
        id: 'waiver_signed_sofia',
        registrationId: 'reg_carlos_gomez',
        groupMemberId: 'member_sofia',
        waiverTemplateId: 'waiver_minor_consent',
        waiverTitle: 'Parental Consent & Minor Volunteer Safety Agreement',
        waiverText: 'I, the undersigned parent or legal guardian of Sofia Gomez...',
        signerName: 'Carlos Gomez',
        signerRelationship: 'Father / Legal Guardian',
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signedAt: '2026-08-17T11:47:00',
        ipAddress: '192.168.1.135',
        isVerifiedAtDoor: true
      }
    ]
  },
  {
    id: 'reg_patricia_kim',
    eventId: 'evt_fall_carnival_2026',
    primaryName: 'Patricia Kim',
    primaryEmail: 'patricia.kim@lawfirm.com',
    primaryPhone: '(555) 654-3210',
    manageToken: 'tok_b192847102948',
    createdAt: '2026-08-18T16:00:00',
    status: 'confirmed',
    members: [
      {
        id: 'member_patricia',
        registrationId: 'reg_patricia_kim',
        name: 'Patricia Kim',
        relationship: 'Self',
        isMinor: false
      }
    ],
    shiftClaims: [
      {
        shiftId: 'shift_carnival_popcorn',
        groupMemberId: 'member_patricia',
        checkedIn: false
      }
    ],
    itemPledges: [
      {
        itemSlotId: 'item_carnival_juice',
        quantity: 2,
        delivered: true
      }
    ],
    ticketPurchases: [],
    donations: [
      {
        amount: 500,
        feeCovered: true,
        totalPaid: 514.80,
        isAnonymous: false,
        taxReceiptNumber: 'REC-2026-0845'
      }
    ],
    waivers: [
      {
        id: 'waiver_signed_patricia',
        registrationId: 'reg_patricia_kim',
        groupMemberId: 'member_patricia',
        waiverTemplateId: 'waiver_food_safety',
        waiverTitle: 'Food Handler & Hospitality Safety Agreement',
        waiverText: 'I agree to adhere strictly to all food hygiene standards...',
        signerName: 'Patricia Kim',
        signerRelationship: 'Self',
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        signedAt: '2026-08-18T16:01:25',
        ipAddress: '192.168.1.150',
        isVerifiedAtDoor: true
      }
    ]
  }
];

export const SEED_DONATIONS: Donation[] = [
  {
    id: 'don_101',
    eventId: 'evt_fall_carnival_2026',
    subPartId: 'subpart_carnival_vendors',
    donorName: 'Springfield Orthodontics',
    donorEmail: 'dr.smith@springfieldortho.com',
    amount: 1000,
    feeAmount: 0,
    netAmount: 1000,
    feeCoveredByDonor: true,
    paymentMethod: 'stripe_card',
    paymentStatus: 'completed',
    isAnonymous: false,
    taxReceiptNumber: 'REC-2026-0801',
    deductibleAmount: 880,
    createdAt: '2026-08-10T11:00:00'
  },
  {
    id: 'don_102',
    eventId: 'evt_fall_carnival_2026',
    donorName: 'Apex Financial Advisors',
    donorEmail: 'giving@apexadvisors.com',
    amount: 1000,
    feeAmount: 0,
    netAmount: 1000,
    feeCoveredByDonor: true,
    paymentMethod: 'invoice_net30',
    paymentStatus: 'completed',
    isAnonymous: false,
    taxReceiptNumber: 'REC-2026-0802',
    deductibleAmount: 880,
    createdAt: '2026-08-12T09:30:00'
  },
  {
    id: 'don_103',
    eventId: 'evt_fall_carnival_2026',
    donorName: 'Lincoln Heritage Bank',
    donorEmail: 'community@lincolnheritage.bank',
    amount: 2500,
    feeAmount: 0,
    netAmount: 2500,
    feeCoveredByDonor: true,
    paymentMethod: 'stripe_card',
    paymentStatus: 'completed',
    isAnonymous: false,
    taxReceiptNumber: 'REC-2026-0803',
    deductibleAmount: 2380,
    createdAt: '2026-08-13T14:15:00'
  },
  {
    id: 'don_104',
    eventId: 'evt_fall_carnival_2026',
    donorName: 'Dr. Robert Hayes Family Foundation',
    donorEmail: 'foundation@hayesmd.com',
    amount: 1500,
    feeAmount: 0,
    netAmount: 1500,
    feeCoveredByDonor: true,
    paymentMethod: 'stripe_card',
    paymentStatus: 'completed',
    isAnonymous: false,
    taxReceiptNumber: 'REC-2026-0804',
    deductibleAmount: 1500,
    createdAt: '2026-08-14T10:00:00'
  },
  {
    id: 'don_105',
    eventId: 'evt_fall_carnival_2026',
    donorName: 'Anonymous Community Supporter',
    donorEmail: 'anon@lincolnpta.org',
    amount: 500,
    feeAmount: 14.80,
    netAmount: 485.20,
    feeCoveredByDonor: false,
    paymentMethod: 'paypal',
    paymentStatus: 'completed',
    isAnonymous: true,
    taxReceiptNumber: 'REC-2026-0805',
    deductibleAmount: 500,
    createdAt: '2026-08-14T16:45:00'
  },
  {
    id: 'don_106',
    eventId: 'evt_fall_carnival_2026',
    donorName: 'Patricia Kim',
    donorEmail: 'patricia.kim@lawfirm.com',
    amount: 500,
    feeAmount: 0,
    netAmount: 500,
    feeCoveredByDonor: true,
    paymentMethod: 'stripe_card',
    paymentStatus: 'completed',
    isAnonymous: false,
    taxReceiptNumber: 'REC-2026-0845',
    deductibleAmount: 500,
    createdAt: '2026-08-18T16:00:00'
  }
];

export const SEED_VENDOR_APPLICATIONS: VendorApplication[] = [
  {
    id: 'vapp_01',
    eventId: 'evt_fall_carnival_2026',
    ticketTierId: 'tier_carnival_artisan_booth',
    businessName: 'Artisan Gourmet Bakery & Treats',
    contactName: 'Maria Rodriguez',
    email: 'maria@artisanbakes.com',
    phone: '(555) 890-1234',
    einTaxId: '82-1928401',
    website: 'https://artisanbakes.com',
    electricityNeeded: 'none',
    spaceRequirement: '10x10 canopy booth',
    coiPolicyNumber: 'STATE-FARM-9812401',
    status: 'approved',
    assignedBoothNumber: 'Booth #A-14',
    invoiceNumber: 'INV-2026-019',
    submittedAt: '2026-08-11T13:20:00'
  },
  {
    id: 'vapp_02',
    eventId: 'evt_fall_carnival_2026',
    ticketTierId: 'tier_carnival_foodtruck',
    businessName: 'Taco Fiesta Mobile Kitchen',
    contactName: 'Carlos Gomez',
    email: 'carlos@tacofiesta.com',
    phone: '(555) 765-4321',
    einTaxId: '47-3928109',
    website: 'https://tacofiesta.com',
    electricityNeeded: '220v_heavy',
    spaceRequirement: '28ft Food Truck',
    coiPolicyNumber: 'LIBERTY-MUTUAL-458190',
    status: 'approved',
    assignedBoothNumber: 'Food Truck Bay #2',
    invoiceNumber: 'INV-2026-020',
    submittedAt: '2026-08-12T15:40:00'
  },
  {
    id: 'vapp_03',
    eventId: 'evt_fall_carnival_2026',
    ticketTierId: 'tier_carnival_artisan_booth',
    businessName: 'Handmade Wooden Toys & Puzzles',
    contactName: 'Jacob Miller',
    email: 'jacob@woodentoys.com',
    phone: '(555) 321-9876',
    einTaxId: '91-4820193',
    electricityNeeded: 'none',
    spaceRequirement: '10x10 booth',
    status: 'pending_review',
    submittedAt: '2026-08-18T09:10:00'
  }
];

export const SEED_APPROVAL_REQUESTS: ApprovalRequest[] = [
  {
    id: 'req_01',
    eventId: 'evt_fall_carnival_2026',
    subPartId: 'subpart_carnival_food',
    subPartName: 'Concessions & Bake Sale',
    requestedByUserId: 'user_sarah',
    requestedByName: 'Sarah Jenkins (Food Lead)',
    type: 'budget_increase',
    title: 'Additional $350 for Gluten-Free & Allergy-Safe Commercial Trays',
    description: 'We had high requests for celiac-safe treats. Requesting $350 budget increase to purchase certified sealed gluten-free baked goods.',
    amountOrCount: 350,
    status: 'pending',
    requestedAt: '2026-08-19T14:30:00'
  },
  {
    id: 'req_02',
    eventId: 'evt_fall_carnival_2026',
    subPartId: 'subpart_carnival_labor',
    subPartName: 'Labor & Logistics Crew',
    requestedByUserId: 'user_mike',
    requestedByName: 'Mike Alvarez (Labor Lead)',
    type: 'shift_addition',
    title: 'Add 6 Extra Teardown Volunteers for Heavy Bleacher Relocation',
    description: 'Custodial staff requested moving the folding bleachers. Need to add 6 volunteers to the Evening Teardown shift.',
    amountOrCount: 6,
    status: 'pending',
    requestedAt: '2026-08-19T16:00:00'
  }
];

export const SEED_VOLUNTEER_CRM: VolunteerCrmRecord[] = [
  {
    id: 'crm_david_chen',
    orgId: 'org_lincoln_pta',
    name: 'David Chen',
    email: 'david.chen@gmail.com',
    phone: '(555) 456-7890',
    lifetimeHours: 36,
    lifetimeDonations: 450,
    eventsParticipated: 6,
    attendanceRate: 100,
    skills: ['Heavy Lifting', 'Morning Logistics', 'Electrical'],
    tags: ['Reliable Helper', 'Parent Volunteer', 'STEM Advocate'],
    lastActive: '2026-08-15',
    notes: 'Father of Emma (Age 11) & Lucas (Age 14). Consistently arrives 15 min early for morning canopy setup. Extremely reliable with power cables and physical setup.',
    eventHistory: [
      {
        eventId: 'evt_fall_carnival_2026',
        eventTitle: 'Lincoln High Fall Carnival & Bake Sale 2026',
        eventDate: '2026-09-18',
        rolesServed: ['Morning Canopy Tent & Sound Rig Setup', 'Bake Sale Assistant'],
        hoursContributed: 4.5,
        itemsDonated: ['2 Boxes of Gourmet Chocolate Chip Cookies', '1 Heavy Duty Extension Cord'],
        amountDonated: 50,
        eventOutcomeRaised: 11450,
        verifiedBy: 'Marcus Vance (Chair)'
      },
      {
        eventId: 'evt_spring_gala_2026',
        eventTitle: 'Annual Spring Charity Gala & Silent Auction 2026',
        eventDate: '2026-04-12',
        rolesServed: ['Auction Item Runner & Audio Tech'],
        hoursContributed: 5.0,
        itemsDonated: ['Smart Home Tech Basket'],
        amountDonated: 200,
        eventOutcomeRaised: 28400,
        verifiedBy: 'Elena Rostova (President)'
      },
      {
        eventId: 'evt_stem_fair_2025',
        eventTitle: 'Lincoln District Science & Robotics STEM Night 2025',
        eventDate: '2025-11-08',
        rolesServed: ['Robotics Arena Judge & Table Marshall'],
        hoursContributed: 6.0,
        itemsDonated: ['Safety Glasses (10ct)'],
        amountDonated: 100,
        eventOutcomeRaised: 8500,
        verifiedBy: 'Dr. Michael Chang'
      },
      {
        eventId: 'evt_fall_carnival_2025',
        eventTitle: 'Lincoln High Fall Carnival 2025',
        eventDate: '2025-09-20',
        rolesServed: ['Obstacle Course Marshall', 'Evening Teardown Crew'],
        hoursContributed: 5.5,
        amountDonated: 100,
        eventOutcomeRaised: 9800,
        verifiedBy: 'Marcus Vance (Chair)'
      }
    ]
  },
  {
    id: 'crm_jessica_taylor',
    orgId: 'org_lincoln_pta',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@outlook.com',
    phone: '(555) 789-0123',
    lifetimeHours: 24,
    lifetimeDonations: 600,
    eventsParticipated: 4,
    attendanceRate: 100,
    skills: ['Bake Sale', 'Cashier', 'Hospitality'],
    tags: ['Master Baker', 'VIP Donor'],
    lastActive: '2026-08-16',
    notes: 'Professional pastry chef. Donates all baked goods with allergen-safe gluten-free labeling.',
    eventHistory: [
      {
        eventId: 'evt_fall_carnival_2026',
        eventTitle: 'Lincoln High Fall Carnival & Bake Sale 2026',
        eventDate: '2026-09-18',
        rolesServed: ['Artisan Bakery & Cake Walk Lead'],
        hoursContributed: 4.0,
        itemsDonated: ['4 Trays of Gluten-Free Fudge Brownies (48ct)'],
        amountDonated: 150,
        eventOutcomeRaised: 11450,
        verifiedBy: 'Sarah Jenkins (Food Lead)'
      },
      {
        eventId: 'evt_spring_gala_2026',
        eventTitle: 'Annual Spring Charity Gala & Silent Auction 2026',
        eventDate: '2026-04-12',
        rolesServed: ['VIP Dessert Reception Host'],
        hoursContributed: 6.0,
        itemsDonated: ['Custom 3-Tier Charity Cake Lot'],
        amountDonated: 250,
        eventOutcomeRaised: 28400,
        verifiedBy: 'Elena Rostova (President)'
      },
      {
        eventId: 'evt_holiday_bake_2025',
        eventTitle: 'Holiday Community Food & Baked Treats Drive 2025',
        eventDate: '2025-12-14',
        rolesServed: ['Bake Station Coordinator'],
        hoursContributed: 8.0,
        amountDonated: 200,
        eventOutcomeRaised: 12200,
        verifiedBy: 'Sarah Jenkins (Food Lead)'
      }
    ]
  },
  {
    id: 'crm_robert_williams',
    orgId: 'org_lincoln_pta',
    name: 'Robert Williams',
    email: 'robert.w@gmail.com',
    phone: '(555) 123-9988',
    lifetimeHours: 48,
    lifetimeDonations: 1200,
    eventsParticipated: 8,
    attendanceRate: 95,
    skills: ['Grill Chef', 'Sound System Tech', 'First Aid Certified'],
    tags: ['Certified First Aid', 'VIP Donor', 'Alumni'],
    lastActive: '2026-06-10',
    notes: 'Lincoln High alumnus (Class of 04). Certified in CPR/AED and operates the master outdoor barbecue smoker.',
    eventHistory: [
      {
        eventId: 'evt_fall_carnival_2026',
        eventTitle: 'Lincoln High Fall Carnival & Bake Sale 2026',
        eventDate: '2026-09-18',
        rolesServed: ['Master Grill Chef & Smoker Host'],
        hoursContributed: 4.0,
        itemsDonated: ['2 Cases of Gourmet Hot Dogs (80ct)', 'Propane Tanks'],
        amountDonated: 200,
        eventOutcomeRaised: 11450,
        verifiedBy: 'Sarah Jenkins (Food Lead)'
      },
      {
        eventId: 'evt_sports_tournament_2026',
        eventTitle: 'Spring Youth Athletics & Soccer Invitational 2026',
        eventDate: '2026-05-02',
        rolesServed: ['First Aid Tent & Concession Grill Lead'],
        hoursContributed: 8.0,
        amountDonated: 500,
        eventOutcomeRaised: 15300,
        verifiedBy: 'Coach Ramirez'
      },
      {
        eventId: 'evt_spring_gala_2026',
        eventTitle: 'Annual Spring Charity Gala 2026',
        eventDate: '2026-04-12',
        rolesServed: ['Sound & Stage Manager'],
        hoursContributed: 6.0,
        amountDonated: 500,
        eventOutcomeRaised: 28400,
        verifiedBy: 'Elena Rostova (President)'
      }
    ]
  },
  {
    id: 'crm_amanda_foster',
    orgId: 'org_lincoln_pta',
    name: 'Amanda Foster',
    email: 'amanda.foster@yahoo.com',
    phone: '(555) 678-1122',
    lifetimeHours: 18,
    lifetimeDonations: 200,
    eventsParticipated: 3,
    attendanceRate: 100,
    skills: ['Face Painting', 'Crafts', 'Photography'],
    tags: ['Creative Lead', 'Parent Volunteer'],
    lastActive: '2026-05-20',
    notes: 'Mother of two elementary students. Professional graphic designer who manages event face painting and creates signage.',
    eventHistory: [
      {
        eventId: 'evt_fall_carnival_2026',
        eventTitle: 'Lincoln High Fall Carnival & Bake Sale 2026',
        eventDate: '2026-09-18',
        rolesServed: ['Face Painting & Glitter Tattoo Artist'],
        hoursContributed: 3.5,
        itemsDonated: ['Hypoallergenic Washable Face Paint Kits (4ct)'],
        amountDonated: 50,
        eventOutcomeRaised: 11450,
        verifiedBy: 'Marcus Vance (Chair)'
      },
      {
        eventId: 'evt_art_festival_2026',
        eventTitle: 'Spring Student Art Showcase & Auction 2026',
        eventDate: '2026-03-22',
        rolesServed: ['Gallery Curator & Photographer'],
        hoursContributed: 5.0,
        amountDonated: 150,
        eventOutcomeRaised: 7900,
        verifiedBy: 'Elena Rostova (President)'
      }
    ]
  }
];

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_01',
    eventId: 'evt_fall_carnival_2026',
    subPartId: undefined,
    senderName: 'Marcus Vance',
    senderRole: 'Event Chairperson',
    title: 'Exciting News: Dunk Tank line-up confirmed!',
    message: 'Principal Higgins and Coach Bradley have agreed to be in the dunk tank from 1:00 PM to 3:00 PM! Tell your students!',
    urgency: 'normal',
    channel: 'all',
    sentAt: '2026-08-18T10:00:00'
  },
  {
    id: 'ann_02',
    eventId: 'evt_fall_carnival_2026',
    subPartId: 'subpart_carnival_food',
    subPartName: 'Concessions & Bake Sale',
    senderName: 'Sarah Jenkins',
    senderRole: 'Food & Hospitality Lead',
    title: 'Reminder: Label all nut-free & gluten-free baked goods',
    message: 'When dropping off baked goods on Saturday morning, please attach an ingredient index card so we can keep our allergy-safe table certified.',
    urgency: 'important',
    channel: 'all',
    sentAt: '2026-08-19T11:30:00'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    orgId: 'org_lincoln_pta',
    eventId: 'evt_fall_carnival_2026',
    actorId: 'user_marcus',
    actorName: 'Marcus Vance',
    actorRole: 'event_planner',
    action: 'PUBLISH_EVENT',
    details: 'Published Lincoln High Fall Carnival 2026 to public directory.',
    timestamp: '2026-08-01T09:00:00'
  },
  {
    id: 'log_02',
    orgId: 'org_lincoln_pta',
    eventId: 'evt_fall_carnival_2026',
    actorId: 'user_elena',
    actorName: 'Elena Rostova',
    actorRole: 'org_admin',
    action: 'APPROVE_VENDOR',
    details: 'Approved Taco Fiesta Mobile Kitchen for Food Truck Bay #2.',
    timestamp: '2026-08-12T16:00:00'
  }
];
