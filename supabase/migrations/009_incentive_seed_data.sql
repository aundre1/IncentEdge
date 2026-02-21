-- IncentEdge Database Schema
-- Migration: 003_incentive_seed_data
-- Description: Comprehensive seed data for incentive programs (Federal, NY State, Westchester, Utility)
-- Date: 2026-01-09

-- ============================================================================
-- PROGRAM SYNC TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS program_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_type VARCHAR(50) NOT NULL, -- 'full', 'incremental', 'manual'
    source VARCHAR(100) NOT NULL, -- 'dsire', 'manual', 'api', etc.
    status VARCHAR(30) DEFAULT 'started' CHECK (status IN ('started', 'in_progress', 'completed', 'failed')),
    programs_added INTEGER DEFAULT 0,
    programs_updated INTEGER DEFAULT 0,
    programs_deactivated INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    triggered_by UUID,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_sync_log_status ON program_sync_log(status);
CREATE INDEX idx_sync_log_started ON program_sync_log(started_at DESC);

-- ============================================================================
-- PROGRAM CHANGE HISTORY TABLE
-- For conflict resolution and audit trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS program_change_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES incentive_programs(id) ON DELETE CASCADE,
    change_type VARCHAR(30) NOT NULL CHECK (change_type IN ('create', 'update', 'deactivate', 'reactivate')),
    field_changes JSONB DEFAULT '{}', -- {"field": {"old": x, "new": y}}
    source VARCHAR(100), -- Who/what made the change
    sync_log_id UUID REFERENCES program_sync_log(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_change_history_program ON program_change_history(program_id);
CREATE INDEX idx_change_history_created ON program_change_history(created_at DESC);

-- ============================================================================
-- FEDERAL IRA TAX CREDITS
-- ============================================================================

-- Investment Tax Credit (ITC) - Section 48
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    incentive_type,
    amount_type,
    amount_percentage,
    amount_min,
    amount_max,
    direct_pay_eligible,
    transferable,
    domestic_content_bonus,
    energy_community_bonus,
    prevailing_wage_bonus,
    low_income_bonus,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'IRA-ITC-48',
    'Investment Tax Credit (ITC) - Section 48',
    'ITC',
    'The Investment Tax Credit provides a tax credit for investments in clean energy property including solar, battery storage, geothermal, small wind, fuel cells, microturbines, combined heat and power, and geothermal heat pumps. Base credit is 6% but increases to 30% with prevailing wage and apprenticeship requirements. Additional bonuses available for domestic content, energy communities, and low-income projects.',
    'Up to 30% + bonuses tax credit for clean energy property investments. Direct pay available for tax-exempt entities.',
    'tax_credit',
    'federal',
    'IRA Clean Energy',
    ARRAY['real-estate', 'clean-energy', 'industrial'],
    ARRAY['solar', 'battery_storage', 'geothermal', 'small_wind', 'fuel_cells', 'microturbines', 'chp', 'geothermal_heat_pump'],
    ARRAY['multifamily', 'commercial', 'industrial', 'mixed_use'],
    'federal',
    'tax_credit',
    'percentage',
    0.30, -- 30% base with PWA
    NULL,
    NULL,
    true, -- Direct pay eligible
    true, -- Transferable
    0.10, -- 10% domestic content bonus
    0.10, -- 10% energy community bonus
    0.24, -- 30% vs 6% = 24% effective bonus for prevailing wage
    0.20, -- Up to 20% for low-income projects
    'active',
    '2022-08-16',
    '2034-12-31',
    'Internal Revenue Service',
    'U.S. Department of Treasury',
    'https://www.irs.gov/credits-deductions/businesses/investment-tax-credit',
    'complex',
    90,
    true,
    '{
        "minimum_requirements": [
            {"field": "technology_type", "operator": "in", "values": ["solar", "battery_storage", "geothermal", "small_wind", "fuel_cells", "microturbines", "chp", "geothermal_heat_pump"]},
            {"field": "construction_start", "operator": ">=", "value": "2022-08-16"}
        ],
        "bonus_requirements": {
            "prevailing_wage": {
                "description": "Pay prevailing wages during construction and for 5 years of operation",
                "bonus": 0.24
            },
            "apprenticeship": {
                "description": "Use qualified apprentices for 12.5-15% of labor hours",
                "bonus": "included_in_prevailing_wage"
            },
            "domestic_content": {
                "description": "Use 40% domestic steel/iron and 20% manufactured products (increasing)",
                "bonus": 0.10
            },
            "energy_community": {
                "description": "Located in brownfield, coal community, or high fossil fuel employment area",
                "bonus": 0.10
            },
            "low_income": {
                "description": "Located in low-income community or on Indian land (10%) or part of qualified low-income residential/economic benefit project (20%)",
                "bonus": [0.10, 0.20]
            }
        }
    }',
    'Base 6% credit (30% with prevailing wage/apprenticeship). Bonuses: +10% domestic content, +10% energy community, +10-20% low-income. Direct pay for tax-exempt entities.',
    ARRAY['for-profit', 'nonprofit', 'municipal', 'tribal'],
    NOW(),
    'IRS/Treasury',
    0.98
);

-- Production Tax Credit (PTC) - Section 45
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    incentive_type,
    amount_type,
    amount_per_kw,
    direct_pay_eligible,
    transferable,
    domestic_content_bonus,
    energy_community_bonus,
    prevailing_wage_bonus,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'IRA-PTC-45',
    'Production Tax Credit (PTC) - Section 45',
    'PTC',
    'The Production Tax Credit provides a per-kWh credit for electricity generated from qualified renewable energy resources over a 10-year period. Base credit is 0.3 cents/kWh increasing to 1.5 cents/kWh (adjusted for inflation to ~2.75 cents/kWh in 2026) with prevailing wage and apprenticeship requirements.',
    'Per-kWh credit for renewable electricity generation over 10 years. Alternative to ITC for wind and solar projects.',
    'tax_credit',
    'federal',
    'IRA Clean Energy',
    ARRAY['clean-energy'],
    ARRAY['wind', 'solar', 'geothermal', 'marine_hydrokinetic', 'small_hydro'],
    ARRAY['utility_scale', 'commercial', 'industrial'],
    'federal',
    'tax_credit',
    'per_kw',
    27.50, -- ~$0.0275/kWh for 10 years, expressed as $/kW capacity equivalent
    true,
    true,
    0.10,
    0.10,
    0.24,
    'active',
    '2022-08-16',
    '2034-12-31',
    'Internal Revenue Service',
    'U.S. Department of Treasury',
    'https://www.irs.gov/credits-deductions/businesses/renewable-electricity-production-credit',
    'complex',
    true,
    '{
        "minimum_requirements": [
            {"field": "technology_type", "operator": "in", "values": ["wind", "solar", "geothermal", "marine_hydrokinetic", "small_hydro"]},
            {"field": "ownership_type", "operator": "not_in", "values": ["utility_regulated"]}
        ],
        "credit_period_years": 10,
        "base_credit_per_kwh": 0.003,
        "full_credit_per_kwh": 0.015,
        "inflation_adjusted_2026": 0.0275
    }',
    'Base 0.3 cents/kWh (1.5 cents with PWA, ~2.75 cents adjusted for inflation). 10-year credit period. Alternative to ITC.',
    ARRAY['for-profit', 'nonprofit', 'municipal', 'tribal'],
    NOW(),
    'IRS/Treasury',
    0.98
);

-- Section 45L New Energy Efficient Home Credit
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    incentive_type,
    amount_type,
    amount_per_unit,
    amount_min,
    amount_max,
    direct_pay_eligible,
    transferable,
    prevailing_wage_bonus,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'IRA-45L',
    'New Energy Efficient Home Credit - Section 45L',
    '45L Credit',
    'Tax credit for contractors and developers who build or substantially reconstruct energy-efficient single-family or multifamily dwelling units. Credit ranges from $500-$5,000 per unit based on energy performance level. Higher credits available for ENERGY STAR and Zero Energy Ready Home certifications, and for multifamily projects meeting prevailing wage requirements.',
    'Up to $5,000 per unit for energy efficient new construction or substantial rehab. Key incentive for affordable housing.',
    'tax_credit',
    'federal',
    'IRA Energy Efficiency',
    ARRAY['real-estate'],
    ARRAY['energy_efficiency', 'heat_pump', 'insulation', 'windows'],
    ARRAY['single_family', 'multifamily', 'affordable_housing'],
    'federal',
    'tax_credit',
    'per_unit',
    2500.00, -- Base amount
    500.00, -- Minimum
    5000.00, -- Maximum
    false, -- Not direct pay eligible
    true, -- Transferable
    1.00, -- Double credit for multifamily with prevailing wage
    'active',
    '2023-01-01',
    '2032-12-31',
    'Internal Revenue Service',
    'U.S. Department of Treasury',
    'https://www.irs.gov/credits-deductions/businesses/new-energy-efficient-home-credit',
    'moderate',
    60,
    true,
    '{
        "minimum_requirements": [
            {"field": "construction_type", "operator": "in", "values": ["new-construction", "substantial-rehab"]},
            {"field": "building_type", "operator": "in", "values": ["single_family", "multifamily", "affordable_housing"]}
        ],
        "credit_tiers": {
            "single_family_and_low_rise": {
                "energy_star": {"credit": 2500, "requirement": "ENERGY STAR certified"},
                "zero_energy_ready": {"credit": 5000, "requirement": "DOE Zero Energy Ready Home certified"}
            },
            "multifamily": {
                "base_efficiency": {"credit": 500, "requirement": "Meets ENERGY STAR Multifamily New Construction"},
                "energy_star": {"credit": 1000, "requirement": "ENERGY STAR certified + prevailing wage"},
                "zero_energy_ready": {"credit": 2500, "requirement": "DOE Zero Energy Ready Home + prevailing wage"},
                "with_prevailing_wage_bonus": {"credit_multiplier": 5, "max_credit": 5000}
            }
        }
    }',
    'Single-family: $2,500 (ENERGY STAR) or $5,000 (Zero Energy Ready). Multifamily: $500-$5,000/unit based on certification and prevailing wage.',
    ARRAY['for-profit'],
    NOW(),
    'IRS/Treasury',
    0.95
);

