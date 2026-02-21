import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Types for sync operations
interface SyncResult {
  sync_id: string;
  status: 'completed' | 'failed' | 'partial';
  programs_added: number;
  programs_updated: number;
  programs_deactivated: number;
  errors: SyncError[];
  started_at: string;
  completed_at: string;
  duration_ms: number;
}

interface SyncError {
  program_id?: string;
  external_id?: string;
  error: string;
  timestamp: string;
}

interface ConflictResolution {
  field: string;
  existing_value: unknown;
  incoming_value: unknown;
  resolution: 'keep_existing' | 'use_incoming' | 'merge';
  resolved_value: unknown;
}

// Validation schema for manual sync trigger
const syncRequestSchema = z.object({
  source: z.enum(['dsire', 'manual', 'api', 'bulk_import']).default('manual'),
  sync_type: z.enum(['full', 'incremental', 'validate']).default('incremental'),
  programs: z.array(z.object({
    external_id: z.string().optional(),
    name: z.string(),
    short_name: z.string().optional(),
    description: z.string().optional(),
    summary: z.string().optional(),
    program_type: z.string(),
    category: z.enum(['federal', 'state', 'local', 'utility']),
    subcategory: z.string().optional(),
    sector_types: z.array(z.string()).optional(),
    technology_types: z.array(z.string()).optional(),
    building_types: z.array(z.string()).optional(),
    jurisdiction_level: z.enum(['federal', 'state', 'local', 'utility']),
    state: z.string().length(2).optional().nullable(),
    counties: z.array(z.string()).optional(),
    municipalities: z.array(z.string()).optional(),
    incentive_type: z.string().optional(),
    amount_type: z.enum(['fixed', 'percentage', 'per_unit', 'per_kw', 'per_sqft', 'variable']).optional(),
    amount_fixed: z.number().optional().nullable(),
    amount_percentage: z.number().optional().nullable(),
    amount_per_unit: z.number().optional().nullable(),
    amount_per_kw: z.number().optional().nullable(),
    amount_per_sqft: z.number().optional().nullable(),
    amount_min: z.number().optional().nullable(),
    amount_max: z.number().optional().nullable(),
    status: z.enum(['active', 'inactive', 'expired', 'pending']).default('active'),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    application_deadline: z.string().optional().nullable(),
    administrator: z.string().optional(),
    source_url: z.string().optional(),
    eligibility_criteria: z.record(z.unknown()).optional(),
    eligibility_summary: z.string().optional(),
    entity_types: z.array(z.string()).optional(),
  })).optional(),
  conflict_resolution: z.enum(['keep_existing', 'use_incoming', 'merge_prefer_existing', 'merge_prefer_incoming']).default('merge_prefer_incoming'),
  dry_run: z.boolean().default(false),
});

