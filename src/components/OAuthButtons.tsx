'use client';

import * as React from 'react';
import { Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signInWithOAuth, getOAuthCallbackUrl, type OAuthProvider } from '@/lib/auth-providers';

// Google "G" logo SVG
const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// LinkedIn logo SVG
const LinkedInIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Returns true if the error message indicates the OAuth provider has not been
 * configured / enabled in Supabase yet. This is distinct from a user-caused
 * error and should show a "Coming Soon" UI instead of a generic error message.
 */
function isProviderNotEnabled(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('provider') ||
    lower.includes('not enabled') ||
    lower.includes('unsupported_provider') ||
    lower.includes('validation_failed') ||
    lower.includes('oauth provider') ||
    lower.includes('not supported')
  );
}

// ============================================================================
// LINKEDIN COMING SOON TOOLTIP
// ============================================================================

function LinkedInComingSoonBadge({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-950/30 px-3 py-2 text-sm">
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
      <div className="flex-1">
        <p className="font-medium text-blue-800 dark:text-blue-200">LinkedIn sign-in coming soon</p>
        <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-400">
          Use Google or email to sign in for now. LinkedIn OIDC requires additional setup.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="ml-1 flex-shrink-0 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-xs leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

// ============================================================================
// OAUTH BUTTON
// ============================================================================

export interface OAuthButtonProps {
  provider: OAuthProvider;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  redirectTo?: string;
  variant?: 'signin' | 'signup';
  className?: string;
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: GoogleIcon,
  },
  linkedin_oidc: {
    name: 'LinkedIn',
    icon: LinkedInIcon,
  },
};

export function OAuthButton({
  provider,
  loading = false,
  disabled = false,
  onClick,
  redirectTo,
  variant = 'signin',
  className,
}: OAuthButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // When LinkedIn returns a "provider not enabled" error, switch to "Coming Soon" mode
  const [linkedInSetupRequired, setLinkedInSetupRequired] = React.useState(false);
  const [showSetupBanner, setShowSetupBanner] = React.useState(false);

  const config = providerConfig[provider];
  const Icon = config.icon;
  const actionText = variant === 'signin' ? 'Continue with' : 'Sign up with';
  const isButtonLoading = loading || isLoading;

  const isLinkedIn = provider === 'linkedin_oidc';
  const showAsComingSoon = isLinkedIn && linkedInSetupRequired;

  const handleClick = async () => {
    // If already determined to be a "Coming Soon" provider, show the banner instead
    if (showAsComingSoon) {
      setShowSetupBanner(true);
      return;
    }

    if (onClick) {
      onClick();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const callbackUrl = getOAuthCallbackUrl(redirectTo);
      const result = await signInWithOAuth(provider, { redirectTo: callbackUrl });

      if (result.error) {
        const msg = result.error.message || '';

        // LinkedIn-specific: provider not configured in Supabase
        if (isLinkedIn && isProviderNotEnabled(msg)) {
          setLinkedInSetupRequired(true);
          setShowSetupBanner(true);
        } else {
          setError(msg);
        }
        setIsLoading(false);
      }
      // On success the browser will redirect — no need to setIsLoading(false)
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className={`w-full ${showAsComingSoon ? 'opacity-70' : ''} ${className || ''}`}
          onClick={handleClick}
          disabled={disabled || isButtonLoading}
          aria-label={showAsComingSoon ? `${config.name} — Coming Soon` : `${actionText} ${config.name}`}
        >
          {isButtonLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span className="mr-2">
              <Icon />
            </span>
          )}
          {showAsComingSoon ? (
            <span className="flex items-center gap-2">
              {actionText} {config.name}
              <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Soon
              </span>
            </span>
          ) : (
            `${actionText} ${config.name}`
          )}
        </Button>
      </div>

      {/* Generic error (non-provider-setup errors) */}
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}

      {/* LinkedIn setup-required banner */}
      {isLinkedIn && showSetupBanner && (
        <LinkedInComingSoonBadge onDismiss={() => setShowSetupBanner(false)} />
      )}
    </div>
  );
}

// ============================================================================
// OAUTH BUTTONS GROUP
// ============================================================================

export interface OAuthButtonsProps {
  loading?: boolean;
  disabled?: boolean;
  redirectTo?: string;
  variant?: 'signin' | 'signup';
  className?: string;
  onError?: (error: string) => void;
}

export function OAuthButtons({
  loading = false,
  disabled = false,
  redirectTo,
  variant = 'signin',
  className,
}: OAuthButtonsProps) {
  return (
    <div className={`grid gap-2 ${className || ''}`}>
      <OAuthButton
        provider="google"
        loading={loading}
        disabled={disabled}
        redirectTo={redirectTo}
        variant={variant}
      />
      <OAuthButton
        provider="linkedin_oidc"
        loading={loading}
        disabled={disabled}
        redirectTo={redirectTo}
        variant={variant}
      />
    </div>
  );
}

export default OAuthButtons;