-- Section 179D Energy Efficient Commercial Buildings Deduction
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    incentive_type,
    amount_type,
    amount_per_sqft,
    amount_min,
    amount_max,
    direct_pay_eligible,
    transferable,
    prevailing_wage_bonus,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'IRA-179D',
    'Energy Efficient Commercial Buildings Deduction - Section 179D',
    '179D Deduction',
    'Tax deduction for energy efficient commercial buildings and multifamily buildings 4+ stories. Deduction ranges from $0.50-$5.00 per square foot based on energy savings achieved. Higher deductions available with prevailing wage and apprenticeship compliance. Designers (architects, engineers) of government-owned buildings can claim the deduction.',
    'Up to $5.00/sqft deduction for energy efficient commercial buildings. Designers can claim for government buildings.',
    'tax_credit',
    'federal',
    'IRA Energy Efficiency',
    ARRAY['real-estate'],
    ARRAY['energy_efficiency', 'hvac', 'lighting', 'building_envelope'],
    ARRAY['commercial', 'multifamily', 'industrial', 'government'],
    'federal',
    'tax_credit',
    'per_sqft',
    2.50, -- Mid-range
    0.50, -- Minimum
    5.00, -- Maximum
    false,
    false, -- Not transferable
    4.00, -- $5 vs $1 = $4 effective bonus
    'active',
    '2023-01-01',
    '2032-12-31',
    'Internal Revenue Service',
    'U.S. Department of Treasury',
    'https://www.irs.gov/credits-deductions/businesses/energy-efficient-commercial-buildings-deduction',
    'complex',
    90,
    true,
    '{
        "minimum_requirements": [
            {"field": "building_type", "operator": "in", "values": ["commercial", "multifamily_4_plus", "industrial", "government"]},
            {"field": "energy_reduction_pct", "operator": ">=", "value": 25}
        ],
        "deduction_tiers": {
            "base_rate": {
                "minimum_savings": 25,
                "deduction_per_sqft": 0.50,
                "incremental_per_pct": 0.02
            },
            "with_prevailing_wage": {
                "minimum_savings": 25,
                "deduction_per_sqft": 2.50,
                "incremental_per_pct": 0.10,
                "maximum": 5.00
            }
        },
        "designer_allocation": {
            "eligible": true,
            "applies_to": "government_owned_buildings",
            "description": "Designers can claim deduction for government buildings"
        }
    }',
    'Base $0.50-$1.00/sqft (25-50% savings). With prevailing wage: $2.50-$5.00/sqft. Designers can claim for government buildings.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'IRS/Treasury',
    0.95
);

-- Section 45X Advanced Manufacturing Production Credit
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    incentive_type,
    amount_type,
    amount_fixed,
    direct_pay_eligible,
    transferable,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'IRA-45X',
    'Advanced Manufacturing Production Credit - Section 45X',
    '45X Manufacturing',
    'Production tax credit for domestic manufacturing of clean energy components including solar cells/modules, wind components, battery cells/modules, and critical minerals processing. Credits are calculated per unit of production, supporting reshoring of clean energy supply chains.',
    'Production credit for domestic manufacturing of solar, wind, battery, and critical mineral components.',
    'tax_credit',
    'federal',
    'IRA Manufacturing',
    ARRAY['industrial', 'clean-energy'],
    ARRAY['solar_manufacturing', 'wind_manufacturing', 'battery_manufacturing', 'critical_minerals'],
    ARRAY['industrial', 'manufacturing'],
    'federal',
    'tax_credit',
    'variable',
    NULL,
    true, -- Direct pay eligible
    true, -- Transferable
    'active',
    '2022-08-16',
    '2032-12-31',
    'Internal Revenue Service',
    'U.S. Department of Treasury',
    'https://www.irs.gov/credits-deductions/businesses/advanced-manufacturing-production-credit',
    'very_complex',
    true,
    '{
        "minimum_requirements": [
            {"field": "location", "operator": "in", "values": ["US"]},
            {"field": "product_type", "operator": "in", "values": ["solar_cells", "solar_modules", "wind_blades", "wind_nacelles", "wind_towers", "battery_cells", "battery_modules", "critical_minerals"]}
        ],
        "credit_amounts": {
            "solar_cells": {"amount": 0.04, "unit": "per_watt"},
            "solar_modules": {"amount": 0.07, "unit": "per_watt"},
            "wind_blades": {"amount": 0.02, "unit": "per_watt"},
            "wind_nacelles": {"amount": 0.05, "unit": "per_watt"},
            "wind_towers": {"amount": 0.03, "unit": "per_watt"},
            "battery_cells": {"amount": 35.00, "unit": "per_kwh"},
            "battery_modules": {"amount": 10.00, "unit": "per_kwh"},
            "critical_minerals": {"amount": 0.10, "unit": "per_dollar_production_cost"}
        }
    }',
    'Per-unit credits: Solar cells $0.04/W, modules $0.07/W; Battery cells $35/kWh, modules $10/kWh; Critical minerals 10% of costs.',
    ARRAY['for-profit'],
    NOW(),
    'IRS/Treasury',
    0.95
);

-- New Markets Tax Credit (NMTC)
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    incentive_type,
    amount_type,
    amount_percentage,
    amount_max,
    direct_pay_eligible,
    transferable,
    status,
    start_date,
    end_date,
    application_deadline,
    funding_remaining,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    stacking_restrictions,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'FED-NMTC',
    'New Markets Tax Credit (NMTC)',
    'NMTC',
    'The NMTC program incentivizes community development and economic growth through tax credits to investors who make qualified equity investments in Community Development Entities (CDEs). These investments are used to provide loans and investments to businesses and projects in low-income communities. Credit equals 39% of investment over 7 years.',
    '39% tax credit over 7 years for investments in low-income communities via CDEs. Stackable with LIHTC.',
    'tax_credit',
    'federal',
    'Community Development',
    ARRAY['real-estate', 'industrial'],
    ARRAY['community_development', 'mixed_use', 'commercial'],
    ARRAY['commercial', 'mixed_use', 'industrial', 'community_facilities'],
    'federal',
    'tax_credit',
    'percentage',
    0.39, -- 39% over 7 years
    NULL,
    false,
    false,
    'active',
    '2000-01-01',
    '2025-12-31', -- Currently authorized through 2025
    '2026-03-15',
    5000000000.00, -- $5B annual allocation
    'CDFI Fund',
    'U.S. Department of Treasury',
    'https://www.cdfifund.gov/programs-training/programs/new-markets-tax-credit',
    'very_complex',
    180,
    true,
    ARRAY['Cannot combine with same-year LIHTC on same building portion'],
    '{
        "minimum_requirements": [
            {"field": "location", "operator": "in", "values": ["low_income_community"]},
            {"field": "census_tract_poverty_rate", "operator": ">=", "value": 20},
            {"field": "median_income_ratio", "operator": "<=", "value": 0.80}
        ],
        "credit_schedule": {
            "years_1_3": 0.05,
            "years_4_7": 0.06,
            "total": 0.39
        },
        "compliance_period_years": 7
    }',
    'Must be in census tract with 20%+ poverty OR median income <80% of area median. 39% credit over 7 years via CDE.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'CDFI Fund',
    0.95
);

