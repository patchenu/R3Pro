---
name: reminder-schedule-dispatcher
description: Evaluates event schedules, verifies reminder cadences (72h, 24h, 2h), and generates tailored notification payloads with exact reporting gates, Lead contact info, and QR passes.
---

# Reminder Schedule Dispatcher Skill

## Overview
This skill manages the automated communication pipeline, delivering rich, contextual notifications to volunteers, donors, and vendors based on configured schedule cadences.

## Procedures

### 1. Cadence Evaluation
Evaluates active events against preset reminder triggers:
- **72h / 3-Day Logistics Brief**:
  - Event venue address with map link and parking instructions.
  - Overall schedule and volunteer check-in point.
- **24h Critical Shift Reminder**:
  - Exact shift title, start time, and end time.
  - Specific **Reporting Gate / Entrance** (e.g. *Gate 3 East Entrance*).
  - Designated **Committee Lead On Duty**: Name, mobile phone, and radio channel.
  - Dress code requirements (e.g. *Closed-toe shoes, volunteer t-shirt*).
  - Supplies / equipment to bring (e.g. *Work gloves, water bottle*).
  - 1-click **Confirm Attendance** button.
- **2h Express Gate Pass**:
  - Express check-in QR code pass for instant scanning at the tablet kiosk or lead mobile scanner.

### 2. Targeted Sub-Part Broadcasts
- Formulates department-specific announcements (e.g. Food Lead broadcasting a menu change strictly to the 12 Concession Stand helpers).
