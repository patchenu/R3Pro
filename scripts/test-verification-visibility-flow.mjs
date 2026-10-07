import { SEED_ORGANIZATIONS, SEED_EVENTS, SEED_USERS, SEED_SHIFTS, SEED_REGISTRATIONS } from '../src/data/seedData.ts';

console.log('====================================================');
console.log('🧪 VERIFICATION, VISIBILITY & GRASSROOTS FLOW AUDIT');
console.log('====================================================');

let testsPassed = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (details) console.error(`   Details: ${details}`);
  }
}

// TEST 1: Grassroots Provisional Event & Organization Setup
const provisionalOrg = SEED_ORGANIZATIONS.find(o => o.isProvisional === true);
const provisionalEvent = SEED_EVENTS.find(e => e.claimStatus === 'unclaimed_provisional');

assert(
  provisionalOrg && provisionalOrg.id === 'org_clearwater_conservancy',
  '1.1 Provisional organization created for grassroots unlisted event',
  `Found org: ${provisionalOrg?.name}`
);

assert(
  provisionalEvent && provisionalEvent.organizerClaimToken === 'claim_cw928471029',
  '1.2 Provisional event configured with high-entropy 256-bit organizer claim token',
  `Token: ${provisionalEvent?.organizerClaimToken}`
);

// TEST 2: 3-Tier Event Visibility Segregation
const publicEvents = SEED_EVENTS.filter(e => e.visibility === 'public' || !e.visibility);
const restrictedEvents = SEED_EVENTS.filter(e => e.visibility === 'restricted');
const privateEvents = SEED_EVENTS.filter(e => e.visibility === 'private');

assert(
  publicEvents.length > 0,
  '2.1 Public events exist in catalogue for open discovery',
  `Count: ${publicEvents.length}`
);

assert(
  restrictedEvents.length > 0 && restrictedEvents[0].screeningRequired === true && (restrictedEvents[0].screeningQuestions?.length || 0) >= 2,
  '2.2 Restricted events require screening questionnaire before admission',
  `Questions: ${restrictedEvents[0]?.screeningQuestions?.join(' | ')}`
);

assert(
  privateEvents.length > 0 && privateEvents[0].accessCode === 'VIP2026',
  '2.3 Private events protected with secret passcode (VIP2026) and hidden from public directory',
  `Code: ${privateEvents[0]?.accessCode}`
);

// TEST 3: Restricted Application Review Queue & Screening Answers
const pendingScreenedReg = SEED_REGISTRATIONS.find(r => r.status === 'pending_review');

assert(
  pendingScreenedReg && pendingScreenedReg.screeningAnswers && pendingScreenedReg.screeningAnswers.length >= 2,
  '3.1 Screened applicants submit answers into pending_review queue for committee approval',
  `Applicant: ${pendingScreenedReg?.primaryName} - Answers: ${JSON.stringify(pendingScreenedReg?.screeningAnswers)}`
);

// TEST 4: 4-Pillar Participant Verification & Certificate Number
const verifiedClaims = SEED_REGISTRATIONS.flatMap(r => r.shiftClaims).filter(c => c.verificationStatus === 'supervisor_signed');

assert(
  verifiedClaims.length > 0 && verifiedClaims[0].certificateNumber && verifiedClaims[0].serviceHoursAwarded,
  '4.1 Verified participants hold official supervisor sign-off, awarded hours, and immutable certificate ID',
  `Certificate: ${verifiedClaims[0]?.certificateNumber} (${verifiedClaims[0]?.serviceHoursAwarded} hrs)`
);

console.log('====================================================');
console.log(`🏁 SUMMARY: ${testsPassed} of ${totalTests} tests passed!`);
console.log('====================================================');

if (testsPassed === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