-- Low Income Housing Tax Credit (LIHTC) 4%
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    incentive_type,
    amount_type,
    amount_percentage,
    direct_pay_eligible,
    transferable,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'FED-LIHTC-4PCT',
    'Low Income Housing Tax Credit - 4% (Tax-Exempt Bonds)',
    '4% LIHTC',
    'The 4% LIHTC is available as-of-right for projects financed with tax-exempt bonds where 50%+ of aggregate basis is financed with bonds. Provides approximately 30% of qualified basis in present value tax credits over 10 years. Not competitive like 9% credits. Combined with tax-exempt bonds for affordable housing development.',
    '~30% of project costs as tax credits for affordable housing financed with 50%+ tax-exempt bonds.',
    'tax_credit',
    'federal',
    'Affordable Housing',
    ARRAY['real-estate'],
    ARRAY['affordable_housing'],
    ARRAY['multifamily', 'affordable_housing'],
    'federal',
    'tax_credit',
    'percentage',
    0.30, -- ~30% present value
    false,
    true, -- Highly transferable/syndicatable
    'active',
    '1986-01-01',
    'Internal Revenue Service',
    'U.S. Department of Treasury / State HFAs',
    'https://www.irs.gov/credits-deductions/businesses/low-income-housing-tax-credit',
    'very_complex',
    120,
    true,
    '{
        "minimum_requirements": [
            {"field": "affordable_units_pct", "operator": ">=", "value": 0.20},
            {"field": "ami_restriction", "operator": "<=", "value": 50},
            {"field": "bond_financing_pct", "operator": ">=", "value": 0.50}
        ],
        "income_tests": {
            "20_50_test": "20% of units at 50% AMI or below",
            "40_60_test": "40% of units at 60% AMI or below",
            "income_averaging": "Average income at 60% AMI, max 80% per unit"
        },
        "compliance_period_years": 15,
        "extended_use_period_years": 15
    }',
    'Requires 20% units at 50% AMI or 40% at 60% AMI. Must finance 50%+ with tax-exempt bonds. 30-year affordability commitment.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'IRS/Treasury',
    0.98
);

-- Low Income Housing Tax Credit (LIHTC) 9%
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    incentive_type,
    amount_type,
    amount_percentage,
    direct_pay_eligible,
    transferable,
    status,
    start_date,
    application_deadline,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'FED-LIHTC-9PCT',
    'Low Income Housing Tax Credit - 9% (Competitive)',
    '9% LIHTC',
    'The 9% LIHTC provides approximately 70% of qualified basis in present value tax credits over 10 years for new construction or substantial rehabilitation without federal subsidies. Highly competitive - allocated annually by state housing finance agencies through Qualified Allocation Plans (QAPs). Key funding source for affordable housing.',
    '~70% of project costs as tax credits. Highly competitive annual allocation by state HFAs.',
    'tax_credit',
    'federal',
    'Affordable Housing',
    ARRAY['real-estate'],
    ARRAY['affordable_housing'],
    ARRAY['multifamily', 'affordable_housing'],
    'federal',
    NULL,
    'tax_credit',
    'percentage',
    0.70, -- ~70% present value
    false,
    true, -- Highly transferable/syndicatable
    'active',
    '1986-01-01',
    '2026-03-01', -- Typical spring deadline, varies by state
    'State Housing Finance Agencies',
    'U.S. Department of Treasury / State HFAs',
    'https://www.irs.gov/credits-deductions/businesses/low-income-housing-tax-credit',
    'very_complex',
    180,
    true,
    '{
        "minimum_requirements": [
            {"field": "affordable_units_pct", "operator": ">=", "value": 0.20},
            {"field": "ami_restriction", "operator": "<=", "value": 50},
            {"field": "federal_subsidy", "operator": "=", "value": false}
        ],
        "qap_priorities": [
            "High poverty areas",
            "Revitalization areas",
            "Supportive housing",
            "Energy efficiency/sustainability",
            "MWBE participation"
        ],
        "state_allocation": "per_capita_formula",
        "compliance_period_years": 15,
        "extended_use_period_years": 15
    }',
    'Requires 20% at 50% AMI or 40% at 60% AMI. Competitive allocation via state QAP. No federal subsidies allowed. 30-year affordability.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'IRS/Treasury',
    0.98
);

-- Historic Tax Credit (HTC)
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    incentive_type,
    amount_type,
    amount_percentage,
    direct_pay_eligible,
    transferable,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'FED-HTC',
    'Federal Historic Tax Credit (HTC)',
    'Historic Tax Credit',
    'A 20% tax credit for the certified rehabilitation of certified historic structures. Buildings must be listed on the National Register of Historic Places or located in a registered historic district and certified as contributing to the district. Rehabilitation must be substantial and meet the Secretary of the Interior Standards.',
    '20% credit for certified rehabilitation of historic buildings. Can be combined with LIHTC for historic affordable housing.',
    'tax_credit',
    'federal',
    'Historic Preservation',
    ARRAY['real-estate'],
    ARRAY['historic_rehabilitation'],
    ARRAY['commercial', 'multifamily', 'mixed_use', 'industrial'],
    'federal',
    'tax_credit',
    'percentage',
    0.20, -- 20%
    false,
    true, -- Transferable
    'active',
    '1976-01-01',
    'National Park Service',
    'U.S. Department of Interior',
    'https://www.nps.gov/subjects/taxincentives/index.htm',
    'complex',
    120,
    true,
    '{
        "minimum_requirements": [
            {"field": "building_status", "operator": "in", "values": ["national_register", "contributing_district"]},
            {"field": "construction_type", "operator": "=", "value": "substantial-rehab"},
            {"field": "rehab_cost_ratio", "operator": ">=", "value": 1.0, "description": "Rehab costs >= adjusted basis"}
        ],
        "certification_process": [
            "Part 1: Building certification (historic significance)",
            "Part 2: Proposed rehabilitation description",
            "Part 3: Completed rehabilitation certification"
        ],
        "standards": "Secretary of the Interior Standards for Rehabilitation"
    }',
    'Building must be on National Register or contributing to historic district. Rehab costs must exceed adjusted basis. Must meet Secretary of Interior Standards.',
    ARRAY['for-profit'],
    NOW(),
    'National Park Service',
    0.95
);


-- ============================================================================
-- NEW YORK STATE PROGRAMS
-- ============================================================================

-- NYSERDA NY-Sun Commercial/Industrial
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    incentive_type,
    amount_type,
    amount_per_kw,
    amount_max,
    direct_pay_eligible,
    transferable,
    status,
    start_date,
    end_date,
    funding_remaining,
    administrator,
    administering_agency,
    source_url,
    application_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'NY-NYSUN-COMM',
    'NY-Sun Commercial/Industrial Incentive',
    'NY-Sun C&I',
    'Upfront capacity-based incentives for commercial, industrial, and multifamily solar PV installations. Incentive levels vary by utility territory and project size. Block-based structure with incentives declining as blocks fill. Stackable with federal ITC.',
    'Up to $0.20/W for commercial solar installations. Block-based incentives by utility territory.',
    'rebate',
    'state',
    'NYSERDA Solar',
    ARRAY['real-estate', 'clean-energy'],
    ARRAY['solar'],
    ARRAY['commercial', 'industrial', 'multifamily'],
    'state',
    'NY',
    'rebate',
    'per_kw',
    200.00, -- $0.20/W = $200/kW
    750000.00, -- Per project cap
    true, -- Direct payment
    false,
    'active',
    '2014-01-01',
    '2026-12-31',
    150000000.00, -- Estimated remaining
    'NYSERDA',
    'New York State Energy Research and Development Authority',
    'https://www.nyserda.ny.gov/All-Programs/NY-Sun',
    'https://www.nyserda.ny.gov/ny-sun-incentives',
    'moderate',
    45,
    true,
    '{
        "minimum_requirements": [
            {"field": "state", "operator": "=", "value": "NY"},
            {"field": "technology_type", "operator": "=", "value": "solar"},
            {"field": "system_size_kw", "operator": ">=", "value": 25}
        ],
        "incentive_blocks": {
            "con_ed": {"current_block": 6, "incentive_per_watt": 0.12},
            "national_grid": {"current_block": 5, "incentive_per_watt": 0.15},
            "nyseg_rge": {"current_block": 4, "incentive_per_watt": 0.18},
            "central_hudson": {"current_block": 5, "incentive_per_watt": 0.16}
        },
        "adders": {
            "affordable_housing": 0.10,
            "canopy_carport": 0.05,
            "community_solar": 0.02
        }
    }',
    'NY location, 25+ kW system. Incentives vary by utility ($0.12-$0.20/W). Adders for affordable housing, canopy, community solar.',
    ARRAY['for-profit', 'nonprofit', 'municipal'],
    NOW(),
    'NYSERDA',
    0.95
);

