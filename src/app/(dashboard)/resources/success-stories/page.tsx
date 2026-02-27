'use client';

import { useState } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  MapPin,
  Quote,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Building2,
  Zap,
  Star,
  Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IncentiveStack {
  name: string;
  amount: number;
}

interface FeaturedStory {
  title: string;
  developer: string;
  firm: string;
  location: string;
  projectDescription: string;
  tdc: number;
  units: number;
  challenge: string;
  solution: string;
  result: string;
  stack: IncentiveStack[];
  quote: string;
  insights: string[];
}

interface CaseStudy {
  id: string;
  developer: string;
  city: string;
  projectType: string;
  totalIncentives: string;
  totalIncentivesRaw: number;
  keyInsight: string;
  category: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  project: string;
  amount: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const FEATURED_STORY: FeaturedStory = {
  title: 'Harlem Mixed-Use: From 20% Partner to 55% Owner',
  developer: 'Marcus Johnson',
  firm: 'MJ Development Partners',
  location: 'Harlem, New York',
  projectDescription: '180-unit mixed-use development with ground-floor retail and rooftop solar. 60% affordable units (50% AMI), 40% market rate. 12-story building, $72M total development cost.',
  tdc: 72000000,
  units: 180,
  challenge: 'Marcus had a site under contract and a strong community relationship but limited equity — only $2M to bring to the table on a $72M deal. Without stacking incentives creatively, he was looking at a 20% partnership stake at best.',
  solution: 'IncentEdge\'s eligibility engine identified a full incentive stack across federal, state, and NYC programs. The AI matched the project to IRA clean energy credits (solar + storage), LIHTC 9% + 4% split, NYS Affordable NY, and the Energy Community bonus adder because the site was in a designated census tract.',
  result: 'The incentive stack generated $27.3M in total value — 38% of total development cost. Marcus was able to negotiate a 55% ownership stake by contributing his site, relationships, and the incentive package as equity. Project broke ground Q1 2025.',
  stack: [
    { name: 'LIHTC 4% + 9% Credits', amount: 18200000 },
    { name: 'Section 48 ITC Solar', amount: 4100000 },
    { name: 'NYS Affordable NY (421-a)', amount: 3800000 },
    { name: 'Energy Community Bonus Adder', amount: 1200000 },
  ],
  quote: 'Before IncentEdge, I was leaving money on the table and didn\'t even know it. The platform found $27M in incentives I would have needed a team of consultants to uncover. That stack is what made me a majority partner.',
  insights: ['Energy Community designation added $1.2M', 'LIHTC split (4%+9%) maximized credit allocation', 'ITC + Direct Pay enabled cash for nonprofit co-developer', 'Incentive stack = 38% of TDC'],
};

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-1',
    developer: 'Keisha Williams',
    city: 'Brooklyn, NY',
    projectType: 'Affordable Housing (120 units)',
    totalIncentives: '$19.4M',
    totalIncentivesRaw: 19400000,
    keyInsight: 'LIHTC + Direct Pay + 421-a stack reduced equity requirement by 65%',
    category: 'Affordable Housing',
  },
  {
    id: 'cs-2',
    developer: 'Rafael Moreno',
    city: 'Austin, TX',
    projectType: '50MW Community Solar Farm',
    totalIncentives: '$22.8M',
    totalIncentivesRaw: 22800000,
    keyInsight: 'ITC + Domestic Content + Energy Community bonus adders stacked to 50% credit rate',
    category: 'Clean Energy',
  },
  {
    id: 'cs-3',
    developer: 'Sandra Park',
    city: 'Chicago, IL',
    projectType: 'Office-to-Residential Conversion (85 units)',
    totalIncentives: '$14.2M',
    totalIncentivesRaw: 14200000,
    keyInsight: 'Historic Tax Credit + LIHTC + 179D deduction stacked on adaptive reuse',
    category: 'Adaptive Reuse',
  },
  {
    id: 'cs-4',
    developer: 'David Thornton',
    city: 'Denver, CO',
    projectType: 'Mixed-Income TOD (200 units)',
    totalIncentives: '$31.6M',
    totalIncentivesRaw: 31600000,
    keyInsight: 'AHSC + LIHTC + NMTC created a 44% gap closure in a high land-cost market',
    category: 'Transit-Oriented',
  },
  {
    id: 'cs-5',
    developer: 'Maria Santos',
    city: 'Miami, FL',
    projectType: 'Commercial Rehab with Affordable Units',
    totalIncentives: '$8.7M',
    totalIncentivesRaw: 8700000,
    keyInsight: 'SAIL + SHIP + solar ITC combined on mixed-use rehab in Opportunity Zone',
    category: 'Mixed-Use',
  },
  {
    id: 'cs-6',
    developer: 'Navajo Nation Housing Authority',
    city: 'Window Rock, AZ',
    projectType: 'Tribal Housing (60 units)',
    totalIncentives: '$9.1M',
    totalIncentivesRaw: 9100000,
    keyInsight: 'Direct Pay election + NAHASDA + ITC solar enabled 100% tribal ownership',
    category: 'Tribal Housing',
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'I used to spend $50K per project on incentive consultants. IncentEdge found more in 10 minutes than they did in 3 months. The eligibility engine is terrifyingly good.',
    author: 'James Okafor',
    role: 'Principal, Okafor Capital',
    project: '250-unit mixed-income, Philadelphia, PA',
    amount: '$38M in incentives captured',
  },
  {
    quote: 'The Energy Community bonus adder alone added $2.1M to our solar project. We had no idea the site was in a designated community. The platform flagged it automatically.',
    author: 'Lisa Chen',
    role: 'CFO, SolarPath Development',
    project: '75MW solar farm, Eastern Kentucky',
    amount: '$31M in IRA credits claimed',
  },
  {
    quote: 'As a nonprofit, Direct Pay changed everything. We now monetize our own tax credits instead of giving equity to investors. IncentEdge walked us through the entire Section 6417 process.',
    author: 'Rev. Thomas Banks',
    role: 'Executive Director, Compass Community Housing',
    project: '144-unit supportive housing, Detroit, MI',
    amount: '$12.3M in Direct Pay credits',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Affordable Housing': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Clean Energy': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Adaptive Reuse': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'Transit-Oriented': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Mixed-Use': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Tribal Housing': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

// ---------------------------------------------------------------------------
// Testimonial Carousel
// ---------------------------------------------------------------------------

function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  const t = TESTIMONIALS[idx];

  return (
    <Card className="card-v41">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Quote className="h-6 w-6 text-teal-500 shrink-0 mt-1" />
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
            &ldquo;{t.quote}&rdquo;
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.author}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t.project}</p>
          </div>
          <div className="text-right">
            <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {t.amount}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1.5">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-teal-500' : 'w-1.5 bg-slate-300 dark:bg-slate-600'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIdx((i) => (i + 1) % TESTIMONIALS.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Share Your Story Form
