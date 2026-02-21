-- IncentEdge Database Schema
-- Migration: 003_documents_eligibility
-- Description: Document management and eligibility rules engine
-- Date: 2026-01-09

-- ============================================================================
-- DOCUMENT STORAGE AND MANAGEMENT
-- ============================================================================

-- Document Status Enum
CREATE TYPE document_status AS ENUM (
    'uploading',
    'processing',
    'ready',
    'failed',
    'archived',
    'deleted'
);

-- Document Category Enum
CREATE TYPE document_category AS ENUM (
    'pro_forma',
    'site_plan',
    'architectural_drawings',
    'energy_model',
    'certification',
    'permit',
    'utility_bill',
    'tax_document',
    'legal',
    'contract',
    'application',
    'correspondence',
    'report',
    'photo',
    'other'
);

-- ============================================================================
-- DOCUMENTS TABLE
-- Main document storage with metadata
-- NOTE: Drops and recreates the basic documents table from 001 with enhanced schema
-- ============================================================================

-- Drop the basic documents table from 001_initial_schema
-- This is safe during initial migration; for production, use ALTER TABLE instead
DROP TABLE IF EXISTS documents CASCADE;

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    -- File Information
    name VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    description TEXT,
    category document_category NOT NULL DEFAULT 'other',
    -- Storage
    storage_path TEXT NOT NULL,
    storage_bucket VARCHAR(100) DEFAULT 'documents',
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    file_extension VARCHAR(20),
    -- Integrity
    checksum_sha256 VARCHAR(64),
    checksum_verified_at TIMESTAMPTZ,
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    is_current_version BOOLEAN DEFAULT true,
    -- Status
    status document_status DEFAULT 'uploading',
    status_message TEXT,
    -- Processing
    needs_processing BOOLEAN DEFAULT false,
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_error TEXT,
    -- AI Extraction
    ai_extraction_enabled BOOLEAN DEFAULT true,
    ai_extraction_status VARCHAR(30) DEFAULT 'pending',
    ai_extraction_started_at TIMESTAMPTZ,
    ai_extraction_completed_at TIMESTAMPTZ,
    ai_extracted_data JSONB DEFAULT '{}',
    ai_confidence_score DECIMAL(3,2),
    ai_extraction_model VARCHAR(100),
    ai_tokens_used INTEGER,
    -- Access Control
    is_public BOOLEAN DEFAULT false,
    access_level VARCHAR(20) DEFAULT 'organization' CHECK (access_level IN ('private', 'project', 'organization', 'public')),
    shared_with UUID[] DEFAULT '{}',
    -- Expiration
    expires_at TIMESTAMPTZ,
    expiration_reminder_sent BOOLEAN DEFAULT false,
    -- Tags & Search
    tags TEXT[] DEFAULT '{}',
    search_text TEXT, -- Full-text search content
    -- Metadata
    custom_metadata JSONB DEFAULT '{}',
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENT EXTRACTIONS TABLE
-- Stores specific data extracted from documents by AI
-- ============================================================================
CREATE TABLE document_extractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    -- Extraction Type
    extraction_type VARCHAR(50) NOT NULL, -- pro_forma, site_plan, certification, utility_bill, etc.
    -- Raw Extraction
    raw_extraction JSONB NOT NULL DEFAULT '{}',
    -- Structured Data by Type
    -- Pro Forma Extractions
    pf_total_development_cost DECIMAL(15,2),
    pf_acquisition_cost DECIMAL(15,2),
    pf_hard_costs DECIMAL(15,2),
    pf_soft_costs DECIMAL(15,2),
    pf_financing_costs DECIMAL(15,2),
    pf_contingency DECIMAL(15,2),
    pf_unit_count INTEGER,
    pf_square_footage INTEGER,
    pf_cost_per_unit DECIMAL(15,2),
    pf_cost_per_sqft DECIMAL(15,2),
    pf_irr_levered DECIMAL(6,4),
    pf_irr_unlevered DECIMAL(6,4),
    pf_equity_multiple DECIMAL(6,3),
    pf_noi_year1 DECIMAL(15,2),
    pf_cap_rate_exit DECIMAL(6,4),
    -- Site Plan Extractions
    sp_lot_size_acres DECIMAL(10,4),
    sp_lot_size_sqft DECIMAL(15,2),
    sp_building_footprint_sqft INTEGER,
    sp_far DECIMAL(6,3),
    sp_lot_coverage DECIMAL(5,2),
    sp_parking_spaces INTEGER,
    sp_open_space_sqft INTEGER,
    sp_setbacks JSONB, -- {front, rear, left, right}
    sp_zoning_district VARCHAR(50),
    -- Certification Extractions
    cert_type VARCHAR(100),
    cert_level VARCHAR(100),
    cert_issuer VARCHAR(255),
    cert_issue_date DATE,
    cert_expiration_date DATE,
    cert_score DECIMAL(6,2),
    -- Utility Bill Extractions
    ub_utility_type VARCHAR(50),
    ub_account_number VARCHAR(100),
    ub_billing_period_start DATE,
    ub_billing_period_end DATE,
    ub_usage_amount DECIMAL(15,4),
    ub_usage_unit VARCHAR(20),
    ub_total_cost DECIMAL(15,2),
    ub_rate_per_unit DECIMAL(10,6),
    -- Validation
    validated BOOLEAN DEFAULT false,
    validated_by UUID REFERENCES profiles(id),
    validated_at TIMESTAMPTZ,
    validation_notes TEXT,
    -- Confidence
    overall_confidence DECIMAL(3,2),
    field_confidence JSONB DEFAULT '{}', -- {field_name: confidence_score}
    -- Metadata
    extraction_model VARCHAR(100),
    extraction_duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENT TEMPLATES TABLE
