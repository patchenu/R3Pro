# GatherRaise Interactive Demo & Persona Testing Guide

GatherRaise includes a top **Role Switcher Bar** in testing mode, allowing you to instantly switch personas and explore the complete workflow from every stakeholder's perspective.

---

## 1. Persona Scenarios

### 👑 Persona 1: Elena Rostova (Org Super Admin)
* **Organization**: Lincoln High School PTA
* **What to Test**:
  1. Open the **Org Super Admin CRM**: View the 450+ Volunteer CRM, lifetime hours served, and cross-event financials.
  2. Open **🎨 Branding, Logos & Signatory**: Upload custom organization logos, choose brand color themes, and configure executive signatory vector signatures for IRS donation letters.
  3. Open **⚖️ Legal Waivers & E-Sign Studio**: Manage custom waiver templates, test the interactive live e-signature canvas, and inspect the immutable Executed E-Signatures Audit Ledger.
  4. Inspect the **Team Management** tab: View assigned Event Planners and Committee Leads.
  5. Inspect **Organization Setup Templates**: See pre-configured defaults for School/PTA, Charities, and Sports Leagues.

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

### 📱 Persona 7: Day-of-Event Check-In Kiosk
* **What to Test**:
  1. Switch to **Door Kiosk Station**: Fullscreen, touch-optimized kiosk.
  2. Search for "David Chen" or "Emma" by name or phone number.
  3. Verify signed waiver status and tap **"Check In"** with 1 touch.

### 🔄 Live Testing Mode (Exit Demo)
* Click **"Exit Demo (Live Mode)"** in the top simulator bar to log out and experience the real unauthenticated landing page, register a new user account, and create a brand-new organization.
