# REACH Project Knowledge, Architecture & Developer Guidelines

This document provides system knowledge, core architectural rules, and coding standards for all developers and AI agents working on the REACH codebase.

---

## 1. System Architecture & Tenancy Model

### 1.1 Multi-Tenant Isolation
- Every database model and query MUST include and verify `org_id` (Organization ID).
- Cross-tenant data leaks are strictly prohibited.
- Public participant self-service links use high-entropy 256-bit cryptographically secure `manage_token` values.

### 1.2 Role-Based Access Control (RBAC) Hierarchy
- **Org Super Admin**: Complete organization-level control (branding, team members, master CRM, audit logs, financial reports).
- **Event Planner / Chair**: Full control over specific assigned events (logistics, total goal, committee delegation, variable approval queue).
- **Committee / Sub-Part Leads**: Strictly scoped to their designated department (e.g. *Labor & Setup*, *Food & Hospitality*, *Vendor Marketplace*, *Silent Auction*). Leads cannot mutate other departments or global event settings.
- **Vendors / Corporate Sponsors**: Access to booth selection, intake questionnaires (EIN, power needs, Certificate of Insurance), invoice downloads, and tax receipts.
- **Volunteers & Donors**: Public frictionless sign-up, family registration, digital waiver signing, personal QR check-in pass, `.ics` calendar sync.

---

## 2. Event Sub-Parts (Committees) & Variable Approvals
- Events are partitioned into **Sub-Parts** (Committees) representing distinct operational areas.
- Every Sub-Part defines an assigned **Lead**, **Allocated Budget**, **Reporting Gate/Location**, and **Dress Code/Supplies Notes**.
- **Variable Approval Threshold**: Event Planners set thresholds (e.g. *Budget additions > $250* or *Shift additions > 5 spots*). Lead changes within limits are auto-approved; changes exceeding limits enter the `Pending_Approval` queue for 1-click Planner approval.

---

## 3. Legal Compliance & Digital Waivers
- Waivers support Minor Consent (parental co-signature), General Liability, Food Handling, and Photo Releases.
- Digital signatures capture vector stroke data, typed legal name, signer relationship, timestamp, and IP address.
- Compliance is enforced before the event via automated reminders and at the door during tablet kiosk check-in.

---

## 4. Frontend & Design Standards
- **Framework**: React 18 + TypeScript + Vite + Tailwind CSS.
- **Icons**: Lucide React (`lucide-react`).
- **Typography**: `Plus Jakarta Sans` for headers and `Inter` for body.
- **Accessibility**: High color contrast, accessible ARIA attributes, keyboard navigable dialogs.
- **Zero Double-Booking**: Overlap detection algorithms must validate shift time collisions for volunteers.

---

## 5. Data Integrity & Deduplication Rules

### 5.1 Organization Deduplication
- **EIN (Tax ID) Uniqueness**: Every 501(c)(3), School PTA, or Sports League must have a unique EIN (normalized alphanumeric, e.g. `942849102`). No two organizations may share the same EIN.
- **Normalized Name + State Check**: Prevents accidental duplicate registrations of the same local branch.
- **Registration Gate**: Creating an organization requires an authenticated user account (`isAuthenticated === true`). The creator is automatically assigned as verified `Org Super Admin`.

### 5.2 Event Uniqueness & Recurrence Model
- Events are scoped by `org_id` + `slug` or `org_id` + `normalized_title` + `event_year`.
- An organization can host annual recurrences (e.g. *Fall Carnival 2026* vs *Fall Carnival 2027*), but cannot create duplicate events for the same title and date window under the same organization.

---

## 6. Household, Minor & Family Account Mental Model

### 6.1 Parent Primary Account vs Household Dependents
- **Primary Account Holder (Parent / Adult)**:
  - Unique identifier: **`email`** (unique across all registered accounts).
  - Holds primary login credentials, phone number, and emergency contact details.
- **Household Dependents / Minors (Children & Students)**:
  - Minors often share their parent's phone number and email address.
  - Minors are modeled as **Household Members** linked to the parent's `user_id`.
  - Shift registrations allow claiming individual slots for specific household members (e.g. *"Lucas Miller (Age 14) - Face Painting Shift"*).

### 6.2 Legal Minor Consent & Co-Signing
- For volunteers under 18:
  - System captures **Parent / Legal Guardian Full Legal Name**, **Relationship**, **Digital Signature Vector Stroke**, **Timestamp**, and **IP Address**.
  - Pass remains in `Pending_Parent_Consent` status until the legal guardian co-signs the waiver.
- **Student Community Service Hours**:
  - Service hours are verified by the authorized Event Coordinator and bundled into printable, signed verification certificates for high school and scouting requirements.

---

## 7. In-Kind Property, Equipment & Supply Drop-Off Model
- Supply and equipment wishlist items (`ItemSlot`) track pledged vs delivered quantities.
- Physical drop-offs record receiving volunteer names, timestamps, and donor condition notes.
- Generates official IRS Publication 526/561 non-cash contribution acknowledgement letters with Fair Market Value (FMV) offsets and statutory non-cash disclosure clauses.

---

## 8. Organization Branding & Executive Signatory Hub
- Organizations upload official logos (PNG/SVG converted to base64 Data URLs) and define primary color palettes.
- Executive officer signatures (name, title, vector image) are securely rendered on IRS donation receipts, in-kind acknowledgement letters, and student service certificates.

---

## 9. Legal Waivers, Agreements & E-Sign Compliance Studio
- Centralized studio for creating and customizing legal documents (*Minor Consent, General Liability, Food Safety, Photo/Media*).
- Live e-sign preview sandbox for testing vector canvas signature capture.
- Executed e-signatures compliance audit ledger tracking all signed agreements with 1-click export for insurance underwriters.

---

## 10. GitHub Remote Operations & Authentication Standard
- **Primary GitHub Account**: **`patchenu`** (`patchenu@yahoo.com`).
- All remote git pushes, branch updates, and repository operations MUST be pushed to `https://github.com/patchenu/R3Pro.git` via the `patchenu` account.
- Never use personal or secondary accounts (`pathen-uchiyama`, `ainewsgen`) for commits or pushes to this repository.

---

## 11. Leadership & Committee Leads Delegation Architecture
- Super Admins manage organization leadership staff under `OrgExecutiveDashboard.tsx` (`Leadership & Committee Leads` tab).
- **Invitations & Role Assignment**:
  - `event_planner`: Granted full master event chair control and 1-click variable approval queue rights.
  - `committee_lead`: Strictly scoped to designated departments (*Food & Hospitality*, *Labor & Setup*, *Vendor Marketplace*, etc.).
  - `org_admin`: Granted full organization governance, CRM, and financial substantiation rights.
- **Audit Logging**: Every team invitation or removal emits an immutable `AuditLog` record.

---

## 12. Organization Setup Templates & Industry Blueprints
- `ORG_TEMPLATES` (*School/PTA, Non-Profit Foundation, Youth Sports League, Faith Community, Corporate Giving*) serve as turnkey onboarding blueprints.
- **New Organization Creation**: Selecting a template pre-populates default committee departments, standard waiver requirements, suggested campaign goals, and sample recurring events.
- **Existing Organizations**: Org Admins can review and apply industry presets to instantly batch-provision missing standard operational departments.

---

## 13. Master Events Portfolio & Multi-Level Campaign Outcomes Architecture
- **Single-Pane Executive Hub (`OrgExecutiveDashboard.tsx`)**:
  - Org Owners and Super Admins inspect all campaigns (Active/Upcoming vs Completed/Archived) in one centralized view.
  - **Unique Event Keys**: Every event is assigned a unique identifier (e.g. `EVT-2026-Q3-001`) for CPA reconciliation and audit ledgers.
  - **3-Level Reporting Dimensions**:
    1. **By Event (Unique Key)**: Granular search by title or event key, financial progress meters, shift capacity fulfillment %, and 1-click single-event dossiers.
    2. **By Quarter (Q1 - Q4 Rollup)**: Aggregates total raised, direct donations, ticket sales, sponsor revenue, volunteer hours, and economic valuation ($31.80/hr) with 1-click quarterly PDF/CSV exports.
    3. **By Calendar Year (Annual 990 / Board Rollup)**: Annual financial and volunteer impact summary with cumulative goal fulfillment %, YoY growth % vs prior years, and full campaign ledger with 1-click annual PDF/CSV exports.

---

