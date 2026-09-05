import { z } from 'zod';

/**
 * REACH (R3Pro) Server-Side Request Validation Schemas
 * Standard: Strict Type Coercion, Format Validation, and XSS Sanitization
 */

// ----------------------------------------------------------------------------
// 1. Unified Volunteer & Supporter Registration Schema
// ----------------------------------------------------------------------------
export const registrationInputSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  primaryName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  primaryEmail: z.string().trim().email('Invalid email address').max(255),
  primaryPhone: z.string().trim().min(7, 'Invalid phone number').max(30),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birthdate must be YYYY-MM-DD').optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
  manageToken: z.string().max(255).optional(),
  
  // Household members & minors
  members: z.array(z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().optional().or(z.literal('')),
    phone: z.string().trim().optional().or(z.literal('')),
    birthDate: z.string().optional().or(z.literal('')),
    relationship: z.enum(['Self', 'Child', 'Spouse', 'Team Member', 'Friend']).default('Self'),
    isMinor: z.boolean().default(false),
    age: z.number().int().min(0).max(120).optional(),
    emergencyContactName: z.string().max(100).optional(),
    emergencyContactPhone: z.string().max(30).optional(),
    dietaryNotes: z.string().max(500).optional()
  })).min(1, 'At least one participant member is required'),

  // Shift selections
  shiftSelections: z.array(z.object({
    shiftId: z.string().min(1),
    groupMemberIndex: z.number().int().min(0)
  })).default([]),

  // Wishlist item pledges
  itemSelections: z.array(z.object({
    itemSlotId: z.string().min(1),
    quantity: z.number().int().positive('Quantity must be greater than 0')
  })).default([]),

  // Ticket / sponsor selections
  ticketSelections: z.array(z.object({
    ticketTierId: z.string().min(1),
    quantity: z.number().int().positive('Quantity must be greater than 0')
  })).default([]),

  // Direct donations
  donationAmount: z.number().min(0, 'Donation amount cannot be negative').default(0),
  feeCovered: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
  paymentMethod: z.string().default('stripe_card'),

  // Signed legal waivers (COPPA / Liability)
  waiverSignatures: z.array(z.object({
    memberIndex: z.number().int().min(0),
    waiverTemplateId: z.string().min(1),
    waiverTitle: z.string().min(1),
    waiverText: z.string().min(1),
    signerName: z.string().trim().min(2).max(100),
    signerRelationship: z.string().max(50).default('Self'),
    signatureData: z.string().min(5, 'Signature data is required')
  })).default([])
});

// ----------------------------------------------------------------------------
// 2. Event & Campaign Creation Schema
// ----------------------------------------------------------------------------
export const eventInputSchema = z.object({
  orgId: z.string().min(1, 'orgId is required'),
  eventKey: z.string().max(50).optional(),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  slug: z.string().trim().min(2).max(100).optional(),
  tagline: z.string().max(300).optional().default(''),
  description: z.string().max(5000).optional().default(''),
  tags: z.array(z.string().max(50)).default([]),
  startDate: z.string().datetime({ message: 'startDate must be a valid ISO datetime' }),
  endDate: z.string().datetime({ message: 'endDate must be a valid ISO datetime' }),
  venueName: z.string().max(200).optional().default(''),
  venueAddress: z.string().max(300).optional().default(''),
  mapUrl: z.string().url().optional().or(z.literal('')),
  isVirtual: z.boolean().default(false),
  virtualLink: z.string().url().optional().or(z.literal('')),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  theme: z.record(z.any()).optional().default({}),
  fundraisingGoal: z.number().min(0).default(5000),
  currency: z.string().length(3).default('USD'),
  status: z.enum(['draft', 'published', 'in_progress', 'completed', 'archived']).default('published'),
  approvalThresholdBudget: z.number().min(0).default(250),
  approvalThresholdSlots: z.number().int().min(1).default(5),
  reminderCadence: z.enum(['standard', 'intensive', 'same_day', 'custom']).default('standard'),
  allowFeeCoverage: z.boolean().default(true),
  dressCode: z.string().max(500).optional().default('')
});

// ----------------------------------------------------------------------------
// 3. Shift Creation Schema
// ----------------------------------------------------------------------------
export const shiftInputSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  subPartId: z.string().min(1, 'subPartId is required'),
  title: z.string().trim().min(2).max(150),
  description: z.string().max(1000).optional().default(''),
  startTime: z.string().datetime({ message: 'startTime must be a valid ISO datetime' }),
  endTime: z.string().datetime({ message: 'endTime must be a valid ISO datetime' }),
  capacity: z.number().int().min(1, 'Capacity must be at least 1 spot').default(4),
  minAge: z.number().int().min(0).max(100).optional(),
  skillsRequired: z.array(z.string().max(100)).default([]),
  requiresWaiver: z.boolean().default(true),
  waiverTemplateId: z.string().default('waiver_general_liability'),
  reportingLocationOverride: z.string().max(200).optional()
});

// ----------------------------------------------------------------------------
// 4. CRM Historical Service Record Schema
// ----------------------------------------------------------------------------
export const crmServiceInputSchema = z.object({
  volunteerId: z.string().min(1, 'volunteerId is required'),
  serviceRecord: z.object({
    eventTitle: z.string().trim().min(2).max(200),
    eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'eventDate must be YYYY-MM-DD'),
    rolesServed: z.array(z.string().max(100)).default([]),
    hoursContributed: z.number().min(0.25, 'Hours must be at least 15 minutes').max(100),
    itemsDonated: z.string().max(300).optional(),
    amountDonated: z.number().min(0).default(0),
    eventOutcomeRaised: z.number().min(0).default(0),
    verifiedBy: z.string().max(100).optional()
  })
});

// ----------------------------------------------------------------------------
// 5. Door Kiosk 1-Tap Check-In Schema
// ----------------------------------------------------------------------------
export const kioskCheckInInputSchema = z.object({
  registrationId: z.string().min(1, 'registrationId is required'),
  shiftId: z.string().min(1, 'shiftId is required'),
  memberId: z.string().min(1, 'memberId is required'),
  checkedInBy: z.string().max(100).optional().default('Door Kiosk Station')
});

// ----------------------------------------------------------------------------
// 6. Auth Passwordless OTP Schema
// ----------------------------------------------------------------------------
export const authSendOtpSchema = z.object({
  identifier: z.string().trim().min(3, 'Email or Phone is required').max(255)
});

export const authVerifyOtpSchema = z.object({
  identifier: z.string().trim().min(3, 'Email or Phone is required').max(255),
  code: z.string().trim().length(6, 'Verification code must be exactly 6 digits').regex(/^\d{6}$/, 'Code must contain only digits')
});
