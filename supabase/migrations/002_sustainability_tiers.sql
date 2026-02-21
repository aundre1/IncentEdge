-- IncentEdge Database Schema
-- Migration: 002_sustainability_tiers
-- Description: Add sustainability tiers, RS Means cost estimation, and tier-based incentives
-- Date: 2026-01-09

-- ============================================================================
-- SUSTAINABILITY TIERS ENUM
-- ============================================================================
-- Tier 1: Efficient - Energy Star, code+20% insulation, LED lighting
-- Tier 2: High Performance - Passive House OR LEED Gold, 50%+ energy reduction
-- Tier 3: Net Zero - Passive House + on-site renewables + zero carbon operations
-- Triple Net Zero: Energy + Water recycling + Waste diversion (95%+)

CREATE TYPE sustainability_tier AS ENUM ('tier_1_efficient', 'tier_2_high_performance', 'tier_3_net_zero', 'tier_3_triple_net_zero');

-- ============================================================================
-- ADD SUSTAINABILITY COLUMNS TO PROJECTS
-- ============================================================================
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS sustainability_tier sustainability_tier DEFAULT 'tier_1_efficient',
ADD COLUMN IF NOT EXISTS sustainability_features JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS water_recycling_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS waste_diversion_pct DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_construction_cost_psf DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sustainability_premium_psf DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS rs_means_region VARCHAR(50),
ADD COLUMN IF NOT EXISTS rs_means_building_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS cost_estimation_data JSONB DEFAULT '{}';

-- ============================================================================
-- RS MEANS COST DATA TABLE
-- Regional construction cost multipliers and base costs
-- ============================================================================
CREATE TABLE rs_means_cost_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Building Classification
    building_type VARCHAR(100) NOT NULL,
    building_subtype VARCHAR(100),
    construction_quality VARCHAR(50) CHECK (construction_quality IN ('economy', 'average', 'custom', 'luxury')),
    -- Base Costs (National Average)
    base_cost_psf DECIMAL(10,2) NOT NULL,
    hard_cost_ratio DECIMAL(5,4) DEFAULT 0.70, -- 70% hard costs typical
    soft_cost_ratio DECIMAL(5,4) DEFAULT 0.30, -- 30% soft costs typical
    -- Cost Components
    foundation_cost_psf DECIMAL(10,2),
    structure_cost_psf DECIMAL(10,2),
    exterior_cost_psf DECIMAL(10,2),
    interior_cost_psf DECIMAL(10,2),
    mep_cost_psf DECIMAL(10,2),
    site_work_cost_psf DECIMAL(10,2),
    -- Size Adjustments
    min_sqft INTEGER,
    max_sqft INTEGER,
    size_adjustment_factor DECIMAL(5,4) DEFAULT 1.0,
    -- Stories Adjustment
    stories_adjustment JSONB DEFAULT '{"1-3": 1.0, "4-7": 1.05, "8-15": 1.10, "16+": 1.15}',
    -- Validity
    effective_date DATE NOT NULL,
    expiration_date DATE,
    data_source VARCHAR(100) DEFAULT 'RS Means',
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RS MEANS REGIONAL MULTIPLIERS
-- Location-based cost adjustments
-- ============================================================================
CREATE TABLE rs_means_regional_multipliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Location
    state VARCHAR(2) NOT NULL,
    city VARCHAR(100),
    zip_code_prefix VARCHAR(3), -- First 3 digits of ZIP
    metro_area VARCHAR(100),
    -- Multipliers (1.0 = national average)
    total_multiplier DECIMAL(5,4) NOT NULL DEFAULT 1.0,
    material_multiplier DECIMAL(5,4) DEFAULT 1.0,
    labor_multiplier DECIMAL(5,4) DEFAULT 1.0,
    equipment_multiplier DECIMAL(5,4) DEFAULT 1.0,
    -- Detailed Multipliers by Trade
    trade_multipliers JSONB DEFAULT '{}', -- {"plumbing": 1.05, "electrical": 1.10, ...}
    -- Validity
    effective_date DATE NOT NULL,
    expiration_date DATE,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique constraint
    UNIQUE(state, city, zip_code_prefix)
);

