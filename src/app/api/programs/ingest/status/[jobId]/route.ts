/**
 * GET /api/programs/ingest/status/[jobId]
 *
 * Poll for extraction status and results.
 * Returns job status, extracted programs, and any programs needing review.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// GET - Poll extraction job status
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const supabase = await createClient();

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Fetch job
    const { data: job, error: jobError } = await supabase
      .from('background_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('organization_id', profile.organization_id)
      .single();

    if (jobError) {
      if (jobError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      console.error('Error fetching job:', jobError);
      return NextResponse.json({ error: jobError.message }, { status: 500 });
    }

    // Job not yet started
    if (job.status === 'pending' || job.status === 'queued') {
      return NextResponse.json({
        job_id: jobId,
        status: 'processing',
        programs_extracted: 0,
        programs_needing_review: 0,
        message: 'Extraction job is queued. Please check back later.',
      });
    }

    // Job failed
    if (job.status === 'failed') {
      return NextResponse.json({
        job_id: jobId,
        status: 'failed',
        programs_extracted: 0,
        programs_needing_review: 0,
        error: job.error || 'Extraction failed',
      });
    }

    // Job completed - fetch extraction results
    if (job.status === 'completed' || job.status === 'needs_review') {
      const output = job.output as Record<string, unknown> || {};
      const programs = (output.programs as unknown[]) || [];

      // Count programs needing review
      let programsNeedingReview = 0;
      for (const program of programs) {
        const p = program as Record<string, unknown>;
        if (p.confidence_score && typeof p.confidence_score === 'number' && p.confidence_score < 0.8) {
          programsNeedingReview++;
        }
      }

      // Return results
      return NextResponse.json({
        job_id: jobId,
        status: job.status === 'needs_review' ? 'needs_review' : 'completed',
        programs_extracted: programs.length,
        programs_needing_review: programsNeedingReview,
        results: programs,
        completed_at: job.completed_at,
      });
    }

    // Job still processing
    return NextResponse.json({
      job_id: jobId,
      status: 'processing',
      programs_extracted: 0,
      programs_needing_review: 0,
      message: 'Extraction in progress...',
    });
  } catch (error) {
    console.error('Error in GET /api/programs/ingest/status/[jobId]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