## 14. Volunteer & Donor CRM Tagging Intelligence & Impact Tie-Back
- **3-Layer Tagging Taxonomy**:
  1. **Automated Behavioral System Tags**: `Reliable Helper` (≥95% attendance rate), `VIP Donor` (≥$250 giving), `Parent Volunteer` (minors linked), `Alumni`.
  2. **Standard Curated Role Library**: `Board Member`, `Past Event Chair`, `Certified First Aid/CPR`, `Food Safety/ServSafe`, `Truck Owner`, `Heavy Lifting Crew`, `High School NHS Student`, `Master Baker`.
  3. **Ad-Hoc Custom Tags**: Coordinators can create and assign custom tags on the fly.
- **Historical Event Outcome Tie-Back (`VolunteerEventHistory[]`)**:
  - Chronological impact ledger documenting every shift served, hours logged, in-kind items delivered, and direct donations.
  - Direct tie-back to the **total event financial outcome raised** (*e.g., "Event Outcome: Raised $11,450 for Lincoln High STEM Lab"*).
- **Importance Tier Ranking**: `👑 Tier 1: Organization Pillar`, `🌟 Tier 2: Core Supporter`, `🤝 Tier 3: Contributor`, `🌱 Newcomer`.
- **Coordinator Internal Notes & Memory**: Real-time editable engagement context.

---

## 15. Door & Gate Kiosk Station Dual-Mode Operations
- **Dual-Mode Mental Model at the Entrance**:
  1. **Mode 1: `🔍 Check-In (I Already Signed Up Online)`**: Phone/name keypad lookup, 1-tap check-in, on-site emergency touch waiver signing fallback, and reporting gate directions with confetti.
  2. **Mode 2: `🙋 Day-Of Walk-Up Volunteer Sign-Up ("I Want to Volunteer Day-Of")`**:
     - **Option A (Self-Serve on Phone / Skip The Line)**: Large high-contrast QR code allowing volunteers to self-register on their smartphone in 30 seconds without waiting in line.
     - **Option B (Express Touchscreen Sign-Up)**: 1-minute on-tablet registration allowing walk-up volunteers to choose an open urgent shift, sign the digital safety waiver on screen, and immediately check in.

---

## 16. 7-Step Interactive Guided Event Builder Wizard & Discovery Architecture
- **7 Guided Setup Steps in `EventBuilderWizard.tsx`**:
  1. **Step 1: `🏛️ Source Strategy & Blueprints`**: Toggle between *Industry Blueprints* (turnkey operational packages), *Clone Past Event* (duplicate previous year campaigns), or *Blank Canvas* (from scratch).
  2. **Step 2: `📅 Campaign Essentials & Schedule`**: Title, tagline, target fundraising goal ($), date/time windows, venue name, physical address, and cover image.
  3. **Step 3: `👥 Committee Departments & Leadership Assignments`**: Dynamic creation/editing of operational committees, designating Leads from organization staff (`users`), reporting gates, radio channels, and allocated department budgets.
  4. **Step 4: `🙋 Volunteer Shift Needs & Staffing Capacities`**: Define role titles, tasks, shift timeframes, capacity spots, and liability waiver requirements per committee.
  5. **Step 5: `🎁 Supply & Equipment Wishlist Drop-Offs`**: Specify physical supplies, food/beverage items, drop-off stations, deadlines, and IRS Fair Market Value (FMV) deduction offsets.
  6. **Step 6: `💎 Sponsorship Packages & Commercial Tiers`**: Build corporate underwriting tiers, artisan vendor booths (with footprint dimensions & electricity options), admission tickets, and custom perk inclusions.
  7. **Step 7: `🏷️ Discovery Tags, Variable Approval Rules & Review`**: Curated preset + custom discovery tags, auto-approval thresholds (budget $ and shift spot limits), master dossier review, and 1-click campaign launch.
- **Blank Slate Operations in Planner Hub (`MasterPlannerDashboard.tsx`)**:
  - If starting from a blank canvas or editing on the fly, Planners and Leads can dynamically provision departments, shifts, wishlist items, and sponsor tiers with 1-click modals.
- **Public Search & Discovery Tags (`event.tags: string[]`)**:
  - Curated preset tags (`Family Friendly`, `STEM & Tech`, `Food & Bake Sale`, `Carnival & Games`, `Athletics & Sports`, `Charity Gala`, `Silent Auction`, `Student Service Hours`) and custom tags empower instant filtering in `CommunityDiscoveryHub.tsx`.

---

## 17. Birthday Milestone Intelligence, Canvas Signature Accuracy & Frictionless Account Claiming
- **Birthday Capture & Surprise Volunteer CRM Milestone Recognition**:
  - Sign-up captures **Date of Birth (`birthDate`, YYYY-MM-DD)** quietly for age verification, minor status (`isMinor = age < 18`), and parental waiver compliance.
  - Automatically enrolls the volunteer into the organization's CRM automated milestone greeting workflows behind the scenes.
  - Public milestone enrollment notices and teaser outputs are suppressed from the volunteer's view to preserve the surprise element for annual greetings and milestone recognition.
- **Digital Canvas Vector Stroke Precision (No Pointer Offset)**:
  - Responsive canvas signature pads (`SignaturePad.tsx`) dynamically synchronize buffer resolution (`canvas.width` / `canvas.height`) with bounding client rect dimensions and Device Pixel Ratio (DPR).
  - Normalizes touch and mouse pointer coordinates 1:1 with CSS pixels, eliminating pointer misalignment and drawing offsets.
- **Frictionless Magic-Token vs Password Creation Mental Model**:
  - **Frictionless Shift Sign-Up**: Public volunteers register without mandatory upfront password creation, eliminating 40%+ conversion drop-off. Instant pass access is secured via 256-bit `manageToken`.
  - **Optional Account Claiming**: Volunteers can set an optional password during registration (Step 3) or directly on their post-signup confirmation screen (`ConfirmationCard.tsx`) to claim their volunteer profile, link household family dependents, and access their personal REACH dashboard to track verified service hours and certificates.

---

## 18. Passwordless 6-Digit OTP, Magic Links & Token Storage Architecture
- **Delivery Channels for Self-Service Access**:
  1. **Instant Signup Confirmation Email**: Contains 1-click self-service magic URL (`/manage-registration?token=...`).
  2. **Automated SMS Reminders**: Dispatched at T-72h, T-24h, and T-2h with direct mobile check-in passes.
  3. **Embedded Calendar Appointment (.ics)**: Self-service management URL is embedded inside calendar invite notes so volunteers can access their pass directly from Google Calendar or Apple iCal.
- **Token Storage & Persistence Model**:
  - High-entropy 256-bit `manage_token` values are stored in the backend database (`registrations.manage_token`).
  - Saved in browser `localStorage` (`reach_active_tokens`) for instantaneous pass recovery on returning desktop/mobile visits.
- **Cross-Device Login Strategy (Desktop to Mobile / Lost Link)**:
  - When shifting devices or logging in without saved links, volunteers do not need passwords.
  - The login modal (`AuthModal.tsx`) defaults to **6-Digit Verification Passcode (Email/SMS OTP)**.
  - The user enters their email address or phone number, receives a 6-digit one-time code, and is authenticated immediately with their linked family registrations and service history.
  - A toggle allows Super Admins and staff with traditional passwords to switch to **Staff / Password Login** mode.

---

## 19. Sponsor Packages, Commercial Tiers, Shifts & Items App-Wide CRUD Studio
- **Centralized Builder Hubs**:
  1. **`VendorMarketplaceManager.tsx` (`💎 Sponsor Packages & Commercial Tiers Builder` tab)**: Dedicated workspace for Super Admins and Commercial Chairs to build, customize, and price sponsor underwriting tiers, artisan vendor booths, and admission packages.
  2. **`MasterPlannerDashboard.tsx` (`Committees & Budgets` tab)**: Single-pane view of all active sponsorship packages, volunteer shift needs, and supply wishlist items with 1-click `✏️ Edit` and `🗑️ Delete` actions.
- **Sponsor & Commercial Tier Capabilities**:
  - **IRS Fair Market Value (FMV) Offsets**: Sets the fair market value of goods/meals provided, automatically computing tax-deductible contributions for IRS receipts.
  - **Dynamic Inclusions & Perks Checklist**: Custom bullet points (e.g. *Main Stage Logo Placement*, *VIP Passes*, *Social Media Mention*).
  - **Physical Footprint & Electricity**: Defines required booth space dimensions (e.g. *10x10*, *Food Truck*) and toggles 110V/220V power drops.
  - **Approval vs Instant Checkout**: Toggles instant self-service checkout vs mandatory application review.
- **Shift & Item Full Lifecycle Management**:
  - Department Leads and Event Planners can edit shift hours, volunteer capacities, and waiver requirements on existing shifts.
  - Item wishlist slots can be modified to increase/decrease required quantities, adjust drop-off deadlines, and update FMV per unit.

---

## 20. Multi-Tenant Email & SMS Dispatch Architecture