-- NYSERDA EmPower+ (Low-to-Moderate Income)
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    incentive_type,
    amount_type,
    amount_per_unit,
    amount_max,
    direct_pay_eligible,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'NY-EMPOWER-PLUS',
    'EmPower+ Program (Income-Eligible)',
    'EmPower+',
    'No-cost energy efficiency improvements for income-eligible New Yorkers including insulation, air sealing, heating systems, and health/safety measures. For multifamily affordable housing, provides deep energy retrofits with costs covered by NYSERDA. Supports decarbonization of affordable housing stock.',
    'Free energy efficiency upgrades for income-eligible households. Deep retrofits for affordable multifamily.',
    'grant',
    'state',
    'NYSERDA Efficiency',
    ARRAY['real-estate'],
    ARRAY['energy_efficiency', 'insulation', 'heating', 'weatherization'],
    ARRAY['single_family', 'multifamily', 'affordable_housing'],
    'state',
    'NY',
    'grant',
    'per_unit',
    10000.00, -- Per unit estimate
    500000.00, -- Per building cap
    true,
    'active',
    '2020-01-01',
    'NYSERDA',
    'New York State Energy Research and Development Authority',
    'https://www.nyserda.ny.gov/All-Programs/EmPower-New-York-Program',
    'moderate',
    60,
    true,
    '{
        "minimum_requirements": [
            {"field": "state", "operator": "=", "value": "NY"},
            {"field": "income_level", "operator": "<=", "value": "60_pct_smi"}
        ],
        "income_thresholds": {
            "household_1": 39600,
            "household_2": 51780,
            "household_3": 63960,
            "household_4": 76140
        },
        "eligible_measures": [
            "Insulation",
            "Air sealing",
            "Heating system replacement",
            "Health and safety measures",
            "Electric panel upgrades"
        ],
        "multifamily_requirements": {
            "affordable_units_pct": 0.50,
            "audit_required": true
        }
    }',
    'Income at or below 60% State Median Income. Covers insulation, air sealing, heating systems. 50%+ affordable units for multifamily.',
    ARRAY['for-profit', 'nonprofit', 'municipal'],
    NOW(),
    'NYSERDA',
    0.90
);

-- NY Green Bank
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    incentive_type,
    amount_type,
    amount_min,
    amount_max,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'NY-GREEN-BANK',
    'NY Green Bank - Clean Energy Financing',
    'NY Green Bank',
    'NY Green Bank provides innovative financing solutions for clean energy projects in New York. Offers construction loans, term loans, credit enhancements, and other financial products to accelerate clean energy deployment. Focuses on transactions $5M+ that require capital market solutions.',
    'Financing solutions for large clean energy projects ($5M+). Construction loans, term debt, credit enhancement.',
    'loan',
    'state',
    'NYSERDA Financing',
    ARRAY['real-estate', 'clean-energy'],
    ARRAY['solar', 'battery_storage', 'energy_efficiency', 'wind', 'geothermal'],
    ARRAY['commercial', 'industrial', 'multifamily', 'utility_scale'],
    'state',
    'NY',
    'loan',
    'variable',
    5000000.00, -- Minimum
    50000000.00, -- Typical max, can go higher
    'active',
    '2014-01-01',
    'NY Green Bank',
    'NYSERDA',
    'https://greenbank.ny.gov/',
    'complex',
    90,
    true,
    '{
        "minimum_requirements": [
            {"field": "state", "operator": "=", "value": "NY"},
            {"field": "project_size", "operator": ">=", "value": 5000000},
            {"field": "technology_type", "operator": "in", "values": ["solar", "wind", "battery_storage", "energy_efficiency", "geothermal", "ev_infrastructure"]}
        ],
        "products": [
            {"type": "Construction Loan", "typical_term": "18-24 months"},
            {"type": "Term Loan", "typical_term": "10-20 years"},
            {"type": "Credit Enhancement", "description": "Subordinated debt, reserves"},
            {"type": "Warehousing", "description": "Aggregation facilities"}
        ],
        "preferred_sectors": [
            "Community distributed generation",
            "Energy efficiency portfolios",
            "Battery storage",
            "Electric vehicle infrastructure"
        ]
    }',
    'NY-based projects, $5M+ transaction size. Solar, storage, efficiency, EV infrastructure. Below-market rates, flexible structures.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'NY Green Bank',
    0.90
);

-- NYS HCR - LIHTC State Allocation
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    incentive_type,
    amount_type,
    amount_per_unit,
    amount_max,
    status,
    start_date,
    application_deadline,
    next_deadline,
    administrator,
    administering_agency,
    source_url,
    application_url,
    application_complexity,
    typical_processing_days,
    stackable,
    required_documents,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'NY-HCR-LIHTC',
    'NYS Homes and Community Renewal - LIHTC Allocation',
    'NYS LIHTC',
    'New York State allocation of federal 9% LIHTC credits through Homes and Community Renewal. Annual competitive application through the Unified Funding process. QAP prioritizes energy efficiency, supportive housing, revitalization areas, and MWBE participation. NYC projects also apply through HCR.',
    '9% LIHTC allocation via NYS HCR Unified Funding. Prioritizes sustainability, supportive housing, and MWBE.',
    'tax_credit',
    'state',
    'Affordable Housing',
    ARRAY['real-estate'],
    ARRAY['affordable_housing'],
    ARRAY['multifamily', 'affordable_housing'],
    'state',
    'NY',
    'tax_credit',
    'per_unit',
    25000.00, -- Annual credit per unit typical
    2500000.00, -- Per project annual cap
    'active',
    '1987-01-01',
    '2026-06-01', -- Typical Unified Funding deadline
    '2026-06-01',
    'NYS Homes and Community Renewal',
    'NYS Homes and Community Renewal',
    'https://hcr.ny.gov/multifamily',
    'https://hcr.ny.gov/unified-funding-2026',
    'very_complex',
    180,
    true,
    ARRAY['Complete UF Application', 'Pro Forma', 'Site Control', 'Environmental Review', 'Market Study', 'Architectural Plans', 'Sustainability Commitment'],
    '{
        "minimum_requirements": [
            {"field": "state", "operator": "=", "value": "NY"},
            {"field": "affordable_units_pct", "operator": ">=", "value": 0.20}
        ],
        "qap_priorities_2026": [
            {"category": "Sustainability", "points": 25, "description": "Passive House, Net Zero, Green Building certification"},
            {"category": "Supportive Housing", "points": 20, "description": "Units for homeless, disabled, or special needs"},
            {"category": "Community Revitalization", "points": 15, "description": "Designated revitalization areas"},
            {"category": "MWBE Participation", "points": 15, "description": "30%+ MWBE participation"},
            {"category": "Transit Access", "points": 10, "description": "Within 1/2 mile of transit"},
            {"category": "Deep Affordability", "points": 15, "description": "Units at 30% AMI or below"}
        ]
    }',
    'Annual competitive application via Unified Funding. QAP priorities: sustainability (25 pts), supportive housing (20 pts), MWBE (15 pts).',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'NYS HCR',
    0.95
);

-- Excelsior Jobs Program
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    incentive_type,
    amount_type,
    amount_percentage,
    amount_max,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'NY-EXCELSIOR',
    'Excelsior Jobs Program',
    'Excelsior',
    'Refundable tax credits for businesses in targeted industries that create or retain jobs in New York. Credits include: Jobs Tax Credit, Investment Tax Credit, R&D Tax Credit, and Real Property Tax Credit. Targeted industries include clean tech, life sciences, manufacturing, and financial services back office.',
    'Refundable tax credits for job creation in clean tech, manufacturing, life sciences. Up to 10-year benefit period.',
    'tax_credit',
    'state',
    'Economic Development',
    ARRAY['industrial', 'clean-energy'],
    ARRAY['manufacturing', 'clean_tech', 'life_sciences'],
    ARRAY['commercial', 'industrial', 'manufacturing'],
    'state',
    'NY',
    'tax_credit',
    'percentage',
    NULL,
    10000000.00, -- Per project cap
    'active',
    '2010-01-01',
    '2029-12-31',
    'Empire State Development',
    'Empire State Development',
    'https://esd.ny.gov/excelsior-jobs-program',
    'complex',
    90,
    true,
    '{
        "minimum_requirements": [
            {"field": "state", "operator": "=", "value": "NY"},
            {"field": "industry", "operator": "in", "values": ["clean_tech", "life_sciences", "manufacturing", "software", "financial_services_back_office"]},
            {"field": "job_creation", "operator": ">=", "value": 10}
        ],
        "credit_components": {
            "jobs_tax_credit": {"rate": 0.065, "per": "wages", "cap": 5000},
            "investment_tax_credit": {"rate": 0.02, "per": "qualified_investment"},
            "rd_tax_credit": {"rate": 0.50, "per": "rd_expenditures"},
            "real_property_tax_credit": {"rate": 0.50, "per": "property_taxes", "requires": "in_distressed_area"}
        },
        "benefit_period_years": 10,
        "job_requirements": {
            "clean_tech": 10,
            "manufacturing": 25,
            "life_sciences": 10
        }
    }',
    'Clean tech: 10+ jobs. Manufacturing: 25+ jobs. Credits: 6.5% of wages, 2% of investment, 50% R&D. 10-year benefit.',
    ARRAY['for-profit'],
    NOW(),
    'Empire State Development',
    0.90
);

