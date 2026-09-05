# R3Pro — Enterprise Event Planning, Volunteer Coordination & Fundraising Platform

R3Pro is an enterprise-grade web application combining the volunteer coordination ease of SignUpGenius, the campaign fundraising power of GoFundMe, and the booth commerce of Eventbrite into a secure, multi-tenant platform.

---

## 🌟 Key Capabilities

1. **Master Events Portfolio & Single-Pane Campaign Outcomes**:
   - **Executive Organization Hub**: Single command center for Org Owners and Super Admins to monitor all upcoming active events and completed historical campaigns.
   - **Financial & Logistical Telemetry**: Real-time gross revenue tracking vs goals, volunteer shift fulfillment %, committee staffing, and in-kind items collected.
   - **1-Click Event Campaign Dossier & Outcomes**: Comprehensive outcome reports displaying revenue breakdowns, volunteer labor economic valuation ($31.80/hr rate), in-kind wishlist fulfillment, and 1-click PDF/CSV export triggers.

2. **Volunteer & Donor CRM Tagging Intelligence & Multi-Year Memory**:
   - **3-Layer Tagging Taxonomy**: Automated behavioral system badges (*Reliable Helper, VIP Donor, Parent Volunteer, Alumni*), curated organizational role library (*Board Member, Certified First Aid, Truck Owner, Master Baker*), and custom ad-hoc tagging (`+ Add Custom Tag`).
   - **Historical Event Outcome Tie-Back**: Every volunteer's detailed profile displays a chronological ledger of all events supported, roles served, hours logged, and direct tie-back to the event's fundraising outcome (*e.g. "Event Outcome: Raised $11,450 for Lincoln High STEM Lab"*).
   - **Estimated Lifetime Economic Value ($)**: Combines volunteer labor valuation with direct philanthropic giving.
   - **Editable Coordinator Internal Notes**: Record corporate matching context, family ties, and notes on the fly.

3. **Unified Planner Hub & Dynamic Committee Creator**:
   - **Planner Hub Command Center**: Unified workspace for *Committees & Budgets*, *Volunteer Manifest*, *Item Pledges & Receiving*, *Marketing & Flyers*, *Gap Analysis*, *Vendor Marketplace*, and *Reports & Badges*.
   - **Interactive Committee & Need Creation Suite**: 1-click modals to add custom departments, assign leads, allocate budgets, and publish volunteer shift and supply needs.
   - **Variable Approval Engine**: Actions within limits auto-publish; changes exceeding thresholds route to the Planner's 1-Click Approval Queue.

4. **Item Pledges & Physical Drop-Off Receiving Station**:
   - Track physical delivery of supply/equipment pledges with timestamps, receiving volunteer names, and donor condition notes.
   - Automated **IRS In-Kind Non-Cash Donation Acknowledgement Letters** (IRS Pub 526/561) with FMV calculations and gate manifests.

5. **Legal Waivers, Minor Consent & E-Sign Compliance Studio**:
   - Centralized studio for creating and customizing legal documents (*Parental Consent for Minors, General Liability, Food Safety, Photo/Media Release*).
   - Interactive Live E-Sign Sandbox for testing HTML5 vector canvas signatures.
   - Immutable **Executed E-Signatures Compliance Audit Ledger** capturing signer relationships, timestamps, and IP addresses with 1-click insurance report exports.

6. **Frictionless Volunteer & Family Sign-Up with Legal Waivers**:
   - 60-second unified claim (volunteer shifts + item pledges + tickets + donations in one flow).
   - Parent/child & family group sign-ups with zero double-booking overlap detection.
   - Digital signature pad capturing legally binding parental consent and liability waivers.

7. **Multi-Stream Fundraising & Vendor Marketplace**:
   - Direct donations with fee coverage toggle (+2.9% + $0.30).
   - Commercial vendor booth applications with Tax ID/EIN, electricity options, and Certificate of Insurance (COI) verification.
   - Downloadable corporate invoices (Net-15/30 terms).
   - Automated IRS 501(c)(3) tax acknowledgement receipts.

