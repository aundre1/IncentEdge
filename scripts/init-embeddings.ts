/**
 * IncentEdge Embedding Initialization Script
 *
 * Generates vector embeddings for all incentive programs that don't yet have them.
 * Stores results in the `incentive_programs.embedding` column (vector(1536)).
 *
 * Usage:
 *   cd /Users/dremacmini/Desktop/OC/incentedge/Site
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/init-embeddings.ts
 *
 * Or if ANTHROPIC_API_KEY is already in .env.local:
 *   npx tsx --env-file .env.local scripts/init-embeddings.ts
 *
 * Estimated time: 30-60 minutes for 24,000+ programs (batched at 10 concurrent)
 * Estimated cost: ~$2-5 in Anthropic API credits
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? '';

const BATCH_SIZE = 10;           // Programs processed in parallel per batch
const DELAY_BETWEEN_BATCHES = 1000; // ms between batches (rate limit buffer)
const PROGRAMS_PER_FETCH = 100;  // Programs fetched per Supabase query

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  console.error('Run: npx tsx --env-file .env.local scripts/init-embeddings.ts');
  process.exit(1);
}

if (!ANTHROPIC_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY is required');
  console.error('Get yours at: https://console.anthropic.com/settings/keys');
  console.error('Then run: ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/init-embeddings.ts');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ---------------------------------------------------------------------------
// Embedding generation
// ---------------------------------------------------------------------------

async function generateEmbedding(program: {
  id: string;
  name: string;
  summary?: string | null;
  description?: string | null;
  eligibility_summary?: string | null;
  category?: string | null;
  state?: string | null;
}): Promise<number[] | null> {
  const text = [
    program.name,
    program.category,
    program.state ? `State: ${program.state}` : null,
    program.summary,
    program.eligibility_summary,
    program.description,
  ]
    .filter(Boolean)
    .join(' | ')
    .slice(0, 4000); // Keep under token limits

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001', // Haiku for cost efficiency on batch embeddings
      max_tokens: 1024,
      system:
        'You are an embedding generator for incentive programs. ' +
        'Generate a semantic vector representation. ' +
        'Return ONLY a JSON array of exactly 1536 numbers between -1 and 1. ' +
        'No explanation, no markdown, just the array.',
      messages: [{ role: 'user', content: `Generate embedding for: ${text}` }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const match = content.text.match(/\[[\d\s.,\-e+]+\]/);
      if (match) {
        const embedding = JSON.parse(match[0]) as number[];
        if (Array.isArray(embedding) && embedding.length === 1536) {
          return embedding;
        }
      }
    }
    return null;
  } catch (err) {
    console.error(`  Error generating embedding for ${program.name}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('IncentEdge Embedding Initialization');
  console.log('====================================');
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Batch size: ${BATCH_SIZE} concurrent | Delay: ${DELAY_BETWEEN_BATCHES}ms\n`);

  // Count programs needing embeddings
  const { count: total } = await supabase
    .from('incentive_programs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    .is('embedding', null);

  console.log(`Programs needing embeddings: ${total ?? 'unknown'}`);

  if (!total || total === 0) {
    console.log('All programs already have embeddings!');
    return;
  }

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let offset = 0;

  while (offset < (total ?? Infinity)) {
    // Fetch next batch of programs without embeddings
    const { data: programs, error } = await supabase
      .from('incentive_programs')
      .select('id, name, summary, description, eligibility_summary, category, state')
      .eq('status', 'active')
      .is('embedding', null)
      .range(offset, offset + PROGRAMS_PER_FETCH - 1);

    if (error) {
      console.error('Error fetching programs:', error.message);
      break;
    }

    if (!programs || programs.length === 0) break;

    // Process in parallel batches of BATCH_SIZE
    for (let i = 0; i < programs.length; i += BATCH_SIZE) {
      const batch = programs.slice(i, i + BATCH_SIZE);

      const results = await Promise.all(
        batch.map(async (program) => {
          const embedding = await generateEmbedding(program);
          if (embedding) {
            const { error: updateErr } = await supabase
              .from('incentive_programs')
              .update({ embedding: JSON.stringify(embedding) })
              .eq('id', program.id);

            if (updateErr) {
              console.error(`  Failed to save ${program.name}:`, updateErr.message);
              return false;
            }
            return true;
          }
          return false;
        })
      );

      const batchSucceeded = results.filter(Boolean).length;
      const batchFailed = results.length - batchSucceeded;
      succeeded += batchSucceeded;
      failed += batchFailed;
      processed += batch.length;

      const pct = Math.round((processed / total) * 100);
      process.stdout.write(
        `\rProgress: ${processed}/${total} (${pct}%) | ✓ ${succeeded} | ✗ ${failed}`
      );

      if (i + BATCH_SIZE < programs.length) {
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES));
      }
    }

    offset += PROGRAMS_PER_FETCH;
  }

  console.log('\n\nDone!');
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Total:     ${processed}`);

  if (succeeded > 0) {
    console.log('\nSemantic search is now active on the Discover page.');
    console.log('Refresh the materialized view by calling: POST /api/knowledge/refresh');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
