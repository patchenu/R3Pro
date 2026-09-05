export const COPPA_MINOR_PRIVACY_CONTENT = {
  title: "Children's Privacy Statement (COPPA & Minor Safety)",
  lastUpdated: 'September 5, 2026',
  version: '2.4.0',
  summary: "REACH complies strictly with the Children's Online Privacy Protection Act (COPPA, 16 CFR Part 312), state student data privacy laws, and school volunteer safety guidelines.",
  sections: [
    {
      id: 'coppa-overview',
      title: '1. Commitment to Child & Student Safety',
      content: `REACH is widely used by School PTAs, Booster Clubs, Youth Sports Leagues, Scouts, and Non-Profit Foundations where youth volunteers actively contribute to their communities. We place the highest priority on protecting children's privacy and ensuring verifiable parental oversight.

In compliance with COPPA and FERPA privacy principles, REACH does NOT knowingly collect personal contact information directly from children under 13 years of age (or minors under 18) without verifiable parental consent.`
    },
    {
      id: 'household-mental-model',
      title: '2. The Household Dependent Mental Model',
      content: `To completely insulate children from unauthorized online contact, REACH uses a Household Dependent architecture:

• Primary Adult Account: Registrations are created exclusively by an adult parent, legal guardian, or authorized family member using the adult's email address and mobile phone number.
• Minor Dependents: Children are registered as dependent members under the parent's primary account.
• No Direct Child Contact Info: The Platform NEVER prompts children for an independent email address, telephone number, home address, or separate password login.
• Safe Display: On public shift rosters and volunteer manifests, minor information is masked or displayed only to authorized committee leads on duty.`
    },
    {
      id: 'verifiable-consent',
      title: '3. Verifiable Parental Consent (VPC) & Vector E-Sign',
      content: `Before any child or student is permitted to claim a volunteer shift or check in at an event:

1. Digital Minor Consent Release: The Platform presents an explicit Minor Liability, Medical Emergency & Photo Release waiver.
2. Vector Signature Capture: The parent or legal guardian must provide their typed full legal name, specify their legal relationship ("Parent" or "Legal Guardian"), and execute a digital signature on the vector canvas pad.
3. Cryptographic Verification Ledger: The Platform captures and timestamps the parental signature, IP address, and browser metadata to form a legally binding compliance audit record for insurance underwriters and school administrators.`
    },
    {
      id: 'student-service-hours',
      title: '4. Student Community Service Hours Verification',
      content: `For high school students fulfilling National Honor Society (NHS), graduation requirements, or scouting badges:
• Service hours logged by student volunteers are audited and verified by the designated Event Coordinator.
• The Platform generates official, printable Community Service Verification Certificates featuring executive officer signature vectors and IRS 501(c)(3) non-profit organization seals.
• Service records are never sold, monetized, or shared with commercial recruiters.`
    },
    {
      id: 'parental-rights',
      title: '5. Parental Rights: Review, Inspect & Delete',
      content: `Parents and legal guardians retain full control over their child's information at all times:
• Right to Review: Inspect all shift history, attendance records, and waivers linked to your household.
• Right to Refuse Further Collection: Revoke consent at any time and prevent further participation.
• Right to Delete: Request complete deletion of your child's name and service history from the organization's CRM.

To exercise these rights, email coppa-privacy@reachplatform.com or use the self-service registration management portal at /manage-registration.`
    }
  ]
};
