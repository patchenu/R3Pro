---
name: reminder-schedule-dispatcher
description: Evaluates event schedules, verifies reminder cadences (72h, 24h, 2h), and generates tailored notification payloads with exact reporting gates, Lead contact info, and QR passes routed through dedicated priority queues.
---

# Reminder Schedule Dispatcher Skill

## Overview
This skill manages the automated communication pipeline, delivering rich, contextual notifications to volunteers, donors, and vendors based on configured schedule cadences and priority fast-lanes.

## Procedures

### 1. Cadence Evaluation & Payload Generation
Evaluates active events against preset reminder triggers:
- **72h / 3-Day Logistics Brief (Queue P3 - Broadcast & Info)**:
  - Event venue address with map link and parking instructions.
  - Overall schedule and volunteer check-in point.
- **24h Critical Shift Reminder (Queue P1 - Gate & Arrival)**:
  - Exact shift title, start time, and end time.
  - Specific **Reporting Gate / Entrance** (e.g. *Gate 3 East Entrance*).
  - Designated **Committee Lead On Duty**: Name, mobile phone, and radio channel.
  - Dress code requirements (e.g. *Closed-toe shoes, volunteer t-shirt*).
  - Supplies / equipment to bring (e.g. *Work gloves, water bottle*).
  - 1-click **Confirm Attendance** button.
- **2h Express Gate Pass Delivery (Queue P1 - Instant Push)**:
  - Express check-in QR code pass for instant scanning at the tablet kiosk or lead mobile scanner.
- **Day-Of Urgent Alerts (Queue P1 - Emergency Push)**:
  - Rain delays, schedule shifts, and gate reassignments.

### 2. Multi-Tenant Fast-Lane Priority Routing
- **🚨 Queue P0 (<2.0s SLA)**: Security OTP passcodes and 1-click passwordless login links.
- **📱 Queue P1 (<5s SLA)**: T-2h mobile QR check-in passes and day-of gate notices.
- **🧾 Queue P2 (<15s Real-Time)**: IRS Publication 526/561 tax deduction receipts and drop-off vouchers.
- **📢 Queue P3 (50/sec Limit)**: Volunteer recruitment campaigns and annual birthday milestone greetings.

### 3. Cellular A2P 10DLC Compliance Rules
- Every outbound SMS notification must prepend the organization brand identifier in position 1 (e.g. `[Lincoln High PTA]`).
- All carrier keywords (`STOP`, `START`, `HELP`) are strictly isolated by `(phone, org_id)`.