### 20.1 Tenant-Isolated Sender Identity & Deliverability
- **Managed Platform Delivery (Default)**:
  - Header structure: `From: "[Org Name] via REACH" <notifications@mail.reachplatform.com>`
  - `Reply-To: [Lead Email / Org Admin Email]` routes volunteer replies directly to the local coordinator's inbox.
  - Injected metadata: `X-Entity-Ref-ID: org_{org_id}_evt_{event_id}` for webhook routing.
- **Custom Domain Authentication (Enterprise / Dedicated DKIM/SPF)**:
  - Organizations can verify custom sending domains (e.g. `volunteers@lincolnhighpta.org`) via DNS CNAME validation with Postmark / AWS SES.
  - System verifies DKIM public keys and SPF alignment before activating direct custom domain dispatch.

### 20.2 Queue Prioritization & Tenant Rate Limiting
- **Priority Tier Queues (Redis BullMQ / AWS SQS)**:
  - **P0 (Security & Auth)**: 6-digit login OTPs and 1-click magic links (<2s delivery SLA). Never throttled by marketing campaigns.
  - **P1 (Gate Operations)**: Live QR mobile check-in passes and day-of emergency gate reassignment notices.
  - **P2 (Transactional Receipts)**: IRS 501(c)(3) tax acknowledgement letters, registration confirmations, and supply drop-off vouchers.
  - **P3 (Broadcast & Bulk Notifications)**: Lead announcements, volunteer recruitment broadcasts, and annual birthday greetings. Throttled at 50/sec per tenant to preserve IP pool reputation.

### 20.3 Multi-Tenant Suppression & Opt-Out Scoping
- **Tenant-Scoped Unsubscribe**:
  - Marketing opt-outs are strictly isolated by `(email, org_id)`.
  - Unsubscribing from School PTA broadcasts does NOT suppress emails from the Youth Soccer League or Community Food Bank.
- **Transactional Exemption**:
  - Security OTPs, confirmed shift arrival instructions, and IRS tax receipts bypass promotional suppressions in compliance with CAN-SPAM / CASL regulations.

### 20.4 A2P 10DLC SMS Multi-Tenancy & TCPA Compliance
- **Campaign Registry ISV Registration**: REACH operates as a registered Campaign Registry ISV, registering tenant sub-use cases (*Standard Nonprofit*, *Education*, *Customer Service*).
- **Mandatory Brand Identifier Prefix**: All SMS messages are prepended with the Organization identifier:
  `[Lincoln High PTA] Your shift starts at 8:00 AM at Gate 2. Pass: https://reachplatform.com/p/x94827 Reply STOP to opt out.`
- **Carrier Keyword Handling**: Inbound `STOP` / `UNSUBSCRIBE` webhooks write to the tenant-scoped suppression table `(phone_e164, org_id, is_opted_out = true)`. Re-subscribing is handled via `START`.

---

## 21. App-Wide Full CRUD Operations & State Lifecycle Matrix

| Module / Component | Entities Managed | Create Action | Edit / Modify Action | Delete / Void Action |
| :--- | :--- | :--- | :--- | :--- |
| **Volunteer CRM** (`VolunteerCrm.tsx`) | Supporters, Donors, VIPs | `+ Add Supporter / Donor` modal | `✏️ Edit Profile` (contact, skills, tier) | `🗑️ Delete Profile` (with confirmation) |
| **Team Leadership** (`TeamMemberManagerModal.tsx`, `OrgExecutiveDashboard.tsx`) | Org Admins, Planners, Leads | `+ Invite Team Member` (active user creation) | `✏️ Edit Role & Committee Scope` | `🗑️ Remove Member` (Super Admin protected) |
| **Master Campaigns** (`OrgExecutiveDashboard.tsx`, `MasterPlannerDashboard.tsx`) | Events, Campaigns | `+ New Event Campaign` Wizard | `✏️ Edit Campaign Settings` (dates, goals, rules) | `🗑️ Delete Campaign` (cascading cleanup) |
| **Department Shifts** (`LeadPortal.tsx`, `MasterPlannerDashboard.tsx`) | Volunteer Shifts | `+ Add Volunteer Shift` | `✏️ Edit Shift` (hours, capacities, waiver) | `🗑️ Delete Shift` |
| **Supply Wishlist** (`LeadPortal.tsx`, `MasterPlannerDashboard.tsx`) | Wishlist & Drop-Off Items | `+ Add Wishlist Item` | `✏️ Edit Item` (quantity, deadline, FMV) | `🗑️ Delete Item` |
| **Sponsor Packages** (`VendorMarketplaceManager.tsx`, `MasterPlannerDashboard.tsx`) | Tiers, Vendor Booths | `+ Create Tier / Booth` | `✏️ Edit Tier` (pricing, perks, FMV, power) | `🗑️ Delete Tier` |
| **Financial Ledger** (`ReportsExportCenter.tsx`) | Donations, Grants, Checks | `+ Record Offline Contribution` | Real-time reconciliation | `🗑️ Void / Delete Donation Record` |

---

## 22. Volunteer Shift Time Slot Setup, Preferred Schedule Windows & Overlap Guard

### 22.1 Multi-Time-Slot Shift Architecture
- **Granular Time Window Specification**:
  - Every shift is defined by explicit **`startTime`** and **`endTime`** datetime stamps rather than defaulting to event-wide windows.
  - Quick Time Slot Presets (*"🌅 Morning (8:00 AM – 11:00 AM)"*, *"☀️ Midday Peak (11:00 AM – 2:00 PM)"*, *"🌤️ Afternoon Rush (2:00 PM – 5:00 PM)"*, *"🌙 Evening / Teardown (5:00 PM – 8:00 PM)"*, *"⏱️ Full Event Schedule"*) accelerate shift authoring in `EventBuilderWizard.tsx`, `MasterPlannerDashboard.tsx`, and `LeadPortal.tsx`.
- **⚡ 1-Click Multi-Slot Generator**:
  - Organizers and Department Leads can automatically split a single volunteer role into 4 distinct consecutive time slots across the event day.

### 22.2 Discovery & Preferred Time Slot Selection (`PublicEventLanding.tsx`)
- **Schedule Time-of-Day Filter**:
  - Public volunteers can filter opportunities across `All Times`, `🌅 Morning (<12 PM)`, `☀️ Midday (12 PM – 3 PM)`, and `🌙 Evening (3 PM+)`.
- **Prominent Time Slot Badges**:
  - Displays formatted duration, start/end times, reporting gate directions, and remaining open spots.

### 22.3 Multi-Participant Household Shift Assignment & Zero Double-Booking
- **Participant-to-Time-Slot Mapping (`UnifiedRegistrationModal.tsx`)**:
  - Volunteers can assign specific family members or dependents to distinct time slots.
  - Zero double-booking overlap engine strictly validates that no participant is assigned concurrent or conflicting shift times (`start1 < end2 && end1 > start2`).

## 23. Role Architecture Hierarchy, Dress Code Customization & Commercial Tiers Reordering

### 23.1 Role Distinction: Event Planner / Chair vs Committee Lead
- **Event Planner / Chair**:
  - **Master Event Authority**: Oversees the entire campaign portfolio, total fundraising goal ($), master schedule, and organization-level logistics.
  - **Variable Approval Queue**: Exercises final review/approval rights on lead requests exceeding threshold boundaries (e.g. *Budget additions > $250* or *Shift additions > 5 spots*).
  - **Global Settings**: Sets the baseline campaign rules, global volunteer attire guidelines, and fee coverage defaults.
- **Committee Lead** (*Formerly referred to informally as department-specific titles like Hospitality Lead, Setup Lead*):
  - **Strict Department Scope**: Granted operational control exclusively over their designated committee or sub-part (e.g. *Food & Hospitality*, *Labor & Setup*, *Vendor Marketplace*, *Silent Auction*).
  - **Autonomous Execution Within Limits**: Leads can create and adjust volunteer shift slots, manage supply wishlist drop-offs, check in arriving volunteers, and broadcast urgent SMS/email updates to their specific committee roster.
  - **Cannot Mutate Global Settings**: Leads cannot modify other departments, change total event goals, or exceed budget limits without automated planner approval.

### 23.2 Global Event Dress Code vs Department-Specific Attire & Gear Instructions
- **Global Event Baseline (`event.dressCode`)**:
  - Defined in `EventBuilderWizard.tsx` (Step 2) or `MasterPlannerDashboard.tsx` (Campaign Settings).
  - Quick Presets (*"👕 Casual Spirit / T-Shirt & Sneakers"*, *"👔 Business Casual / Staff Polo"*, *"🤵 Black-Tie / Formal Evening Attire"*, *"🦺 Safety Vest & Work Boots"*, *"🧑‍🍳 Food Safe Apron & Closed Shoes"*).
