// FILE: /Users/dremacmini/Desktop/OC/incentedge/Site/src/app/(dashboard)/programs/page.tsx
'use client';

import Link from 'next/link';
import {
  Landmark,
  Building2,
  MapPin,
  Zap,
  Leaf,
  Home,
  Database,
  Globe,
  BarChart3,
  RefreshCw,
  ArrowRight,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = [
  {
    name: 'Federal Programs',
    icon: Landmark,
    description: 'IRA, ITC, PTC, NMTC, LIHTC and more',
    count: '12,450',
    slug: 'federal',
  },
  {
    name: 'State Programs',
    icon: Building2,
    description: 'State tax credits, grants, and utility incentives',
    count: '9,820',
    slug: 'state',
  },
  {
    name: 'Local & Municipal',
    icon: MapPin,
    description: 'City and county-level programs',
    count: '4,290',
    slug: 'local',
  },
  {
    name: 'Utility Programs',
    icon: Zap,
    description: 'Rebates and incentives from utility companies',
    count: '2,890',
    slug: 'utility',
  },
  {
    name: 'Clean Energy',
    icon: Leaf,
    description: 'IRA clean energy, solar, wind, storage',
    count: '3,150',
    slug: 'clean-energy',
  },
  {
    name: 'Affordable Housing',
    icon: Home,
    description: 'LIHTC, HOME, CDBG, and housing programs',
    count: '2,407',
    slug: 'affordable-housing',
  },
];

const jurisdictions = [
  { label: 'All States', value: '' },
  { label: 'New York', value: 'NY' },
  { label: 'California', value: 'CA' },
  { label: 'Texas', value: 'TX' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Florida', value: 'FL' },
  { label: 'Washington', value: 'WA' },
];

const featuredPrograms = [
  {
    name: 'IRA Direct Pay',
    type: 'Federal Tax Credit',
    amount: '$3.2B',
    description: 'Direct cash payments for tax-exempt entities under IRA Section 6417',
    color: 'from-emerald-500/10 to-emerald-600/5 dark:from-emerald-900/30 dark:to-emerald-800/10',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    name: 'LIHTC 9%',
    type: 'Housing Tax Credit',
    amount: '$1.8B',
    description: 'Competitive low-income housing tax credits for affordable developments',
    color: 'from-blue-500/10 to-blue-600/5 dark:from-blue-900/30 dark:to-blue-800/10',
    border: 'border-blue-200 dark:border-blue-800/50',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  {
    name: 'NY Climate Act',
    type: 'State Program',
    amount: '$4.2B',
    description: 'New York Climate Leadership and Community Protection Act funding',
    color: 'from-teal-500/10 to-teal-600/5 dark:from-teal-900/30 dark:to-teal-800/10',
    border: 'border-teal-200 dark:border-teal-800/50',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    accent: 'text-teal-600 dark:text-teal-400',
  },
];

const stats = [
  { label: 'Programs', value: '30,007', icon: Database },
  { label: 'States', value: '50', icon: Globe },
  { label: 'Awards Tracked', value: '8M+', icon: BarChart3 },
  { label: 'Updated', value: 'Daily', icon: RefreshCw },
];

export default function ProgramsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora text-navy-900 dark:text-white">
            Program Database
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            30,007 verified incentive programs across federal, state, local, and utility sources
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="card-v41">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-teal-100 p-2 dark:bg-teal-900/30">
                <stat.icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-navy-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Browse by Category */}
      <div>
        <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
          Browse by Category
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/discover?category=${category.slug}`}
              className="group"
            >
              <Card className="card-v41 border-t-2 border-t-teal-500 dark:border-t-teal-400 hover:border-teal-500/50 dark:hover:border-teal-400/50 hover:bg-teal-500/5 dark:hover:bg-teal-500/5 transition-colors h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-teal-100 p-2.5 dark:bg-teal-900/30 shrink-0">
                      <category.icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold font-sora text-navy-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge
                          variant="outline"
                          className="border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-400 font-mono text-xs"
                        >
                          {category.count} programs
                        </Badge>
                        <span className="text-sm font-medium text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">
                          Browse →
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Browse by Jurisdiction */}
      <div>
        <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-3">
          Browse by Jurisdiction
        </h2>
        <div className="flex flex-wrap gap-2">
          {jurisdictions.map((state) => (
            <Button
              key={state.label}
              variant="outline"
              size="sm"
              asChild
              className="border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:bg-teal-500/5 dark:hover:border-teal-400/50 dark:hover:bg-teal-500/5"
            >
              <Link href={state.value ? `/discover?state=${state.value}` : '/discover'}>
                <MapPin className="mr-1.5 h-3 w-3 text-teal-500 dark:text-teal-400" />
                {state.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Programs */}
      <div>
        <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
          Featured Programs
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredPrograms.map((program) => (
            <Card
              key={program.name}
              className={`card-v41 bg-gradient-to-br ${program.color} ${program.border}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={program.badge}>{program.type}</Badge>
                </div>
                <CardTitle className="font-sora text-lg text-navy-900 dark:text-white">
                  {program.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {program.description}
                </p>
                <p className={`text-2xl font-bold font-mono ${program.accent}`}>
                  {program.amount}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:bg-teal-500/5"
                >
                  <Link href="/discover">
                    <DollarSign className="mr-1.5 h-3.5 w-3.5" />
                    View Program
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <Card className="card-v41 bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 text-white border-none">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 p-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold font-sora">
                Can&apos;t find what you&apos;re looking for?
              </h3>
              <p className="text-sm text-teal-100">
                Our AI search analyzes your project details to surface the most relevant programs.
              </p>
            </div>
          </div>
          <Button variant="secondary" className="shrink-0" asChild>
            <Link href="/matching">
              Use AI Search
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
