/**
 * Direct Pay Eligibility Checker
 *
 * IRA Section 6417 allows certain tax-exempt entities to receive
 * direct payments instead of tax credits. This module checks eligibility.
 *
 * Eligible Entities:
 * - Tax-exempt organizations (501(c)(3))
 * - State and local governments
 * - Indian tribal governments
 * - Alaska Native Corporations
 * - Rural electric cooperatives
 * - Tennessee Valley Authority
 *
 * Eligible Credits:
 * - Section 30C (Alternative Fuel Vehicle Refueling)
 * - Section 45 (Production Tax Credit)
 * - Section 45Q (Carbon Capture)
 * - Section 45U (Zero-Emission Nuclear)
 * - Section 45V (Clean Hydrogen)
 * - Section 45W (Commercial Clean Vehicles)
 * - Section 45X (Advanced Manufacturing)
 * - Section 45Y (Clean Electricity Production)
 * - Section 45Z (Clean Fuel Production)
 * - Section 48 (Investment Tax Credit)
 * - Section 48C (Advanced Energy Project)
 * - Section 48E (Clean Electricity Investment)
 */

export interface DirectPayEntity {
  type: EntityType;
  taxStatus: TaxStatus;
  ein?: string;
  isRuralElectricCoop?: boolean;
  isAlaskaNativeCorp?: boolean;
  isTVA?: boolean;
}

export type EntityType =
  | 'for-profit'
  | 'nonprofit'
  | 'municipal'
  | 'tribal'
  | 'state'
  | 'federal'
  | 'rural-electric-coop'
  | 'other';

export type TaxStatus =
  | 'for-profit'
  | 'nonprofit'
  | 'tax-exempt'
  | 'municipal'
  | 'tribal';

export type EligibleCreditSection =
  | '30C'
  | '45'
  | '45Q'
  | '45U'
  | '45V'
  | '45W'
  | '45X'
  | '45Y'
  | '45Z'
  | '48'
  | '48C'
  | '48E';

export interface DirectPayResult {
  eligible: boolean;
  reason: string;
  eligibleCredits: EligibleCreditSection[];
  ineligibleCredits: { section: EligibleCreditSection; reason: string }[];
  requirements: string[];
  registrationDeadline?: string;
  notes: string[];
}

// All credits eligible for direct pay under Section 6417
const DIRECT_PAY_CREDITS: EligibleCreditSection[] = [
  '30C', '45', '45Q', '45U', '45V', '45W', '45X', '45Y', '45Z', '48', '48C', '48E'
];

// Credits with special requirements
const CREDITS_WITH_REQUIREMENTS: Record<EligibleCreditSection, string[]> = {
  '30C': ['Must be for qualified alternative fuel vehicle refueling property'],
  '45': ['For electricity produced from qualified energy resources'],
  '45Q': ['Must capture qualified carbon oxide', 'Annual capture requirements apply'],
  '45U': ['For zero-emission nuclear power facilities'],
  '45V': ['For production of qualified clean hydrogen'],
  '45W': ['For qualified commercial clean vehicles'],
  '45X': ['For production of eligible components in the US'],
  '45Y': ['For clean electricity produced at qualified facilities'],
  '45Z': ['For clean fuel produced at qualified facilities'],
  '48': ['For investment in energy property'],
  '48C': ['Must receive DOE allocation', 'Application required'],
  '48E': ['For investment in clean electricity facilities'],
};

/**
 * Check if an entity is eligible for Direct Pay under IRA Section 6417
 */