8. **Real-Time Gap Analysis & Event Intelligence**:
   - Automated alerts for critical shifts <50% filled within 72h.
   - Supply shortage monitoring and no-show risk predictor.
   - 1-Click Auto-Fill: Broadcast past CRM volunteers.

9. **Comprehensive 1-Click Export Suite**:
   - Print-Ready Formatted PDF Rosters with physical check-in boxes.
   - Official IRS 501(c)(3) Donor Contribution Statements.
   - Student Community Service Verification Certificates for school graduation / NHS hours.
   - Printable Volunteer Name Badges & Lanyards (with individual QR codes).
   - Excel / CSV Financial Accounting Ledgers.

10. **Day-of-Event Check-In (All 3 Modes Supported)**:
    - Full-Screen Tablet Kiosk Mode with fast phone/name lookup and on-site door waiver signing.
    - Station Mobile QR Scanner.
    - Master Digital Roster with 1-tap check-in toggle.

11. **Interactive Persona Simulator & Live Environment Switcher**:
    - Switch between **Demo Mode** (sample data & instant persona switching across Elena, Marcus, Sarah, Artisan Bakery, David) and **Live Non-Demo Mode** (unauthenticated public registration, org creation gates, and real testing).

12. **7-Step Guided Interactive Event Builder Wizard**:
    - Multi-stage setup covering *1. Source Strategy & Blueprints*, *2. Campaign Essentials & Schedule*, *3. Committee Departments & Leadership Leads*, *4. Volunteer Shifts*, *5. Supply Wishlists*, *6. Sponsorship Packages & Commercial Tiers*, and *7. Discovery Tags, Rules & 1-Click Launch*.

13. **Multi-Tenant Email & SMS Dispatch Studio**:
    - Transactional email API integration (**Resend API / Postmark / AWS SES**), custom domain DKIM/SPF DNS verification, and live test dispatch sandbox.
    - Formalized SMS 10DLC gateway roadmap backlog (Twilio / Telnyx, automated T-72h/24h/2h reminders, and SMS OTP logins).

14. **Volunteer "Build Your Day" Visual Schedule Timeline Bar & Overlap Engine**:
    - Floating interactive schedule timeline dynamically computing cumulative community service hours with zero-conflict temporal overlap collision detection and break interval analysis.

15. **1-Click Multi-Channel Campaign Launch Kit & Outreach Suite**:
    - Printable 8.5x11 PDF gate posters with detachable perforated tear-off QR tabs, pre-written email/newsletter blasts, social media share packs, responsive iframe embeds, and volunteer CRM pool re-engagement blasts.

16. **Pro-Bono In-Kind Professional Service Ledger**:
    - Dedicated tracking and delivery verification for commercial professional services (*Graphic Design, Sound/Audio, Legal, Electrical, Photography*) with automated Fair Market Value (FMV) offsets.

17. **Master Broadcast Announcements Hub**:
    - Real-time multi-channel broadcast creation (*Email, SMS, Mobile Push, Gate Kiosk*) with urgency tiering (*Normal, Urgent, Critical*) and immutable dispatch ledgers.

18. **Comprehensive Legal Policies Suite & A2P 10DLC Compliance**:
    - Complete legal compliance corpus (*Terms of Service, Privacy Policy, COPPA Minor Privacy, California Notice at Collection & Do Not Sell/Share, SMS A2P 10DLC Policy, IRS 501(c)(3) Tax Substantiation Policy*).
    - Unified 6-tab modal viewer (`LegalModalCenter.tsx`), standardized A2P 10DLC non-prechecked opt-in block (`SmsOptInConsentBlock.tsx`), and global compliance badge footer (`GlobalAppFooter.tsx`).

