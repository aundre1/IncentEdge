// Import necessary types
import { type InsertIncentive } from "@shared/schema";

// Sample incentives data based on real-world sustainability programs
const incentivesData: InsertIncentive[] = [
  {
    name: "179D Energy Efficient Commercial Buildings Tax Deduction",
    provider: "IRS (Enhanced by IRA)",
    level: "Federal",
    amount: "Up to $5.00/sq ft",
    deadline: "Permanent",
    description: "Tax deduction for energy efficient commercial building improvements, recently enhanced by the Inflation Reduction Act.",
    projectTypes: ["Commercial", "HVAC", "Lighting", "Envelope", "Hot Water"],
    requirements: [
      "Minimum 25% energy savings",
      "Prevailing wage for maximum deduction",
      "Includes government building designers",
      "ASHRAE 90.1 compliance"
    ],
    contactInfo: "IRS.gov/Form8908",
    applicationUrl: "https://www.irs.gov/businesses/179d-commercial-buildings-energy-efficiency-tax-deduction"
  },
  {
    name: "45L New Energy Efficient Home Credit",
    provider: "IRS (IRA Enhanced)",
    level: "Federal",
    amount: "$2,500-$5,000/unit",
    deadline: "Through 2032",
    description: "Federal tax credit for builders of energy efficient residential homes and multifamily projects.",
    projectTypes: ["New Construction", "Multifamily", "Energy Star"],
    requirements: [
      "Energy Star certification required",
      "$5,000 for Zero Energy Ready",
      "Prevailing wage required",
      "3 stories or less"
    ],
    contactInfo: "IRS.gov/Form8908",
    applicationUrl: "https://www.energystar.gov/partner_resources/residential_new/homes_prog_reqs/45l_fed_tax_credit"
  },
  {
    name: "Investment Tax Credit (ITC)",
    provider: "IRS",
    level: "Federal",
    amount: "30% of project cost",
    deadline: "Through 2032",
    description: "Federal tax credit for solar, battery storage, and other renewable energy systems.",
    projectTypes: ["Solar", "Storage", "Geothermal"],
    requirements: [
      "Commercial properties",
      "Direct pay for non-profits",
      "Domestic content bonus +10%",
      "Energy community bonus +10%"
    ],
    contactInfo: "IRS.gov/Form3468",
    applicationUrl: "https://www.energy.gov/eere/solar/solar-investment-tax-credit-businesses"
  },
  {
    name: "Building Cleaner Communities Competition",
    provider: "NYSERDA",
    level: "State",
    amount: "$15M available",
    deadline: "Dec 30, 2025",
    description: "Competitive funding for carbon-neutral building designs in New York State.",
    projectTypes: ["Net-Zero", "Carbon Neutral", "Deep Retrofit"],
    requirements: [
      "Carbon neutral design required",
      "50%+ to disadvantaged communities",
      "Part of Regional EDC process",
      "Peak demand reduction focus"
    ],
    contactInfo: "cleaner.buildings@nyserda.ny.gov",
    applicationUrl: "https://www.nyserda.ny.gov/All-Programs/Programs/Clean-Energy-Fund"
  },
  {
    name: "NYS Clean Heat Program",
    provider: "NYSERDA",
    level: "State",
    amount: "$1,500-$3,000/ton",
    deadline: "Ongoing",
    description: "Incentives for heat pump and geothermal installations in New York State buildings.",
    projectTypes: ["Heat Pumps", "Geothermal", "VRF Systems"],
    requirements: [
      "Air source or ground source",
      "Must replace fossil fuel system",
      "Qualified contractor required",
      "Higher incentives in disadvantaged areas"
    ],
    contactInfo: "cleanheat@nyserda.ny.gov",
    applicationUrl: "https://www.nyserda.ny.gov/ny-clean-heat"
  },
  {
    name: "FlexTech Program",
    provider: "NYSERDA",
    level: "State",
    amount: "50% cost share",
    deadline: "Ongoing",
    description: "Cost-sharing for energy studies and feasibility analyses for commercial properties.",
    projectTypes: ["Energy Studies", "Feasibility", "Indoor Air Quality"],
    requirements: [
      "Technical studies only",
      "Commercial/industrial/institutional",
      "Max $1M per study",
      "Implementation plan required"
    ],
    contactInfo: "flextech@nyserda.ny.gov",
    applicationUrl: "https://www.nyserda.ny.gov/All-Programs/Programs/FlexTech-Program"
  },
  {
    name: "Energy Storage Incentive Program",
    provider: "NYSERDA",
    level: "State",
    amount: "$200-350/kWh",
    deadline: "Block-based",
    description: "Incentives for battery storage systems in New York State, with higher rates in NYC/Westchester.",
    projectTypes: ["Battery Storage", "Grid Services", "Resilience"],
    requirements: [
      "NYC/Westchester higher rates",
      "Paired with solar gets bonus",
      "Min 5 kW system",
      "10-year performance requirement"
    ],
    contactInfo: "energystorage@nyserda.ny.gov",
    applicationUrl: "https://www.nyserda.ny.gov/All-Programs/Programs/Energy-Storage"
  },
  {
    name: "Buildings Innovation Funding",
    provider: "NYSERDA",
    level: "State",
    amount: "$5M available",
    deadline: "July 24, 2025",
    description: "Funding for innovative building technologies and demonstration projects.",
    projectTypes: ["Innovation", "Demonstration", "Emerging Tech"],
    requirements: [
      "New/emerging technologies",
      "Demonstration projects",
      "Clean energy focus",
      "Scalability required"
    ],
    contactInfo: "innovation@nyserda.ny.gov",
    applicationUrl: "https://www.nyserda.ny.gov/All-Programs/Programs/Multifamily-Buildings-of-Excellence"
  },
  {
    name: "NYC Accelerator PACE Financing",
    provider: "NYC Mayor's Office/NYCEEC",
    level: "Local/NYC",
    amount: "100% project cost",
    deadline: "Ongoing",
    description: "Long-term, low-cost financing for energy efficiency and renewable energy projects in NYC buildings.",
    projectTypes: ["Long-term Finance", "Energy Efficiency", "Renewable Energy"],
    requirements: [
      "Commercial & multifamily",
      "20-year terms available",
      "No upfront cash required",
      "LL97 compliance projects eligible"
    ],
    contactInfo: "info@nycaccelerator.com",
    applicationUrl: "https://accelerator.nyc/pace"
  },
  {
    name: "Local Law 97 Compliance Support",
    provider: "NYC Accelerator",
    level: "Local/NYC",
    amount: "Free assistance",
    deadline: "May 1, 2025 filing",
    description: "Technical assistance for NYC buildings to comply with carbon emissions limits under Local Law 97.",
    projectTypes: ["Decarbonization", "Compliance", "Technical Support"],
    requirements: [
      "Buildings >25,000 sq ft",
      "Free energy assessments",
      "Decarbonization planning",
      "Penalty avoidance strategies"
    ],
    contactInfo: "info@nycaccelerator.com",
    applicationUrl: "https://accelerator.nyc/ll97"
  },
  {
    name: "Con Edison C&I Energy Efficiency",
    provider: "Con Edison",
    level: "Utility",
    amount: "Up to $1M electric/$250K gas",
    deadline: "Ongoing",
    description: "Rebates and incentives for energy efficiency projects in Con Edison service territory.",
    projectTypes: ["Custom Measures", "Prescriptive", "Whole Building"],
    requirements: [
      ">100kW peak demand",
      "50% cost cap per measure",
      "Pre-approval required",
      "Queens/Brooklyn bonus available"
    ],
    contactInfo: "commercialprograms@coned.com",
    applicationUrl: "https://coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-tax-credits-for-commercial-industrial-buildings-customers"
  },
  {
    name: "Con Edison Geothermal Incentive",
    provider: "Con Edison",
    level: "Utility",
    amount: "Up to $40,000",
    deadline: "May 31, 2025",
    description: "Incentives for geothermal heat pump installations in the Con Edison service territory.",
    projectTypes: ["Geothermal", "Heat Pumps", "Ground Source"],
    requirements: [
      "Residential and small commercial",
      "Must replace fossil fuel heating",
      "Approved contractor required",
      "Efficiency verification required"
    ],
    contactInfo: "geothermal@coned.com",
    applicationUrl: "https://coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-tax-credits-for-commercial-industrial-buildings-customers/ground-source-heat-pumps"
  },
  {
    name: "Commercial Property Assessed Clean Energy (C-PACE)",
    provider: "Energy Improvement Corporation",
    level: "Local/Westchester",
    amount: "Up to 100% of project cost",
    deadline: "Ongoing",
    description: "Long-term financing for clean energy improvements in commercial properties in Westchester County.",
    projectTypes: ["Energy Efficiency", "Renewable Energy", "Resilience"],
    requirements: [
      "Commercial, industrial, non-profit",
      "20+ year terms",
      "Assessment on property tax bill",
      "Energy savings verification"
    ],
    contactInfo: "info@energizeny.org",
    applicationUrl: "https://energizeny.org/commercial-pace/"
  },
  {
    name: "Weatherization Assistance Program",
    provider: "NYS HCR",
    level: "State",
    amount: "Up to $10,000/unit",
    deadline: "Ongoing",
    description: "Free weatherization services for income-eligible residential properties.",
    projectTypes: ["Weatherization", "Insulation", "Air Sealing"],
    requirements: [
      "Income-qualified residents",
      "Single and multifamily eligible",
      "Energy audit required",
      "Health and safety measures included"
    ],
    contactInfo: "weatherization@nyshcr.org",
    applicationUrl: "https://hcr.ny.gov/weatherization"
  },
  {
    name: "Climate Capital Grant Program",
    provider: "DASNY/NYSERDA",
    level: "State",
    amount: "$75M total available",
    deadline: "Sept 30, 2025",
    description: "Capital grants for decarbonization projects in disadvantaged communities.",
    projectTypes: ["Decarbonization", "Community Projects", "Disadvantaged Communities"],
    requirements: [
      "Located in disadvantaged community",
      "Public benefit required",
      "GHG reduction metrics",
      "Community engagement plan"
    ],
    contactInfo: "climatecapital@dasny.org",
    applicationUrl: "https://dasny.org/climatecapital"
  },
  {
    name: "Energy Investment Tax Credit (ITC) - Extended",
    provider: "Federal Government",
    level: "Federal",
    amount: "30% of cost",
    deadline: "Through 2032",
    description: "Extended tax credit for renewable energy investments including solar, wind, and certain storage technologies.",
    projectTypes: ["Renewable Energy", "Storage", "Solar"],
    requirements: [
      "Commercial properties",
      "Depreciation schedule requirements",
      "Placed in service requirements",
      "Potential bonus depreciation"
    ],
    contactInfo: "energytaxcredits@irs.gov",
    applicationUrl: "https://www.irs.gov/credits-deductions/businesses/energy-investment-tax-credit"
  },
  {
    name: "Affordable Solar & Storage Program",
    provider: "NYSERDA",
    level: "State",
    amount: "Additional $8,000 per project",
    deadline: "Ongoing",
    description: "Additional incentives for income-qualified homeowners and affordable housing providers.",
    projectTypes: ["Solar", "Storage", "Affordable Housing"],
    requirements: [
      "Income qualification required",
      "Affordable housing developments",
      "Must be paired with NY-Sun incentive",
      "Workforce development component"
    ],
    contactInfo: "affordablesolar@nyserda.ny.gov",
    applicationUrl: "https://www.nyserda.ny.gov/All-Programs/Programs/NY-Sun/Solar-for-Your-Home/Paying-for-Solar/Loans-and-Financing"
  },
  {
    name: "Community Heat Pump Systems",
    provider: "NYSERDA",
    level: "State",
    amount: "Up to $5M per project",
    deadline: "Dec 2025",
    description: "Funding for community-scale heat pump systems serving multiple buildings.",
    projectTypes: ["Heat Pumps", "Community Systems", "District Energy"],
    requirements: [
      "Multiple buildings required",
      "Technical feasibility study",
      "Disadvantaged community focus",
      "Performance monitoring plan"
    ],
    contactInfo: "communityheatpumps@nyserda.ny.gov",
    applicationUrl: "https://www.nyserda.ny.gov/All-Programs/Programs/Community-Heat-Pump-Systems"
  },
  {
    name: "Empire Building Challenge",
    provider: "NYSERDA",
    level: "State",
    amount: "Up to $10M per project",
    deadline: "October 15, 2025",
    description: "Public-private partnership to develop replicable approaches to deep carbon reductions in large buildings.",
    projectTypes: ["Deep Carbon Reduction", "High-Rise", "Replicable Solutions"],
    requirements: [
      "1M+ sq ft portfolio",
      "High-rise focus",
      "Path to carbon neutrality",
      "Replication plan required"
    ],
    contactInfo: "EBC@nyserda.ny.gov",
    applicationUrl: "https://www.nyserda.ny.gov/All-Programs/Programs/Empire-Building-Challenge"
  },
  {
    name: "Clean Energy Fund - Commercial",
    provider: "NYSERDA",
    level: "State",
    amount: "Varies by program",
    deadline: "Ongoing",
    description: "Umbrella funding mechanism for various commercial clean energy programs in NYS.",
    projectTypes: ["Efficiency", "Renewables", "Innovation"],
    requirements: [
      "Commercial properties",
      "Program-specific requirements",
      "Energy performance metrics",
      "Cost-sharing typically required"
    ],
    contactInfo: "info@nyserda.ny.gov",
    applicationUrl: "https://www.nyserda.ny.gov/All-Programs/Programs/Clean-Energy-Fund"
  },
  {
    name: "Low Carbon Pathways for Multifamily Buildings",
    provider: "NYSERDA",
    level: "State",
    amount: "Up to $2M per project",
    deadline: "Rolling through 2025",
    description: "Funding for design and construction of very low carbon multifamily buildings.",
    projectTypes: ["Multifamily", "Low Carbon", "New Construction"],
    requirements: [
      "10+ units",
      "≤7 EUI or PHIUS certification",
      "All-electric design",
      "Low embodied carbon materials"
    ],
    contactInfo: "LowCarbonPathways@nyserda.ny.gov",
    applicationUrl: "https://www.nyserda.ny.gov/All-Programs/Programs/Low-Carbon-Pathways-for-Multifamily-Buildings"
  }
];

export default incentivesData;