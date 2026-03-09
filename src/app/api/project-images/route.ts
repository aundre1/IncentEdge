import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('project_images')
      .select('project_key, image_url')
      .eq('user_id', user.id);

    if (error) {
      console.error('GET /api/project-images: Failed to fetch project images.', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: user.id,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('GET /api/project-images: Unhandled exception.', {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json({ error: 'Failed to fetch project images.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { project_key, image_url } = body as { project_key?: string; image_url?: string };
    if (!project_key || !image_url) {
      return NextResponse.json(
        { error: 'Missing project_key or image_url' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('project_images')
      .upsert({
        user_id: user.id,
        project_key,
        image_url,
      })
      .select();

    if (error) {
      console.error('POST /api/project-images: Failed to upsert project image.', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: user.id,
        projectKey: project_key,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('POST /api/project-images: Unhandled exception.', {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json({ error: 'Failed to save project image.' }, { status: 500 });
  }
}
