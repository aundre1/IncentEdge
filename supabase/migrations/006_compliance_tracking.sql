-- IncentEdge Database Schema
-- Migration: 006_compliance_tracking
-- Description: Comprehensive compliance tracking for IRA and incentive requirements
-- Date: 2026-01-09

-- ============================================================================
-- COMPLIANCE REQUIREMENT STATUS ENUM
-- ============================================================================
CREATE TYPE compliance_status AS ENUM (
    'not_started',
    'in_progress',
    'pending_review',
    'verified',
    'non_compliant',
    'waived',
    'expired'
);

CREATE TYPE compliance_category AS ENUM (
    'prevailing_wage',
    'domestic_content',
    'apprenticeship',
    'energy_community',
    'low_income_community',
    'environmental',
    'reporting',
    'certification',
    'documentation',
    'other'
);

CREATE TYPE verification_method AS ENUM (
    'self_attestation',
    'third_party_certification',
    'government_verification',
    'audit',
    'documentation_review',
    'site_inspection',
    'automated_check'
);

-- ============================================================================
-- COMPLIANCE REQUIREMENTS TABLE
-- Master table defining requirements per incentive program
-- ============================================================================
CREATE TABLE compliance_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incentive_program_id UUID REFERENCES incentive_programs(id) ON DELETE CASCADE,
    -- Requirement Details
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    description TEXT,
    category compliance_category NOT NULL,
    -- IRA Specific Flags
    is_ira_requirement BOOLEAN DEFAULT false,
    ira_bonus_type VARCHAR(50), -- 'prevailing_wage', 'domestic_content', 'energy_community', 'low_income'
    bonus_percentage DECIMAL(5,4), -- 0.10 = 10% bonus
    -- Requirement Specifications
    requirement_type VARCHAR(50), -- threshold, certification, documentation, ongoing
    threshold_value DECIMAL(15,4),
    threshold_unit VARCHAR(50), -- percentage, hours, dollars, etc.
    threshold_operator VARCHAR(10), -- >=, <=, =, >, <
    -- Timing
    timing_requirement VARCHAR(50), -- pre_construction, during_construction, post_construction, ongoing
    verification_frequency VARCHAR(50), -- once, monthly, quarterly, annually
    due_date_offset_days INTEGER, -- Days before/after project milestone
    due_date_milestone VARCHAR(50), -- project_start, project_end, placed_in_service, etc.
    -- Verification
    verification_method verification_method NOT NULL DEFAULT 'documentation_review',
    required_documents TEXT[], -- List of required document types
    certifying_authority VARCHAR(255), -- Who can certify compliance
    -- Penalties
    non_compliance_penalty TEXT,
    recapture_risk BOOLEAN DEFAULT false,
    recapture_period_years INTEGER,
    -- Guidance
    guidance_url TEXT,
    form_number VARCHAR(50), -- IRS form number if applicable
    -- Status
    is_active BOOLEAN DEFAULT true,
    effective_date DATE,
    expiration_date DATE,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT COMPLIANCE ITEMS TABLE
-- Tracks compliance status for each requirement on a specific project
-- ============================================================================
CREATE TABLE project_compliance_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    compliance_requirement_id UUID REFERENCES compliance_requirements(id) ON DELETE SET NULL,
    incentive_program_id UUID REFERENCES incentive_programs(id) ON DELETE SET NULL,
    -- Custom Requirements (for project-specific requirements)
    custom_name VARCHAR(255),
    custom_description TEXT,
    category compliance_category NOT NULL,
    -- Status
    status compliance_status DEFAULT 'not_started',
    status_history JSONB DEFAULT '[]', -- [{status, timestamp, user_id, note}]
    -- Current Values
    current_value DECIMAL(15,4),
    target_value DECIMAL(15,4),
    value_unit VARCHAR(50),
    compliance_percentage DECIMAL(5,2), -- 0-100
    -- Verification
    verification_method verification_method,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    -- Dates
    due_date DATE,
    completed_date DATE,
    next_review_date DATE,
    -- IRA Bonus Tracking
    bonus_at_risk DECIMAL(15,2), -- Dollar amount of bonus at risk if non-compliant
    bonus_secured BOOLEAN DEFAULT false,
    -- Priority & Risk
    priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    days_until_due INTEGER GENERATED ALWAYS AS (
        CASE WHEN due_date IS NOT NULL THEN due_date - CURRENT_DATE ELSE NULL END
    ) STORED,
    -- Notes
    internal_notes TEXT,
    action_items JSONB DEFAULT '[]', -- [{item, assigned_to, due_date, completed}]
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique constraint
    UNIQUE(project_id, compliance_requirement_id)
);

