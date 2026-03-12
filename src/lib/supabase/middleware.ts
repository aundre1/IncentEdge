import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Skip session refresh for auth callback — let the callback handler exchange the code
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  // IMPORTANT: Use getAll/setAll (not deprecated get/set/remove) so that
  // chunked PKCE code-verifier cookies are read and written atomically.
  // The old per-cookie API caused pkce_code_verifier_not_found errors on
  // Google and LinkedIn OAuth callbacks.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies so subsequent reads in this request see the new values
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // Rebuild the response with the updated request and attach all cookies at once
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ['/dashboard', '/projects', '/programs', '/applications', '/reports', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Auth routes - redirect to dashboard if already authenticated
  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}
