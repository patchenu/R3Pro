---
name: volunteer-waiver-auditor
description: Performs legal compliance audits across volunteer registrations, verifying that all participants (especially minors with parental consent) have signed valid digital waivers before shift start.
---

# Volunteer Waiver Auditor Skill

## Overview
This skill automates compliance auditing for legal liability releases, parental consent forms under COPPA/minor safety regulations, food handling certificates, and photo permissions.

## Procedures

### 1. Compliance & COPPA Minor Safety Audit Workflow
- Iterates through all registered primary volunteers and household dependents/members.
- Enforces COPPA compliance: Minors (<18 years old) are linked as household dependents and are never asked for independent email addresses or phone numbers.
- Checks if the assigned shift requires a `waiver_template_id`.
- Verifies existence and validity of `SignedWaiver`:
  - `signature_data` (drawn HTML5 vector stroke or confirmed typed legal name).
  - `signed_at` ISO-8601 timestamp and signer IP address.
  - `signer_relationship` (must be `Parent` or `Legal Guardian` if `is_minor: true`).
  - `emergency_contact_phone` is present and verified.

### 2. Pre-Event Alert Dispatch
- Generates a targeted list of volunteers with `Waiver Pending` status 48 hours and 24 hours before the event.
- Generates an instant waiver signature link with the participant's 256-bit cryptographic `manage_token` for fast mobile completion.

### 3. Door-Check Enforcement & Kiosk Mode
- Generates an on-site Door Compliance Manifest for kiosk tablet operators and door greeters.
- Flags any arriving volunteer or minor requiring immediate on-tablet touchscreen signature before digital pass activation and badge printing.
- Validates that executed signatures are immutably recorded in the `waiver_signatures` database table under PostgreSQL Row-Level Security.

