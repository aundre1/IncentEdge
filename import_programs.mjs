import { db } from './server/db.ts';
import { incentives } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

// Validated programs from CSV analysis
const validatedPrograms = [
  // EPA Programs (10 programs) - $54B total
  {
    name: "Clean Communities Investment Accelerator",
    provider: "EPA",
    level: "federal",
    amount: 6000000000,
    status: "active",
    deadline: null,
    description: "Community lenders working in low-income and disadvantaged communities are eligible to apply for funding and technical assistance under the Clean Communities Investment Accelerator program.",
    projectTypes: ["Community Development", "Clean Energy"],
    technology: "Community Investment",
    url: "https://www.epa.gov/greenhouse-gas-reduction-fund/clean-communities-investment-accelerator"
  },
  {
    name: "Greenhouse Gas Reduction Fund",
    provider: "EPA",
    level: "federal",
    amount: 27000000000,
    status: "active",
    deadline: null,
    description: "Grant recipients, national nonprofit clean financing institutions, hub nonprofits, low-income and disadvantaged communities",
    projectTypes: ["Climate & Resilience", "Clean Energy"],
    technology: "Environmental",
    url: "https://www.epa.gov/greenhouse-gas-reduction-fund"
  },
  {
    name: "Solar for All",
    provider: "EPA",
    level: "federal",
    amount: 7000000000,
    status: "active",
    deadline: null,
    description: "Low-income and disadvantaged communities, households in low-income communities, Tribes, states, territories",
    projectTypes: ["Solar", "Renewable Energy"],
    technology: "Solar",
    url: "https://www.epa.gov/greenhouse-gas-reduction-fund/solar-all"
  },
  {
    name: "National Clean Investment Fund",
    provider: "EPA",
    level: "federal",
    amount: 14000000000,
    status: "active",
    deadline: null,
    description: "The funding is dedicated to low-income and disadvantaged communities, with a minimum of 40% of capital allocated to these communities.",
    projectTypes: ["Clean Energy", "Community Development"],
    technology: "Environmental",
    url: "https://www.epa.gov/greenhouse-gas-reduction-fund/national-clean-investment-fund"
  },
  
  // IRS Programs (Key federal tax credits)
  {
    name: "Residential Clean Energy Credit",
    provider: "IRS",
    level: "federal",
    amount: 0, // 30% credit
    status: "active",
    deadline: null,
    description: "30% tax credit for homeowners who install eligible clean energy property in their primary residence in the United States",
    projectTypes: ["Residential", "Clean Energy"],
    technology: "Solar",
    url: "https://www.irs.gov/credits-deductions/residential-clean-energy-credit"
  },
  {
    name: "Energy Efficient Home Improvement Credit",
    provider: "IRS",
    level: "federal",
    amount: 3200,
    status: "active",
    deadline: "2033-01-01",
    description: "Tax credit for individuals who make energy-efficient improvements to their primary residence in the US. Renovations must be completed by January 1, 2033",
    projectTypes: ["Energy Efficiency", "Residential"],
    technology: "Energy Storage",
    url: "https://www.irs.gov/credits-deductions/energy-efficient-home-improvement-credit"
  },
  {
    name: "Energy Efficient Commercial Buildings Deduction",
    provider: "IRS",
    level: "federal",
    amount: 0,
    status: "active",
    deadline: null,
    description: "Commercial building owners who make energy-efficient improvements",
    projectTypes: ["Energy Efficiency", "Commercial"],
    technology: "Energy Storage",
    url: "https://www.irs.gov/credits-deductions/energy-efficient-commercial-buildings-deduction"
  },
  {
    name: "Alternative Fuel Vehicle Refueling Property Credit",
    provider: "IRS",
    level: "federal",
    amount: 0,
    status: "active",
    deadline: null,
    description: "Individuals and businesses who install alternative fuel vehicle refueling property",
    projectTypes: ["Transportation/EV", "Clean Energy"],
    technology: "Transportation",
    url: "https://www.irs.gov/credits-deductions/alternative-fuel-vehicle-refueling-property-credit"
  },
  {
    name: "Advanced Energy Project Credit",
    provider: "IRS",
    level: "federal",
    amount: 0,
    status: "active",
    deadline: null,
    description: "Individuals and businesses interested in clean energy projects",
    projectTypes: ["Advanced Technologies", "Clean Energy"],
    technology: "Advanced Technologies",
    url: "https://www.irs.gov/credits-deductions/businesses/advanced-energy-project-credit"
  },
  {
    name: "Credit for Builders of New Energy-Efficient Homes",
    provider: "IRS",
    level: "federal",
    amount: 0,
    status: "active",
    deadline: null,
    description: "Tax credits for builders of energy-efficient homes",
    projectTypes: ["Energy Efficiency", "Residential"],
    technology: "Energy Storage",
    url: "https://www.irs.gov/credits-deductions/credit-for-builders-of-energy-efficient-homes"
  },
  {
    name: "Clean Vehicle and Energy Credits",
    provider: "IRS",
    level: "federal",
    amount: 0,
    status: "active",
    deadline: null,
    description: "Clean vehicle and energy credits for individuals and businesses",
    projectTypes: ["Transportation/EV", "Clean Energy"],
    technology: "Transportation",
    url: "https://www.irs.gov/credits-deductions/clean-vehicle-and-energy-credits"
  },
  {
    name: "Home Energy Tax Credits",
    provider: "IRS", 
    level: "federal",
    amount: 0,
    status: "active",
    deadline: null,
    description: "Home energy tax credits for individuals",
    projectTypes: ["Energy Efficiency", "Residential"],
    technology: "Energy Storage",
    url: "https://www.irs.gov/credits-deductions/home-energy-tax-credits"
  },
  {
    name: "Business Energy Credits and Deductions",
    provider: "IRS",
    level: "federal", 
    amount: 0,
    status: "active",
    deadline: null,
    description: "Credits and deductions for businesses",
    projectTypes: ["Energy Efficiency", "Commercial"],
    technology: "Energy Storage",
    url: "https://www.irs.gov/credits-deductions/businesses"
  },
  {
    name: "Inflation Reduction Act Credits",
    provider: "IRS",
    level: "federal",
    amount: 0,
    status: "active",
    deadline: null,
    description: "Tax credits under the Inflation Reduction Act of 2022 for individuals, businesses, and self-employed",
    projectTypes: ["Clean Energy", "Tax Credit"],
    technology: "Environmental",
    url: "https://www.irs.gov/inflation-reduction-act-of-2022"
  },
  {
    name: "Corporate Alternative Minimum Tax",
    provider: "IRS",
    level: "federal",
    amount: 0,
    status: "active",
    deadline: null,
    description: "Corporations subject to alternative minimum tax under Inflation Reduction Act",
    projectTypes: ["Tax Credit", "Commercial"],
    technology: "Advanced Technologies",
    url: "https://www.irs.gov/inflation-reduction-act-of-2022/corporate-alternative-minimum-tax"
  },
  {
    name: "Elective Pay and Transferability",
    provider: "IRS",
    level: "federal",
    amount: 0,
    status: "active",
    deadline: null,
    description: "Clean energy and vehicle credits and deductions for individuals and businesses",
    projectTypes: ["Clean Energy", "Transportation/EV"],
    technology: "Solar",
    url: "https://www.irs.gov/credits-deductions/elective-pay-and-transferability"
  },

  // New York ESD Programs
  {
    name: "Brownfield Cleanup Program",
    provider: "New York ESD",
    level: "state",
    amount: 0,
    status: "active",
    deadline: "2026-03-31",
    description: "Tax credits for brownfield cleanup program reforms, redevelopment tax credits, tangible property credits. Properties in Environmental Zones, 'Upside down' properties, underutilized properties, sites for affordable housing projects",
    projectTypes: ["Community Development", "Climate & Resilience"],
    technology: "Environmental",
    url: "https://esd.ny.gov/brownfield-cleanup-program"
  },

  // Department of Energy Programs
  {
    name: "Buildings Funding Opportunities - L-Prize Phase III",
    provider: "Department of Energy",
    level: "federal",
    amount: 0,
    status: "active",
    deadline: "2024-10-01",
    description: "L-Prize - Phase III, Manufacturing and Installation - Open to those interested in L-Prize Phase III for manufacturing and installation",
    projectTypes: ["Advanced Technologies", "Energy Efficiency"],
    technology: "Advanced Technologies",
    url: "https://www.energy.gov/eere/buildings/buildings-funding-opportunities"
  },

  // CDFI Fund Program
  {
    name: "New Markets Tax Credit Program",
    provider: "CDFI Fund",
    level: "federal",
    amount: 0,
    status: "active",
    deadline: "2025-01-29",
    description: "Eligibility criteria and application process details are provided on the official website of the Community Development Financial Institutions Fund. Application deadline for the current round of the NMTC Program is January 29, 2025.",
    projectTypes: ["Community Development", "Tax Credit"],
    technology: "Community Investment",
    url: "https://www.cdfifund.gov/programs-training/programs/new-markets-tax-credit/apply-step"
  },

  // NYSERDA Program
  {
    name: "NYSERDA Solicitation Programs",
    provider: "NYSERDA",
    level: "state",
    amount: 0,
    status: "active",
    deadline: null,
    description: "Anyone can apply as long as they follow the submission guidelines and have a NYSERDA Portal account. All Concept Papers or Proposals must be received by 3:00 p.m. ET on the date noted in the solicitation.",
    projectTypes: ["Clean Energy", "Renewable Energy"],
    technology: "Solar",
    url: "https://portal.nyserda.ny.gov/resource/1619795565000/NYSERDA_Solicitation_User_Guide"
  }
];

