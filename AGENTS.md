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
