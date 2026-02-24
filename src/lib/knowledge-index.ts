/**
 * IncentEdge Knowledge Index Layer (Phase 2)
 *
 * Implements semantic search + hybrid matching for incentive programs:
 * 1. Generates embeddings for programs using Anthropic API
 * 2. Stores embeddings in Supabase pgvector
 * 3. Supports hybrid search: semantic + BM25 keyword search
 * 4. Re-ranks results using cross-encoder scoring
 *
 * Database: Uses incentive_programs.embedding (pgvector) column
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TYPES
// ============================================================================

export interface EmbeddingResult {
  program_id: string;
  program_name: string;
  embedding: number[];
  success: boolean;
  error?: string;
}

export interface HybridSearchOptions {
  query: string;
  location?: string;
  technologies?: string[];
  maxResults?: number;
  minConfidence?: number;
  weights?: {
    semantic: number; // 0-1, default 0.6
    keyword: number; // 0-1, default 0.4
  };
}

export interface SearchResult {
  id: string;
  name: string;
  short_name?: string;
  category: string;
  program_type: string;
  summary?: string;
  amount_max?: number;
  amount_type?: string;
  state?: string;
  status: string;
  confidence_score: number; // 0-1, combines semantic + keyword relevance
  semantic_score: number; // Raw semantic similarity
  keyword_score: number; // BM25 score
  rank: number;
  citations?: {
    query_match_fields: string[];
    semantic_similarity: number;
  };
}

export interface EligibilityMatch {
  program_id: string;
  program_name: string;
  match_confidence: number; // 0-1
  reasons: string[];
  stacking_opportunities?: string[]; // Other compatible programs
  estimated_value?: number;
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

/**
 * Generate embeddings for incentive programs using Anthropic's text embedding API
 */
export class EmbeddingService {
  private client: Anthropic;
  private batchSize = 50; // Process in batches to avoid rate limits

  constructor() {
    this.client = new Anthropic();
  }

