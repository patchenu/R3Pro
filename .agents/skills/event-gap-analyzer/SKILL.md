---
name: event-gap-analyzer
description: Inspects active events, calculates fill percentages, identifies critical shortages (<50% filled within 48h), flags no-show risks, and generates draft broadcast invitations to past volunteers.
---

# Event Gap Analyzer Skill

## Overview
This skill scans an organization's active and upcoming events to detect operational deficits, staffing gaps, inventory shortfalls, and budget overruns before they impact event day.

## Procedures

### 1. Shift Fulfillment Audit
- Calculates the fill rate (`claimed_count / capacity`) for every volunteer shift.
- Categorizes shifts into health tiers:
  - 🔴 **Critical Deficit**: `< 50%` capacity and event starts within `72 hours`.
  - 🟡 **Moderate Shortage**: `50% - 79%` capacity.
  - 🟢 **Fully Staffed**: `80% - 100%` capacity.

### 2. Supply & Item Shortage Detection
- Compares `quantity_pledged` vs `quantity_needed` across all departments (e.g. Folding Tables, Water Cases, Baked Goods).
- Flags any critical items with `0%` pledges within `48 hours`.

### 3. No-Show Risk Indicator
- Identifies confirmed volunteers who have not:
  1. Acknowledged their 24h reminder notification.
  2. Signed their mandatory legal waiver.
- Calculates an aggregate No-Show Risk Score (0-100%) per shift.

### 4. Automated Resolution Generation
- Formulates a pre-filled targeted broadcast invitation payload for the Event Planner:
  - Filters past volunteers from the Organization CRM with matching skills.
  - Generates ready-to-send SMS/Email copy: *"Urgent: We need 4 more helpers for Morning Setup this Saturday! Tap here to claim a shift."*