-- ============================================================================
-- SUSTAINABILITY COST PREMIUMS
-- Additional costs by tier and building type
-- ============================================================================
CREATE TABLE sustainability_cost_premiums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Classification
    building_type VARCHAR(100) NOT NULL,
    sustainability_tier sustainability_tier NOT NULL,
    -- Premium Costs (added to base)
    premium_psf DECIMAL(10,2) NOT NULL,
    premium_percentage DECIMAL(5,4), -- Alternative: % increase over base
    -- Component Premiums
    envelope_premium_psf DECIMAL(10,2), -- Insulation, windows, air sealing
    hvac_premium_psf DECIMAL(10,2), -- Heat pumps, ERV, controls
    renewable_premium_psf DECIMAL(10,2), -- Solar, battery, etc.
    water_systems_psf DECIMAL(10,2), -- Greywater, rainwater, recycling
    waste_systems_psf DECIMAL(10,2), -- Pneumatic, composting, etc.
    -- Typical Systems Included
    typical_systems JSONB DEFAULT '[]',
    certification_path TEXT[], -- ['LEED Gold', 'Passive House', 'Energy Star']
    -- ROI Metrics
    energy_savings_annual_psf DECIMAL(8,2),
    water_savings_annual_psf DECIMAL(8,2),
    simple_payback_years DECIMAL(5,2),
    -- Validity
    effective_date DATE NOT NULL,
    expiration_date DATE,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Unique constraint
    UNIQUE(building_type, sustainability_tier)
);

-- ============================================================================
-- TIER-BASED INCENTIVE MULTIPLIERS
-- How incentives change based on sustainability tier
-- ============================================================================
CREATE TABLE tier_incentive_multipliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incentive_program_id UUID NOT NULL REFERENCES incentive_programs(id) ON DELETE CASCADE,
    sustainability_tier sustainability_tier NOT NULL,
    -- Multipliers
    value_multiplier DECIMAL(5,4) NOT NULL DEFAULT 1.0, -- 1.0 = base, 1.25 = 25% bonus
    probability_multiplier DECIMAL(5,4) DEFAULT 1.0, -- Higher tiers = better approval odds
    -- Tier-Specific Amounts
    tier_amount_fixed DECIMAL(15,2),
    tier_amount_per_unit DECIMAL(15,2),
    tier_amount_percentage DECIMAL(5,4),
    -- Requirements
    minimum_tier sustainability_tier, -- Some programs require min tier
    notes TEXT,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(incentive_program_id, sustainability_tier)
);

-- ============================================================================
-- ADD TIER FIELDS TO INCENTIVE PROGRAMS
-- ============================================================================
ALTER TABLE incentive_programs
ADD COLUMN IF NOT EXISTS tier_bonuses JSONB DEFAULT '{}',
-- Example: {"tier_2_high_performance": 1.15, "tier_3_net_zero": 1.30}
ADD COLUMN IF NOT EXISTS minimum_sustainability_tier sustainability_tier,
ADD COLUMN IF NOT EXISTS passive_house_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS net_zero_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS water_recycling_bonus DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS waste_diversion_bonus DECIMAL(5,4);

