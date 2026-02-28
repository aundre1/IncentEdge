import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const redirect = searchParams.get('redirect') || '/dashboard';

  // Handle OAuth error response
  if (error) {
    const errorUrl = new URL('/auth-error', origin);
    errorUrl.searchParams.set('error', error);
    if (errorDescription) {
      errorUrl.searchParams.set('message', errorDescription);
    }
    return NextResponse.redirect(errorUrl);
  }

  // Exchange code for session
  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && sessionData?.session?.user) {
      // Sync name from OAuth provider metadata if profile has no name yet.
      // Google sends 'name', LinkedIn sends 'full_name' — check both.
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

      return NextResponse.redirect(`${origin}${redirect}`);
    }

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${redirect}`);
    }

    // Handle exchange error
    const errorUrl = new URL('/auth-error', origin);
    errorUrl.searchParams.set('error', 'session_exchange_failed');
    errorUrl.searchParams.set('message', exchangeError.message);
    return NextResponse.redirect(errorUrl);
  }

  // No code or error - invalid callback
  const errorUrl = new URL('/auth-error', origin);
  errorUrl.searchParams.set('error', 'invalid_callback');
  errorUrl.searchParams.set('message', 'Invalid authentication callback - no code provided');
  return NextResponse.redirect(errorUrl);
}
