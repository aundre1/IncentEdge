/**
 * POST /api/programs/ingest/process
 *
 * Manual trigger for incentive extraction processing.
 * Used for testing - triggers immediate processing of a pending job.
 * In production, this would be called by a background worker/cron service.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

interface ProcessRequest {
  job_id: string;
}

// ============================================================================
// POST - Manually trigger extraction processing
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const body = (await request.json()) as ProcessRequest;
    if (!body.job_id) {
      return NextResponse.json(
        { error: 'job_id is required' },
        { status: 400 }
      );
    }

    const jobId = body.job_id;

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

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check job type
    if (job.job_type !== 'document_extraction') {
      return NextResponse.json(
        { error: `Job type "${job.job_type}" is not an extraction job` },
        { status: 400 }
      );
    }

    // Process the job
    try {
      // Import worker
      const { processIncentiveExtraction } = await import('@/lib/incentive-extraction-worker');

      // Check if payload indicates this is an incentive program extraction
      const payload = job.payload as Record<string, unknown>;
      const resourceType = payload?.resource_type as string;

      if (resourceType !== 'incentive_program') {
        return NextResponse.json(
          {
            error: `Job is not an incentive program extraction (resource_type: ${resourceType})`,
          },
          { status: 400 }
        );
      }

      // Execute extraction
      const result = await processIncentiveExtraction(jobId, profile.organization_id);

      if (!result.success) {
        return NextResponse.json(
          {
            job_id: jobId,
            status: 'failed',
            error: result.error,
          },
          { status: 500 }
        );
      }

      // Return success
      return NextResponse.json(
        {
          job_id: jobId,
          status: 'success',
          programs_extracted: result.programs_extracted,
          programs_needing_review: result.programs_needing_review,
          message: 'Extraction completed successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        {
          job_id: jobId,
          status: 'failed',
          error: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/programs/ingest/process:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS - CORS preflight
// ============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
