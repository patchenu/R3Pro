---
name: communication-dispatcher
description: Evaluates multi-tenant email deliverability health, SPF/DKIM/DMARC alignment, 4-queue priority fast-lane routing, and A2P 10DLC cellular carrier compliance.
---

# Communication Dispatcher & Deliverability Auditor Skill

## Overview
This skill validates tenant-isolated email and SMS communication infrastructure, manages custom sending domains, verifies DNS authentication records (DKIM, SPF, DMARC, MX), enforces carrier A2P 10DLC regulations, and routes notifications across the 4-lane priority queue hierarchy.

## Procedures

### 1. Delivery Mode & Sending Identity Evaluation
- **R3Pro Hosted Cloud Pool (Turnkey Zero-Config)**:
  - Validates pre-warmed AWS SES / Resend cloud pool dispatch.
  - Ensures customized `Sender Display Name` (*e.g., "Lincoln High PTA Events"*) and `Reply-To Email` (*e.g., "treasurer@lincolnpta.org"*) are configured.
  - Injects tenant routing header `X-Entity-Ref-ID: org_{org_id}` for webhook attribution.
- **Custom Branded Organization Domain (100% White-Labeled)**:
  - Verifies custom sending domain (*e.g., `events@mail.lincolnpta.org`*).
  - Validates API Key encryption and provider connection (Resend, Postmark, AWS SES, Custom SMTP).

### 2. DNS Authentication Audit & Verification
- Validates the 4 required DNS records:
  - **DKIM (CNAME)**: Public key cryptographic signature verification.
  - **SPF (TXT)**: IP authorization string (`v=spf1 include:_spf.resend.com ~all`).
  - **DMARC (TXT)**: Phishing policy enforcement (`v=DMARC1; p=none; rua=mailto:...`).
  - **MX (Mail Exchange)**: Custom return-path routing for bounce telemetry.
- **DNS Troubleshooting Rules**:
  - *Duplicate Domain Suffix Guard*: Checks if registrar (e.g. GoDaddy) appended root domain twice.
  - *Cloudflare Gray Cloud Verification*: Ensures Cloudflare CNAME proxy is set to **DNS Only (Gray Cloud)** rather than Proxied (Orange Cloud).
  - *1-Click Fallback Trigger*: Recommends instant switch to R3Pro Hosted Cloud Pool if event start < 1 hour and DNS is unpropagated.

### 3. 4-Lane Highway Priority Queue Classification
- **🚨 Emergency Siren Lane (Queue P0: Security & Login OTPs)**: `<2.0s SLA`, never throttled behind bulk emails.
- **📱 Express Gate Lane (Queue P1: Mobile QR Passes & Alerts)**: `<5s SLA` instant push for live gate check-in passes and day-of notices.
- **🧾 Official Tax Lane (Queue P2: IRS 501(c)(3) Receipts & Pledges)**: Real-time statutory tax receipts and in-kind equipment vouchers.
- **📢 Metered Outreach Lane (Queue P3: Volunteer Recruitment & Updates)**: Metered at 50/sec per organization to protect domain reputation.

### 4. Real-Time Connection Testing & Carrier Handshakes
- **Email API Provider Ping**: Tests live REST authentication, latency ms, and TLS 1.3 protocol verification (HTTP 200 OK).
- **A2P 10DLC TCR Carrier Handshake**: Verifies carrier network route availability across Tier-1 US cellular carriers (Verizon, AT&T, T-Mobile) and confirms brand prefix compliance.

### 5. In-Place Editability & Unsaved Changes Guard
- Detects pending configuration changes (`hasUnsavedCommChanges`) between form state and stored database settings.
- Enforces user verification before page departure, providing 1-click `Discard Changes` reversion.

### 6. A2P 10DLC Carrier Compliance & Suppression Scoping
- Enforces organization brand identifier in SMS position 1 (e.g. `[Lincoln High PTA]`).
- Scopes opt-out keywords (`STOP`, `UNSUBSCRIBE`) strictly to `(phone_e164, org_id)`.
