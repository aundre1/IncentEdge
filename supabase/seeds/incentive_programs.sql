-- IncentEdge Incentive Programs Seed Data
-- Pre-populated Federal IRA programs and key state/local incentives
-- Date: 2026-01-09

-- ============================================================================
-- FEDERAL IRA CLEAN ENERGY CREDITS
-- ============================================================================

INSERT INTO incentive_programs (
    name, program_code, description, incentive_type, category, sector,
    jurisdiction_level, jurisdiction_state, administering_agency,
    value_type, value_amount, value_min, value_max, value_basis,
    sustainability_tier_required, affordability_required,
    eligible_property_types, eligible_building_types,
    application_process, application_url,
    start_date, end_date, application_deadline,
    is_active, is_featured, tags
) VALUES

-- Investment Tax Credit (ITC) - Solar/Wind
(
    'Investment Tax Credit (ITC) - Clean Energy',
    'FED-ITC-001',
    'Federal investment tax credit for solar, wind, and other qualified clean energy property. Base credit of 6% (30% with prevailing wage/apprenticeship). Bonus adders available for domestic content (+10%), energy community (+10%), and low-income (+10-20%).',
    'tax_credit',
    'federal',
    ARRAY['renewable_energy', 'clean_energy'],
    'federal',
    NULL,
    'Internal Revenue Service (IRS)',
    'percentage',
    0.30,
    NULL,
    NULL,
    'qualified_property_cost',
    NULL,
    false,
    ARRAY['multifamily', 'commercial', 'industrial', 'mixed_use'],
    ARRAY['apartment', 'office', 'retail', 'industrial', 'mixed_use'],
    'Claim on federal tax return using IRS Form 3468. For direct pay election (tax-exempt entities), file Form 3800.',
    'https://www.irs.gov/credits-deductions/investment-tax-credit',
    '2022-01-01',
    '2034-12-31',
    NULL,
    true,
    true,
    ARRAY['IRA', 'solar', 'wind', 'clean_energy', 'renewable', 'ITC', 'tax_credit']
),

-- Production Tax Credit (PTC)
(
    'Production Tax Credit (PTC) - Clean Electricity',
    'FED-PTC-001',
    'Federal production tax credit for electricity generated from qualified clean energy facilities. Base credit of 0.3 cents/kWh (1.5 cents/kWh with prevailing wage/apprenticeship) for 10 years. Alternative to ITC for wind, solar, geothermal, and other clean energy sources.',
    'tax_credit',
    'federal',
    ARRAY['renewable_energy', 'clean_energy'],
    'federal',
    NULL,
    'Internal Revenue Service (IRS)',
    'per_unit',
    0.015, -- 1.5 cents per kWh
    NULL,
    NULL,
    'kWh_generated',
    NULL,
    false,
    ARRAY['commercial', 'industrial', 'utility'],
    ARRAY['power_plant', 'industrial'],
    'Claim annually on federal tax return for electricity generated. Form 8835.',
    'https://www.irs.gov/credits-deductions/production-tax-credit',
    '2022-01-01',
    '2034-12-31',
    NULL,
    true,
    true,
    ARRAY['IRA', 'PTC', 'renewable', 'wind', 'solar', 'geothermal', 'production_credit']
),

-- Section 45L New Energy Efficient Home Credit
(
    'Section 45L - New Energy Efficient Home Credit',
    'FED-45L-001',
    'Tax credit for builders of new energy-efficient homes. $2,500 per unit meeting ENERGY STAR requirements, or $5,000 per unit meeting DOE Zero Energy Ready Home requirements. For multifamily (3+ stories), eligible for $500-$5,000 per unit based on efficiency level.',
    'tax_credit',
    'federal',
    ARRAY['energy_efficiency', 'affordable_housing'],
    'federal',
    NULL,
    'Internal Revenue Service (IRS)',
    'per_unit',
    5000,
    500,
    5000,
    'units',
    'tier_1_efficient',
    false,
    ARRAY['single_family', 'multifamily'],
    ARRAY['single_family', 'townhouse', 'apartment'],
    'Claim on tax return for qualified new homes sold or leased. Certification from approved rater required.',
    'https://www.irs.gov/credits-deductions/new-energy-efficient-home-credit',
    '2023-01-01',
    '2032-12-31',
    NULL,
    true,
    true,
    ARRAY['IRA', '45L', 'new_construction', 'energy_efficient', 'multifamily', 'single_family', 'builder_credit']
),

