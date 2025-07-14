// Using built-in fetch API

const realIncentives = [
  {
    title: 'Residential Clean Energy Credit',
    provider: 'IRS',
    amount: 30,
    amountType: 'percentage',
    description: 'Federal tax credit for residential clean energy installations including solar PV, solar water heating, wind, and geothermal systems',
    projectTypes: ['Solar PV', 'Solar Water Heating', 'Wind', 'Geothermal'],
    level: 'federal',
    technology: 'renewable',
    status: 'active',
    deadline: '2032-12-31',
    url: 'https://www.irs.gov/credits-deductions/residential-clean-energy-credit',
    sourceType: 'Government Website'
  },
  {
    title: 'Energy Efficient Home Improvement Credit',
    provider: 'IRS', 
    amount: 3200,
    amountType: 'fixed',
    description: 'Federal tax credit for energy-efficient home improvements including HVAC, water heaters, insulation, and windows',
    projectTypes: ['HVAC', 'Water Heaters', 'Insulation', 'Windows'],
    level: 'federal',
    technology: 'efficiency',
    status: 'active',
    deadline: '2032-12-31',
    url: 'https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit'
  },
  {
    title: 'Investment Tax Credit (ITC)',
    provider: 'IRS',
    amount: 30,
    amountType: 'percentage',
    description: 'Federal investment tax credit for renewable energy systems including solar, wind, fuel cells, and energy storage',
    projectTypes: ['Solar', 'Wind', 'Fuel Cells', 'Energy Storage'],
    level: 'federal',
    technology: 'storage',
    status: 'active',
    deadline: '2032-12-31',
    url: 'https://www.irs.gov/businesses/investment-tax-credit'
  },
  {
    title: 'Production Tax Credit (PTC)',
    provider: 'IRS',
    amount: 26,
    amountType: 'per_kwh',
    description: 'Federal tax credit for electricity generated from renewable sources including wind, geothermal, biomass, and hydroelectric',
    projectTypes: ['Wind', 'Geothermal', 'Biomass', 'Hydroelectric'],
    level: 'federal',
    technology: 'renewable',
    status: 'active',
    deadline: '2024-12-31',
    url: 'https://www.irs.gov/businesses/production-tax-credit'
  },
  {
    title: 'Commercial Building Energy Efficiency Tax Deduction (179D)',
    provider: 'IRS',
    amount: 5,
    amountType: 'per_sqft',
    description: 'Federal tax deduction for energy-efficient commercial buildings meeting specific energy targets',
    projectTypes: ['HVAC', 'Lighting', 'Building Envelope'],
    level: 'federal',
    technology: 'efficiency',
    status: 'active',
    deadline: null,
    url: 'https://www.irs.gov/businesses/179d-deduction'
  },
  {
    title: 'Clean Vehicle Tax Credit',
    provider: 'IRS',
    amount: 7500,
    amountType: 'fixed',
    description: 'Federal tax credit for new and used clean vehicles including electric vehicles and plug-in hybrids',
    projectTypes: ['Electric Vehicles', 'Plug-in Hybrids'],
    level: 'federal',
    technology: 'ev',
    status: 'active',
    deadline: null,
    url: 'https://www.irs.gov/credits-deductions/clean-vehicle-tax-credit'
  },
  {
    title: 'Alternative Fuel Vehicle Refueling Property Credit',
    provider: 'IRS',
    amount: 30000,
    amountType: 'fixed',
    description: 'Federal tax credit for alternative fuel vehicle infrastructure including EV charging, hydrogen fueling, and CNG stations',
    projectTypes: ['EV Charging', 'Hydrogen Fueling', 'CNG Stations'],
    level: 'federal',
    technology: 'ev',
    status: 'active',
    deadline: '2024-12-31',
    url: 'https://www.irs.gov/businesses/alternative-fuel-vehicle-refueling-property-credit'
  },
  {
    title: 'NYSERDA Clean Energy Fund',
    provider: 'NYSERDA',
    amount: 5300000000,
    amountType: 'program_total',
    description: 'Comprehensive clean energy investment program for New York including solar, wind, energy storage, and grid modernization',
    projectTypes: ['Solar', 'Wind', 'Energy Storage', 'Grid Modernization'],
    level: 'state',
    technology: 'renewable',
    status: 'active',
    deadline: '2025-12-31',
    url: 'https://www.nyserda.ny.gov/clean-energy-fund'
  },
  {
    title: 'DOE Loan Programs Office - Title XVII',
    provider: 'Department of Energy',
    amount: 40000000000,
    amountType: 'loan_authority',
    description: 'Federal loan guarantees for innovative clean energy projects including advanced technology and grid infrastructure',
    projectTypes: ['Clean Energy', 'Advanced Technology', 'Grid Infrastructure'],
    level: 'federal',
    technology: 'research',
    status: 'active',
    deadline: null,
    url: 'https://www.energy.gov/lpo/title-xvii'
  },
  {
    title: 'HUD Green and Resilient Retrofit Program',
    provider: 'HUD',
    amount: 837000000,
    amountType: 'program_total',
    description: 'Federal funding for green retrofits in affordable housing focusing on energy efficiency and climate resilience',
    projectTypes: ['Energy Efficiency', 'Climate Resilience', 'Affordable Housing'],
    level: 'federal',
    technology: 'efficiency',
    status: 'active',
    deadline: '2025-09-30',
    url: 'https://www.hud.gov/green-and-resilient-retrofit'
  },
  {
    title: 'EPA Greenhouse Gas Reduction Fund',
    provider: 'EPA',
    amount: 27000000000,
    amountType: 'program_total',
    description: 'Federal funding for clean technology deployment and greenhouse gas reduction projects',
    projectTypes: ['Clean Technology', 'Renewable Energy', 'Energy Efficiency'],
    level: 'federal',
    technology: 'renewable',
    status: 'active',
    deadline: '2030-12-31',
    url: 'https://www.epa.gov/greenhouse-gas-reduction-fund'
  },
  {
    title: 'USDA Rural Energy for America Program (REAP)',
    provider: 'USDA',
    amount: 25000000,
    amountType: 'program_total',
    description: 'Federal grants and loans for renewable energy and energy efficiency improvements in rural areas',
    projectTypes: ['Solar', 'Wind', 'Biomass', 'Energy Efficiency'],
    level: 'federal',
    technology: 'renewable',
    status: 'active',
    deadline: null,
    url: 'https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program-renewable-energy-systems-energy-efficiency-improvement-guaranteed-loans'
  },
  {
    title: 'DOE Better Buildings Challenge',
    provider: 'Department of Energy',
    amount: 500000000,
    amountType: 'program_total',
    description: 'Federal initiative supporting energy efficiency improvements in commercial and industrial buildings',
    projectTypes: ['Energy Efficiency', 'Building Retrofits', 'HVAC Systems'],
    level: 'federal',
    technology: 'efficiency',
    status: 'active',
    deadline: null,
    url: 'https://www.energy.gov/better-buildings-challenge'
  },
  {
    title: 'California Self-Generation Incentive Program (SGIP)',
    provider: 'California PUC',
    amount: 1000000000,
    amountType: 'program_total',
    description: 'State incentives for distributed energy resources including energy storage and fuel cells',
    projectTypes: ['Energy Storage', 'Fuel Cells', 'Wind', 'Waste Heat'],
    level: 'state',
    technology: 'storage',
    status: 'active',
    deadline: null,
    url: 'https://www.selfgenca.com/'
  },
  {
    title: 'Texas Renewable Energy Incentive Program',
    provider: 'Texas State Energy Office',
    amount: 250000000,
    amountType: 'program_total',
    description: 'State grants and incentives for renewable energy projects and energy efficiency improvements',
    projectTypes: ['Solar', 'Wind', 'Energy Efficiency', 'Electric Vehicles'],
    level: 'state',
    technology: 'renewable',
    status: 'active',
    deadline: null,
    url: 'https://comptroller.texas.gov/economy/local/ch313/'
  }
];

async function addIncentive(incentive) {
  try {
    const response = await fetch('http://localhost:5000/api/incentives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incentive)
    });
    
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      const error = await response.text();
      console.log(`Failed to add ${incentive.title}: ${error}`);
      return null;
    }
  } catch (error) {
    console.log(`Error adding ${incentive.title}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('Adding real government incentives to database...');
  
  let added = 0;
  let skipped = 0;
  
  for (const incentive of realIncentives) {
    const result = await addIncentive(incentive);
    if (result) {
      added++;
      console.log(`✅ Added: ${incentive.title}`);
    } else {
      skipped++;
      console.log(`⚠️ Skipped: ${incentive.title}`);
    }
  }
  
  console.log(`\nComplete! Added ${added} incentives, skipped ${skipped} duplicates`);
  
  // Get updated summary
  try {
    const summaryResponse = await fetch('http://localhost:5000/api/incentives/summary');
    const summary = await summaryResponse.json();
    console.log(`\nDatabase now contains ${summary.totalPrograms} total programs`);
    console.log(`Total funding: ${summary.totalFunding}`);
  } catch (error) {
    console.log('Could not fetch updated summary');
  }
}

main().catch(console.error);