- **Department Additions & Gear Customization (`subPart.dressCodeNotes`)**:
  - Departments inherit the global event attire by default with 1-click **"Inherit Global Attire"** reset.
  - Leads and Planners can layer on department-specific requirements via **+ Quick Add Gear** presets (*"+ Apron & Hairnet"*, *"+ Heavy Work Gloves & Steel-Toe Boots"*, *"+ Sun Hat & Sunscreen"*, *"+ Black Slacks & Non-Slip Shoes"*, *"+ High-Vis Safety Vest"*).
  - Prominently rendered across public opportunity cards, mobile check-in passes, and calendar notes.

### 23.3 Commercial Booths, Tickets & Sponsorships Reordering & Cost-Based Sorting
- **Manual Position Shifting**:
  - Organizers can shift cards around using **Move Up (`↑`) / Move Down (`↓`)** controls across `VendorMarketplaceManager.tsx`, `MasterPlannerDashboard.tsx`, and `EventBuilderWizard.tsx` (Step 6).
  - Real-time persistence via `reorderTicketTiers(newTiers: TicketTier[])` in `AppContext.tsx`.
- **1-Click Cost-Based Sorting**:
  - **"$$$ → $ High to Low"**: Places high-value corporate title sponsors and premiere underwriting tiers at the top.
  - **"$ → $$$ Low to High"**: Surfaces affordable admission tickets and micro-contributions first.
- **Multi-Category Filter Tabs**:
  - Filter by *All Items*, *💎 Sponsor Packages*, *🎪 Vendor Booths*, and *🎟️ Admission Tickets* on both organizer hubs and public landing pages (`PublicEventLanding.tsx`).

## 24. Participant Persona & Role Detection Intelligence

### 24.1 Dynamic 3-Vector Detection (Zero Upfront Role Dropdowns)
- Rather than forcing users through an artificial *"Select Your User Type"* select box, REACH detects roles dynamically through 3 distinct operational vectors:
  1. **Vector 1: Transaction & Cart Intent (What They Click)**:
     - Selecting a volunteer shift $\rightarrow$ **Volunteer**.
     - Registering a dependent with `relationship: 'Child'` or `isMinor: true` $\rightarrow$ **Parent / Household Guardian** (triggers Minor Safety Consent Parental Co-signature waiver and auto-enables the `Parent Volunteer` CRM tag).
     - Purchasing an underwriting package $\rightarrow$ **Corporate Sponsor** (triggers company EIN capture, logo perk assets, IRS 501(c)(3) tax receipt).
     - Selecting a vendor booth pitch $\rightarrow$ **Commercial Artisan / Food Truck Vendor** (triggers commercial intake: 110V/220V power, 10x10 footprint, COI insurance policy, health permits).
     - Purchasing general admission wristbands $\rightarrow$ **Event Attendee / Ticket Buyer**.
     - Pledging supply/equipment wishlist items $\rightarrow$ **In-Kind Property Donor** (triggers IRS Pub 526/561 non-cash receipt).
  2. **Vector 2: Staff & Committee Leadership Delegation (Who Invited Them)**:
     - **Org Super Admin (`org_admin`)**: Verified organization creator or promoted by existing Admin. Full governance, branding, and CPA reporting.
     - **Event Planner / Chair (`event_planner`)**: Master chairperson assigned to designated campaigns with variable approval queue rights.
     - **Committee Lead (`committee_lead`)**: Department-scoped lead invited via email/SMS OTP and mapped to a specific committee (`assignedSubPartIds`).
  3. **Vector 3: Multi-Tenant Identity Resolution (`OrgMembership[]`)**:
     - A single user account (`email`) holds distinct contextual roles across organizations (e.g. *Committee Lead* at High School PTA, *Volunteer / Parent* at Youth Soccer League, *Corporate Sponsor* at Community Foundation).

### 24.2 Automated Behavioral CRM Tagging Engine
- `Parent Volunteer`: Auto-applied when registrations link minor dependents.
- `VIP Donor`: Auto-applied when cumulative giving or sponsorship reaches $\ge \$250$.
- `Reliable Helper`: Auto-applied when attendance rate across multiple events reaches $\ge 95\%$.
- `Student Service Volunteer`: Auto-applied when claiming service hours for school verification certificates.

---

## 25. Vendor, Contractor & Service Provider Mental Model & Decoupling Standard

### 25.1 The 3 Distinct Vendor Archetypes