// GET - Get sync status and history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const include_errors = searchParams.get('include_errors') === 'true';

    // Get recent sync history
    const { data: syncHistory, error: historyError } = await supabase
      .from('program_sync_log')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (historyError) {
      console.error('Error fetching sync history:', historyError);
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    // Get last successful sync
    const { data: lastSuccess } = await supabase
      .from('program_sync_log')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    // Get program counts for status
    const { data: programCounts } = await supabase
      .from('incentive_programs')
      .select('status');

    const statusCounts = programCounts?.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get programs needing verification (not verified in 30+ days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: needsVerification } = await supabase
      .from('incentive_programs')
      .select('*', { count: 'exact', head: true })
      .or(`last_verified_at.is.null,last_verified_at.lt.${thirtyDaysAgo.toISOString()}`);

    return NextResponse.json({
      current_status: {
        total_programs: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        active_programs: statusCounts['active'] || 0,
        inactive_programs: statusCounts['inactive'] || 0,
        expired_programs: statusCounts['expired'] || 0,
        pending_programs: statusCounts['pending'] || 0,
        needs_verification: needsVerification || 0,
      },
      last_successful_sync: lastSuccess ? {
        sync_id: lastSuccess.id,
        completed_at: lastSuccess.completed_at,
        source: lastSuccess.source,
        programs_added: lastSuccess.programs_added,
        programs_updated: lastSuccess.programs_updated,
      } : null,
      sync_history: syncHistory?.map(sync => ({
        sync_id: sync.id,
        sync_type: sync.sync_type,
        source: sync.source,
        status: sync.status,
        programs_added: sync.programs_added,
        programs_updated: sync.programs_updated,
        programs_deactivated: sync.programs_deactivated,
        started_at: sync.started_at,
        completed_at: sync.completed_at,
        errors: include_errors ? sync.errors : (sync.errors?.length || 0),
      })),
    });
  } catch (error) {
    console.error('Error in GET /api/programs/sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Trigger manual sync
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = syncRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { source, sync_type, programs, conflict_resolution, dry_run } = validationResult.data;
    const startTime = Date.now();
    const errors: SyncError[] = [];
    let programsAdded = 0;
    let programsUpdated = 0;
    let programsDeactivated = 0;

    // Create sync log entry
    const { data: syncLog, error: syncLogError } = await supabase
      .from('program_sync_log')
      .insert({
        sync_type,
        source,
        status: 'in_progress',
        triggered_by: user.id,
        metadata: { dry_run, conflict_resolution },
      })
      .select()
      .single();

    if (syncLogError) {
      console.error('Error creating sync log:', syncLogError);
      return NextResponse.json({ error: 'Failed to create sync log' }, { status: 500 });
    }

    // Process programs if provided
    if (programs && programs.length > 0) {
      for (const program of programs) {
        try {
          // Check if program exists by external_id or name
          let existingProgram = null;

          if (program.external_id) {
            const { data } = await supabase
              .from('incentive_programs')
              .select('*')
              .eq('external_id', program.external_id)
              .single();
            existingProgram = data;
          }

          if (!existingProgram) {
            const { data } = await supabase
              .from('incentive_programs')
              .select('*')
              .eq('name', program.name)
              .eq('category', program.category)
              .single();
            existingProgram = data;
          }

          if (existingProgram) {
            // Update existing program with conflict resolution
            const resolvedData = resolveConflicts(existingProgram, program, conflict_resolution);

            if (!dry_run) {
              const { error: updateError } = await supabase
                .from('incentive_programs')
                .update({
                  ...resolvedData,
                  last_verified_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', existingProgram.id);

              if (updateError) {
                errors.push({
                  program_id: existingProgram.id,
                  external_id: program.external_id,
                  error: updateError.message,
                  timestamp: new Date().toISOString(),
                });
              } else {
                programsUpdated++;
              }
            } else {
              programsUpdated++;
            }
          } else {
            // Insert new program
            if (!dry_run) {
              const { error: insertError } = await supabase
                .from('incentive_programs')
                .insert({
                  ...program,
                  last_verified_at: new Date().toISOString(),
                  data_source: source,
                  confidence_score: 0.90,
                });

              if (insertError) {
                errors.push({
                  external_id: program.external_id,
                  error: insertError.message,
                  timestamp: new Date().toISOString(),
                });
              } else {
                programsAdded++;
              }
            } else {
              programsAdded++;
            }
          }
        } catch (programError) {
          errors.push({
            external_id: program.external_id,
            error: programError instanceof Error ? programError.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // Handle full sync - deactivate programs not in the incoming list
    if (sync_type === 'full' && programs && programs.length > 0 && !dry_run) {
      const incomingExternalIds = programs
        .filter(p => p.external_id)
        .map(p => p.external_id);

      if (incomingExternalIds.length > 0) {
        const { data: toDeactivate, error: deactivateError } = await supabase
          .from('incentive_programs')
          .update({ status: 'inactive' })
          .eq('data_source', source)
          .not('external_id', 'in', `(${incomingExternalIds.join(',')})`)
          .eq('status', 'active')
          .select('id');

        if (!deactivateError && toDeactivate) {
          programsDeactivated = toDeactivate.length;
        }
      }
    }

    const endTime = Date.now();
    const finalStatus = errors.length === 0 ? 'completed' : (programsAdded + programsUpdated > 0 ? 'completed' : 'failed');

    // Update sync log
    if (!dry_run) {
      await supabase
        .from('program_sync_log')
        .update({
          status: finalStatus,
          programs_added: programsAdded,
          programs_updated: programsUpdated,
          programs_deactivated: programsDeactivated,
          errors: errors,
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncLog.id);
    }

    const result: SyncResult = {
      sync_id: syncLog.id,
      status: finalStatus,
      programs_added: programsAdded,
      programs_updated: programsUpdated,
      programs_deactivated: programsDeactivated,
      errors,
      started_at: syncLog.started_at,
      completed_at: new Date().toISOString(),
      duration_ms: endTime - startTime,
    };

    if (dry_run) {
      return NextResponse.json({
        dry_run: true,
        message: 'Dry run completed. No changes were made.',
        preview: result,
      });
    }

    return NextResponse.json({
      message: 'Sync completed',
      result,
    });
  } catch (error) {
    console.error('Error in POST /api/programs/sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Cancel running sync or clear sync history
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'cancel_running') {
      // Mark any running syncs as failed
      const { data: cancelled } = await supabase
        .from('program_sync_log')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          errors: [{ error: 'Cancelled by user', timestamp: new Date().toISOString() }],
        })
        .in('status', ['started', 'in_progress'])
        .select('id');

      return NextResponse.json({
        message: 'Running syncs cancelled',
        cancelled_count: cancelled?.length || 0,
      });
    }

    if (action === 'clear_history') {
      const days = parseInt(searchParams.get('older_than_days') || '90');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data: deleted } = await supabase
        .from('program_sync_log')
        .delete()
        .lt('started_at', cutoffDate.toISOString())
        .select('id');

      return NextResponse.json({
        message: `Cleared sync history older than ${days} days`,
        deleted_count: deleted?.length || 0,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use action=cancel_running or action=clear_history' }, { status: 400 });
  } catch (error) {
    console.error('Error in DELETE /api/programs/sync:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to resolve conflicts between existing and incoming data
function resolveConflicts(
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>,
  strategy: string
): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  const fieldsToMerge = [
    'name', 'short_name', 'description', 'summary', 'program_type', 'category',
    'subcategory', 'sector_types', 'technology_types', 'building_types',
    'jurisdiction_level', 'state', 'counties', 'municipalities', 'utility_territories',
    'incentive_type', 'amount_type', 'amount_fixed', 'amount_percentage',
    'amount_per_unit', 'amount_per_kw', 'amount_per_sqft', 'amount_min', 'amount_max',
    'status', 'start_date', 'end_date', 'application_deadline', 'next_deadline',
    'funding_remaining', 'administrator', 'administering_agency', 'source_url',
    'application_url', 'eligibility_criteria', 'eligibility_summary', 'entity_types',
    'stackable', 'stacking_restrictions', 'application_complexity', 'typical_processing_days',
    'direct_pay_eligible', 'transferable', 'domestic_content_bonus', 'energy_community_bonus',
    'prevailing_wage_bonus', 'low_income_bonus', 'tier_bonuses', 'minimum_sustainability_tier',
  ];

  for (const field of fieldsToMerge) {
    const existingValue = existing[field];
    const incomingValue = incoming[field];

    if (incomingValue === undefined) {
      // Incoming doesn't have this field, keep existing
      if (existingValue !== undefined) {
        resolved[field] = existingValue;
      }
      continue;
    }

    if (existingValue === undefined || existingValue === null) {
      // Existing doesn't have this field, use incoming
      resolved[field] = incomingValue;
      continue;
    }

    // Both have values - apply conflict resolution strategy
    switch (strategy) {
      case 'keep_existing':
        resolved[field] = existingValue;
        break;

      case 'use_incoming':
        resolved[field] = incomingValue;
        break;

      case 'merge_prefer_existing':
        if (Array.isArray(existingValue) && Array.isArray(incomingValue)) {
          // Merge arrays, keeping existing values first
          resolved[field] = Array.from(new Set([...existingValue, ...incomingValue]));
        } else if (typeof existingValue === 'object' && typeof incomingValue === 'object') {
          // Merge objects, existing takes precedence
          resolved[field] = { ...incomingValue, ...existingValue };
        } else {
          resolved[field] = existingValue;
        }
        break;

      case 'merge_prefer_incoming':
      default:
        if (Array.isArray(existingValue) && Array.isArray(incomingValue)) {
          // Merge arrays, incoming values take precedence
          resolved[field] = Array.from(new Set([...existingValue, ...incomingValue]));
        } else if (typeof existingValue === 'object' && typeof incomingValue === 'object') {
          // Merge objects, incoming takes precedence
          resolved[field] = { ...existingValue, ...incomingValue };
        } else {
          resolved[field] = incomingValue;
        }
        break;
    }
  }

  return resolved;
}