-- Section 179D Energy Efficient Commercial Building Deduction
(
    'Section 179D - Commercial Building Energy Efficiency Deduction',
    'FED-179D-001',
    'Tax deduction for energy efficient commercial buildings. Up to $5.00 per square foot for buildings achieving 25%+ energy savings vs ASHRAE 90.1 baseline. Deduction scales from $0.50/sqft at 25% savings to $5.00/sqft at 50%+ savings with prevailing wage compliance.',
    'tax_deduction',
    'federal',
    ARRAY['energy_efficiency'],
    'federal',
    NULL,
    'Internal Revenue Service (IRS)',
    'per_sqft',
    5.00,
    0.50,
    5.00,
    'square_footage',
    'tier_1_efficient',
    false,
    ARRAY['commercial', 'industrial', 'multifamily'],
    ARRAY['office', 'retail', 'warehouse', 'apartment'],
    'Obtain certification from qualified professional. Claim deduction on tax return. Building must meet energy modeling requirements.',
    'https://www.irs.gov/credits-deductions/energy-efficient-commercial-building-deduction',
    '2023-01-01',
    '2032-12-31',
    NULL,
    true,
    true,
    ARRAY['IRA', '179D', 'commercial', 'energy_efficiency', 'deduction', 'ASHRAE']
),

-- Low-Income Housing Tax Credit (LIHTC) - 4%
(
    'Low-Income Housing Tax Credit (LIHTC) - 4%',
    'FED-LIHTC-4',
    'Federal tax credit for acquisition/rehabilitation of affordable rental housing financed with tax-exempt bonds. Credit rate is approximately 4% of qualified basis, claimed over 10 years. Projects must maintain affordability for 30+ years.',
    'tax_credit',
    'federal',
    ARRAY['affordable_housing'],
    'federal',
    NULL,
    'State Housing Finance Agencies',
    'percentage',
    0.04,
    NULL,
    NULL,
    'qualified_basis',
    NULL,
    true,
    ARRAY['multifamily'],
    ARRAY['apartment', 'senior_housing'],
    'Apply through state HFA for tax-exempt bond allocation. Project must meet income and rent restrictions.',
    'https://www.huduser.gov/portal/datasets/lihtc.html',
    '1986-01-01',
    NULL,
    NULL,
    true,
    true,
    ARRAY['LIHTC', '4%', 'affordable', 'tax_exempt_bonds', 'multifamily', 'rental']
),

-- Low-Income Housing Tax Credit (LIHTC) - 9%
(
    'Low-Income Housing Tax Credit (LIHTC) - 9%',
    'FED-LIHTC-9',
    'Federal tax credit for new construction/substantial rehabilitation of affordable rental housing. Competitive credit rate is approximately 9% of qualified basis, claimed over 10 years. Highly competitive - allocated annually by state HFAs via QAP process.',
    'tax_credit',
    'federal',
    ARRAY['affordable_housing'],
    'federal',
    NULL,
    'State Housing Finance Agencies',
    'percentage',
    0.09,
    NULL,
    NULL,
    'qualified_basis',
    NULL,
    true,
    ARRAY['multifamily'],
    ARRAY['apartment', 'senior_housing'],
    'Apply through state HFA competitive allocation process per Qualified Allocation Plan (QAP). Stringent requirements and scoring.',
    'https://www.huduser.gov/portal/datasets/lihtc.html',
    '1986-01-01',
    NULL,
    NULL,
    true,
    true,
    ARRAY['LIHTC', '9%', 'affordable', 'competitive', 'multifamily', 'rental', 'QAP']
),