export function checkDirectPayEligibility(
  entity: DirectPayEntity,
  requestedCredits?: EligibleCreditSection[]
): DirectPayResult {
  const eligibleCredits: EligibleCreditSection[] = [];
  const ineligibleCredits: { section: EligibleCreditSection; reason: string }[] = [];
  const requirements: string[] = [];
  const notes: string[] = [];

  // Check entity eligibility
  const isEligibleEntity = checkEntityEligibility(entity);

  if (!isEligibleEntity.eligible) {
    return {
      eligible: false,
      reason: isEligibleEntity.reason,
      eligibleCredits: [],
      ineligibleCredits: DIRECT_PAY_CREDITS.map(section => ({
        section,
        reason: isEligibleEntity.reason
      })),
      requirements: [],
      notes: ['For-profit entities may still be eligible for credit transferability under Section 6418']
    };
  }

  // Determine which credits to check
  const creditsToCheck = requestedCredits || DIRECT_PAY_CREDITS;

  // Check each credit
  for (const credit of creditsToCheck) {
    const creditRequirements = CREDITS_WITH_REQUIREMENTS[credit] || [];
    eligibleCredits.push(credit);
    requirements.push(...creditRequirements.map(req => `Section ${credit}: ${req}`));
  }

  // Add general requirements
  requirements.push(
    'Pre-filing registration required with IRS',
    'Registration must be completed for each applicable tax year',
    'Must claim credit on timely filed tax return (including extensions)'
  );

  // Add entity-specific notes
  if (entity.type === 'nonprofit') {
    notes.push(
      'As a 501(c)(3) organization, you qualify for direct payment of eligible credits',
      'Consider combining with prevailing wage and apprenticeship bonuses'
    );
  } else if (entity.type === 'municipal' || entity.type === 'state') {
    notes.push(
      'Government entities qualify for direct payment without tax liability',
      'May also be eligible for tax-exempt bond financing'
    );
  } else if (entity.type === 'tribal') {
    notes.push(
      'Tribal governments qualify for direct payment',
      'Additional bonus credits may be available for projects on tribal lands'
    );
  } else if (entity.isRuralElectricCoop) {
    notes.push(
      'Rural electric cooperatives qualify for direct payment',
      'May qualify for additional rural energy community bonus'
    );
  }

  // Registration deadline note
  const currentYear = new Date().getFullYear();
  const deadline = `October 15, ${currentYear + 1}`;
  notes.push(`Registration deadline for ${currentYear} tax year: ${deadline}`);

  return {
    eligible: true,
    reason: isEligibleEntity.reason,
    eligibleCredits,
    ineligibleCredits,
    requirements: Array.from(new Set(requirements)), // Remove duplicates
    registrationDeadline: deadline,
    notes
  };
}

/**
 * Check if entity type qualifies for Direct Pay
 */
function checkEntityEligibility(entity: DirectPayEntity): { eligible: boolean; reason: string } {
  // Special entity types
  if (entity.isTVA) {
    return { eligible: true, reason: 'Tennessee Valley Authority qualifies for Direct Pay' };
  }

  if (entity.isAlaskaNativeCorp) {
    return { eligible: true, reason: 'Alaska Native Corporation qualifies for Direct Pay' };
  }

  if (entity.isRuralElectricCoop) {
    return { eligible: true, reason: 'Rural electric cooperative qualifies for Direct Pay' };
  }

  // Entity type checks
  switch (entity.type) {
    case 'nonprofit':
      if (entity.taxStatus === 'tax-exempt' || entity.taxStatus === 'nonprofit') {
        return { eligible: true, reason: 'Tax-exempt nonprofit organization qualifies for Direct Pay' };
      }
      return { eligible: false, reason: 'Nonprofit must be tax-exempt (501(c)(3)) to qualify' };

    case 'municipal':
      return { eligible: true, reason: 'Municipal government entity qualifies for Direct Pay' };

    case 'state':
      return { eligible: true, reason: 'State government entity qualifies for Direct Pay' };

    case 'federal':
      return { eligible: false, reason: 'Federal agencies are not eligible for Direct Pay' };

    case 'tribal':
      return { eligible: true, reason: 'Indian tribal government qualifies for Direct Pay' };

    case 'for-profit':
      return {
        eligible: false,
        reason: 'For-profit entities are not eligible for Direct Pay. Consider credit transferability under Section 6418.'
      };

    case 'rural-electric-coop':
      return { eligible: true, reason: 'Rural electric cooperative qualifies for Direct Pay' };

    default:
      return {
        eligible: false,
        reason: 'Entity type not recognized. Please specify organization type.'
      };
  }
}

/**
 * Calculate estimated Direct Pay value for a project
 */
