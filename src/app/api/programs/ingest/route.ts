/**
 * POST /api/programs/ingest
 *
 * Ingest incentive program documents (PDF or URL) and extract structured program data.
 * Accepts file upload or source_url in JSON body.
 * Returns job ID for polling status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import * as pdfreader from 'pdf-parse';

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

interface IngestRequest {
  source_url?: string;
  issuer?: string;
  region?: string;
}

// ============================================================================
// POST - Ingest incentive program document
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

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    const organizationId = profile.organization_id;
    let contentType = request.headers.get('content-type') || '';
    let jobPayload: Record<string, unknown> = {};
    let documentId: string | undefined;
    let filename = '';

    // ===== HANDLE FILE UPLOAD =====
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Validate file type
      if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
      }

      filename = file.name;

      // Upload to Supabase Storage
      const fileBuffer = await file.arrayBuffer();
      const filePath = `incentive-programs/${organizationId}/${uuidv4()}.pdf`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, fileBuffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
      }

      // Create document record
      const newDocId = uuidv4();
      const { error: docError } = await supabase.from('documents').insert({
        id: newDocId,
        organization_id: organizationId,
        file_name: filename,
        original_file_name: filename,
        file_type: 'application/pdf',
        file_size: fileBuffer.byteLength,
        file_extension: '.pdf',
        storage_path: filePath,
        storage_bucket: 'documents',
        document_type: 'incentive_program_source',
        document_status: 'processing',
        extraction_status: 'pending',
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
      });

      if (docError) {
        console.error('Document record error:', docError);
        return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
      }

      documentId = newDocId;
      jobPayload = {
        document_id: newDocId,
        extraction_method: 'pdf_parse',
        document_name: filename,
        document_size_bytes: fileBuffer.byteLength,
      };
    }
    // ===== HANDLE URL INPUT =====
    else if (contentType.includes('application/json')) {
      const body = (await request.json()) as IngestRequest;

      if (!body.source_url) {
        return NextResponse.json({ error: 'source_url is required for JSON requests' }, { status: 400 });
      }

      // Validate URL format
      try {
        new URL(body.source_url);
      } catch {
        return NextResponse.json({ error: 'Invalid source_url format' }, { status: 400 });
      }

      filename = new URL(body.source_url).hostname || 'url_source';
      jobPayload = {
        source_url: body.source_url,
        extraction_method: 'url_fetch',
        issuer: body.issuer,
        region: body.region,
      };
    } else {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data or application/json' },
        { status: 400 }
      );
    }

    // ===== CREATE BACKGROUND JOB =====
    const jobId = uuidv4();
    const { error: jobError } = await supabase.from('background_jobs').insert({
      id: jobId,
      organization_id: organizationId,
      type: 'document_extraction',
      resource_type: 'incentive_program',
      resource_id: documentId,
      name: `Extract incentive programs from: ${filename}`,
      status: 'pending',
      priority: 'normal',
      input: jobPayload,
      metadata: {
        document_name: filename,
        extraction_method: jobPayload.extraction_method,
      },
      created_by: user.id,
    });

    if (jobError) {
      console.error('Job creation error:', jobError);
      return NextResponse.json({ error: 'Failed to create extraction job' }, { status: 500 });
    }

    // ===== TRIGGER ASYNC PROCESSING =====
    // In production, this would trigger a background worker.
    // For now, we enqueue it to be processed by the cron job processor.
    await supabase.from('background_jobs').update({ status: 'queued' }).eq('id', jobId);

    // Return 202 Accepted with job ID
    return NextResponse.json(
      {
        job_id: jobId,
        status: 'processing',
        message: 'Document queued for extraction. Poll the status endpoint for results.',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error in POST /api/programs/ingest:', error);
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