-- Templates for generating documents
-- ============================================================================
CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for system templates
    -- Template Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category document_category NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- application_form, checklist, letter, report
    -- Template Content
    template_content TEXT, -- HTML/Markdown template
    template_schema JSONB DEFAULT '{}', -- JSON schema for template variables
    sample_data JSONB DEFAULT '{}', -- Sample data for preview
    -- Applicability
    incentive_type VARCHAR(50), -- federal, state, local, utility
    incentive_program_ids UUID[] DEFAULT '{}',
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    -- Version
    version INTEGER DEFAULT 1,
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ELIGIBILITY RULES ENGINE
-- ============================================================================

-- Rule Operator Enum
CREATE TYPE rule_operator AS ENUM (
    'equals',
    'not_equals',
    'greater_than',
    'greater_than_or_equals',
    'less_than',
    'less_than_or_equals',
    'contains',
    'not_contains',
    'in_list',
    'not_in_list',
    'between',
    'is_null',
    'is_not_null',
    'matches_regex',
    'starts_with',
    'ends_with',
    'within_radius',
    'in_geography'
);

-- Rule Data Type Enum
CREATE TYPE rule_data_type AS ENUM (
    'string',
    'number',
    'boolean',
    'date',
    'array',
    'geography',
    'currency',
    'percentage'
);

-- ============================================================================
-- ELIGIBILITY RULE SETS TABLE
-- Collections of rules for incentive programs
-- ============================================================================
CREATE TABLE eligibility_rule_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incentive_program_id UUID NOT NULL REFERENCES incentive_programs(id) ON DELETE CASCADE,
    -- Rule Set Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    -- Logic
    match_type VARCHAR(10) DEFAULT 'all' CHECK (match_type IN ('all', 'any', 'custom')),
    custom_logic TEXT, -- For complex boolean expressions
    -- Weight for scoring
    weight DECIMAL(5,2) DEFAULT 1.0,
    -- Status
    is_active BOOLEAN DEFAULT true,
    effective_date DATE,
    expiration_date DATE,
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique per program version
    UNIQUE(incentive_program_id, version)
);

