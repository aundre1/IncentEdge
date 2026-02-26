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
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
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