-- ============================================================================
-- COMPLIANCE DOCUMENTS TABLE
-- Documents proving compliance
-- ============================================================================
CREATE TABLE compliance_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    compliance_item_id UUID REFERENCES project_compliance_items(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Document Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(100) NOT NULL, -- certified_payroll, manufacturer_cert, affidavit, etc.
    category compliance_category,
    -- Storage
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    file_hash VARCHAR(64), -- SHA-256 hash for integrity
    -- Document Period
    period_start DATE,
    period_end DATE,
    reporting_period VARCHAR(50), -- weekly, monthly, quarterly, annual
    -- Verification
    is_certified BOOLEAN DEFAULT false,
    certified_by VARCHAR(255), -- Name of certifying person/entity
    certification_date DATE,
    certification_type VARCHAR(100), -- notarized, self_certified, third_party
    -- Review
    review_status VARCHAR(30) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    -- Expiration
    expiration_date DATE,
    renewal_reminder_days INTEGER DEFAULT 30,
    -- AI Processing
    ai_extracted_data JSONB,
    ai_confidence_score DECIMAL(3,2),
    ai_processed_at TIMESTAMPTZ,
    -- Version Control
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES compliance_documents(id),
    is_current BOOLEAN DEFAULT true,
    -- Metadata
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPLIANCE CERTIFICATIONS TABLE
-- Third-party certifications and attestations
-- ============================================================================
CREATE TABLE compliance_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    compliance_item_id UUID REFERENCES project_compliance_items(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Certification Details
    certification_type VARCHAR(100) NOT NULL, -- prevailing_wage_cert, domestic_content_cert, energy_community_cert, etc.
    certification_name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Certifying Party
    certifying_organization VARCHAR(255) NOT NULL,
    certifier_name VARCHAR(255),
    certifier_title VARCHAR(100),
    certifier_contact_email VARCHAR(255),
    certifier_contact_phone VARCHAR(20),
    certifier_license_number VARCHAR(100),
    -- Certification Status
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'revoked', 'suspended')),
    -- Dates
    issue_date DATE NOT NULL,
    effective_date DATE,
    expiration_date DATE,
    last_renewal_date DATE,
    -- Coverage
    coverage_details JSONB, -- What specifically is covered
    coverage_amount DECIMAL(15,2), -- Dollar amount covered if applicable
    coverage_percentage DECIMAL(5,2), -- Percentage covered
    -- IRA Specific
    ira_form_reference VARCHAR(50), -- IRS form used
    ira_bonus_certified BOOLEAN DEFAULT false,
    ira_bonus_type VARCHAR(50),
    ira_bonus_percentage DECIMAL(5,4),
    -- Document Reference
    certificate_document_id UUID REFERENCES compliance_documents(id),
    supporting_documents UUID[], -- Array of related document IDs
    -- Verification Chain
    verification_chain JSONB DEFAULT '[]', -- [{verifier, date, method, result}]
    -- Audit Trail
    audit_notes TEXT,
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PREVAILING WAGE RECORDS TABLE
-- Detailed tracking for IRA prevailing wage requirements
-- ============================================================================
CREATE TABLE prevailing_wage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    compliance_item_id UUID REFERENCES project_compliance_items(id) ON DELETE SET NULL,
    -- Reporting Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    reporting_week INTEGER, -- Week number for weekly reporting
    -- Contractor Information
    contractor_name VARCHAR(255) NOT NULL,
    contractor_ein VARCHAR(20),
    contractor_type VARCHAR(50), -- prime, sub_tier_1, sub_tier_2, etc.
    prime_contractor_id UUID REFERENCES prevailing_wage_records(id), -- For subs
    -- Labor Classification
    labor_classification VARCHAR(255) NOT NULL, -- DOL classification
    labor_classification_code VARCHAR(50),
    craft_trade VARCHAR(100), -- carpenter, electrician, plumber, etc.
    -- Location
    work_location VARCHAR(255),
    county VARCHAR(100),
    state VARCHAR(2),
    davis_bacon_wage_determination VARCHAR(50), -- DOL wage determination number
    -- Hours & Wages
    total_hours DECIMAL(10,2) NOT NULL,
    regular_hours DECIMAL(10,2),
    overtime_hours DECIMAL(10,2),
    base_hourly_rate DECIMAL(10,2) NOT NULL,
    fringe_hourly_rate DECIMAL(10,2),
    total_hourly_rate DECIMAL(10,2) NOT NULL,
    prevailing_wage_rate DECIMAL(10,2) NOT NULL, -- Required rate per DOL
    -- Compliance Check
    is_compliant BOOLEAN GENERATED ALWAYS AS (total_hourly_rate >= prevailing_wage_rate) STORED,
    wage_differential DECIMAL(10,2) GENERATED ALWAYS AS (total_hourly_rate - prevailing_wage_rate) STORED,
    -- Wages Paid
    gross_wages_paid DECIMAL(15,2),
    fringe_benefits_paid DECIMAL(15,2),
    total_compensation DECIMAL(15,2),
    -- Certified Payroll
    certified_payroll_submitted BOOLEAN DEFAULT false,
    certified_payroll_document_id UUID REFERENCES compliance_documents(id),
    payroll_certification_date DATE,
    -- Apprenticeship (if applicable)
    is_apprentice BOOLEAN DEFAULT false,
    apprentice_ratio_compliant BOOLEAN,
    registered_apprenticeship_program VARCHAR(255),
    apprenticeship_registration_number VARCHAR(100),
    -- Verification
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    verification_method verification_method,
    verification_notes TEXT,
    -- Issues
    has_issues BOOLEAN DEFAULT false,
    issue_description TEXT,
    issue_resolved BOOLEAN,
    resolution_date DATE,
    resolution_notes TEXT,
    -- Metadata
    submitted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOMESTIC CONTENT TRACKING TABLE