-- ============================================================================
-- ELIGIBILITY RULES TABLE
-- Individual eligibility rules
-- ============================================================================
CREATE TABLE eligibility_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_set_id UUID NOT NULL REFERENCES eligibility_rule_sets(id) ON DELETE CASCADE,
    -- Rule Identity
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_code VARCHAR(50), -- Short identifier like GEO_001
    -- Rule Category
    category VARCHAR(50) NOT NULL, -- geographic, affordability, sustainability, financial, entity, technology
    subcategory VARCHAR(50), -- state, county, census_tract, ami, tier, tdc, etc.
    -- Field to Evaluate
    field_path VARCHAR(255) NOT NULL, -- JSON path to project field, e.g., 'location.state', 'sustainability_tier'
    field_type rule_data_type NOT NULL,
    -- Operator
    operator rule_operator NOT NULL,
    -- Value(s) to Compare
    value_single TEXT, -- For single value comparisons
    value_list TEXT[], -- For in_list, not_in_list
    value_min TEXT, -- For between
    value_max TEXT, -- For between
    value_json JSONB, -- For complex values (geography, etc.)
    -- Priority for display
    display_priority INTEGER DEFAULT 100,
    -- Pass/Fail Labels
    pass_label VARCHAR(255) DEFAULT 'Eligible',
    fail_label VARCHAR(255) DEFAULT 'Not Eligible',
    -- Impact on Eligibility
    is_required BOOLEAN DEFAULT true, -- Required to be eligible
    is_disqualifying BOOLEAN DEFAULT false, -- If true, failing this rule = immediate disqualification
    partial_credit_allowed BOOLEAN DEFAULT false,
    -- Scoring
    weight DECIMAL(5,2) DEFAULT 1.0,
    max_points DECIMAL(10,2) DEFAULT 100,
    -- Documentation
    documentation_required TEXT[],
    guidance_text TEXT,
    help_url TEXT,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RULE CONDITIONS TABLE
-- Complex conditions with AND/OR logic for rules
-- ============================================================================
CREATE TABLE rule_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES eligibility_rules(id) ON DELETE CASCADE,
    parent_condition_id UUID REFERENCES rule_conditions(id) ON DELETE CASCADE,
    -- Condition Type
    condition_type VARCHAR(10) NOT NULL CHECK (condition_type IN ('and', 'or', 'not', 'leaf')),
    -- For leaf conditions
    field_path VARCHAR(255),
    field_type rule_data_type,
    operator rule_operator,
    value_single TEXT,
    value_list TEXT[],
    value_min TEXT,
    value_max TEXT,
    value_json JSONB,
    -- Order
    sort_order INTEGER DEFAULT 0,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GEOGRAPHIC ELIGIBILITY ZONES TABLE
-- Pre-defined geographic areas for eligibility
-- ============================================================================
CREATE TABLE geographic_eligibility_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Zone Identity
    name VARCHAR(255) NOT NULL,
    description TEXT,
    zone_type VARCHAR(50) NOT NULL, -- state, county, city, census_tract, zip, qct, dda, opportunity_zone, energy_community
    -- Geographic Definition
    state VARCHAR(2),
    county VARCHAR(100),
    city VARCHAR(100),
    census_tract VARCHAR(20),
    zip_codes TEXT[],
    fips_code VARCHAR(15),
    -- GeoJSON boundary (if available)
    boundary_geojson JSONB,
    -- Program Association
    incentive_program_ids UUID[] DEFAULT '{}',
    -- Zone Attributes
    attributes JSONB DEFAULT '{}', -- Flexible attributes for zone-specific data
    -- QCT/DDA Specific
    is_qct BOOLEAN DEFAULT false, -- Qualified Census Tract
    is_dda BOOLEAN DEFAULT false, -- Difficult Development Area
    qct_effective_date DATE,
    qct_expiration_date DATE,
    -- Opportunity Zone Specific
    is_opportunity_zone BOOLEAN DEFAULT false,
    oz_designation_date DATE,
    oz_expiration_date DATE,
    -- Energy Community Specific
    is_energy_community BOOLEAN DEFAULT false,
    energy_community_category VARCHAR(100),
    energy_community_effective_date DATE,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Metadata
    data_source VARCHAR(255),
    last_updated DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ELIGIBILITY RESULTS TABLE
