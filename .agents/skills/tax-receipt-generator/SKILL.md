---
name: tax-receipt-generator
description: Formats IRS-compliant 501(c)(3) tax acknowledgement letters, calculates fair market value deduction offsets for auction items and sponsor perks, and bundles annual giving statements.
---

# Tax Receipt Generator Skill

## Overview
This skill ensures strict adherence to IRS regulations governing substantiation of charitable contributions for 501(c)(3) non-profit organizations, PTAs, and community foundations under IRS Publication 526, 561, and IRC Section 170(f)(8).

## Procedures

### 1. Contribution Substantiation & Deductibility Calculations
- **Direct Donations**: 100% tax-deductible charitable contribution.
- **Quid Pro Quo Contributions**:
  - For tickets, gala tables, and commercial sponsor packages where goods/services are provided in return:
  - $$\text{Deductible Amount} = \text{Total Payment} - \text{Fair Market Value (FMV) of Goods/Services Provided}$$
  - Example: A $1,000 Corporate Sponsor Tier providing $150 FMV dinner perks is substantiated as $850 tax-deductible.
- **In-Kind Property & Equipment Donations**:
  - Generates official non-cash contribution acknowledgement letters recording item descriptions, received condition, and donor-declared FMV without direct appraisal warranties (as prescribed by IRS rules).
- **Pro-Bono Professional Services**:
  - Tracks donated commercial services for Form 990 labor valuation records.

### 2. Statutory Immutability & Database Integrity
- Validates that issued tax receipts are saved in the `tax_receipts` table protected by the PostgreSQL `prevent_immutable_tax_receipt_tampering` trigger.
- Prevents tampering, deletion, or retrofitting of issued receipt numbers.

### 3. Official Tax Acknowledgement Letter Output
Generates formatted letters and printable PDFs containing:
- Organization Legal Name, Physical Address, and Employer Identification Number (EIN).
- Donor Legal Name and Address.
- Date of contribution and immutable unique receipt number.
- Gross amount received and net tax-deductible amount.
- Mandatory IRS statutory affirmation statement: *"No goods or services were provided in exchange for this contribution other than those specified above."*
- Authorized signature vector of the Organization Executive / Treasurer.

