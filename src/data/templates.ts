import { OrganizationType, EventTheme, WaiverTemplate } from '../types';

export interface OrgTemplatePreset {
  id: string;
  type: OrganizationType;
  name: string;
  badge: string;
  description: string;
  defaultDepartments: string[];
  suggestedGoal: number;
  sampleEventTitle: string;
  defaultWaiverType: string;
}

export const ORG_TEMPLATES: OrgTemplatePreset[] = [
  {
    id: 'school_pta',
    type: 'school_pta',
    name: 'School / PTA / Booster Club',
    badge: '🏫 Education',
    description: 'Tailored for parent-teacher associations, athletic boosters, and academic clubs. Includes parent/minor consent waivers and school carnival/bake sale setups.',
    defaultDepartments: ['Game & Activity Booths', 'Concessions & Bake Sale', 'Ticket Sales & Wristbands', 'Setup & Logistics'],
    suggestedGoal: 5000,
    sampleEventTitle: 'Annual Fall Carnival & Bake Sale',
    defaultWaiverType: 'minor_consent'
  },
  {
    id: 'non_profit',
    type: 'non_profit',
    name: 'Non-Profit / Charity Foundation',
    badge: '❤️ Foundation',
    description: 'Designed for 501(c)(3) charities, galas, and community benefit foundations with IRS tax deduction receipts and corporate sponsorship tiers.',
    defaultDepartments: ['VIP Registration & Greeters', 'Silent Auction & Baskets', 'Hospitality & Catering', 'Setup & Teardown'],
    suggestedGoal: 25000,
    sampleEventTitle: 'Annual Spring Charity Gala & Silent Auction',
    defaultWaiverType: 'general_liability'
  },
  {
    id: 'youth_sports',
    type: 'youth_sports',
    name: 'Youth Sports League / Club',
    badge: '⚽ Athletics',
    description: 'Built for soccer, baseball, basketball, and swim leagues with concession shifts, field maintenance, scorekeepers, and referee logistics.',
    defaultDepartments: ['Field Setup & Lining', 'Concession Stand & Grilling', 'Scorekeeping & Refs', 'Vendor Row'],
    suggestedGoal: 3500,
    sampleEventTitle: 'Invitational Youth Soccer Tournament',
    defaultWaiverType: 'general_liability'
  },
  {
    id: 'church_faith',
    type: 'church_faith',
    name: 'Church & Faith Community',
    badge: '⛪ Faith & Community',
    description: 'Configured for community outreach, holiday food pantries, toy drives, and youth fellowship service projects.',
    defaultDepartments: ['Donation Drop-off & Sorting', 'Distribution & Greeting', 'Logistics & Loading', 'Fellowship Refreshments'],
    suggestedGoal: 7500,
    sampleEventTitle: 'Holiday Community Food Pantry & Toy Drive',
    defaultWaiverType: 'general_liability'
  },
  {
    id: 'corporate_giving',
    type: 'corporate_giving',
    name: 'Corporate Social Responsibility (CSR)',
    badge: '🏢 Corporate Giving',
    description: 'Perfect for employee volunteering days, company charity matching drives, and corporate sponsored habitat builds.',
    defaultDepartments: ['Build & Labor Crews', 'Safety & PPE Station', 'Lunch & Hospitality', 'Media & Documentation'],
    suggestedGoal: 50000,
    sampleEventTitle: 'Annual Corporate Community Impact Day',
    defaultWaiverType: 'general_liability'
  }
];

export interface EventTemplatePreset {
  id: string;
  title: string;
  tagline: string;
  category: string;
  icon: string;
  defaultGoal: number;
  description: string;
  defaultDressCode?: string;
  departments: {
    name: string;
    category: 'labor_setup' | 'hospitality_food' | 'vendors_sponsors' | 'auction_fundraising' | 'registration_greeters';
    leadTitle: string;
    reportingGate: string;
    dressCode: string;
    suggestedBudget: number;
    shifts: {
      title: string;
      description: string;
      durationHours: number;
      capacity: number;
      requiresWaiver: boolean;
    }[];
    items: {
      itemName: string;
      category: string;
      quantityNeeded: number;
      unit: string;
    }[];
  }[];
  ticketTiers: {
    title: string;
    type: 'admission_ticket' | 'vendor_booth' | 'sponsor_package' | 'raffle';
    price: number;
    fairMarketValue: number;
    capacity: number;
    instantCheckout: boolean;
    description: string;
    perks: string[];
  }[];
}