-- Section 48 Energy Credit (Storage)
(
    'Section 48 Energy Credit - Battery Storage',
    'FED-48-STORAGE',
    'Investment tax credit for standalone battery energy storage systems. 30% credit (with prevailing wage/apprenticeship) for storage systems with capacity of 5 kWh or greater. Can combine with solar ITC or claim separately.',
    'tax_credit',
    'federal',
    ARRAY['energy_storage', 'clean_energy'],
    'federal',
    NULL,
    'Internal Revenue Service (IRS)',
    'percentage',
    0.30,
    NULL,
    NULL,
    'storage_system_cost',
    NULL,
    false,
    ARRAY['multifamily', 'commercial', 'industrial'],
    ARRAY['apartment', 'office', 'retail', 'industrial'],
    'Claim on federal tax return using IRS Form 3468. Storage must be 5+ kWh capacity.',
    'https://www.irs.gov/credits-deductions/energy-credit-section-48',
    '2023-01-01',
    '2034-12-31',
    NULL,
    true,
    true,
    ARRAY['IRA', 'storage', 'battery', 'ITC', 'section_48']
),

-- Section 30C Alternative Fuel Vehicle Refueling Credit
(
    'Section 30C - EV Charging Infrastructure Credit',
    'FED-30C-001',
    'Tax credit for installing electric vehicle charging infrastructure. 30% of cost (with prevailing wage for commercial) up to $100,000 per charger for business/investment use. Must be in low-income or non-urban census tract.',
    'tax_credit',
    'federal',
    ARRAY['clean_energy', 'transportation'],
    'federal',
    NULL,
    'Internal Revenue Service (IRS)',
    'percentage',
    0.30,
    NULL,
    100000,
    'charger_cost',
    NULL,
    false,
    ARRAY['multifamily', 'commercial', 'parking'],
    ARRAY['apartment', 'office', 'retail', 'parking_structure'],
    'Claim on tax return. Property must be in eligible census tract. Form 8911.',
    'https://www.irs.gov/credits-deductions/alternative-fuel-vehicle-refueling-property-credit',
    '2023-01-01',
    '2032-12-31',
    NULL,
    true,
    false,
    ARRAY['IRA', '30C', 'EV', 'charging', 'infrastructure', 'transportation']
),

-- ============================================================================
-- NEW YORK STATE INCENTIVES
-- ============================================================================

(
    'NY-Sun Commercial/Industrial Incentive',
    'NY-SUN-CI',
    'New York State incentive for commercial and industrial solar installations. Incentive rates vary by utility territory and project size. Residential rates also available.',
    'rebate',
    'state',
    ARRAY['renewable_energy', 'solar'],
    'state',
    'NY',
    'NYSERDA',
    'per_unit',
    0.20, -- $/watt varies by region
    NULL,
    NULL,
    'watts_dc',
    NULL,
    false,
    ARRAY['commercial', 'industrial', 'multifamily'],
    ARRAY['office', 'retail', 'industrial', 'apartment'],
    'Apply through NYSERDA portal. Must use approved contractor.',
    'https://www.nyserda.ny.gov/ny-sun',
    '2014-01-01',
    '2025-12-31',
    NULL,
    true,
    true,
    ARRAY['NY', 'solar', 'NYSERDA', 'commercial', 'rebate']
),

(
    'NY Affordable Housing Corporation (AHC) Program',
    'NY-AHC-001',
    'State funding for development and preservation of affordable housing in New York. Provides loans and grants for affordable housing projects.',
    'grant',
    'state',
    ARRAY['affordable_housing'],
    'state',
    'NY',
    'NY Affordable Housing Corporation',
    'per_unit',
    50000,
    25000,
    75000,
    'units',
    NULL,
    true,
    ARRAY['multifamily'],
    ARRAY['apartment', 'senior_housing'],
    'Apply through NY Homes and Community Renewal RFP process.',
    'https://hcr.ny.gov/affordable-housing-corporation',
    '1985-01-01',
    NULL,
    NULL,
    true,
    true,
    ARRAY['NY', 'affordable', 'AHC', 'housing', 'grant']
),

