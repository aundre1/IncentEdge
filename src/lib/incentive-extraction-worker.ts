/**
 * Incentive Extraction Worker
 *
 * Async worker that processes document extraction jobs for incentive programs.
 * Handles the complete lifecycle: retrieve document, process with AI, save results, and update job status.
 */

import { createClient } from '@/lib/supabase/server';
import { incentiveProgramProcessor } from '@/lib/incentive-program-processor';
import { IncentiveProgramExtractedData } from '@/types/incentive-programs';
// @ts-expect-error - pdf-parse module types not properly exported
import pdfParse from 'pdf-parse';

// ============================================================================
// TYPES
// ============================================================================

export interface ExtractionWorkerResult {
  success: boolean;
  programs_extracted: number;
  programs_needing_review: number;
  error?: string;
}

// ============================================================================
// WORKER IMPLEMENTATION
// ============================================================================

/**
 * Process an incentive program extraction job
 * Called by job-processor.ts when job type is 'document_extraction'
 */
export async function processIncentiveExtraction(
  jobId: string,
  organizationId?: string
): Promise<ExtractionWorkerResult> {
  const supabase = await createClient();
  const startTime = Date.now();

  try {
    // ===== STEP 1: Fetch job and document =====
    await updateJobStatus(supabase, jobId, 'running', 10, 'Fetching job and document...');

    let jobQuery = supabase
      .from('background_jobs')
      .select('*')
      .eq('id', jobId);

    if (organizationId) {
      jobQuery = jobQuery.eq('organization_id', organizationId);
    }

    const { data: job, error: jobError } = await jobQuery.single();

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobError?.message}`);
    }

    const payload = job.payload as Record<string, unknown>;
    const documentId = (payload.document_id as string) || job.document_id;

    if (!documentId) {
      throw new Error('No document_id in job payload or job record');
    }

    // Get org ID if not provided
    const orgId = organizationId || (job.organization_id as string);
    if (!orgId) {
      throw new Error('No organization_id found');
    }

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('organization_id', orgId)
      .single();

    if (docError || !document) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    await logJobProgress(supabase, jobId, 'info', 'Document fetched', { document_id: documentId });

    // ===== STEP 2: Download and extract text from PDF =====
    await updateJobStatus(supabase, jobId, 'running', 25, 'Downloading and extracting PDF text...');

    const documentText = await extractTextFromDocument(
      supabase,
      document.storage_bucket,
      document.storage_path
    );

    if (!documentText || documentText.trim().length === 0) {
      throw new Error('Failed to extract text from document or document is empty');
    }

    await logJobProgress(supabase, jobId, 'info', 'PDF text extracted', {
      text_length: documentText.length,
    });

    // ===== STEP 3: Process with AI (classify, extract, validate) =====
    await updateJobStatus(supabase, jobId, 'running', 50, 'Processing with AI model...');

    const processingResult = await incentiveProgramProcessor.processDocument(
      documentText,
      document.source_url || undefined
    );

    if (processingResult.status === 'failed') {
      throw new Error(
        `AI processing failed: ${processingResult.errors.join('; ')}`
      );
    }

    await logJobProgress(supabase, jobId, 'info', 'AI processing completed', {
      status: processingResult.status,
      programs_found: processingResult.programs.length,
      errors: processingResult.errors,
      warnings: processingResult.warnings,
    });

    // ===== STEP 4: Upsert extracted programs to database =====
    await updateJobStatus(supabase, jobId, 'running', 75, 'Saving extracted programs...');

    let savedCount = 0;
    let needsReviewCount = 0;

    for (const validatedProgram of processingResult.programs) {
      const data = validatedProgram.data;
      const confidenceScore = validatedProgram.confidence_score;

      // Determine if needs review
      const needsReview = confidenceScore < 0.8;
      if (needsReview) {
        needsReviewCount++;
      }

      // Build insert record
      const programName = data.program_name || 'Unnamed Program';
      const programRecord = {
        external_id: `extracted-${jobId}-${(programName).replace(/\s+/g, '-').toLowerCase()}`,
        name: programName,
        short_name: (programName).substring(0, 100),
        description: data.eligibility_criteria ? JSON.stringify(data.eligibility_criteria) : null,
        summary: data.eligibility_criteria ? JSON.stringify(data.eligibility_criteria).substring(0, 500) : null,

        // Classification
        program_type: data.incentive_type || 'other',
        category: mapCategory(data.program_level || 'other'),
        sector_types: (data.eligible_sectors as string[]) || [],
        technology_types: (data.eligible_technologies as string[]) || [],

        // Geography
        jurisdiction_level: mapCategory(data.program_level || 'other'),
        state: data.jurisdiction_state,
        counties: (data.jurisdiction_local ? [data.jurisdiction_local] : []) as string[],

        // Incentive Value
        incentive_type: data.incentive_type || 'other',
        amount_type: inferAmountType(data),
        amount_fixed: parseAmount(data.funding_amount_num),
        amount_min: parseAmount(data.min_amount),
        amount_max: parseAmount(data.max_amount),

        // Eligibility
        eligibility_criteria: data.eligibility_criteria || {},
        entity_types: (data.eligible_sectors as string[]) || [],

        // Status & Dates
        status: data.funding_status === 'closed' ? 'inactive' : 'active',
        start_date: parseDate(data.deadline_raw),
        application_deadline: parseDate(data.application_deadline),
        end_date: parseDate(data.program_end_date),

        // Administration
        administrator: data.issuer,
        administering_agency: data.issuer,
        application_url: data.application_url,
        source_url: document.source_url || null,

        // Stacking
        stackable: data.stacking_rules ? true : false,
        stacking_restrictions: data.stacking_rules ? [data.stacking_rules] : [],

        // Data Quality
        confidence_score: confidenceScore,
        data_source: `document_extraction_${jobId}`,
        last_verified_at: new Date().toISOString(),
      };

      // Upsert into database
      const { error: upsertError, data: upsertedProgram } = await supabase
        .from('incentive_programs')
        .upsert(programRecord, {
          onConflict: 'external_id',
        })
        .select('id')
        .single();

      if (upsertError) {
        await logJobProgress(supabase, jobId, 'warn', `Failed to upsert program: ${data.program_name}`, {
          error: upsertError.message,
        });
        continue;
      }

      savedCount++;

      // Log individual program
      await logJobProgress(supabase, jobId, 'info', `Saved program: ${data.program_name}`, {
        program_id: upsertedProgram?.id,
        confidence_score: confidenceScore,
        needs_review: needsReview,
      });
    }

    // ===== STEP 5: Update job with results =====
    await updateJobStatus(supabase, jobId, 'running', 90, 'Finalizing...');

    const finalStatus = needsReviewCount > 0 ? 'needs_review' : 'completed';
    const result = {
      programs: processingResult.programs.map((p) => ({
        name: p.data.program_name,
        confidence_score: p.confidence_score,
        low_confidence_fields: p.low_confidence_fields,
        warnings: p.warnings,
      })),
      saved_count: savedCount,
      needs_review_count: needsReviewCount,
      processing_time_ms: Date.now() - startTime,
    };

    // Mark job as completed or needs_review
    await completeJob(supabase, jobId, finalStatus, result);

    await updateJobStatus(supabase, jobId, finalStatus, 100, 'Complete');

    await logJobProgress(supabase, jobId, 'info', 'Job completed successfully', {
      saved_count: savedCount,
      needs_review_count: needsReviewCount,
      status: finalStatus,
    });

    return {
      success: true,
      programs_extracted: savedCount,
      programs_needing_review: needsReviewCount,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    await logJobProgress(supabase, jobId, 'error', `Job failed: ${errorMessage}`, {
      stack: errorStack,
    });

    // Update job as failed
    await failJob(supabase, jobId, errorMessage, errorStack);

    return {
      success: false,
      programs_extracted: 0,
      programs_needing_review: 0,
      error: errorMessage,
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract text from PDF stored in Supabase Storage
 */
async function extractTextFromDocument(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: string,
  path: string
): Promise<string> {
  try {
    // Download file from storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error || !data) {
      throw new Error(`Storage download failed: ${error?.message}`);
    }

    // Parse PDF
    const buffer = await data.arrayBuffer();
    const pdf = await pdfParse(Buffer.from(buffer));

    // Extract text
    const text = pdf.text || '';
    return text;
  } catch (error) {
    throw new Error(
      `PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Infer amount type from extracted data
 */
function inferAmountType(data: IncentiveProgramExtractedData): string {
  if (data.amount_formula) return 'variable';
  if (data.funding_amount_num) return 'fixed';
  if (data.min_amount && data.max_amount) return 'percentage'; // Placeholder
  return 'variable';
}

/**
 * Parse amount string to number
 */
function parseAmount(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Parse date string to ISO format
 */
function parseDate(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Map program level to category
 */
function mapCategory(
  level: string
): 'federal' | 'state' | 'local' | 'utility' {
  const levelLower = (level || '').toLowerCase();
  if (levelLower.includes('federal')) return 'federal';
  if (levelLower.includes('state')) return 'state';
  if (levelLower.includes('local')) return 'local';
  if (levelLower.includes('utility')) return 'utility';
  return 'local';
}

/**
 * Update job status and progress
 */
async function updateJobStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
  status: string,
  progress: number,
  message: string
): Promise<void> {
  await supabase
    .from('background_jobs')
    .update({
      status: status as any,
      progress,
      progress_message: message,
    })
    .eq('id', jobId);
}

/**
 * Complete job successfully
 */
async function completeJob(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
  status: 'completed' | 'needs_review',
  result: Record<string, unknown>
): Promise<void> {
  await supabase
    .from('background_jobs')
    .update({
      status,
      result,
      completed_at: new Date().toISOString(),
      progress: 100,
    })
    .eq('id', jobId);
}

/**
 * Mark job as failed
 */
async function failJob(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
  error: string,
  stack?: string
): Promise<void> {
  await supabase
    .from('background_jobs')
    .update({
      status: 'failed',
      last_error: error,
      error_stack: stack || null,
    })
    .eq('id', jobId);
}

/**
 * Log job progress
 */
async function logJobProgress(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobId: string,
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
): Promise<void> {
  await supabase.from('job_logs').insert({
    job_id: jobId,
    level,
    message,
    data: data || {},
  });
}
