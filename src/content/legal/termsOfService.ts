export const TERMS_OF_SERVICE_CONTENT = {
  title: 'GatherRaise Terms of Service',
  lastUpdated: 'September 5, 2026',
  version: '2.4.0',
  summary: 'These Terms of Service govern your use of the GatherRaise platform (R3Pro), including volunteer shift scheduling, charitable donations, ticket purchases, commercial sponsorship packages, and digital liability waivers.',
  sections: [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms & User Eligibility',
      content: `By accessing, browsing, registering for an event, claiming a volunteer shift, pledging items, purchasing tickets, or submitting donations through GatherRaise (referred to herein as "GatherRaise," "the Platform," "we," "us," or "our"), you ("User," "Volunteer," "Donor," "Organizer," or "Vendor") agree to be legally bound by these Terms of Service ("Terms") and our Privacy Policy.

If you do not agree to these Terms, do not access or use the Platform. You represent that you are at least 18 years of age or an emancipated minor possessing legal capacity, or that you are the parent or legal guardian of a minor participant for whom you are completing registration and digital consent.`
    },
    {
      id: 'tenancy-roles',
      title: '2. Multi-Tenant Architecture & Role Governance',
      content: `GatherRaise operates as a multi-tenant platform serving community organizations, educational institutions, non-profit foundations, faith communities, and sports leagues.

• Org Super Admins & Executives: Possess full administrative authority over their organization workspace, master CRM, team member roles, and financial records.
• Event Planners & Chairs: Possess authority over designated campaigns, schedules, sub-parts, committee delegations, and variable approval queues.
• Committee Leads: Authorized solely to manage designated departments (e.g., Labor & Setup, Food & Hospitality, Vendors) within assigned approval thresholds.
• Volunteers & Donors: Granted non-exclusive self-service access via secure 256-bit manage tokens or verified passwordless 6-digit one-time passcodes (OTP).`
    },
    {
      id: 'org-reps',
      title: '3. Organization Representations & 501(c)(3) Tax Status',
      content: `Organizations utilizing GatherRaise represent and warrant that:
(a) All tax classification claims (e.g., 501(c)(3), School PTA, 501(c)(4), Booster Club) and Employer Identification Numbers (EIN) entered into the Platform are accurate, active, and verified with the Internal Revenue Service (IRS).
(b) Charitable donation appeals comply with all applicable state charitable solicitation registration statutes and IRS regulations.
(c) The organization is solely responsible for fulfilling perks, honoring volunteer shifts, delivering advertised event activities, and issuing lawful tax receipts.`
    },
    {
      id: 'minors-coppa',
      title: '4. Youth Volunteering, Minor Safety & Parental Consent',
      content: `GatherRaise is committed to minor safety and full compliance with the Children's Online Privacy Protection Act (COPPA).

• Household Dependent Mental Model: Volunteers under the age of 18 or 13 must be registered as dependent household members linked to an adult parent or legal guardian primary account.
• Zero Direct Minor Contact Information: Minors are never prompted for independent email addresses, phone numbers, or passwords.
• Mandatory Parental Co-Signature: Any volunteer shift or event activity involving a minor requires explicit digital signature consent from the parent or legal guardian before check-in passes are activated.
• Student Community Service Hours: Service hours verified by authorized coordinators are provided solely for educational, scouting, or scholarship accreditation.`
    },
    {
      id: 'waivers-esign',
      title: '5. Digital Liability Waivers & E-SIGN Act Compliance',
      content: `By executing a digital signature on the Platform (via vector canvas touch/mouse stroke or typed legal confirmation), you agree that your digital signature constitutes a legally binding electronic signature under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act, 15 U.S.C. § 7001 et seq.) and the Uniform Electronic Transactions Act (UETA).

You expressly agree to assume all inherent risks associated with volunteer activities (including physical labor, food handling, and outdoor conditions) and release the hosting Organization, its officers, event leads, and GatherRaise from any general liability claims to the fullest extent permitted by applicable law.`
    },
    {
      id: 'financials-stripe',
      title: '6. Payments, Donations, Fees & In-Kind Substantiation',
      content: `• Payment Processing: All credit card, Apple Pay, and debit card transactions are processed securely via Stripe, Inc. (a PCI-DSS Level 1 certified payment service provider). GatherRaise does not store raw credit card numbers or CVVs.
• Voluntary Fee Coverage: Attendees and donors may elect to cover payment processing fees (+2.9% + $0.30) to ensure 100% of their intended gift reaches the organization.
• Quid Pro Quo Deductions: In accordance with IRS Publication 526 and IRC § 170(f)(8), commercial sponsorship packages and admission tickets calculate tax-deductible portions net of Fair Market Value (FMV) perks provided.
• In-Kind Property: Drop-off item pledges are acknowledged with non-cash receipt vouchers pursuant to IRS Publication 561.
• Refund Policy: Charitable donations and volunteer shift registrations are generally non-refundable unless explicitly approved by the hosting Organization.`
    },
    {
      id: 'communications-tcpa',
      title: '7. SMS & Email Communications (A2P 10DLC & CAN-SPAM)',
      content: `By submitting your mobile number and checking the SMS consent box, you authorize GatherRaise and the hosting Organization to deliver automated transactional and operational text messages (including check-in QR passes, shift arrival directions, gate updates, and emergency schedule notices).

• Message frequency varies per event (~3–5 messages per campaign).
• Standard message and data rates may apply.
• You may opt out at any time by replying STOP, CANCEL, or UNSUBSCRIBE.
• You may obtain help by replying HELP or contacting support@gatherraise.com.
• We strictly enforce a Zero Third-Party Sharing policy: Mobile originator opt-in data will never be sold, rented, or shared with third parties or affiliates for marketing purposes.`
    },
    {
      id: 'prohibited-conduct',
      title: '8. Prohibited Conduct & System Integrity',
      content: `You agree not to:
(a) Access or attempt to access another user's or tenant's account, manage token, or organization records without explicit authorization.
(b) Transmit spam, automated solicitations, or fraudulent fundraising appeals.
(c) Tamper with or reverse-engineer Row-Level Security (RLS) policies, cryptographic OTP verification routines, or database triggers.
(d) Use automated bots, scrapers, or spiders to extract volunteer directories or donor CRM data.`
    },
    {
      id: 'disclaimers',
      title: '9. Disclaimer of Warranties & Limitation of Liability',
      content: `THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. GATHERRAISE DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.

TO THE MAXIMUM EXTENT PERMITTED BY LAW, GATHERRAISE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL ARISING FROM YOUR USE OF THE SERVICE OR ATTENDANCE AT ANY EVENT.`
    },
    {
      id: 'arbitration',
      title: '10. Governing Law, Dispute Resolution & Class Action Waiver',
      content: `These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law principles.

Any dispute, claim, or controversy arising out of or relating to these Terms shall be settled by binding individual arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. YOU WAIVE ANY RIGHT TO COMMENCE OR PARTICIPATE IN ANY CLASS ACTION, COLLECTIVE ACTION, OR REPRESENTATIVE PROCEEDING AGAINST GATHERRAISE.`
    }
  ]
};
