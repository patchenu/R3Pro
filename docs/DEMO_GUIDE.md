# GatherRaise Interactive Demo & Persona Testing Guide

GatherRaise includes a top **Role Switcher Bar** in testing mode, allowing you to instantly switch personas and explore the complete workflow from every stakeholder's perspective.

---

## 1. Persona Scenarios

### 👑 Persona 1: Elena Rostova (Org Super Admin)
* **Organization**: Lincoln High School PTA
* **What to Test**:
  1. Open the **Org Executive Dashboard**: View the 450+ Volunteer CRM, lifetime hours served, and cross-event financials.
  2. Inspect the **Team Management** tab: View assigned Event Planners and Committee Leads.
  3. Inspect **Organization Templates**: See pre-configured defaults for School/PTA, Charities, and Sports Leagues.

### 📋 Persona 2: Marcus Vance (Event Planner / Chair)
* **Event**: Annual Fall Carnival & Bake Sale ($15,000 Goal)
* **What to Test**:
  1. Open the **Master Planner Command Center**: Review live thermometer, overall shift completion rate, and department budget gauges.
  2. Open the **Gap Analysis Dashboard**: Inspect automated alerts for critical shifts under 50% capacity within 48h.
  3. Review the **1-Click Approval Queue**: Review budget increase requests or extra shift requests submitted by department leads.
  4. Access the **Reports & Export Center**: Generate formatted PDF rosters, IRS 501(c)(3) statements, and name badge sheets.

### 🍔 Persona 3: Sarah Jenkins (Food & Hospitality Lead)
* **Department**: Concessions & Bake Sale
* **What to Test**:
  1. Open the **Lead Workspace**: Notice that Sarah only sees Food shifts, bake sale drop-offs, and her $1,200 budget.
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
  1. Open the **Public Event Page**: Pick a 9:00 AM Setup shift + register his daughter Emma as a helper.
  2. Pledge 2 boxes of cookies + donate $50 (with 2.9% fee cover).
  3. Sign the digital **Minor Parental Consent Waiver** using the touch signature pad.
  4. Receive instant booking confirmation with exact reporting gate, Lead phone number, what to bring, and `.ics` calendar download.

### 📱 Persona 7: Day-of-Event Check-In Kiosk
* **What to Test**:
  1. Switch to **Tablet Kiosk Mode**: Fullscreen, touch-optimized kiosk.
  2. Search for "David Chen" or "Emma" by name or phone number.
  3. Verify signed waiver status and tap **"Check In"** with 1 touch.
