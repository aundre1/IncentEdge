'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  MapPin,
  Building2,
  DollarSign,
  Sliders,
  CheckSquare,
  ArrowRight,
  TrendingUp,
  Zap,
  Leaf,
  Car,
  Users,
  Landmark,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

const BUILDING_TYPES = [
  { value: 'multifamily', label: 'Multifamily Residential' },
  { value: 'commercial', label: 'Commercial Office' },
  { value: 'industrial', label: 'Industrial / Warehouse' },
  { value: 'mixed-use', label: 'Mixed-Use Development' },
  { value: 'solar', label: 'Solar / Renewable Energy' },
  { value: 'other', label: 'Other' },
];

const FEATURES = [
  { id: 'leed', label: 'LEED Certified', icon: Leaf, bonus: 20 },
  { id: 'energy_star', label: 'ENERGY STAR Rated', icon: Zap, bonus: 20 },
  { id: 'solar', label: 'Solar / Renewable Energy', icon: TrendingUp, bonus: 25 },
  { id: 'ev_charging', label: 'EV Charging Infrastructure', icon: Car, bonus: 15 },
  { id: 'prevailing_wage', label: 'Prevailing Wage Compliance', icon: Shield, bonus: 30 },
  { id: 'affordable_housing', label: 'Affordable Housing Component', icon: Building2, bonus: 50 },
  { id: 'nonprofit', label: 'Nonprofit Entity (501c3)', icon: Users, bonus: 40 },
  { id: 'tribal_municipal', label: 'Tribal / Municipal Entity', icon: Landmark, bonus: 80 },
];

const PROGRAM_PREVIEWS = [
  { name: 'Federal IRA Clean Energy Credits', category: 'Tax Credit', baseScore: 0.72 },
  { name: 'State Housing Finance Authority Grants', category: 'Grant', baseScore: 0.65 },
  { name: 'Local Opportunity Zone Benefits', category: 'Tax Benefit', baseScore: 0.58 },
];

// ---------------------------------------------------------------------------
// Calculation logic
// ---------------------------------------------------------------------------

