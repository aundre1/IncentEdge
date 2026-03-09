import { createServerClient } from '@supabase/ssr';
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
    // ─── CRITICAL: Build the redirect response FIRST, then bind the Supabase
    // client to write Set-Cookie headers directly onto that response object.
    //
    // Using getAll/setAll (not deprecated get/set/remove):
    //   getAll reads ALL request cookies so the PKCE verifier is always found
    //   regardless of how many chunks the ssr library split it into.
    //   setAll writes session cookies directly onto redirectResponse so they
    //   reach the browser in a single round-trip.
    // ─────────────────────────────────────────────────────────────────────────
    const redirectResponse = NextResponse.redirect(`${origin}${redirect}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Return every cookie on the incoming request — gives @supabase/ssr
            // the full picture so it can find the PKCE code-verifier cookie.
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // Write session cookies (and any other cookies ssr wants to set)
            // directly onto the redirect response the browser will receive.
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set({ name, value, ...options });
            });
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

      return redirectResponse;
    }

    // Exchange failed — log the raw error so it shows up in Vercel runtime logs
    console.error('[Auth Callback] exchangeCodeForSession failed:', exchangeError.message);
    const errorUrl = new URL('/auth-error', origin);
    errorUrl.searchParams.set('error', 'session_exchange_failed');
    errorUrl.searchParams.set('message', 'Authentication failed. Please try again.');
    return NextResponse.redirect(errorUrl);
  }

  // No code or error — invalid callback
  console.error('[Auth Callback] No code in callback URL');
  const errorUrl = new URL('/auth-error', origin);
  errorUrl.searchParams.set('error', 'invalid_callback');
  errorUrl.searchParams.set('message', 'Authentication failed. Please try again.');
  return NextResponse.redirect(errorUrl);
}
