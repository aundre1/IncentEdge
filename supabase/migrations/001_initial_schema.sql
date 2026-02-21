-- IncentEdge Database Schema
-- Migration: 001_initial_schema
-- Description: Core tables for organizations, users, and projects
-- Date: 2026-01-09

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    organization_type VARCHAR(50), -- developer, owner, consultant, etc.
    tax_status VARCHAR(20) CHECK (tax_status IN ('for-profit', 'nonprofit', 'municipal', 'tribal')),
    tax_exempt BOOLEAN DEFAULT false,
    ein VARCHAR(20),
    duns_number VARCHAR(20),
    sam_uei VARCHAR(20), -- SAM.gov Unique Entity ID
    -- Certifications
    mwbe_certified BOOLEAN DEFAULT false,
    mwbe_certification_state VARCHAR(2),
    mwbe_certification_expiry DATE,
    sdvob_certified BOOLEAN DEFAULT false,
    sdvob_certification_expiry DATE,
    hubzone_certified BOOLEAN DEFAULT false,
    -- Subscription
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'team', 'enterprise')),
    subscription_expires_at TIMESTAMPTZ,
    stripe_customer_id VARCHAR(100),
    -- Settings
    settings JSONB DEFAULT '{}',
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    job_title VARCHAR(100),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'analyst', 'viewer')),
    -- Preferences
    preferences JSONB DEFAULT '{"theme": "system", "notifications": true}',
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    -- Timestamps
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    -- Location
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    county VARCHAR(100),
    census_tract VARCHAR(20), -- For energy community bonus determination
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    -- Project Classification
    sector_type VARCHAR(50) CHECK (sector_type IN ('real-estate', 'clean-energy', 'water', 'waste', 'transportation', 'industrial')),
    building_type VARCHAR(50),
    construction_type VARCHAR(30) CHECK (construction_type IN ('new-construction', 'substantial-rehab', 'acquisition', 'refinance')),
    -- Size Metrics
    total_units INTEGER,
    affordable_units INTEGER,
    affordable_breakdown JSONB, -- {"ami_30": 10, "ami_50": 20, "ami_60": 30, ...}
    total_sqft DECIMAL(12, 2),
    stories INTEGER,
    -- Clean Energy Specific
    capacity_mw DECIMAL(10, 2),
    annual_production_mwh DECIMAL(12, 2),
    -- Financials
    total_development_cost DECIMAL(15, 2),
    hard_costs DECIMAL(15, 2),
    soft_costs DECIMAL(15, 2),
    acquisition_cost DECIMAL(15, 2),
    land_cost DECIMAL(15, 2),
    -- Sustainability
    target_certification VARCHAR(50),
    certifications_achieved TEXT[],
    renewable_energy_types TEXT[], -- ['solar', 'battery', 'geothermal', ...]
    projected_energy_reduction_pct DECIMAL(5, 2),
    -- IRA Bonus Eligibility
    domestic_content_eligible BOOLEAN DEFAULT false,
    prevailing_wage_commitment BOOLEAN DEFAULT false,
    energy_community_eligible BOOLEAN DEFAULT false,
    low_income_community_eligible BOOLEAN DEFAULT false,
    -- Timeline
    project_status VARCHAR(30) DEFAULT 'active' CHECK (project_status IN ('active', 'on-hold', 'completed', 'archived')),
    estimated_start_date DATE,
    estimated_completion_date DATE,
    actual_start_date DATE,
    actual_completion_date DATE,
    -- Calculated Fields (updated via triggers)
    total_potential_incentives DECIMAL(15, 2) DEFAULT 0,
    total_captured_incentives DECIMAL(15, 2) DEFAULT 0,
    eligibility_scan_count INTEGER DEFAULT 0,
    last_eligibility_scan_at TIMESTAMPTZ,
    -- Metadata
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INCENTIVE PROGRAMS TABLE
-- ============================================================================
CREATE TABLE incentive_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(100) UNIQUE, -- ID from DSIRE or other sources
    name VARCHAR(500) NOT NULL,
    short_name VARCHAR(100),
    description TEXT,
    summary TEXT, -- AI-generated summary
    -- Classification
    program_type VARCHAR(100) NOT NULL, -- tax_credit, grant, rebate, loan, etc.
    category VARCHAR(50) NOT NULL CHECK (category IN ('federal', 'state', 'local', 'utility')),
    subcategory VARCHAR(100),
    sector_types TEXT[] DEFAULT '{}',
    technology_types TEXT[] DEFAULT '{}',
    building_types TEXT[] DEFAULT '{}',
    -- Geography
    jurisdiction_level VARCHAR(20) NOT NULL CHECK (jurisdiction_level IN ('federal', 'state', 'local', 'utility')),
    state VARCHAR(2),
    counties TEXT[] DEFAULT '{}',
    municipalities TEXT[] DEFAULT '{}',
    census_tracts TEXT[] DEFAULT '{}',
    utility_territories TEXT[] DEFAULT '{}',
    -- Incentive Value
    incentive_type VARCHAR(50), -- tax_credit, grant, rebate, loan, exemption
    amount_type VARCHAR(20) CHECK (amount_type IN ('fixed', 'percentage', 'per_unit', 'per_kw', 'per_sqft', 'variable')),
    amount_fixed DECIMAL(15, 2),
    amount_percentage DECIMAL(5, 4), -- Store as decimal (0.30 = 30%)
    amount_per_unit DECIMAL(15, 2),
    amount_per_kw DECIMAL(15, 2),
    amount_per_sqft DECIMAL(10, 2),
    amount_min DECIMAL(15, 2),
    amount_max DECIMAL(15, 2),
    -- Eligibility
    eligibility_criteria JSONB DEFAULT '{}', -- Structured eligibility rules
    eligibility_summary TEXT, -- Human-readable summary
    entity_types TEXT[] DEFAULT '{}', -- for-profit, nonprofit, municipal, etc.
    min_project_size DECIMAL(15, 2),
    max_project_size DECIMAL(15, 2),
    -- IRA/Federal Specific
    direct_pay_eligible BOOLEAN DEFAULT false,
    transferable BOOLEAN DEFAULT false,
    domestic_content_bonus DECIMAL(5, 4),
    energy_community_bonus DECIMAL(5, 4),
    prevailing_wage_bonus DECIMAL(5, 4),
    low_income_bonus DECIMAL(5, 4),
    -- Status & Dates
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'pending')),
    start_date DATE,
    end_date DATE,
    application_deadline DATE,
    next_deadline DATE,
    funding_remaining DECIMAL(15, 2),
    -- Administration
    administrator VARCHAR(255),
    administering_agency VARCHAR(255),
    source_url TEXT,
    application_url TEXT,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    -- Stacking Rules
    stackable BOOLEAN DEFAULT true,
    stacking_restrictions TEXT[],
    conflicts_with TEXT[], -- Array of program IDs that can't be combined
    -- Application Details
    application_complexity VARCHAR(20) CHECK (application_complexity IN ('simple', 'moderate', 'complex', 'very_complex')),
    typical_processing_days INTEGER,
    required_documents TEXT[],
    -- Data Quality
    last_verified_at TIMESTAMPTZ,
    data_source VARCHAR(100),
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    popularity_score INTEGER DEFAULT 0, -- Based on search/views
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT INCENTIVE MATCHES TABLE
-- ============================================================================
CREATE TABLE project_incentive_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    incentive_program_id UUID NOT NULL REFERENCES incentive_programs(id) ON DELETE CASCADE,
    -- Scoring
    overall_score DECIMAL(3, 2) NOT NULL, -- 0.00 to 1.00
    probability_score DECIMAL(3, 2), -- Likelihood of approval
    relevance_score DECIMAL(3, 2), -- How well it matches the project
    priority_rank INTEGER, -- Rank among all matches for this project
    -- Calculated Values
    estimated_value DECIMAL(15, 2) NOT NULL,
    value_low DECIMAL(15, 2),
    value_high DECIMAL(15, 2),
    -- Qualification Details
    requirements_met INTEGER DEFAULT 0,
    requirements_total INTEGER DEFAULT 0,
    match_details JSONB DEFAULT '[]', -- Array of requirement checks
    missing_requirements TEXT[],
    -- Bonus Eligibility
    domestic_content_bonus_eligible BOOLEAN DEFAULT false,
    energy_community_bonus_eligible BOOLEAN DEFAULT false,
    prevailing_wage_bonus_eligible BOOLEAN DEFAULT false,
    -- Status
    status VARCHAR(30) DEFAULT 'matched' CHECK (status IN ('matched', 'shortlisted', 'applied', 'awarded', 'dismissed', 'expired')),
    dismissed_reason TEXT,
    dismissed_at TIMESTAMPTZ,
    dismissed_by UUID REFERENCES profiles(id),
    -- Notes
    internal_notes TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique constraint to prevent duplicate matches
    UNIQUE(project_id, incentive_program_id)
);

