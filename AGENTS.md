# GatherRaise Project Knowledge, Architecture & Developer Guidelines

This document provides system knowledge, core architectural rules, and coding standards for all developers and AI agents working on the GatherRaise codebase.

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

## 16. Event Creation Strategies, Blank Slate Management & Discovery Tags
- **3 Setup Modes in `EventBuilderWizard.tsx`**:
  1. **`🏛️ Industry Blueprints`**: Pre-loads best-practice operational departments, volunteer shifts, capacities, and item wishlists in 1 click.
  2. **`📋 Clone from Past Event`**: Replicates previous year campaigns for annual recurrences, preserving proven committees, budgets, and volunteer roles.
  3. **`⚡ Blank Canvas (Start from Scratch)`**: Initializes a clean event without preloaded dependencies.
- **Blank Slate Operations in Planner Hub (`MasterPlannerDashboard.tsx`)**:
  - If an event is created with 0 preloaded shifts/departments, the Planner uses 1-click modals:
    - `+ Add Committee Department`: Defines name, allocated budget, designated Lead (name, phone, email, radio), and reporting gate directions.
    - `+ Add Shift Need`: Defines volunteer slot requirements, hours, capacities, and waiver rules.
    - `+ Add Supply Need`: Publishes in-kind item wishlist drop-offs with target counts and deadlines.
- **Public Search & Discovery Tags (`event.tags: string[]`)**:
  - Supports curated preset tags (`Family Friendly`, `STEM & Tech`, `Food & Bake Sale`, `Carnival & Games`, `Athletics & Sports`, `Charity Gala`, `Silent Auction`, `Student Service Hours`) and dynamic custom tags.
  - Interactive Tag pills in `CommunityDiscoveryHub.tsx` enable instantaneous filtering and keyword search matching for public attendees.

---

## 17. Birthday Milestone Intelligence, Canvas Signature Accuracy & Frictionless Account Claiming
- **Birthday Capture & Volunteer CRM Milestone Recognition**:
  - Sign-up captures **Date of Birth (`birthDate`, YYYY-MM-DD)** instead of static age numbers.
  - Dynamically calculates current age (`calculateAge`) and automatically determines minor status (`isMinor = age < 18`) for legal parental waiver enforcement.
  - Feeds into automated annual birthday greeting dispatch campaigns and volunteer milestone recognition workflows.
- **Digital Canvas Vector Stroke Precision (No Pointer Offset)**:
  - Responsive canvas signature pads (`SignaturePad.tsx`) dynamically synchronize buffer resolution (`canvas.width` / `canvas.height`) with bounding client rect dimensions and Device Pixel Ratio (DPR).
  - Normalizes touch and mouse pointer coordinates 1:1 with CSS pixels, eliminating pointer misalignment and drawing offsets.
- **Frictionless Magic-Token vs Password Creation Mental Model**:
  - **Frictionless Shift Sign-Up**: Public volunteers register without mandatory upfront password creation, eliminating 40%+ conversion drop-off. Instant pass access is secured via 256-bit `manageToken`.
  - **Optional Account Claiming**: Volunteers can set an optional password during registration (Step 3) or directly on their post-signup confirmation screen (`ConfirmationCard.tsx`) to claim their volunteer profile, link household family dependents, and access their personal GatherRaise dashboard to track verified service hours and certificates.

---

## 18. Passwordless 6-Digit OTP, Magic Links & Token Storage Architecture
- **Delivery Channels for Self-Service Access**:
  1. **Instant Signup Confirmation Email**: Contains 1-click self-service magic URL (`/manage-registration?token=...`).
  2. **Automated SMS Reminders**: Dispatched at T-72h, T-24h, and T-2h with direct mobile check-in passes.
  3. **Embedded Calendar Appointment (.ics)**: Self-service management URL is embedded inside calendar invite notes so volunteers can access their pass directly from Google Calendar or Apple iCal.
- **Token Storage & Persistence Model**:
  - High-entropy 256-bit `manage_token` values are stored in the backend database (`registrations.manage_token`).
  - Saved in browser `localStorage` (`gatherraise_active_tokens`) for instantaneous pass recovery on returning desktop/mobile visits.
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