19. **Best-of-Breed Production Security & Automated Database Backup Schedule**:
    - **SOC 2 Type II**: Timing-safe OTP comparison (`crypto.timingSafeEqual`), HMAC-SHA256 JWT sessions in `HttpOnly`, `Secure`, `SameSite=Strict` cookies, sliding-window rate limiting, and enterprise HTTP security headers.
    - **COPPA & Minor PII Safety**: Household mental model with zero minor contact info collection and parent/guardian co-signing vector signature ledgers.
    - **IRS 501(c)(3) Immutability Trigger**: PostgreSQL database trigger `prevent_immutable_tax_receipt_tampering` prevents mutation or deletion of issued tax receipts.
    - **100% PostgreSQL Row-Level Security (RLS)**: Active across all 20 relational database tables on Vercel Postgres (Neon).
    - **Automated Backup & Disaster Recovery Engine**: Gzip SQL dumps with SHA-256 integrity verification, JSON manifest logging, and <5 min RPO / <15 min RTO.

20. **Admin Observability, User Impersonation & Account Lifecycle Management**:
    - **User Impersonation ("See What They See")**: Super Admins can safely step into any user's exact perspective with a sticky top banner and 1-click session exit, backed by immutable SOC 2 audit logs.
    - **Full Account Management & Telemetry**: Create, edit, suspend (with authentication blocking), issue 6-digit emergency OTP resets, and track login counts, last seen IPs, and 2FA status.
    - **Sentry Exception Tracking & Diagnostics**: Live error stream with severity tagging, stack traces, issue resolution, and interactive error simulation.
    - **Core Web Vitals & Latency Metrics**: Real-time tracking of LCP, INP, CLS, FCP, TTFB, and backend API latency distributions.
    - **Infrastructure Uptime Probes**: Live health checks for Neon PostgreSQL, Redis, AWS SES / Resend, and 10DLC SMS endpoints with 1-click on-demand audits.

21. **Spotlight Command Palette (⌘K) & Role/Scope Studio**:
    - **Global Keyboard Shortcut (`⌘K` / `Ctrl+K`)**: Rapidly search and inspect any account across tens of thousands of users across all tenant organizations.
    - **3-Dimensional Multi-Tenant Faceted Rail**: Filter by Organization, dynamic Role counts, and Committee Department Sub-Parts.
    - **Perspective Preview Dossier**: Comprehensive user telemetry, 2FA status, and granular permission breakdown.
    - **On-the-Fly Role & Scope Modifier**: Instant role adjustments and multi-select committee department assignments.
    - **1-Click Super Admin Promotion & Demotion**: 1-tap elevation with SOC 2 Type II immutable audit logging.


---

## 🛠️ Local Development & Database Operations

### Prerequisites
- Node.js v18+ and npm

### Installation & Launch
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run PostgreSQL database migration & verify RLS
npm run db:migrate
npm run db:verify

# Perform automated database backup & verification
npm run db:backup

# Restore database from backup snapshot
npm run db:restore

# Build for production
npm run build
```

---

## 🚀 GitHub & Production Hosting

1. **GitHub Remote Operations**:
   - Primary authorized account: `patchenu` (`patchenu@yahoo.com`)
   - Repository: `https://github.com/patchenu/R3Pro.git`
2. **Deploy to Vercel**:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Configured with serverless `/api` endpoints, HTTP security headers, and Neon PostgreSQL connection pooling.

---

## 📚 Custom Antigravity Skills Included

Located in `.agents/skills/`:
- `event-gap-analyzer`: Automated diagnostic scanning for critical staffing and supply shortages.
- `volunteer-waiver-auditor`: Legal compliance auditing for COPPA minor consent and liability waivers with vector signature verification.
- `tax-receipt-generator`: Formats IRS 501(c)(3) tax acknowledgement letters with FMV deduction offsets and statutory disclosures.
- `reminder-schedule-dispatcher`: Evaluates reminder cadences (72h, 24h, 2h) and generates shift logistics.
- `vendor-booth-allocator`: Reviews commercial vendor applications and calculates booth grid maps.