-- ============================================================================
-- ENERGY SYSTEM COSTS TABLE
-- For accurate renewable/efficiency system pricing
-- ============================================================================
CREATE TABLE energy_system_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- System Type
    system_type VARCHAR(50) NOT NULL, -- solar, battery, geothermal, heat_pump, etc.
    system_subtype VARCHAR(100), -- rooftop_solar, ground_mount, etc.
    manufacturer VARCHAR(100),
    -- Sizing
    unit_of_measure VARCHAR(20) NOT NULL, -- kW, kWh, ton, sqft
    min_size DECIMAL(10,2),
    max_size DECIMAL(10,2),
    -- Costs
    cost_per_unit DECIMAL(12,2) NOT NULL, -- $/kW, $/kWh, etc.
    installation_cost_per_unit DECIMAL(12,2),
    total_installed_cost_per_unit DECIMAL(12,2),
    -- Size-based Adjustments
    size_discount_tiers JSONB DEFAULT '[]', -- [{"min": 100, "max": 500, "discount": 0.10}]
    -- Performance Metrics
    annual_production_per_unit DECIMAL(10,2), -- kWh/kW for solar
    efficiency_rating DECIMAL(5,4),
    lifespan_years INTEGER,
    warranty_years INTEGER,
    -- Incentive Eligibility
    itc_eligible BOOLEAN DEFAULT true,
    domestic_content_available BOOLEAN DEFAULT false,
    -- Regional Adjustments
    regional_multipliers JSONB DEFAULT '{}',
    -- Validity
    effective_date DATE NOT NULL,
    expiration_date DATE,
    data_source VARCHAR(100),
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT COST ESTIMATES TABLE
-- Stores calculated cost estimates for projects
-- ============================================================================
CREATE TABLE project_cost_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- Estimate Version
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    estimate_type VARCHAR(50) DEFAULT 'preliminary', -- preliminary, detailed, final
    -- Base Costs
    base_construction_cost DECIMAL(15,2),
    base_cost_psf DECIMAL(10,2),
    regional_multiplier DECIMAL(5,4),
    adjusted_base_cost DECIMAL(15,2),
    -- Sustainability Costs by Tier
    tier_1_total_cost DECIMAL(15,2),
    tier_1_premium DECIMAL(15,2),
    tier_2_total_cost DECIMAL(15,2),
    tier_2_premium DECIMAL(15,2),
    tier_3_total_cost DECIMAL(15,2),
    tier_3_premium DECIMAL(15,2),
    tier_3_tnz_total_cost DECIMAL(15,2),
    tier_3_tnz_premium DECIMAL(15,2),
    -- Incentives by Tier
    tier_1_incentives DECIMAL(15,2),
    tier_2_incentives DECIMAL(15,2),
    tier_3_incentives DECIMAL(15,2),
    tier_3_tnz_incentives DECIMAL(15,2),
    -- Net Costs by Tier (Cost - Incentives)
    tier_1_net_cost DECIMAL(15,2),
    tier_2_net_cost DECIMAL(15,2),
    tier_3_net_cost DECIMAL(15,2),
    tier_3_tnz_net_cost DECIMAL(15,2),
    -- Recommended Tier
    recommended_tier sustainability_tier,
    recommendation_reason TEXT,
    -- Detailed Breakdown
    cost_breakdown JSONB DEFAULT '{}',
    incentive_breakdown JSONB DEFAULT '{}',
    -- Energy Systems (if applicable)
    energy_systems_cost DECIMAL(15,2),
    energy_systems_detail JSONB DEFAULT '[]',
    -- Input Parameters Used
    input_parameters JSONB DEFAULT '{}',
    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    calculated_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_rs_means_building_type ON rs_means_cost_data(building_type);
CREATE INDEX idx_rs_means_regional_state ON rs_means_regional_multipliers(state);
CREATE INDEX idx_rs_means_regional_zip ON rs_means_regional_multipliers(zip_code_prefix);
CREATE INDEX idx_sustainability_premiums_type ON sustainability_cost_premiums(building_type);
CREATE INDEX idx_sustainability_premiums_tier ON sustainability_cost_premiums(sustainability_tier);
CREATE INDEX idx_tier_multipliers_program ON tier_incentive_multipliers(incentive_program_id);
CREATE INDEX idx_energy_system_type ON energy_system_costs(system_type);
CREATE INDEX idx_cost_estimates_project ON project_cost_estimates(project_id);
CREATE INDEX idx_cost_estimates_current ON project_cost_estimates(project_id, is_current) WHERE is_current = true;
CREATE INDEX idx_projects_sustainability_tier ON projects(sustainability_tier);

