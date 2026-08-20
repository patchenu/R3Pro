# R3Pro — Enterprise Event Planning, Volunteer Coordination & Fundraising Platform

R3Pro is an enterprise-grade web application combining the volunteer coordination ease of SignUpGenius, the campaign fundraising power of GoFundMe, and the booth commerce of Eventbrite into a secure, multi-tenant platform.

---

## 🌟 Key Capabilities

1. **Multi-Tenant Organization Memory & CRM**:
   - Permanent 5-year cross-event volunteer history, lifetime hours, donor totals, attendance reliability, and skill tags.
   - Turnkey Organization Templates (*School/PTA, Non-Profit Foundation, Youth Sports League, Church/Faith, Corporate Giving*).

2. **Event Sub-Parts (Committees) & Variable Approval Thresholds**:
   - Partition events into modular departments (*Labor & Setup, Food & Hospitality, Vendors & Sponsors, Silent Auction, Registration*).
   - Leads have scoped workspaces and can broadcast strictly to their department's volunteers.
   - Variable threshold engine: actions within limits auto-publish; actions exceeding limits route to the Planner's 1-Click Approval Queue.

3. **Frictionless Volunteer & Family Sign-Up with Legal Waivers**:
   - 10-second unified claim (volunteer shift + item pledges + donations in one card).
   - Parent/child & family group sign-ups with overlap/conflict prevention.
   - Digital signature pad capturing legally binding parental consent and liability waivers.

4. **Multi-Stream Fundraising & Vendor Marketplace**:
   - Direct donations with fee coverage toggle (+2.9% + $0.30).
   - Commercial vendor booth applications with Tax ID/EIN, electricity options, and Certificate of Insurance (COI) verification.
   - Downloadable corporate invoices (Net-15/30 terms).
   - Automated IRS 501(c)(3) tax acknowledgement receipts.

5. **Real-Time Gap Analysis & Event Intelligence**:
   - Automated alerts for critical shifts <50% filled within 72h.
   - Supply shortage monitoring and no-show risk predictor.
   - 1-Click Auto-Fill: Blast past CRM volunteers.

6. **Comprehensive 1-Click Export Suite**:
   - Print-Ready Formatted PDF Rosters with physical check-in boxes.
   - Official IRS 501(c)(3) Donor Contribution Statements.
   - Printable Volunteer Name Badges & Lanyards (with individual QR codes).
   - Excel / CSV Financial Accounting Ledgers.

7. **Day-of-Event Check-In (All 3 Modes Supported)**:
   - Full-Screen Tablet Kiosk Mode with fast phone/name lookup and on-site door waiver signing.
   - Station Mobile QR Scanner.
   - Master Digital Roster with 1-tap check-in toggle.

8. **Interactive 1-Click Role Switcher**:
   - Seamlessly test as **Org Admin (Elena)**, **Event Planner (Marcus)**, **Food Lead (Sarah)**, **Labor Lead (Mike)**, **Vendor (Artisan Bakery)**, **Volunteer (David)**, or **Tablet Kiosk**.

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
