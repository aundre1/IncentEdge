import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// VALIDATION
// ============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SECTION_TYPES = [
  'project_description',
  'need_statement',
  'budget_narrative',
  'impact_statement',
  'organizational_capacity',
] as const;

type SectionType = (typeof SECTION_TYPES)[number];

const requestSchema = z.object({
  projectId: z.string().regex(UUID_REGEX, 'Invalid project UUID'),
  programId: z.string().regex(UUID_REGEX, 'Invalid program UUID'),
  sectionType: z.enum(SECTION_TYPES),
  additionalContext: z.string().max(2000).optional(),
});

// ============================================================================
// SECTION PROMPTS
// ============================================================================

const SECTION_INSTRUCTIONS: Record<SectionType, string> = {
  project_description: `Write a compelling Project Description section for a grant application.
Include:
- Clear overview of the project scope, scale, and location
- Key design features and technical approach
- Timeline and milestones
- How the project aligns with the funding program's stated objectives
- Quantitative metrics (square footage, units, capacity, etc.)
Keep the language professional yet persuasive. 300-500 words.`,

  need_statement: `Write a compelling Statement of Need section for a grant application.
Include:
- Data-driven assessment of the problem the project addresses
- Local/regional context and community impact
- Gap analysis — what exists today and what is missing
- Why this project is urgently needed
- How failure to act would affect the community
Use specific statistics and references where appropriate. 250-400 words.`,

  budget_narrative: `Write a clear Budget Narrative section for a grant application.
Include:
- Overview of total project costs and funding sources
- Breakdown of how the requested grant funds will be allocated
- Explanation of cost reasonableness and market comparisons
- Match funding sources and commitments
- Cost containment measures and value engineering
Be precise with numbers but also explain the strategic rationale. 300-500 words.`,

  impact_statement: `Write a powerful Impact Statement section for a grant application.
Include:
- Quantified environmental benefits (energy savings, emissions reduction, etc.)
- Economic impact (jobs created, tax revenue, local spending)
- Community and social impact
- Long-term sustainability and replicability
- Alignment with state and federal policy goals
Use concrete numbers and projections. 250-400 words.`,

  organizational_capacity: `Write an Organizational Capacity section for a grant application.
Include:
- Organization's track record with similar projects
- Key team members and their qualifications
- Financial stability and management systems
- Past performance on government contracts/grants
- Partnerships and collaborative relationships
Project confidence and competence. 250-400 words.`,
};