(
    'NYS Industrial Development Agency (IDA) PILOT',
    'NY-IDA-PILOT',
    'Payment in Lieu of Taxes abatement through local Industrial Development Agencies. Reduces property tax burden for qualifying projects that create jobs and economic development.',
    'tax_abatement',
    'local',
    ARRAY['economic_development'],
    'local',
    'NY',
    'Local IDA',
    'percentage',
    0.50,
    0.25,
    1.00,
    'property_tax',
    NULL,
    false,
    ARRAY['commercial', 'industrial', 'mixed_use'],
    ARRAY['office', 'retail', 'industrial', 'mixed_use'],
    'Apply directly to local IDA. Cost-benefit analysis and public hearing required.',
    'https://esd.ny.gov/doing-business-ny/idas',
    NULL,
    NULL,
    NULL,
    true,
    true,
    ARRAY['NY', 'IDA', 'PILOT', 'property_tax', 'abatement', 'economic_development']
),

(
    'NY 421-a Affordable Housing Tax Exemption (EXPIRED)',
    'NY-421A-001-EXPIRED',
    'EXPIRED PROGRAM — Do not recommend. Replaced by 485-x in April 2024. Was a property tax exemption for new multifamily construction in NYC that included affordable units. Valid for projects commenced before June 15, 2022 only.',
    'tax_abatement',
    'local',
    ARRAY['affordable_housing'],
    'local',
    'NY',
    'NYC Department of Housing Preservation',
    'percentage',
    1.00,
    NULL,
    NULL,
    'property_tax',
    NULL,
    true,
    ARRAY['multifamily'],
    ARRAY['apartment'],
    'EXPIRED — Not applicable for new projects. See 485-x program for active replacement.',
    'https://www.nyc.gov/site/hpd/services-and-information/tax-incentives-421a.page',
    '1971-01-01',
    '2022-06-15',
    NULL,
    false, -- Expired June 2022
    false,
    ARRAY['NYC', '421-a', 'property_tax', 'affordable', 'multifamily', 'expired']
),

(
    'NY 485-x Affordable Neighborhoods for New Yorkers Tax Exemption',
    'NY-485X-001',
    'Active program replacing expired 421-a. Up to 40-year property tax exemption for new multifamily construction in NYC (5 boroughs). Minimum 25% of units must be affordable. Signed April 20, 2024. Two tracks: Track A (Class A residential, various AMI levels) and Track B (deeper affordability). Buildings with 100+ units must pay prevailing wages for both construction workers and ongoing building services staff. No sunset date.',
    'tax_abatement',
    'local',
    ARRAY['affordable_housing'],
    'local',
    'NY',
    'NYC Department of Housing Preservation',
    'percentage',
    1.00,
    NULL,
    NULL,
    'property_tax',
    NULL,
    true,
    ARRAY['multifamily'],
    ARRAY['apartment'],
    'Apply through HPD. Must meet enhanced affordability requirements and pay prevailing wages.',
    'https://www.nyc.gov/site/hpd/services-and-information/tax-incentives.page',
    '2024-06-15',
    '2039-06-15',
    NULL,
    true,
    true,
    ARRAY['NYC', '485-x', 'property_tax', 'affordable', 'multifamily', 'prevailing_wage']
),

-- ============================================================================
-- CALIFORNIA INCENTIVES
-- ============================================================================

(
    'California Solar Initiative (CSI) - Multifamily',
    'CA-CSI-MF',
    'Rebate program for solar installations on multifamily affordable housing in California. Virtual net metering enabled for tenant benefit.',
    'rebate',
    'state',
    ARRAY['renewable_energy', 'affordable_housing'],
    'state',
    'CA',
    'California Public Utilities Commission',
    'per_unit',
    0.50, -- $/watt
    NULL,
    NULL,
    'watts_dc',
    NULL,
    true,
    ARRAY['multifamily'],
    ARRAY['apartment'],
    'Apply through participating utility. Must be affordable housing.',
    'https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/demand-side-management/california-solar-initiative',
    '2007-01-01',
    '2026-12-31',
    NULL,
    true,
    true,
    ARRAY['CA', 'solar', 'CSI', 'multifamily', 'affordable']
),