export const EVENT_TEMPLATES: EventTemplatePreset[] = [
  {
    id: 'gala_auction',
    title: 'Annual Charity Gala & Silent Auction',
    tagline: 'An elegant evening of dinner, live entertainment, and auctions supporting our mission.',
    category: 'Charity Gala',
    icon: '🏆',
    defaultGoal: 25000,
    defaultDressCode: 'Black-Tie or Formal Evening Attire / Dark suits and formal gowns',
    description: 'Join community leaders and philanthropists for our premiere annual fundraising gala. Enjoy fine dining, keynote addresses, live entertainment, and a curated silent auction featuring luxury travel packages, memorabilia, and artisanal gifts.',
    departments: [
      {
        name: 'VIP Registration & Greeters',
        category: 'registration_greeters',
        leadTitle: 'Registration Lead',
        reportingGate: 'Main Ballroom Foyer Desk',
        dressCode: 'Black-tie or Formal Evening Attire',
        suggestedBudget: 300,
        shifts: [
          { title: 'VIP Check-In & Lanyard Handout', description: 'Welcome guests, check digital tickets, and issue bidder numbers.', durationHours: 3, capacity: 4, requiresWaiver: false },
          { title: 'Coat Check Attendants', description: 'Manage the coat and bag check for attending guests.', durationHours: 4, capacity: 3, requiresWaiver: false }
        ],
        items: [
          { itemName: 'Custom VIP Lanyards & Badges', category: 'Supplies', quantityNeeded: 250, unit: 'badges' },
          { itemName: 'Table Seating Guide Easels', category: 'Signage', quantityNeeded: 4, unit: 'easels' }
        ]
      },
      {
        name: 'Silent Auction & Baskets',
        category: 'auction_fundraising',
        leadTitle: 'Auction Coordinator',
        reportingGate: 'Auction Gallery East Wing',
        dressCode: 'Cocktail / Formal Dark Attire',
        suggestedBudget: 500,
        shifts: [
          { title: 'Auction Lot Greeter & Spotter', description: 'Assist bidders, showcase featured packages, and answer questions.', durationHours: 3, capacity: 6, requiresWaiver: false },
          { title: 'Checkout & Winning Package Packaging', description: 'Process winning bids and package items for secure pickup.', durationHours: 2.5, capacity: 4, requiresWaiver: false }
        ],
        items: [
          { itemName: 'Gourmet Wine & Chocolate Gift Basket', category: 'Auction Lot', quantityNeeded: 5, unit: 'baskets' },
          { itemName: 'Luxury Spa Weekend Package Voucher', category: 'Auction Lot', quantityNeeded: 2, unit: 'vouchers' },
          { itemName: 'Framed Autographed Sports Memorabilia', category: 'Auction Lot', quantityNeeded: 3, unit: 'items' }
        ]
      },
      {
        name: 'Hospitality & Beverage Service',
        category: 'hospitality_food',
        leadTitle: 'Committee Lead',
        reportingGate: 'Banquet Kitchen Service Door',
        dressCode: 'Black button-down, black trousers, non-slip shoes',
        suggestedBudget: 1500,
        shifts: [
          { title: 'Wine Service & Water Station Helper', description: 'Replenish table water carafes and assist catering staff with wine service.', durationHours: 3.5, capacity: 8, requiresWaiver: true }
        ],
        items: [
          { itemName: 'Assorted Non-Alcoholic Mocktails & San Pellegrino', category: 'Beverages', quantityNeeded: 10, unit: 'cases' }
        ]
      },
      {
        name: 'Setup & Teardown Crew',
        category: 'labor_setup',
        leadTitle: 'Labor & Logistics Lead',
        reportingGate: 'Ballroom Loading Dock Bay 2',
        dressCode: 'Closed-toe work boots, work gloves, dark jeans',
        suggestedBudget: 400,
        shifts: [
          { title: 'Morning Stage & Table Dressing Crew', description: 'Assemble centerpieces, layout table settings, position banners.', durationHours: 3, capacity: 8, requiresWaiver: true },
          { title: 'Midnight Teardown & Loading Crew', description: 'Pack auction display easels, roll up red carpets, pack sound gear.', durationHours: 2.5, capacity: 6, requiresWaiver: true }
        ],
        items: [
          { itemName: 'Heavy Duty Moving Dollies', category: 'Equipment', quantityNeeded: 4, unit: 'dollies' },
          { itemName: 'Velvet Stanchion Rope Barriers', category: 'Decor', quantityNeeded: 8, unit: 'sets' }
        ]
      }
    ],
    ticketTiers: [
      { title: 'Presenting Title Sponsor Package', type: 'sponsor_package', price: 5000, fairMarketValue: 600, capacity: 2, instantCheckout: false, description: 'VIP table for 10, podium speech recognition, full-page program ad, and logo on all step-and-repeat banners.', perks: ['VIP Table of 10', 'Podium Keynote Recognition', 'Full Page Cover Ad', 'VIP Champagne Service'] },
      { title: 'Corporate Table Sponsor (10 Seats)', type: 'sponsor_package', price: 1500, fairMarketValue: 500, capacity: 10, instantCheckout: true, description: 'Dedicated reserved table with branded centerpiece, premium wine pairings, and company logo in program.', perks: ['Table of 10', 'Logo on Program', '2 Bottles Premium Wine'] },
      { title: 'Individual Gala Ticket', type: 'admission_ticket', price: 175, fairMarketValue: 50, capacity: 150, instantCheckout: true, description: 'Single seat admission including 3-course dinner, open mocktail bar, and full auction participation.', perks: ['Dinner & Drinks', 'Silent Auction Paddle'] }
    ]
  },
  {
    id: 'fun_run_5k',
    title: 'Community 5K Fun Run & Food Drive',
    tagline: 'Lace up your sneakers to raise critical funding and collect canned goods for local families.',
    category: '5K Run / Athletics',
    icon: '🏃',
    defaultGoal: 10000,
    defaultDressCode: 'Athletic wear, sneakers, and high-visibility running gear',
    description: 'A family-friendly 5K run and 1-mile fun walk through Memorial Park. Every participant registration includes an event t-shirt, finisher medal, and contributes directly to our community emergency food pantry.',
    departments: [
      {
        name: 'Course Marshals & Safety',
        category: 'labor_setup',
        leadTitle: 'Course Director',
        reportingGate: 'Park Ranger Station (East Pavilion)',
        dressCode: 'High-visibility safety vest (provided) & running shoes',
        suggestedBudget: 250,
        shifts: [
          { title: 'Mile 1 & 2 Turnaround Marshals', description: 'Guide runners along the designated path and ensure pedestrian safety.', durationHours: 3, capacity: 8, requiresWaiver: true },
          { title: 'Traffic & Parking Marshalling', description: 'Direct runner vehicles into designated grassy parking zones.', durationHours: 2.5, capacity: 6, requiresWaiver: true }
        ],
        items: [
          { itemName: 'Orange Traffic Cones (28-inch)', category: 'Safety', quantityNeeded: 50, unit: 'cones' },
          { itemName: 'High-Vis Safety Vests', category: 'Safety', quantityNeeded: 20, unit: 'vests' }
        ]
      },
      {
        name: 'Water Stations & Finish Line',
        category: 'hospitality_food',
        leadTitle: 'Refreshments Coordinator',
        reportingGate: 'Finish Line Arch Gazebo',
        dressCode: 'Athletic wear, sun hat, comfortable sneakers',
        suggestedBudget: 400,
        shifts: [
          { title: 'Mid-Course Water Handout Team', description: 'Fill and hand cups of water/electrolytes to passing runners.', durationHours: 2.5, capacity: 6, requiresWaiver: true },
          { title: 'Finish Line Medals & Fruit Handout', description: 'Award finisher medals and distribute bananas/granola bars.', durationHours: 3, capacity: 8, requiresWaiver: false }
        ],
        items: [
          { itemName: 'Cases of Bottled Spring Water (24pk)', category: 'Refreshments', quantityNeeded: 25, unit: 'cases' },
          { itemName: 'Fresh Bananas & Orange Slices', category: 'Refreshments', quantityNeeded: 10, unit: 'boxes' },
          { itemName: 'Electrolyte Powder Mix (Lemon/Lime)', category: 'Refreshments', quantityNeeded: 8, unit: 'tubs' }
        ]
      },
      {
        name: 'Food Drive Collection & Sorting',
        category: 'auction_fundraising',
        leadTitle: 'Pantry Logistics Lead',
        reportingGate: 'Food Pantry Truck at Parking Lot A',
        dressCode: 'Work gloves, durable pants, closed shoes',
        suggestedBudget: 200,
        shifts: [
          { title: 'Canned Goods Receiving & Weigh-In', description: 'Accept food donations from arriving runners and record total weight.', durationHours: 3.5, capacity: 6, requiresWaiver: true },
          { title: 'Box Sorting & Pallet Packing', description: 'Sort proteins, grains, and canned vegetables into sturdy distribution boxes.', durationHours: 3, capacity: 6, requiresWaiver: true }
        ],
        items: [
          { itemName: 'Heavy Duty Stacking Storage Totes', category: 'Supplies', quantityNeeded: 20, unit: 'totes' }
        ]
      }
    ],
    ticketTiers: [
      { title: '5K Runner Registration + T-Shirt', type: 'admission_ticket', price: 35, fairMarketValue: 12, capacity: 400, instantCheckout: true, description: 'Includes chip-timed bib, commemorative dry-fit t-shirt, and finisher medal.', perks: ['Chip Timed Bib', 'Technical T-Shirt', 'Finisher Medal'] },
      { title: 'Mile Marker Sponsor Banner', type: 'sponsor_package', price: 500, fairMarketValue: 40, capacity: 3, instantCheckout: true, description: 'Your company logo and custom cheer message on a large 4x8ft banner at Mile 1, 2, or 3.', perks: ['4x8 Banner at Mile Marker', 'Social Media Shoutout'] },
      { title: 'Food Truck Vendor Pitch (Post-Race Expo)', type: 'vendor_booth', price: 200, fairMarketValue: 0, capacity: 4, instantCheckout: false, description: 'Dedicated food truck space at the post-race finisher festival. Electric hookup included.', perks: ['Food Truck Spot', 'Access to 600+ Attendees'] }
    ]
  },
  {
    id: 'school_carnival',
    title: 'School Fall Carnival & Festival',
    tagline: 'Games, inflatables, bake sales, and prizes for students, teachers, and neighborhood families.',
    category: 'School Carnival',
    icon: '🎡',
    defaultGoal: 6000,
    defaultDressCode: 'Lincoln High Spirit T-Shirt (provided) or casual athletic wear & sneakers',
    description: 'Our PTA Fall Carnival is the biggest family tradition of the school year! Features 16 interactive carnival game booths, giant obstacle bounce houses, face painting, bake sale treats, and our famous teachers dunk tank.',
    departments: [
      {
        name: 'Game & Activity Booths',
        category: 'registration_greeters',
        leadTitle: 'Activities Lead',
        reportingGate: 'School Courtyard Booth #1',
        dressCode: 'Lincoln High Spirit Wear or Casual',
        suggestedBudget: 500,
        shifts: [
          { title: 'Ring Toss & Bean Bag Toss Host', description: 'Collect tickets, hand game pieces to kids, and award prize ribbons.', durationHours: 2, capacity: 8, requiresWaiver: false },
          { title: 'Face Painting & Temporary Tattoos', description: 'Paint simple designs and apply fun temporary tattoos on kids.', durationHours: 2, capacity: 4, requiresWaiver: false },
          { title: 'Inflatable Obstacle Course Safety Marshall', description: 'Ensure kids remove shoes and only 2 enter at a time for safety.', durationHours: 2, capacity: 6, requiresWaiver: true }
        ],
        items: [
          { itemName: 'Carnival Prize Novelty Toy Packs', category: 'Prizes', quantityNeeded: 12, unit: 'packs' },
          { itemName: 'Hypoallergenic Face Paint & Brushes', category: 'Supplies', quantityNeeded: 4, unit: 'kits' }
        ]
      },
      {
        name: 'Concessions & Bake Sale',
        category: 'hospitality_food',
        leadTitle: 'Food & Beverage Chair',
        reportingGate: 'Cafeteria Kitchen Servery',
        dressCode: 'Apron (provided), hair tied back, closed-toe shoes',
        suggestedBudget: 600,
        shifts: [
          { title: 'Cotton Candy & Popcorn Machine Master', description: 'Operate commercial popcorn popper and spin fresh cotton candy.', durationHours: 2, capacity: 4, requiresWaiver: true },
          { title: 'Bake Sale Cashier & Tray Arranger', description: 'Receive baked good drop-offs, price items, and assist buyers.', durationHours: 2, capacity: 4, requiresWaiver: false },
          { title: 'Hot Dog & Pizza Slice Server', description: 'Keep warm food trays stocked and serve slices to families.', durationHours: 2, capacity: 6, requiresWaiver: true }
        ],
        items: [
          { itemName: 'Homemade Brownies (Plate of 12)', category: 'Bake Sale', quantityNeeded: 15, unit: 'plates' },
          { itemName: 'Gourmet Cupcakes (Box of 12)', category: 'Bake Sale', quantityNeeded: 15, unit: 'boxes' },
          { itemName: 'Gluten-Free / Allergy-Safe Baked Good Plate', category: 'Bake Sale', quantityNeeded: 10, unit: 'plates' },
          { itemName: 'Cases of Juice Boxes (40ct)', category: 'Drinks', quantityNeeded: 8, unit: 'cases' }
        ]
      },
      {
        name: 'Setup & Teardown Logistics',
        category: 'labor_setup',
        leadTitle: 'Logistics Lead',
        reportingGate: 'Gymnasium Rear Entrance',
        dressCode: 'Work gloves, durable sneakers',
        suggestedBudget: 200,
        shifts: [
          { title: 'Morning Canopy Tent & Table Setup', description: 'Erect 10x10 EZ-Up canopies and position 30 folding tables.', durationHours: 2.5, capacity: 8, requiresWaiver: true },
          { title: 'Evening Clean-Up & Trash Removal', description: 'Take down canopies, fold tables, empty trash cans into dumpster.', durationHours: 2, capacity: 8, requiresWaiver: true }
        ],
        items: [
          { itemName: 'Heavy Duty 55-Gallon Trash Bags (Box)', category: 'Supplies', quantityNeeded: 4, unit: 'boxes' },
          { itemName: '10x10 Pop-up Canopies with Sandbags', category: 'Equipment', quantityNeeded: 12, unit: 'tents' }
        ]
      }
    ],
    ticketTiers: [
      { title: 'All-Access Unlimited Carnival Wristband', type: 'admission_ticket', price: 25, fairMarketValue: 5, capacity: 350, instantCheckout: true, description: 'Unlimited turns on all 16 games, inflatables, and obstacle courses.', perks: ['Unlimited Game Turns', 'Bounce House Access', '1 Free Popcorn'] },
      { title: 'Carnival Ticket Book (25 Tickets)', type: 'admission_ticket', price: 20, fairMarketValue: 0, capacity: 200, instantCheckout: true, description: 'Good for games (2 tickets each) and bake sale items.', perks: ['25 Universal Tickets'] },
      { title: 'Family Champion Platinum Sponsor', type: 'sponsor_package', price: 500, fairMarketValue: 50, capacity: 10, instantCheckout: true, description: 'Prominent banner above the main entrance, 4 wristbands, and recognition in school newsletter.', perks: ['Entrance Banner Logo', '4 Free Wristbands', 'PTA Newsletter Shoutout'] }
    ]
  }
];