export function estimateDirectPayValue(
  creditSection: EligibleCreditSection,
  projectData: {
    totalInvestment?: number;
    electricityProduced?: number; // kWh
    carbonCaptured?: number; // metric tons
    vehicleCount?: number;
    hydrogenProduced?: number; // kg
    fuelProduced?: number; // gallons
    meetsPrevailingWage?: boolean;
    meetsApprenticeship?: boolean;
    inEnergyCommunity?: boolean;
    hasDomesticContent?: boolean;
  }
): { baseValue: number; bonusValue: number; totalValue: number; breakdown: string[] } {
  let baseValue = 0;
  let bonusValue = 0;
  const breakdown: string[] = [];

  // Base credit calculations
  switch (creditSection) {
    case '48':
    case '48E':
      // Investment Tax Credit - 30% base, up to 70% with bonuses
      if (projectData.totalInvestment) {
        baseValue = projectData.totalInvestment * 0.30;
        breakdown.push(`Base ITC: 30% × $${projectData.totalInvestment.toLocaleString()} = $${baseValue.toLocaleString()}`);
      }
      break;

    case '45':
    case '45Y':
      // Production Tax Credit - $0.0275/kWh base (2024), up to $0.0275 × 5 with bonuses
      if (projectData.electricityProduced) {
        baseValue = projectData.electricityProduced * 0.0055; // Base rate without bonuses
        breakdown.push(`Base PTC: $0.0055/kWh × ${projectData.electricityProduced.toLocaleString()} kWh = $${baseValue.toLocaleString()}`);
      }
      break;

    case '45V':
      // Clean Hydrogen - up to $3/kg
      if (projectData.hydrogenProduced) {
        baseValue = projectData.hydrogenProduced * 0.60; // Base tier
        breakdown.push(`Base H2 Credit: $0.60/kg × ${projectData.hydrogenProduced.toLocaleString()} kg = $${baseValue.toLocaleString()}`);
      }
      break;

    case '45Q':
      // Carbon Capture - $85/ton for geologic storage
      if (projectData.carbonCaptured) {
        baseValue = projectData.carbonCaptured * 17; // Base without bonuses
        breakdown.push(`Base CCUS: $17/ton × ${projectData.carbonCaptured.toLocaleString()} tons = $${baseValue.toLocaleString()}`);
      }
      break;

    case '45W':
      // Commercial Clean Vehicles - up to $7,500/vehicle
      if (projectData.vehicleCount) {
        baseValue = projectData.vehicleCount * 7500;
        breakdown.push(`Clean Vehicles: $7,500 × ${projectData.vehicleCount} vehicles = $${baseValue.toLocaleString()}`);
      }
      break;

    default:
      breakdown.push(`Credit calculation for Section ${creditSection} requires additional project data`);
  }

  // Bonus calculations
  if (projectData.meetsPrevailingWage && projectData.meetsApprenticeship) {
    // 5x multiplier for meeting labor requirements (for applicable credits)
    if (['45', '45Y', '45V', '45Q'].includes(creditSection)) {
      const laborBonus = baseValue * 4; // Additional 4x on top of base = 5x total
      bonusValue += laborBonus;
      breakdown.push(`Labor requirements bonus (5x): +$${laborBonus.toLocaleString()}`);
    } else if (['48', '48E'].includes(creditSection)) {
      // ITC goes from 6% base to 30% base with labor requirements
      const laborBonus = baseValue; // Additional 24% = double the 30%
      bonusValue += laborBonus;
      breakdown.push(`Labor requirements met: Qualifies for 30% base rate`);
    }
  }

  if (projectData.inEnergyCommunity) {
    // 10% bonus for energy community
    const communityBonus = (baseValue + bonusValue) * 0.10;
    bonusValue += communityBonus;
    breakdown.push(`Energy Community bonus (+10%): +$${communityBonus.toLocaleString()}`);
  }

  if (projectData.hasDomesticContent) {
    // 10% bonus for domestic content
    const domesticBonus = (baseValue + bonusValue) * 0.10;
    bonusValue += domesticBonus;
    breakdown.push(`Domestic Content bonus (+10%): +$${domesticBonus.toLocaleString()}`);
  }

  const totalValue = baseValue + bonusValue;
  breakdown.push(`Total estimated Direct Pay: $${totalValue.toLocaleString()}`);

  return { baseValue, bonusValue, totalValue, breakdown };
}

/**
 * Get registration information for Direct Pay
 */
export function getDirectPayRegistrationInfo(): {
  portal: string;
  requirements: string[];
  timeline: string[];
  documentation: string[];
} {
  return {
    portal: 'https://www.irs.gov/credits-deductions/elective-pay-and-transferability',
    requirements: [
      'Register each applicable credit separately',
      'Complete registration for each tax year',
      'Obtain registration number before filing return',
      'File Form 3800 (General Business Credit) with return',
    ],
    timeline: [
      'Registration opens: After facility is placed in service',
      'Registration deadline: Due date of return (including extensions)',
      'For calendar year taxpayers: Typically October 15 of following year',
    ],
    documentation: [
      'Taxpayer identification (EIN)',
      'Entity type verification (tax-exempt status documentation)',
      'Facility information (location, type, capacity)',
      'Credit type and estimated amount',
      'Prevailing wage and apprenticeship certifications (if applicable)',
      'Energy community attestation (if applicable)',
      'Domestic content certification (if applicable)',
    ],
  };
}