(
    'California Tax Credit Allocation Committee (CTCAC) - State LIHTC',
    'CA-LIHTC-STATE',
    'California state low-income housing tax credit that supplements federal LIHTC. State credit equals approximately 4% of federal credit for 4% projects.',
    'tax_credit',
    'state',
    ARRAY['affordable_housing'],
    'state',
    'CA',
    'California Tax Credit Allocation Committee',
    'percentage',
    0.04,
    NULL,
    NULL,
    'qualified_basis',
    NULL,
    true,
    ARRAY['multifamily'],
    ARRAY['apartment', 'senior_housing'],
    'Apply concurrently with federal LIHTC through CTCAC.',
    'https://www.treasurer.ca.gov/ctcac/',
    '1987-01-01',
    NULL,
    NULL,
    true,
    true,
    ARRAY['CA', 'LIHTC', 'state_credit', 'affordable']
),

-- ============================================================================
-- NEW JERSEY INCENTIVES
-- ============================================================================

(
    'NJ Successor Solar Incentive Program (SuSI)',
    'NJ-SUSI-001',
    'New Jersey solar incentive program providing Solar Renewable Energy Certificates (SRECs) and Administratively Determined Incentive (ADI) for solar installations.',
    'performance_incentive',
    'state',
    ARRAY['renewable_energy', 'solar'],
    'state',
    'NJ',
    'NJ Board of Public Utilities',
    'per_unit',
    90, -- $/MWh varies
    NULL,
    NULL,
    'MWh_generated',
    NULL,
    false,
    ARRAY['residential', 'commercial', 'industrial', 'multifamily'],
    ARRAY['single_family', 'apartment', 'office', 'retail', 'industrial'],
    'Register with NJ Clean Energy Program. Must use certified installer.',
    'https://njcleanenergy.com/renewable-energy/programs/susi-program',
    '2021-08-28',
    NULL,
    NULL,
    true,
    true,
    ARRAY['NJ', 'solar', 'SREC', 'ADI', 'SuSI']
),

(
    'NJ Aspire - Affordable Housing Development',
    'NJ-ASPIRE-001',
    'New Jersey affordable housing development program providing gap financing for affordable and mixed-income housing.',
    'loan',
    'state',
    ARRAY['affordable_housing'],
    'state',
    'NJ',
    'NJ Housing and Mortgage Finance Agency',
    'per_unit',
    75000,
    25000,
    100000,
    'units',
    NULL,
    true,
    ARRAY['multifamily'],
    ARRAY['apartment', 'senior_housing'],
    'Apply through NJHMFA RFP rounds.',
    'https://www.njhousing.gov/aspire',
    '2022-01-01',
    NULL,
    NULL,
    true,
    true,
    ARRAY['NJ', 'affordable', 'ASPIRE', 'gap_financing']
),

-- ============================================================================
-- UTILITY INCENTIVES
-- ============================================================================

(
    'Con Edison Commercial Demand Response',
    'CONED-DR-001',
    'Demand response program providing payments for reducing electricity usage during peak demand events in Con Edison territory.',
    'performance_incentive',
    'utility',
    ARRAY['demand_response', 'energy_efficiency'],
    'utility',
    'NY',
    'Con Edison',
    'per_unit',
    25, -- $/kW
    NULL,
    NULL,
    'kW_reduced',
    NULL,
    false,
    ARRAY['commercial', 'industrial', 'multifamily'],
    ARRAY['office', 'retail', 'industrial', 'apartment'],
    'Enroll through Con Edison or authorized curtailment service provider.',
    'https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-for-commercial-industrial-buildings-redesign/demand-response',
    NULL,
    NULL,
    NULL,
    true,
    false,
    ARRAY['ConEd', 'demand_response', 'peak_reduction', 'NYC']
),

(
    'PSEG Long Island Commercial Efficiency Program',
    'PSEG-LI-EFF',
    'Rebates and incentives for energy efficiency upgrades in commercial buildings on Long Island.',
    'rebate',
    'utility',
    ARRAY['energy_efficiency'],
    'utility',
    'NY',
    'PSEG Long Island',
    'percentage',
    0.50,
    NULL,
    500000,
    'project_cost',
    NULL,
    false,
    ARRAY['commercial', 'industrial', 'multifamily'],
    ARRAY['office', 'retail', 'industrial', 'apartment'],
    'Apply through PSEG LI efficiency portal. Pre-approval required.',
    'https://www.psegliny.com/saveenergyandmoney/forbusiness',
    NULL,
    NULL,
    NULL,
    true,
    false,
    ARRAY['PSEG', 'Long_Island', 'efficiency', 'rebate', 'commercial']
);

