import { HoneycombEvent, SupportNeed, Shift, VolunteerRegistration, DirectDonation } from '../types';

export const INITIAL_EVENT: HoneycombEvent = {
  id: 'evt-cougars-2026',
  name: 'Oak Creek 2026 Fall Soccer Invitational & Snack Bar',
  organizationName: 'Oak Creek Athletics Booster Club (501c3)',
  location: 'Cougar Stadium — Main Turf Field & Concessions',
  date: '2026-10-17',
  startTime: '08:00',
  lengthHours: 8,
  privacy: 'public',
  accessCode: '4921',
  status: 'setup',
  currentPhase: 'setup',
  
  registeredByRole: 'organizer',
  registeredByName: 'Coach Dan Miller',
  registeredByEmail: 'dan.miller@oakcreekboosters.org',
  registeredByPhone: '(555) 234-8901',
  
  organizerName: 'Coach Dan Miller',
  organizerEmail: 'dan.miller@oakcreekboosters.org',
  organizerPhone: '(555) 234-8901',
  isClaimed: true,
  claimToken: 'claimed-dan-miller-token',
  
  goals: {
    purpose: 'Support 16 youth teams, fund tournament trophies, and provide warm-up jackets for the squad',
    communityImpact: 'Promoting youth sportsmanship, physical activity, and healthy school community connection',
    fundraisingTarget: 3500,
    fundsRaised: 2250
  },
  createdAt: '2026-10-01T10:00:00Z'
};

export const INITIAL_NEEDS: SupportNeed[] = [
  {
    id: 'need-table-minh',
    eventId: 'evt-cougars-2026',
    type: 'equipment',
    title: '6-ft Heavy Duty Folding Table',
    details: 'Need 1 folding table for the Visitor Team Check-In Gate. Please drop off by 7:30 AM.',
    dueDate: '2026-10-17',
    dueTime: '07:30',
    quantityNeeded: 1,
    quantityFulfilled: 0,
    unit: 'table',
    estimatedFmv: 75,
    assignedTo: {
      name: 'Minh',
      email: 'minh.volunteer@gmail.com',
      phone: '(555) 349-1102',
      assignedAt: '2026-10-06T14:30:00Z',
      status: 'pending',
      confirmationToken: 'minh-table-token-77',
      notes: 'Can bring the white Costco folding table from my garage'
    },
    fallbackOption: 'both',
    dutyCategory: 'setup'
  },
  {
    id: 'need-canopy-carlos',
    eventId: 'evt-cougars-2026',
    type: 'equipment',
    title: '10x10 Pop-Up Shade Canopy',
    details: 'Shade canopy for the first aid / trainer station near midfield.',
    dueDate: '2026-10-17',
    dueTime: '07:45',
    quantityNeeded: 1,
    quantityFulfilled: 1,
    unit: 'canopy',
    estimatedFmv: 150,
    assignedTo: {
      name: 'Carlos Garcia',
      email: 'carlos.garcia@gmail.com',
      phone: '(555) 902-3341',
      assignedAt: '2026-10-05T09:15:00Z',
      status: 'confirmed',
      confirmationToken: 'carlos-canopy-token-42',
      confirmedAt: '2026-10-05T11:20:00Z',
      notes: 'Bringing 1 blue EZ-Up with sandbag weights'
    },
    fallbackOption: 'alert_organizer',
    dutyCategory: 'setup'
  },
  {
    id: 'need-cooler-ice',
    eventId: 'evt-cougars-2026',
    type: 'equipment',
    title: '120-Qt Rolling Ice Chest (With Ice)',
    details: 'Large cooler filled with ice for the snack shack hydration drinks.',
    dueDate: '2026-10-17',
    dueTime: '08:00',
    quantityNeeded: 2,
    quantityFulfilled: 1,
    unit: 'coolers',
    estimatedFmv: 95,
    fallbackOption: 'auto_public_wishlist',
    dutyCategory: 'concessions'
  },
  {
    id: 'need-referee-funds',
    eventId: 'evt-cougars-2026',
    type: 'money',
    title: 'Certified Youth Referee Stipend Fund',
    details: 'Direct donations to cover certified referee match fees for youth bracket games.',
    dueDate: '2026-10-17',
    dueTime: '17:00',
    quantityNeeded: 800,
    quantityFulfilled: 650,
    unit: '$',
    fallbackOption: 'alert_organizer'
  }
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift-checkin-am',
    eventId: 'evt-cougars-2026',
    title: 'Morning Gate & Wristband Check-In',
    dutyCategory: 'check_in',
    startTime: '07:30',
    endTime: '10:30',
    reportLocation: 'Main Stadium Gate 1',
    dutiesDescription: 'Scan tickets, give wristbands to players & parents, provide campus maps.',
    capacity: 4,
    filledCount: 3,
    compliance: {
      type: 'none',
      title: 'Open to Anyone',
      badge: '🌱',
      description: 'No special clearance needed. Great for high school students!',
      requiresUploadOrId: false
    }
  },
  {
    id: 'shift-grill-lunch',
    eventId: 'evt-cougars-2026',
    title: 'Snack Shack Burger & Hot Dog Griller',
    dutyCategory: 'concessions',
    startTime: '10:30',
    endTime: '13:30',
    reportLocation: 'Snack Shack Kitchen Window',
    dutiesDescription: 'Grill burgers and hot dogs, prepare food boxes, follow safe cooking temps.',
    capacity: 2,
    filledCount: 2,
    compliance: {
      type: 'servsafe',
      title: 'Food Safety / ServSafe',
      badge: '🧑‍🍳',
      description: 'Requires California Food Handler or ServSafe certification on file.',
      requiresUploadOrId: true
    }
  },
  {
    id: 'shift-safesport-marshals',
    eventId: 'evt-cougars-2026',
    title: 'Field Safety & Sideline Monitor',
    dutyCategory: 'security',
    startTime: '08:30',
    endTime: '12:30',
    reportLocation: 'Field 2 Coaches Tent',
    dutiesDescription: 'Ensure spectator buffer zones, monitor player hydration, coordinate first aid.',
    capacity: 3,
    filledCount: 2,
    compliance: {
      type: 'safesport',
      title: 'USA SafeSport Certified',
      badge: '🛡️',
      description: 'Mandatory youth protection clearance for sideline personnel.',
      requiresUploadOrId: true
    }
  },
  {
    id: 'shift-teardown-pm',
    eventId: 'evt-cougars-2026',
    title: 'Field Teardown & Recycling Crew',
    dutyCategory: 'cleanup',
    startTime: '15:30',
    endTime: '17:30',
    reportLocation: 'Stadium Flagpole',
    dutiesDescription: 'Take down canopies, fold tables, collect aluminum cans, venue sweep.',
    capacity: 6,
    filledCount: 4,
    compliance: {
      type: 'none',
      title: 'Open to Anyone',
      badge: '🌱',
      description: 'High school students earn 2.0 verified graduation service hours!',
      requiresUploadOrId: false
    }
  }
];

