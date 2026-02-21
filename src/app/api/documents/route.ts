import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import {
  DocumentType,
  DocumentStatus,
  ExtractionStatus,
  DocumentListParams,
} from '@/types/documents';
import { inferDocumentType, validateFile } from '@/lib/document-processor';
import { sanitizeSearchTerm, sanitizeQueryParams } from '@/lib/security/input-sanitizer';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createDocumentSchema = z.object({
  project_id: z.string().uuid().optional(),
  application_id: z.string().uuid().optional(),
  document_type: z.nativeEnum(DocumentType),
  file_name: z.string().min(1, 'File name is required'),
  original_file_name: z.string().min(1, 'Original file name is required'),
  file_type: z.string().min(1, 'File type is required'),
  file_size: z.number().positive('File size must be positive'),
  storage_path: z.string().min(1, 'Storage path is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================================
// GET - List documents with filtering and pagination
// ============================================================================

export async function GET(request: NextRequest) {
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

    // Parse and sanitize query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = sanitizeQueryParams(searchParams);
    const params: DocumentListParams = {
      project_id: queryParams.getUUID('project_id') || undefined,
      application_id: queryParams.getUUID('application_id') || undefined,
      document_type: searchParams.get('document_type') as DocumentType | undefined,
      status: searchParams.get('status') as DocumentStatus | undefined,
      search: queryParams.getSearchTerm('search') || undefined,
      page: queryParams.getNumber('page', { min: 1, integer: true }) || 1,
      limit: queryParams.getNumber('limit', { min: 1, max: 100, integer: true }) || 20,
      sort_by: (queryParams.getEnum('sort_by', ['created_at', 'updated_at', 'file_name'] as const)) || 'created_at',
      sort_order: (queryParams.getEnum('sort_order', ['asc', 'desc'] as const)) || 'desc',
    };

    const offset = (params.page! - 1) * params.limit!;

    // Build query
    let query = supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('organization_id', profile.organization_id)
      .eq('is_current_version', true);

    // Apply filters
    if (params.project_id) {
      query = query.eq('project_id', params.project_id);
    }

    if (params.application_id) {
      query = query.eq('application_id', params.application_id);
    }

    if (params.document_type) {
      query = query.eq('document_type', params.document_type);
    }

    if (params.status) {
      query = query.eq('document_status', params.status);
    }

    if (params.search) {
      // Use sanitized search term with individual .ilike() calls
      // This is safer than string concatenation in .or()
      const sanitized = sanitizeSearchTerm(params.search);
      query = query.or(
        `file_name.ilike.%${sanitized.value}%,original_file_name.ilike.%${sanitized.value}%,description.ilike.%${sanitized.value}%`
      );
    }

    // Apply sorting
    const ascending = params.sort_order === 'asc';
    query = query.order(params.sort_by!, { ascending });

    // Apply pagination
    query = query.range(offset, offset + params.limit! - 1);

    const { data: documents, error, count } = await query;

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: documents,
      meta: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / params.limit!),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// POST - Create a new document record (after file upload)
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
    const validationResult = createDocumentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const documentData = validationResult.data;

    // Validate that at least project_id or application_id is provided
    if (!documentData.project_id && !documentData.application_id) {
      return NextResponse.json(
        { error: 'Either project_id or application_id must be provided' },
        { status: 400 }
      );
    }

    // If project_id provided, verify user has access to the project
    if (documentData.project_id) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, organization_id')
        .eq('id', documentData.project_id)
        .eq('organization_id', profile.organization_id)
        .single();

      if (projectError || !project) {
        return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 });
      }
    }

    // If application_id provided, verify user has access
    if (documentData.application_id) {
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('id, project:projects(organization_id)')
        .eq('id', documentData.application_id)
        .single();

      if (appError || !application) {
        return NextResponse.json({ error: 'Application not found or access denied' }, { status: 404 });
      }
    }

    // Get file extension
    const fileExtension = documentData.original_file_name.split('.').pop()?.toLowerCase() || '';

    // Check for existing versions
    let version = 1;
    const { data: existingDocs } = await supabase
      .from('documents')
      .select('id, version')
      .eq('organization_id', profile.organization_id)
      .eq('original_file_name', documentData.original_file_name)
      .eq('project_id', documentData.project_id || null)
      .order('version', { ascending: false })
      .limit(1);

    if (existingDocs && existingDocs.length > 0) {
      version = existingDocs[0].version + 1;

      // Mark previous versions as not current
      await supabase
        .from('documents')
        .update({ is_current_version: false })
        .eq('organization_id', profile.organization_id)
        .eq('original_file_name', documentData.original_file_name)
        .eq('project_id', documentData.project_id || null);
    }

    // Create document record
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        organization_id: profile.organization_id,
        project_id: documentData.project_id || null,
        application_id: documentData.application_id || null,
        file_name: documentData.file_name,
        original_file_name: documentData.original_file_name,
        file_type: documentData.file_type,
        file_size: documentData.file_size,
        file_extension: fileExtension,
        storage_path: documentData.storage_path,
        storage_bucket: 'documents',
        document_type: documentData.document_type,
        document_status: DocumentStatus.UPLOADED,
        version,
        is_current_version: true,
        parent_document_id: existingDocs?.[0]?.id || null,
        extraction_status: ExtractionStatus.PENDING,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
        description: documentData.description || null,
        tags: documentData.tags || [],
        access_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'create',
      p_entity_type: 'document',
      p_entity_id: document.id,
      p_entity_name: document.original_file_name,
    });

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
