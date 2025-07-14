import { db } from './server/db.js';
import { incentives } from './shared/schema.js';

const governmentIncentives = [
  {
    name: 'Residential Clean Energy Credit',
    provider: 'IRS',
    level: 'federal',
    amount: '30% tax credit',
    deadline: '2032-12-31',
    projectTypes: ['Solar PV', 'Solar Water Heating', 'Wind', 'Geothermal'],
    requirements: ['Homeowners installing qualifying systems', 'Primary residence', 'System must meet performance standards'],
    description: 'Federal tax credit for residential clean energy installations including solar photovoltaic systems, solar water heating, wind turbines, and geothermal heat pumps',
    contactInfo: 'IRS.gov/Form5695',
    applicationUrl: 'https://www.irs.gov/credits-deductions/residential-clean-energy-credit'
  },
  {
    name: 'Energy Efficient Home Improvement Credit',
    provider: 'IRS',
    level: 'federal', 
    amount: 'Up to $3,200 annually',
    deadline: '2032-12-31',
    projectTypes: ['HVAC', 'Water Heaters', 'Insulation', 'Windows', 'Doors'],
    requirements: ['Energy Star certified equipment', 'Meet efficiency standards', 'Installation by qualified contractor'],
    description: 'Federal tax credit for energy-efficient home improvements including heat pumps, water heaters, insulation, and Energy Star windows and doors',
    contactInfo: 'IRS.gov/Form5695',
    applicationUrl: 'https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit'
  },
  {
    name: 'Investment Tax Credit (ITC) - Commercial',
    provider: 'IRS',
    level: 'federal',
    amount: '30% of project cost',
    deadline: '2032-12-31',
    projectTypes: ['Solar', 'Wind', 'Fuel Cells', 'Energy Storage', 'Geothermal'],
    requirements: ['Commercial properties', 'Begin construction by deadline', 'Domestic content bonus available'],
    description: 'Federal investment tax credit for commercial renewable energy systems including solar, wind, fuel cells, and qualifying energy storage',
    contactInfo: 'IRS.gov/Form3468',
    applicationUrl: 'https://www.irs.gov/businesses/investment-tax-credit'
  },
  {
    name: 'Production Tax Credit (PTC)',
    provider: 'IRS',
    level: 'federal',
    amount: '$0.027 per kWh (2024)',
    deadline: '2024-12-31',
    projectTypes: ['Wind', 'Geothermal', 'Biomass', 'Hydroelectric', 'Landfill Gas'],
    requirements: ['Electricity generation facilities', '10-year production period', 'Begin construction by deadline'],
    description: 'Federal tax credit for electricity generated from qualifying renewable energy sources over a 10-year period',
    contactInfo: 'IRS.gov/Form8835',
    applicationUrl: 'https://www.irs.gov/businesses/production-tax-credit'
  },
  {
    name: 'Commercial Buildings Energy Efficiency Tax Deduction (179D)',
    provider: 'IRS',
    level: 'federal',
    amount: 'Up to $5.00 per sq ft',
    deadline: null,
    projectTypes: ['HVAC', 'Lighting', 'Building Envelope', 'Hot Water Systems'],
    requirements: ['Minimum 25% energy savings', 'ASHRAE 90.1 compliance', 'Prevailing wage for maximum deduction'],
    description: 'Federal tax deduction for energy-efficient commercial building improvements meeting specified energy savings targets',
    contactInfo: 'IRS.gov/Form8908',
    applicationUrl: 'https://www.irs.gov/businesses/179d-commercial-buildings-energy-efficiency-tax-deduction'
  },
  {
    name: 'Clean Vehicle Tax Credit',
    provider: 'IRS',
    level: 'federal',
    amount: 'Up to $7,500 new, $4,000 used',
    deadline: null,
    projectTypes: ['Electric Vehicles', 'Plug-in Hybrids'],
    requirements: ['Income limits apply', 'Final assembly in North America', 'Battery components requirements'],
    description: 'Federal tax credit for new and used clean vehicles including electric vehicles and plug-in hybrid electric vehicles',
    contactInfo: 'IRS.gov/Form8936',
    applicationUrl: 'https://www.irs.gov/credits-deductions/clean-vehicle-tax-credit'
  },
  {
    name: 'Alternative Fuel Vehicle Refueling Property Credit',
    provider: 'IRS',
    level: 'federal',
    amount: '30% up to $30K commercial, $1K residential',
    deadline: '2024-12-31',
    projectTypes: ['EV Charging', 'Hydrogen Fueling', 'CNG Stations', 'LPG Stations'],
    requirements: ['Qualified alternative fuel vehicle refueling property', 'Located in qualifying area'],
    description: 'Federal tax credit for alternative fuel vehicle refueling infrastructure including electric vehicle charging stations',
    contactInfo: 'IRS.gov/Form8911',
    applicationUrl: 'https://www.irs.gov/businesses/alternative-fuel-vehicle-refueling-property-credit'
  },
  {
    name: 'NYSERDA Clean Energy Fund',
    provider: 'NYSERDA',
    level: 'state',
    amount: '$5.3 billion program',
    deadline: '2025-12-31',
    projectTypes: ['Solar', 'Wind', 'Energy Storage', 'Grid Modernization', 'Energy Efficiency'],
    requirements: ['NY businesses, organizations, municipalities, residents', 'Varies by program component'],
    description: 'Comprehensive clean energy investment program for New York including renewable energy development and grid modernization',
    contactInfo: 'info@nyserda.ny.gov',
    applicationUrl: 'https://www.nyserda.ny.gov/clean-energy-fund'
  },
  {
    name: 'NY-Sun Incentive Program',
    provider: 'NYSERDA',
    level: 'state',
    amount: '$0.20-$0.40 per watt',
    deadline: '2025-12-31',
    projectTypes: ['Solar PV', 'Energy Storage'],
    requirements: ['NY residents and businesses', 'Qualified installer required', 'System size limits apply'],
    description: 'New York State incentives for solar photovoltaic installations and energy storage systems',
    contactInfo: 'solar@nyserda.ny.gov',
    applicationUrl: 'https://www.nyserda.ny.gov/all-programs/programs/ny-sun'
  },
  {
    name: 'DOE Loan Programs Office - Title XVII',
    provider: 'Department of Energy',
    level: 'federal',
    amount: '$40+ billion loan authority',
    deadline: null,
    projectTypes: ['Clean Energy', 'Advanced Technology', 'Grid Infrastructure', 'Manufacturing'],
    requirements: ['Innovative clean energy projects', 'Commercial viability', 'Significant environmental benefits'],
    description: 'Federal loan guarantees for innovative clean energy projects and advanced technology manufacturing facilities',
    contactInfo: 'lpo@hq.doe.gov',
    applicationUrl: 'https://www.energy.gov/lpo/title-xvii'
  },
  {
    name: 'DOE Better Buildings Challenge',
    provider: 'Department of Energy',
    level: 'federal',
    amount: '$500 million program',
    deadline: null,
    projectTypes: ['Energy Efficiency', 'Building Retrofits', 'HVAC Systems', 'Lighting Upgrades'],
    requirements: ['Commercial and industrial buildings', 'Energy reduction commitments', 'Data sharing requirements'],
    description: 'Federal initiative supporting energy efficiency improvements in commercial and industrial buildings',
    contactInfo: 'betterbuildings@ee.doe.gov',
    applicationUrl: 'https://betterbuildingssolutioncenter.energy.gov/challenge'
  },
  {
    name: 'HUD Green and Resilient Retrofit Program',
    provider: 'HUD',
    level: 'federal',
    amount: '$837 million total',
    deadline: '2025-09-30',
    projectTypes: ['Energy Efficiency', 'Climate Resilience', 'Affordable Housing', 'Health Improvements'],
    requirements: ['Public housing authorities', 'Affordable housing owners', 'Performance standards'],
    description: 'Federal funding for green retrofits in affordable housing focusing on energy efficiency and climate resilience improvements',
    contactInfo: 'PIH-GRRP@hud.gov',
    applicationUrl: 'https://www.hud.gov/program_offices/public_indian_housing/grrp'
  },
  {
    name: 'EPA Greenhouse Gas Reduction Fund',
    provider: 'EPA',
    level: 'federal',
    amount: '$27 billion total',
    deadline: '2030-12-31',
    projectTypes: ['Clean Technology', 'Renewable Energy', 'Energy Efficiency', 'Transportation'],
    requirements: ['Disadvantaged communities focus', 'Greenhouse gas reduction', 'Leverage private capital'],
    description: 'Federal funding for clean technology deployment and greenhouse gas reduction projects with focus on disadvantaged communities',
    contactInfo: 'ggrf@epa.gov',
    applicationUrl: 'https://www.epa.gov/greenhouse-gas-reduction-fund'
  },
  {
    name: 'USDA Rural Energy for America Program (REAP)',
    provider: 'USDA',
    level: 'federal',
    amount: '$2 billion authorized',
    deadline: null,
    projectTypes: ['Solar', 'Wind', 'Biomass', 'Energy Efficiency', 'Anaerobic Digesters'],
    requirements: ['Rural areas', 'Agricultural producers', 'Rural small businesses', 'Energy audits may be required'],
    description: 'Federal grants and loans for renewable energy and energy efficiency improvements in rural areas',
    contactInfo: 'RD.RuralEnergyPrograms@usda.gov',
    applicationUrl: 'https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program-renewable-energy-systems-energy-efficiency-improvement-guaranteed-loans'
  },
  {
    name: 'California Self-Generation Incentive Program (SGIP)',
    provider: 'California PUC',
    level: 'state',
    amount: '$1.2 billion program',
    deadline: null,
    projectTypes: ['Energy Storage', 'Fuel Cells', 'Wind', 'Waste Heat Recovery'],
    requirements: ['California utility customers', 'Interconnection requirements', 'Performance monitoring'],
    description: 'California state incentives for distributed energy resources including battery storage systems and fuel cells',
    contactInfo: 'info@selfgenca.com',
    applicationUrl: 'https://www.selfgenca.com/'
  }
];

async function populateDatabase() {
  console.log('Populating database with real government incentive data...');
  
  try {
    let added = 0;
    
    for (const incentive of governmentIncentives) {
      try {
        await db.insert(incentives).values({
          name: incentive.name,
          provider: incentive.provider,
          level: incentive.level,
          amount: incentive.amount,
          deadline: incentive.deadline,
          projectTypes: incentive.projectTypes,
          requirements: incentive.requirements,
          description: incentive.description,
          contactInfo: incentive.contactInfo,
          applicationUrl: incentive.applicationUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        added++;
        console.log(`Added: ${incentive.name}`);
        
      } catch (error) {
        if (error.message?.includes('duplicate') || error.code === '23505') {
          console.log(`Skipped duplicate: ${incentive.name}`);
        } else {
          console.log(`Error adding ${incentive.name}: ${error.message}`);
        }
      }
    }
    
    console.log(`Successfully added ${added} new government incentive programs`);
    
    // Get updated count
    const allIncentives = await db.select().from(incentives);
    console.log(`Database now contains ${allIncentives.length} total programs`);
    
  } catch (error) {
    console.error('Database population error:', error);
  }
}

populateDatabase();