export const WAIVER_TEMPLATES_DATA: WaiverTemplate[] = [
  {
    id: 'waiver_minor_consent',
    orgId: 'org_lincoln_pta',
    title: 'Parental Consent & Minor Volunteer Safety Agreement',
    type: 'minor_consent',
    requiresMinorParentSignature: true,
    requiresEmergencyContact: true,
    content: `I, the undersigned parent or legal guardian of the participating minor volunteer, hereby grant full permission for my child to participate in volunteer activities with this organization. 

I certify that my child is in proper physical condition to participate. In the event of an emergency, I authorize the organization's designated leads and adult coordinators to secure emergency medical care and treatment as necessary.

I hereby release and hold harmless the organization, its directors, event planners, and supervisors from any liability or claims arising from participation in this community event.`
  },
  {
    id: 'waiver_general_liability',
    orgId: 'org_lincoln_pta',
    title: 'General Volunteer Assumption of Risk & Liability Release',
    type: 'general_liability',
    requiresMinorParentSignature: false,
    requiresEmergencyContact: true,
    content: `In consideration of being allowed to volunteer at this event, I acknowledge that volunteer work may involve physical activity, lifting, standing, and moving equipment.

I voluntarily assume all risks associated with my participation. I hereby release and hold harmless the organization, school district, facility, property owners, and coordinators from all liability, damages, or claims for personal injury or property damage.

I agree to follow all safety instructions provided by designated Committee Leads and coordinators on duty.`
  },
  {
    id: 'waiver_food_safety',
    orgId: 'org_lincoln_pta',
    title: 'Food Handler & Hospitality Safety Agreement',
    type: 'food_safety',
    requiresMinorParentSignature: false,
    requiresEmergencyContact: false,
    content: `I agree to adhere strictly to all food hygiene standards established for this event, including regular handwashing, glove usage when handling ready-to-eat foods, and temperature maintenance.

I certify that I am not currently suffering from any contagious illness or foodborne disease, and have not experienced symptoms of illness within the past 48 hours.`
  }
];
