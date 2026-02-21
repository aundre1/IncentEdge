import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { DocumentType, DocumentStatus } from '@/types/documents';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const updateDocumentSchema = z.object({
  document_type: z.nativeEnum(DocumentType).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// ============================================================================
// GET - Retrieve a single document with metadata and extracted data
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

    // Get document with version history
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        project:projects(id, name),
        application:applications(id, status),
        uploader:profiles!uploaded_by(id, full_name, email)
      `)
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      console.error('Error fetching document:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get version history
    const { data: versions } = await supabase
      .from('documents')
      .select('id, version, file_name, uploaded_at, uploaded_by, file_size')
      .eq('original_file_name', document.original_file_name)
      .eq('project_id', document.project_id)
      .eq('organization_id', profile.organization_id)
      .order('version', { ascending: false });

    // Update access count and last accessed timestamp
    await supabase
      .from('documents')
      .update({
        access_count: (document.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Generate signed URL for download if requested
    const { searchParams } = new URL(request.url);
    const includeDownloadUrl = searchParams.get('include_download_url') === 'true';

    let downloadUrl = null;
    if (includeDownloadUrl && document.storage_path) {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(document.storage_bucket)
        .createSignedUrl(document.storage_path, 3600); // 1 hour expiry

      if (!signedUrlError && signedUrlData) {
        downloadUrl = signedUrlData.signedUrl;
      }
    }

    return NextResponse.json({
      data: {
        ...document,
        download_url: downloadUrl,
        version_history: versions,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/documents/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// PATCH - Update document metadata
// ============================================================================

export async function PATCH(
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

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateDocumentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Update document
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }
      console.error('Error updating document:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: 'update',
      p_entity_type: 'document',
      p_entity_id: document.id,
      p_entity_name: document.original_file_name,
    });

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error('Error in PATCH /api/documents/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Delete a document (soft delete or permanent)
// ============================================================================

export async function DELETE(
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

    // Check if permanent delete is requested
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Get document info for logging and storage cleanup
    const { data: document } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .single();

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (permanent) {
      // Delete from storage first
      if (document.storage_path) {
        const { error: storageError } = await supabase.storage
          .from(document.storage_bucket)
          .remove([document.storage_path]);

        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Permanently delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('organization_id', profile.organization_id);

      if (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Soft delete - mark as archived
      const { error } = await supabase
        .from('documents')
        .update({
          document_status: DocumentStatus.ARCHIVED,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('organization_id', profile.organization_id);

      if (error) {
        console.error('Error archiving document:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // If this was the current version, promote the previous version
    if (document.is_current_version && !permanent) {
      const { data: previousVersion } = await supabase
        .from('documents')
        .select('id')
        .eq('original_file_name', document.original_file_name)
        .eq('project_id', document.project_id)
        .eq('organization_id', profile.organization_id)
        .neq('id', id)
        .neq('document_status', DocumentStatus.ARCHIVED)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (previousVersion) {
        await supabase
          .from('documents')
          .update({ is_current_version: true })
          .eq('id', previousVersion.id);
      }
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_organization_id: profile.organization_id,
      p_user_id: user.id,
      p_action_type: permanent ? 'delete' : 'archive',
      p_entity_type: 'document',
      p_entity_id: id,
      p_entity_name: document.original_file_name,
    });

    return NextResponse.json({
      success: true,
      action: permanent ? 'deleted' : 'archived',
    });
  } catch (error) {
    console.error('Error in DELETE /api/documents/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