-- NYSERDA Clean Heat Program
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    incentive_type,
    amount_type,
    amount_per_unit,
    amount_max,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'NY-CLEAN-HEAT',
    'NYSERDA Clean Heat Program - Heat Pumps',
    'Clean Heat',
    'Incentives for air source and ground source heat pump installations through participating contractors. Incentive amounts vary by technology, capacity, and utility territory. Supports building electrification and decarbonization goals. Higher incentives for affordable housing and low-moderate income customers.',
    'Up to $1,000/ton for heat pump installations. Higher incentives for affordable housing.',
    'rebate',
    'state',
    'NYSERDA Electrification',
    ARRAY['real-estate'],
    ARRAY['heat_pump', 'geothermal'],
    ARRAY['single_family', 'multifamily', 'commercial'],
    'state',
    'NY',
    'rebate',
    'per_unit',
    1000.00, -- Per ton typical
    250000.00, -- Per project cap
    true,
    'active',
    '2019-01-01',
    '2026-12-31',
    'NYSERDA',
    'New York State Energy Research and Development Authority',
    'https://www.nyserda.ny.gov/All-Programs/Clean-Heat',
    'simple',
    30,
    true,
    '{
        "minimum_requirements": [
            {"field": "state", "operator": "=", "value": "NY"},
            {"field": "technology_type", "operator": "in", "values": ["air_source_heat_pump", "ground_source_heat_pump"]}
        ],
        "incentive_rates": {
            "air_source_cold_climate": {"residential": 1000, "commercial": 600, "unit": "per_ton"},
            "ground_source": {"residential": 1500, "commercial": 1000, "unit": "per_ton"}
        },
        "adders": {
            "lmi_customer": 500,
            "affordable_housing": 750,
            "oil_displacement": 200
        }
    }',
    'NY location, qualified heat pump. $600-$1,500/ton based on technology. LMI and affordable housing adders available.',
    ARRAY['for-profit', 'nonprofit', 'municipal'],
    NOW(),
    'NYSERDA',
    0.92
);


-- ============================================================================
-- WESTCHESTER COUNTY PROGRAMS
-- ============================================================================

-- Westchester County IDA PILOT
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    counties,
    incentive_type,
    amount_type,
    amount_percentage,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    contact_email,
    contact_phone,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'WC-IDA-PILOT',
    'Westchester County IDA - Payment in Lieu of Taxes (PILOT)',
    'WC IDA PILOT',
    'Payment in Lieu of Taxes program providing property tax abatement for qualified projects in Westchester County. Standard PILOT is 15 years with phase-in to full taxes. Enhanced PILOT available for affordable housing (20+ years) and green building projects. Projects must demonstrate job creation, community benefit, and financial need.',
    'Property tax abatement: Standard 15-year, Enhanced 20+ years for affordable/green projects. Major cost reduction.',
    'tax_exemption',
    'local',
    'IDA Tax Incentives',
    ARRAY['real-estate'],
    ARRAY['mixed_use', 'commercial', 'affordable_housing', 'manufacturing'],
    ARRAY['multifamily', 'commercial', 'mixed_use', 'industrial', 'affordable_housing'],
    'local',
    'NY',
    ARRAY['Westchester'],
    'tax_exemption',
    'variable',
    NULL,
    'active',
    '1970-01-01',
    'Westchester County IDA',
    'Westchester County Industrial Development Agency',
    'https://westchestergov.com/ida',
    'wcldc@westchestergov.com',
    '914-995-2963',
    'complex',
    90,
    true,
    '{
        "minimum_requirements": [
            {"field": "county", "operator": "=", "value": "Westchester"},
            {"field": "total_project_cost", "operator": ">=", "value": 1000000}
        ],
        "pilot_structures": {
            "standard": {
                "term_years": 15,
                "year_1_rate": 0.10,
                "annual_increase": 0.06,
                "description": "Phase in from 10% to 100% over 15 years"
            },
            "affordable_housing": {
                "term_years": 25,
                "rate": "negotiated",
                "requires": "20%+ affordable units",
                "description": "Extended term for affordable housing projects"
            },
            "green_building": {
                "adder_years": 5,
                "requires": ["LEED Gold", "Passive House", "Net Zero"],
                "description": "Additional 5 years for certified green buildings"
            }
        },
        "benefit_categories": [
            "Job creation/retention",
            "Affordable housing",
            "Green building/sustainability",
            "Revitalization areas",
            "MWBE participation"
        ],
        "application_fee": 7500,
        "closing_fee_pct": 0.01
    }',
    'Westchester County, $1M+ project. Standard 15-year phase-in, extended for affordable housing and green buildings.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'Westchester IDA',
    0.95
);

-- Westchester IDA Sales Tax Exemption
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    counties,
    incentive_type,
    amount_type,
    amount_percentage,
    amount_max,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'WC-IDA-SALES',
    'Westchester County IDA - Sales Tax Exemption',
    'WC Sales Tax Exempt',
    'Exemption from New York State and local sales taxes (8.375% in Westchester) on construction materials, fixtures, furniture, and equipment for IDA-approved projects. Significant cost savings during construction. Requires IDA approval and is typically bundled with PILOT application.',
    '8.375% sales tax exemption on construction materials and equipment. Can save $500K+ on large projects.',
    'tax_exemption',
    'local',
    'IDA Tax Incentives',
    ARRAY['real-estate'],
    ARRAY['construction'],
    ARRAY['multifamily', 'commercial', 'mixed_use', 'industrial'],
    'local',
    'NY',
    ARRAY['Westchester'],
    'tax_exemption',
    'percentage',
    0.08375, -- 8.375% sales tax rate
    5000000.00, -- Typical cap
    'active',
    '1970-01-01',
    'Westchester County IDA',
    'Westchester County Industrial Development Agency',
    'https://westchestergov.com/ida',
    'moderate',
    90,
    true,
    '{
        "minimum_requirements": [
            {"field": "county", "operator": "=", "value": "Westchester"},
            {"field": "ida_approval", "operator": "=", "value": true}
        ],
        "eligible_purchases": [
            "Building materials",
            "Construction equipment",
            "Furniture, fixtures, and equipment (FF&E)",
            "HVAC systems",
            "Electrical equipment",
            "Renewable energy systems"
        ],
        "tax_rate_components": {
            "nys_sales_tax": 0.04,
            "county_sales_tax": 0.04375,
            "total": 0.08375
        },
        "documentation_required": [
            "IDA approval letter",
            "Sales tax exemption form (ST-123)",
            "Detailed purchase list"
        ]
    }',
    'Requires IDA project approval. 8.375% exemption on construction materials, FF&E. Must be purchased during construction period.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'Westchester IDA',
    0.95
);

-- Westchester IDA Mortgage Recording Tax Exemption
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    counties,
    incentive_type,
    amount_type,
    amount_percentage,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'WC-IDA-MRT',
    'Westchester County IDA - Mortgage Recording Tax Exemption',
    'WC MRT Exempt',
    'Exemption from New York State and local mortgage recording tax (1.05% in Westchester for mortgages over $500K) for IDA-approved projects. Applies to construction and permanent financing. Significant savings on larger loans. Part of standard IDA incentive package.',
    '1.05% mortgage recording tax exemption. Saves $10,500 per $1M borrowed.',
    'tax_exemption',
    'local',
    'IDA Tax Incentives',
    ARRAY['real-estate'],
    ARRAY['financing'],
    ARRAY['multifamily', 'commercial', 'mixed_use', 'industrial'],
    'local',
    'NY',
    ARRAY['Westchester'],
    'tax_exemption',
    'percentage',
    0.0105, -- 1.05%
    'active',
    '1970-01-01',
    'Westchester County IDA',
    'Westchester County Industrial Development Agency',
    'https://westchestergov.com/ida',
    'moderate',
    90,
    true,
    '{
        "minimum_requirements": [
            {"field": "county", "operator": "=", "value": "Westchester"},
            {"field": "ida_approval", "operator": "=", "value": true},
            {"field": "mortgage_amount", "operator": ">=", "value": 500000}
        ],
        "tax_rate_components": {
            "basic_tax": 0.005,
            "additional_tax": 0.0025,
            "special_additional": 0.0025,
            "total_over_500k": 0.0105
        },
        "applies_to": [
            "Construction loans",
            "Permanent financing",
            "Refinancing (if within IDA term)"
        ]
    }',
    'Requires IDA project approval. 1.05% exemption on mortgages over $500K. Applies to construction and permanent financing.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'Westchester IDA',
    0.95
);

-- Yonkers IDA Programs
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    counties,
    municipalities,
    incentive_type,
    amount_type,
    amount_percentage,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    contact_email,
    contact_phone,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'YONKERS-IDA',
    'Yonkers Industrial Development Agency - Full Incentive Package',
    'Yonkers IDA',
    'City of Yonkers IDA provides comprehensive incentive packages including PILOT, sales tax exemption, and mortgage recording tax exemption for qualifying projects. Focus on downtown revitalization, affordable housing, and job creation. Can provide more aggressive terms than County IDA for projects with significant community benefit.',
    'Full IDA package for Yonkers projects: PILOT, sales tax, MRT exemption. Priority for downtown and affordable.',
    'tax_exemption',
    'local',
    'IDA Tax Incentives',
    ARRAY['real-estate'],
    ARRAY['mixed_use', 'commercial', 'affordable_housing'],
    ARRAY['multifamily', 'commercial', 'mixed_use'],
    'local',
    'NY',
    ARRAY['Westchester'],
    ARRAY['Yonkers'],
    'tax_exemption',
    'variable',
    NULL,
    'active',
    '1980-01-01',
    'Yonkers IDA',
    'Yonkers Industrial Development Agency',
    'https://www.yonkersida.com/',
    'info@yonkersida.com',
    '914-509-8651',
    'complex',
    120,
    true,
    '{
        "minimum_requirements": [
            {"field": "municipality", "operator": "=", "value": "Yonkers"},
            {"field": "total_project_cost", "operator": ">=", "value": 2000000}
        ],
        "priority_areas": [
            "Downtown Yonkers",
            "Getty Square",
            "Waterfront",
            "Transit-oriented development"
        ],
        "pilot_structures": {
            "standard": {"term_years": 15},
            "affordable_housing": {"term_years": 30},
            "tod_projects": {"term_years": 20}
        },
        "community_benefit_requirements": [
            "Local hiring",
            "MWBE participation",
            "Community space",
            "Affordable housing component"
        ]
    }',
    'Yonkers location, $2M+ project. Priority: downtown, waterfront, affordable housing. Terms negotiable based on community benefit.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'Yonkers IDA',
    0.90
);