// ---------------------------------------------------------------------------

function ShareStoryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [project, setProject] = useState('');
  const [amount, setAmount] = useState('');

  if (submitted) {
    return (
      <Card className="card-v41">
        <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          <p className="font-sora font-semibold text-slate-900 dark:text-white">Thank you, {name || 'Developer'}!</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We&apos;ll be in touch to feature your success story.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-v41">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-sora flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          Share Your Success Story
        </CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Help other developers discover what&apos;s possible. We&apos;ll feature your story and link back to your firm.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-slate-600 dark:text-slate-400">Your Name</Label>
            <Input
              placeholder="Marcus Johnson"
              className="h-9 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600 dark:text-slate-400">Project Name / City</Label>
            <Input
              placeholder="Harlem Mixed-Use, NY"
              className="h-9 text-sm"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600 dark:text-slate-400">Total Incentives Captured</Label>
          <Input
            placeholder="e.g. $27.3M"
            className="h-9 text-sm"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <Button
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white border-0 text-sm"
          onClick={() => {
            if (name && project) setSubmitted(true);
          }}
        >
          Submit My Story
          <Send className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SuccessStoriesPage() {
  const totalStack = FEATURED_STORY.stack.reduce((sum, s) => sum + s.amount, 0);
  const stackPct = Math.round((totalStack / FEATURED_STORY.tdc) * 100);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-teal-700">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sora tracking-tight text-slate-900 dark:text-white">
              Success Stories
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Real developers. Real incentives. Real results.
            </p>
          </div>
        </div>
      </div>

      {/* HERO STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Incentives Captured', value: '$2.8B', icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Projects Funded', value: '847', icon: Building2, color: 'text-teal-600 dark:text-teal-400' },
          { label: 'Success Rate', value: '89%', icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'States Covered', value: '42', icon: MapPin, color: 'text-violet-600 dark:text-violet-400' },
        ].map((stat) => (
          <Card key={stat.label} className="card-v41">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-5 w-5 shrink-0 ${stat.color}`} />
              <div>
                <p className={`text-xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FEATURED STORY */}
      <Card className="card-v41 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-teal-700" />
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-xs mb-2">
                Featured Case Study
              </Badge>
              <h2 className="text-xl font-sora font-bold text-slate-900 dark:text-white leading-snug">
                {FEATURED_STORY.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">{FEATURED_STORY.developer}</span>
                <span>·</span>
                <span>{FEATURED_STORY.firm}</span>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {FEATURED_STORY.location}
                </div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">Total TDC</p>
              <p className="font-mono text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(FEATURED_STORY.tdc)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{FEATURED_STORY.units} units</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {FEATURED_STORY.projectDescription}
          </p>

          {/* Challenge / Solution / Result */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Challenge', text: FEATURED_STORY.challenge, color: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10' },
              { label: 'Solution', text: FEATURED_STORY.solution, color: 'border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/10' },
              { label: 'Result', text: FEATURED_STORY.result, color: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10' },
            ].map(({ label, text, color }) => (
              <div key={label} className={`rounded-lg border p-4 ${color}`}>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">{label}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* Incentive Stack */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-white font-sora">Incentive Stack</p>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-mono">
                {formatCurrency(totalStack)} total ({stackPct}% of TDC)
              </Badge>
            </div>
            <div className="space-y-2">
              {FEATURED_STORY.stack.map((item) => {
                const pct = Math.round((item.amount / totalStack) * 100);
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quote */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <Quote className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{FEATURED_STORY.quote}&rdquo;
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                — {FEATURED_STORY.developer}, {FEATURED_STORY.firm}
              </p>
            </div>
          </div>

          {/* Key Insights */}
          <div className="flex flex-wrap gap-2">
            {FEATURED_STORY.insights.map((insight) => (
              <div key={insight} className="flex items-center gap-1.5 text-xs bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full px-3 py-1">
                <Zap className="h-3 w-3" />
                {insight}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CASE STUDY GRID */}
      <div>
        <h2 className="text-lg font-sora font-semibold text-slate-900 dark:text-white mb-3">
          More Success Stories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CASE_STUDIES.map((cs) => (
            <Card key={cs.id} className="card-v41">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{cs.developer}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {cs.city}
                    </div>
                  </div>
                  <Badge className={`text-xs px-2 py-0 shrink-0 ${CATEGORY_COLORS[cs.category] ?? 'bg-slate-100 text-slate-600'}`}>
                    {cs.category}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">{cs.projectType}</p>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Incentives</p>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                    {cs.totalIncentives}
                  </p>
                </div>

                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cs.keyInsight}
                  </p>
                </div>

                <Button variant="outline" size="sm" className="w-full text-xs">
                  Read Story
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS CAROUSEL */}
      <div>
        <h2 className="text-lg font-sora font-semibold text-slate-900 dark:text-white mb-3">
          Developer Testimonials
        </h2>
        <TestimonialCarousel />
      </div>

      {/* SHARE YOUR STORY */}
      <ShareStoryForm />
    </div>
  );
}
