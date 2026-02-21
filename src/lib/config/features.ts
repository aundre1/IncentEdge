/**
 * Feature Flags Configuration
 *
 * Environment-based feature flags for MVP simplicity.
 * Can upgrade to LaunchDarkly/Flagsmith later if needed.
 *
 * Usage:
 *   import { FEATURES, isFeatureEnabled } from '@/lib/config/features';
 *
 *   if (FEATURES.MARKETPLACE) { ... }
 *   // or
 *   if (isFeatureEnabled('MARKETPLACE')) { ... }
 */

export const FEATURES = {
  // Phase 2 Features (disabled by default for MVP)
  MARKETPLACE: process.env.NEXT_PUBLIC_FEATURE_MARKETPLACE === 'true',
  DIRECT_PAY: process.env.NEXT_PUBLIC_FEATURE_DIRECT_PAY === 'true',
  OFFTAKERS: process.env.NEXT_PUBLIC_FEATURE_OFFTAKERS === 'true',
  REGULATORY: process.env.NEXT_PUBLIC_FEATURE_REGULATORY === 'true',
  AI_GRANTS: process.env.NEXT_PUBLIC_FEATURE_AI_GRANTS === 'true',

  // MVP Features (enabled by default)
  ELIGIBILITY_ENGINE: process.env.NEXT_PUBLIC_FEATURE_ELIGIBILITY !== 'false',
  INCENTIVE_MATCHING: process.env.NEXT_PUBLIC_FEATURE_MATCHING !== 'false',
  REPORTS: process.env.NEXT_PUBLIC_FEATURE_REPORTS !== 'false',

  // Development/Debug Features
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  DEBUG_LOGS: process.env.NODE_ENV === 'development',
} as const;

export type FeatureFlag = keyof typeof FEATURES;

/**
 * Check if a feature is enabled
 * @param feature - The feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return FEATURES[feature];
}

/**
 * Get all enabled features
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): FeatureFlag[] {
  return (Object.keys(FEATURES) as FeatureFlag[]).filter(
    (key) => FEATURES[key]
  );
}

/**
 * Get all disabled features
 * @returns Array of disabled feature names
 */
export function getDisabledFeatures(): FeatureFlag[] {
  return (Object.keys(FEATURES) as FeatureFlag[]).filter(
    (key) => !FEATURES[key]
  );
}