-- Stores results of eligibility evaluations
-- ============================================================================
CREATE TABLE eligibility_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    incentive_program_id UUID NOT NULL REFERENCES incentive_programs(id) ON DELETE CASCADE,
    rule_set_id UUID REFERENCES eligibility_rule_sets(id) ON DELETE SET NULL,
    -- Overall Result
    is_eligible BOOLEAN NOT NULL,
    eligibility_score DECIMAL(5,2), -- 0-100 composite score
    confidence_level DECIMAL(3,2), -- Confidence in the result
    -- Match Details
    match_status VARCHAR(30) DEFAULT 'evaluated' CHECK (match_status IN ('pending', 'evaluated', 'needs_review', 'confirmed', 'rejected')),
    match_strength VARCHAR(20), -- strong, moderate, weak
    -- Rule Results
    total_rules INTEGER,
    passed_rules INTEGER,
    failed_rules INTEGER,
    skipped_rules INTEGER,
    -- Detailed Results
    rule_results JSONB DEFAULT '[]', -- [{rule_id, rule_name, passed, score, details, missing_data}]
    -- Missing Information
    missing_data_fields TEXT[],
    missing_data_impact VARCHAR(20), -- none, minor, moderate, critical
    -- Value Estimation
    estimated_value_min DECIMAL(15,2),
    estimated_value_max DECIMAL(15,2),
    estimated_value_most_likely DECIMAL(15,2),
    value_calculation_details JSONB,
    -- IRA Bonus Eligibility
    ira_bonus_eligible BOOLEAN DEFAULT false,
    ira_bonus_types TEXT[], -- prevailing_wage, domestic_content, energy_community, low_income
    ira_bonus_total_percentage DECIMAL(5,4),
    -- Timeline
    application_deadline DATE,
    program_end_date DATE,
    days_until_deadline INTEGER,
    -- User Actions
    user_confirmed BOOLEAN DEFAULT false,
    confirmed_by UUID REFERENCES profiles(id),
    confirmed_at TIMESTAMPTZ,
    user_rejected BOOLEAN DEFAULT false,
    rejection_reason TEXT,
    -- Notes
    internal_notes TEXT,
    evaluation_notes TEXT,
    -- Evaluation Metadata
    evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    evaluated_by_system BOOLEAN DEFAULT true,
    evaluation_duration_ms INTEGER,
    evaluation_engine_version VARCHAR(50),
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique per project-program-ruleset
    UNIQUE(project_id, incentive_program_id, rule_set_id)
);

