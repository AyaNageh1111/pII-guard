//
// 🔐 Basic Personal Data (Identifiers -  Article 4)
//
export const PiiTypes = [
  'full-name',
  'first-name',
  'last-name',
  'middle-name',
  'full_name',
  'first_name',
  'last_name',
  'username',
  'email',
  'phone-number',
  'mobile',
  'ip-address',
  'ip-addresses',
  'address',
  'postal-code',
  'location',
  'cookie-id',
  'device-id',
  'browser-fingerprint',
  'license-plate',
] as const;

//
// Special Categories of Personal Data ( Article 9)
//
export const SpecialCategories = [
  'racial-or-ethnic-origin',
  'political-opinion',
  'religious-belief',
  'philosophical-belief',
  'trade-union-membership',
  'genetic-data',
  'biometric-data',
  'health-data',
  'sex-life',
  'sexual-orientation',
] as const;

//
// 💳 Financial & Government Identifiers (sector-specific laws)
//
export const Identifiers = [
  'national-id',
  'passport-number',
  'driving-license-number',
  'ssn',
  'vat-number',
  'credit-card',
  'iban',
  'bank-account',
] as const;

//
// Tracking & Behavioral Data ( + ePrivacy Directive)
//
export const TrackingData = [
  'device-metadata',
  'location-coordinates',
  'mac-address',
  'imei',
  'session-id',
  'user-agent',
  'referrer-url',
  'usage-pattern',
  'analytics-id',
] as const;

//
// Combined Export for Zod or Validation
//
export const AllPiiTypes = [
  ...PiiTypes,
  ...SpecialCategories,
  ...Identifiers,
  ...TrackingData,
] as const;

export type PiiType = (typeof AllPiiTypes)[number];
export type PiiTypes = typeof AllPiiTypes;