function calculateEligibility(
  state: string,
  buildingType: string,
  projectType: string,
  units: number,
  tdc: number,
  affordablePct: number,
  features: string[],
) {
  let programCount = 50;
  if (state) programCount += 30;
  if (buildingType === 'solar') programCount += 40;
  if (buildingType === 'multifamily') programCount += 20;
  if (projectType === 'new') programCount += 10;

  features.forEach((f) => {
    const feat = FEATURES.find((fe) => fe.id === f);
    if (feat) programCount += feat.bonus;
  });

  if (affordablePct >= 20) programCount += 50;
  if (features.includes('nonprofit') || features.includes('tribal_municipal')) programCount += 80;

  const tdcM = tdc / 1_000_000;
  const incentiveRate = 0.15 + (features.length * 0.025) + (affordablePct >= 20 ? 0.08 : 0);
  const valueLow = Math.max(tdcM * incentiveRate, 0.5);
  const valueHigh = valueLow * 1.6;

  const previews = PROGRAM_PREVIEWS.map((p) => ({
    ...p,
    confidence: Math.min(p.baseScore + features.length * 0.04 + (state ? 0.05 : 0), 0.97),
  }));

  return { programCount, valueLow, valueHigh, previews };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CalculatorPage() {
  // Step inputs
  const [state, setState] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [projectType, setProjectType] = useState('new');
  const [units, setUnits] = useState(50);
  const [tdc, setTdc] = useState(10_000_000);
  const [affordablePct, setAffordablePct] = useState(20);
  const [features, setFeatures] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const results = useMemo(
    () => calculateEligibility(state, buildingType, projectType, units, tdc, affordablePct, features),
    [state, buildingType, projectType, units, tdc, affordablePct, features],
  );

  const canCalculate = state && buildingType;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20 shrink-0">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-sora text-slate-900 dark:text-white">
              Eligibility Calculator
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Estimate which incentive programs your project may qualify for
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Programs Tracked', value: '30,007+' },
          { label: 'States Covered', value: '50' },
          { label: 'Real-time Scoring', value: 'Live' },
        ].map((stat) => (
          <Card key={stat.label} className="card-v41">
            <CardContent className="flex flex-col items-center justify-center py-4">
              <p className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input Steps */}
        <div className="lg:col-span-3 space-y-4">

          {/* Step 1: Location */}
          <Card className="card-v41">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  1
                </div>
                <CardTitle className="font-sora text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-teal-500" />
                  Project Location
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm text-slate-600 dark:text-slate-400">
                  State <span className="text-teal-500">*</span>
                </Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger id="state" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Select state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipality" className="text-sm text-slate-600 dark:text-slate-400">
                  Municipality / City
                </Label>
                <Input
                  id="municipality"
                  placeholder="e.g. New York City"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Project Type */}
          <Card className="card-v41">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  2
                </div>
                <CardTitle className="font-sora text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-teal-500" />
                  Project Type
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-600 dark:text-slate-400">
                  Building Type <span className="text-teal-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {BUILDING_TYPES.map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => setBuildingType(bt.value)}
                      className={`rounded-lg border px-3 py-2 text-sm text-left transition-all ${
                        buildingType === bt.value
                          ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-700'
                      }`}
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-slate-600 dark:text-slate-400">Project Activity</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'new', label: 'New Construction' },
                    { value: 'rehab', label: 'Rehabilitation' },
                    { value: 'acquisition', label: 'Acquisition' },
                  ].map((pt) => (
                    <button
                      key={pt.value}
                      onClick={() => setProjectType(pt.value)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-all ${
                        projectType === pt.value
                          ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-medium'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-700'
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Project Scale */}
          <Card className="card-v41">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  3
                </div>
                <CardTitle className="font-sora text-base flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-teal-500" />
                  Project Scale
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="units" className="text-sm text-slate-600 dark:text-slate-400">
                    Total Units
                  </Label>
                  <Input
                    id="units"
                    type="number"
                    value={units}
                    onChange={(e) => setUnits(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tdc" className="text-sm text-slate-600 dark:text-slate-400">
                    Total Dev. Cost (TDC)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <Input
                      id="tdc"
                      type="number"
                      value={tdc}
                      onChange={(e) => setTdc(Math.max(0, parseInt(e.target.value) || 0))}
                      className="pl-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <p className="text-xs text-slate-400">{(tdc / 1_000_000).toFixed(1)}M</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-slate-600 dark:text-slate-400">
                    Affordable Units (% of total)
                  </Label>
                  <span className="font-mono text-sm font-bold text-teal-600 dark:text-teal-400">
                    {affordablePct}%
                  </span>
                </div>
                <Slider
                  value={[affordablePct]}
                  onValueChange={([v]) => setAffordablePct(v)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>0%</span>
                  <span className="text-teal-500">20% threshold</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Features */}
          <Card className="card-v41">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  4
                </div>
                <CardTitle className="font-sora text-base flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-teal-500" />
                  Project Features
                </CardTitle>
              </div>
              <CardDescription>Each feature unlocks additional eligibility pathways</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  const checked = features.includes(feature.id);
                  return (
                    <label
                      key={feature.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                        checked
                          ? 'border-teal-500 bg-teal-500/5'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
                      }`}
                    >
                      <Checkbox
                        id={feature.id}
                        checked={checked}
                        onCheckedChange={() => toggleFeature(feature.id)}
                        className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                      />
                      <Icon className={`h-4 w-4 shrink-0 ${checked ? 'text-teal-500' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${checked ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300'}`}>
                          {feature.label}
                        </p>
                      </div>
                      {checked && (
                        <Badge className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 text-xs shrink-0">
                          +{feature.bonus}
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 h-12 text-base font-semibold shadow-lg shadow-teal-500/20"
            onClick={() => setShowResults(true)}
            disabled={!canCalculate}
          >
            <Calculator className="mr-2 h-5 w-5" />
            Estimate Eligibility
          </Button>
          {!canCalculate && (
            <p className="text-xs text-slate-400 text-center">Select a state and building type to continue</p>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4">
          {showResults ? (
            <>
              {/* Big Number */}
              <Card className="card-v41 border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-transparent dark:from-teal-900/10">
                <CardContent className="pt-6 pb-4 text-center space-y-1">
                  <p className="text-5xl font-bold font-mono text-teal-600 dark:text-teal-400">
                    {results.programCount}
                  </p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Programs Likely Eligible
                  </p>
                  <Badge className="bg-teal-500/10 text-teal-600 border-teal-500/20 mt-2">
                    Based on your inputs
                  </Badge>
                </CardContent>
              </Card>

              {/* Value Range */}
              <Card className="card-v41">
                <CardHeader className="pb-2">
                  <CardTitle className="font-sora text-sm text-slate-500 dark:text-slate-400">
                    Estimated Incentive Value Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ${results.valueLow.toFixed(1)}M
                    </span>
                    <span className="text-slate-400">—</span>
                    <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ${results.valueHigh.toFixed(1)}M
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Estimate based on TDC of ${(tdc / 1_000_000).toFixed(1)}M
                  </p>
                </CardContent>
              </Card>

              {/* Program Category Previews */}
              <Card className="card-v41">
                <CardHeader className="pb-2">
                  <CardTitle className="font-sora text-sm text-slate-500 dark:text-slate-400">
                    Top Program Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.previews.map((preview) => (
                    <div key={preview.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                          {preview.name}
                        </p>
                        <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 shrink-0">
                          {Math.round(preview.confidence * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={preview.confidence * 100}
                        className="h-1.5"
                      />
                      <Badge className="bg-teal-500/10 text-teal-600 border-teal-500/20 text-xs">
                        {preview.category}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* CTA */}
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 h-11"
                asChild
              >
                <Link href="/analysis">
                  Run Full Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-slate-400 text-center">
                Full analysis uses AI matching against all 30,007+ programs
              </p>
            </>
          ) : (
            <Card className="card-v41 h-80 flex items-center justify-center">
              <CardContent className="text-center space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 mx-auto">
                  <Calculator className="h-8 w-8 text-teal-500" />
                </div>
                <p className="font-medium text-slate-700 dark:text-slate-300 font-sora">
                  Fill in your project details
                </p>
                <p className="text-sm text-slate-400">
                  Complete steps 1–4 and click Estimate Eligibility to see results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