const SECTION_LABELS: Record<SectionType, string> = {
  project_description: 'Project Description',
  need_statement: 'Statement of Need',
  budget_narrative: 'Budget Narrative',
  impact_statement: 'Impact Statement',
  organizational_capacity: 'Organizational Capacity',
};

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // ------------------------------------------------------------------
    // Auth check
    // ------------------------------------------------------------------
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ------------------------------------------------------------------
    // Parse & validate body
    // ------------------------------------------------------------------
    const body: unknown = await request.json();
    const validation = requestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 },
      );
    }

    const { projectId, programId, sectionType, additionalContext } =
      validation.data;

    // ------------------------------------------------------------------
    // Fetch project details
    // ------------------------------------------------------------------
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 },
      );
    }

    // ------------------------------------------------------------------
    // Fetch program details
    // ------------------------------------------------------------------
    const { data: program, error: programError } = await supabase
      .from('incentive_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (programError || !program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 },
      );
    }

    // ------------------------------------------------------------------
    // Optionally fetch probability score for context
    // ------------------------------------------------------------------
    let probabilityContext = '';
    try {
      const { data: probScore } = await supabase
        .from('probability_scores')
        .select('approval_probability, confidence_level, sample_size')
        .eq('project_id', projectId)
        .eq('program_id', programId)
        .single();

      if (probScore) {
        probabilityContext = `\nHistorical approval probability: ${probScore.approval_probability}% (${probScore.confidence_level} confidence, based on ${probScore.sample_size} applications).`;
      }
    } catch {
      // No cached probability — acceptable
    }

    // ------------------------------------------------------------------
    // Build prompt context from project + program data
    // ------------------------------------------------------------------
    const projectContext = buildProjectContext(project);
    const programContext = buildProgramContext(program);

    // ------------------------------------------------------------------
    // Call Claude claude-sonnet-4-6
    // ------------------------------------------------------------------
    const anthropic = new Anthropic();

    const systemPrompt = `You are an expert grant writer specializing in real estate development incentives and infrastructure finance. You have deep expertise in LIHTC, ITC, NMTC, CDBG, HOME, state energy programs, and municipal incentives.

Your writing is:
- Professional and institutional in tone
- Data-driven with specific numbers
- Tailored to the funding agency's stated priorities
- Persuasive without being aggressive
- Structured with clear paragraphs and logical flow

You are writing a "${SECTION_LABELS[sectionType]}" section for a grant application.

PROJECT DETAILS:
${projectContext}

FUNDING PROGRAM DETAILS:
${programContext}
${probabilityContext}

${additionalContext ? `\nADDITIONAL CONTEXT FROM USER:\n${additionalContext}` : ''}

INSTRUCTIONS:
${SECTION_INSTRUCTIONS[sectionType]}

Write ONLY the narrative section text. Do not include headers, titles, or meta-commentary. Start directly with the content.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Generate the ${SECTION_LABELS[sectionType]} section for this grant application.`,
        },
      ],
      system: systemPrompt,
    });

    // Extract text from response
    const textBlock = response.content.find((block) => block.type === 'text');
    const narrative = textBlock?.text ?? '';
    const wordCount = narrative.split(/\s+/).filter(Boolean).length;

    // Generate suggested revisions
    const suggestedRevisions = generateRevisionSuggestions(
      sectionType,
      wordCount,
    );

    return NextResponse.json({
      narrative,
      sectionType,
      wordCount,
      suggestedRevisions,
      programName: (program.name as string) ?? (program.short_name as string) ?? 'Unknown Program',
    });
  } catch (error) {
    console.error('[grant-writing/narrative] Error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'AI service error', details: error.message },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function buildProjectContext(project: Record<string, unknown>): string {
  const lines: string[] = [];

  if (project.name) lines.push(`Project Name: ${project.name}`);
  if (project.description) lines.push(`Description: ${project.description}`);
  if (project.address_line1) {
    lines.push(
      `Location: ${project.address_line1}, ${project.city ?? ''}, ${project.state ?? ''} ${project.zip_code ?? ''}`,
    );
  }
  if (project.county) lines.push(`County: ${project.county}`);
  if (project.sector_type) lines.push(`Sector: ${project.sector_type}`);
  if (project.building_type) lines.push(`Building Type: ${project.building_type}`);
  if (project.construction_type) lines.push(`Construction: ${project.construction_type}`);
  if (project.total_units) lines.push(`Total Units: ${project.total_units}`);
  if (project.affordable_units)
    lines.push(`Affordable Units: ${project.affordable_units}`);
  if (project.total_sqft)
    lines.push(`Total Sq Ft: ${Number(project.total_sqft).toLocaleString()}`);
  if (project.total_development_cost)
    lines.push(
      `Total Development Cost: $${Number(project.total_development_cost).toLocaleString()}`,
    );
  if (project.target_certification)
    lines.push(`Target Certification: ${project.target_certification}`);
  if (project.domestic_content_eligible)
    lines.push('Domestic Content Eligible: Yes');
  if (project.prevailing_wage_commitment)
    lines.push('Prevailing Wage Commitment: Yes');

  return lines.join('\n');
}

function buildProgramContext(program: Record<string, unknown>): string {
  const lines: string[] = [];

  if (program.name) lines.push(`Program Name: ${program.name}`);
  if (program.short_name) lines.push(`Short Name: ${program.short_name}`);
  if (program.category) lines.push(`Category: ${program.category}`);
  if (program.program_type) lines.push(`Type: ${program.program_type}`);
  if (program.summary) lines.push(`Summary: ${program.summary}`);
  if (program.amount_max)
    lines.push(`Maximum Award: $${Number(program.amount_max).toLocaleString()}`);
  if (program.amount_type) lines.push(`Amount Type: ${program.amount_type}`);
  if (program.state) lines.push(`State: ${program.state}`);
  if (program.jurisdiction_level)
    lines.push(`Jurisdiction: ${program.jurisdiction_level}`);
  if (program.administrator)
    lines.push(`Administered by: ${program.administrator}`);
  if (program.application_deadline)
    lines.push(`Deadline: ${program.application_deadline}`);

  return lines.join('\n');
}

function generateRevisionSuggestions(
  sectionType: SectionType,
  wordCount: number,
): string[] {
  const suggestions: string[] = [];

  if (wordCount < 250) {
    suggestions.push(
      'Consider adding more detail to strengthen this section.',
    );
  }

  switch (sectionType) {
    case 'project_description':
      suggestions.push(
        'Consider adding specific timeline milestones with dates.',
      );
      suggestions.push(
        'Include any letters of support or community endorsements.',
      );
      break;
    case 'need_statement':
      suggestions.push(
        'Strengthen with local demographic data and census statistics.',
      );
      suggestions.push(
        'Add comparison to peer communities or benchmark data.',
      );
      break;
    case 'budget_narrative':
      suggestions.push(
        'Include a summary table of funding sources and uses.',
      );
      suggestions.push(
        'Reference third-party cost estimates or appraisals.',
      );
      break;
    case 'impact_statement':
      suggestions.push(
        'Add year-over-year projections for key impact metrics.',
      );
      suggestions.push(
        'Reference alignment with specific federal or state policy goals.',
      );
      break;
    case 'organizational_capacity':
      suggestions.push(
        'Include specific past project names, sizes, and outcomes.',
      );
      suggestions.push(
        'Mention relevant certifications or professional designations.',
      );
      break;
  }

  return suggestions;
}
