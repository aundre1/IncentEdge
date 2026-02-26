// V44: Complete incentive program data matching the production HTML prototype
export interface Incentive {
  id: string;
  program: string;
  desc: string;
  amount: number;
  prob: number;
  type: 'federal' | 'state' | 'local' | 'utility';
  status: 'captured' | 'pending' | 'at-risk';
  deadline: string;
  agency: string;
  fullName?: string;
}

export interface ProjectInfo {
  name: string;
  address: string;
  units: string;
  type: string;
  tier: string;
  tdc: number;
}

export const projectData: Record<string, ProjectInfo> = {
  'mt-vernon': { name: 'Mount Vernon Mixed-Use', address: '225 South 4th Ave, Mount Vernon, NY 10550', units: '747 units', type: 'Mixed-Use', tier: 'Tier 3', tdc: 588.8 },
  'yonkers': { name: 'Yonkers Affordable Housing', address: '87 Prospect St, Yonkers, NY 10701', units: '312 units', type: 'Affordable Housing', tier: 'Tier 2', tdc: 323.8 },
  'new-rochelle': { name: 'New Rochelle Transit Hub', address: '1 Station Plaza, New Rochelle, NY 10801', units: '428 units', type: 'Transit-Oriented', tier: 'Tier 2', tdc: 217.9 },
};

