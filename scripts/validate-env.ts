#!/usr/bin/env npx ts-node
/**
 * IncentEdge Environment Validation Script
 *
 * Run: npx ts-node scripts/validate-env.ts
 *
 * Validates that all required environment variables are properly configured.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  variables: {
    name: string;
    status: 'present' | 'missing' | 'invalid';
    required: boolean;
    value?: string;
  }[];
}

interface EnvVarDef {
  name: string;
  required: boolean;
  validator?: (v: string) => boolean;
  description: string;
  sensitive?: boolean;
}

const ENV_DEFINITIONS: EnvVarDef[] = [
  // Critical - Required for app to function
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    validator: (v) => v.startsWith('http'),
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    validator: (v) => v.length > 50,
    description: 'Supabase anonymous key',
    sensitive: true,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: process.env.NODE_ENV === 'production',
    validator: (v) => v.length > 50,
    description: 'Supabase service role key',
    sensitive: true,
  },
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: true,
    validator: (v) => v.startsWith('http'),
    description: 'Application URL',
  },

  // Security - Required for production
  {
    name: 'API_SIGNING_SECRET',
    required: process.env.NODE_ENV === 'production',
    validator: (v) => v.length >= 32,
    description: 'API request signing secret',
    sensitive: true,
  },
  {
    name: 'SESSION_SECRET',
    required: process.env.NODE_ENV === 'production',
    validator: (v) => v.length >= 32,
    description: 'Session encryption secret',
    sensitive: true,
  },
  {
    name: 'WEBHOOK_SIGNING_SECRET',
    required: false,
    validator: (v) => v.length >= 32,
    description: 'Webhook signing secret',
    sensitive: true,
  },

  // AI Configuration - Optional but recommended
  {
    name: 'DEEPSEEK_API_KEY',
    required: false,
    description: 'DeepSeek API key for AI features',
    sensitive: true,
  },
  {
    name: 'ANTHROPIC_API_KEY',
    required: false,
    description: 'Anthropic API key for AI features',
    sensitive: true,
  },

  // Email - Optional
  {
    name: 'SENDGRID_API_KEY',
    required: false,
    validator: (v) => v.startsWith('SG.'),
    description: 'SendGrid API key',
    sensitive: true,
  },

  // Payments - Optional
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

  // Rate Limiting
  {
    name: 'RATE_LIMIT_MAX_TOKENS',
    required: false,
    validator: (v) => !isNaN(parseInt(v)),
    description: 'Rate limit max tokens',
  },

  // Development
  {
    name: 'NODE_ENV',
    required: true,
    validator: (v) => ['development', 'production', 'test'].includes(v),
    description: 'Node environment',
  },
  {
    name: 'DEBUG_MODE',
    required: false,
    validator: (v) => ['true', 'false'].includes(v),
    description: 'Enable debug mode',
  },
];

function validateEnvironment(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    variables: [],
  };

  for (const def of ENV_DEFINITIONS) {
    const value = process.env[def.name];
    const hasValue = value !== undefined && value !== '';

    let status: 'present' | 'missing' | 'invalid' = 'present';

    if (!hasValue) {
      status = 'missing';
      if (def.required) {
        result.errors.push(`MISSING: ${def.name} - ${def.description}`);
        result.valid = false;
      } else {
        result.warnings.push(`Optional missing: ${def.name} - ${def.description}`);
      }
    } else if (def.validator && !def.validator(value!)) {
      status = 'invalid';
      result.errors.push(`INVALID: ${def.name} - ${def.description}`);
      result.valid = false;
    }

    result.variables.push({
      name: def.name,
      status,
      required: def.required,
      value: def.sensitive ? (hasValue ? '***' : undefined) : (hasValue ? value!.substring(0, 30) + (value!.length > 30 ? '...' : '') : undefined),
    });
  }

  return result;
}

function main() {
  console.log('\n========================================');
  console.log('IncentEdge Environment Validation');
  console.log('========================================\n');

  const result = validateEnvironment();

  // Group by status
  const required = result.variables.filter(v => v.required);
  const optional = result.variables.filter(v => !v.required);

  console.log('Required Variables:');
  console.log('-------------------');
  for (const v of required) {
    const icon = v.status === 'present' ? '✓' : (v.status === 'invalid' ? '✗' : '○');
    const valueDisplay = v.value ? ` = ${v.value}` : '';
    console.log(`  ${icon} ${v.name}${valueDisplay}`);
  }

  console.log('\nOptional Variables:');
  console.log('-------------------');
  for (const v of optional) {
    const icon = v.status === 'present' ? '✓' : (v.status === 'invalid' ? '✗' : '○');
    const valueDisplay = v.value ? ` = ${v.value}` : '';
    console.log(`  ${icon} ${v.name}${valueDisplay}`);
  }

  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(e => console.log(`  ✗ ${e}`));
  }

  if (result.warnings.length > 0 && process.env.DEBUG_MODE === 'true') {
    console.log('\nWarnings:');
    result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }

  console.log('\n========================================');
  console.log('Summary');
  console.log('========================================');
  console.log(`Required: ${required.filter(v => v.status === 'present').length}/${required.length}`);
  console.log(`Optional: ${optional.filter(v => v.status === 'present').length}/${optional.length}`);
  console.log(`Status: ${result.valid ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log('========================================\n');

  if (!result.valid) {
    console.error('Environment validation failed. Fix the errors above before proceeding.');
    process.exit(1);
  }

  console.log('Environment is properly configured for development.\n');
}

main();
