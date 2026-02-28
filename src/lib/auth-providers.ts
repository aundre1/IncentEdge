// LinkedIn OIDC Setup:
// 1. Go to https://developer.linkedin.com/apps → Create App
// 2. Add product: "Sign In with LinkedIn using OpenID Connect"
// 3. Get Client ID and Client Secret
// 4. Go to Supabase: Authentication → Providers → LinkedIn (OIDC) → Enable
// 5. Paste Client ID and Client Secret
// 6. Add Callback URL to LinkedIn: https://pzmunszcxmmncppbufoj.supabase.co/auth/v1/callback

import { createClient } from '@/lib/supabase/client';

export type OAuthProvider = 'google' | 'linkedin_oidc';

export interface OAuthSignInOptions {
  redirectTo?: string;
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(options?: OAuthSignInOptions) {
  const supabase = createClient();
  const redirectTo = options?.redirectTo || `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      // NOTE: Do NOT set access_type:'offline' or prompt:'consent' here.
      // Supabase PKCE flow manages refresh tokens internally.
      // Those params cause a stale-code-verifier error on first login.
    },
  });

  if (error) {
    console.error('Google OAuth error:', error.message);
    return { error };
  }

  return { error: null };
}

/**
 * Sign in with LinkedIn OAuth (OIDC)
 */
export async function signInWithLinkedIn(options?: OAuthSignInOptions) {
  const supabase = createClient();
  const redirectTo = options?.redirectTo || `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error('LinkedIn OAuth error:', error.message);
    return { error };
  }

  return { error: null };
}

/**
 * Generic OAuth sign in function
 */
export async function signInWithOAuth(provider: OAuthProvider, options?: OAuthSignInOptions) {
  switch (provider) {
    case 'google':
      return signInWithGoogle(options);
    case 'linkedin_oidc':
      return signInWithLinkedIn(options);
    default:
      return { error: { message: `Unsupported provider: ${provider}` } };
  }
}

/**
 * Get the OAuth callback URL with optional redirect parameter
 */
export function getOAuthCallbackUrl(redirect?: string): string {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const callbackUrl = new URL('/auth/callback', baseUrl);

  if (redirect) {
    callbackUrl.searchParams.set('redirect', redirect);
  }

  return callbackUrl.toString();
}