console.log(`Adding ${validatedPrograms.length} validated programs to IncentEdge database...`);

async function importPrograms() {
  try {
    let addedCount = 0;
    
    for (const program of validatedPrograms) {
      // Check if program already exists
      const existing = await db.select().from(incentives).where(eq(incentives.name, program.name)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(incentives).values({
          name: program.name,
          provider: program.provider,
          level: program.level,
          amount: program.amount.toString(),
          status: program.status,
          deadline: program.deadline || null,
          description: program.description,
          projectTypes: program.projectTypes,
          requirements: [],
          technology: program.technology,
          applicationUrl: program.url,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        addedCount++;
        console.log(`✓ Added: ${program.name}`);
      } else {
        console.log(`- Skipped (exists): ${program.name}`);
      }
    }
    
    console.log(`\n=== IMPORT COMPLETE ===`);
    console.log(`Programs added: ${addedCount}`);
    console.log(`Programs skipped: ${validatedPrograms.length - addedCount}`);
    console.log(`Total programs in database: ${58 + addedCount}`);
    
    // Calculate new funding total
    const totalFunding = validatedPrograms.reduce((sum, p) => sum + (p.amount || 0), 0);
    console.log(`Additional funding tracked: $${(totalFunding / 1000000000).toFixed(1)}B`);
    
  } catch (error) {
    console.error('Error importing programs:', error);
  }
}

importPrograms();