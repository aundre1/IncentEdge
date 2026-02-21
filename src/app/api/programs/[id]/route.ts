import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid program ID format' },
        { status: 400 }
      );
    }

    const { data: program, error } = await supabase
      .from('incentive_programs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Program not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching program:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Increment popularity score (fire and forget)
    supabase
      .from('incentive_programs')
      .update({ popularity_score: (program.popularity_score || 0) + 1 })
      .eq('id', id)
      .then(() => {});

    return NextResponse.json({ data: program });
  } catch (error) {
    console.error('Error in GET /api/programs/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