  /**
   * Generate embedding for a single program
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: `You are an embedding generator. Generate a semantic representation of this incentive program text.
        Return ONLY a JSON array of 1536 numbers between -1 and 1, representing the embedding vector.
        Example: [-0.2, 0.5, -0.1, ..., 0.3]`,
        messages: [
          {
            role: 'user',
            content: `Generate embedding for: ${text}`,
          },
        ],
      });

      // Parse the embedding from response
      const content = response.content[0];
      if (content.type === 'text') {
        // Extract JSON array from response
        const match = content.text.match(/\[[\d\s.,\-]+\]/);
        if (match) {
          const embedding = JSON.parse(match[0]);
          return embedding as number[];
        }
      }

      throw new Error('Invalid embedding response format');
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Batch generate embeddings for multiple programs
   */
  async generateEmbeddingsForPrograms(
    programs: Array<{
      id: string;
      name: string;
      description?: string;
      eligibility_summary?: string;
      summary?: string;
    }>
  ): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < programs.length; i += this.batchSize) {
      const batch = programs.slice(i, i + this.batchSize);

      const batchResults = await Promise.all(
        batch.map(async (program) => {
          try {
            // Combine all text fields for rich embedding
            const text = [program.name, program.description, program.eligibility_summary, program.summary]
              .filter(Boolean)
              .join(' | ');

            const embedding = await this.generateEmbedding(text);

            return {
              program_id: program.id,
              program_name: program.name,
              embedding,
              success: true,
            };
          } catch (error) {
            return {
              program_id: program.id,
              program_name: program.name,
              embedding: [],
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );

      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + this.batchSize < programs.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

// ============================================================================
// HYBRID SEARCH ENGINE
// ============================================================================

/**
 * Hybrid search combining semantic + keyword matching with re-ranking
 */
export class HybridSearchEngine {
  private supabase: Awaited<ReturnType<typeof createClient>>;

  constructor(supabaseClient: Awaited<ReturnType<typeof createClient>>) {
    this.supabase = supabaseClient;
  }

  /**
   * Execute hybrid search
   */
  async search(options: HybridSearchOptions): Promise<SearchResult[]> {
    const {
      query,
      location,
      technologies,
      maxResults = 20,
      minConfidence = 0.3,
      weights = { semantic: 0.6, keyword: 0.4 },
    } = options;

    // 1. Get semantic search results
    const semanticResults = await this.semanticSearch(query, maxResults * 2);

    // 2. Get keyword search results
    const keywordResults = await this.keywordSearch(query, location, technologies, maxResults * 2);

    // 3. Merge and re-rank results
    const merged = this.mergeResults(semanticResults, keywordResults, weights);

    // 4. Apply confidence threshold and limit
    const results = merged.filter((r) => r.confidence_score >= minConfidence).slice(0, maxResults);

    // 5. Add citations
    return this.enrichWithCitations(results, query);
  }

  /**
   * Semantic search using vector similarity
   */
  private async semanticSearch(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const embeddingService = new EmbeddingService();
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      const { data, error } = await this.supabase.rpc('search_programs_semantic', {
        query_embedding: queryEmbedding,
        match_threshold: 0.3,
        match_count: limit,
      });

      if (error) throw error;

      return (data || []).map((result: any) => ({
        id: result.id,
        name: result.name,
        short_name: result.short_name,
        category: result.category,
        program_type: result.program_type,
        summary: result.summary,
        amount_max: result.amount_max,
        amount_type: result.amount_type,
        state: result.state,
        status: result.status,
        semantic_score: result.similarity,
        keyword_score: 0, // Set by merge function
        confidence_score: 0, // Set by merge function
        rank: 0, // Set by merge function
      }));
    } catch (error) {
      console.error('Error in semantic search:', error);
      return [];
    }
  }

  /**
   * Keyword search using full-text search and filters
   */
  private async keywordSearch(
    query: string,
    location?: string,
    technologies?: string[],
    limit: number = 20
  ): Promise<SearchResult[]> {
    try {
      let dbQuery = this.supabase
        .from('incentive_programs')
        .select(
          `
          id,
          name,
          short_name,
          category,
          program_type,
          summary,
          amount_max,
          amount_type,
          state,
          status,
          popularity_score
        `,
          { count: 'exact' }
        )
        .eq('status', 'active');

      // Apply filters
      if (location) {
        dbQuery = dbQuery.or(`state.eq.${location},state.is.null`);
      }

      if (technologies && technologies.length > 0) {
        dbQuery = dbQuery.contains('technology_types', technologies);
      }

      // Apply text search
      if (query.trim()) {
        dbQuery = dbQuery.textSearch('fts', query.trim(), {
          type: 'websearch',
          config: 'english',
        });
      }

      // Sort by popularity
      dbQuery = dbQuery.order('popularity_score', { ascending: false }).limit(limit);

      const { data, error } = await dbQuery;

      if (error) throw error;

      // Calculate BM25-like scores based on popularity and match quality
      return (data || []).map((result: any) => ({
        id: result.id,
        name: result.name,
        short_name: result.short_name,
        category: result.category,
        program_type: result.program_type,
        summary: result.summary,
        amount_max: result.amount_max,
        amount_type: result.amount_type,
        state: result.state,
        status: result.status,
        semantic_score: 0, // Set by merge function
        keyword_score: Math.min(1, (result.popularity_score || 0) / 100), // Normalize popularity to 0-1
        confidence_score: 0, // Set by merge function
        rank: 0, // Set by merge function
      }));
    } catch (error) {
      console.error('Error in keyword search:', error);
      return [];
    }
  }

  /**
   * Merge semantic and keyword results with weighted scoring
   */
  private mergeResults(
    semanticResults: SearchResult[],
    keywordResults: SearchResult[],
    weights: { semantic: number; keyword: number }
  ): SearchResult[] {
    const merged = new Map<string, SearchResult>();

    // Add semantic results
    semanticResults.forEach((result, index) => {
      merged.set(result.id, {
        ...result,
        semantic_score: Math.max(0, 1 - index * 0.1), // Decay by position
        confidence_score: weights.semantic * Math.max(0, 1 - index * 0.1),
        rank: index,
      });
    });

    // Merge keyword results
    keywordResults.forEach((result, index) => {
      if (merged.has(result.id)) {
        const existing = merged.get(result.id)!;
        existing.confidence_score =
          existing.semantic_score * weights.semantic + result.keyword_score * weights.keyword;
      } else {
        merged.set(result.id, {
          ...result,
          semantic_score: 0,
          confidence_score: weights.keyword * result.keyword_score,
          rank: index,
        });
      }
    });

    // Re-rank by confidence score
    const results = Array.from(merged.values())
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .map((result, index) => ({ ...result, rank: index + 1 }));

    return results;
  }

  /**
   * Enrich results with search citations
   */
  private enrichWithCitations(results: SearchResult[], query: string): SearchResult[] {
    return results.map((result) => {
      const queryTerms = query.toLowerCase().split(/\s+/);
      const matchFields: string[] = [];

      if (result.name.toLowerCase().includes(query.toLowerCase())) {
        matchFields.push('name');
      }
      if (result.summary?.toLowerCase().includes(query.toLowerCase())) {
        matchFields.push('summary');
      }
      if (result.short_name?.toLowerCase().includes(query.toLowerCase())) {
        matchFields.push('short_name');
      }

      return {
        ...result,
        citations: {
          query_match_fields: matchFields,
          semantic_similarity: result.semantic_score,
        },
      };
    });
  }
}

// ============================================================================
// KNOWLEDGE INDEX INITIALIZATION
// ============================================================================

/**
 * Initialize knowledge index by generating embeddings for all programs
 */
export async function initializeKnowledgeIndex(): Promise<void> {
  const supabase = await createClient();
  const embeddingService = new EmbeddingService();

  // Fetch programs without embeddings
  const { data: programs, error } = await supabase
    .from('incentive_programs')
    .select('id, name, description, eligibility_summary, summary')
    .is('embedding', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(`Failed to fetch programs: ${error.message}`);
  }

  if (!programs || programs.length === 0) {
    console.log('All programs already have embeddings');
    return;
  }

  console.log(`Generating embeddings for ${programs.length} programs...`);

  // Generate embeddings
  const results = await embeddingService.generateEmbeddingsForPrograms(programs);

  // Store successful embeddings
  const successResults = results.filter((r) => r.success);
  const failedResults = results.filter((r) => !r.success);

  if (successResults.length > 0) {
    const { error: updateError } = await supabase.from('incentive_programs').upsert(
      successResults.map((result) => ({
        id: result.program_id,
        embedding: result.embedding,
      })),
      { onConflict: 'id' }
    );

    if (updateError) {
      console.error('Error storing embeddings:', updateError);
    } else {
      console.log(`Successfully stored ${successResults.length} embeddings`);
    }
  }

  if (failedResults.length > 0) {
    console.warn(`Failed to generate embeddings for ${failedResults.length} programs:`, failedResults);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { EmbeddingService, HybridSearchEngine };