-- ============================================================================
-- APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    incentive_match_id UUID REFERENCES project_incentive_matches(id) ON DELETE SET NULL,
    incentive_program_id UUID NOT NULL REFERENCES incentive_programs(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Status
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'in-progress', 'ready-for-review', 'submitted',
        'under-review', 'additional-info-requested', 'approved',
        'partially-approved', 'rejected', 'withdrawn', 'expired'
    )),
    status_history JSONB DEFAULT '[]', -- Array of {status, timestamp, user_id, note}
    -- Application Details
    application_number VARCHAR(100), -- External tracking number
    submission_date TIMESTAMPTZ,
    amount_requested DECIMAL(15, 2),
    amount_approved DECIMAL(15, 2),
    -- AI Generation
    ai_generated_content JSONB, -- Stores AI-drafted sections
    ai_model_used VARCHAR(50),
    ai_generation_cost DECIMAL(10, 4),
    -- Review
    human_reviewed BOOLEAN DEFAULT false,
    reviewer_id UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    -- Timeline
    deadline DATE,
    decision_date DATE,
    decision_notes TEXT,
    -- Fee Tracking
    fee_type VARCHAR(20) CHECK (fee_type IN ('fixed', 'success', 'none')),
    fee_amount DECIMAL(15, 2),
    fee_paid BOOLEAN DEFAULT false,
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    -- Document Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50), -- pro_forma, site_plan, certification, etc.
    category VARCHAR(50), -- financial, legal, technical, etc.
    -- Storage
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    -- AI Processing
    ai_extracted_data JSONB, -- Data extracted by AI from document
    ai_processed BOOLEAN DEFAULT false,
    ai_processed_at TIMESTAMPTZ,
    -- Version Control
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    -- Metadata
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOG TABLE
-- ============================================================================
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    -- Activity Details
    action_type VARCHAR(50) NOT NULL, -- create, update, delete, view, export, etc.
    entity_type VARCHAR(50) NOT NULL, -- project, application, document, etc.
    entity_id UUID,
    entity_name VARCHAR(255),
    -- Context
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    -- Notification Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- deadline, status_change, new_program, etc.
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    -- Related Entities
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    incentive_program_id UUID REFERENCES incentive_programs(id) ON DELETE SET NULL,
    -- Action
    action_url TEXT,
    action_label VARCHAR(100),
    -- Status
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    dismissed BOOLEAN DEFAULT false,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SAVED SEARCHES TABLE
-- ============================================================================
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    -- Search Criteria
    search_type VARCHAR(50) NOT NULL, -- programs, projects, applications
    filters JSONB NOT NULL,
    -- Settings
    alert_enabled BOOLEAN DEFAULT false,
    alert_frequency VARCHAR(20) CHECK (alert_frequency IN ('daily', 'weekly', 'monthly')),
    last_alerted_at TIMESTAMPTZ,
    -- Usage
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TEAM INVITATIONS TABLE
-- ============================================================================
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'analyst', 'viewer')),
    invited_by UUID NOT NULL REFERENCES profiles(id),
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    token VARCHAR(100) UNIQUE NOT NULL,
    -- Timestamps
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Organizations
CREATE INDEX idx_organizations_subscription ON organizations(subscription_tier);