-- ============================================================================
-- SEED DATA: RS MEANS BASE COSTS (2026 Estimates)
-- ============================================================================
INSERT INTO rs_means_cost_data (building_type, building_subtype, construction_quality, base_cost_psf, effective_date) VALUES
-- Multifamily
('multifamily', 'low_rise_1_3', 'average', 285.00, '2026-01-01'),
('multifamily', 'mid_rise_4_7', 'average', 315.00, '2026-01-01'),
('multifamily', 'high_rise_8_plus', 'average', 385.00, '2026-01-01'),
('multifamily', 'affordable_housing', 'average', 295.00, '2026-01-01'),
-- Mixed Use
('mixed_use', 'retail_residential', 'average', 335.00, '2026-01-01'),
('mixed_use', 'office_residential', 'average', 365.00, '2026-01-01'),
-- Commercial
('commercial', 'office_class_a', 'average', 425.00, '2026-01-01'),
('commercial', 'office_class_b', 'average', 325.00, '2026-01-01'),
('commercial', 'retail', 'average', 225.00, '2026-01-01'),
-- Industrial
('industrial', 'warehouse', 'average', 145.00, '2026-01-01'),
('industrial', 'manufacturing', 'average', 195.00, '2026-01-01'),
-- Solar
('solar', 'rooftop', 'average', 2.50, '2026-01-01'), -- $/watt DC
('solar', 'ground_mount', 'average', 1.80, '2026-01-01'),
('solar', 'carport', 'average', 3.20, '2026-01-01');

-- ============================================================================
-- SEED DATA: NY REGIONAL MULTIPLIERS
-- ============================================================================
INSERT INTO rs_means_regional_multipliers (state, city, zip_code_prefix, metro_area, total_multiplier, material_multiplier, labor_multiplier, effective_date) VALUES
-- New York Metro
('NY', 'New York City', '100', 'NYC Metro', 1.42, 1.15, 1.65, '2026-01-01'),
('NY', 'New York City', '101', 'NYC Metro', 1.42, 1.15, 1.65, '2026-01-01'),
('NY', 'New York City', '102', 'NYC Metro', 1.42, 1.15, 1.65, '2026-01-01'),
-- Westchester
('NY', 'White Plains', '106', 'Westchester', 1.35, 1.12, 1.55, '2026-01-01'),
('NY', 'Yonkers', '107', 'Westchester', 1.32, 1.10, 1.50, '2026-01-01'),
('NY', 'Mount Vernon', '105', 'Westchester', 1.30, 1.10, 1.48, '2026-01-01'),
('NY', 'New Rochelle', '108', 'Westchester', 1.32, 1.11, 1.50, '2026-01-01'),
-- Long Island
('NY', 'Long Island', '110', 'Long Island', 1.38, 1.12, 1.60, '2026-01-01'),
('NY', 'Long Island', '117', 'Long Island', 1.38, 1.12, 1.60, '2026-01-01'),
-- Upstate
('NY', 'Albany', '120', 'Capital Region', 1.08, 1.02, 1.12, '2026-01-01'),
('NY', 'Buffalo', '142', 'Western NY', 1.05, 1.00, 1.08, '2026-01-01'),
('NY', 'Syracuse', '132', 'Central NY', 1.02, 0.98, 1.05, '2026-01-01');

-- ============================================================================
-- SEED DATA: SUSTAINABILITY COST PREMIUMS
-- ============================================================================
INSERT INTO sustainability_cost_premiums (building_type, sustainability_tier, premium_psf, premium_percentage, envelope_premium_psf, hvac_premium_psf, renewable_premium_psf, certification_path, energy_savings_annual_psf, effective_date) VALUES
-- Multifamily
('multifamily', 'tier_1_efficient', 8.00, 0.028, 3.00, 4.00, 1.00, ARRAY['Energy Star', 'NGBS Bronze'], 0.85, '2026-01-01'),
('multifamily', 'tier_2_high_performance', 22.00, 0.075, 10.00, 8.00, 4.00, ARRAY['LEED Gold', 'Passive House'], 2.10, '2026-01-01'),
('multifamily', 'tier_3_net_zero', 38.00, 0.125, 15.00, 12.00, 11.00, ARRAY['LEED Platinum', 'Passive House', 'Net Zero'], 3.50, '2026-01-01'),
('multifamily', 'tier_3_triple_net_zero', 52.00, 0.175, 15.00, 12.00, 11.00, ARRAY['Living Building Challenge', 'Triple Net Zero'], 4.20, '2026-01-01'),
-- Mixed Use
('mixed_use', 'tier_1_efficient', 10.00, 0.030, 4.00, 5.00, 1.00, ARRAY['Energy Star'], 1.00, '2026-01-01'),
('mixed_use', 'tier_2_high_performance', 28.00, 0.085, 12.00, 10.00, 6.00, ARRAY['LEED Gold'], 2.50, '2026-01-01'),
('mixed_use', 'tier_3_net_zero', 48.00, 0.145, 18.00, 15.00, 15.00, ARRAY['LEED Platinum', 'Net Zero'], 4.00, '2026-01-01'),
('mixed_use', 'tier_3_triple_net_zero', 65.00, 0.195, 18.00, 15.00, 15.00, ARRAY['Living Building Challenge'], 5.00, '2026-01-01'),
-- Commercial Office
('commercial', 'tier_1_efficient', 12.00, 0.030, 5.00, 6.00, 1.00, ARRAY['Energy Star'], 1.20, '2026-01-01'),
('commercial', 'tier_2_high_performance', 32.00, 0.080, 14.00, 12.00, 6.00, ARRAY['LEED Gold', 'WELL Silver'], 2.80, '2026-01-01'),
('commercial', 'tier_3_net_zero', 55.00, 0.135, 22.00, 18.00, 15.00, ARRAY['LEED Platinum', 'Net Zero'], 4.50, '2026-01-01'),
('commercial', 'tier_3_triple_net_zero', 72.00, 0.180, 22.00, 18.00, 15.00, ARRAY['Living Building Challenge'], 5.50, '2026-01-01');

