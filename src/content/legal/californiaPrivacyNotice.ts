export const CALIFORNIA_PRIVACY_NOTICE_CONTENT = {
  title: 'California Privacy Notice & Notice at Collection',
  lastUpdated: 'September 5, 2026',
  version: '2.4.0',
  summary: 'This California Privacy Notice supplements the GatherRaise Privacy Policy and applies solely to California residents pursuant to the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA, Cal. Civ. Code § 1798.100 et seq.).',
  sections: [
    {
      id: 'notice-at-collection',
      title: '1. California Notice at Collection',
      content: `The following table details the categories of Personal Information GatherRaise has collected from California consumers within the preceding twelve (12) months, the business purposes for collection, and the applicable statutory retention schedule:

• Category A: Identifiers (Legal Name, Alias, Email Address, Phone Number, Unique 256-bit Manage Token, IP Address).
  - Purpose: Account provisioning, shift assignment, security rate limiting, ticket delivery.
  - Retention: Duration of organization account + 3 years, or until deleted by user.

• Category B: California Customer Records (Name, Signature Vector, Address, Telephone Number).
  - Purpose: Legal waiver execution, door check-in pass lookup, emergency medical contact.
  - Retention: 5 years (statute of limitations for general liability claims).

• Category C: Protected Classifications (Age / Date of Birth for minor status verification).
  - Purpose: COPPA compliance, parental consent enforcement, youth shift eligibility.
  - Retention: Duration of household active participation.

• Category D: Commercial Information (Ticket tiers purchased, donation history, in-kind pledges, sponsorship agreements).
  - Purpose: Financial ledger accounting, Form 990 reporting, Stripe reconciliation.
  - Retention: 7 years (IRS mandatory tax audit retention schedule).

• Category F: Internet or Network Activity (Browser type, access timestamps, rate limit logs).
  - Purpose: Anti-fraud, anti-bot protection, SOC 2 audit logs.
  - Retention: 90 days in active logs; 1 year in cold archive.

• Category I: Professional or Employment-Related Information (For commercial vendors and pro-bono service providers: Business Name, Tax EIN, trade certifications).
  - Purpose: Vendor marketplace booth allocation, Form 1099 non-employee reporting.
  - Retention: 7 years.`
    },
    {
      id: 'do-not-sell-share',
      title: '2. "Do Not Sell or Share My Personal Information"',
      content: `GatherRaise DOES NOT SELL your Personal Information and DOES NOT SHARE your Personal Information for cross-context behavioral advertising.

Because we do not sell or share personal information for monetary or other valuable consideration, we do not provide an opt-out mechanism for sales. We strictly preserve your data solely for event coordination and 501(c)(3) non-profit operations.`
    },
    {
      id: 'sensitive-pi',
      title: '3. Limit the Use of Sensitive Personal Information',
      content: `We collect sensitive personal information (date of birth and vector signature data) solely to perform the services reasonably expected by an average consumer (age verification for minor safety and liability waiver execution). We do NOT use sensitive personal information for inferring characteristics or any secondary commercial purpose.`
    },
    {
      id: 'consumer-rights',
      title: '4. Your Rights Under the CCPA/CPRA',
      content: `As a California resident, you have the following statutory rights:
1. Right to Know & Access: Request disclosure of categories and specific pieces of personal information collected about you.
2. Right to Delete: Request deletion of your personal information, subject to statutory exemptions (e.g., IRS tax receipt records that must be retained for 7 years).
3. Right to Correct: Request correction of inaccurate personal information.
4. Right to Non-Discrimination: We will never deny services, charge different prices, or provide a lower quality of service for exercising your CCPA rights.
5. Authorized Agent: You may designate an authorized agent registered with the California Secretary of State to submit requests on your behalf.`
    },
    {
      id: 'submit-request',
      title: '5. Submitting a California Consumer Request',
      content: `To submit a verifiable consumer request:
• Web Portal: Click "Do Not Sell / Manage Privacy" in the global footer.
• Email: privacy@gatherraise.com (Subject: "CCPA Consumer Request")
• Toll-Free Phone: 1-800-555-0199

We verify your identity by matching provided email and phone records with verified 6-digit OTP confirmation before processing any data disclosure or deletion request.`
    }
  ]
};