-- Profiles
CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Projects
CREATE INDEX idx_projects_organization ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_state ON projects(state);
CREATE INDEX idx_projects_sector ON projects(sector_type);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Incentive Programs
CREATE INDEX idx_programs_category ON incentive_programs(category);
CREATE INDEX idx_programs_status ON incentive_programs(status);
CREATE INDEX idx_programs_state ON incentive_programs(state);
CREATE INDEX idx_programs_jurisdiction ON incentive_programs(jurisdiction_level);
CREATE INDEX idx_programs_type ON incentive_programs(program_type);
CREATE INDEX idx_programs_sectors ON incentive_programs USING GIN(sector_types);
CREATE INDEX idx_programs_technologies ON incentive_programs USING GIN(technology_types);
CREATE INDEX idx_programs_building_types ON incentive_programs USING GIN(building_types);
CREATE INDEX idx_programs_deadline ON incentive_programs(application_deadline) WHERE application_deadline IS NOT NULL;
CREATE INDEX idx_programs_direct_pay ON incentive_programs(direct_pay_eligible) WHERE direct_pay_eligible = true;

-- Project Incentive Matches
CREATE INDEX idx_matches_project ON project_incentive_matches(project_id);
CREATE INDEX idx_matches_program ON project_incentive_matches(incentive_program_id);
CREATE INDEX idx_matches_status ON project_incentive_matches(status);
CREATE INDEX idx_matches_score ON project_incentive_matches(overall_score DESC);