-- ============================================================================
-- SEED DATA: ENERGY SYSTEM COSTS (2026)
-- ============================================================================
INSERT INTO energy_system_costs (system_type, system_subtype, unit_of_measure, cost_per_unit, installation_cost_per_unit, total_installed_cost_per_unit, annual_production_per_unit, lifespan_years, itc_eligible, domestic_content_available, effective_date, data_source) VALUES
-- Solar PV
('solar', 'rooftop_commercial', 'kW', 1800.00, 700.00, 2500.00, 1200.00, 25, true, true, '2026-01-01', 'NREL ATB 2026'),
('solar', 'rooftop_residential', 'kW', 2200.00, 800.00, 3000.00, 1150.00, 25, true, true, '2026-01-01', 'NREL ATB 2026'),
('solar', 'ground_mount_utility', 'kW', 1200.00, 600.00, 1800.00, 1350.00, 30, true, true, '2026-01-01', 'NREL ATB 2026'),
('solar', 'carport', 'kW', 2400.00, 800.00, 3200.00, 1200.00, 25, true, true, '2026-01-01', 'NREL ATB 2026'),
-- Battery Storage
('battery', 'lithium_ion_commercial', 'kWh', 350.00, 100.00, 450.00, NULL, 15, true, true, '2026-01-01', 'NREL ATB 2026'),
('battery', 'lithium_ion_residential', 'kWh', 550.00, 150.00, 700.00, NULL, 10, true, true, '2026-01-01', 'NREL ATB 2026'),
-- Heat Pumps
('heat_pump', 'air_source', 'ton', 4500.00, 2000.00, 6500.00, NULL, 15, true, false, '2026-01-01', 'DOE/CEE'),
('heat_pump', 'ground_source', 'ton', 8000.00, 7000.00, 15000.00, NULL, 25, true, false, '2026-01-01', 'DOE/CEE'),
('heat_pump', 'vrf_system', 'ton', 6000.00, 3000.00, 9000.00, NULL, 20, true, false, '2026-01-01', 'DOE/CEE'),
-- Geothermal
('geothermal', 'vertical_loop', 'ton', 10000.00, 8000.00, 18000.00, NULL, 50, true, false, '2026-01-01', 'NYSERDA'),
('geothermal', 'horizontal_loop', 'ton', 8000.00, 6000.00, 14000.00, NULL, 50, true, false, '2026-01-01', 'NYSERDA'),
-- EV Charging
('ev_charging', 'level_2', 'port', 3500.00, 2500.00, 6000.00, NULL, 10, false, false, '2026-01-01', 'DOE'),
('ev_charging', 'dcfc_50kw', 'port', 35000.00, 25000.00, 60000.00, NULL, 10, false, false, '2026-01-01', 'DOE'),
('ev_charging', 'dcfc_150kw', 'port', 75000.00, 40000.00, 115000.00, NULL, 10, false, false, '2026-01-01', 'DOE');

