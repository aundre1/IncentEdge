'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Map, ExternalLink, TrendingUp, Landmark, Building2, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ---------------------------------------------------------------------------
// Mock data — realistic program counts per state
// ---------------------------------------------------------------------------

interface StateData {
  abbr: string;
  name: string;
  total: number;
  federal: number;
  state: number;
  local: number;
  utility: number;
  topPrograms: string[];
}

const STATE_DATA: StateData[] = [
  { abbr: 'NY', name: 'New York', total: 1247, federal: 312, state: 498, local: 287, utility: 150, topPrograms: ['NY State Brownfield Cleanup', 'Empire State Development Grants', 'NYC 485-x Affordable Neighborhoods Tax Exemption'] },
  { abbr: 'CA', name: 'California', total: 1180, federal: 298, state: 476, local: 264, utility: 142, topPrograms: ['CPUC Self-Generation Incentive', 'Cal HFA Down Payment Assistance', 'Low-Income Weatherization Program'] },
  { abbr: 'TX', name: 'Texas', total: 1089, federal: 287, state: 412, local: 248, utility: 142, topPrograms: ['Texas Enterprise Zone Program', 'Texas PACE Authority', 'City of Houston Green Building Incentive'] },
  { abbr: 'FL', name: 'Florida', total: 987, federal: 265, state: 378, local: 218, utility: 126, topPrograms: ['Florida Job Growth Grant Fund', 'Florida PACE Program', 'FPL Energy Efficiency Rebates'] },
  { abbr: 'IL', name: 'Illinois', total: 934, federal: 256, state: 356, local: 198, utility: 124, topPrograms: ['Illinois DCEO Economic Development Grants', 'ComEd Energy Efficiency Incentives', 'Illinois PACE'] },
  { abbr: 'PA', name: 'Pennsylvania', total: 892, federal: 241, state: 342, local: 187, utility: 122, topPrograms: ['PA Industrial Development Authority', 'PEDA Energy Grants', 'Philadelphia Renovation Incentive'] },
  { abbr: 'OH', name: 'Ohio', total: 876, federal: 238, state: 334, local: 182, utility: 122, topPrograms: ['Ohio Job Creation Tax Credit', 'ODOD Technology Investment', 'AEP Ohio Efficiency Programs'] },
  { abbr: 'GA', name: 'Georgia', total: 845, federal: 230, state: 322, local: 175, utility: 118, topPrograms: ['Georgia Quick Start', 'OneGeorgia Authority', 'Georgia Power Efficiency Programs'] },
  { abbr: 'NC', name: 'North Carolina', total: 812, federal: 221, state: 308, local: 168, utility: 115, topPrograms: ['NC Mill Rehabilitation Tax Credit', 'NCRDA Rural Economic Development', 'Duke Energy Efficiency Rebates'] },
  { abbr: 'MI', name: 'Michigan', total: 798, federal: 218, state: 302, local: 164, utility: 114, topPrograms: ['Michigan Business Development Program', 'MSHDA Rental Development', 'Consumers Energy Efficiency'] },
  { abbr: 'WA', name: 'Washington', total: 776, federal: 212, state: 294, local: 158, utility: 112, topPrograms: ['WA State Housing Finance Commission', 'Clean Energy Incentive Program', 'Puget Sound Energy Rebates'] },
  { abbr: 'NJ', name: 'New Jersey', total: 754, federal: 206, state: 286, local: 152, utility: 110, topPrograms: ['NJEDA Technology Voucher Program', 'NJ HMFA Loans', 'PSE&G Solar Loan Program'] },
  { abbr: 'AZ', name: 'Arizona', total: 723, federal: 198, state: 274, local: 146, utility: 105, topPrograms: ['ACA Tax Credit for Qualifying Plants', 'AZ Commerce Authority Grants', 'APS Solar Communities'] },
  { abbr: 'CO', name: 'Colorado', total: 712, federal: 195, state: 270, local: 142, utility: 105, topPrograms: ['Colorado OEDIT Advanced Industries Grant', 'CO Housing Finance Authority', 'Xcel Energy Rebates'] },
  { abbr: 'MN', name: 'Minnesota', total: 698, federal: 191, state: 264, local: 138, utility: 105, topPrograms: ['MN DEED Business Finance Program', 'MHFA Homeownership Programs', 'Xcel Energy Conservation Programs'] },
  { abbr: 'MA', name: 'Massachusetts', total: 687, federal: 188, state: 260, local: 136, utility: 103, topPrograms: ['MassDEP Site Clean-up', 'MassHousing Financing', 'Eversource Energy Efficiency'] },
  { abbr: 'TN', name: 'Tennessee', total: 654, federal: 179, state: 248, local: 130, utility: 97, topPrograms: ['FastTrack Economic Development', 'THDA Homeownership Programs', 'TVA EnergyRight Solutions'] },
  { abbr: 'MD', name: 'Maryland', total: 642, federal: 176, state: 244, local: 127, utility: 95, topPrograms: ['Maryland DHCD Programs', 'MARBIDCO Agricultural Programs', 'BGE Smart Energy Savers'] },
  { abbr: 'VA', name: 'Virginia', total: 631, federal: 173, state: 239, local: 124, utility: 95, topPrograms: ['GO Virginia Economic Development', 'VHDA Multifamily Programs', 'Dominion Energy Efficiency'] },
  { abbr: 'IN', name: 'Indiana', total: 612, federal: 168, state: 232, local: 120, utility: 92, topPrograms: ['IEDC Economic Development Incentives', 'IHCDA Housing Programs', 'Duke Energy Efficiency Programs'] },
  { abbr: 'MO', name: 'Missouri', total: 598, federal: 164, state: 226, local: 117, utility: 91, topPrograms: ['Missouri Works Program', 'MHDC Multifamily Rental Housing', 'Ameren Missouri Rebates'] },
  { abbr: 'WI', name: 'Wisconsin', total: 587, federal: 161, state: 222, local: 115, utility: 89, topPrograms: ['Wisconsin Economic Development Corp', 'WHEDA Housing Programs', 'Focus on Energy'] },
  { abbr: 'OR', name: 'Oregon', total: 574, federal: 157, state: 218, local: 112, utility: 87, topPrograms: ['Business Oregon', 'OHCS Affordable Housing', 'Energy Trust of Oregon'] },
  { abbr: 'CT', name: 'Connecticut', total: 562, federal: 154, state: 213, local: 109, utility: 86, topPrograms: ['DECD Business Incentive Programs', 'CHFA Housing Programs', 'Eversource CT Efficiency'] },
  { abbr: 'LA', name: 'Louisiana', total: 548, federal: 150, state: 208, local: 107, utility: 83, topPrograms: ['Louisiana LED FastStart', 'Louisiana HFA Programs', 'Entergy Louisiana Efficiency'] },
  { abbr: 'SC', name: 'South Carolina', total: 534, federal: 146, state: 203, local: 104, utility: 81, topPrograms: ['SC Coordinating Council', 'SC State HFA', 'Duke Energy Carolinas Programs'] },
  { abbr: 'KY', name: 'Kentucky', total: 521, federal: 143, state: 197, local: 101, utility: 80, topPrograms: ['Kentucky Business Investment', 'KHRC Housing Programs', 'LG&E and KU Energy Efficiency'] },
  { abbr: 'AL', name: 'Alabama', total: 498, federal: 137, state: 188, local: 97, utility: 76, topPrograms: ['Alabama Industrial Development Authority', 'AHFA Mortgage Programs', 'Alabama Power SmartCents'] },
  { abbr: 'OK', name: 'Oklahoma', total: 487, federal: 134, state: 184, local: 95, utility: 74, topPrograms: ['Oklahoma Quality Jobs Program', 'OHFA Homeownership Programs', 'OG&E Efficiency Programs'] },
  { abbr: 'AR', name: 'Arkansas', total: 456, federal: 125, state: 173, local: 89, utility: 69, topPrograms: ['Arkansas Economic Development Commission', 'ADFA Housing Programs', 'Entergy Arkansas Efficiency'] },
  { abbr: 'IA', name: 'Iowa', total: 445, federal: 122, state: 168, local: 87, utility: 68, topPrograms: ['Iowa Economic Development Authority', 'Iowa Finance Authority', 'MidAmerican Energy Efficiency'] },
  { abbr: 'KS', name: 'Kansas', total: 434, federal: 119, state: 164, local: 85, utility: 66, topPrograms: ['KDOC Business Recruitment', 'KHRC Housing Programs', 'Evergy Rebate Programs'] },
  { abbr: 'MS', name: 'Mississippi', total: 423, federal: 116, state: 160, local: 83, utility: 64, topPrograms: ['MDA Business Incentives', 'MHFA Mortgage Revenue Bond', 'Entergy Mississippi Efficiency'] },
  { abbr: 'NV', name: 'Nevada', total: 412, federal: 113, state: 156, local: 81, utility: 62, topPrograms: ['Nevada GOED Incentive Programs', 'Nevada Housing Division', 'NV Energy Efficiency Programs'] },
  { abbr: 'NM', name: 'New Mexico', total: 398, federal: 109, state: 151, local: 78, utility: 60, topPrograms: ['NM Economic Development Department', 'New Mexico MFA', 'PNM Resources Efficiency'] },
  { abbr: 'NE', name: 'Nebraska', total: 387, federal: 106, state: 147, local: 76, utility: 58, topPrograms: ['Nebraska Advantage Act', 'NIFA Housing Programs', 'LES Efficiency Programs'] },
  { abbr: 'UT', name: 'Utah', total: 376, federal: 103, state: 143, local: 74, utility: 56, topPrograms: ['Utah Governor\'s Office of Economic Opportunity', 'Utah Housing Corporation', 'Rocky Mountain Power Efficiency'] },
  { abbr: 'ID', name: 'Idaho', total: 356, federal: 98, state: 135, local: 70, utility: 53, topPrograms: ['Idaho Department of Commerce Grants', 'IHFA Housing Programs', 'Idaho Power Efficiency'] },
  { abbr: 'HI', name: 'Hawaii', total: 345, federal: 95, state: 131, local: 68, utility: 51, topPrograms: ['HI Strategic Development Corp', 'HHFDC Housing Programs', 'HECO Energy Efficiency'] },
  { abbr: 'ME', name: 'Maine', total: 334, federal: 92, state: 127, local: 66, utility: 49, topPrograms: ['Maine DECD Incentives', 'MaineHousing Programs', 'Efficiency Maine Rebates'] },
  { abbr: 'NH', name: 'New Hampshire', total: 323, federal: 89, state: 122, local: 63, utility: 49, topPrograms: ['NH BEDC Business Programs', 'NHHFA Housing Programs', 'Eversource NH Efficiency'] },
  { abbr: 'RI', name: 'Rhode Island', total: 312, federal: 86, state: 118, local: 61, utility: 47, topPrograms: ['Commerce RI Incentives', 'RIHousing Programs', 'National Grid RI Efficiency'] },
  { abbr: 'MT', name: 'Montana', total: 298, federal: 82, state: 113, local: 58, utility: 45, topPrograms: ['Montana CDBG Programs', 'Montana Housing', 'NorthWestern Energy Efficiency'] },
  { abbr: 'DE', name: 'Delaware', total: 287, federal: 79, state: 109, local: 56, utility: 43, topPrograms: ['Delaware Strategic Fund', 'DSHA Housing Programs', 'Delmarva Power Efficiency'] },
  { abbr: 'SD', name: 'South Dakota', total: 276, federal: 76, state: 105, local: 54, utility: 41, topPrograms: ['SD GOED Business Development', 'SD Housing Development Authority', 'Black Hills Energy Efficiency'] },
  { abbr: 'VT', name: 'Vermont', total: 265, federal: 73, state: 101, local: 52, utility: 39, topPrograms: ['Vermont Agency of Commerce', 'VHFA Housing Finance', 'Efficiency Vermont'] },
  { abbr: 'ND', name: 'North Dakota', total: 254, federal: 70, state: 96, local: 50, utility: 38, topPrograms: ['ND Economic Development Finance', 'ND Housing Finance Agency', 'Montana-Dakota Utilities Efficiency'] },
  { abbr: 'AK', name: 'Alaska', total: 243, federal: 67, state: 92, local: 49, utility: 35, topPrograms: ['AIDEA Business Programs', 'AHFC Housing Programs', 'AEA Energy Efficiency Programs'] },
  { abbr: 'WY', name: 'Wyoming', total: 234, federal: 64, state: 89, local: 47, utility: 34, topPrograms: ['Wyoming Business Council', 'Wyoming Community Dev. Authority', 'Rocky Mountain Power WY Efficiency'] },
  { abbr: 'WV', name: 'West Virginia', total: 223, federal: 61, state: 85, local: 45, utility: 32, topPrograms: ['WV Development Office', 'WVHDF Housing Programs', 'Appalachian Power Efficiency'] },
];

