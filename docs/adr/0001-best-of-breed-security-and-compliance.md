# ADR 0001: Best-of-Breed Production Security, Multi-Tenant Isolation & Legal Compliance

- **Status**: Accepted
- **Date**: 2026-09-05
- **Deciders**: Security Architecture Team, Core Maintainers
- **Compliance Frameworks**: SOC 2 Type II (Security & Confidentiality), COPPA (Child Online Privacy Protection), IRS Publication 526/1771 (501(c)(3) Substantiation)

---

## 1. Context & Problem Statement

REACH (R3Pro) is a multi-tenant operating system for School PTAs, 501(c)(3) Non-Profit Charities, Youth Sports Leagues, and Community Foundations. The platform processes:
1. **Multi-Tenant Operations**: Thousands of organizations operating on a shared PostgreSQL infrastructure without cross-tenant data leaks.
2. **Minor Personal Identifiable Information (PII) & Safety**: Registration of minors (under 18) for volunteer activities requiring explicit parental consent and liability waivers.
3. **Statutory Non-Profit Tax Deductions**: Issuance of official IRS 501(c)(3) donation receipts, FMV offsets, and in-kind contribution letters subject to CPA and IRS audits.
4. **Public Frictionless Self-Service**: Unauthenticated volunteers accessing their passes via magic tokens without credential fatigue.

To guarantee platform safety against automated bot attacks, injection vulnerabilities, privilege escalations, and regulatory non-compliance, REACH mandates a **defense-in-depth security architecture**.

---

## 2. Architectural Decisions & Hardening Controls

### 2.1 Database-Level Row-Level Security (RLS)
- **Decision**: Multi-tenant isolation is enforced at the PostgreSQL database engine layer via **Row-Level Security (RLS)** (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`), rather than relying solely on application-level `WHERE` clauses.
- **Mechanism**: Every table enforces `org_id` isolation linked to the session context (`current_setting('app.current_org_id')`), preventing cross-tenant leakage even in the event of an application software bug.

### 2.2 Server-Side Schema Validation & Input Sanitization (Zod)
- **Decision**: All incoming API requests to `/api/*` are validated, stripped of executable payloads, and coerced using server-side **Zod schemas** (`api/_lib/validation.ts`).
- **Enforcement**: E.164 phone formats, email normalization, positive financial bounds, and length restrictions on digital vector signature strings.

### 2.3 Cryptographic Passwordless OTP & Timing-Safe Verification
- **Decision**: Passwordless 6-digit OTP verification utilizes `crypto.timingSafeEqual` over normalized byte buffers, eliminating side-channel timing analysis attacks.
- **Session Tokens**: JWT sessions are delivered exclusively via **`HttpOnly`, `Secure`, `SameSite=Strict` cookies** (inaccessible to browser JavaScript, mitigating XSS token theft).

### 2.4 Distributed Rate Limiting & Anti-Abuse Throttling
- **Decision**: Public endpoints are guarded by token-bucket sliding-window rate limiters (`api/_lib/rateLimiter.ts`):
  - `auth-otp-send`: 5 requests / 15 minutes per IP.
  - `auth-otp-verify`: 5 attempts / 15 minutes per identifier (brute-force defense).
  - `registration-create`: 10 requests / minute per IP.
  - `pass-lookup`: 30 requests / minute per IP.
  - `kiosk-checkin`: 60 check-ins / minute per station.

### 2.5 IRS 501(c)(3) Statutory Immutability Trigger
- **Decision**: Database trigger `prevent_immutable_tax_receipt_tampering()` blocks `UPDATE` or `DELETE` operations on issued donation receipts and tax numbers.
- **Compliance**: Adheres to IRS Publication 1771 rules requiring immutable financial audit ledgers for non-profit substantiation.

### 2.6 Enterprise HTTP Security Headers & Content Security Policy (CSP)
- **Decision**: `vercel.json` configures strict HTTP security headers:
  - `Content-Security-Policy`: Restricts script execution to trusted domains (self, Stripe, Google Fonts).
  - `Strict-Transport-Security (HSTS)`: `max-age=63072000; includeSubDomains; preload`.
  - `X-Frame-Options: DENY`: Prevents UI redressing and clickjacking.
  - `X-Content-Type-Options: nosniff`: Prevents MIME confusion exploits.

---

## 3. Compliance Matrix

| Regulation / Standard | Requirement | REACH Implementation |
| :--- | :--- | :--- |
| **SOC 2 Type II** | Logical Tenant Separation | PostgreSQL Row-Level Security (RLS) + `org_id` composite unique keys. |
| **SOC 2 Type II** | Authentication & Session Security | `HttpOnly`, `SameSite=Strict` JWT cookies + timing-safe OTP verification. |
| **COPPA / Minor Safety** | Parental Guardian Co-Signing | Mandatory parent legal name, relationship, and vector signature before minor check-in. |
| **IRS 501(c)(3)** | Immutable Tax Acknowledgements | Append-only database triggers blocking modification of issued donation receipts. |
| **OWASP Top 10** | SQLi / XSS / CSRF / Rate Limiting | Tagged SQL parameterization, Zod sanitization, CSP headers, sliding-window rate limiters. |

---

## 4. Consequences & Verification
- **Positive**: Platform is fully hardened against bot scraping, brute-force attacks, timing attacks, and cross-tenant data leaks.
- **Testing**: Automated security unit test runner (`scratch/test_security_suite.mjs`) and live database verification (`npm run db:verify`) validate all policies continuously in CI/CD.
