# Security Architecture, Tenant Isolation & RBAC

## 1. Multi-Tenant Data Isolation
- **Organization Boundary**: All SQL queries and storage lookups filter by `org_id`.
- **Anti-IDOR (Insecure Direct Object References)**: Attempting to access or mutate an entity (e.g. shift, budget item, participant record) belonging to an unauthorized organization or sub-part returns a strict 403 Forbidden.

---

## 2. Role-Based Access Matrix

| Role | Scope | Allowed Actions |
| :--- | :--- | :--- |
| **Org Super Admin** | Entire Organization | Manage branding, legal identity & governance defaults, team roles, billing, view cross-event volunteer CRM, log past event service, dispatch broadcasts, financial ledgers, audit logs. |
| **Event Planner** | Assigned Event(s) | Set dates, venue, fundraising goal, assign Committee Leads, configure approval thresholds, review approval queue, manage pro-bono service ledger, dispatch multi-channel announcements, publish event. |
| **Committee Lead** | Assigned Department (Sub-Part) | Create/edit shifts and wishlists within department, verify pro-bono service delivery, manage department expenses, station check-in, broadcast to department volunteers. |
| **Vendor / Sponsor** | Business Tier | Submit intake info (EIN, COI, power), select booth, pay invoice/card, download tax receipts. |
| **Door Kiosk Attendant** | Gate Operations | Fast name/phone check-in lookup, on-site touchscreen waiver signing, day-of walk-up volunteer registration. |
| **Volunteer / Donor** | Self-Service Public | Claim shifts, register family, pledge items, donate, sign waivers, view/edit via secure manage token or OTP login. |

---

## 3. Cryptographic Participant Tokens
- Participants are not forced to create permanent accounts with passwords to volunteer.
- When an attendee registers, a **256-bit high-entropy UUIDv4 `manage_token`** is generated.
- The participant uses this token to view, update, add family members, sign waivers, or cancel their registration securely at `/manage/:token`.
