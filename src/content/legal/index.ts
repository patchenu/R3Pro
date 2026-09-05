export * from './termsOfService';
export * from './privacyPolicy';
export * from './coppaMinorPrivacy';
export * from './californiaPrivacyNotice';
export * from './smsA2pCompliancePolicy';
export * from './irsTaxSubstantiationPolicy';

export type LegalDocType = 
  | 'terms' 
  | 'privacy' 
  | 'coppa' 
  | 'california' 
  | 'sms' 
  | 'irs';
