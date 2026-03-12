import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  // IMPORTANT: Use getAll/setAll (not deprecated get/set/remove) so that
  // chunked session JWTs are read and written atomically.
  // Supabase session tokens can exceed 4 KB and are split across multiple
  // cookies (e.g. sb-xxx-auth-token.0, .1, …).  The old per-cookie API
  // only read/wrote the first chunk, causing getUser() to return null even
  // for authenticated users and triggering redirect-to-login loops after
  // a successful Google or LinkedIn OAuth callback.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