| Archetype | Cash Flow Direction | Channel / Entry Point | Requirements & Compliance | Outcome & Deliverable |
| :--- | :--- | :--- | :--- | :--- |
| **Type A: Commercial Exhibitor / Market Merchant** | **Vendor $\rightarrow$ Pays Org** (Revenue Inflow) | Dedicated **Vendor Marketplace Portal** (`/e/:slug/vendors` or Commercial Tab) | Business EIN, Certificate of Insurance (COI), 110V/220V power needs, health/food permits | Numbered booth assignment (e.g. *Booth #A-14*), commercial invoice, sales permit |
| **Type B: Hired / Paid Service Contractor** | **Org $\rightarrow$ Pays Contractor** (Expense Outflow) | **Organizer Procurement & Contracts Hub** (Internal Planner / Lead Workspace) | W-9 form, signed vendor service contract, milestone payment schedule, itemized invoice | Deducted against Department Budget, accounts payable tracking |
| **Type C: Pro-Bono / Donated Service Provider** | **$0 Net Cash** (In-Kind Sponsorship) | **Community Partner Intake** or Sponsor Portal | Statement of work, estimated Fair Market Value (FMV), proof of insurance | Underwriting sponsor perks (stage logo, banner), official IRS 501(c)(3) in-kind tax receipt |

### 25.2 Decoupling Vendors from the Public Volunteer Page
- **Volunteer Page Purity**:
  - The public event landing page (`PublicEventLanding.tsx`) is designed for **community volunteers, parents, and families**. It MUST focus strictly on volunteer shifts, supply drop-offs, admission tickets, and frictionless participation.
  - Commercial vendor booths and contractor inquiries must NEVER be mingled into volunteer shift lists.
- **Dedicated Commercial Inlets**:
  - Commercial exhibitors and food trucks access a dedicated **Vendor Marketplace & Commercial Sponsorship Hub** where they select booth footprints, submit COIs, and configure power requirements without cluttering the community volunteer experience.
- **Internal Contractor Management**:
  - Hired contractors (paid DJ, sound engineering crew, tent rentals, security personnel) are managed internally within `MasterPlannerDashboard.tsx` and `LeadPortal.tsx` as contracted operational expenses against the department's allocated budget.

---

## 26. User Persona Workspaces, Decluttered UX Mental Models & Strict Access Boundaries

### 26.1 Post-Login Cognitive Clarity & Workspace Partitioning
- **Org Super Admin (`org_admin`)**:
  - High-level governance, organization branding, executive signatories, leadership team management, 990 / CPA annual audits, and cross-campaign financial rollups.
- **Event Planner / Chair (`event_planner`)**:
  - Master campaign lifecycle, fundraising meters, committee delegation, variable approval queue review (budget additions > $250, shift additions > 5 spots), and commercial tier configuration.
  - *Operational Separation*: Planners build, price, and approve commercial packages, but DO NOT book vendor spaces for themselves (only vendors apply and book).
- **Committee / Sub-Part Lead (`committee_lead`)**:
  - Scoped strictly to assigned operational departments (`LeadPortal.tsx`). Manages department volunteer shift rosters, supply wishlist drop-offs, attendee check-in, and committee broadcasts. Cannot mutate global event settings or other departments.
- **Commercial Vendor & Corporate Sponsor (`vendor` / `sponsor`)**:
  - Dedicated commercial operating studio (`VendorSponsorDashboard.tsx`). Manages booth pitches, electrical hookups, Certificate of Insurance (COI) compliance, online invoice checkout, lead scanning, rental add-ons, annual season passes, and organizer Q&A.
- **Volunteer & Household Parent (`volunteer`)**:
  - Frictionless personal portal. Tracks active shift passes, household family dependents, student service hour verifications, digital safety waivers, and personal `.ics` calendar sync.

### 26.2 Strict Access Gating & Navigation Hygiene
- **Door Kiosk Gating**:
  - The Entrance & Tablet Kiosk Station (`DoorKioskView.tsx`) is strictly restricted to authorized staff (`org_admin`, `event_planner`, `committee_lead`).
  - Public volunteers, household parents, and commercial vendors/sponsors are strictly prevented from viewing or accessing the Door Kiosk tab.
- **Elimination of Navigation & Card Clutter**:
  - Flattened deeply nested card layouts into clean single-level tabs.
  - Removed duplicate sponsorship/budget cards between Planner Hub and Committee Budgets.
- **Homepage & Landing Page Focus**:
  - The primary landing page (`PublicEventLanding.tsx` / `App.tsx`) centers exclusively on active community campaigns and frictionless volunteer sign-up.
  - Commercial sponsorship opportunities are positioned cleanly at the bottom of the page (`CommercialGatewayBanner.tsx`) to eliminate cognitive distraction for volunteers.
- **Global Header Commercial Inlet**:
  - Added a dedicated "🏪 Commercial & Sponsors" navigation link in the top bar with live tier count badges for quick vendor discovery.

---

## 27. Commercial Vendor & Corporate Sponsor Operating Studio (`VendorSponsorDashboard.tsx`)

### 27.1 9-Tab Workspace Lifecycle Matrix
1. **`my_passes` (My Booths & Passes)**: Active registered booths, load-in gate instructions, gate passes, and spatial courtyard layout.
2. **`leads_hub` (Lead Scanner & Capture)**: In-booth camera QR scanner simulator, manual lead intake modal, filterable CRM table, and 1-click CSV lead export.
3. **`equipment_addons` (Equipment & Add-Ons Store)**: Self-service rental catalog (tables, canopies with weights, 20A power drops, corner priority upgrades) with instant checkout.
4. **`compliance` (COI & Tax Receipts Vault)**: Real Certificate of Insurance (COI) document upload, live insurance policy verification, and IRS Publication 526/561 tax receipt vault.
5. **`brand_assets` (Brand Assets & Deliverables)**: Vector logo dropzone, marketing tagline, website URL, and live sponsorship deliverables tracker.
6. **`season_passes` (Corporate Season Passes)**: Multi-campaign corporate season pass builder with automated 15% bundled discount and annual 501(c)(3) tax certificate.
7. **`roi_dossier` (Sponsor ROI Dossier)**: Post-event executive sponsor ROI report generator with foot traffic analytics, impressions, and community economic valuation ($31.80/hr).
8. **`qa_helpdesk` (Q&A Helpdesk)**: Searchable FAQ knowledgebase + live Commercial Event Chair messaging thread.
9. **`available_packages` (All Packages)**: Commercial booth and underwriting package catalog.

### 27.2 Real Interactive COI (Certificate of Insurance) Verification System
- Replaced mock representations with a real interactive verification and document upload workflow (`handleOpenCoiModal`, `handleSaveCoi`).
- **Data Captured**: Insurance Carrier / Agency Name, Policy Number, Policy Expiration Date, and File upload (`.pdf`, `.png`, `.jpg`).
- **Additional Insured Certification**: Mandatory checkbox verifying that the host organization is explicitly named as an Additional Insured with at least $1,000,000 in General Liability coverage.
- **Visual Status Engine**:
  - `⚠️ Action Required: Missing COI` (Red pill with pulsating alert)
  - `⏳ COI Verification in Progress` (Amber pill)
  - `✓ COI Verified & Cleared` (Emerald pill)

### 27.3 Multi-Method Online Invoice Checkout & Instant Tax Substantiation
- Interactive invoice checkout modal supporting 3 flexible payment rails:
  1. **Credit / Debit Card (Stripe-styled)**: Cardholder name, card number, expiration date, CVC, billing ZIP code.
  2. **ACH Wire / Direct Bank Transfer**: Displays organization routing number and account number with auto-generated invoice reference.
  3. **Corporate Check / Net-30 Terms**: Generates printable remittance voucher and physical mailing instructions.
- **Immediate State Progression**:
  - Updates vendor application status from `approved` $\rightarrow$ `paid`.
  - Automatically generates an official IRS 501(c)(3) tax receipt number (e.g. `REC-2026-VND-001`).
  - Computes Fair Market Value (FMV) offsets to identify tax-deductible contributions.
  - Clears the vendor for day-of load-in gate access (`✓ Paid in Full & Confirmed`).

### 27.4 Interactive Spatial Courtyard & Booth Allocation Grid
- Visual layout schematic illustrating:
  - **North Courtyard**: Main Stage, Bleachers, and Audio/Visual Control Booth.
  - **Artisan Alley**: Standard 10x10 numbered artisan vendor booths with active pitch highlighting (e.g. `Booth #A-14`).
  - **Center Plaza**: Pedestrian footpath and community activities.
  - **Food Truck Row**: Dedicated 220V power drops with reserved bays (e.g. `Bay #2`).
  - **Gate Operations**: Gate 1 (Pedestrian Arrival) vs Gate 3 (Heavy Vehicle Load-In & Power Transformers).

---

## 28. Digital Lead Capture, Equipment Rentals, Corporate Season Passes & ROI Analytics

### 28.1 In-Booth Attendee QR Badge Scanner & Lead CRM Export (`leads_hub`)
- **Interactive Camera Scanner Simulator (`QrCode`)**:
  - Simulates scanning attendee festival passes and badges in the vendor's booth.
  - Automatically extracts attendee name, company, email, phone, and generates instant lead capture records.
- **Manual Lead Entry Modal**:
  - Fast intake fallback for recording attendee details, assigning priority tiers (`🔥 Hot Lead (Ready to Buy)`, `☀️ Warm Lead (Follow-Up)`, `⭐ VIP Client`), and capturing conversational notes.
- **Filterable & Searchable CRM Table**:
  - Instant live keyword filtering across attendee names, emails, and notes.
- **1-Click CSV Lead Export**:
  - Exports a clean CSV file (`Vendor_Leads_[Event]_[Date].csv`) for instant import into Salesforce, HubSpot, or Excel.

### 28.2 Self-Service Rental Equipment & Booth Add-Ons Store (`equipment_addons`)
- **On-Demand Equipment Catalog**:
  - **Extra 6ft Heavy-Duty Folding Table & Chairs** ($35.00)
  - **10x10 Pop-Up Commercial Canopy Tent with 50lb Weights** ($85.00)
  - **Dedicated 20A / 110V Electrical Power Circuit & Quad Box** ($120.00)
  - **Premium High-Foot-Traffic Corner Pitch Upgrade** ($150.00)
- **1-Click Instant Add-On Checkout Modal**:
  - Quantity selector with real-time tax and subtotal computation.
  - Selectable payment rails (Corporate Card, Net-30 Invoice, Cash/Check at Gate).
  - Special delivery and placement instructions field (e.g., *"Place table near front left entrance"*).
- **Active Orders Ledger**:
  - Tracks fulfilled add-on orders with status pills (`✓ Confirmed & Assigned`) and itemized receipts.

### 28.3 Multi-Campaign Corporate Season Pass Bundling & 15% Savings Model (`season_passes`)
- **Multi-Campaign Sponsorship Bundling**:
  - Underwrite all 3 flagship campaigns across the academic year (*Fall Carnival & STEM Fair + Spring Charity Gala + Summer Youth Sports Classic*).
  - Automatically applies an automated **15% Multi-Event Bundled Discount** ($4,500 total value $\rightarrow$ $3,825 net contribution).
- **Consolidated Annual IRS 501(c)(3) Tax Substantiation**:
  - Single annual tax acknowledgement certificate covering all bundled campaigns with IRS Pub 526 compliance.
- **Annual Underwriting Builder Modal**:
  - Selectable tiers (*Gold Season Champion*, *Silver Season Supporter*, *Bronze Community Patron*).
  - Real-time billing schedule selection (*Single Annual Invoice* vs *Quarterly Installments*).

### 28.4 Post-Event Executive ROI Impact Dossier & Economic Valuation (`roi_dossier`)
- **Comprehensive Marketing & Audience Reach Metrics**:
  - **Total Estimated Festival Attendance**: 2,840 local community attendees.
  - **Enrolled Student Families Engaged**: 680 households.
  - **Fundraising Progress**: $48,250 raised (96.5% of $50,000 goal).
  - **Volunteer Service**: 485 student volunteer hours contributed.
- **Brand Exposure & Visibility Audit**:
  - **Main Stage High-Definition LED Screen**: 24 logo rotations.
  - **Digital Program & Schedule Scans**: 3,120 mobile views.
  - **Community Economic Value**: $15,423 calculated using the Independent Sector standard ($31.80/hr).
- **1-Click Printable Executive Dossier**:
  - Formats and downloads an official Executive Post-Event ROI Attestation signed by the Organization President.

---

## 29. Complete System Audit & Architectural Integrity Matrix

| Subsystem / Area | Key Types (`src/types/index.ts`) | App State & Dispatch (`src/context/AppContext.tsx`) | Primary Components | Verification Standard |
| :--- | :--- | :--- | :--- | :--- |
| **Multi-Tenant Org Governance** | `Organization`, `User`, `AuditLog` | `currentOrg`, `users`, `auditLogs`, `updateOrgBranding`, `inviteTeamMember` | `OrgExecutiveDashboard.tsx`, `TeamMemberManagerModal.tsx` | Strict `org_id` isolation, EIN deduplication, immutable audit ledger |
| **Event Planning & Committees** | `Event`, `SubPart`, `VariableApproval` | `events`, `subParts`, `variableApprovals`, `approveVariableRequest`, `rejectVariableRequest` | `MasterPlannerDashboard.tsx`, `EventBuilderWizard.tsx`, `LeadPortal.tsx` | Variable approval thresholds (> $250 budget, > 5 shift spots), Lead scoping |
| **Volunteer Shifts & Households** | `ShiftSlot`, `Registration`, `HouseholdMember` | `shiftSlots`, `registrations`, `householdMembers`, `addRegistration`, `checkInVolunteer` | `PublicEventLanding.tsx`, `UnifiedRegistrationModal.tsx`, `VolunteerCrm.tsx` | Zero double-booking algorithm, parental minor consent, magic token auth |
| **Supplies & Wishlists** | `ItemSlot`, `ItemDropOffRecord` | `itemSlots`, `itemDropOffRecords`, `pledgeItemSlot`, `recordItemDropOff` | `PublicEventLanding.tsx`, `LeadPortal.tsx`, `ReportsExportCenter.tsx` | IRS Pub 526/561 non-cash FMV deduction letters, physical drop-off tracking |
| **Commercial Vendors & Sponsors** | `VendorApplication`, `VendorInquiry`, `VendorLead`, `VendorAddOn`, `CorporateSeasonPass`, `EventImpactMetrics` | `vendorApplications`, `vendorInquiries`, `vendorLeads`, `vendorAddOns`, `corporateSeasonPasses`, `eventImpactMetrics`, `saveVendorCoi`, `processVendorPayment`, `addVendorLead`, `purchaseVendorAddOn`, `createCorporateSeasonPass` | `VendorSponsorDashboard.tsx`, `VendorMarketplaceManager.tsx`, `CommercialMarketplaceModal.tsx` | Real COI verification, multi-rail checkout, lead scanner CRM, 15% season pass discount, ROI dossier |
| **Door Kiosk & Gate Access** | `Registration`, `TicketTier` | `checkInVolunteer`, `registerWalkUpVolunteer` | `DoorKioskView.tsx`, `MobileKioskPassModal.tsx` | Role-gated access (`org_admin`, `event_planner`, `committee_lead` only), dual-mode express check-in |
| **IRS Tax Substantiation** | `TaxReceipt`, `DonationRecord` | `taxReceipts`, `donations`, `recordOfflineDonation`, `voidDonation` | `ReportsExportCenter.tsx`, `VendorSponsorDashboard.tsx` | Executive signatory vector rendering, IRS Pub 526/561 compliance, FMV offsets |

---

## 30. Comprehensive Setup Wizard & Entity Data Parity Standard

### 30.1 Full Field Parity Across Setup Wizards & Edit Modals
- All entity attributes supported in mock representations, public views, and reporting exports MUST have 100% authoring and editing parity across all administrative builders:
  1. **Event Campaigns (`Event`)**:
     - **Marketing Description & Story (`description`)**: Detailed multi-line pitch for fundraising, attractions, and community impact. Rendered in the "About this Campaign & Cause" card on `PublicEventLanding.tsx`.
     - **Virtual & Hybrid Streaming (`isVirtual`, `virtualLink`)**: Toggleable streaming URL with live stream badge and join links in the public header.
     - **Interactive Map / Directions Link (`mapUrl`)**: Direct Google Maps routing for attendees and volunteers.
     - **Theme Color Presets (`theme`)**: Sunset Coral, Electric Tech Cyan, Emerald Forest Green, Royal Indigo, Golden Amber, Crimson Rose with custom hex overrides.
     - **Automated Reminder Cadence (`reminderCadence`)**: Configurable notification intervals (*Standard: 72h/24h/2h*, *Intensive: 7d/72h/24h/2h*, *Same-Day Urgent: 2h*, *Custom*).
     - **Donor Processing Fee Coverage (`allowFeeCoverage`)**: Option to allow supporters to cover 2.9% + 30¢ credit card processing fees.
     - **Global Baseline Attire (`dressCode`)**: Organization-wide volunteer attire with 1-tap quick presets.
  2. **Committee Departments (`SubPart`)**:
     - **Operational Category (`category`)**: `labor_setup`, `hospitality_food`, `vendors_sponsors`, `auction_fundraising`, `registration_greeters`, `other`.
     - **Department Attire & Gear Instructions (`dressCodeNotes`)**: Inherits global attire with + Quick Add Gear tags.
     - **Department Tooling & Supplies Notes (`suppliesNotes`)**: Operational binders, clipboards, radios, and gear provided.
  3. **Volunteer Shifts (`Shift`)**:
     - **Minimum Age Requirement (`minAge`)**: Granular age limit validation (e.g. 14+, 18+) per shift.
     - **Required Skills & Certifications (`skillsRequired`)**: Specific qualifications (e.g. *First Aid, Food Safety, Heavy Lifting, Cash Handling*).
     - **Check-in Location / Gate Override (`reportingLocationOverride`)**: Overrides department gate for granular station assignments.
  4. **Commercial Packages & Ticket Tiers (`TicketTier`)**:
     - **Marketing Description (`description`)**: Detailed pitch for underwriters and booth operators.
     - **Instant Checkout vs Approval (`instantCheckout`)**: Toggleable self-service booking vs mandatory application review.
     - **Footprint Dimensions & Electricity (`boothDimensions`, `powerProvided`)**: Required space (e.g. 10x10) and 110V/220V power drops.
     - **IRS Fair Market Value Offset (`fairMarketValue`)**: Automatically computes tax-deductible contribution on 501(c)(3) receipts.

### 30.2 1-to-1 Public Output Rendering
- Every field captured in `EventBuilderWizard.tsx`, `MasterPlannerDashboard.tsx`, `OrgExecutiveDashboard.tsx`, and `LeadPortal.tsx` is rendered across public landing pages (`PublicEventLanding.tsx`), registration passes (`ConfirmationCard.tsx`), Door Kiosks (`DoorKioskView.tsx`), and CRM dossiers (`VolunteerCrm.tsx`).

---

## 31. Volunteer Visual Schedule Timeline & 1-Click Promotional Launch Kit Standard

### 31.1 Volunteer "Build Your Day" Visual Schedule Timeline Bar (`VisualScheduleTimelineBar.tsx`)
- **Docked Floating Intelligence**: Renders a floating, responsive schedule timeline at the bottom of `PublicEventLanding.tsx` whenever $\ge 1$ volunteer shift, wishlist supply item, admission ticket, or donation is selected.
- **Chronological Shift Sorting**: Automatically sorts selected shifts by `startTime` and calculates cumulative community service impact hours (e.g. `5.0 hrs of community impact`).
- **Zero-Conflict Overlap Engine**: Real-time validation checks for temporal overlap across all selected shifts (`startA < endB && endA > startB`).
  - Flags conflicting pairs with detailed minutes overlap warnings (e.g. `⚠️ Time Overlap Conflict: Setup Crew and Face Painting overlap by 30 minutes`).
  - Displays `✓ Zero Conflicts` when all shift timeframes are disjoint.
- **Transit & Rest Buffer Intelligence**: Dynamically computes break intervals between adjacent consecutive shifts (e.g. `⏱️ 30m break`, `⚡ Back-to-back shift`).
- **Quick Removal & 1-Click Checkout**: Direct `✕` removal buttons on individual shift pills and 1-click `Complete Sign-Up & Claim Passes` CTA launching the pre-loaded `UnifiedRegistrationModal`.

### 31.2 1-Click Multi-Channel Campaign Launch Kit & Recruitment Suite (`EventMarketingHub.tsx`)
- Accessible directly under the **"🚀 Campaign Launch Kit & Outreach"** tab in `MasterPlannerDashboard.tsx`.
- **5 Integrated Promotional Modules**:
  1. **🖨️ Printable 8.5x11 PDF Gate Posters & Tear-Off Flyers**:
     - Standard 8.5x11 letter page layout with organization branding, verified 501(c)(3) badge, event schedule, venue address, and urgent open volunteer shift needs.
     - Center high-contrast QR vector.
     - **8 Detachable Bottom Tear-Off Tabs**: Perforated-style tabs with mini QR codes and shortlinks for bulletin board posting.
     - 1-click `🖨️ Print / Save 8.5x11 PDF Flyer` triggering browser print stylesheet.
  2. **✉️ Pre-Written Email & Newsletter Recruitment Blasts**:
     - *Template A: Official Campaign Launch & Volunteer Callout*.
     - *Template B: T-7 Days Critical Shift Shortage Drive* (with student service hours emphasis).
     - *Template C: Sponsor & Commercial Artisan Outreach Pitch* (with 501(c)(3) tax deduction details).
     - 1-click `📋 Copy Subject & Body` with automatic live variable merge tags.
  3. **📱 Social Media & Messaging Share Pack**:
     - Formatted copy, emojis, and hashtags for Instagram, Facebook, Nextdoor, LinkedIn, and WhatsApp / SMS Broadcasts.
  4. **💻 Website Embed & High-Res QR Pack**:
     - Responsive HTML iframe embed snippet + high-resolution downloadable QR code in organization brand colors.
  5. **👥 Volunteer CRM Pool Re-Engagement Blast**:
     - 1-click targeted broadcast to past volunteer database.

---

## 32. Enterprise Governance, Pro-Bono Services, Broadcasts & Full-Spectrum Pass Parity

### 32.1 Organization Legal Identity & Policy Defaults (`OrgExecutiveDashboard.tsx`, `AppContext.tsx`)
- **Legal Entity & Tax Classification**:
  - Full authoring and live synchronization of **Legal Organization Name**, **Tax EIN (Tax ID)**, **Organization Type** (`school_pta`, `non_profit`, `youth_sports`, `church_faith`, `corporate_giving`, `other`), and **Default Currency** (USD, CAD, EUR, GBP).
- **Default Campaign Governance & Variable Approvals**:
  - Org-wide default budget threshold limit ($) and shift spots limit for Lead auto-approval vs Planner queue escalation.
  - Default reminder notification cadence configuration (*Standard 72h/24h/2h, Intensive 7d/72h/24h/2h, Same-Day Urgent, Custom*).
- **Team Leadership Contact Attributes**:
  - Author and edit Full Legal Name, Direct Email, Mobile Phone, System Role, and Department Lead assignments with real-time state persistence.

### 32.2 Pro-Bono In-Kind Professional Service Ledger (`MasterPlannerDashboard.tsx`, `LeadPortal.tsx`)
- **Professional Services Tracking**:
  - Dedicated ledger for pro-bono commercial services (*Graphic Design, Audio/Visual Engineering, Legal Counsel, Electrical Setup, Photography, Security*).
  - Captures Donor / Company Name, Service Description, Estimated Fair Market Value (FMV), and Assigned Committee Department.
- **1-Click Delivery Verification**:
  - Planners and Department Leads can toggle status between `Pledged / Scheduled` and `✓ Verified Delivered`, automatically calculating in-kind financial contributions for annual 990/CPA reports.

### 32.3 Master Broadcast Announcements Hub (`MasterPlannerDashboard.tsx`)
- **Multi-Channel Dispatch Engine**:
  - Real-time broadcast creation with multi-channel selection (*Email Blast*, *SMS Text*, *Mobile Push*, *Gate Kiosk Notice*).
  - Urgency categorization (*Normal Update*, *Urgent Attention*, *Critical Alert*).
  - Target audience scoping (*All Attendees & Volunteers*, *Lead Chairs & Staff Only*, *Active Shift Volunteers*).
- **Immutable Notification Ledger**:
  - Dispatched broadcasts are rendered in a chronological announcement ledger with status badges, audience tags, and 1-click removal.

### 32.4 Volunteer CRM Historical Service Logging (`VolunteerCrm.tsx`, `AppContext.tsx`)
- **Manual Historical Service Entry Modal**:
  - Coordinators can record past event service for volunteers outside active online campaigns:
    - Event / Campaign Title and Historical Event Date.
    - Contributed Service Hours, Roles / Shifts Served, Supplies Donated, and Direct Donations ($).
    - Event Campaign Outcome ($ raised for cause) and Authorized Verifying Coordinator Name.
  - Automatically updates the volunteer's lifetime statistics (`lifetimeHours`, `lifetimeDonations`, `eventsParticipated`, `lastActive`) and appends an immutable `VolunteerEventHistory` entry.

### 32.5 Complete Self-Service Pass & Confirmation Card 4-in-1 Parity (`ManageRegistration.tsx`, `ConfirmationCard.tsx`)
- **Full-Spectrum Registration Management**:
  1. **Scheduled Volunteer Shifts**: Displays shift title, start/end timeframe, assigned household member, committee department, reporting gate, lead on duty contact, dress code notes, and real-time check-in status.
  2. **Pledged Wishlist Supplies & Equipment**: Displays item name, promised quantity, drop-off location/gate, deadline, calculated FMV per unit, and received delivery status.
  3. **Admission & Commercial Tickets / Sponsor Packages**: Displays package title, quantity, total price, and assigned booth footprint number.
  4. **Direct Donations & Tax Receipts**: Displays monetary donation amount, 501(c)(3) tax receipt number, and tax deduction eligibility.
- **Calendar & Mobile Check-In Integration**:
  - 1-click `.ics` Apple iCal / Outlook file download and 1-click Google Calendar integration pre-populated with reporting gate and Lead contact info.
  - Express Day-of-Event QR check-in pass and optional 1-tap password setting to claim account and link household family dependents.

---

## 33. Best-of-Breed Production Security, Compliance Standards & Live Database Hardening

REACH enforces an enterprise-grade defense-in-depth security architecture designed to meet **SOC 2 Type II**, **COPPA (Children's Online Privacy Protection Act)**, and **IRS 501(c)(3) Statutory Tax Substantiation** standards.

### 33.1 SOC 2 Type II Security & Cryptographic Authentication
- **Timing-Safe OTP Verification (`crypto.timingSafeEqual`)**:
  - Passwordless 6-digit one-time passcodes are evaluated using constant-time byte comparisons via `verifyOtpTimingSafe` in `api/_lib/auth.ts`, eliminating side-channel timing attacks.
- **Stateless HMAC-SHA256 JWT in HttpOnly Cookies**:
  - Authenticated sessions issue signed JWTs (`createSessionJwt`) delivered via `HttpOnly`, `Secure`, `SameSite=Strict`, `Path=/` cookies (`setSessionCookie`), safeguarding credentials against client-side XSS extraction.
- **Distributed Sliding-Window Token-Bucket Rate Limiting (`api/_lib/rateLimiter.ts`)**:
  - Protects public API endpoints from automated brute force and credential stuffing by enforcing strict per-IP rate limits with standard `X-RateLimit-*` response headers.
- **Enterprise HTTP Security Headers (`vercel.json`)**:
  - Enforces `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS).
  - Enforces `X-Frame-Options: DENY` (Anti-Clickjacking).
  - Enforces `X-Content-Type-Options: nosniff`.
  - Enforces strict Content Security Policy (`Content-Security-Policy`).

### 33.2 COPPA & Minor Participant PII Protection
- **Household Dependent Mental Model**:
  - Minors (<18 or <13 years old) are linked as household dependents under an adult parent/guardian account.
  - Minors are never prompted for direct phone numbers, email addresses, or independent logins.
- **Parental Co-Signing Ledger**:
  - Youth volunteer shifts require parental/guardian consent with vector canvas stroke signature capture, legal name, timestamp, and IP address for compliance verification.

### 33.3 IRS 501(c)(3) Statutory Tax Substantiation & Immutability Trigger
- **Database-Level Immutability**:
  - A PostgreSQL database trigger `prevent_immutable_tax_receipt_tampering` prevents any mutation or deletion of issued tax receipts on the `tax_receipts` table.
- **Fair Market Value (FMV) Deductions**:
  - Automatically calculates tax-deductible portions for donor receipts in compliance with IRS Publication 526 and 561.

### 33.4 100% PostgreSQL Row-Level Security (RLS) on Live Neon Database
- All 20 relational database tables (`organizations`, `events`, `sub_parts`, `shifts`, `registrations`, `crm_supporters`, `donations`, `tax_receipts`, etc.) have Row-Level Security activated.
- SQL queries and mutations are isolated by `org_id` and verified session context.

### 33.5 Zero Double-Booking Anti-Collision Scheduling Engine (`src/utils/scheduling.ts`)
- Evaluates temporal overlap using interval arithmetic ($startA < endB \land endA > startB$).
- Prevents single participants from double-booking while permitting multiple household family members to serve in concurrent shifts.

### 33.6 Dual-Mode Hybrid Database Client (`api/_lib/db.ts`, `src/services/apiClient.ts`)
- Seamlessly connects to live Neon PostgreSQL with connection pooling when configured, with zero-downtime graceful fallback to in-memory mock stores in offline sandbox environments.

### 33.7 Comprehensive Legal Policies Suite & A2P 10DLC Compliance
- **Complete Legal Document Corpus (`src/content/legal/`)**:
  - `Terms of Service`: Covers 501(c)(3) representations, minor safety rules, E-SIGN Act compliance, fee structures, and binding arbitration.
  - `Privacy Policy`: Zero data-sale commitment, SOC 2 Type II data security safeguards, sub-processor disclosures, and retention terms.
  - `COPPA Minor Privacy Notice`: Household dependent model, zero direct minor contact info collection, verifiable parental consent (VPC), and parental inspection/deletion rights.
  - `California Notice at Collection & Do Not Sell / Share`: CCPA/CPRA statutory disclosure tables, statutory retention schedules, and consumer rights request workflows.
  - `SMS A2P 10DLC Carrier Compliance Policy`: TCPA and CTIA compliant carrier disclosures, message frequency (~3–5 msgs/event), HELP/STOP keyword rules, and non-prechecked opt-in consent checkboxes.
  - `IRS 501(c)(3) Tax Substantiation Policy`: Contemporaneous written acknowledgement under IRC § 170(f)(8), Fair Market Value (FMV) offsets under IRS Pub 526/561, and immutable tax receipt ledger guarantees.
- **Unified Legal UI & Consent Components**:
  - `LegalModalCenter.tsx`: Searchable, printable 6-tab legal policy viewer accessible from any view or footer link without clearing active cart or form states.
  - `SmsOptInConsentBlock.tsx`: Standardized A2P 10DLC opt-in checkbox with dynamic organization name binding, carrier disclosures, and direct modal triggers.
  - `GlobalAppFooter.tsx`: Universal compliance badge bar (SOC 2, COPPA, 501(c)(3), 10DLC, RLS) and legal navigation hub.

### 33.8 Automated Database Backup & Disaster Recovery Schedule (`scripts/backup-db.mjs`, `scripts/restore-db.mjs`)
- **Automated Backup Engine**:
  - Full schema and table export across all 20 tables to gzip-compressed SQL dumps with SHA-256 integrity checksum calculation and JSON manifest logging.
- **Disaster Recovery SLA**:
  - **RPO (Recovery Point Objective)**: <5 minutes via Neon Continuous Write-Ahead Log (WAL) Point-in-Time Recovery.
  - **RTO (Recovery Time Objective)**: <15 minutes via automated restore script (`npm run db:restore`).
### 33.9 Admin Observability Hub, User Impersonation & Full Account Lifecycle Management

REACH includes an enterprise-grade **Admin Observability, Accounts & Diagnostics Hub** (`AdminObservabilityHub.tsx`) and **User Impersonation Engine** (`StickyImpersonationBanner.tsx`) accessible to Org Super Admins.

#### 1. Full User Account Lifecycle Management (`AdminObservabilityHub.tsx` - Tab 1)
- **Comprehensive Account Directory**: Displays all organization and platform users with active roles, scoped committee departments, account status (`active` vs `suspended`), last login timestamp, last seen IP address, total login counts, and 2FA status.
- **Account Actions**:
  - **Create User Account**: Create verified staff, coordinators, leads, or volunteers with assigned roles and committee scopes.
  - **Edit User Profile**: Modify contact info, phone numbers, assigned roles, and scoped committee departments.
  - **Account Suspension & Enforcement**: Admins can suspend accounts with a required reason. The authentication gate (`login` and `loginWithCode` in `AppContext.tsx`) strictly blocks suspended accounts with informative suspension messages. Accounts can be reactivated with 1 click.
  - **Emergency Password Reset (6-Digit OTP)**: Issues cryptographically secure, single-use 6-digit verification passcodes for locked-out coordinators or staff.
  - **Account Deletion**: Safely removes obsolete accounts with confirmation safeguards (prevents self-deletion of active admin session).

#### 2. User Impersonation ("See What They See") (`StickyImpersonationBanner.tsx`)
- **Non-Destructive Identity Swapping**:
  - Super Admins can select any user to experience the entire application from their exact perspective (e.g. Scoped Committee Lead with restricted department visibility, artisan Vendor with booth selection, or Volunteer with private self-service pass).
  - Preserves original admin credentials in `impersonatedOriginalUser` and `impersonatedOriginalRole` so terminating impersonation immediately restores administrative credentials without re-authenticating.
- **Sticky Top Impersonation Banner**:
  - Renders a prominent amber/indigo header alerting the operator of active impersonation mode with target user name, email, role, and organization.
  - Features 1-click `🛑 Exit Impersonation & Return to Admin` to instantly return to the Admin Observability Hub.
- **Immutable SOC 2 Audit Trail**:
  - Starting and terminating an impersonation session automatically writes immutable `USER_IMPERSONATION_STARTED` and `USER_IMPERSONATION_ENDED` audit records with operator ID, target user ID, and timestamps.

#### 3. Real-Time Exception Diagnostics & Sentry Simulator (Tab 2)
- **Live Error Stream**: Real-time tracking of platform runtime exceptions, component crashes, and API failures with severity levels (`fatal`, `error`, `warning`, `info`), source component tags, full formatted stack traces, and 1-click resolution workflows.
- **Interactive Exception Simulator**: Allows engineers and admins to simulate critical production errors (*Stripe Payment Timeout*, *Database Deadlock*, *Waiver Canvas Out of Memory*, *Custom Message/Component*) to verify resilience and telemetry capture.

#### 4. Core Web Vitals & API Latency Telemetry (Tab 3)
- **Live CWV Metrics**: Tracks real-time performance indicators against Google Core Web Vitals thresholds:
  - **LCP (Largest Contentful Paint)**: Target < 2.5s (Good).
  - **INP (Interaction to Next Paint)**: Target < 200ms (Good).
  - **CLS (Cumulative Layout Shift)**: Target < 0.1 (Good).
  - **FCP (First Contentful Paint)**: Target < 1.8s (Good).
  - **TTFB (Time to First Byte)**: Target < 800ms (Good).
- **API Latency Distribution**: Visual latency meters across critical backend endpoints (`/api/v1/auth/verify-otp`, `/api/v1/registrations/checkout`, `/api/v1/events/manifest`, `/api/v1/donations/record`).

#### 5. Uptime Heartbeat & Infrastructure Probes (Tab 4)
- **Infrastructure Health Suite**: Monitored health checks across critical infrastructure subsystems:
  - Neon PostgreSQL Serverless Cluster (Database Ping & Query Latency)
  - Distributed Redis Cache & BullMQ Dispatch Queue (Latency & Memory)
  - AWS SES / Resend Multi-Tenant Email Gateway (DKIM/SPF & SLA)
  - A2P 10DLC Carrier Registry SMS Gateway (Throughput & Delivery)
  - Storage Bucket & Asset CDN (Media Latency)
- **On-Demand Health Audit**: 1-click button to trigger a live re-evaluation of all infrastructure probes.

#### 6. SOC 2 Security Audit Log Stream (Tab 5)
- **Immutable Security Ledger**: Real-time chronological audit trail of all governance, auth, impersonation, suspension, and financial mutations.
- **Search, Filter & 1-Click CSV Export**: Instant filtering by action type, actor, or date range, with statutory CSV audit ledger export for SOC 2 Type II compliance reviews.

---

## 34. Spotlight Command Palette (⌘K) & Impersonation Studio (`ImpersonationCommandPalette.tsx`)

### 34.1 Global Command Palette & Multi-Attribute Search
- **Shortcut**: `⌘K` (Mac) / `Ctrl+K` (Windows/Linux) or via `⌘K Switcher` header buttons.
- **Multi-Attribute Search**: Matches against legal names, emails, phone numbers, roles, organizations, and department sub-parts.
- **3-Dimensional Faceting Rail**:
  - **Organizations**: Filter across all tenant orgs.
  - **Role Taxonomy**: Dynamic match counters per role.
  - **Committee Sub-Parts**: Departmental scoping filters.
- **Smart Recents Queue**: Persists recently viewed/impersonated profiles in `sessionStorage`.
- **6 Canonical Archetypes**: Instant 1-click persona switching (Super Admin, Event Chair, Food Lead, Vendor, Volunteer, Door Kiosk).

### 34.2 Perspective Preview Dossier & Live Administration
- **Live Identity Telemetry**: Real-time display of Account ID, Organization, Role, Email, Phone, Scoped Departments, Last Login, Total Logins, 2FA status, and granular permissions.
- **On-the-Fly Role & Department Scope Modifier**: In-place editor allowing Super Admins to adjust user roles and multi-select committee department assignments with instant state persistence.
- **1-Click Super Admin Promotion & Demotion**:
  - Promotes user to Super Admin (`adminPromoteToSuperAdmin`) or revokes admin privileges (`adminRevokeSuperAdmin`) with full SOC 2 Type II audit logging (`ADMIN_PRIVILEGES_GRANTED`, `ADMIN_PRIVILEGES_REVOKED`).



