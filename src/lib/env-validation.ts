/**
 * IncentEdge Environment Validation
 *
 * Validates that all required environment variables are present and properly formatted.
 * Run this at application startup to catch configuration issues early.
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    required: number;
    optional: number;
    missing: number;
    present: number;
  };
}

interface EnvVarConfig {
  name: string;
  required: boolean;
  validator?: (value: string) => boolean;
  description: string;
  sensitive?: boolean;
}

// Define all environment variables with their requirements
const ENV_VARS: EnvVarConfig[] = [
  // Supabase - Required
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    validator: (v) => v.startsWith('http://') || v.startsWith('https://'),
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    validator: (v) => v.length > 100, // JWT tokens are long
    description: 'Supabase anonymous key',
    sensitive: true,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: process.env.NODE_ENV === 'production',
    validator: (v) => v.length > 100,
    description: 'Supabase service role key (server-side only)',
    sensitive: true,
  },

  // API Security
  {
    name: 'API_SIGNING_SECRET',
    required: process.env.NODE_ENV === 'production',
    validator: (v) => v.length >= 32,
    description: 'HMAC signing secret (min 32 chars)',
    sensitive: true,
  },
  {
    name: 'API_KEY_PREFIX',
    required: false,
    description: 'API key prefix (default: ie_)',
  },

  // App Configuration
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    validator: (v) => v.startsWith('http://') || v.startsWith('https://'),
    description: 'Application base URL',
  },
  {
    name: 'NEXT_PUBLIC_APP_NAME',
    required: false,
    description: 'Application display name',
  },
  {
    name: 'NODE_ENV',
    required: true,
    validator: (v) => ['development', 'production', 'test'].includes(v),
    description: 'Node environment',
  },

  // Rate Limiting
  {
    name: 'RATE_LIMIT_MAX_TOKENS',
    required: false,
    validator: (v) => !isNaN(parseInt(v)) && parseInt(v) > 0,
    description: 'Maximum tokens for rate limiting',
  },
  {
    name: 'RATE_LIMIT_REFILL_RATE',
    required: false,
    validator: (v) => !isNaN(parseInt(v)) && parseInt(v) > 0,
    description: 'Token refill rate',
  },

  // AI/LLM
  {
    name: 'DEEPSEEK_API_KEY',
    required: false,
    description: 'DeepSeek API key for document extraction',
    sensitive: true,
  },
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    description: 'Anthropic Claude API key',
    sensitive: true,
  },
  {
    name: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key (fallback)',
    sensitive: true,
  },

  // Email
  {
    name: 'SENDGRID_API_KEY',
    required: false,
    description: 'SendGrid API key for email notifications',
    sensitive: true,
  },

  // Stripe
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    validator: (v) => v.startsWith('sk_'),
    description: 'Stripe secret key',
    sensitive: true,
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: false,
    validator: (v) => v.startsWith('pk_'),
    description: 'Stripe publishable key',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: false,
    validator: (v) => v.startsWith('whsec_'),
    description: 'Stripe webhook signing secret',
    sensitive: true,
  },

  // Analytics
  {
    name: 'NEXT_PUBLIC_POSTHOG_KEY',
    required: false,
    description: 'PostHog analytics key',
  },
  {
    name: 'SENTRY_DSN',
    required: false,
    validator: (v) => v.startsWith('https://'),
    description: 'Sentry error tracking DSN',
  },

  // Webhooks
  {
    name: 'WEBHOOK_SIGNING_SECRET',
    required: false,
    validator: (v) => v.length >= 32,
    description: 'Webhook signing secret',
    sensitive: true,
  },

  // Security
  {
    name: 'SESSION_SECRET',
    required: process.env.NODE_ENV === 'production',
    validator: (v) => v.length >= 32,
    description: 'Session encryption secret',
    sensitive: true,
  },
  {
    name: 'CORS_ALLOWED_ORIGINS',
    required: false,
    description: 'Allowed CORS origins (comma-separated)',
  },
];

/**
 * Validate all environment variables
 */
