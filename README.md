# R3Pro — Enterprise Event Planning, Volunteer Coordination & Fundraising Platform

R3Pro is an enterprise-grade web application combining the volunteer coordination ease of SignUpGenius, the campaign fundraising power of GoFundMe, and the booth commerce of Eventbrite into a secure, multi-tenant platform.

---

## 🌟 Key Capabilities

1. **Multi-Tenant Organization Memory & CRM**:
   - Permanent 5-year cross-event volunteer history, lifetime hours, donor totals, attendance reliability, and skill tags.
   - Turnkey Organization Templates (*School/PTA, Non-Profit Foundation, Youth Sports League, Church/Faith, Corporate Giving*).
   - **Organization Branding & Signatory Hub**: Custom logo uploads, brand color themes, and digital signatory configuration.

2. **Unified Planner Hub & Dynamic Committee Creator**:
   - **Planner Hub Command Center**: Unified workspace for *Committees & Budgets*, *Volunteer Manifest*, *Item Pledges & Receiving*, *Marketing & Flyers*, *Gap Analysis*, *Vendor Marketplace*, and *Reports & Badges*.
   - **Interactive Committee & Need Creation Suite**: 1-click modals to add custom departments, assign leads, allocate budgets, and publish volunteer shift and supply needs.
   - **Variable Approval Engine**: Actions within limits auto-publish; changes exceeding thresholds route to the Planner's 1-Click Approval Queue.

3. **Item Pledges & Physical Drop-Off Receiving Station**:
   - Track physical delivery of supply/equipment pledges with timestamps, receiving volunteer names, and donor condition notes.
   - Automated **IRS In-Kind Non-Cash Donation Acknowledgement Letters** (IRS Pub 526/561) with FMV calculations and gate manifests.

4. **Legal Waivers, Minor Consent & E-Sign Compliance Studio**:
   - Centralized studio for creating and customizing legal documents (*Parental Consent for Minors, General Liability, Food Safety, Photo/Media Release*).
   - Interactive Live E-Sign Sandbox for testing HTML5 vector canvas signatures.
   - Immutable **Executed E-Signatures Compliance Audit Ledger** capturing signer relationships, timestamps, and IP addresses with 1-click insurance report exports.

5. **Frictionless Volunteer & Family Sign-Up with Legal Waivers**:
   - 60-second unified claim (volunteer shifts + item pledges + tickets + donations in one flow).
   - Parent/child & family group sign-ups with zero double-booking overlap detection.
   - Digital signature pad capturing legally binding parental consent and liability waivers.

6. **Multi-Stream Fundraising & Vendor Marketplace**:
   - Direct donations with fee coverage toggle (+2.9% + $0.30).
   - Commercial vendor booth applications with Tax ID/EIN, electricity options, and Certificate of Insurance (COI) verification.
   - Downloadable corporate invoices (Net-15/30 terms).
   - Automated IRS 501(c)(3) tax acknowledgement receipts.

7. **Real-Time Gap Analysis & Event Intelligence**:
   - Automated alerts for critical shifts <50% filled within 72h.
   - Supply shortage monitoring and no-show risk predictor.
   - 1-Click Auto-Fill: Broadcast past CRM volunteers.

8. **Comprehensive 1-Click Export Suite**:
   - Print-Ready Formatted PDF Rosters with physical check-in boxes.
   - Official IRS 501(c)(3) Donor Contribution Statements.
   - Student Community Service Verification Certificates for school graduation / NHS hours.
   - Printable Volunteer Name Badges & Lanyards (with individual QR codes).
   - Excel / CSV Financial Accounting Ledgers.

9. **Day-of-Event Check-In (All 3 Modes Supported)**:
   - Full-Screen Tablet Kiosk Mode with fast phone/name lookup and on-site door waiver signing.
   - Station Mobile QR Scanner.
   - Master Digital Roster with 1-tap check-in toggle.

10. **Interactive Persona Simulator & Live Environment Switcher**:
    - Switch between **Demo Mode** (sample data & instant persona switching across Elena, Marcus, Sarah, Artisan Bakery, David) and **Live Non-Demo Mode** (unauthenticated public registration, org creation gates, and real testing).

---

## 🛠️ Local Development & Running

### Prerequisites
- Node.js v18+ and npm

### Installation & Launch
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 🚀 GitHub & Production Hosting

1. **Create a GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GatherRaise platform"
   git remote add origin https://github.com/your-username/gather-raise.git
   git push -u origin main
   ```
2. **Deploy to Vercel / Netlify / Cloudflare Pages**:
   - Connect your GitHub repository.
   - Build command: `npm run build`
   - Output directory: `dist`
   - Automatic CI/CD deploys every push to `main`!

---

## 📚 Custom Antigravity Skills Included

Located in `.agents/skills/`:
- `event-gap-analyzer`: Automated diagnostic scanning for critical staffing and supply shortages.
- `volunteer-waiver-auditor`: Compliance auditing for minor consent and liability waivers.
- `tax-receipt-generator`: Formats IRS 501(c)(3) tax acknowledgement letters with FMV offsets.
- `reminder-schedule-dispatcher`: Evaluates reminder cadences (72h, 24h, 2h) and generates shift logistics.
- `vendor-booth-allocator`: Reviews commercial vendor applications and calculates booth grid maps.