-- Detailed tracking for IRA domestic content requirements
-- ============================================================================
CREATE TABLE domestic_content_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    compliance_item_id UUID REFERENCES project_compliance_items(id) ON DELETE SET NULL,
    -- Component Details
    component_name VARCHAR(255) NOT NULL,
    component_type VARCHAR(100) NOT NULL, -- steel, iron, manufactured_product
    component_category VARCHAR(100), -- structural, electrical, mechanical, etc.
    product_description TEXT,
    -- Manufacturer Information
    manufacturer_name VARCHAR(255),
    manufacturer_location_country VARCHAR(100),
    manufacturer_location_state VARCHAR(100),
    manufacturer_location_city VARCHAR(100),
    manufacturer_facility_id VARCHAR(100),
    -- Origin Classification
    origin_country VARCHAR(100) NOT NULL,
    is_us_manufactured BOOLEAN NOT NULL,
    is_us_mined_produced BOOLEAN, -- For steel/iron
    -- Steel/Iron Specific
    steel_iron_origin VARCHAR(50) CHECK (steel_iron_origin IN ('us_melted_poured', 'us_manufactured', 'foreign', 'mixed')),
    steel_iron_percentage_us DECIMAL(5,2),
    -- Manufactured Product Specific
    manufacturing_process_location VARCHAR(100),
    us_component_percentage DECIMAL(5,2),
    adjusted_percentage DECIMAL(5,2), -- After applying cost adjustments
    -- Cost Values
    total_component_cost DECIMAL(15,2) NOT NULL,
    us_content_cost DECIMAL(15,2),
    foreign_content_cost DECIMAL(15,2),
    -- Thresholds (IRA requirements vary by year)
    applicable_threshold_percentage DECIMAL(5,2), -- 40% in 2024, increasing to 55%
    threshold_year INTEGER,
    meets_threshold BOOLEAN,
    -- Certification
    manufacturer_certification_received BOOLEAN DEFAULT false,
    manufacturer_certification_date DATE,
    manufacturer_certification_document_id UUID REFERENCES compliance_documents(id),
    certification_affidavit TEXT,
    -- Alternative Compliance (if US content not available)
    alternative_compliance_used BOOLEAN DEFAULT false,
    alternative_compliance_type VARCHAR(100), -- waiver, increase_other_component, etc.
    alternative_compliance_justification TEXT,
    -- Verification
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    verification_method verification_method,
    verification_notes TEXT,
    -- Supply Chain Documentation
    supply_chain_documentation JSONB, -- [{supplier, tier, location, certification}]
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- APPRENTICESHIP RECORDS TABLE
-- Track apprenticeship requirements for IRA bonus
-- ============================================================================
CREATE TABLE apprenticeship_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    compliance_item_id UUID REFERENCES project_compliance_items(id) ON DELETE SET NULL,
    -- Reporting Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    -- Contractor Information
    contractor_name VARCHAR(255) NOT NULL,
    contractor_ein VARCHAR(20),
    -- Apprenticeship Program
    program_name VARCHAR(255) NOT NULL,
    program_registration_number VARCHAR(100),
    program_sponsor VARCHAR(255),
    program_type VARCHAR(50), -- registered, non_registered
    dol_approved BOOLEAN DEFAULT false,
    state_approved_state VARCHAR(2),
    -- Hours Summary
    total_labor_hours DECIMAL(12,2) NOT NULL,
    apprentice_hours DECIMAL(12,2) NOT NULL,
    journeyworker_hours DECIMAL(12,2),
    -- Ratio Calculation
    apprentice_ratio DECIMAL(5,4) GENERATED ALWAYS AS (
        CASE WHEN total_labor_hours > 0 THEN apprentice_hours / total_labor_hours ELSE 0 END
    ) STORED,
    required_ratio DECIMAL(5,4) NOT NULL DEFAULT 0.125, -- 12.5% IRA requirement
    ratio_compliant BOOLEAN GENERATED ALWAYS AS (
        CASE WHEN total_labor_hours > 0
        THEN (apprentice_hours / total_labor_hours) >= 0.125
        ELSE false END
    ) STORED,
    -- Apprentice Details
    apprentice_count INTEGER,
    apprentice_details JSONB DEFAULT '[]', -- [{name, program, hours, trade, start_date}]
    -- Good Faith Effort (if ratio not met)
    good_faith_effort_claimed BOOLEAN DEFAULT false,
    good_faith_effort_documentation JSONB,
    good_faith_effort_approved BOOLEAN,
    -- Verification
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    verification_notes TEXT,
    -- Metadata
    submitted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENERGY COMMUNITY ELIGIBILITY TABLE
