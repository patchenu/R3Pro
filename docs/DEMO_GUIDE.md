# GatherRaise Interactive Demo & Persona Testing Guide

GatherRaise includes a top **Role Switcher Bar** in testing mode, allowing you to instantly switch personas and explore the complete workflow from every stakeholder's perspective.

---

## 1. Persona Scenarios

### 👑 Persona 1: Elena Rostova (Org Super Admin)
* **Organization**: Lincoln High School PTA
* **What to Test**:
  1. **🎪 Master Events Portfolio & Outcomes**:
     - View all organization campaigns (Active/Upcoming vs Completed/Archived).
     - Inspect aggregate metrics: Lifetime Funds Raised, Master CRM profiles, and average goal efficiency %.
     - Click **`📊 View Outcome Report`** on any event to inspect revenue stream breakdowns (Donations, Tickets, Sponsors), volunteer labor economic valuation ($31.80/hr rate), in-kind physical equipment FMV offsets, and 1-click PDF roster / CSV ledger exports.
  2. **🙋 Volunteer & Donor CRM Directory**:
     - Click on any volunteer card (e.g. *David Chen*, *Jessica Taylor*) to open their rich **Volunteer Profile & Impact Analysis Modal**.
     - View their **Importance Tier** (`👑 Tier 1: Organization Pillar`), **Estimated Lifetime Economic Value ($)**, and **3-Layer Tagging Studio**.
     - Remove any active tag with 1-click `✕`, pick from the Recommended Tag Library, or create an ad-hoc custom tag (`+ Add`).
     - Edit coordinator internal notes and inspect the chronological **Historical Events Supported & Tied Campaign Outcomes Ledger**.
  3. **👥 Leadership & Committee Leads Delegation**:
     - Click **`+ Invite Leader / Committee Lead`** to grant roles (`org_admin`, `event_planner`, `committee_lead`) and scope leads to specific operational departments (*Hospitality & Food*, *Labor & Setup*, *Vendor Marketplace*, etc.).
  4. **🎨 Branding, Logos & Signatory**:
     - Upload custom organization logos, choose brand color themes, and configure executive signatory vector signatures for IRS donation letters.
  5. **⚖️ Legal Waivers & E-Sign Studio**:
     - Manage custom waiver templates, test the interactive live e-signature canvas, and inspect the immutable Executed E-Signatures Audit Ledger.
  6. **🏛️ Organization Setup Templates**:
     - Inspect turnkey industry blueprints (*School/PTA, Non-Profit Foundation, Youth Sports, Faith Community, Corporate Giving*).

### 📋 Persona 2: Marcus Vance (Event Planner / Chair)
* **Event**: Annual Fall Carnival & Bake Sale ($15,000 Goal)
* **What to Test**:
  1. Open the **📊 PLANNER HUB**:
     - **Committees & Budgets**: Click `+ Add Committee Department` to create a new committee, or click `+ Add Shift Need` / `+ Add Supply Need`.
     - **Volunteer Manifest & Check-In**: View all assigned volunteers with 1-click student service hour letters and express check-in.
     - **📦 Item Pledges & Receiving**: Track physical arrival of donated items, record receiving notes/timestamps, and generate official IRS In-Kind Non-Cash Acknowledgement Letters (IRS Pub 526/561).
     - **Marketing, Flyers & Broadcast**: Generate print flyers and social broadcast payloads.
     - **Gap Analysis & Health**: Inspect automated shortage alerts for shifts <50% filled.
     - **Vendor Marketplace & Booths**: Assign booth numbers and issue corporate invoices.
     - **Reports, Badges & IRS Receipts**: Generate 6-up Avery badge sheets, financial CSVs, and compliance audit ledgers.

### 🍔 Persona 3: Sarah Jenkins (Food & Hospitality Lead)
* **Department**: Concessions & Bake Sale
* **What to Test**:
  1. Open the **Committee Leads Portal**: Notice that Sarah only sees Food shifts, bake sale drop-offs, and her $1,200 budget.
  2. Add a new shift or expense exceeding the $250 threshold to observe it route to Marcus's Approval Queue.
  3. Open the **Department Broadcast Modal**: Send a simulated SMS/Email blast strictly to the 12 food volunteers.
  4. Open the **Station QR Scanner**: Scan a volunteer pass to mark them as arrived.

### 🛠️ Persona 4: Mike Alvarez (Labor & Setup Lead)
* **Department**: Labor, Logistics & Teardown
* **What to Test**:
  1. Manage heavy equipment wishlists (tables, chairs, sound rig).
  2. Check liability waiver status for setup crew volunteers.

### 🏪 Persona 5: Artisan Bakery & Cafe (Vendor / Sponsor)
* **What to Test**:
  1. Open the **Vendor Marketplace**: Select a 10x10 booth or Food Truck pitch.
  2. Complete intake: Business name, Tax ID / EIN, power requirements, and COI policy.
  3. Complete checkout (Card/Apple Pay or Corporate Invoice Net-30) and download tax receipt.

### 🙋 Persona 6: David Chen (Parent / Volunteer / Donor)
* **What to Test**:
  1. Open the **Event Showcase & Shifts**: Pick a 9:00 AM Setup shift + register his daughter Emma as a helper.
  2. Pledge 2 boxes of cookies + donate $50 (with 2.9% fee cover).
  3. Sign the digital **Minor Parental Consent Waiver** using the touch signature pad.
  4. Receive instant booking confirmation with exact reporting gate, Lead phone number, what to bring, and `.ics` calendar download.

### 📱 Persona 7: Door & Gate Kiosk Station (Dual-Mode Operations)
* **What to Test**:
  1. Switch to **Door Kiosk Station**: Fullscreen, touch-optimized kiosk.
  2. **Mode 1 (`🔍 I Already Signed Up Online`)**:
     - Search for *"David Chen"* or *"Emma"* by name or phone number.
     - Tap **`CHECK IN NOW`** $\rightarrow$ confetti and reporting gate confirmation appear.
     - Test on-site touch waiver signing if a participant arrives with an unsigned waiver.
  3. **Mode 2 (`🙋 I Want to Volunteer Day-Of`)**:
     - **Option A (Smartphone QR Code)**: Test scanning or copying the registration QR link for frictionless phone registration.
     - **Option B (Express Touchscreen Registration)**: Enter walk-up name and phone number, pick an open shift spot (*e.g. Concessions Assistant*), draw signature on screen, and tap **Complete Walk-Up Sign-Up** for instant check-in.

### 🔄 Live Testing Mode (Exit Demo)
* Click **"Exit Demo (Live Mode)"** in the top simulator bar to log out and experience the real unauthenticated landing page, register a new user account, and create a brand-new organization.