type FilterTab = 'all' | 'federal' | 'state' | 'local' | 'utility';

function getCountForFilter(s: StateData, filter: FilterTab): number {
  switch (filter) {
    case 'federal': return s.federal;
    case 'state': return s.state;
    case 'local': return s.local;
    case 'utility': return s.utility;
    default: return s.total;
  }
}

function getIntensityClass(count: number, max: number): string {
  const ratio = count / max;
  if (ratio > 0.8) return 'border-teal-500 bg-teal-500/15 dark:bg-teal-500/20';
  if (ratio > 0.6) return 'border-teal-400 bg-teal-400/10 dark:bg-teal-400/15';
  if (ratio > 0.4) return 'border-teal-300 bg-teal-300/8 dark:bg-teal-300/10';
  if (ratio > 0.2) return 'border-slate-300 dark:border-slate-600 bg-slate-100/50 dark:bg-slate-800/50';
  return 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedState, setSelectedState] = useState<StateData | null>(null);

  const totalPrograms = STATE_DATA.reduce((sum, s) => sum + s.total, 0);

  const sortedStates = useMemo(() => {
    return [...STATE_DATA].sort(
      (a, b) => getCountForFilter(b, activeFilter) - getCountForFilter(a, activeFilter),
    );
  }, [activeFilter]);

  const maxCount = useMemo(
    () => Math.max(...sortedStates.map((s) => getCountForFilter(s, activeFilter))),
    [sortedStates, activeFilter],
  );

  const topState = sortedStates[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20 shrink-0">
          <Map className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora text-slate-900 dark:text-white">
            Incentive Map
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Explore incentive programs across all 50 states
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Programs', value: totalPrograms.toLocaleString(), icon: Landmark },
          { label: 'Avg per State', value: Math.round(totalPrograms / 50).toLocaleString(), icon: TrendingUp },
          { label: `Highest (${topState?.abbr})`, value: topState?.total.toLocaleString() ?? '—', icon: Building2 },
          { label: 'IRA Programs', value: '847', icon: Zap },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="card-v41">
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <Icon className="h-5 w-5 text-teal-500 shrink-0" />
                <div>
                  <p className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterTab)}>
        <TabsList className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            All Programs
          </TabsTrigger>
          <TabsTrigger value="federal" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Federal
          </TabsTrigger>
          <TabsTrigger value="state" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            State
          </TabsTrigger>
          <TabsTrigger value="local" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Local
          </TabsTrigger>
          <TabsTrigger value="utility" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            Utility
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* State Grid */}
        <div className="lg:col-span-2">
          <Card className="card-v41">
            <CardHeader className="pb-3">
              <CardTitle className="font-sora text-base">States by Program Count</CardTitle>
              <CardDescription>
                Click any state to see detailed breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-7 xl:grid-cols-8 gap-1.5">
                {sortedStates.map((s) => {
                  const count = getCountForFilter(s, activeFilter);
                  const isSelected = selectedState?.abbr === s.abbr;
                  return (
                    <button
                      key={s.abbr}
                      onClick={() => setSelectedState(isSelected ? null : s)}
                      className={`group flex flex-col items-center justify-center rounded-lg border p-1.5 transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500/20 ring-1 ring-teal-500'
                          : getIntensityClass(count, maxCount)
                      } hover:border-teal-400 hover:scale-105`}
                    >
                      <span className={`text-xs font-bold font-mono ${isSelected ? 'text-teal-600 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {s.abbr}
                      </span>
                      <span className={`text-[10px] font-mono ${isSelected ? 'text-teal-500' : 'text-slate-400'}`}>
                        {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                <span>Fewer programs</span>
                <div className="flex gap-1">
                  {['bg-slate-200 dark:bg-slate-700', 'bg-teal-200 dark:bg-teal-800', 'bg-teal-300 dark:bg-teal-700', 'bg-teal-400 dark:bg-teal-600', 'bg-teal-500'].map((cls) => (
                    <div key={cls} className={`h-3 w-5 rounded ${cls}`} />
                  ))}
                </div>
                <span>More programs</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {selectedState ? (
            <>
              <Card className="card-v41 border-teal-500/30">
                <CardHeader>
                  <CardTitle className="font-sora text-lg">{selectedState.name}</CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-teal-600 dark:text-teal-400">
                      {selectedState.total.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-500">total programs</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Federal', count: selectedState.federal, color: 'bg-blue-500' },
                    { label: 'State', count: selectedState.state, color: 'bg-teal-500' },
                    { label: 'Local', count: selectedState.local, color: 'bg-emerald-500' },
                    { label: 'Utility', count: selectedState.utility, color: 'bg-amber-500' },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{label}</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color}`}
                          style={{ width: `${(count / selectedState.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="card-v41">
                <CardHeader className="pb-2">
                  <CardTitle className="font-sora text-sm text-slate-500 dark:text-slate-400">
                    Top Programs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedState.topPrograms.map((prog) => (
                    <div
                      key={prog}
                      className="flex items-start gap-2 rounded-lg border border-slate-100 dark:border-slate-800 p-2"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">{prog}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                asChild
              >
                <Link href={`/discover?state=${selectedState.abbr}`}>
                  Browse {selectedState.abbr} Programs
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <Card className="card-v41 h-64 flex items-center justify-center">
              <CardContent className="text-center space-y-2">
                <Map className="h-10 w-10 text-teal-500/30 mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Click any state card to see its program breakdown
                </p>
              </CardContent>
            </Card>
          )}

          {/* Top 5 States */}
          <Card className="card-v41">
            <CardHeader className="pb-2">
              <CardTitle className="font-sora text-sm text-slate-500 dark:text-slate-400">
                Top 5 States
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sortedStates.slice(0, 5).map((s, i) => {
                const count = getCountForFilter(s, activeFilter);
                return (
                  <button
                    key={s.abbr}
                    onClick={() => setSelectedState(s)}
                    className="w-full flex items-center gap-3 rounded-lg p-2 hover:bg-teal-500/5 transition-colors text-left"
                  >
                    <span className="font-mono text-xs text-slate-400 w-4">{i + 1}</span>
                    <Badge className="bg-teal-500/10 text-teal-600 border-teal-500/20 font-mono text-xs">
                      {s.abbr}
                    </Badge>
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{s.name}</span>
                    <span className="font-mono text-sm font-bold text-teal-600 dark:text-teal-400">
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