-- ============================================================================
-- INCENTIVE VALUE CALCULATIONS TABLE
-- Detailed calculations for estimated incentive values
-- ============================================================================
CREATE TABLE incentive_value_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eligibility_result_id UUID NOT NULL REFERENCES eligibility_results(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    incentive_program_id UUID NOT NULL REFERENCES incentive_programs(id) ON DELETE CASCADE,
    -- Calculation Basis
    calculation_method VARCHAR(50) NOT NULL, -- percentage_of_cost, per_unit, per_sqft, fixed, formula
    calculation_formula TEXT,
    -- Input Values
    base_value DECIMAL(15,2), -- The value being used as calculation basis
    base_value_type VARCHAR(50), -- tdc, hard_costs, equipment_cost, etc.
    unit_count INTEGER,
    square_footage INTEGER,
    -- Rate/Percentage
    base_rate DECIMAL(10,6),
    rate_unit VARCHAR(50), -- percent, per_unit, per_sqft, per_kw
    -- Limits
    minimum_value DECIMAL(15,2),
    maximum_value DECIMAL(15,2),
    cap_type VARCHAR(30), -- none, per_project, per_unit, per_sqft
    cap_value DECIMAL(15,2),
    -- Calculated Values
    calculated_value_before_limits DECIMAL(15,2),
    calculated_value_after_limits DECIMAL(15,2),
    -- Adders/Bonuses
    adders JSONB DEFAULT '[]', -- [{type, percentage, value, description}]
    total_adder_value DECIMAL(15,2) DEFAULT 0,
    -- Reductions
    reductions JSONB DEFAULT '[]', -- [{type, percentage, value, reason}]
    total_reduction_value DECIMAL(15,2) DEFAULT 0,
    -- Final Value
    final_estimated_value DECIMAL(15,2),
    -- Stacking Considerations
    is_stackable BOOLEAN DEFAULT true,
    stacking_group VARCHAR(50),
    stacking_limit DECIMAL(15,2),
    stacking_notes TEXT,
    -- Confidence
    value_confidence VARCHAR(20), -- high, medium, low
    confidence_notes TEXT,
    -- Calculation Timestamp
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Documents
CREATE INDEX idx_documents_org ON documents(organization_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_ai_status ON documents(ai_extraction_status) WHERE ai_extraction_enabled = true;
CREATE INDEX idx_documents_search ON documents USING gin(to_tsvector('english', COALESCE(search_text, '')));
CREATE INDEX idx_documents_tags ON documents USING gin(tags);
CREATE INDEX idx_documents_expires ON documents(expires_at) WHERE expires_at IS NOT NULL;

-- Document Extractions
CREATE INDEX idx_extractions_document ON document_extractions(document_id);
CREATE INDEX idx_extractions_type ON document_extractions(extraction_type);
CREATE INDEX idx_extractions_validated ON document_extractions(validated);

-- Eligibility Rule Sets
CREATE INDEX idx_rulesets_program ON eligibility_rule_sets(incentive_program_id);
CREATE INDEX idx_rulesets_active ON eligibility_rule_sets(is_active) WHERE is_active = true;

-- Eligibility Rules
CREATE INDEX idx_rules_ruleset ON eligibility_rules(rule_set_id);
CREATE INDEX idx_rules_category ON eligibility_rules(category);
CREATE INDEX idx_rules_active ON eligibility_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_rules_priority ON eligibility_rules(display_priority);

-- Rule Conditions
CREATE INDEX idx_conditions_rule ON rule_conditions(rule_id);
CREATE INDEX idx_conditions_parent ON rule_conditions(parent_condition_id);

-- Geographic Zones
CREATE INDEX idx_zones_type ON geographic_eligibility_zones(zone_type);
CREATE INDEX idx_zones_state ON geographic_eligibility_zones(state);
CREATE INDEX idx_zones_tract ON geographic_eligibility_zones(census_tract);
CREATE INDEX idx_zones_qct ON geographic_eligibility_zones(is_qct) WHERE is_qct = true;
CREATE INDEX idx_zones_oz ON geographic_eligibility_zones(is_opportunity_zone) WHERE is_opportunity_zone = true;
CREATE INDEX idx_zones_ec ON geographic_eligibility_zones(is_energy_community) WHERE is_energy_community = true;

-- Eligibility Results
CREATE INDEX idx_results_project ON eligibility_results(project_id);
CREATE INDEX idx_results_program ON eligibility_results(incentive_program_id);
CREATE INDEX idx_results_eligible ON eligibility_results(is_eligible);
CREATE INDEX idx_results_status ON eligibility_results(match_status);
CREATE INDEX idx_results_evaluated ON eligibility_results(evaluated_at DESC);
CREATE INDEX idx_results_deadline ON eligibility_results(application_deadline) WHERE application_deadline IS NOT NULL;

-- Value Calculations
CREATE INDEX idx_valuecalc_result ON incentive_value_calculations(eligibility_result_id);
CREATE INDEX idx_valuecalc_project ON incentive_value_calculations(project_id);
CREATE INDEX idx_valuecalc_program ON incentive_value_calculations(incentive_program_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rule_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographic_eligibility_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_value_calculations ENABLE ROW LEVEL SECURITY;

-- Documents: Org members only
CREATE POLICY "Org members can view documents" ON documents
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can manage documents" ON documents
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Document Extractions: Through document access
CREATE POLICY "Access extractions through documents" ON document_extractions
    FOR SELECT USING (
        document_id IN (
            SELECT id FROM documents
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Manage extractions through documents" ON document_extractions
    FOR ALL USING (
        document_id IN (
            SELECT id FROM documents
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Document Templates: Public read, org/system write
CREATE POLICY "Anyone can view active templates" ON document_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Org admins can manage templates" ON document_templates
    FOR ALL USING (
        is_system = false AND
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Eligibility Rule Sets: Public read
CREATE POLICY "Anyone can view rule sets" ON eligibility_rule_sets
    FOR SELECT USING (is_active = true);

-- Eligibility Rules: Public read
CREATE POLICY "Anyone can view rules" ON eligibility_rules
    FOR SELECT USING (is_active = true);

-- Rule Conditions: Public read
CREATE POLICY "Anyone can view conditions" ON rule_conditions
    FOR SELECT USING (true);

-- Geographic Zones: Public read
CREATE POLICY "Anyone can view geographic zones" ON geographic_eligibility_zones
    FOR SELECT USING (is_active = true);

-- Eligibility Results: Org members only
CREATE POLICY "Org members can view results" ON eligibility_results
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org members can manage results" ON eligibility_results
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Value Calculations: Org members only
CREATE POLICY "Org members can view calculations" ON incentive_value_calculations
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org members can manage calculations" ON incentive_value_calculations
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extractions_updated_at BEFORE UPDATE ON document_extractions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON document_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rulesets_updated_at BEFORE UPDATE ON eligibility_rule_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON eligibility_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON geographic_eligibility_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON eligibility_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_valuecalc_updated_at BEFORE UPDATE ON incentive_value_calculations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to evaluate a single rule against project data
CREATE OR REPLACE FUNCTION evaluate_eligibility_rule(
    p_rule_id UUID,
    p_project_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_rule RECORD;
    v_result BOOLEAN;
    v_field_value TEXT;
    v_compare_value TEXT;
    v_field_path TEXT[];
    v_current_value JSONB;
    i INTEGER;
BEGIN
    -- Get rule definition
    SELECT * INTO v_rule FROM eligibility_rules WHERE id = p_rule_id AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('passed', false, 'error', 'Rule not found');
    END IF;

    -- Extract field value from project data using path
    v_field_path := string_to_array(v_rule.field_path, '.');
    v_current_value := p_project_data;

    FOR i IN 1..array_length(v_field_path, 1) LOOP
        v_current_value := v_current_value -> v_field_path[i];
        IF v_current_value IS NULL THEN
            RETURN jsonb_build_object(
                'passed', NULL,
                'skipped', true,
                'reason', 'Missing data for field: ' || v_rule.field_path
            );
        END IF;
    END LOOP;

    v_field_value := v_current_value #>> '{}';

    -- Evaluate based on operator
    CASE v_rule.operator
        WHEN 'equals' THEN
            v_result := v_field_value = v_rule.value_single;
        WHEN 'not_equals' THEN
            v_result := v_field_value != v_rule.value_single;
        WHEN 'greater_than' THEN
            v_result := v_field_value::DECIMAL > v_rule.value_single::DECIMAL;
        WHEN 'greater_than_or_equals' THEN
            v_result := v_field_value::DECIMAL >= v_rule.value_single::DECIMAL;
        WHEN 'less_than' THEN
            v_result := v_field_value::DECIMAL < v_rule.value_single::DECIMAL;
        WHEN 'less_than_or_equals' THEN
            v_result := v_field_value::DECIMAL <= v_rule.value_single::DECIMAL;
        WHEN 'in_list' THEN
            v_result := v_field_value = ANY(v_rule.value_list);
        WHEN 'not_in_list' THEN
            v_result := NOT (v_field_value = ANY(v_rule.value_list));
        WHEN 'between' THEN
            v_result := v_field_value::DECIMAL BETWEEN v_rule.value_min::DECIMAL AND v_rule.value_max::DECIMAL;
        WHEN 'contains' THEN
            v_result := v_field_value ILIKE '%' || v_rule.value_single || '%';
        WHEN 'is_null' THEN
            v_result := v_field_value IS NULL;
        WHEN 'is_not_null' THEN
            v_result := v_field_value IS NOT NULL;
        ELSE
            v_result := false;
    END CASE;

    RETURN jsonb_build_object(
        'passed', v_result,
        'rule_id', v_rule.id,
        'rule_name', v_rule.name,
        'category', v_rule.category,
        'field_path', v_rule.field_path,
        'field_value', v_field_value,
        'operator', v_rule.operator,
        'expected_value', COALESCE(v_rule.value_single, array_to_string(v_rule.value_list, ', ')),
        'is_required', v_rule.is_required,
        'is_disqualifying', v_rule.is_disqualifying
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'passed', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Function to evaluate all rules for a program against a project
CREATE OR REPLACE FUNCTION evaluate_program_eligibility(
    p_project_id UUID,
    p_program_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_rule_set RECORD;
    v_rule RECORD;
    v_project_data JSONB;
    v_rule_results JSONB := '[]';
    v_rule_result JSONB;
    v_is_eligible BOOLEAN := true;
    v_total_rules INTEGER := 0;
    v_passed_rules INTEGER := 0;
    v_failed_rules INTEGER := 0;
    v_skipped_rules INTEGER := 0;
    v_score DECIMAL := 0;
    v_max_score DECIMAL := 0;
    v_result_id UUID;
    v_missing_fields TEXT[] := '{}';
BEGIN
    -- Get project data as JSON
    SELECT to_jsonb(p.*) INTO v_project_data
    FROM projects p
    WHERE p.id = p_project_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Project not found';
    END IF;

    -- Get active rule set for program
    SELECT * INTO v_rule_set
    FROM eligibility_rule_sets
    WHERE incentive_program_id = p_program_id
    AND is_active = true
    ORDER BY version DESC
    LIMIT 1;

    IF NOT FOUND THEN
        -- No rules defined, assume eligible
        INSERT INTO eligibility_results (
            project_id, incentive_program_id, is_eligible, eligibility_score,
            total_rules, passed_rules, failed_rules, skipped_rules,
            rule_results, match_status
        ) VALUES (
            p_project_id, p_program_id, true, 100,
            0, 0, 0, 0,
            '[]', 'evaluated'
        )
        ON CONFLICT (project_id, incentive_program_id, rule_set_id)
        DO UPDATE SET
            is_eligible = true,
            eligibility_score = 100,
            evaluated_at = NOW()
        RETURNING id INTO v_result_id;

        RETURN v_result_id;
    END IF;

    -- Evaluate each rule
    FOR v_rule IN
        SELECT * FROM eligibility_rules
        WHERE rule_set_id = v_rule_set.id
        AND is_active = true
        ORDER BY display_priority
    LOOP
        v_total_rules := v_total_rules + 1;
        v_max_score := v_max_score + v_rule.max_points;

        v_rule_result := evaluate_eligibility_rule(v_rule.id, v_project_data);
        v_rule_results := v_rule_results || v_rule_result;

        IF (v_rule_result->>'skipped')::BOOLEAN THEN
            v_skipped_rules := v_skipped_rules + 1;
            v_missing_fields := array_append(v_missing_fields, v_rule.field_path);
        ELSIF (v_rule_result->>'passed')::BOOLEAN THEN
            v_passed_rules := v_passed_rules + 1;
            v_score := v_score + v_rule.max_points;
        ELSE
            v_failed_rules := v_failed_rules + 1;
            IF v_rule.is_required OR v_rule.is_disqualifying THEN
                v_is_eligible := false;
            END IF;
        END IF;
    END LOOP;

    -- Calculate final score
    IF v_max_score > 0 THEN
        v_score := (v_score / v_max_score) * 100;
    END IF;

    -- Insert or update result
    INSERT INTO eligibility_results (
        project_id, incentive_program_id, rule_set_id,
        is_eligible, eligibility_score,
        total_rules, passed_rules, failed_rules, skipped_rules,
        rule_results, missing_data_fields, match_status,
        evaluated_at
    ) VALUES (
        p_project_id, p_program_id, v_rule_set.id,
        v_is_eligible, v_score,
        v_total_rules, v_passed_rules, v_failed_rules, v_skipped_rules,
        v_rule_results, v_missing_fields, 'evaluated',
        NOW()
    )
    ON CONFLICT (project_id, incentive_program_id, rule_set_id)
    DO UPDATE SET
        is_eligible = v_is_eligible,
        eligibility_score = v_score,
        total_rules = v_total_rules,
        passed_rules = v_passed_rules,
        failed_rules = v_failed_rules,
        skipped_rules = v_skipped_rules,
        rule_results = v_rule_results,
        missing_data_fields = v_missing_fields,
        match_status = 'evaluated',
        evaluated_at = NOW(),
        updated_at = NOW()
    RETURNING id INTO v_result_id;

    RETURN v_result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a project is in a geographic zone
CREATE OR REPLACE FUNCTION check_geographic_eligibility(
    p_project_id UUID,
    p_zone_type VARCHAR
)
RETURNS TABLE (
    zone_id UUID,
    zone_name VARCHAR,
    is_eligible BOOLEAN,
    zone_attributes JSONB
) AS $$
DECLARE
    v_project RECORD;
BEGIN
    -- Get project location
    SELECT * INTO v_project
    FROM projects
    WHERE id = p_project_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        z.id,
        z.name,
        CASE
            WHEN z.zone_type = 'state' AND z.state = v_project.state THEN true
            WHEN z.zone_type = 'county' AND z.state = v_project.state AND z.county = v_project.county THEN true
            WHEN z.zone_type = 'census_tract' AND z.census_tract = v_project.census_tract THEN true
            WHEN z.zone_type = 'zip' AND v_project.zip_code = ANY(z.zip_codes) THEN true
            ELSE false
        END as is_eligible,
        z.attributes
    FROM geographic_eligibility_zones z
    WHERE z.zone_type = p_zone_type
    AND z.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE documents IS 'Document storage and management with AI extraction support';
COMMENT ON TABLE document_extractions IS 'AI-extracted data from documents';
COMMENT ON TABLE document_templates IS 'Templates for generating documents and forms';
COMMENT ON TABLE eligibility_rule_sets IS 'Collections of eligibility rules per incentive program';
COMMENT ON TABLE eligibility_rules IS 'Individual eligibility rules with flexible operators';
COMMENT ON TABLE rule_conditions IS 'Complex nested conditions for rules';
COMMENT ON TABLE geographic_eligibility_zones IS 'Pre-defined geographic areas (QCTs, DDAs, OZs, Energy Communities)';
COMMENT ON TABLE eligibility_results IS 'Results of eligibility evaluations for project-program pairs';
COMMENT ON TABLE incentive_value_calculations IS 'Detailed value calculations with adders and limits';
COMMENT ON FUNCTION evaluate_eligibility_rule IS 'Evaluates a single rule against project data';
COMMENT ON FUNCTION evaluate_program_eligibility IS 'Evaluates all rules for a program against a project';
COMMENT ON FUNCTION check_geographic_eligibility IS 'Checks if a project is in specific geographic zones';
