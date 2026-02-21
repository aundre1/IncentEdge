import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  DocumentType,
  DocumentStatus,
  ExtractionStatus,
  ExtractionRequest,
} from '@/types/documents';
import { DocumentProcessor } from '@/lib/document-processor';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const extractionRequestSchema = z.object({
  force_reextract: z.boolean().optional().default(false),
  extraction_options: z.object({
    extract_tables: z.boolean().optional().default(true),
    extract_images: z.boolean().optional().default(true),
    use_ocr: z.boolean().optional().default(true),
    target_fields: z.array(z.string()).optional(),
  }).optional(),
});

// ============================================================================
// POST - Trigger AI extraction on a document
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
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

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validationResult = extractionRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const options = validationResult.data;

    // Get document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if extraction is already complete and force is not set
    if (
      document.extraction_status === ExtractionStatus.COMPLETED &&
      !options.force_reextract
    ) {
      return NextResponse.json({
        data: {
          document_id: id,
          status: ExtractionStatus.COMPLETED,
          message: 'Extraction already completed. Use force_reextract=true to re-extract.',
          extracted_data: document.extracted_data,
          extraction_confidence: document.extraction_confidence,
        },
      });
    }

    // Check if extraction is already in progress
    if (document.extraction_status === ExtractionStatus.IN_PROGRESS) {
      return NextResponse.json({
        data: {
          document_id: id,
          status: ExtractionStatus.IN_PROGRESS,
          message: 'Extraction is already in progress',
          extraction_started_at: document.extraction_started_at,
        },
      });
    }

    // Check document status - must be uploaded
    if (document.document_status === DocumentStatus.PENDING_UPLOAD ||
        document.document_status === DocumentStatus.UPLOADING) {
      return NextResponse.json(
        { error: 'Document must be fully uploaded before extraction' },
        { status: 400 }
      );
    }

    // Mark extraction as in progress
    const extractionStartedAt = new Date().toISOString();
    await supabase
      .from('documents')
      .update({
        extraction_status: ExtractionStatus.IN_PROGRESS,
        extraction_started_at: extractionStartedAt,
        extraction_error: null,
        updated_at: extractionStartedAt,
      })
      .eq('id', id);

    try {
      // Download file content from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(document.storage_bucket)
        .download(document.storage_path);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download document: ${downloadError?.message || 'Unknown error'}`);
      }

      // Convert blob to text for extraction
      // Note: For PDFs and images, we would need to use OCR or PDF parsing
      // For now, we'll extract text from text-based files and handle others specially
      let documentContent: string;

      if (document.file_type.includes('text') ||
          document.file_type.includes('json') ||
          document.file_type.includes('csv')) {
        documentContent = await fileData.text();
      } else if (document.file_type.includes('pdf')) {
        // For PDFs, we would typically use a PDF parsing library
        // For now, we'll pass the raw content and let the AI handle it
        // In production, you'd want to use pdf-parse or similar
        documentContent = `[PDF Document: ${document.original_file_name}]\n` +
          'PDF content extraction placeholder - integrate with pdf-parse or similar library';
      } else if (document.file_type.includes('spreadsheet') ||
                 document.file_type.includes('excel') ||
                 document.file_extension === 'xlsx' ||
                 document.file_extension === 'xls') {
        // For spreadsheets, use xlsx library
        documentContent = `[Spreadsheet Document: ${document.original_file_name}]\n` +
          'Spreadsheet content extraction placeholder - integrate with xlsx library';
      } else {
        documentContent = `[Document: ${document.original_file_name}]\n` +
          'Binary content - OCR may be required for extraction';
      }

      // Initialize document processor with options
      const processor = new DocumentProcessor({
        extract_tables: options.extraction_options?.extract_tables ?? true,
        extract_images: options.extraction_options?.extract_images ?? true,
        use_ocr: options.extraction_options?.use_ocr ?? true,
      });

      // Perform extraction
      const result = await processor.extractData(
        documentContent,
        document.document_type as DocumentType,
        { id: document.id }
      );

      const extractionCompletedAt = new Date().toISOString();

      // Update document with extraction results
      await supabase
        .from('documents')
        .update({
          document_status: DocumentStatus.EXTRACTED,
          extraction_status: result.status,
          extraction_completed_at: extractionCompletedAt,
          extracted_data: result.extracted_data,
          extraction_confidence: result.confidence,
          extraction_error: result.errors.length > 0
            ? JSON.stringify(result.errors)
            : null,
          updated_at: extractionCompletedAt,
        })
        .eq('id', id);

      // Log activity
      await supabase.rpc('log_activity', {
        p_organization_id: profile.organization_id,
        p_user_id: user.id,
        p_action_type: 'extract',
        p_entity_type: 'document',
        p_entity_id: id,
        p_entity_name: document.original_file_name,
      });

      return NextResponse.json({
        data: {
          document_id: id,
          status: result.status,
          extracted_data: result.extracted_data,
          confidence: result.confidence,
          processing_time_ms: result.processing_time_ms,
          errors: result.errors,
          warnings: result.warnings,
          field_mapping_suggestions: result.field_mapping_suggestions,
        },
      });
    } catch (extractionError) {
      // Update document with error status
      const errorMessage = extractionError instanceof Error
        ? extractionError.message
        : 'Unknown extraction error';

      await supabase
        .from('documents')
        .update({
          extraction_status: ExtractionStatus.FAILED,
          extraction_error: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      return NextResponse.json(
        {
          error: 'Extraction failed',
          details: errorMessage,
          document_id: id,
          status: ExtractionStatus.FAILED,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/documents/[id]/extract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// GET - Get extraction status and results
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
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

    // Get document extraction status
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        id,
        document_type,
        document_status,
        extraction_status,
        extraction_started_at,
        extraction_completed_at,
        extraction_error,
        extracted_data,
        extraction_confidence
      `)
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (error || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Calculate progress for in-progress extractions
    let progress = 0;
    if (document.extraction_status === ExtractionStatus.COMPLETED) {
      progress = 100;
    } else if (document.extraction_status === ExtractionStatus.IN_PROGRESS) {
      // Estimate progress based on time (assume average extraction takes 30 seconds)
      if (document.extraction_started_at) {
        const elapsed = Date.now() - new Date(document.extraction_started_at).getTime();
        progress = Math.min(95, Math.floor((elapsed / 30000) * 100));
      }
    }

    return NextResponse.json({
      data: {
        document_id: id,
        document_type: document.document_type,
        status: document.extraction_status,
        progress_pct: progress,
        extraction_started_at: document.extraction_started_at,
        extraction_completed_at: document.extraction_completed_at,
        extracted_data: document.extracted_data,
        confidence: document.extraction_confidence,
        error: document.extraction_error,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/documents/[id]/extract:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
