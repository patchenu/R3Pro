---
name: vendor-booth-allocator
description: Evaluates vendor intake applications, validates Certificate of Insurance (COI) submissions, and calculates spatial booth grid assignments.
---

# Vendor Booth Allocator Skill

## Overview
This skill manages the intake, vetting, and spatial allocation of commercial vendors, food trucks, and corporate exhibitors.

## Procedures

### 1. Application Vetting
- Validates vendor business registration data:
  - Business Legal Name & DBA.
  - Tax ID / EIN validation format.
  - Primary Contact Email & Mobile Phone.
  - Power / Electricity requirements (e.g. 110V 20A, 220V 50A, or Self-Powered Generator).
  - Space dimensions required (e.g. 10x10, 10x20, 30ft Food Truck Pitch).
  - Certificate of Insurance (COI) policy number and expiration date.

### 2. Spatial Booth Grid Allocation
- Evaluates available numbered booth slots (`Booth #A-1` through `Booth #C-20`, `Food Truck Bay 1-5`).
- Matches power needs with venue electrical hookup coordinates.
- Generates assigned booth passes and instructions for the vendor confirmation packet.