export const INITIAL_VOLUNTEERS: VolunteerRegistration[] = [
  {
    id: 'vol-maya-lin',
    shiftId: 'shift-checkin-am',
    eventId: 'evt-cougars-2026',
    name: 'Maya Lin',
    email: 'maya.lin@student.oakcreek.edu',
    phone: '(555) 789-1029',
    isMinor: true,
    age: 15,
    parentName: 'Sarah Lin',
    magicPassToken: 'pass-maya-lin-88',
    complianceProof: {
      isVerified: true,
      verifiedByOrganizer: true,
      verifiedAt: '2026-10-06T12:00:00Z'
    },
    checkInStatus: 'checked_in',
    checkedInAt: '2026-10-17T07:25:00Z',
    hoursCompleted: 3.0,
    hoursVerified: true,
    notes: 'National Honor Society candidate, verified by Coach Dan',
    registeredAt: '2026-10-02T14:10:00Z'
  },
  {
    id: 'vol-lucas-torres',
    shiftId: 'shift-grill-lunch',
    eventId: 'evt-cougars-2026',
    name: 'Lucas Torres',
    email: 'ltorres99@gmail.com',
    phone: '(555) 431-8902',
    isMinor: false,
    magicPassToken: 'pass-lucas-torres-19',
    complianceProof: {
      credentialId: 'SERV-CA-8891024',
      documentName: 'servsafe_torres_2026.pdf',
      isVerified: true,
      verifiedByOrganizer: true,
      verifiedAt: '2026-10-04T10:00:00Z'
    },
    checkInStatus: 'checked_in',
    checkedInAt: '2026-10-17T10:20:00Z',
    hoursCompleted: 3.0,
    hoursVerified: true,
    registeredAt: '2026-10-03T09:00:00Z'
  },
  {
    id: 'vol-jake-baker',
    shiftId: 'shift-teardown-pm',
    eventId: 'evt-cougars-2026',
    name: 'Jake Baker',
    email: 'jake.baker@oakcreek.edu',
    phone: '(555) 671-9920',
    isMinor: true,
    age: 16,
    parentName: 'Robert Baker',
    magicPassToken: 'pass-jake-baker-45',
    checkInStatus: 'checked_in',
    hoursCompleted: 2.0,
    hoursVerified: false, // Needs 1-tap verification by organizer!
    registeredAt: '2026-10-06T15:20:00Z'
  },
  {
    id: 'vol-emma-watson',
    shiftId: 'shift-safesport-marshals',
    eventId: 'evt-cougars-2026',
    name: 'Emma Watson',
    email: 'emma.watson@parent.oakcreek.org',
    phone: '(555) 991-4421',
    isMinor: false,
    magicPassToken: 'pass-emma-watson-32',
    complianceProof: {
      credentialId: 'SAFESPORT-2026-0918',
      documentName: 'safesport_cert_watson.pdf',
      isVerified: true,
      verifiedByOrganizer: true
    },
    checkInStatus: 'checked_in',
    hoursCompleted: 4.0,
    hoursVerified: false, // Needs 1-tap verification!
    registeredAt: '2026-10-04T16:00:00Z'
  }
];

export const INITIAL_DONATIONS: DirectDonation[] = [
  {
    id: 'don-01',
    eventId: 'evt-cougars-2026',
    donorName: 'The Henderson Family',
    donorEmail: 'henderson.family@gmail.com',
    amount: 250,
    date: '2026-10-08',
    isConfirmed: true,
    taxReceiptNumber: 'TAX-2026-OC-0104',
    taxLetterSent: true
  },
  {
    id: 'don-02',
    eventId: 'evt-cougars-2026',
    donorName: 'Valley Orthodontics',
    donorEmail: 'info@valleyortho-oakcreek.com',
    amount: 500,
    date: '2026-10-10',
    isConfirmed: true,
    taxReceiptNumber: 'TAX-2026-OC-0105',
    taxLetterSent: true
  },
  {
    id: 'don-03',
    eventId: 'evt-cougars-2026',
    donorName: 'Elena Rostova',
    donorEmail: 'elena.rostova@gmail.com',
    amount: 100,
    date: '2026-10-12',
    isConfirmed: true,
    taxReceiptNumber: 'TAX-2026-OC-0106',
    taxLetterSent: true
  }
];