-- Track energy community bonus eligibility by census tract
-- ============================================================================
CREATE TABLE energy_community_eligibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- Location
    census_tract VARCHAR(20) NOT NULL,
    state VARCHAR(2) NOT NULL,
    county VARCHAR(100),
    -- Eligibility Categories
    brownfield_site BOOLEAN DEFAULT false,
    brownfield_documentation TEXT,
    -- Statistical Area Category
    in_statistical_area BOOLEAN DEFAULT false,
    statistical_area_name VARCHAR(255),
    statistical_area_type VARCHAR(50), -- MSA, non-MSA
    -- Employment Criteria
    fossil_fuel_employment_threshold_met BOOLEAN DEFAULT false,
    fossil_fuel_employment_percentage DECIMAL(5,2),
    fossil_fuel_employment_source VARCHAR(100),
    -- Unemployment Criteria
    unemployment_rate DECIMAL(5,2),
    national_unemployment_rate DECIMAL(5,2),
    unemployment_threshold_met BOOLEAN DEFAULT false,
    -- Coal Criteria
    coal_closure_criteria_met BOOLEAN DEFAULT false,
    coal_mine_closure_date DATE,
    coal_plant_closure_date DATE,
    coal_facility_name VARCHAR(255),
    -- Final Eligibility
    is_eligible BOOLEAN DEFAULT false,
    eligibility_category VARCHAR(100), -- brownfield, statistical_area_fossil, coal_closure
    eligibility_determination_date DATE,
    eligibility_source VARCHAR(255), -- IRS, Treasury, DOE
    -- Bonus Value
    bonus_percentage DECIMAL(5,4) DEFAULT 0.10, -- 10% energy community bonus
    -- Verification
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    verification_method VARCHAR(100),
    verification_notes TEXT,
    -- Supporting Documents
    supporting_documents UUID[], -- References to compliance_documents
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique per project
    UNIQUE(project_id, census_tract)
);

-- ============================================================================
-- LOW INCOME COMMUNITY ELIGIBILITY TABLE
-- Track low-income community bonus eligibility
-- ============================================================================
CREATE TABLE low_income_community_eligibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- Location
    census_tract VARCHAR(20) NOT NULL,
    state VARCHAR(2) NOT NULL,
    county VARCHAR(100),
    -- Category Determination
    category VARCHAR(50) NOT NULL CHECK (category IN ('category_1', 'category_2', 'category_3', 'category_4')),
    category_description TEXT,
    -- Category 1: Located in Low-Income Community
    is_low_income_community BOOLEAN DEFAULT false,
    median_income_percentage DECIMAL(5,2), -- % of area median income
    poverty_rate DECIMAL(5,2),
    -- Category 2: Located on Indian Land
    is_indian_land BOOLEAN DEFAULT false,
    tribal_name VARCHAR(255),
    tribal_land_type VARCHAR(100),
    -- Category 3: Part of Qualified Low-Income Residential Building Project
    is_qualified_residential BOOLEAN DEFAULT false,
    residential_building_type VARCHAR(100),
    affordable_housing_percentage DECIMAL(5,2),
    -- Category 4: Part of Qualified Low-Income Economic Benefit Project
    is_economic_benefit_project BOOLEAN DEFAULT false,
    economic_benefit_type VARCHAR(100),
    -- Capacity Limits (for IRA allocations)
    capacity_applied_mw DECIMAL(10,2),
    capacity_allocated_mw DECIMAL(10,2),
    allocation_round INTEGER,
    allocation_date DATE,
    allocation_reference_number VARCHAR(100),
    -- Bonus Value
    bonus_percentage DECIMAL(5,4), -- 10% or 20% depending on category
    -- Application Status
    application_submitted BOOLEAN DEFAULT false,
    application_date DATE,
    application_status VARCHAR(50), -- pending, approved, denied
    approval_date DATE,
    -- Verification
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique per project
    UNIQUE(project_id, census_tract)
);

