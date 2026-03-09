import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // @supabase/ssr automatically uses a singleton in browser context
  // (when isSingleton is omitted it defaults to true when isBrowser() is true).
  // Explicitly setting isSingleton:true caused issues when createClient() was
  // called during SSR — the module-cached client was created with no browser
  // context, breaking document.cookie access for subsequent browser calls.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