-- Applications
CREATE INDEX idx_applications_project ON applications(project_id);
CREATE INDEX idx_applications_organization ON applications(organization_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_deadline ON applications(deadline) WHERE deadline IS NOT NULL;

-- Documents
CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- Activity Logs
CREATE INDEX idx_activity_organization ON activity_logs(organization_id);
CREATE INDEX idx_activity_user ON activity_logs(user_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_incentive_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Profiles: Users can only view/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Organizations: Members can view their organization
CREATE POLICY "Org members can view organization" ON organizations
    FOR SELECT USING (
        id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org admins can update organization" ON organizations
    FOR UPDATE USING (
        id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Projects: Org members can view projects
CREATE POLICY "Org members can view projects" ON projects
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can insert projects" ON projects
    FOR INSERT WITH CHECK (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can update projects" ON projects
    FOR UPDATE USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Incentive Programs: Public read access
CREATE POLICY "Anyone can view active programs" ON incentive_programs
    FOR SELECT USING (status = 'active');

-- Project Incentive Matches: Org members can view
CREATE POLICY "Org members can view matches" ON project_incentive_matches
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Applications: Org members can view
CREATE POLICY "Org members can view applications" ON applications
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can manage applications" ON applications
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Documents: Org members can view
CREATE POLICY "Org members can view documents" ON documents
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Org members can manage documents" ON documents
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Activity Logs: Org members can view
CREATE POLICY "Org members can view activity" ON activity_logs
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Saved Searches: Users can only see their own
CREATE POLICY "Users can manage own searches" ON saved_searches
    FOR ALL USING (user_id = auth.uid());

-- Invitations: Org admins can manage
CREATE POLICY "Org admins can view invitations" ON invitations
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incentive_programs_updated_at BEFORE UPDATE ON incentive_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON project_incentive_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at BEFORE UPDATE ON saved_searches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
    p_organization_id UUID,
    p_user_id UUID,
    p_action_type VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_entity_name VARCHAR,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO activity_logs (organization_id, user_id, action_type, entity_type, entity_id, entity_name, details)
    VALUES (p_organization_id, p_user_id, p_action_type, p_entity_type, p_entity_id, p_entity_name, p_details)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE organizations IS 'Organizations/companies using IncentEdge';
COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth';
COMMENT ON TABLE projects IS 'Real estate and infrastructure projects';
COMMENT ON TABLE incentive_programs IS 'Database of 20,000+ incentive programs';
COMMENT ON TABLE project_incentive_matches IS 'AI-generated matches between projects and programs';
COMMENT ON TABLE applications IS 'Grant/incentive applications';
COMMENT ON TABLE documents IS 'Uploaded documents and generated reports';
COMMENT ON TABLE activity_logs IS 'Audit trail of user actions';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE saved_searches IS 'User saved search filters';
COMMENT ON TABLE invitations IS 'Team member invitations';