-- Mount Vernon Programs
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    counties,
    municipalities,
    incentive_type,
    amount_type,
    amount_percentage,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'MV-IDA-PILOT',
    'Mount Vernon Industrial Development Agency - PILOT Program',
    'Mt Vernon IDA',
    'Mount Vernon IDA provides tax incentives for qualified development projects. As an Urban Renewal/Empire Zone designated city, projects may qualify for enhanced benefits. Focus on revitalization of downtown, transit areas, and affordable housing. Partners with Westchester County IDA on larger projects.',
    'IDA incentives for Mt Vernon. Enhanced benefits in urban renewal areas. Focus on transit-oriented and affordable.',
    'tax_exemption',
    'local',
    'IDA Tax Incentives',
    ARRAY['real-estate'],
    ARRAY['mixed_use', 'commercial', 'affordable_housing'],
    ARRAY['multifamily', 'commercial', 'mixed_use'],
    'local',
    'NY',
    ARRAY['Westchester'],
    ARRAY['Mount Vernon'],
    'tax_exemption',
    'variable',
    NULL,
    'active',
    '1985-01-01',
    'Mount Vernon IDA',
    'City of Mount Vernon',
    'https://www.cmvny.com/departments/planning',
    'complex',
    120,
    true,
    '{
        "minimum_requirements": [
            {"field": "municipality", "operator": "=", "value": "Mount Vernon"}
        ],
        "priority_areas": [
            "Downtown Mount Vernon",
            "Metro North station area",
            "Gramatan Avenue corridor"
        ],
        "special_designations": {
            "urban_renewal_area": true,
            "opportunity_zone": true,
            "empire_zone": "expired_but_enhanced_eligible"
        }
    }',
    'Mount Vernon location. Enhanced benefits in downtown/transit areas. Opportunity Zone overlay available.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'Mount Vernon IDA',
    0.85
);

-- New Rochelle Programs
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    counties,
    municipalities,
    incentive_type,
    amount_type,
    amount_percentage,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    contact_email,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'NR-IDA-PILOT',
    'New Rochelle Industrial Development Agency - PILOT and Tax Incentives',
    'New Rochelle IDA',
    'New Rochelle IDA supports development in the Downtown Overlay Zone (DOZ) and surrounding areas. Standard benefits include PILOT, sales tax exemption, and MRT exemption. The DOZ provides streamlined approvals for projects meeting form-based code requirements. Strong focus on transit-oriented development near New Rochelle Transit Center.',
    'IDA incentives for New Rochelle. DOZ streamlined approvals. Strong TOD focus near transit center.',
    'tax_exemption',
    'local',
    'IDA Tax Incentives',
    ARRAY['real-estate'],
    ARRAY['mixed_use', 'commercial', 'affordable_housing'],
    ARRAY['multifamily', 'commercial', 'mixed_use'],
    'local',
    'NY',
    ARRAY['Westchester'],
    ARRAY['New Rochelle'],
    'tax_exemption',
    'variable',
    NULL,
    'active',
    '1985-01-01',
    'New Rochelle IDA',
    'New Rochelle Industrial Development Agency',
    'https://www.newrochelleny.com/ida',
    'planning@newrochelleny.com',
    'moderate',
    90,
    true,
    '{
        "minimum_requirements": [
            {"field": "municipality", "operator": "=", "value": "New Rochelle"}
        ],
        "priority_areas": [
            "Downtown Overlay Zone",
            "Transit Center District",
            "Lincoln Avenue corridor"
        ],
        "doz_benefits": {
            "streamlined_approvals": true,
            "form_based_code": true,
            "density_bonus_available": true
        },
        "pilot_structure": {
            "standard_term": 15,
            "affordable_term": 25,
            "phase_in": "negotiated"
        }
    }',
    'New Rochelle location. DOZ streamlined approvals. Priority for transit-oriented and affordable housing.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'New Rochelle IDA',
    0.90
);


-- ============================================================================
-- CONED UTILITY PROGRAMS
-- ============================================================================

-- ConEd Commercial Demand Response
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    utility_territories,
    incentive_type,
    amount_type,
    amount_per_kw,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'CONED-DR-COMM',
    'Con Edison Commercial System Relief Program (CSRP)',
    'ConEd CSRP',
    'Demand response program paying commercial customers to reduce electricity usage during peak demand periods. Participants receive capacity payments for enrolled load and energy payments when called to curtail. Typical 10-15 events per summer. Aggregators available for smaller customers.',
    'Demand response payments for peak load reduction. Capacity + energy payments. 10-15 summer events.',
    'rebate',
    'utility',
    'Demand Response',
    ARRAY['real-estate', 'industrial'],
    ARRAY['demand_response', 'battery_storage', 'building_automation'],
    ARRAY['commercial', 'industrial', 'multifamily'],
    'utility',
    'NY',
    ARRAY['Con Edison'],
    'rebate',
    'per_kw',
    150.00, -- Per kW enrolled capacity, typical annual value
    'active',
    '2001-01-01',
    '2026-12-31',
    'Con Edison',
    'Consolidated Edison Company of New York',
    'https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-for-commercial-industrial-buildings-businesses/demand-response',
    'moderate',
    45,
    true,
    '{
        "minimum_requirements": [
            {"field": "utility", "operator": "=", "value": "Con Edison"},
            {"field": "curtailable_load_kw", "operator": ">=", "value": 50}
        ],
        "program_details": {
            "program_period": "May 1 - October 31",
            "event_hours": "2:00 PM - 6:00 PM",
            "typical_events": "10-15 per season",
            "notification": "21-hour advance notice"
        },
        "payment_structure": {
            "reservation_payment": 75,
            "performance_payment": 75,
            "penalty_for_non_performance": true
        }
    }',
    'ConEd territory, 50+ kW curtailable load. May-October events. ~$150/kW annual capacity payment.',
    ARRAY['for-profit', 'nonprofit', 'municipal'],
    NOW(),
    'Con Edison',
    0.92
);

-- ConEd Battery Storage Incentive
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    utility_territories,
    incentive_type,
    amount_type,
    amount_per_kw,
    amount_max,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'CONED-BATTERY',
    'Con Edison Battery Storage Incentive',
    'ConEd Battery',
    'Incentives for behind-the-meter battery storage systems in Con Edison territory. Part of NY REV and Value of DER initiatives. Incentives higher in network-constrained areas. Must participate in demand response program. Can stack with federal ITC and NYSERDA incentives.',
    'Up to $400/kWh for battery storage. Higher in network-constrained areas. Must participate in DR.',
    'rebate',
    'utility',
    'Storage',
    ARRAY['real-estate', 'clean-energy'],
    ARRAY['battery_storage'],
    ARRAY['commercial', 'industrial', 'multifamily'],
    'utility',
    'NY',
    ARRAY['Con Edison'],
    'rebate',
    'per_kw',
    400.00, -- Per kWh, in constrained areas
    1000000.00,
    'active',
    '2018-01-01',
    '2026-12-31',
    'Con Edison',
    'Consolidated Edison Company of New York',
    'https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-for-commercial-industrial-buildings-businesses/battery-storage',
    'complex',
    60,
    true,
    '{
        "minimum_requirements": [
            {"field": "utility", "operator": "=", "value": "Con Edison"},
            {"field": "technology_type", "operator": "=", "value": "battery_storage"},
            {"field": "system_size_kwh", "operator": ">=", "value": 50}
        ],
        "incentive_tiers": {
            "standard_area": {"rate_per_kwh": 200},
            "constrained_network": {"rate_per_kwh": 400},
            "highly_constrained": {"rate_per_kwh": 600}
        },
        "requirements": {
            "demand_response_enrollment": true,
            "minimum_discharge_duration_hours": 2,
            "grid_services_agreement": true
        }
    }',
    'ConEd territory, 50+ kWh system, 2+ hour duration. Must enroll in demand response. $200-$600/kWh based on network area.',
    ARRAY['for-profit', 'nonprofit', 'municipal'],
    NOW(),
    'Con Edison',
    0.90
);

