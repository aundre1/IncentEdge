import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  DocumentType,
  DocumentStatus,
  ExtractionStatus,
  DocumentUploadRequest,
  SignedUploadResponse,
} from '@/types/documents';
import {
  inferDocumentType,
  validateFile,
  getSupportedFileExtensions,
  getMaxFileSize,
} from '@/lib/document-processor';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const uploadRequestSchema = z.object({
  project_id: z.string().uuid().optional(),
  application_id: z.string().uuid().optional(),
  document_type: z.nativeEnum(DocumentType).optional(),
  file_name: z.string().min(1, 'File name is required'),
  file_type: z.string().min(1, 'File type/MIME type is required'),
  file_size: z.number().positive('File size must be positive'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const confirmUploadSchema = z.object({
  document_id: z.string().uuid(),
  success: z.boolean(),
  error: z.string().optional(),
});

// ============================================================================
// POST - Request a signed URL for file upload
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = uploadRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const uploadRequest = validationResult.data;

    // Validate that at least project_id or application_id is provided
    if (!uploadRequest.project_id && !uploadRequest.application_id) {
      return NextResponse.json(
        { error: 'Either project_id or application_id must be provided' },
        { status: 400 }
      );
    }

    // Validate file
    const fileValidation = validateFile(
      uploadRequest.file_name,
      uploadRequest.file_size,
      uploadRequest.file_type
    );

    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    // If project_id provided, verify user has access
    if (uploadRequest.project_id) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, organization_id')
        .eq('id', uploadRequest.project_id)
        .eq('organization_id', profile.organization_id)
        .single();

      if (projectError || !project) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
      }
    }

    // If application_id provided, verify user has access and get project_id
    let derivedProjectId = uploadRequest.project_id;
    if (uploadRequest.application_id) {
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('id, project_id, project:projects(organization_id)')
        .eq('id', uploadRequest.application_id)
        .single();

      if (appError || !application) {
        return NextResponse.json({ error: 'Application not found or access denied' }, { status: 404 });
      }

      derivedProjectId = application.project_id;
    }

    // Infer document type if not provided
    const documentType = uploadRequest.document_type || inferDocumentType(
      uploadRequest.file_name,
      uploadRequest.file_type
    );

    // Generate unique file name and storage path
    const documentId = uuidv4();
    const fileExtension = uploadRequest.file_name.split('.').pop()?.toLowerCase() || '';
    const timestamp = Date.now();
    const sanitizedFileName = uploadRequest.file_name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100);
    const storagePath = `${profile.organization_id}/${derivedProjectId || 'general'}/${timestamp}_${documentId}.${fileExtension}`;

    // Create document record in pending state
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        id: documentId,
        organization_id: profile.organization_id,
        project_id: derivedProjectId || null,
        application_id: uploadRequest.application_id || null,
        file_name: `${timestamp}_${documentId}.${fileExtension}`,
        original_file_name: uploadRequest.file_name,
        file_type: uploadRequest.file_type,
        file_size: uploadRequest.file_size,
        file_extension: fileExtension,
        storage_path: storagePath,
        storage_bucket: 'documents',
        document_type: documentType,
        document_status: DocumentStatus.PENDING_UPLOAD,
        version: 1,
        is_current_version: true,
        extraction_status: ExtractionStatus.PENDING,
        uploaded_by: user.id,
        description: uploadRequest.description || null,
        tags: uploadRequest.tags || [],
        access_count: 0,
      })
      .select()
      .single();

    if (docError) {
      console.error('Error creating document record:', docError);
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }

    // Create signed upload URL
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('documents')
      .createSignedUploadUrl(storagePath);

    if (signedUrlError || !signedUrlData) {
      // Rollback document creation
      await supabase.from('documents').delete().eq('id', documentId);

      console.error('Error creating signed URL:', signedUrlError);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    // Calculate expiry time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const response: SignedUploadResponse = {
      upload_url: signedUrlData.signedUrl,
      storage_path: storagePath,
      document_id: documentId,
      expires_at: expiresAt,
    };

    return NextResponse.json({
      data: response,
      meta: {
        max_file_size: getMaxFileSize(),
        supported_extensions: getSupportedFileExtensions(),
        document_type: documentType,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/documents/upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PUT - Confirm upload completion
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = confirmUploadSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { document_id, success, error: uploadError } = validationResult.data;

    // Get document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document_id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.document_status !== DocumentStatus.PENDING_UPLOAD &&
        document.document_status !== DocumentStatus.UPLOADING) {
      return NextResponse.json(
        { error: 'Document is not in pending upload state' },
        { status: 400 }
      );
    }

    if (success) {
      // Verify file exists in storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from(document.storage_bucket)
        .list(document.storage_path.split('/').slice(0, -1).join('/'), {
          search: document.storage_path.split('/').pop(),
        });

      if (fileError || !fileData || fileData.length === 0) {
        return NextResponse.json(
          { error: 'File not found in storage. Please retry upload.' },
          { status: 400 }
        );
      }

      // Check for existing versions and update accordingly
      const { data: existingDocs } = await supabase
        .from('documents')
        .select('id, version')
        .eq('organization_id', profile.organization_id)
        .eq('original_file_name', document.original_file_name)
        .eq('project_id', document.project_id)
        .neq('id', document_id)
        .order('version', { ascending: false })
        .limit(1);

      let version = 1;
      if (existingDocs && existingDocs.length > 0) {
        version = existingDocs[0].version + 1;

        // Mark previous versions as not current
        await supabase
          .from('documents')
          .update({ is_current_version: false })
          .eq('organization_id', profile.organization_id)
          .eq('original_file_name', document.original_file_name)
          .eq('project_id', document.project_id)
          .neq('id', document_id);
      }

      // Update document status to uploaded
      const uploadedAt = new Date().toISOString();
      const { data: updatedDoc, error: updateError } = await supabase
        .from('documents')
        .update({
          document_status: DocumentStatus.UPLOADED,
          version,
          is_current_version: true,
          uploaded_at: uploadedAt,
          updated_at: uploadedAt,
        })
        .eq('id', document_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating document status:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Log activity
      await supabase.rpc('log_activity', {
        p_organization_id: profile.organization_id,
        p_user_id: user.id,
        p_action_type: 'upload',
        p_entity_type: 'document',
        p_entity_id: document_id,
        p_entity_name: document.original_file_name,
      });

      return NextResponse.json({
        data: updatedDoc,
        message: 'Upload confirmed successfully',
      });
    } else {
      // Upload failed - clean up
      // Delete storage file if it exists
      await supabase.storage
        .from(document.storage_bucket)
        .remove([document.storage_path]);

      // Delete document record
      await supabase
        .from('documents')
        .delete()
        .eq('id', document_id);

      return NextResponse.json({
        success: false,
        message: 'Upload cancelled and cleaned up',
        error: uploadError,
      });
    }
  } catch (error) {
    console.error('Error in PUT /api/documents/upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// GET - Get upload configuration and supported file types
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      data: {
        max_file_size: getMaxFileSize(),
        max_file_size_mb: getMaxFileSize() / (1024 * 1024),
        supported_extensions: getSupportedFileExtensions(),
        supported_document_types: Object.values(DocumentType),
        upload_instructions: {
          step_1: 'POST to /api/documents/upload with file metadata to get signed URL',
          step_2: 'Upload file directly to the signed URL using PUT request',
          step_3: 'PUT to /api/documents/upload to confirm upload completion',
          step_4: 'POST to /api/documents/[id]/extract to trigger AI extraction',
        },
      },
    });
  } catch (error) {
    console.error('Error in GET /api/documents/upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
