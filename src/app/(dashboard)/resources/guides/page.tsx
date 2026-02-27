'use client';

import { useState } from 'react';
import {
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  BookOpen,
  ArrowRight,
  Layers,
  Building2,
  Home,
  DollarSign,
  Zap,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GuideStep {
  title: string;
  description: string;
  tips?: string[];
}

interface Guide {
  id: string;
  category: 'tax-credit' | 'grant' | 'loan' | 'ira';
  icon: React.ElementType;
  iconColor: string;
  title: string;
  subtitle: string;
  stepCount: number;
  readTime: string;
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  topics: string[];
  steps: GuideStep[];
}

// ---------------------------------------------------------------------------
// Guide Data
// ---------------------------------------------------------------------------

const GUIDES: Guide[] = [
  {
    id: 'lihtc',
    category: 'tax-credit',
    icon: Building2,
    iconColor: 'bg-emerald-500',
    title: 'How to Apply for LIHTC',
    subtitle: 'Low-Income Housing Tax Credit — the cornerstone of affordable housing finance',
    stepCount: 8,
    readTime: '45 min',
    difficulty: 'Advanced',
    topics: ['Qualified Allocation Plan', 'State HFA Application', 'Equity Structuring', 'Compliance Period', 'Tiebreaker Criteria'],
    steps: [
      {
        title: 'Confirm eligibility and program type',
        description: 'Determine whether your project qualifies for 9% competitive credits or 4% non-competitive credits paired with Private Activity Bonds. Key factors: new construction vs. rehab, income restrictions (50% or 60% AMI), and minimum set-aside requirements.',
        tips: ['9% credits are capped at approximately $3.5M per project per year', '4% credits have no allocation cap but require PABs', 'At least 20% of units must be at 50% AMI or 40% at 60% AMI'],
      },
      {
        title: 'Study your state\'s Qualified Allocation Plan (QAP)',
        description: 'Each state publishes an annual QAP that governs how LIHTC credits are awarded. The QAP defines scoring criteria, set-asides, geographic priorities, and developer requirements. Read it thoroughly — it is the rulebook.',
        tips: ['QAPs typically release in Q4 for the following year', 'Scoring tiebreakers often include energy efficiency and nonprofit involvement', 'Contact the state HFA for pre-application consultations'],
      },
      {
        title: 'Identify your State Housing Finance Agency (HFA)',
        description: 'Locate the agency responsible for LIHTC allocation in your state (e.g., DHCR in NY, CTCAC in CA, TDHCA in TX). They publish application deadlines, required forms, threshold requirements, and scoring worksheets.',
        tips: ['Most HFAs hold pre-application workshops', 'Build relationships with HFA staff early', 'Review recently awarded projects to understand competition'],
      },
      {
        title: 'Prepare financial projections and sources & uses',
        description: 'Develop a detailed project pro forma including total development cost (TDC), operating pro forma (15+ years), debt service coverage, and equity pricing assumptions. Your credit amount is typically limited to 10% of TDC.',
        tips: ['Equity pricing (¢ per credit $) ranges 0.85–1.05 depending on market', 'Include developer fee (typically 10–15% of TDC, capped by state)', 'Model hard debt based on projected NOI and 1.15–1.25x DSCR'],
      },
      {
        title: 'Assemble the application package',
        description: 'Gather all required components: site control documentation, architectural plans or concept, environmental phase I, market study, operating budget, sources and uses, entity formation documents, and certifications.',
        tips: ['Market studies must be from HFA-approved analysts', 'Site control is typically required by application deadline', 'Letters of support from local government add scoring points'],
      },
      {
        title: 'Submit the application and await scoring',
        description: 'Submit your completed application package by the HFA deadline — late submissions are not accepted. Applications are scored against the QAP and may require public hearings or local government approval letters.',
        tips: ['Submit several days early to resolve technical issues', 'Track your scoring sheet against other applicants in your set-aside', 'Some HFAs allow cures for minor deficiencies'],
      },
      {
        title: 'Receive reservation and negotiate with tax equity investors',
        description: 'If awarded, you receive a LIHTC reservation letter. Use this to engage tax equity investors (banks, funds) who purchase the credits. Negotiate pricing, return hurdles, and developer fee payment schedules.',
        tips: ['Engage investors early — pre-application if possible', 'Request competitive bids from 3+ investors', 'Typical yield-on-cost target for investors: 5.5–7%'],
      },
      {
        title: 'Close construction financing and begin compliance period',
        description: 'Close your construction loan and equity partnership. Upon completion, IRS Form 8609 is issued (placed-in-service). The 15-year compliance period begins — maintain affordability restrictions or face credit recapture.',
        tips: ['8609 requires state HFA certification of completion', '30-year extended use agreements are common', 'Annual compliance reporting to IRS on Form 8823'],
      },
    ],
  },
  {
    id: 'ira-direct-pay',
    category: 'ira',
    icon: Zap,
    iconColor: 'bg-amber-500',
    title: 'IRA Direct Pay Guide for Nonprofits',
    subtitle: 'Section 6417 — how tax-exempt entities claim clean energy credits as cash',
    stepCount: 6,
    readTime: '30 min',
    difficulty: 'Intermediate',
    topics: ['Section 6417 Election', 'Pre-filing Registration', 'Eligible Credits', 'Form 3800', 'IRS Registration Portal'],
    steps: [
      {
        title: 'Confirm entity eligibility',
        description: 'Direct Pay is available to tax-exempt entities including 501(c)(3)s, state and local governments, Indian tribal governments, Alaska Native Corporations, and rural electric cooperatives.',
        tips: ['For-profit entities may only use Direct Pay for clean hydrogen, carbon capture, and advanced manufacturing credits (Sections 45V, 45Q, 45X)', 'Partnerships and S-corps are generally not eligible'],
      },
      {
        title: 'Identify eligible clean energy credits',
        description: 'Key credits available under Direct Pay: Section 48 ITC (solar, storage, geothermal), Section 45 PTC (wind, solar, hydro), Section 48C (advanced energy manufacturing), Section 45W (commercial EVs), Section 48E (technology-neutral ITC).',
        tips: ['Section 48 ITC is the most commonly claimed by nonprofits for rooftop/community solar', 'Prevailing wage and apprenticeship requirements apply for the full credit rate'],
      },
      {
        title: 'Complete pre-filing registration with the IRS',
        description: 'Before filing your return, register each facility or project with the IRS via the Energy Credits Online portal (energycredits.irs.gov). You will receive a registration number required for your tax return.',
        tips: ['Registration typically takes 3–4 weeks', 'Register after construction is complete (placed in service)', 'Each property/facility requires a separate registration'],
      },
      {
        title: 'File your annual tax return with the Direct Pay election',
        description: 'Make the annual election on your Form 990-T (or applicable return) for each eligible credit. Complete Form 3800 (General Business Credit) and include registration numbers. The election is irrevocable for that tax year.',
        tips: ['File a paper return if required by IRS instructions', '90-day review period after filing before payment issues', 'Penalties apply for excess claims (20% excise tax + interest)'],
      },
      {
        title: 'Receive cash payment from Treasury',
        description: 'The IRS treats the Direct Pay amount as an overpayment and issues a refund check or ACH payment. Payment timing: typically 45–60 days after return processing.',
        tips: ['Ensure your banking information is updated with the IRS', 'Payments may be applied to outstanding federal liabilities first', 'Keep detailed records — IRS may audit credit calculations'],
      },
      {
        title: 'Maintain compliance and records',
        description: 'Retain documentation supporting the credit calculation: energy study, placed-in-service date, prevailing wage certifications, apprenticeship records, and domestic content documentation (if claiming bonus).',
        tips: ['Prevailing wage compliance must be maintained for full credit period (ITC: project life; PTC: 10 years)', 'Keep certified payrolls for at least 3 years after filing', 'Annual compliance is required for multi-year PTC claims'],
      },
    ],
  },
  {
    id: 'sec-48-itc',
    category: 'ira',
    icon: Zap,
    iconColor: 'bg-teal-500',
    title: 'Section 48 ITC Application',
    subtitle: 'Investment Tax Credit — claiming 30–50% credits on clean energy installations',
    stepCount: 7,
    readTime: '40 min',
    difficulty: 'Advanced',
    topics: ['Eligible Basis', 'Bonus Adders', 'Prevailing Wage', 'Domestic Content', 'Energy Community'],
    steps: [
      { title: 'Determine eligible property and base credit rate', description: 'Section 48 ITC applies to solar PV, battery storage (standalone or paired), geothermal, fuel cells, and other clean energy property. Base rate: 30% for projects beginning construction in 2025.', tips: [] },
      { title: 'Evaluate bonus adder eligibility', description: 'Additional credit adders: +10% Energy Community bonus (located in coal/oil/gas community), +10% Domestic Content (meets domestic sourcing requirements), +10-20% Low-Income Community bonus (LIC or Indian land).', tips: [] },
      { title: 'Meet Prevailing Wage and Apprenticeship (PWA) requirements', description: 'To claim the full 30% base rate (vs. 6% base), projects over 1 MW must pay prevailing wages to all laborers and mechanics, and meet apprenticeship hour requirements (12.5% in 2024, 15% in 2025+).', tips: [] },
      { title: 'Calculate eligible basis and credit amount', description: 'Eligible basis = total cost of energy property (excluding land). Credit = eligible basis × credit rate. For direct pay or transfer, pre-filing registration with IRS is required.', tips: [] },
      { title: 'Complete prevailing wage certification and documentation', description: 'Maintain certified payrolls for all construction workers. Use Davis-Bacon wage determinations for your location and type of work. Document apprenticeship ratios by trade.', tips: [] },
      { title: 'Register with IRS Energy Credits Online portal', description: 'Pre-file registration required if using Direct Pay (Section 6417) or Credit Transfer (Section 6418). Register each facility separately and obtain registration number before filing your return.', tips: [] },
      { title: 'File Form 3468 with your federal tax return', description: 'Complete IRS Form 3468 (Investment Credit) and attach to your federal return. Include Form 3800 if transferring or claiming via Direct Pay. Maintain all supporting documentation for 3+ years.', tips: [] },
    ],
  },
  {
    id: 'hud-108',
    category: 'loan',
    icon: DollarSign,
    iconColor: 'bg-blue-500',
    title: 'HUD Section 108 Loan Guide',
    subtitle: 'Federal loan guarantees — leveraging CDBG for large-scale community development',
    stepCount: 10,
    readTime: '60 min',
    difficulty: 'Advanced',
    topics: ['CDBG Entitlement', 'Eligible Activities', 'Underwriting Standards', 'HUD Review', 'Repayment Structure'],
    steps: [
      { title: 'Confirm CDBG entitlement status', description: 'Section 108 is available only to CDBG entitlement communities (cities over 50,000, urban counties) or non-entitlement communities applying through their state. Confirm your community\'s eligibility before proceeding.', tips: [] },
      { title: 'Identify an eligible Section 108 activity', description: 'Eligible uses: economic development (job creation), housing rehabilitation, acquisition for redevelopment, large-scale infrastructure, public facilities. Activity must meet a National Objective (LMI benefit, slum/blight, urgent need).', tips: [] },
      { title: 'Review underwriting and credit standards', description: 'HUD evaluates repayment ability, collateral, financial viability of the project, and community creditworthiness. A feasibility study and market analysis are typically required.', tips: [] },
      { title: 'Prepare the application to HUD', description: 'Submit Section 108 application to your HUD Field Office including: project description, development budget, financing plan, evidence of local commitment, and National Objective certification.', tips: [] },
      { title: 'HUD Field Office review and underwriting', description: 'Field Office reviews completeness, forwards to HUD Headquarters for underwriting. Typical review period: 90–180 days depending on project complexity and HUD workload.', tips: [] },
      { title: 'Negotiate loan terms with HUD', description: 'Upon approval, negotiate repayment schedule (up to 20 years), interest rate (tied to Treasury rates), and collateral requirements. CDBG entitlement grant serves as ultimate security.', tips: [] },
      { title: 'Environmental review and citizen participation', description: 'Complete HUD environmental review (Part 58) for the project. Publish notices and conduct public comment period as required by CDBG regulations.', tips: [] },
      { title: 'Close the Section 108 loan', description: 'Execute loan agreement with HUD, establish restricted accounts, and draw funds as needed for project expenditures.', tips: [] },
      { title: 'Implement and document eligible expenditures', description: 'Track all Section 108-funded expenditures. Maintain records of LMI benefit documentation, environmental compliance, and Davis-Bacon compliance if applicable.', tips: [] },
      { title: 'Annual reporting to HUD (CAPER)', description: 'Report Section 108 activities annually in the Consolidated Annual Performance and Evaluation Report (CAPER) submitted to HUD. Document LMI jobs created or housing units produced.', tips: [] },
    ],
  },
  {
    id: '179d',
    category: 'tax-credit',
    icon: Building2,
    iconColor: 'bg-slate-600',
    title: '179D Commercial Deduction',
    subtitle: 'Up to $5/sq ft deduction for energy-efficient commercial and multifamily buildings',
    stepCount: 5,
    readTime: '25 min',
    difficulty: 'Intermediate',
    topics: ['Eligible Buildings', 'Qualified Certifier', 'ASHRAE Standards', 'Prevailing Wage', 'Tax Deduction Claim'],
    steps: [
      { title: 'Determine building eligibility', description: 'Eligible buildings: commercial buildings and multifamily residential buildings 4+ stories above grade. Both new construction and substantially renovated existing buildings qualify.', tips: [] },
      { title: 'Establish baseline energy reduction', description: 'Minimum 25% energy reduction below ASHRAE 90.1-2007 standard required. For maximum deduction ($5/sq ft), building must meet prevailing wage requirements.', tips: [] },
      { title: 'Hire a qualified certifier for energy study', description: 'A qualified Section 179D certifier (licensed engineer or contractor) must conduct an energy analysis using IRS-approved software and certify the energy savings.', tips: [] },
      { title: 'Claim the deduction on your federal return', description: 'Deduct eligible amounts on Form 4562 (Depreciation and Amortization). Maximum $1/sq ft for 50%+ energy reduction; up to $5/sq ft with prevailing wage compliance.', tips: [] },
      { title: 'Allocation for government and nonprofit buildings', description: 'For tax-exempt building owners (governments, nonprofits), Section 179D deductions can be allocated to the designer/architect of the building. This is a valuable benefit for design teams.', tips: [] },
    ],
  },
  {
    id: 'nmtc',
    category: 'tax-credit',
    icon: Users,
    iconColor: 'bg-violet-500',
    title: 'New Markets Tax Credit',
    subtitle: '39% credit over 7 years for investments in low-income community development entities',
    stepCount: 9,
    readTime: '50 min',
    difficulty: 'Advanced',
    topics: ['CDFI Fund Application', 'CDE Certification', 'QLICI Loans', '7-Year Credit Period', 'Compliance'],
    steps: [
      { title: 'Confirm low-income community designation', description: 'Project must be located in a qualifying census tract (20%+ poverty rate or median family income ≤80% AMI). Use CDFI Fund NMTC mapping tool to verify location eligibility.', tips: [] },
      { title: 'Identify a Community Development Entity (CDE)', description: 'NMTCs flow through certified CDEs that receive NMTC allocation from the CDFI Fund. CDEs apply annually for allocation. Connect with a CDE that aligns with your project type and geography.', tips: [] },
      { title: 'Structure the NMTC transaction', description: 'Classic NMTC structure: investor makes a Qualified Equity Investment (QEI) into a sub-CDE. Sub-CDE makes a Qualified Low-Income Community Investment (QLICI) loan to the project at below-market terms.', tips: [] },
      { title: 'Secure investor and negotiate terms', description: 'Tax equity investor purchases NMTCs at 85–95¢ per credit dollar. Net benefit to the project: typically 15–25% of project costs (after fees). Engage NMTC advisors to structure and market the transaction.', tips: [] },
      { title: 'Complete CDFI Fund compliance for the CDE', description: 'CDE must ensure the investment meets NMTC regulations — substantially all assets in QALICBs, project meets community impact metrics, reporting requirements met annually.', tips: [] },
      { title: 'Close the transaction', description: 'Multi-party closing involving investor, CDE, sub-CDE, and borrower. Legal fees are substantial ($200–500K typical). Budget for transaction costs up front.', tips: [] },
      { title: 'Claim credits annually (investor)', description: 'NMTC investor claims 5% in years 1–3 and 6% in years 4–7 on Form 8874. Credits offset federal income tax liability dollar-for-dollar.', tips: [] },
      { title: 'Maintain compliance during 7-year credit period', description: 'Investment must remain in the QALICB for 7 years. Redemption or significant change in use during this period triggers recapture. Annual reporting to CDFI Fund required.', tips: [] },
      { title: 'Unwind the structure at year 7', description: 'At year 7, the NMTC structure is typically unwound — investor exits at nominal value, CDE exits the loan position. Project retains the economic benefit of the below-market financing.', tips: [] },
    ],
  },
];

const CATEGORY_TABS = [
  { value: 'all', label: 'All Guides' },
  { value: 'tax-credit', label: 'Tax Credits' },
  { value: 'grant', label: 'Grants' },
  { value: 'loan', label: 'Loans' },
  { value: 'ira', label: 'IRA Programs' },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ---------------------------------------------------------------------------
// Step Panel Component
// ---------------------------------------------------------------------------

function StepPanel({ steps }: { steps: GuideStep[] }) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="space-y-3 mt-4">
      {steps.map((step, idx) => {
        const done = completedSteps.has(idx);
        return (
          <div
            key={idx}
            className={`rounded-lg border p-4 transition-all ${done ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}
          >
            <button
              className="flex items-start gap-3 w-full text-left"
              onClick={() => toggleStep(idx)}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">Step {idx + 1}</span>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    {step.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {step.description}
                </p>
                {step.tips && step.tips.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {step.tips.map((tip, ti) => (
                      <li key={ti} className="flex items-start gap-1.5 text-xs text-teal-700 dark:text-teal-400">
                        <ArrowRight className="h-3 w-3 mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </button>
          </div>
        );
      })}
      <div className="text-xs text-slate-400 text-right font-mono">
        {completedSteps.size}/{steps.length} steps completed
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Guide Card Component
// ---------------------------------------------------------------------------

function GuideCard({ guide }: { guide: Guide }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = guide.icon;

  return (
    <Card className="card-v41 overflow-hidden">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${guide.iconColor} shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold font-sora text-slate-900 dark:text-white text-sm leading-snug">
              {guide.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              {guide.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-mono">{guide.stepCount} steps</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{guide.readTime}</span>
          </div>
          <Badge className={`text-xs px-2 py-0 ${DIFFICULTY_COLORS[guide.difficulty]}`}>
            {guide.difficulty}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1">
          {guide.topics.map((topic) => (
            <span key={topic} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded px-1.5 py-0.5">
              {topic}
            </span>
          ))}
        </div>

        <Button
          size="sm"
          className={`w-full text-xs transition-all ${expanded ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600' : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white border-0'}`}
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5 mr-1" />
              Collapse Guide
            </>
          ) : (
            <>
              Start Guide
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </>
          )}
        </Button>

        {expanded && <StepPanel steps={guide.steps} />}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ApplicationGuidesPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredGuides = GUIDES.filter(
    (g) => activeCategory === 'all' || g.category === activeCategory,
  );

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora tracking-tight text-slate-900 dark:text-white">
              Application Guides
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Step-by-step guides to successfully apply for incentive programs
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Guides Available', value: `${GUIDES.length}`, color: 'text-teal-600 dark:text-teal-400' },
          { label: 'Avg Read Time', value: '42 min', color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Programs Covered', value: '$1.4T+', color: 'text-violet-600 dark:text-violet-400' },
        ].map((stat) => (
          <Card key={stat.label} className="card-v41">
            <CardContent className="p-4 text-center">
              <p className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CATEGORY TABS + GRID */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex-wrap h-auto gap-1 bg-slate-100 dark:bg-slate-800 p-1 mb-4">
          {CATEGORY_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-3 py-1.5">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORY_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            {filteredGuides.length === 0 ? (
              <Card className="card-v41">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    No guides available in this category yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGuides.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* CTA */}
      <Card className="card-v41">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-sora font-semibold text-slate-900 dark:text-white text-sm">
                Ready to apply?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Run an eligibility analysis on your project to find the best programs.
              </p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white border-0 shrink-0">
            Analyze My Project
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