-- ConEd Energy Efficiency Programs
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    utility_territories,
    incentive_type,
    amount_type,
    amount_per_sqft,
    amount_max,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'CONED-EE-COMM',
    'Con Edison Commercial & Industrial Energy Efficiency Program',
    'ConEd C&I EE',
    'Comprehensive energy efficiency rebates for commercial and industrial customers. Covers lighting, HVAC, motors, building envelope, controls, and custom measures. Prescriptive rebates for standard equipment, custom incentives based on calculated savings for unique projects.',
    'Rebates for lighting, HVAC, motors, controls, custom measures. Prescriptive and custom incentives available.',
    'rebate',
    'utility',
    'Energy Efficiency',
    ARRAY['real-estate', 'industrial'],
    ARRAY['energy_efficiency', 'hvac', 'lighting', 'building_automation'],
    ARRAY['commercial', 'industrial', 'multifamily'],
    'utility',
    'NY',
    ARRAY['Con Edison'],
    'rebate',
    'per_sqft',
    2.00, -- Typical value range
    500000.00,
    'active',
    '2010-01-01',
    '2026-12-31',
    'Con Edison',
    'Consolidated Edison Company of New York',
    'https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-for-commercial-industrial-buildings-businesses',
    'moderate',
    30,
    true,
    '{
        "minimum_requirements": [
            {"field": "utility", "operator": "=", "value": "Con Edison"},
            {"field": "customer_type", "operator": "in", "values": ["commercial", "industrial"]}
        ],
        "prescriptive_rebates": {
            "led_lighting": {"rate": 0.08, "unit": "per_watt_saved"},
            "hvac_chiller": {"rate": 50, "unit": "per_ton"},
            "vfd_motors": {"rate": 60, "unit": "per_hp"},
            "building_automation": {"rate": 0.20, "unit": "per_sqft"}
        },
        "custom_incentives": {
            "rate": 0.12,
            "unit": "per_kwh_saved",
            "requires": "technical_analysis"
        }
    }',
    'ConEd commercial/industrial customer. Prescriptive rebates for standard equipment, custom incentives for unique projects.',
    ARRAY['for-profit', 'nonprofit', 'municipal'],
    NOW(),
    'Con Edison',
    0.92
);

-- ConEd Multifamily Energy Efficiency Program
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    utility_territories,
    incentive_type,
    amount_type,
    amount_per_unit,
    amount_max,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'CONED-MF-EE',
    'Con Edison Multifamily Energy Efficiency Program',
    'ConEd MF EE',
    'Energy efficiency program specifically designed for multifamily buildings of 5+ units. Includes free energy assessments, in-unit measures (lighting, aerators), common area upgrades, and building system improvements. Enhanced incentives for affordable housing properties.',
    'Multifamily efficiency program: free assessments, in-unit measures, building systems. Enhanced for affordable.',
    'rebate',
    'utility',
    'Energy Efficiency',
    ARRAY['real-estate'],
    ARRAY['energy_efficiency', 'lighting', 'hvac', 'water_heating'],
    ARRAY['multifamily', 'affordable_housing'],
    'utility',
    'NY',
    ARRAY['Con Edison'],
    'rebate',
    'per_unit',
    500.00, -- Per unit typical value
    250000.00,
    'active',
    '2015-01-01',
    '2026-12-31',
    'Con Edison',
    'Consolidated Edison Company of New York',
    'https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-for-multifamily-buildings',
    'simple',
    30,
    true,
    '{
        "minimum_requirements": [
            {"field": "utility", "operator": "=", "value": "Con Edison"},
            {"field": "total_units", "operator": ">=", "value": 5}
        ],
        "program_components": {
            "direct_install": {
                "items": ["LED bulbs", "smart strips", "low-flow showerheads", "faucet aerators"],
                "cost": "free"
            },
            "common_area": {
                "lighting": true,
                "hvac": true,
                "controls": true
            },
            "building_systems": {
                "boilers": true,
                "building_management": true,
                "insulation": true
            }
        },
        "affordable_housing_bonus": {
            "eligible": true,
            "bonus_pct": 0.25
        }
    }',
    'ConEd territory, 5+ unit building. Free direct install, rebates for common area and building systems. 25% bonus for affordable.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'Con Edison',
    0.92
);

-- ConEd EV Make-Ready Program
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    utility_territories,
    incentive_type,
    amount_type,
    amount_percentage,
    amount_max,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'CONED-EV-READY',
    'Con Edison EV Make-Ready Program',
    'ConEd EV Ready',
    'Incentives for electrical infrastructure upgrades needed to support EV charging installations. Covers utility-side and customer-side make-ready costs. Higher incentives in disadvantaged communities and for multifamily/workplace charging. Supports NY goal of 850,000 EVs by 2025.',
    'Covers 50-100% of make-ready infrastructure for EV charging. Higher in disadvantaged communities.',
    'rebate',
    'utility',
    'Transportation Electrification',
    ARRAY['real-estate', 'transportation'],
    ARRAY['ev_charging'],
    ARRAY['commercial', 'multifamily', 'industrial'],
    'utility',
    'NY',
    ARRAY['Con Edison'],
    'rebate',
    'percentage',
    1.00, -- Up to 100% in DACs
    500000.00,
    'active',
    '2020-01-01',
    '2027-12-31',
    'Con Edison',
    'Consolidated Edison Company of New York',
    'https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-for-electric-vehicle-charging',
    'moderate',
    45,
    true,
    '{
        "minimum_requirements": [
            {"field": "utility", "operator": "=", "value": "Con Edison"},
            {"field": "technology_type", "operator": "=", "value": "ev_charging"}
        ],
        "incentive_structure": {
            "utility_side_make_ready": {
                "standard": {"coverage_pct": 1.00, "description": "100% covered by utility"},
                "all_areas": true
            },
            "customer_side_make_ready": {
                "disadvantaged_community": {"coverage_pct": 1.00},
                "multifamily": {"coverage_pct": 0.90},
                "public_parking": {"coverage_pct": 0.90},
                "workplace": {"coverage_pct": 0.50},
                "fleet": {"coverage_pct": 0.50}
            }
        },
        "eligible_equipment": [
            "Service upgrades",
            "Transformer installation",
            "Conduit and wiring",
            "Panels and switchgear"
        ]
    }',
    'ConEd territory. 100% utility-side covered. Customer-side: 50-100% based on location and use case.',
    ARRAY['for-profit', 'nonprofit', 'municipal'],
    NOW(),
    'Con Edison',
    0.90
);


-- ============================================================================
-- ADDITIONAL FEDERAL/STATE PROGRAMS
-- ============================================================================

-- Federal Opportunity Zones
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    incentive_type,
    amount_type,
    amount_percentage,
    status,
    start_date,
    end_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'FED-OZ',
    'Qualified Opportunity Zone (QOZ) Investment',
    'Opportunity Zone',
    'Tax incentive for investments in designated low-income census tracts. Investors can defer and reduce capital gains taxes by investing in Qualified Opportunity Funds. Benefits: temporary deferral of gain, step-up in basis (now only 10% after 5 years), and permanent exclusion of new gains if held 10+ years.',
    'Defer capital gains, reduce taxes, exclude new appreciation on 10+ year investments in designated zones.',
    'tax_credit',
    'federal',
    'Community Development',
    ARRAY['real-estate', 'clean-energy', 'industrial'],
    ARRAY['any'],
    ARRAY['multifamily', 'commercial', 'industrial', 'mixed_use'],
    'federal',
    'tax_credit',
    'percentage',
    0.10, -- 10% basis step-up after 5 years (reduced from original)
    'active',
    '2018-01-01',
    '2047-12-31',
    'Internal Revenue Service',
    'U.S. Department of Treasury',
    'https://www.irs.gov/credits-deductions/businesses/opportunity-zones',
    'complex',
    true,
    '{
        "minimum_requirements": [
            {"field": "location", "operator": "in", "value": "qualified_opportunity_zone"},
            {"field": "investment_vehicle", "operator": "=", "value": "qualified_opportunity_fund"},
            {"field": "substantial_improvement", "operator": ">=", "value": "original_basis", "for": "existing_property"}
        ],
        "benefits": {
            "gain_deferral": {"until": "2026-12-31", "or": "sale_of_investment"},
            "basis_step_up": {"5_years": 0.10, "7_years": 0.10, "note": "7-year benefit expired 2026"},
            "gain_exclusion": {"after": "10_years", "applies_to": "appreciation_in_qof"}
        },
        "substantial_improvement_rule": {
            "requirement": "Double original basis within 30 months",
            "applies_to": "existing_buildings",
            "excludes": "land_cost"
        }
    }',
    'Must invest in designated QOZ via QOF. Existing buildings need substantial improvement (2x basis). 10-year hold for max benefit.',
    ARRAY['for-profit'],
    NOW(),
    'IRS/Treasury',
    0.95
);