-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================================
ALTER TABLE rs_means_cost_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE rs_means_regional_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sustainability_cost_premiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_incentive_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_system_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_cost_estimates ENABLE ROW LEVEL SECURITY;

-- Public read access for cost data
CREATE POLICY "Anyone can view RS Means data" ON rs_means_cost_data FOR SELECT USING (true);
CREATE POLICY "Anyone can view regional multipliers" ON rs_means_regional_multipliers FOR SELECT USING (true);
CREATE POLICY "Anyone can view sustainability premiums" ON sustainability_cost_premiums FOR SELECT USING (true);
CREATE POLICY "Anyone can view tier multipliers" ON tier_incentive_multipliers FOR SELECT USING (true);
CREATE POLICY "Anyone can view energy system costs" ON energy_system_costs FOR SELECT USING (true);

-- Project cost estimates - org members only
CREATE POLICY "Org members can view cost estimates" ON project_cost_estimates
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Org members can manage cost estimates" ON project_cost_estimates
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- ============================================================================
-- FUNCTION: Calculate Project Cost Estimate
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_project_cost_estimate(p_project_id UUID)
RETURNS UUID AS $$
DECLARE
    v_project RECORD;
    v_base_cost RECORD;
    v_regional RECORD;
    v_estimate_id UUID;
    v_base_psf DECIMAL(10,2);
    v_adjusted_base DECIMAL(15,2);
    v_tier_premiums JSONB DEFAULT '{}';
    v_tier_incentives JSONB DEFAULT '{}';
BEGIN
    -- Get project details
    SELECT * INTO v_project FROM projects WHERE id = p_project_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Project not found';
    END IF;

    -- Get base cost for building type
    SELECT * INTO v_base_cost
    FROM rs_means_cost_data
    WHERE building_type = COALESCE(v_project.rs_means_building_type, v_project.building_type)
    AND construction_quality = 'average'
    AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE)
    ORDER BY effective_date DESC
    LIMIT 1;

    -- Default if no match
    v_base_psf := COALESCE(v_base_cost.base_cost_psf, 300.00);

    -- Get regional multiplier
    SELECT * INTO v_regional
    FROM rs_means_regional_multipliers
    WHERE state = v_project.state
    AND (zip_code_prefix IS NULL OR v_project.zip_code LIKE zip_code_prefix || '%')
    ORDER BY zip_code_prefix DESC NULLS LAST
    LIMIT 1;

    -- Calculate adjusted base
    v_adjusted_base := v_base_psf * COALESCE(v_regional.total_multiplier, 1.0) * COALESCE(v_project.total_sqft, 0);

    -- Mark previous estimates as not current
    UPDATE project_cost_estimates
    SET is_current = false
    WHERE project_id = p_project_id AND is_current = true;

    -- Create new estimate
    INSERT INTO project_cost_estimates (
        project_id,
        estimate_type,
        base_cost_psf,
        regional_multiplier,
        base_construction_cost,
        adjusted_base_cost,
        input_parameters
    ) VALUES (
        p_project_id,
        'preliminary',
        v_base_psf,
        COALESCE(v_regional.total_multiplier, 1.0),
        v_base_psf * COALESCE(v_project.total_sqft, 0),
        v_adjusted_base,
        jsonb_build_object(
            'building_type', v_project.building_type,
            'sqft', v_project.total_sqft,
            'state', v_project.state,
            'zip_code', v_project.zip_code
        )
    )
    RETURNING id INTO v_estimate_id;

    RETURN v_estimate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE rs_means_cost_data IS 'Base construction costs by building type from RS Means';
COMMENT ON TABLE rs_means_regional_multipliers IS 'Regional cost adjustment factors';
COMMENT ON TABLE sustainability_cost_premiums IS 'Additional costs for each sustainability tier';
COMMENT ON TABLE tier_incentive_multipliers IS 'How incentive values change by sustainability tier';
COMMENT ON TABLE energy_system_costs IS 'Current costs for renewable energy and efficiency systems';
COMMENT ON TABLE project_cost_estimates IS 'Calculated cost estimates for projects by tier';
COMMENT ON TYPE sustainability_tier IS 'Tier 1=Efficient, Tier 2=High Performance, Tier 3=Net Zero, Triple=Energy+Water+Waste';
