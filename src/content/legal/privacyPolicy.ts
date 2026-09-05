export const PRIVACY_POLICY_CONTENT = {
  title: 'REACH Privacy Policy',
  lastUpdated: 'September 5, 2026',
  version: '2.4.0',
  summary: 'This Privacy Policy explains how REACH collects, uses, protects, and discloses personal information when you use our volunteer scheduling, fundraising, and event coordination platform.',
  sections: [
    {
      id: 'commitment',
      title: '1. Our Privacy Commitment & Zero-Sale Guarantee',
      content: `At REACH, we believe community engagement thrives on trust. We adhere to a strict, legally binding principle:

REACH DOES NOT SELL, RENT, TRADE, OR MONETIZE YOUR PERSONAL INFORMATION, VOLUNTEER ROSTERS, DONOR HISTORIES, OR MOBILE PHONE NUMBERS TO ANY THIRD-PARTY ADVERTISERS, DATA BROKERS, OR AFFILIATES.

We collect personal data solely to fulfill event logistics, volunteer shift coordination, tax receipt substantiation, and safety compliance.`
    },
    {
      id: 'information-collected',
      title: '2. Information We Collect & Sources',
      content: `We collect the following categories of information:

A. Information You Provide Directly:
• Contact Identifiers: Full legal name, email address, mobile phone number, and physical mailing address.
• Age Verification & Eligibility: Date of birth (to compute minor status and determine parental consent requirements).
• Household Dependents: Names, relationships, and ages of family members or children participating under your primary registration. (Note: We never ask minors for their independent email or phone number).
• Digital Vector Signatures: Vector canvas stroke coordinates, typed legal confirmations, signer relationships, and timestamps executed on liability waivers.
• Supply Wishlist & In-Kind Pledges: Item descriptions, pledge quantities, and drop-off records.
• Commercial Vendor Data: Business name, Tax EIN, booth dimensions, Certificate of Insurance (COI) documents, and power requirements.

B. Financial & Transaction Data:
• Payment tokens, transaction amounts, voluntary fee coverage choices, and receipt identifiers. All payment cards are processed directly by Stripe (PCI-DSS Level 1); REACH never receives or stores raw card PANs or CVVs.

C. Automatically Collected Technical Data:
• IP address, browser type, device information, operating system, and request timestamps used strictly for rate limiting, anti-DDoS protection, audit logging, and legal e-sign validity under the E-SIGN Act.`
    },
    {
      id: 'purposes',
      title: '3. How We Use Your Information',
      content: `We use your information exclusively for the following business purposes:
• Delivering digital QR check-in boarding passes and self-service registration links.
• Dispatching automated operational SMS reminders (T-72h, T-24h, T-2h) and gate arrival notices.
• Enforcing our Zero Double-Booking anti-collision scheduling engine.
• Issuing official IRS 501(c)(3) tax acknowledgement letters and student service verification certificates.
• Facilitating variable budget and shift capacity approvals between Event Chairs and Committee Leads.
• Maintaining permanent, multi-year organization CRM memory for verified non-profit organizations.`
    },
    {
      id: 'sharing',
      title: '4. Third-Party Disclosures & Sub-Processors',
      content: `We disclose personal information strictly to authorized sub-processors necessary to provide our service:
• Hosting Organization: The specific non-profit, PTA, school, or foundation hosting the event you registered for.
• Cloud Infrastructure: Vercel (Edge Compute & Serverless API) and Neon (Encrypted PostgreSQL Database with Row-Level Security).
• Payment Processing: Stripe, Inc. (PCI-DSS Level 1).
• Communications Gateways: Resend / AWS SES (Transactional Email) and Twilio (A2P 10DLC SMS Reminders).
• Legal & Safety Compliance: Law enforcement or regulatory authorities only when required by valid subpoena or court order.

Text messaging originator opt-in data and consent will not be shared with any third parties under any circumstances.`
    },
    {
      id: 'security-retention',
      title: '5. Security Architecture & Data Retention',
      content: `We enforce defense-in-depth SOC 2 Type II security controls:
• 100% PostgreSQL Row-Level Security (RLS) across all 20 relational database tables.
• Timing-Safe Cryptographic OTP Comparisons (crypto.timingSafeEqual) preventing side-channel attacks.
• Stateless HMAC-SHA256 JWT sessions stored in HttpOnly, Secure, SameSite=Strict cookies.
• IRS 501(c)(3) Immutability Triggers preventing tampering with issued tax receipts.
• Database Backups: Continuous Point-In-Time Recovery (PITR) up to 30 days and 7-year statutory archives for Form 990 audit ledgers.`
    },
    {
      id: 'contact',
      title: '6. Privacy Inquiries & Data Subject Requests',
      content: `To exercise your rights to access, review, correct, or delete your personal data (or your child's data), contact our Data Protection Officer:

REACH Privacy & Compliance Office
Email: privacy@reachplatform.com
Phone: (800) 555-0199
Address: 100 Innovation Way, Suite 400, Wilmington, DE 19801`
    }
  ]
};
