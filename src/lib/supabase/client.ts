import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // isSingleton ensures the same client instance is reused across renders,
      // which is critical for PKCE to work: the verifier stored in cookies when
      // signInWithOAuth() is called must be accessible when the OAuth provider
      // redirects back to the callback route. Without this, first-time OAuth
      // sign-ins fail with "PKCE code_verifier not found in storage".
      isSingleton: true,
    }
  );
}