export const allIncentives: Record<string, Incentive[]> = {
  'mt-vernon': [
    { id: 's48-itc', program: 'Section 48 ITC Solar/Storage', desc: 'Investment Tax Credit for solar, storage and controls', amount: 27.1, prob: 90, type: 'federal', status: 'pending', deadline: '90 days', agency: 'IRS', fullName: 'Section 48 Investment Tax Credit (Solar & Storage)' },
    { id: 'stat-adders', program: 'IRA Statutory Adders', desc: 'Low income, domestic content, energy community bonuses', amount: 13.0, prob: 68, type: 'federal', status: 'pending', deadline: '90 days', agency: 'IRS', fullName: 'IRA Statutory Bonus Adders' },
    { id: 'lihtc-4', program: '4% LIHTC', desc: 'Low-Income Housing Tax Credit via tax-exempt bonds', amount: 17.7, prob: 95, type: 'federal', status: 'captured', deadline: '-', agency: 'IRS / State HCR', fullName: 'Low-Income Housing Tax Credit (4%)' },
    { id: 'nmtc', program: 'New Markets Tax Credit', desc: '39% on $60M qualified investment', amount: 23.4, prob: 75, type: 'federal', status: 'pending', deadline: '120 days', agency: 'CDFI Fund', fullName: 'New Markets Tax Credit Program' },
    { id: 's45l', program: 'Section 45L Credit', desc: '$5k/unit for 747 energy efficient dwelling units', amount: 3.7, prob: 85, type: 'federal', status: 'pending', deadline: '60 days', agency: 'IRS', fullName: 'New Energy Efficient Home Credit' },
    { id: '179d', program: '179D Commercial Deduction', desc: 'Up to $5/SF on eligible commercial scope', amount: 1.1, prob: 95, type: 'federal', status: 'captured', deadline: '-', agency: 'IRS', fullName: 'Energy Efficient Commercial Building Deduction' },
    { id: 'rd-credit', program: 'R&D Tax Credits', desc: 'Controls software and optimization stack', amount: 9.5, prob: 80, type: 'federal', status: 'pending', deadline: '180 days', agency: 'IRS', fullName: 'Research & Development Tax Credit (Section 41)' },
    { id: 'alt-fuel', program: 'Alt Fuel Vehicle Credit (30C)', desc: 'EV charging infrastructure credit', amount: 0.5, prob: 90, type: 'federal', status: 'pending', deadline: '45 days', agency: 'IRS', fullName: 'Alternative Fuel Refueling Credit' },
    { id: 'epa-ggrf', program: 'EPA GGRF Capital', desc: 'Greenhouse Gas Reduction Fund via partners', amount: 8.0, prob: 28, type: 'federal', status: 'at-risk', deadline: '30 days', agency: 'EPA', fullName: 'Greenhouse Gas Reduction Fund' },
    { id: 'doe-grants', program: 'DOE/NREL/EPA Grants', desc: 'Innovation stack and demonstration projects', amount: 4.2, prob: 70, type: 'federal', status: 'pending', deadline: '180 days', agency: 'DOE/NREL/EPA', fullName: 'Federal Innovation Grants' },
    { id: 'arpa-e', program: 'ARPA-E Breakthrough', desc: 'High innovation threshold demonstration', amount: 5.0, prob: 35, type: 'federal', status: 'at-risk', deadline: '240 days', agency: 'ARPA-E', fullName: 'ARPA-E Breakthrough Grant' },
    { id: 'doe-grid', program: 'DOE Grid Modernization', desc: 'VPP integration and smart grid readiness', amount: 7.0, prob: 45, type: 'federal', status: 'at-risk', deadline: '300 days', agency: 'DOE', fullName: 'DOE Grid Modernization Grant' },
    { id: 'nyserda-nc', program: 'NYSERDA New Construction', desc: 'Performance pathway incentives', amount: 4.8, prob: 88, type: 'state', status: 'pending', deadline: '120 days', agency: 'NYSERDA', fullName: 'NYSERDA New Construction Program' },
    { id: 'ny-sun', program: 'NY-Sun Solar Incentive', desc: 'Megawatt block incentive program', amount: 2.0, prob: 95, type: 'state', status: 'captured', deadline: '-', agency: 'NYSERDA', fullName: 'NY-Sun Block Incentive' },
    { id: 'storage-inc', program: 'NYSERDA Storage Incentive', desc: 'Behind-the-meter energy storage', amount: 1.8, prob: 90, type: 'state', status: 'pending', deadline: '60 days', agency: 'NYSERDA', fullName: 'Energy Storage Incentive' },
    { id: 'clean-heat', program: 'NYS Clean Heat', desc: 'Heat pump system incentives', amount: 1.5, prob: 92, type: 'state', status: 'pending', deadline: '45 days', agency: 'NYSERDA', fullName: 'Clean Heat Program' },
    { id: 'rtem', program: 'NYSERDA RTEM', desc: 'Real-Time Energy Management program', amount: 0.8, prob: 85, type: 'state', status: 'pending', deadline: '90 days', agency: 'NYSERDA', fullName: 'RTEM Program' },
    { id: 'flextech', program: 'NYSERDA FlexTech', desc: 'Technical assistance consulting', amount: 0.3, prob: 95, type: 'state', status: 'captured', deadline: '-', agency: 'NYSERDA', fullName: 'FlexTech Consulting Program' },
    { id: 'hcr-gap', program: 'HCR Gap Financing', desc: 'Supplemental gap funding for affordable units', amount: 8.0, prob: 60, type: 'state', status: 'pending', deadline: '120 days', agency: 'NY HCR', fullName: 'HCR Gap Financing' },
    { id: 'nypa', program: 'NYPA Renewable Support', desc: 'Large onsite systems alignment', amount: 4.0, prob: 50, type: 'state', status: 'at-risk', deadline: '90 days', agency: 'NYPA', fullName: 'NYPA Renewable Energy Support' },
    { id: 'bcc', program: 'Buildings of Excellence', desc: 'Net zero design and delivery grant', amount: 3.0, prob: 60, type: 'state', status: 'pending', deadline: '150 days', agency: 'NYSERDA', fullName: 'Buildings of Excellence Competition' },
    { id: 'rggi', program: 'RGGI Proceeds Programs', desc: 'State auction funded clean energy grants', amount: 3.0, prob: 45, type: 'state', status: 'at-risk', deadline: '180 days', agency: 'NYSERDA', fullName: 'RGGI Programs' },
    { id: 'ida-pilot', program: 'IDA PILOT', desc: '20-year graduated property tax abatement', amount: 18.0, prob: 92, type: 'local', status: 'pending', deadline: '60 days', agency: 'Westchester IDA', fullName: 'Industrial Development Agency PILOT' },
    { id: 'ida-sales', program: 'IDA Sales Tax Exemption', desc: 'Construction materials sales tax exemption', amount: 12.0, prob: 92, type: 'local', status: 'pending', deadline: '60 days', agency: 'Westchester IDA', fullName: 'IDA Sales Tax Exemption' },
    { id: 'ida-mortgage', program: 'IDA Mortgage Tax Exemption', desc: 'Mortgage recording tax exemption', amount: 4.8, prob: 90, type: 'local', status: 'pending', deadline: '60 days', agency: 'Westchester IDA', fullName: 'IDA Mortgage Recording Tax Exemption' },
    { id: 'coned-rebate', program: 'Con Edison EE Rebates', desc: 'Commercial energy efficiency equipment rebates', amount: 2.5, prob: 85, type: 'utility', status: 'pending', deadline: '90 days', agency: 'Con Edison', fullName: 'Con Edison Energy Efficiency Rebates' },
    { id: 'coned-dr', program: 'Con Edison Demand Response', desc: 'BQDM demand management participation', amount: 3.2, prob: 70, type: 'utility', status: 'pending', deadline: '120 days', agency: 'Con Edison', fullName: 'Con Edison BQDM / DR Programs' },
    { id: 'coned-ev', program: 'Con Edison EV Make-Ready', desc: 'EV charging infrastructure incentive', amount: 1.5, prob: 75, type: 'utility', status: 'pending', deadline: '30 days', agency: 'Con Edison', fullName: 'EV Make-Ready Program' },
    { id: 'coned-adv', program: 'Con Edison Advanced Programs', desc: 'Additional demand response and storage incentives', amount: 6.0, prob: 60, type: 'utility', status: 'pending', deadline: '120 days', agency: 'Con Edison', fullName: 'Advanced Clean Energy Programs' },
    { id: 'mv-grant', program: 'Mount Vernon City Grant', desc: 'Direct grant aligned with station area plan', amount: 2.0, prob: 95, type: 'local', status: 'captured', deadline: '-', agency: 'City of Mount Vernon', fullName: 'Mount Vernon Development Grant' },
    { id: 'mid-hudson', program: 'Mid Hudson Momentum Fund', desc: 'Regional catalytic development grant', amount: 10.0, prob: 75, type: 'local', status: 'pending', deadline: '90 days', agency: 'Mid-Hudson REDC', fullName: 'Mid-Hudson Momentum Fund' },
    { id: 'hif', program: 'Housing Implementation Fund', desc: 'Westchester County housing program', amount: 3.0, prob: 85, type: 'local', status: 'pending', deadline: '60 days', agency: 'Westchester County', fullName: 'Westchester Housing Implementation Fund' },
    { id: 'westchester-ee', program: 'Westchester EE Programs', desc: 'County energy efficiency incentives', amount: 1.5, prob: 80, type: 'local', status: 'pending', deadline: '90 days', agency: 'Westchester County', fullName: 'Westchester Energy Efficiency Programs' },
    { id: 'lsc-grant', program: 'Living Cities Grant', desc: 'Integration initiative funding', amount: 2.5, prob: 50, type: 'local', status: 'pending', deadline: '180 days', agency: 'Living Cities', fullName: 'Living Cities Integration Initiative' },
    { id: 'enterprise', program: 'Enterprise Green Communities', desc: 'Enterprise Community Partners grant', amount: 2.0, prob: 55, type: 'local', status: 'pending', deadline: '150 days', agency: 'Enterprise Community', fullName: 'Enterprise Green Communities' },
    { id: 'kresge', program: 'Kresge Foundation Grant', desc: 'Urban resilience grant', amount: 1.5, prob: 45, type: 'local', status: 'at-risk', deadline: '200 days', agency: 'Kresge Foundation', fullName: 'Urban Resilience Grant' },
    { id: 'vcc', program: 'Voluntary Carbon Credits', desc: 'Premium offtake for verified net zero asset', amount: 8.0, prob: 60, type: 'local', status: 'pending', deadline: '180 days', agency: 'Various Registries', fullName: 'Voluntary Carbon Market Credits' },
  ],
  'yonkers': [
    { id: 'lihtc-9', program: '9% LIHTC Allocation', desc: 'Competitive Low-Income Housing Tax Credit', amount: 28.5, prob: 75, type: 'federal', status: 'pending', deadline: '180 days', agency: 'IRS / NY HCR', fullName: '9% LIHTC Allocation' },
    { id: 's8-pbv', program: 'Section 8 Project-Based', desc: 'HUD Project-Based Voucher allocation', amount: 8.2, prob: 80, type: 'federal', status: 'pending', deadline: '120 days', agency: 'HUD', fullName: 'Section 8 Project-Based Vouchers' },
    { id: 's45l-y', program: 'Section 45L Credit', desc: 'Energy efficient dwelling units', amount: 1.6, prob: 85, type: 'federal', status: 'pending', deadline: '60 days', agency: 'IRS', fullName: 'Section 45L Credit' },
    { id: '179d-y', program: '179D Deduction', desc: 'Commercial building energy deduction', amount: 0.5, prob: 90, type: 'federal', status: 'captured', deadline: '-', agency: 'IRS', fullName: '179D Deduction' },
    { id: 'cdbg', program: 'CDBG-DR Funds', desc: 'Community development disaster recovery', amount: 4.5, prob: 65, type: 'federal', status: 'pending', deadline: '90 days', agency: 'HUD', fullName: 'CDBG-DR Funds' },
    { id: 'home', program: 'HOME Investment', desc: 'HOME Investment Partnerships Program', amount: 3.2, prob: 70, type: 'federal', status: 'pending', deadline: '120 days', agency: 'HUD', fullName: 'HOME Investment' },
    { id: 's48-y', program: 'Section 48 ITC', desc: 'Solar/storage investment tax credit', amount: 6.0, prob: 85, type: 'federal', status: 'pending', deadline: '90 days', agency: 'IRS', fullName: 'Section 48 ITC' },
    { id: 'hcr-htf', program: 'HCR Housing Trust Fund', desc: 'NY Housing Trust Fund capital subsidy', amount: 12.0, prob: 80, type: 'state', status: 'pending', deadline: '90 days', agency: 'NY HCR', fullName: 'HCR Housing Trust Fund' },
    { id: 'slihc', program: 'SLIHC Credits', desc: 'State Low Income Housing Credits', amount: 8.5, prob: 75, type: 'state', status: 'pending', deadline: '120 days', agency: 'NY HCR', fullName: 'SLIHC Credits' },
    { id: 'nyserda-y', program: 'NYSERDA Multifamily', desc: 'New Construction program', amount: 3.8, prob: 85, type: 'state', status: 'pending', deadline: '150 days', agency: 'NYSERDA', fullName: 'NYSERDA Multifamily' },
    { id: 'dasny', program: 'DASNY Bond Financing', desc: 'Tax-exempt bond financing', amount: 18.0, prob: 85, type: 'state', status: 'pending', deadline: '180 days', agency: 'DASNY', fullName: 'DASNY Bond Financing' },
    { id: 'ida-y', program: 'Yonkers IDA PILOT', desc: 'Property tax abatement', amount: 8.5, prob: 90, type: 'local', status: 'pending', deadline: '90 days', agency: 'Yonkers IDA', fullName: 'Yonkers IDA PILOT' },
  ],
  'new-rochelle': [
    { id: 'fta-tod', program: 'FTA TOD Planning', desc: 'Federal Transit Administration TOD grant', amount: 5.5, prob: 70, type: 'federal', status: 'pending', deadline: '180 days', agency: 'FTA', fullName: 'FTA TOD Planning' },
    { id: 'lihtc-4-nr', program: '4% LIHTC', desc: 'As-of-right housing tax credit', amount: 8.2, prob: 95, type: 'federal', status: 'pending', deadline: '90 days', agency: 'IRS / NY HCR', fullName: '4% LIHTC' },
    { id: 's48-nr', program: 'Section 48 ITC', desc: 'Solar/storage investment tax credit', amount: 8.5, prob: 88, type: 'federal', status: 'pending', deadline: '90 days', agency: 'IRS', fullName: 'Section 48 ITC' },
    { id: 's45l-nr', program: 'Section 45L Credit', desc: 'Energy efficient dwelling units', amount: 2.1, prob: 85, type: 'federal', status: 'pending', deadline: '60 days', agency: 'IRS', fullName: 'Section 45L Credit' },
    { id: '179d-nr', program: '179D Deduction', desc: 'Commercial building energy deduction', amount: 0.8, prob: 92, type: 'federal', status: 'captured', deadline: '-', agency: 'IRS', fullName: '179D Deduction' },
    { id: 'esd-tod', program: 'ESD TOD Initiative', desc: 'Empire State transit-oriented development', amount: 8.0, prob: 75, type: 'state', status: 'pending', deadline: '120 days', agency: 'ESD', fullName: 'ESD TOD Initiative' },
    { id: 'nyserda-nr', program: 'NYSERDA New Construction', desc: 'Whole building performance incentives', amount: 3.2, prob: 85, type: 'state', status: 'pending', deadline: '150 days', agency: 'NYSERDA', fullName: 'NYSERDA New Construction' },
    { id: 'hcr-nr', program: 'HCR Gap Financing', desc: 'Housing capital subsidy', amount: 5.5, prob: 70, type: 'state', status: 'pending', deadline: '120 days', agency: 'NY HCR', fullName: 'HCR Gap Financing' },
    { id: 'mta-tod', program: 'MTA TOD Density Bonus', desc: 'Transit-adjacent density bonus', amount: 4.0, prob: 80, type: 'state', status: 'pending', deadline: '90 days', agency: 'MTA', fullName: 'MTA TOD Density Bonus' },
    { id: 'excelsior', program: 'Excelsior Jobs Program', desc: 'Job creation tax credits', amount: 3.5, prob: 75, type: 'state', status: 'pending', deadline: '180 days', agency: 'ESD', fullName: 'Excelsior Jobs Program' },
    { id: 'nr-ida', program: 'New Rochelle IDA PILOT', desc: 'Property tax abatement', amount: 6.2, prob: 88, type: 'local', status: 'pending', deadline: '90 days', agency: 'New Rochelle IDA', fullName: 'New Rochelle IDA PILOT' },
  ],
};