-- ============================================================================
-- CREATE ELIGIBILITY RULE SETS FOR KEY PROGRAMS
-- ============================================================================

-- ITC Eligibility Rules
INSERT INTO eligibility_rule_sets (
    incentive_program_id,
    name,
    description,
    match_type,
    is_active
)
SELECT
    id,
    'ITC Base Eligibility',
    'Basic eligibility requirements for federal Investment Tax Credit',
    'all',
    true
FROM incentive_programs
WHERE program_code = 'FED-ITC-001';

-- 45L Eligibility Rules
INSERT INTO eligibility_rule_sets (
    incentive_program_id,
    name,
    description,
    match_type,
    is_active
)
SELECT
    id,
    '45L Energy Efficient Home Credit Eligibility',
    'Eligibility requirements for Section 45L new energy efficient home credit',
    'all',
    true
FROM incentive_programs
WHERE program_code = 'FED-45L-001';

-- 179D Eligibility Rules
INSERT INTO eligibility_rule_sets (
    incentive_program_id,
    name,
    description,
    match_type,
    is_active
)
SELECT
    id,
    '179D Commercial Deduction Eligibility',
    'Eligibility requirements for Section 179D commercial building deduction',
    'all',
    true
FROM incentive_programs
WHERE program_code = 'FED-179D-001';

-- LIHTC 4% Eligibility Rules
INSERT INTO eligibility_rule_sets (
    incentive_program_id,
    name,
    description,
    match_type,
    is_active
)
SELECT
    id,
    'LIHTC 4% Eligibility',
    'Eligibility requirements for 4% Low-Income Housing Tax Credit',
    'all',
    true
FROM incentive_programs
WHERE program_code = 'FED-LIHTC-4';

-- ============================================================================
-- CREATE SAMPLE ELIGIBILITY RULES
-- ============================================================================

-- ITC Rules
INSERT INTO eligibility_rules (
    rule_set_id,
    name,
    description,
    category,
    field_path,
    field_type,
    operator,
    value_list,
    is_required,
    display_priority
)
SELECT
    rs.id,
    'Property Type Check',
    'Project must be eligible property type for clean energy credit',
    'entity',
    'building_type',
    'string',
    'in_list',
    ARRAY['multifamily', 'commercial', 'industrial', 'mixed_use'],
    true,
    10
FROM eligibility_rule_sets rs
JOIN incentive_programs ip ON rs.incentive_program_id = ip.id
WHERE ip.program_code = 'FED-ITC-001';

-- 45L Rules
INSERT INTO eligibility_rules (
    rule_set_id,
    name,
    description,
    category,
    field_path,
    field_type,
    operator,
    value_single,
    is_required,
    display_priority
)
SELECT
    rs.id,
    'New Construction Requirement',
    'Must be new construction or substantial rehabilitation',
    'technology',
    'is_new_construction',
    'boolean',
    'equals',
    'true',
    true,
    10
FROM eligibility_rule_sets rs
JOIN incentive_programs ip ON rs.incentive_program_id = ip.id
WHERE ip.program_code = 'FED-45L-001';

INSERT INTO eligibility_rules (
    rule_set_id,
    name,
    description,
    category,
    field_path,
    field_type,
    operator,
    value_list,
    is_required,
    display_priority
)
SELECT
    rs.id,
    'Sustainability Tier',
    'Must meet ENERGY STAR or Zero Energy Ready requirements',
    'sustainability',
    'sustainability_tier',
    'string',
    'in_list',
    ARRAY['tier_1_efficient', 'tier_2_high_performance', 'tier_3_net_zero', 'tier_3_triple_net_zero'],
    true,
    20
FROM eligibility_rule_sets rs
JOIN incentive_programs ip ON rs.incentive_program_id = ip.id
WHERE ip.program_code = 'FED-45L-001';

