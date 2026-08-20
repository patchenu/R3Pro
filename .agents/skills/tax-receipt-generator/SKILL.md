---
name: tax-receipt-generator
description: Formats IRS-compliant 501(c)(3) tax acknowledgement letters, calculates fair market value deduction offsets for auction items and sponsor perks, and bundles annual giving statements.
---

# Tax Receipt Generator Skill

## Overview
This skill ensures compliance with IRS regulations governing substantiation of charitable contributions for 501(c)(3) non-profit organizations, PTAs, and community foundations.

## Procedures

### 1. Contribution Substantiation & Calculations
- **Direct Donations**: 100% tax-deductible.
- **Quid Pro Quo Contributions**:
  - For tickets, gala tables, and sponsor packages where goods/services are provided in return:
  - `Deductible Amount = Total Payment - Fair Market Value (FMV) of goods/services provided`.
  - Example: A $250 Gala Ticket providing a $50 dinner is substantiated as $200 tax-deductible.
- **In-Kind & Auction Donations**:
  - Records donor's declared description of the property without appraising monetary value (as required by IRS rules).

### 2. Official Tax Acknowledgement Letter Output
Generates formatted letters and printable PDFs containing:
- Organization Legal Name, Physical Address, and Employer Identification Number (EIN).
- Donor Legal Name and Address.
- Date of contribution and receipt number.
- Gross amount received and net tax-deductible amount.
- Mandatory IRS affirmation statement: *"No goods or services were provided in exchange for this contribution other than those specified above."*
- Authorized signature line for the Organization Executive / Treasurer.