export const tickerItems = [
  { label: 'ITC 30%', value: 'Active', variant: 'up' as const, badge: 'IRA', badgeType: 'new' as const },
  { label: 'NYSERDA', value: '$24.8M remaining', variant: 'neutral' as const },
  { label: 'LL97', value: '127 days', variant: 'neutral' as const, badge: 'URGENT', badgeType: 'urgent' as const },
  { label: '45L Credits', value: '$5,000/unit', variant: 'up' as const },
  { label: 'ConEd Rebate', value: 'Open', variant: 'up' as const },
  { label: 'C-PACE', value: '$180M available', variant: 'neutral' as const },
  { label: 'EPA Brownfield', value: '+$1.5B allocated', variant: 'up' as const, badge: 'NEW', badgeType: 'new' as const },
  { label: 'DOE LPO', value: '$400B capacity', variant: 'neutral' as const },
  { label: 'NMTC', value: 'Round Open', variant: 'up' as const, badge: 'NEW', badgeType: 'new' as const },
  { label: 'LIHTC 4%', value: 'As-of-Right', variant: 'up' as const },
];

// Utility functions for working with incentive data
export function getActiveIncentives(project: string): (Incentive & { project: string; projectName: string })[] {
  if (project === 'portfolio') {
    const all: (Incentive & { project: string; projectName: string })[] = [];
    Object.keys(allIncentives).forEach(k => {
      allIncentives[k].forEach(i => all.push({ ...i, project: k, projectName: projectData[k]?.name || k }));
    });
    return all;
  }
  return (allIncentives[project] || []).map(i => ({
    ...i,
    project,
    projectName: projectData[project]?.name || project,
  }));
}

export function getPortfolioStats(incentives: Incentive[]) {
  const total = incentives.reduce((s, i) => s + i.amount, 0);
  const expected = incentives.reduce((s, i) => s + i.amount * (i.prob / 100), 0);
  const captured = incentives.filter(i => i.status === 'captured');
  const pending = incentives.filter(i => i.status === 'pending');
  const atRisk = incentives.filter(i => i.status === 'at-risk');
  const capturedVal = captured.reduce((s, i) => s + i.amount, 0);
  const pendingVal = pending.reduce((s, i) => s + i.amount, 0);
  const atRiskVal = atRisk.reduce((s, i) => s + i.amount, 0);
  const captureRate = total > 0 ? Math.round((capturedVal / total) * 100) : 0;
  const avgProb = incentives.length ? Math.round(incentives.reduce((s, i) => s + i.prob, 0) / incentives.length) : 0;

  return {
    total,
    expected,
    captured: capturedVal,
    pending: pendingVal,
    atRisk: atRiskVal,
    captureRate,
    programCount: incentives.length,
    capturedCount: captured.length,
    pendingCount: pending.length,
    atRiskCount: atRisk.length,
    avgProb,
    pipeline: total - capturedVal,
  };
}
