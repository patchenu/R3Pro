export const IRS_TAX_SUBSTANTIATION_CONTENT = {
  title: 'IRS 501(c)(3) Charitable Giving & Tax Substantiation Policy',
  lastUpdated: 'September 5, 2026',
  version: '2.4.0',
  summary: 'This document details how GatherRaise generates IRS-compliant charitable contribution acknowledgements in accordance with Internal Revenue Code (IRC) Section 170(f)(8), IRS Publication 526, Publication 561, and Publication 1771.',
  sections: [
    {
      id: 'statutory-substantiation',
      title: '1. IRC § 170(f)(8) Written Acknowledgement Mandate',
      content: `The Internal Revenue Service requires donors claiming charitable tax deductions for contributions of $250 or more to obtain a Contemporaneous Written Acknowledgement (CWA) from the recipient 501(c)(3) organization.

GatherRaise automates this requirement by issuing official, serialized, and immutable Tax Acknowledgement Letters for all verified contributions. Every letter contains:
1. Organization Legal Name, Address, and Verified Employer Identification Number (EIN).
2. Donor Legal Full Name and Contact Details.
3. Date of contribution and unique serialized receipt identifier (e.g. TAX-2026-Q3-0042).
4. Gross amount of money received or detailed description of in-kind property.
5. Statutory IRS Affirmation Statement: "No goods or services were provided in exchange for this contribution other than those specified herein."
6. Authorized Signature Vector and Title of the Organization Executive / Treasurer.`
    },
    {
      id: 'quid-pro-quo',
      title: '2. Quid Pro Quo Contributions & Fair Market Value (FMV) Offsets',
      content: `Under IRC § 6115, when a donor receives goods or services (such as gala dinners, admission wristbands, golf rounds, or promotional perks) in exchange for a payment exceeding $75, the contribution is a "Quid Pro Quo" contribution.

GatherRaise automatically calculates the deductible portion:
$$\\text{Tax Deductible Contribution} = \\text{Total Payment} - \\text{Fair Market Value (FMV) of Perks}$$

Example: A $1,000 Corporate Gold Sponsorship Tier that includes $150 FMV for 2 gala dinners and $50 FMV for promotional shirts is substantiated as:
• Total Received: $1,000.00
• Value of Goods Provided: $200.00
• Net Tax-Deductible Contribution: $800.00`
    },
    {
      id: 'in-kind-property',
      title: '3. In-Kind Property & Equipment Donations (IRS Pub 561)',
      content: `For supply wishlist donations, physical equipment, and silent auction items:
• IRS regulations prohibit 501(c)(3) organizations from appraising or guaranteeing the cash value of non-cash property.
• GatherRaise generates Non-Cash Contribution Vouchers recording:
  - Exact donor-provided description of the property (e.g. "4 Cases Commercial Grade Bottled Water").
  - Physical delivery timestamp and receiving volunteer signature.
  - Condition of property at time of drop-off.
• The donor remains responsible for determining Fair Market Value on IRS Form 8283 for non-cash gifts exceeding $500.`
    },
    {
      id: 'database-immutability',
      title: '4. Database Immutability & Audit Defense',
      content: `To withstand IRS audit scrutiny and CPA reconciliation:
• The GatherRaise PostgreSQL database engine enforces a trigger (prevent_immutable_tax_receipt_tampering) on the tax_receipts table.
• Once issued, tax receipt numbers, deduction amounts, and tax years CANNOT be edited, overwritten, or deleted by any user or administrator.
• Records are archived in compliance with the mandatory 7-year statutory tax audit retention schedule.`
    }
  ]
};
