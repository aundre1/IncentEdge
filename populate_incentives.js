// Script to populate IncentEdge database with real government incentive data
import { storage } from './server/storage.js';

const realGovernmentIncentives = [
  {
    name: "Commercial Building Energy Efficiency Tax Deduction (179D)",
    provider: "IRS",
    level: "federal",
    fundingAmount: "$5.00 per sq ft",
    deadline: "Permanent",
    projectTypes: ["Commercial Buildings", "Energy Efficiency"],
    technology: "efficiency",
    description: "Federal tax deduction for energy-efficient commercial buildings meeting specified energy savings targets",
    status: "active",
    eligibility: "Building owners, architects, engineers, contractors who design qualifying buildings"
  },
  {
    name: "Investment Tax Credit (ITC) for Solar",
    provider: "IRS", 
    level: "federal",
    fundingAmount: "30% tax credit",
    deadline: "2032 (30%), 2033 (26%), 2034+ (22%)",
    projectTypes: ["Solar PV", "Solar Thermal", "Solar Water Heating"],
    technology: "renewable",
    description: "Federal tax credit for solar energy systems on residential and commercial properties",
    status: "active",
    eligibility: "Property owners installing qualifying solar energy systems"
  },
  {
    name: "Production Tax Credit (PTC)",
    provider: "IRS",
    level: "federal", 
    fundingAmount: "$0.026 per kWh",
    deadline: "2024 (100%), 2025 (60%), 2026 (40%)",
    projectTypes: ["Wind", "Geothermal", "Biomass", "Hydroelectric"],
    technology: "renewable",
    description: "Federal tax credit for electricity generated from qualifying renewable sources",
    status: "active",
    eligibility: "Owners of renewable energy facilities placed in service"
  },
  {
    name: "Clean Vehicle Tax Credit",
    provider: "IRS",
    level: "federal",
    fundingAmount: "Up to $7,500",
    deadline: "Permanent",
    projectTypes: ["Electric Vehicles", "Plug-in Hybrids"],
    technology: "ev",
    description: "Federal tax credit for new and used clean vehicles meeting requirements",
    status: "active", 
    eligibility: "Individual taxpayers purchasing qualifying clean vehicles"
  },
  {
    name: "NYSERDA Clean Energy Fund",
    provider: "NYSERDA",
    level: "state",
    fundingAmount: "$5.3B total program",
    deadline: "2025",
    projectTypes: ["Clean Energy", "Energy Storage", "Grid Modernization", "EV Infrastructure"],
    technology: "renewable",
    description: "Comprehensive clean energy investment program supporting NY's clean energy goals",
    status: "active",
    eligibility: "NY businesses, organizations, municipalities, residents"
  },
  {
    name: "NYC Accelerated Conservation and Efficiency (ACE) Program",
    provider: "NYC DCAS",
    level: "local",
    fundingAmount: "Up to $3M per project",
    deadline: "Ongoing",
    projectTypes: ["Energy Efficiency", "HVAC", "Lighting", "Building Envelope"],
    technology: "efficiency",
    description: "NYC program accelerating energy efficiency improvements in municipal buildings",
    status: "active",
    eligibility: "NYC agencies and departments"
  },
  {
    name: "ConEd Energy Efficiency Programs", 
    provider: "Consolidated Edison",
    level: "utility",
    fundingAmount: "Varies by measure",
    deadline: "Ongoing",
    projectTypes: ["HVAC", "Lighting", "Motors", "Building Controls"],
    technology: "efficiency",
    description: "Comprehensive utility rebate programs for energy efficiency improvements",
    status: "active",
    eligibility: "ConEd electric and gas customers in NYC and Westchester"
  },
  {
    name: "Alternative Fuel Vehicle Refueling Property Credit",
    provider: "IRS",
    level: "federal",
    fundingAmount: "30% up to $30K commercial, $1K residential",
    deadline: "2024",
    projectTypes: ["EV Charging Stations", "Hydrogen Fueling", "CNG Stations"],
    technology: "ev", 
    description: "Federal tax credit for alternative fuel vehicle refueling infrastructure",
    status: "active",
    eligibility: "Businesses and individuals installing qualifying refueling equipment"
  },
  {
    name: "NY Green Bank Financing",
    provider: "NY Green Bank",
    level: "state",
    fundingAmount: "$1B+ available",
    deadline: "Ongoing",
    projectTypes: ["Solar", "Wind", "Energy Storage", "Energy Efficiency"],
    technology: "renewable",
    description: "Low-cost financing and investment for clean energy projects in New York",
    status: "active",
    eligibility: "Clean energy developers, businesses, and project sponsors in NY"
  },
  {
    name: "HUD Green and Resilient Retrofit Program (GRRP)",
    provider: "HUD",
    level: "federal",
    fundingAmount: "$837M total funding",
    deadline: "2025",
    projectTypes: ["Affordable Housing", "Energy Efficiency", "Climate Resilience"],
    technology: "efficiency",
    description: "Federal funding for green retrofits and resilience improvements in affordable housing",
    status: "active",
    eligibility: "Public housing authorities and affordable housing owners"
  },
  {
    name: "EPA Greenhouse Gas Reduction Fund",
    provider: "EPA",
    level: "federal", 
    fundingAmount: "$27B total program",
    deadline: "2026",
    projectTypes: ["Clean Energy", "Energy Efficiency", "Zero-Emission Transportation"],
    technology: "renewable",
    description: "Major federal investment in clean energy projects serving disadvantaged communities",
    status: "active",
    eligibility: "Community development financial institutions, green banks, nonprofits"
  },
  {
    name: "DOE Loan Programs Office - Title XVII",
    provider: "Department of Energy",
    level: "federal",
    fundingAmount: "$40B+ loan authority",
    deadline: "Ongoing",
    projectTypes: ["Clean Energy", "Energy Storage", "Grid Infrastructure", "Critical Materials"],
    technology: "renewable",
    description: "Federal loan guarantees for innovative clean energy technologies and projects",
    status: "active",
    eligibility: "Clean energy project developers and technology companies"
  }
];

async function populateIncentives() {
  console.log('Starting to populate IncentEdge database with real government incentives...');
  
  try {
    for (const incentive of realGovernmentIncentives) {
      console.log(`Adding: ${incentive.name}`);
      // Using the existing storage interface to add incentives
      // This simulates what would happen if the scraper found this data
      const mockScrapedData = [incentive];
      await storage.saveScrapedData(999, mockScrapedData);
      
      // Auto-process into main incentives database
      await storage.autoProcessScrapedData(999);
    }
    
    console.log(`Successfully added ${realGovernmentIncentives.length} real government incentives!`);
    
    // Get updated summary
    const summary = await storage.getIncentivesSummary();
    console.log('Updated database summary:', summary);
    
  } catch (error) {
    console.error('Error populating incentives:', error);
  }
}

populateIncentives();