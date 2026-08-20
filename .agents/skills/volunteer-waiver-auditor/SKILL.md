---
name: volunteer-waiver-auditor
description: Performs legal compliance audits across volunteer registrations, verifying that all participants (especially minors with parental consent) have signed valid digital waivers before shift start.
---

# Volunteer Waiver Auditor Skill

## Overview
This skill automates compliance auditing for legal liability releases, parental consent forms, food handling certificates, and photo permissions.

## Procedures

### 1. Compliance Audit Workflow
- Iterates through all registered primary volunteers and sub-members/family members.
- Checks if the assigned shift requires a `waiver_template_id`.
- Verifies existence and validity of `SignedWaiver`:
  - `signature_data` (drawn vector stroke or confirmed legal name).
  - `signed_at` ISO timestamp.
  - `signer_relationship` (must be `Parent` or `Legal Guardian` if `is_minor: true`).
  - `emergency_contact_phone` is present.

### 2. Pre-Event Alert Dispatch
- Generates a targeted list of volunteers with `Waiver Pending` status 48 hours and 24 hours before the event.
- Generates an instant waiver signature link with the participant's `manage_token` for fast mobile completion.

### 3. Door-Check Enforcement Report
- Generates an on-site Door Compliance Manifest for kiosk tablet operators and door greeters, flagging any arriving volunteer requiring immediate tablet signature before badge printing.