export function validateEnvironment(): EnvValidationResult {
  const result: EnvValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    summary: {
      required: 0,
      optional: 0,
      missing: 0,
      present: 0,
    },
  };

  for (const envVar of ENV_VARS) {
    const value = process.env[envVar.name];
    const hasValue = value !== undefined && value !== '';

    if (envVar.required) {
      result.summary.required++;
    } else {
      result.summary.optional++;
    }

    if (hasValue) {
      result.summary.present++;

      // Run validator if present
      if (envVar.validator && !envVar.validator(value!)) {
        result.errors.push(
          `${envVar.name}: Invalid format - ${envVar.description}`
        );
        result.valid = false;
      }
    } else {
      result.summary.missing++;

      if (envVar.required) {
        result.errors.push(
          `${envVar.name}: Required but missing - ${envVar.description}`
        );
        result.valid = false;
      } else {
        result.warnings.push(
          `${envVar.name}: Optional but missing - ${envVar.description}`
        );
      }
    }
  }

  return result;
}

/**
 * Get environment variable with fallback
 */
export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value !== undefined && value !== '') {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Environment variable ${name} is not set and no fallback provided`);
}

/**
 * Get required environment variable (throws if missing)
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Print validation results to console
 */
export function printValidationResults(result: EnvValidationResult): void {
  console.log('\n========================================');
  console.log('Environment Validation Results');
  console.log('========================================\n');

  console.log(`Status: ${result.valid ? 'PASS' : 'FAIL'}`);
  console.log(`Required: ${result.summary.required}`);
  console.log(`Optional: ${result.summary.optional}`);
  console.log(`Present: ${result.summary.present}`);
  console.log(`Missing: ${result.summary.missing}`);

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(e => console.log(`  ✗ ${e}`));
  }

  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }

  console.log('\n========================================\n');
}

/**
 * Validate environment and exit if invalid (for startup checks)
 */
export function validateOrExit(): void {
  const result = validateEnvironment();

  if (!result.valid) {
    printValidationResults(result);
    console.error('Environment validation failed. Please fix the errors above.');
    process.exit(1);
  }

  if (isDevelopment()) {
    printValidationResults(result);
  }
}

// Export for use in API routes
export const envConfig = {
  // Supabase
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'IncentEdge',
  nodeEnv: process.env.NODE_ENV || 'development',

  // API Security
  apiSigningSecret: process.env.API_SIGNING_SECRET || '',
  apiKeyPrefix: process.env.API_KEY_PREFIX || 'ie_',

  // Rate Limiting
  rateLimitMaxTokens: parseInt(process.env.RATE_LIMIT_MAX_TOKENS || '100'),
  rateLimitRefillRate: parseInt(process.env.RATE_LIMIT_REFILL_RATE || '10'),
  rateLimitRefillIntervalMs: parseInt(process.env.RATE_LIMIT_REFILL_INTERVAL_MS || '1000'),

  // AI
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  aiPrimaryProvider: process.env.AI_PRIMARY_PROVIDER || 'deepseek',

  // Webhooks
  webhookSigningSecret: process.env.WEBHOOK_SIGNING_SECRET || '',
  webhookMaxRetries: parseInt(process.env.WEBHOOK_MAX_RETRIES || '5'),
  webhookTimeoutMs: parseInt(process.env.WEBHOOK_TIMEOUT_MS || '30000'),

  // Background Jobs
  jobMaxRetries: parseInt(process.env.JOB_MAX_RETRIES || '3'),
  jobRetryDelayMs: parseInt(process.env.JOB_RETRY_DELAY_MS || '5000'),

  // Development
  debugMode: process.env.DEBUG_MODE === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  // SECURITY: These flags are NEVER allowed in production
  skipApiKeyValidation:
    process.env.NODE_ENV !== 'production' &&
    process.env.SKIP_API_KEY_VALIDATION === 'true',
  skipRateLimiting:
    process.env.NODE_ENV !== 'production' &&
    process.env.SKIP_RATE_LIMITING === 'true',
  // SECURITY: No default for dev key prefix - must be explicitly set if used
  devApiKeyPrefix: process.env.DEV_API_KEY_PREFIX || '',

  // Security
  corsAllowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  sessionSecret: process.env.SESSION_SECRET || '',
};

// SECURITY: Production safety enforcement
if (process.env.NODE_ENV === 'production') {
  if (process.env.SKIP_API_KEY_VALIDATION === 'true') {
    console.error(
      '[SECURITY] CRITICAL: SKIP_API_KEY_VALIDATION cannot be true in production. Ignoring.'
    );
  }
  if (process.env.SKIP_RATE_LIMITING === 'true') {
    console.error(
      '[SECURITY] CRITICAL: SKIP_RATE_LIMITING cannot be true in production. Ignoring.'
    );
  }
  if (process.env.DEBUG_MODE === 'true') {
    console.warn(
      '[SECURITY] WARNING: DEBUG_MODE is enabled in production. This may expose sensitive information.'
    );
  }
}
