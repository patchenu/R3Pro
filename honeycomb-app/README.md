# HiveEvent — Booster & PTA Interconnected Honeycomb Event Hub

HiveEvent is a lightweight, mobile-first MVP designed specifically for **Sports Booster Clubs** and **School PTAs**. Built with an intuitive, gamified **Honeycomb lifecycle**, it guides organizers and volunteers through all 5 event stages:

```
           [ ⬡ 1. PLANNING ]
             /            \
  [ ⬡ 2. SETUP ]      [ ⬡ 3. HOSTING ]
  (Minh's Table,        (Shifts, Concessions,
   Supplies, Drops)      SafeSport Check-in)
             \            /
          [ ⬡ 4. CLEANUP ]
                  |
        [ ⬡ 5. WRAP-UP & OUTCOMES ]
        (Hours, Donations, Tax Letters)
```

---

## 🌟 Key Capabilities

### 1. Step 1: Event Registration & Claiming
- **Organizer vs. Volunteer Forking**:
  - **Organizers**: Move directly into Step 2 Setup & Needs.
  - **Volunteers / Parents**: Nominate an unlisted event. The system dispatches an instant **1-Click Claim Magic Link** to the Organizer (*"Sarah nominated Lincoln High Soccer Tournament. Tap here to claim your event"*).

### 2. Step 2: Organizer Command Center & Support Needs
- **Support Needs Types**:
  - **Equipment & Supplies**: Assign specific items to non-registered supporters (e.g., *"Assign Minh to bring a 6-ft folding table by Oct 17 at 7:30 AM"*).
  - **Minh's 1-Click RSVP Pass**: Minh receives a direct mobile pass with `[ Yes! I'll Bring It! ✓ ]` and `[ Decline ]`. Zero passwords needed.
  - **Dual Fallback Rule**: If Minh declines or doesn't confirm within 48h, the system immediately (1) alerts the Organizer with 1-click reassign options, and (2) auto-releases the need to the public parent wishlist.
  - **Automated Follow-Up Reminders**: 1-click `[ ⏰ Remind ]` button dispatches polite reminder pings.
- **Volunteer Shift Buildout**:
  - Organized by **Duty Categories** (*Check-In & Greeters, Concessions & Snack Bar, Field Setup & Line Marking, Scorekeeping / Timers, Safety & Crowd Help, Post-Event Cleanup*).
- **Special Volunteer Requirements (Option B Audit-Ready)**:
  - Preset library: **USA SafeSport Certified**, **School District / LAUSD Volunteer Tier II** (LiveScan/TB clearance), **Food Safety / ServSafe**, **First Aid / CPR**, and **Open to Anyone**.
  - Volunteers enter their credential number or upload their certification card for organizer audit review.
- **Event Privacy**:
  - Toggle between **Public Community Discovery** and **Private Invite-Only (with 4-digit access code)**.

### 3. Step 3: Outcomes, Volunteer Hours & IRS Letters
- **1-Tap Hour Verification**:
  - Organizers verify hours individually or tap `[ 🌟 1-Tap Verify All Hours ]`.
- **Student Community Service Certificates**:
  - 1-click printable/downloadable certificates for High School Graduation, National Honor Society (NHS), and Scouting hours with authorized coordinator signature.
- **Automated IRS 501(c)(3) Letters**:
  - Official Pub 526/561 non-cash contribution acknowledgement letters for equipment donors (Minh's table FMV $75, canopies) and cash donors with required statutory disclosure clauses.
- **Universal Spreadsheet Sync & Export**:
  - 1-click CSV download pre-structured for easy import into Excel, Google Sheets, or Numbers.
  - Ready for future spreadsheet integration.

---

## 🚀 Running the App

### Option A: From the Root Directory
```bash
npm run dev:honeycomb
```
Runs at `http://localhost:5174`

### Option B: From the `honeycomb-app` Subdirectory
```bash
cd honeycomb-app
npm run dev
```

---

## 👶 10-Year-Old Test (Usability Standards)
- **48px+ Touch Targets**: Oversized buttons designed for thumbs on mobile phones.
- **Zero Passwords**: Instant digital pass token stored in browser memory.
- **Visual Feedback**: Celebratory confetti upon completing any step or RSVP.
- **Color-Coded Hexagons**:
  - 🟡 **Amber**: Active / Needs attention.
  - 🟢 **Green**: 100% Filled / Confirmed.
  - ⚪ **Muted**: Locked until earlier stages are reached.
