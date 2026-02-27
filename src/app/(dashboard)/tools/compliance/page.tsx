'use client';

import { useState, useMemo } from 'react';
import {
  FileCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Shield,
  Leaf,
  Home,
  Hammer,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Answer = 'yes' | 'no' | 'unsure' | null;

interface CheckItem {
  id: string;
  question: string;
  guidance: string;
}

interface Domain {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  items: CheckItem[];
}

// ---------------------------------------------------------------------------
// Domain definitions
// ---------------------------------------------------------------------------

const DOMAINS: Domain[] = [
  {
    id: 'irs',
    title: 'IRS Requirements',
    description: 'Federal tax credit eligibility, direct pay, and wage compliance',
    icon: Shield,
    items: [
      {
        id: 'irs-1',
        question: 'Is the entity a tax-exempt organization, state/local government, or tribal government?',
        guidance: 'Required for IRA Section 6417 Direct Pay eligibility (nonprofits, municipalities, tribes).',
      },
      {
        id: 'irs-2',
        question: 'Are workers on the project paid prevailing wages as defined by the Davis-Bacon Act?',
        guidance: 'Required to receive the full 5x bonus multiplier on clean energy tax credits under the IRA.',
      },
      {
        id: 'irs-3',
        question: 'Is the project meeting the apprenticeship hours requirements (12.5%+ for 2024+)?',
        guidance: 'Qualified apprenticeship requirements must be met alongside prevailing wage for maximum IRA credit.',
      },
      {
        id: 'irs-4',
        question: 'Has the entity filed or will it file IRS Form 3468 or 8835 for investment/production credits?',
        guidance: 'Required tax forms for claiming clean energy investment or production tax credits.',
      },
      {
        id: 'irs-5',
        question: 'Is the project placed in service in an Energy Community or Low-Income Community?',
        guidance: 'Qualifying location can add 10% adder to base IRA tax credit rates.',
      },
      {
        id: 'irs-6',
        question: 'Are project records maintained for a minimum of 3 years post-credit period?',
        guidance: 'IRS audit readiness requires documentation of all qualifying expenditures and labor records.',
      },
    ],
  },
  {
    id: 'environmental',
    title: 'Environmental Compliance',
    description: 'Green building certifications, energy standards, and EPA requirements',
    icon: Leaf,
    items: [
      {
        id: 'env-1',
        question: 'Is the project pursuing or has it achieved LEED certification (Silver or above)?',
        guidance: 'LEED Silver+ is required for many state green building incentives and local fee reductions.',
      },
      {
        id: 'env-2',
        question: 'Does the project meet ENERGY STAR certification standards?',
        guidance: 'ENERGY STAR qualification required for 45L tax credit ($2,500–$5,000 per unit).',
      },
      {
        id: 'env-3',
        question: 'Has an Environmental Site Assessment (Phase I/II) been completed?',
        guidance: 'Required before drawing on many HUD, USDA, and EPA brownfields grants.',
      },
      {
        id: 'env-4',
        question: 'Does the project comply with applicable state green building code requirements?',
        guidance: 'State energy codes (based on ASHRAE 90.1 or IECC) must be met before applying for state incentives.',
      },
      {
        id: 'env-5',
        question: 'Are stormwater management and impervious surface requirements addressed?',
        guidance: 'EPA and local MS4 permits require stormwater plans for projects over 1 acre of disturbance.',
      },
      {
        id: 'env-6',
        question: 'Does the project plan include sustainable transportation provisions (bike parking, transit access)?',
        guidance: 'Required for certain transit-oriented development incentives and LEED Transportation credits.',
      },
    ],
  },
  {
    id: 'affordable',
    title: 'Affordable Housing Compliance',
    description: 'AMI limits, rent restrictions, LIHTC, HOME, and HUD program requirements',
    icon: Home,
    items: [
      {
        id: 'aff-1',
        question: 'Are income-restricted units targeting tenants at or below 60% Area Median Income (AMI)?',
        guidance: 'Standard LIHTC requires 60% AMI targeting; some programs require 50% or lower.',
      },
      {
        id: 'aff-2',
        question: 'Does the project comply with LIHTC rent restriction requirements for 30 years?',
        guidance: 'Extended use agreements restrict rents and income levels for the life of the compliance period.',
      },
      {
        id: 'aff-3',
        question: 'Is the project submitting a LIHTC Qualified Allocation Plan (QAP) application to the state HFA?',
        guidance: 'Each state\'s QAP defines scoring criteria and priorities for LIHTC award.',
      },
      {
        id: 'aff-4',
        question: 'If receiving HOME funds, does the project meet HOME program rent and income limits?',
        guidance: 'HOME program has its own rent and income limit tables distinct from LIHTC limits.',
      },
      {
        id: 'aff-5',
        question: 'Has a Tenant Selection Plan been prepared and does it comply with fair housing requirements?',
        guidance: 'Required for HUD-assisted projects and LIHTC. Must be non-discriminatory and accessible.',
      },
      {
        id: 'aff-6',
        question: 'Does the project include market-rate units that cross-subsidize affordable units (mixed-income)?',
        guidance: 'Mixed-income structures can unlock additional financing layers and improve financial feasibility.',
      },
    ],
  },
  {
    id: 'labor',
    title: 'Labor Standards',
    description: 'Davis-Bacon Act, Section 3 hiring, prevailing wage documentation',
    icon: Hammer,
    items: [
      {
        id: 'lab-1',
        question: 'Does the project use federal funding triggering Davis-Bacon Act compliance?',
        guidance: 'Davis-Bacon applies to federally funded or assisted construction contracts over $2,000.',
      },
      {
        id: 'lab-2',
        question: 'Are certified payroll records being collected and submitted weekly from all contractors?',
        guidance: 'Certified payrolls (WH-347) must be submitted weekly to the funding agency when Davis-Bacon applies.',
      },
      {
        id: 'lab-3',
        question: 'Does the project comply with Section 3 requirements (hiring local low-income residents)?',
        guidance: 'Section 3 requires that 25% of labor hours go to low-income workers when using certain HUD funds.',
      },
      {
        id: 'lab-4',
        question: 'Are all subcontractors and sub-tier contractors also subject to prevailing wage verification?',
        guidance: 'Prevailing wage requirements flow down to all tiers of contractors on covered projects.',
      },
      {
        id: 'lab-5',
        question: 'Is there a compliance officer or third-party monitor tracking labor standards on-site?',
        guidance: 'Many grant agreements require a designated compliance officer for labor standards monitoring.',
      },
      {
        id: 'lab-6',
        question: 'Has the project posted required prevailing wage notices and posters at the job site?',
        guidance: 'Required notices (WH-1321) must be posted at the job site in visible locations.',
      },
    ],
  },
  {
    id: 'fair-housing',
    title: 'Fair Housing',
    description: 'ADA compliance, Affirmative Fair Marketing, and AFFH requirements',
    icon: Users,
    items: [
      {
        id: 'fh-1',
        question: 'Does the project comply with the Americans with Disabilities Act (ADA) accessibility standards?',
        guidance: 'All common areas and required percentage of units must meet ADA accessibility standards.',
      },
      {
        id: 'fh-2',
        question: 'Does the project meet Fair Housing Act design and construction requirements?',
        guidance: 'Multifamily buildings with 4+ units built after 1991 must comply with FHA accessibility guidelines.',
      },
      {
        id: 'fh-3',
        question: 'Has an Affirmative Fair Housing Marketing Plan (AFHMP) been developed?',
        guidance: 'Required for HUD-assisted projects. Must include outreach to groups least likely to apply.',
      },
      {
        id: 'fh-4',
        question: 'Is the project meeting Affirmatively Furthering Fair Housing (AFFH) obligations?',
        guidance: 'Grantees of certain federal funds must AFFH — taking meaningful actions to overcome housing segregation.',
      },
      {
        id: 'fh-5',
        question: 'Are all rental and marketing materials reviewed for fair housing compliance?',
        guidance: 'Advertising must not indicate preference, limitation, or discrimination based on protected class.',
      },
      {
        id: 'fh-6',
        question: 'Has the project conducted a review for disparate impact and disproportionate housing needs?',
        guidance: 'Required analysis for CDBG grantees; identifies areas with racially or ethnically concentrated poverty.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function scoreColor(pct: number) {
  if (pct >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreBarColor(pct: number) {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreBadge(pct: number) {
  if (pct >= 80) return { label: 'Compliant', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
  if (pct >= 50) return { label: 'Review Needed', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
  return { label: 'Non-Compliant Risk', className: 'bg-red-500/10 text-red-600 border-red-500/20' };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CompliancePage() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [openDomains, setOpenDomains] = useState<Set<string>>(new Set(['irs']));

  const setAnswer = (itemId: string, answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [itemId]: answer }));
  };

  const toggleDomain = (domainId: string) => {
    setOpenDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) next.delete(domainId);
      else next.add(domainId);
      return next;
    });
  };

  const domainScores = useMemo(() => {
    return DOMAINS.map((domain) => {
      const total = domain.items.length;
      const answered = domain.items.filter((item) => answers[item.id] !== null && answers[item.id] !== undefined).length;
      const passing = domain.items.filter((item) => answers[item.id] === 'yes').length;
      const pct = answered === 0 ? 0 : Math.round((passing / answered) * 100);
      return { domainId: domain.id, total, answered, passing, pct };
    });
  }, [answers]);

  const overallScore = useMemo(() => {
    const allAnswered = domainScores.reduce((sum, d) => sum + d.answered, 0);
    const allPassing = domainScores.reduce((sum, d) => sum + d.passing, 0);
    if (allAnswered === 0) return 0;
    return Math.round((allPassing / allAnswered) * 100);
  }, [domainScores]);

  const totalAnswered = domainScores.reduce((sum, d) => sum + d.answered, 0);
  const totalItems = DOMAINS.reduce((sum, d) => sum + d.items.length, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20 shrink-0">
          <FileCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora text-slate-900 dark:text-white">
            Compliance Checker
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Verify your project meets key compliance requirements before submitting applications
          </p>
        </div>
      </div>

      {/* Overall Score */}
      <Card className="card-v41 border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-transparent">
        <CardContent className="pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Overall Compliance Score
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold font-mono ${scoreColor(overallScore)}`}>
                    {overallScore}%
                  </span>
                  {totalAnswered > 0 && (
                    <Badge className={scoreBadge(overallScore).className}>
                      {scoreBadge(overallScore).label}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${scoreBarColor(overallScore)}`}
                  style={{ width: `${overallScore}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {totalAnswered} of {totalItems} items answered
              </p>
            </div>
            <div className="flex gap-3 sm:flex-col sm:items-end">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="font-mono font-bold">{domainScores.reduce((s, d) => s + d.passing, 0)}</span>
                <span>Passing</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-red-500">
                <XCircle className="h-3.5 w-3.5" />
                <span className="font-mono font-bold">
                  {domainScores.reduce((s, d) => s + d.answered - d.passing, 0)}
                </span>
                <span>Failing</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="font-mono font-bold">{totalItems - totalAnswered}</span>
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain Scores Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {DOMAINS.map((domain, i) => {
          const score = domainScores[i];
          const Icon = domain.icon;
          return (
            <button
              key={domain.id}
              onClick={() => {
                setOpenDomains((prev) => {
                  const next = new Set(prev);
                  next.add(domain.id);
                  return next;
                });
                setTimeout(() => {
                  document.getElementById(`domain-${domain.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="card-v41 p-3 text-left hover:border-teal-500/30 transition-colors rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <Icon className="h-4 w-4 text-teal-500 mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mb-1.5">
                {domain.title}
              </p>
              <div className={`text-lg font-bold font-mono ${scoreColor(score.pct)}`}>
                {score.answered > 0 ? `${score.pct}%` : '—'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Domain Accordion */}
      <div className="space-y-3">
        {DOMAINS.map((domain, domainIdx) => {
          const score = domainScores[domainIdx];
          const Icon = domain.icon;
          const isOpen = openDomains.has(domain.id);

          return (
            <Card key={domain.id} id={`domain-${domain.id}`} className="card-v41">
              {/* Domain Header */}
              <button
                className="w-full text-left"
                onClick={() => toggleDomain(domain.id)}
              >
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 shrink-0">
                        <Icon className="h-5 w-5 text-teal-500" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="font-sora text-base">{domain.title}</CardTitle>
                        <CardDescription className="text-xs truncate">{domain.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {score.answered > 0 && (
                        <>
                          <Badge className={`text-xs font-mono ${scoreBadge(score.pct).className}`}>
                            {score.pct}%
                          </Badge>
                          <span className="text-xs text-slate-400 hidden sm:block">
                            {score.answered}/{score.total}
                          </span>
                        </>
                      )}
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                  {/* Domain progress bar */}
                  {score.answered > 0 && (
                    <div className="mt-2 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${scoreBarColor(score.pct)}`}
                        style={{ width: `${score.pct}%` }}
                      />
                    </div>
                  )}
                </CardHeader>
              </button>

              {/* Domain Items */}
              {isOpen && (
                <CardContent className="pt-0 pb-4 space-y-3">
                  {domain.items.map((item, itemIdx) => {
                    const answer = answers[item.id] ?? null;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-lg border p-4 space-y-3 transition-colors ${
                          answer === 'yes'
                            ? 'border-emerald-500/30 bg-emerald-500/3 dark:bg-emerald-500/5'
                            : answer === 'no'
                            ? 'border-red-500/30 bg-red-500/3 dark:bg-red-500/5'
                            : answer === 'unsure'
                            ? 'border-amber-500/30 bg-amber-500/3 dark:bg-amber-500/5'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-xs text-slate-400 shrink-0 mt-0.5">
                            {domainIdx + 1}.{itemIdx + 1}
                          </span>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                              {item.question}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                              {item.guidance}
                            </p>
                          </div>
                        </div>

                        {/* Answer Buttons */}
                        <div className="flex gap-2 ml-6">
                          <button
                            onClick={() => setAnswer(item.id, answer === 'yes' ? null : 'yes')}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              answer === 'yes'
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
                            }`}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Yes
                          </button>
                          <button
                            onClick={() => setAnswer(item.id, answer === 'no' ? null : 'no')}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              answer === 'no'
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-400'
                            }`}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            No
                          </button>
                          <button
                            onClick={() => setAnswer(item.id, answer === 'unsure' ? null : 'unsure')}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              answer === 'unsure'
                                ? 'border-amber-500 bg-amber-500 text-white'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400'
                            }`}
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                            Unsure
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Expert Review CTA */}
      <Card className="card-v41 border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-transparent">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20 shrink-0">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold font-sora text-slate-900 dark:text-white">
                Get Expert Compliance Review
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
                Our compliance specialists can review your project against all applicable federal, state, and local requirements before you submit applications.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Davis-Bacon Audit', 'LIHTC QAP Review', 'Fair Housing Assessment', 'IRS Credit Strategy'].map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shrink-0"
          >
            Request Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
