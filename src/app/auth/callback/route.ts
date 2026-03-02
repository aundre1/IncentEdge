import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const redirect = searchParams.get('redirect') || '/dashboard';

  // Handle OAuth error response from provider
  if (error) {
    const errorUrl = new URL('/auth-error', origin);
    errorUrl.searchParams.set('error', error);
    if (errorDescription) {
      errorUrl.searchParams.set('message', errorDescription);
    }
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    // ─── CRITICAL: Build the redirect response FIRST ───────────────────────
    // Then create a Supabase client whose cookie callbacks write directly
    // onto that response object. This guarantees the Set-Cookie headers are
    // present in the response the browser receives, so the session is
    // persisted before the dashboard route is visited.
    //
    // The previous pattern (createClient via next/headers cookies()) set
    // cookies on an implicit response, then returned a SEPARATE
    // NextResponse.redirect() — those two objects are independent, so the
    // Set-Cookie headers were lost and the browser never got the session
    // cookies, causing the first-attempt login failure.
    // ─────────────────────────────────────────────────────────────────────────

    const redirectResponse = NextResponse.redirect(`${origin}${redirect}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Write directly onto the redirect response
            redirectResponse.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            redirectResponse.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Sync name from OAuth provider metadata (Google → 'name', LinkedIn → 'full_name')
      if (sessionData?.session?.user) {
        const user = sessionData.session.user;
        const metaName: string | null =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          null;

        if (metaName) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (!profile?.full_name || profile.full_name.trim() === '') {
            await supabase
              .from('profiles')
              .update({ full_name: metaName })
              .eq('id', user.id);
          }
        }
      }

      // Session cookies are set on redirectResponse — browser will receive them
      return redirectResponse;
    }

    // Exchange failed
    const errorUrl = new URL('/auth-error', origin);
    errorUrl.searchParams.set('error', 'session_exchange_failed');
    errorUrl.searchParams.set('message', exchangeError.message);
    return NextResponse.redirect(errorUrl);
  }

  // No code or error — invalid callback
  const errorUrl = new URL('/auth-error', origin);
  errorUrl.searchParams.set('error', 'invalid_callback');
  errorUrl.searchParams.set('message', 'Invalid authentication callback - no code provided');
  return NextResponse.redirect(errorUrl);
}
