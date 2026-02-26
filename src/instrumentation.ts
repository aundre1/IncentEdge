/**
 * Next.js Instrumentation Hook
 *
 * This file runs ONCE on server startup (not on every request).
 * Use it for startup validation, telemetry initialization, etc.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

export async function register() {
  // Only run on the Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnvironment } = await import('./lib/env-validation');

    const result = validateEnvironment();

    if (!result.valid) {
      const criticalErrors = result.errors.join('\n  - ');
      console.error(
        `[IncentEdge] STARTUP: Missing or invalid required environment variables:\n  - ${criticalErrors}\n\nFix these before deploying to production.`
      );

      // Throw in production to prevent startup with missing config
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          `Missing required environment variables. Server cannot start safely.\n${criticalErrors}`
        );
      }
    }

    if (result.warnings.length > 0 && process.env.NODE_ENV !== 'test') {
      console.warn(
        `[IncentEdge] STARTUP: Optional env vars not set (${result.warnings.length}). ` +
        'Some features may be disabled. Run `npm run validate:env` for details.'
      );
    }

    if (result.valid) {
      console.info(
        `[IncentEdge] STARTUP: Environment validated ✓ ` +
        `(${result.summary.present}/${result.summary.required + result.summary.optional} vars set)`
      );
    }
  }
}