-- ============================================================================
-- COMPLIANCE SCORE HISTORY TABLE
-- Track compliance scores over time
-- ============================================================================
CREATE TABLE compliance_score_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- Scores
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    prevailing_wage_score INTEGER CHECK (prevailing_wage_score >= 0 AND prevailing_wage_score <= 100),
    domestic_content_score INTEGER CHECK (domestic_content_score >= 0 AND domestic_content_score <= 100),
    apprenticeship_score INTEGER CHECK (apprenticeship_score >= 0 AND apprenticeship_score <= 100),
    documentation_score INTEGER CHECK (documentation_score >= 0 AND documentation_score <= 100),
    -- Status Counts
    total_requirements INTEGER,
    completed_requirements INTEGER,
    in_progress_requirements INTEGER,
    at_risk_requirements INTEGER,
    non_compliant_requirements INTEGER,
    -- Bonus Tracking
    total_potential_bonus DECIMAL(15,2),
    secured_bonus DECIMAL(15,2),
    at_risk_bonus DECIMAL(15,2),
    -- Score Breakdown
    score_breakdown JSONB DEFAULT '{}',
    -- Calculated At
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    calculated_by UUID REFERENCES profiles(id),
    calculation_notes TEXT,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ADD COMPLIANCE FIELDS TO PROJECTS TABLE
-- ============================================================================
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
ADD COLUMN IF NOT EXISTS compliance_status VARCHAR(30) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS last_compliance_check_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS compliance_summary JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ira_bonus_potential DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ira_bonus_secured DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ira_bonus_at_risk DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS prevailing_wage_status VARCHAR(30) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS domestic_content_status VARCHAR(30) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS apprenticeship_status VARCHAR(30) DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS energy_community_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS low_income_community_verified BOOLEAN DEFAULT false;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Compliance Requirements
CREATE INDEX idx_compliance_req_program ON compliance_requirements(incentive_program_id);
CREATE INDEX idx_compliance_req_category ON compliance_requirements(category);
CREATE INDEX idx_compliance_req_ira ON compliance_requirements(is_ira_requirement) WHERE is_ira_requirement = true;

