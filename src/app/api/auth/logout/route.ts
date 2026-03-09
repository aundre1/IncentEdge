import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const LOGIN_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/login`
  : 'http://localhost:3000/login';

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('POST /api/auth/logout: signOut failed.', {
        message: error.message,
        status: error.status,
      });
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('POST /api/auth/logout: Unhandled exception during sign-out.', {
      message: err.message,
      stack: err.stack,
    });
  }

  return NextResponse.redirect(new URL(LOGIN_URL), { status: 302 });
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('GET /api/auth/logout: signOut failed.', {
        message: error.message,
        status: error.status,
      });
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('GET /api/auth/logout: Unhandled exception during sign-out.', {
      message: err.message,
      stack: err.stack,
    });
  }

  return NextResponse.redirect(new URL(LOGIN_URL), { status: 302 });
}