-- NY State Historic Tax Credit
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    incentive_type,
    amount_type,
    amount_percentage,
    amount_max,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'NY-HTC',
    'New York State Historic Tax Credit',
    'NY Historic Credit',
    'State tax credit equal to 20% of qualified rehabilitation expenditures for certified historic structures (100% of federal credit). For commercial properties, state credit can be combined with 20% federal credit for 40% total. Also available for smaller projects and owner-occupied residences.',
    '20% state credit for historic rehabilitation. Stacks with federal HTC for up to 40% combined credit.',
    'tax_credit',
    'state',
    'Historic Preservation',
    ARRAY['real-estate'],
    ARRAY['historic_rehabilitation'],
    ARRAY['commercial', 'multifamily', 'mixed_use'],
    'state',
    'NY',
    'tax_credit',
    'percentage',
    0.20, -- 20%
    5000000.00, -- $5M cap per project
    'active',
    '2007-01-01',
    'NYS Office of Parks, Recreation and Historic Preservation',
    'NYS OPRHP',
    'https://parks.ny.gov/shpo/tax-credit-programs/',
    'complex',
    120,
    true,
    '{
        "minimum_requirements": [
            {"field": "state", "operator": "=", "value": "NY"},
            {"field": "building_status", "operator": "in", "values": ["national_register", "state_register", "contributing_district"]},
            {"field": "qualified_rehabilitation_expenditures", "operator": ">=", "value": 5000}
        ],
        "credit_tiers": {
            "commercial": {"rate": 0.20, "cap": 5000000},
            "small_project": {"rate": 0.20, "cap": 50000, "qre_limit": 2500000},
            "owner_occupied_residential": {"rate": 0.20, "cap": 50000}
        },
        "stacking": {
            "with_federal_htc": true,
            "combined_max": 0.40
        }
    }',
    'State/National Register building. Minimum $5,000 QRE. 20% credit, $5M cap. Stacks with federal HTC for 40% total.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'NYS OPRHP',
    0.95
);

-- NYSERDA Clean Energy Communities
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    incentive_type,
    amount_type,
    amount_fixed,
    amount_max,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    typical_processing_days,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'NY-CEC',
    'NYSERDA Clean Energy Communities Program',
    'Clean Energy Communities',
    'Grant program for local governments that complete clean energy actions. Municipalities earn points for actions like benchmarking, fleet electrification, LED streetlights, clean energy upgrades, and community campaigns. Designation unlocks grants for additional clean energy projects.',
    'Grants for municipalities completing clean energy actions. Points-based system unlocks project funding.',
    'grant',
    'state',
    'NYSERDA Municipal',
    ARRAY['real-estate', 'clean-energy', 'transportation'],
    ARRAY['energy_efficiency', 'solar', 'ev_charging', 'led_lighting'],
    ARRAY['municipal', 'government'],
    'state',
    'NY',
    'grant',
    'fixed',
    250000.00, -- Typical designation grant
    1000000.00,
    'active',
    '2016-01-01',
    'NYSERDA',
    'New York State Energy Research and Development Authority',
    'https://www.nyserda.ny.gov/All-Programs/Clean-Energy-Communities',
    'moderate',
    60,
    true,
    '{
        "minimum_requirements": [
            {"field": "entity_type", "operator": "=", "value": "municipality"},
            {"field": "state", "operator": "=", "value": "NY"}
        ],
        "high_impact_actions": [
            "Benchmarking (required)",
            "Clean Energy Upgrade",
            "Community Choice Aggregation",
            "LED Streetlights",
            "Solarize Campaign",
            "Clean Fleet",
            "Unified Solar Permit"
        ],
        "designation_levels": {
            "clean_energy_community": {"actions_required": 4, "grant": 250000},
            "leader": {"actions_required": "additional", "bonus": 100000}
        }
    }',
    'NY municipality. Complete 4+ high-impact actions for designation. Grants of $250K+ for designated communities.',
    ARRAY['municipal'],
    NOW(),
    'NYSERDA',
    0.90
);

-- ============================================================================
-- NY CLIMATE LEADERSHIP PROGRAMS
-- ============================================================================

-- NY Offshore Wind Supply Chain
INSERT INTO incentive_programs (
    external_id,
    name,
    short_name,
    description,
    summary,
    program_type,
    category,
    subcategory,
    sector_types,
    technology_types,
    building_types,
    jurisdiction_level,
    state,
    incentive_type,
    amount_type,
    amount_fixed,
    amount_max,
    status,
    start_date,
    administrator,
    administering_agency,
    source_url,
    application_complexity,
    stackable,
    eligibility_criteria,
    eligibility_summary,
    entity_types,
    last_verified_at,
    data_source,
    confidence_score
) VALUES (
    'NY-OSW-SUPPLY',
    'NY Offshore Wind Supply Chain Program',
    'NY OSW Supply Chain',
    'Grants and support for businesses entering the offshore wind supply chain. Supports manufacturing facilities, port infrastructure, workforce training, and component production. Part of NY goal of 9 GW offshore wind by 2035. Significant investments in Hudson Valley and Long Island ports.',
    'Grants for offshore wind manufacturing, ports, supply chain development. Supports 9 GW by 2035 goal.',
    'grant',
    'state',
    'Offshore Wind',
    ARRAY['industrial', 'clean-energy'],
    ARRAY['offshore_wind', 'manufacturing'],
    ARRAY['industrial', 'manufacturing', 'port_infrastructure'],
    'state',
    'NY',
    'grant',
    'variable',
    NULL,
    20000000.00,
    'active',
    '2020-01-01',
    'NYSERDA / Empire State Development',
    'NYSERDA',
    'https://www.nyserda.ny.gov/All-Programs/Offshore-Wind',
    'very_complex',
    true,
    '{
        "minimum_requirements": [
            {"field": "state", "operator": "=", "value": "NY"},
            {"field": "industry", "operator": "in", "values": ["offshore_wind_manufacturing", "offshore_wind_services", "port_infrastructure"]}
        ],
        "priority_investments": [
            "Component manufacturing",
            "Port upgrades (South Brooklyn, Albany)",
            "Workforce training programs",
            "Vessel construction",
            "Operations and maintenance hubs"
        ],
        "ny_goals": {
            "offshore_wind_2035": "9 GW",
            "jobs_target": 10000,
            "supply_chain_investment": "6B"
        }
    }',
    'NY-based offshore wind supply chain activities. Manufacturing, port infrastructure, workforce development.',
    ARRAY['for-profit', 'nonprofit'],
    NOW(),
    'NYSERDA',
    0.85
);


-- ============================================================================
-- INDEXES FOR SEED DATA
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_programs_external_id ON incentive_programs(external_id);
CREATE INDEX IF NOT EXISTS idx_programs_short_name ON incentive_programs(short_name);
CREATE INDEX IF NOT EXISTS idx_programs_counties ON incentive_programs USING GIN(counties);
CREATE INDEX IF NOT EXISTS idx_programs_municipalities ON incentive_programs USING GIN(municipalities);
CREATE INDEX IF NOT EXISTS idx_programs_utility ON incentive_programs USING GIN(utility_territories);

-- ============================================================================
-- RLS FOR NEW TABLES
-- ============================================================================
ALTER TABLE program_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_change_history ENABLE ROW LEVEL SECURITY;

-- Admin-only access to sync logs
CREATE POLICY "Admins can view sync logs" ON program_sync_log
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Anyone can view program change history for transparency
CREATE POLICY "Anyone can view program changes" ON program_change_history
    FOR SELECT USING (true);

-- ============================================================================
-- FUNCTION: Get Last Sync Status
-- ============================================================================
CREATE OR REPLACE FUNCTION get_last_sync_status()
RETURNS TABLE (
    sync_id UUID,
    sync_type VARCHAR,
    status VARCHAR,
    programs_added INTEGER,
    programs_updated INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id,
        psl.sync_type,
        psl.status,
        psl.programs_added,
        psl.programs_updated,
        psl.started_at,
        psl.completed_at
    FROM program_sync_log psl
    ORDER BY psl.started_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: Record Program Change
-- ============================================================================
CREATE OR REPLACE FUNCTION record_program_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO program_change_history (
            program_id,
            change_type,
            field_changes,
            source
        ) VALUES (
            NEW.id,
            'update',
            jsonb_build_object(
                'updated_at', jsonb_build_object('old', OLD.updated_at, 'new', NEW.updated_at),
                'status', CASE WHEN OLD.status != NEW.status
                          THEN jsonb_build_object('old', OLD.status, 'new', NEW.status)
                          ELSE NULL END
            ),
            'trigger'
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO program_change_history (
            program_id,
            change_type,
            source
        ) VALUES (
            NEW.id,
            'create',
            'trigger'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tracking changes
CREATE TRIGGER track_program_changes
    AFTER INSERT OR UPDATE ON incentive_programs
    FOR EACH ROW EXECUTE FUNCTION record_program_change();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE program_sync_log IS 'Tracks synchronization runs for incentive program updates';
COMMENT ON TABLE program_change_history IS 'Audit trail of all changes to incentive programs';
COMMENT ON FUNCTION get_last_sync_status IS 'Returns the most recent sync operation status';
COMMENT ON FUNCTION record_program_change IS 'Trigger function to log all program changes';