-- LIHTC Rules
INSERT INTO eligibility_rules (
    rule_set_id,
    name,
    description,
    category,
    field_path,
    field_type,
    operator,
    value_single,
    is_required,
    display_priority
)
SELECT
    rs.id,
    'Affordability Requirement',
    'Project must include affordable housing units',
    'affordability',
    'has_affordable_units',
    'boolean',
    'equals',
    'true',
    true,
    10
FROM eligibility_rule_sets rs
JOIN incentive_programs ip ON rs.incentive_program_id = ip.id
WHERE ip.program_code = 'FED-LIHTC-4';

INSERT INTO eligibility_rules (
    rule_set_id,
    name,
    description,
    category,
    field_path,
    field_type,
    operator,
    value_single,
    is_required,
    display_priority
)
SELECT
    rs.id,
    'Minimum Affordable Set-Aside',
    'At least 20% at 50% AMI or 40% at 60% AMI',
    'affordability',
    'affordable_percentage',
    'number',
    'greater_than_or_equals',
    '20',
    true,
    20
FROM eligibility_rule_sets rs
JOIN incentive_programs ip ON rs.incentive_program_id = ip.id
WHERE ip.program_code = 'FED-LIHTC-4';

-- ============================================================================
-- ADD GEOGRAPHIC ELIGIBILITY ZONES
-- ============================================================================

-- Sample Qualified Census Tracts (QCTs) for NY
INSERT INTO geographic_eligibility_zones (
    name,
    zone_type,
    state,
    county,
    census_tract,
    is_qct,
    is_active,
    attributes
) VALUES
('Bronx QCT 001', 'census_tract', 'NY', 'Bronx', '36005000100', true, true, '{"median_income_percentage": 45, "poverty_rate": 35.2}'),
('Bronx QCT 002', 'census_tract', 'NY', 'Bronx', '36005000200', true, true, '{"median_income_percentage": 42, "poverty_rate": 38.1}'),
('Brooklyn QCT 001', 'census_tract', 'NY', 'Kings', '36047000100', true, true, '{"median_income_percentage": 48, "poverty_rate": 32.5}'),
('Yonkers QCT 001', 'census_tract', 'NY', 'Westchester', '36119000100', true, true, '{"median_income_percentage": 52, "poverty_rate": 28.3}'),
('New Rochelle QCT 001', 'census_tract', 'NY', 'Westchester', '36119006200', true, true, '{"median_income_percentage": 55, "poverty_rate": 22.1}');

-- Sample Opportunity Zones
INSERT INTO geographic_eligibility_zones (
    name,
    zone_type,
    state,
    county,
    census_tract,
    is_opportunity_zone,
    oz_designation_date,
    is_active,
    attributes
) VALUES
('South Bronx OZ', 'census_tract', 'NY', 'Bronx', '36005001500', true, '2018-04-01', true, '{"zone_type": "low_income_community"}'),
('East New York OZ', 'census_tract', 'NY', 'Kings', '36047114400', true, '2018-04-01', true, '{"zone_type": "low_income_community"}'),
('Downtown Yonkers OZ', 'census_tract', 'NY', 'Westchester', '36119000500', true, '2018-04-01', true, '{"zone_type": "contiguous_tract"}');

-- Sample Energy Communities
INSERT INTO geographic_eligibility_zones (
    name,
    zone_type,
    state,
    county,
    is_energy_community,
    energy_community_category,
    energy_community_effective_date,
    is_active,
    attributes
) VALUES
('Upstate NY Coal Region', 'county', 'NY', 'Oswego', true, 'coal_closure', '2023-01-01', true, '{"coal_plant": "Oswego Steam Station", "closure_date": "2020-06-30"}'),
('Buffalo Brownfield Area', 'county', 'NY', 'Erie', true, 'brownfield', '2023-01-01', true, '{"brownfield_type": "industrial"}'),
('Pennsylvania Coal Region', 'county', 'PA', 'Lackawanna', true, 'coal_closure', '2023-01-01', true, '{"historical_coal_production": true}');

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE incentive_programs IS 'Pre-seeded incentive programs including Federal IRA credits and state/local programs';
