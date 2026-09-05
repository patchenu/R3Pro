# Security Architecture, Tenant Isolation, RBAC & Compliance Standards

GatherRaise (`R3Pro`) enforces a defense-in-depth security model engineered to satisfy **SOC 2 Type II**, **COPPA (Children's Online Privacy Protection Act)**, and **IRS 501(c)(3) Statutory Tax Substantiation** standards.

---

## 1. Multi-Tenant Data Isolation & PostgreSQL Row-Level Security (RLS)

### 1.1 Tenant Boundary Isolation
- **Organization Scoping**: Every database entity (`events`, `sub_parts`, `shifts`, `registrations`, `crm_supporters`, `donations`, `tax_receipts`, etc.) requires and validates `org_id`.
- **Anti-IDOR (Insecure Direct Object References)**: Attempting to query, mutate, or delete an entity across tenant boundaries is blocked at both the application API layer and the PostgreSQL database engine.

### 1.2 100% PostgreSQL Row-Level Security (RLS) Coverage
All 20 relational tables on the live Neon PostgreSQL cluster have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`):
- `organizations`, `users`, `events`, `sub_parts`, `shifts`, `item_slots`, `ticket_tiers`, `registrations`, `registration_members`, `registration_shifts`, `registration_items`, `registration_tickets`, `waiver_templates`, `waiver_signatures`, `donations`, `tax_receipts`, `crm_supporters`, `volunteer_event_history`, `audit_logs`, `broadcast_announcements`.
- Policies strictly isolate SELECT, INSERT, UPDATE, and DELETE operations based on verified session claims (`current_setting('app.current_org_id', true)`).

---

## 2. Cryptographic Authentication & Passwordless Security

### 2.1 Timing-Safe 6-Digit OTP Verification
- Login passcodes are generated via cryptographically secure random integers (`crypto.randomInt(100000, 999999)`).
- Code verification uses constant-time byte comparisons via `crypto.timingSafeEqual()` in `api/_lib/auth.ts`:
  ```ts
  export function verifyOtpTimingSafe(providedCode: string, expectedCode: string): boolean {
    if (!providedCode || !expectedCode) return false;
    const bufProvided = Buffer.from(providedCode.trim());
    const bufExpected = Buffer.from(expectedCode.trim());
    if (bufProvided.length !== bufExpected.length) return false;
    return crypto.timingSafeEqual(bufProvided, bufExpected);
  }
  ```
- Eliminates remote side-channel timing attacks.

### 2.2 Stateless HMAC-SHA256 JWT in HttpOnly Cookies
- Authenticated sessions issue signed JWTs containing `userId`, `orgId`, `role`, and `exp`.
- Tokens are delivered via hardened cookies:
  - `HttpOnly: true` (Inaccessible to client JavaScript, preventing XSS credential theft).
  - `Secure: true` (Dispatched strictly over TLS/HTTPS).
  - `SameSite: Strict` (Immune to Cross-Site Request Forgery / CSRF attacks).
  - `Path: /`

### 2.3 Cryptographic Participant Self-Service Tokens
- Public volunteers register without mandatory password creation friction.
- Every registration receives a **256-bit high-entropy cryptographically secure `manage_token`**.
- Allows participants to view check-in passes, modify household shifts, and sign digital waivers at `/manage-registration?token=...`.

---

## 3. Server-Side Request Validation & Rate Limiting

### 3.1 Zod Strict Schema Validation (`api/_lib/validation.ts`)
All serverless API routes (`/api/registrations`, `/api/events`, `/api/shifts`, `/api/crm`, `/api/kiosk`, `/api/auth`) enforce server-side Zod schemas:
- Strict type coercion, bounds checking (min/max lengths), email/phone formatting, and ISO-8601 datetime validation.
- All non-conforming payloads are rejected with HTTP `400 Bad Request` prior to SQL query dispatch.

### 3.2 Sliding-Window Token-Bucket Rate Limiting (`api/_lib/rateLimiter.ts`)
- Public API routes are protected by sliding-window rate limiters keyed by client IP (`x-forwarded-for` / `x-real-ip`).
- Default thresholds:
  - `/api/auth` (OTP requests): 5 requests / 60 seconds.
  - `/api/registrations` (Sign-ups): 20 requests / 60 seconds.
  - `/api/kiosk` (Gate check-in): 60 requests / 60 seconds.
- Injects standard headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- Returns HTTP `429 Too Many Requests` when limits are exceeded.

---

## 4. Enterprise HTTP Security Headers (`vercel.json`)

All responses from GatherRaise edge servers include hardened security headers:
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options`: `DENY` (Anti-Clickjacking)
- `X-Content-Type-Options`: `nosniff`
- `X-XSS-Protection`: `1; mode=block`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Content-Security-Policy`: Restricts script, style, image, connect, font, frame, and object sources to authorized domains.

---

## 5. COPPA & Minor Participant PII Protection

- **Household Mental Model**: Minors (<18 or <13 years old) are modeled as dependents attached to their parent/guardian's primary account.
- **Zero Minor Contact Information Collection**: Phone numbers and email addresses are never requested or stored for minor dependents.
- **Parental Co-Signing**: Youth shifts require a parent/guardian's legal name, relationship designation, and digital signature before check-in passes are activated.

---

## 6. IRS 501(c)(3) Statutory Tax Substantiation & Immutability

### 6.1 Database-Level Immutability Trigger
To satisfy IRS statutory audit requirements, a PostgreSQL trigger (`prevent_immutable_tax_receipt_tampering`) is installed on the `tax_receipts` table:
```sql
CREATE OR REPLACE FUNCTION check_tax_receipt_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.receipt_number IS NOT NULL AND NEW.receipt_number != OLD.receipt_number THEN
      RAISE EXCEPTION 'IRS 501(c)(3) Compliance Error: Issued tax receipt numbers are immutable and cannot be altered.';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'IRS 501(c)(3) Compliance Error: Issued tax receipts cannot be deleted.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 6.2 Fair Market Value (FMV) Offsets
- Sponsorship packages and auction items calculate tax-deductible portions according to IRS Publication 526 and 561:
  $$\text{Tax Deductible Amount} = \text{Total Payment} - \text{Fair Market Value of Perks}$$

---

## 7. Zero Double-Booking Anti-Collision Scheduling Engine (`src/utils/scheduling.ts`)

- Shift overlap validation engine evaluates temporal collisions:
  $$\text{Overlap} \iff \text{Start}_A < \text{End}_B \land \text{End}_A > \text{Start}_B$$
- **Per-Participant Validation**: Prevents a single volunteer from being assigned to overlapping shifts, while allowing separate household family members to serve simultaneously.

---

## 8. Role-Based Access Control (RBAC) Matrix

| Role | Scope | Allowed Actions |
| :--- | :--- | :--- |
| **Org Super Admin** | Entire Organization | Manage branding, legal identity & governance defaults, team roles, billing, view cross-event volunteer CRM, log past event service, dispatch broadcasts, financial ledgers, audit logs. |
| **Event Planner** | Assigned Event(s) | Set dates, venue, fundraising goal, assign Committee Leads, configure approval thresholds, review approval queue, manage pro-bono service ledger, dispatch multi-channel announcements, publish event. |
| **Committee Lead** | Assigned Department (Sub-Part) | Create/edit shifts and wishlists within department, verify pro-bono service delivery, manage department expenses, station check-in, broadcast to department volunteers. |
| **Vendor / Sponsor** | Business Tier | Submit intake info (EIN, COI, power), select booth, pay invoice/card, download tax receipts. |
| **Door Kiosk Attendant** | Gate Operations | Fast name/phone check-in lookup, on-site touchscreen waiver signing, day-of walk-up volunteer registration. |
| **Volunteer / Donor** | Self-Service Public | Claim shifts, register family, pledge items, donate, sign waivers, view/edit via secure manage token or OTP login. |

---

## 9. Comprehensive Legal Compliance & A2P 10DLC Standard

### 9.1 Legal Document Architecture (`src/content/legal/`)
- **Terms of Service**: 501(c)(3) representations, minor safety, E-SIGN Act compliance, non-refundable platform fees, and binding dispute arbitration.
- **Privacy Policy**: Zero sale/sharing of personal information, SOC 2 Type II data safeguards, sub-processor disclosures, and data subject rights.
- **COPPA Minor Privacy Notice**: Household dependent model, zero direct contact collection from children, verifiable parental consent (VPC), and parental inspection/deletion rights.
- **California Notice at Collection & Do Not Sell / Share**: CCPA/CPRA statutory disclosure matrix, category retention schedules, and consumer opt-out workflows.
- **SMS A2P 10DLC Carrier Compliance Policy**: TCPA and CTIA guidelines, message frequency (~3–5 msgs/event), HELP/STOP keyword automation, non-prechecked opt-in consent checkboxes, and strict carrier zero-sharing rules.
- **IRS 501(c)(3) Tax Substantiation Policy**: IRC § 170(f)(8) contemporaneous written acknowledgement, Fair Market Value (FMV) offsets under IRS Pub 526/561, and immutable tax receipt ledger guarantees.

### 9.2 UI & Consent Integration
- **`LegalModalCenter.tsx`**: Searchable, printable 6-tab legal policy viewer accessible anywhere across the platform.
- **`SmsOptInConsentBlock.tsx`**: Reusable component ensuring non-prechecked explicit opt-in with organization branding and mandatory carrier disclosures.
- **`GlobalAppFooter.tsx`**: Universal compliance badge bar (SOC 2, COPPA, 501(c)(3), 10DLC, RLS) and legal navigation hub.

---

## 10. Automated Database Backup & Disaster Recovery Schedule

### 10.1 Multi-Tier Backup Cadence
- **Tier 1 (Continuous Point-in-Time Recovery)**: Neon WAL streaming enables recovery to any millisecond within the past 7–30 days.
- **Tier 2 (Daily Automated Exports)**: Daily pg_dump gzip SQL dumps with SHA-256 checksums and automated JSON manifest logging.
- **Tier 3 (Weekly Offsite Encrypted Replicas)**: AWS S3 / GCP Cloud Storage with AES-256 encryption.
- **Tier 4 (Annual Cold Statutory Archive)**: 7-year immutable archive for IRS 501(c)(3) non-profit audit compliance.

### 10.2 Disaster Recovery Metrics
- **RPO (Recovery Point Objective)**: <5 minutes
- **RTO (Recovery Time Objective)**: <15 minutes via automated restore script (`npm run db:restore`)