-- Project Compliance Items
CREATE INDEX idx_compliance_items_project ON project_compliance_items(project_id);
CREATE INDEX idx_compliance_items_status ON project_compliance_items(status);
CREATE INDEX idx_compliance_items_due ON project_compliance_items(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_compliance_items_priority ON project_compliance_items(priority_level, due_date);
CREATE INDEX idx_compliance_items_at_risk ON project_compliance_items(project_id) WHERE status NOT IN ('verified', 'waived');

-- Compliance Documents
CREATE INDEX idx_compliance_docs_project ON compliance_documents(project_id);
CREATE INDEX idx_compliance_docs_item ON compliance_documents(compliance_item_id);
CREATE INDEX idx_compliance_docs_type ON compliance_documents(document_type);
CREATE INDEX idx_compliance_docs_expiring ON compliance_documents(expiration_date) WHERE expiration_date IS NOT NULL;

-- Compliance Certifications
CREATE INDEX idx_certifications_project ON compliance_certifications(project_id);
CREATE INDEX idx_certifications_type ON compliance_certifications(certification_type);
CREATE INDEX idx_certifications_status ON compliance_certifications(status);
CREATE INDEX idx_certifications_expiring ON compliance_certifications(expiration_date) WHERE status = 'active';

-- Prevailing Wage Records
CREATE INDEX idx_pw_records_project ON prevailing_wage_records(project_id);
CREATE INDEX idx_pw_records_period ON prevailing_wage_records(period_start, period_end);
CREATE INDEX idx_pw_records_contractor ON prevailing_wage_records(contractor_name);
CREATE INDEX idx_pw_records_noncompliant ON prevailing_wage_records(project_id) WHERE is_compliant = false;
CREATE INDEX idx_pw_records_unverified ON prevailing_wage_records(project_id) WHERE verified = false;

-- Domestic Content Tracking
CREATE INDEX idx_dc_tracking_project ON domestic_content_tracking(project_id);
CREATE INDEX idx_dc_tracking_component ON domestic_content_tracking(component_type);
CREATE INDEX idx_dc_tracking_us ON domestic_content_tracking(project_id, is_us_manufactured);
CREATE INDEX idx_dc_tracking_unverified ON domestic_content_tracking(project_id) WHERE verified = false;

-- Apprenticeship Records
CREATE INDEX idx_apprentice_project ON apprenticeship_records(project_id);
CREATE INDEX idx_apprentice_period ON apprenticeship_records(period_start, period_end);
CREATE INDEX idx_apprentice_noncompliant ON apprenticeship_records(project_id) WHERE ratio_compliant = false;

-- Energy Community Eligibility
CREATE INDEX idx_energy_community_project ON energy_community_eligibility(project_id);
CREATE INDEX idx_energy_community_tract ON energy_community_eligibility(census_tract);
CREATE INDEX idx_energy_community_eligible ON energy_community_eligibility(project_id) WHERE is_eligible = true;

-- Low Income Community Eligibility
CREATE INDEX idx_lic_project ON low_income_community_eligibility(project_id);
CREATE INDEX idx_lic_tract ON low_income_community_eligibility(census_tract);
CREATE INDEX idx_lic_category ON low_income_community_eligibility(category);

-- Compliance Score History
CREATE INDEX idx_score_history_project ON compliance_score_history(project_id);
CREATE INDEX idx_score_history_date ON compliance_score_history(calculated_at DESC);

-- Projects Compliance
CREATE INDEX idx_projects_compliance_status ON projects(compliance_status);
CREATE INDEX idx_projects_compliance_score ON projects(compliance_score DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prevailing_wage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE domestic_content_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE apprenticeship_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_community_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_income_community_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_score_history ENABLE ROW LEVEL SECURITY;

-- Public read for compliance requirements (they're program definitions)
CREATE POLICY "Anyone can view compliance requirements" ON compliance_requirements
    FOR SELECT USING (true);

-- Project compliance items - org members only
CREATE POLICY "Org members can view compliance items" ON project_compliance_items
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org members can manage compliance items" ON project_compliance_items
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Compliance documents - org members only
CREATE POLICY "Org members can view compliance documents" ON compliance_documents
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can manage compliance documents" ON compliance_documents
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Compliance certifications - org members only
CREATE POLICY "Org members can view certifications" ON compliance_certifications
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can manage certifications" ON compliance_certifications
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Prevailing wage records - org members only
CREATE POLICY "Org members can view wage records" ON prevailing_wage_records
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can manage wage records" ON prevailing_wage_records
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Domestic content tracking - org members only
CREATE POLICY "Org members can view domestic content" ON domestic_content_tracking
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can manage domestic content" ON domestic_content_tracking
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Apprenticeship records - org members only
CREATE POLICY "Org members can view apprenticeship records" ON apprenticeship_records
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can manage apprenticeship records" ON apprenticeship_records
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Energy community eligibility - org members only
CREATE POLICY "Org members can view energy community eligibility" ON energy_community_eligibility
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org members can manage energy community eligibility" ON energy_community_eligibility
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Low income community eligibility - org members only
CREATE POLICY "Org members can view lic eligibility" ON low_income_community_eligibility
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org members can manage lic eligibility" ON low_income_community_eligibility
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Compliance score history - org members only
CREATE POLICY "Org members can view score history" ON compliance_score_history
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org members can insert score history" ON compliance_score_history
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamps
CREATE TRIGGER update_compliance_requirements_updated_at BEFORE UPDATE ON compliance_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_items_updated_at BEFORE UPDATE ON project_compliance_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_docs_updated_at BEFORE UPDATE ON compliance_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON compliance_certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pw_records_updated_at BEFORE UPDATE ON prevailing_wage_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dc_tracking_updated_at BEFORE UPDATE ON domestic_content_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apprenticeship_updated_at BEFORE UPDATE ON apprenticeship_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_energy_community_updated_at BEFORE UPDATE ON energy_community_eligibility
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lic_updated_at BEFORE UPDATE ON low_income_community_eligibility
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Calculate Project Compliance Score
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_compliance_score(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_total_items INTEGER;
    v_verified_items INTEGER;
    v_in_progress_items INTEGER;
    v_non_compliant_items INTEGER;
    v_score INTEGER;
    v_pw_score INTEGER;
    v_dc_score INTEGER;
    v_app_score INTEGER;
    v_doc_score INTEGER;
BEGIN
    -- Count compliance items by status
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'verified'),
        COUNT(*) FILTER (WHERE status = 'in_progress'),
        COUNT(*) FILTER (WHERE status = 'non_compliant')
    INTO v_total_items, v_verified_items, v_in_progress_items, v_non_compliant_items
    FROM project_compliance_items
    WHERE project_id = p_project_id;

    -- Calculate base score
    IF v_total_items = 0 THEN
        v_score := 0;
    ELSE
        v_score := (v_verified_items * 100 + v_in_progress_items * 50) / v_total_items;
    END IF;

    -- Calculate prevailing wage score
    SELECT
        CASE
            WHEN COUNT(*) = 0 THEN NULL
            ELSE (COUNT(*) FILTER (WHERE is_compliant = true) * 100 / COUNT(*))
        END
    INTO v_pw_score
    FROM prevailing_wage_records
    WHERE project_id = p_project_id;

    -- Calculate domestic content score
    SELECT
        CASE
            WHEN COUNT(*) = 0 THEN NULL
            ELSE (COUNT(*) FILTER (WHERE meets_threshold = true) * 100 / COUNT(*))
        END
    INTO v_dc_score
    FROM domestic_content_tracking
    WHERE project_id = p_project_id;

    -- Calculate apprenticeship score
    SELECT
        CASE
            WHEN COUNT(*) = 0 THEN NULL
            ELSE (COUNT(*) FILTER (WHERE ratio_compliant = true) * 100 / COUNT(*))
        END
    INTO v_app_score
    FROM apprenticeship_records
    WHERE project_id = p_project_id;

    -- Calculate documentation score
    SELECT
        CASE
            WHEN COUNT(*) = 0 THEN NULL
            ELSE (COUNT(*) FILTER (WHERE review_status = 'approved') * 100 / COUNT(*))
        END
    INTO v_doc_score
    FROM compliance_documents
    WHERE project_id = p_project_id;

    -- Update project with scores
    UPDATE projects
    SET
        compliance_score = v_score,
        compliance_summary = jsonb_build_object(
            'overall_score', v_score,
            'prevailing_wage_score', v_pw_score,
            'domestic_content_score', v_dc_score,
            'apprenticeship_score', v_app_score,
            'documentation_score', v_doc_score,
            'total_items', v_total_items,
            'verified_items', v_verified_items,
            'in_progress_items', v_in_progress_items,
            'non_compliant_items', v_non_compliant_items
        ),
        last_compliance_check_at = NOW()
    WHERE id = p_project_id;

    -- Record score history
    INSERT INTO compliance_score_history (
        project_id,
        overall_score,
        prevailing_wage_score,
        domestic_content_score,
        apprenticeship_score,
        documentation_score,
        total_requirements,
        completed_requirements,
        in_progress_requirements,
        non_compliant_requirements
    ) VALUES (
        p_project_id,
        v_score,
        v_pw_score,
        v_dc_score,
        v_app_score,
        v_doc_score,
        v_total_items,
        v_verified_items,
        v_in_progress_items,
        v_non_compliant_items
    );

    RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Calculate Domestic Content Percentage
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_domestic_content_percentage(p_project_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_total_cost DECIMAL;
    v_us_content_cost DECIMAL;
    v_percentage DECIMAL;
BEGIN
    SELECT
        COALESCE(SUM(total_component_cost), 0),
        COALESCE(SUM(us_content_cost), 0)
    INTO v_total_cost, v_us_content_cost
    FROM domestic_content_tracking
    WHERE project_id = p_project_id;

    IF v_total_cost = 0 THEN
        RETURN 0;
    END IF;

    v_percentage := (v_us_content_cost / v_total_cost) * 100;
    RETURN ROUND(v_percentage, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Get Prevailing Wage Summary
-- ============================================================================
CREATE OR REPLACE FUNCTION get_prevailing_wage_summary(p_project_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_records', COUNT(*),
        'compliant_records', COUNT(*) FILTER (WHERE is_compliant = true),
        'non_compliant_records', COUNT(*) FILTER (WHERE is_compliant = false),
        'verified_records', COUNT(*) FILTER (WHERE verified = true),
        'unverified_records', COUNT(*) FILTER (WHERE verified = false),
        'total_hours', COALESCE(SUM(total_hours), 0),
        'total_wages_paid', COALESCE(SUM(total_compensation), 0),
        'compliance_rate', CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(*) FILTER (WHERE is_compliant = true)::DECIMAL / COUNT(*)) * 100, 2)
        END,
        'contractors', (
            SELECT jsonb_agg(DISTINCT contractor_name)
            FROM prevailing_wage_records
            WHERE project_id = p_project_id
        )
    )
    INTO v_result
    FROM prevailing_wage_records
    WHERE project_id = p_project_id;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA: IRA Compliance Requirements
-- ============================================================================
INSERT INTO compliance_requirements (
    name, short_name, description, category, is_ira_requirement, ira_bonus_type,
    bonus_percentage, requirement_type, threshold_value, threshold_unit,
    threshold_operator, timing_requirement, verification_frequency,
    verification_method, required_documents, guidance_url
) VALUES
-- Prevailing Wage Requirements
(
    'Prevailing Wage Requirement',
    'Prevailing Wage',
    'All laborers and mechanics employed by contractors and subcontractors in the construction of the facility must be paid wages at rates not less than the prevailing rates for construction, alteration, or repair of a similar character in the locality.',
    'prevailing_wage',
    true,
    'prevailing_wage',
    0.30, -- 30% bonus (5x multiplier from 6% to 30%)
    'ongoing',
    100,
    'percentage',
    '>=',
    'during_construction',
    'weekly',
    'documentation_review',
    ARRAY['certified_payroll', 'wage_determination', 'contractor_certification'],
    'https://www.irs.gov/credits-deductions/prevailing-wage-and-apprenticeship-requirements'
),
-- Apprenticeship Requirements
(
    'Apprenticeship Requirement',
    'Apprenticeship',
    'A minimum percentage of total labor hours must be performed by qualified apprentices. The required percentage is 12.5% for projects beginning construction in 2023 and 15% for projects beginning in 2024 and later.',
    'apprenticeship',
    true,
    'prevailing_wage',
    0.30,
    'threshold',
    12.5,
    'percentage',
    '>=',
    'during_construction',
    'monthly',
    'documentation_review',
    ARRAY['apprenticeship_records', 'program_registration', 'labor_hour_reports'],
    'https://www.irs.gov/credits-deductions/prevailing-wage-and-apprenticeship-requirements'
),
-- Domestic Content - Steel/Iron
(
    'Domestic Content - Steel and Iron',
    'Steel/Iron Content',
    'All steel and iron used in the project must be produced in the United States. This means all manufacturing processes, from the initial melting stage through application of coatings, occurred in the United States.',
    'domestic_content',
    true,
    'domestic_content',
    0.10,
    'threshold',
    100,
    'percentage',
    '>=',
    'during_construction',
    'once',
    'third_party_certification',
    ARRAY['manufacturer_certification', 'mill_certificates', 'supply_chain_affidavit'],
    'https://www.irs.gov/credits-deductions/domestic-content-bonus-credit'
),
-- Domestic Content - Manufactured Products
(
    'Domestic Content - Manufactured Products',
    'Manufactured Products',
    'The adjusted percentage of the total cost of manufactured products that are mined, produced, or manufactured in the United States must meet the applicable threshold (40% in 2024, increasing annually).',
    'domestic_content',
    true,
    'domestic_content',
    0.10,
    'threshold',
    40,
    'percentage',
    '>=',
    'during_construction',
    'once',
    'third_party_certification',
    ARRAY['manufacturer_certification', 'cost_breakdown', 'origin_documentation'],
    'https://www.irs.gov/credits-deductions/domestic-content-bonus-credit'
),
-- Energy Community
(
    'Energy Community Eligibility',
    'Energy Community',
    'Project must be located in an energy community, which includes: brownfield sites, metropolitan or non-metropolitan statistical areas with high fossil fuel employment, or areas with closed coal mines or coal-fired power plants.',
    'energy_community',
    true,
    'energy_community',
    0.10,
    'certification',
    NULL,
    NULL,
    NULL,
    'pre_construction',
    'once',
    'government_verification',
    ARRAY['census_tract_documentation', 'energy_community_certification'],
    'https://www.irs.gov/credits-deductions/energy-community-bonus-credit'
),
-- Low-Income Community
(
    'Low-Income Community Eligibility',
    'Low-Income Community',
    'Project qualifies for the low-income community bonus adder through one of four categories: located in a low-income community, on Indian land, as part of a qualified low-income residential building project, or as part of a qualified low-income economic benefit project.',
    'low_income_community',
    true,
    'low_income',
    0.20,
    'certification',
    NULL,
    NULL,
    NULL,
    'pre_construction',
    'once',
    'government_verification',
    ARRAY['census_tract_documentation', 'lic_application', 'allocation_letter'],
    'https://www.irs.gov/credits-deductions/low-income-communities-bonus-credit'
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE compliance_requirements IS 'Master definitions of compliance requirements per incentive program';
COMMENT ON TABLE project_compliance_items IS 'Project-specific tracking of compliance requirement status';
COMMENT ON TABLE compliance_documents IS 'Documents proving compliance with requirements';
COMMENT ON TABLE compliance_certifications IS 'Third-party certifications and attestations';
COMMENT ON TABLE prevailing_wage_records IS 'Detailed prevailing wage tracking for IRA bonus eligibility';
COMMENT ON TABLE domestic_content_tracking IS 'Component-level domestic content verification';
COMMENT ON TABLE apprenticeship_records IS 'Apprenticeship ratio tracking for IRA bonus eligibility';
COMMENT ON TABLE energy_community_eligibility IS 'Energy community bonus eligibility by census tract';
COMMENT ON TABLE low_income_community_eligibility IS 'Low-income community bonus eligibility tracking';
COMMENT ON TABLE compliance_score_history IS 'Historical record of project compliance scores';
COMMENT ON FUNCTION calculate_compliance_score IS 'Calculate and update overall compliance score for a project';
COMMENT ON FUNCTION calculate_domestic_content_percentage IS 'Calculate US domestic content percentage for a project';
COMMENT ON FUNCTION get_prevailing_wage_summary IS 'Get summary statistics for prevailing wage compliance';
