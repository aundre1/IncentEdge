-- Migration 015: Incentive Program Source Tracking
-- Adds support for linking extracted incentive programs back to source documents
-- Date: 2026-02-24

-- ============================================================================
-- TABLE: incentive_program_sources
-- ============================================================================
-- Tracks which source documents were used to populate incentive_programs records
-- Provides audit trail and allows re-extraction/updates

create table incentive_program_sources (
  id uuid primary key default gen_random_uuid(),
  -- Foreign keys
  program_id uuid references incentive_programs(id) on delete set null,
  document_id uuid references documents(id) on delete cascade,
  extraction_job_id uuid references background_jobs(id) on delete set null,

  -- Source info
  source_url text,
  source_type text default 'pdf', -- 'pdf', 'url', 'spreadsheet', etc.

  -- Extraction status tracking
  extraction_status text default 'pending', -- 'pending', 'processing', 'completed', 'needs_review', 'failed'
  extracted_programs_count int default 0,
  extracted_at timestamptz,

  -- AI confidence & metadata
  confidence_score numeric(3,2), -- 0.00 to 1.00
  low_confidence_fields text[], -- Fields flagged for manual review

  -- Raw extraction data (stored for audit/re-processing)
  raw_extraction jsonb,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Indexes for common queries
  constraint extracted_programs_count_check check (extracted_programs_count >= 0),
  constraint confidence_score_range check (confidence_score >= 0 and confidence_score <= 1)
);

create index idx_incentive_program_sources_program_id on incentive_program_sources(program_id);
create index idx_incentive_program_sources_document_id on incentive_program_sources(document_id);
create index idx_incentive_program_sources_job_id on incentive_program_sources(extraction_job_id);
create index idx_incentive_program_sources_status on incentive_program_sources(extraction_status);
create index idx_incentive_program_sources_created_at on incentive_program_sources(created_at);

-- ============================================================================
-- COLUMNS: ADD TO incentive_programs TABLE
-- ============================================================================
-- Track source and confidence for each program

alter table incentive_programs
  add column if not exists source_document_id uuid references documents(id) on delete set null,
  add column if not exists extraction_confidence numeric(3,2),
  add column if not exists needs_review boolean default false,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

create index if not exists idx_incentive_programs_source_document_id
  on incentive_programs(source_document_id);
create index if not exists idx_incentive_programs_needs_review
  on incentive_programs(needs_review) where needs_review = true;

-- ============================================================================
-- FUNCTION: trigger_incentive_program_sources_updated_at
-- ============================================================================
-- Auto-update the updated_at timestamp

create or replace function trigger_incentive_program_sources_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger incentive_program_sources_updated_at_trigger
  before update on incentive_program_sources
  for each row
  execute function trigger_incentive_program_sources_updated_at();

-- ============================================================================
-- VIEW: v_incentive_program_extraction_status
-- ============================================================================
-- Dashboard view showing extraction status and summary

create or replace view v_incentive_program_extraction_status as
select
  ips.id as source_id,
  ips.extraction_status,
  ips.extracted_programs_count,
  ips.confidence_score,
  ips.low_confidence_fields,
  count(ip.id) as total_linked_programs,
  sum(case when ip.needs_review then 1 else 0 end) as programs_needing_review,
  ips.created_at,
  ips.updated_at
from incentive_program_sources ips
left join incentive_programs ip on ip.source_document_id = ips.document_id
group by ips.id, ips.extraction_status, ips.extracted_programs_count,
         ips.confidence_score, ips.low_confidence_fields, ips.created_at, ips.updated_at;

-- ============================================================================
-- FUNCTION: get_extraction_stats
-- ============================================================================
-- Get extraction statistics for monitoring dashboard

create or replace function get_extraction_stats()
returns jsonb as $$
begin
  return jsonb_build_object(
    'total_extractions', (select count(*) from incentive_program_sources),
    'completed_extractions', (select count(*) from incentive_program_sources where extraction_status = 'completed'),
    'pending_extractions', (select count(*) from incentive_program_sources where extraction_status = 'pending'),
    'needs_review', (select count(*) from incentive_programs where needs_review = true),
    'avg_confidence', (select round(avg(confidence_score)::numeric, 2) from incentive_program_sources where confidence_score is not null),
    'total_programs_extracted', (select coalesce(sum(extracted_programs_count), 0) from incentive_program_sources)
  );
end;
$$ language plpgsql;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

alter table incentive_program_sources enable row level security;

-- Workspace isolation: users only see sources from their organization
create policy "workspace_isolation" on incentive_program_sources
  for all using (
    document_id in (
      select id from documents
      where organization_id in (
        select id from organizations
        where id = (
          select organization_id from profiles
          where id = auth.uid()
        )
      )
    )
  );

-- Allow organization admins to create/update
create policy "allow_organization_admin" on incentive_program_sources
  for all using (
    document_id in (
      select id from documents
      where organization_id in (
        select organization_id from team_roles
        where user_id = auth.uid() and role = 'admin'
      )
    )
  );
