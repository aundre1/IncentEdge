'use client';

import { useState, useMemo } from 'react';
import {
  BarChart3,
  Building2,
  MapPin,
  Ruler,
  Layers,
  TrendingUp,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProjectType = 'new' | 'rehab' | 'acquisition-rehab';
type BuildingType = 'multifamily' | 'commercial' | 'mixed-use' | 'industrial';
type LocationType = 'urban' | 'suburban' | 'rural';
type QualityTier = 'standard' | 'above-standard' | 'luxury';

interface CostResults {
  hardCostLow: number;
  hardCostHigh: number;
  softCostLow: number;
  softCostHigh: number;
  landCostLow: number;
  landCostHigh: number;
  tdcLow: number;
  tdcHigh: number;
  incentiveLow: number;
  incentiveHigh: number;
  incentivePctLow: number;
  incentivePctHigh: number;
}

// ---------------------------------------------------------------------------
// Cost calculation engine
// ---------------------------------------------------------------------------

const BASE_HARD_COSTS: Record<BuildingType, { low: number; high: number }> = {
  multifamily: { low: 250, high: 400 },
  commercial: { low: 200, high: 350 },
  'mixed-use': { low: 275, high: 425 },
  industrial: { low: 120, high: 220 },
};

const REHAB_FACTOR = { low: 0.6, high: 0.8 };
const ACQUISITION_REHAB_FACTOR = { low: 0.65, high: 0.85 };

const LOCATION_MULTIPLIER: Record<LocationType, number> = {
  urban: 1.3,
  suburban: 1.0,
  rural: 0.8,
};

const QUALITY_MULTIPLIER: Record<QualityTier, { low: number; high: number }> = {
  standard: { low: 1.0, high: 1.0 },
  'above-standard': { low: 1.15, high: 1.25 },
  luxury: { low: 1.4, high: 1.6 },
};

const SOFT_COST_RATIO = { low: 0.18, high: 0.28 };
const LAND_COST_RATIO: Record<LocationType, { low: number; high: number }> = {
  urban: { low: 0.15, high: 0.30 },
  suburban: { low: 0.08, high: 0.18 },
  rural: { low: 0.03, high: 0.08 },
};

const FEATURE_INCENTIVE_BOOST: Record<string, number> = {
  solar: 0.04,
  ev_charging: 0.02,
  green_roof: 0.03,
  smart_building: 0.02,
  affordable_units: 0.10,
};

function calculateCosts(
  projectType: ProjectType,
  buildingType: BuildingType,
  location: LocationType,
  sqft: number,
  quality: QualityTier,
  features: string[],
): CostResults {
  if (sqft === 0) {
    return { hardCostLow: 0, hardCostHigh: 0, softCostLow: 0, softCostHigh: 0, landCostLow: 0, landCostHigh: 0, tdcLow: 0, tdcHigh: 0, incentiveLow: 0, incentiveHigh: 0, incentivePctLow: 0, incentivePctHigh: 0 };
  }

  const base = BASE_HARD_COSTS[buildingType] || { low: 200, high: 350 };
  const locMult = LOCATION_MULTIPLIER[location];
  const qualMult = QUALITY_MULTIPLIER[quality];

  let rehabFactor = { low: 1.0, high: 1.0 };
  if (projectType === 'rehab') rehabFactor = REHAB_FACTOR;
  if (projectType === 'acquisition-rehab') rehabFactor = ACQUISITION_REHAB_FACTOR;

  const hardLow = base.low * locMult * qualMult.low * rehabFactor.low * sqft;
  const hardHigh = base.high * locMult * qualMult.high * rehabFactor.high * sqft;

  const softLow = hardLow * SOFT_COST_RATIO.low;
  const softHigh = hardHigh * SOFT_COST_RATIO.high;

  const landRatio = LAND_COST_RATIO[location];
  const landLow = (hardLow + softLow) * landRatio.low;
  const landHigh = (hardHigh + softHigh) * landRatio.high;

  const tdcLow = hardLow + softLow + landLow;
  const tdcHigh = hardHigh + softHigh + landHigh;

  let incentivePctLow = 0.15;
  let incentivePctHigh = 0.25;

  features.forEach((f) => {
    const boost = FEATURE_INCENTIVE_BOOST[f] ?? 0;
    incentivePctLow += boost * 0.5;
    incentivePctHigh += boost;
  });

  const incentiveLow = tdcLow * Math.min(incentivePctLow, 0.50);
  const incentiveHigh = tdcHigh * Math.min(incentivePctHigh, 0.60);

  return {
    hardCostLow: hardLow,
    hardCostHigh: hardHigh,
    softCostLow: softLow,
    softCostHigh: softHigh,
    landCostLow: landLow,
    landCostHigh: landHigh,
    tdcLow,
    tdcHigh,
    incentiveLow,
    incentiveHigh,
    incentivePctLow: Math.min(incentivePctLow * 100, 50),
    incentivePctHigh: Math.min(incentivePctHigh * 100, 60),
  };
}

function fmt(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${Math.round(val)}`;
}

// ---------------------------------------------------------------------------
// States constant
// ---------------------------------------------------------------------------
const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

const FEATURES = [
  { id: 'solar', label: 'Solar Panels / PV System' },
  { id: 'ev_charging', label: 'EV Charging Stations' },
  { id: 'green_roof', label: 'Green / Living Roof' },
  { id: 'smart_building', label: 'Smart Building Automation' },
  { id: 'affordable_units', label: 'Affordable / Income-Restricted Units' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CostEstimatorPage() {
  const [projectType, setProjectType] = useState<ProjectType>('new');
  const [buildingType, setBuildingType] = useState<BuildingType>('multifamily');
  const [state, setState] = useState('');
  const [location, setLocation] = useState<LocationType>('urban');
  const [units, setUnits] = useState(50);
  const [sqft, setSqft] = useState(50000);
  const [quality, setQuality] = useState<QualityTier>('standard');
  const [features, setFeatures] = useState<string[]>([]);

  const toggleFeature = (id: string) => {
    setFeatures((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);
  };

  const results = useMemo(
    () => calculateCosts(projectType, buildingType, location, sqft, quality, features),
    [projectType, buildingType, location, sqft, quality, features],
  );

  const hasResults = results.tdcHigh > 0;

  const costBreakdown = hasResults ? [
    { label: 'Hard Costs', low: results.hardCostLow, high: results.hardCostHigh, pct: (results.hardCostHigh / results.tdcHigh) * 100, color: 'bg-blue-500' },
    { label: 'Soft Costs', low: results.softCostLow, high: results.softCostHigh, pct: (results.softCostHigh / results.tdcHigh) * 100, color: 'bg-teal-500' },
    { label: 'Land / Acquisition', low: results.landCostLow, high: results.landCostHigh, pct: (results.landCostHigh / results.tdcHigh) * 100, color: 'bg-emerald-500' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20 shrink-0">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora text-slate-900 dark:text-white">
            Cost Estimator
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Estimate total development costs and incentive capture potential in real-time
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input Panel */}
        <div className="lg:col-span-3 space-y-4">

          {/* Project Type */}
          <Card className="card-v41">
            <CardHeader className="pb-3">
              <CardTitle className="font-sora text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-500" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-slate-600 dark:text-slate-400">Project Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'new', label: 'New Construction' },
                    { value: 'rehab', label: 'Rehabilitation' },
                    { value: 'acquisition-rehab', label: 'Acq. + Rehab' },
                  ].map((pt) => (
                    <button
                      key={pt.value}
                      onClick={() => setProjectType(pt.value as ProjectType)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium text-center transition-all ${
                        projectType === pt.value
                          ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300'
                      }`}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-600 dark:text-slate-400">Building Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'multifamily', label: 'Multifamily' },
                    { value: 'commercial', label: 'Commercial' },
                    { value: 'mixed-use', label: 'Mixed-Use' },
                    { value: 'industrial', label: 'Industrial' },
                  ].map((bt) => (
                    <button
                      key={bt.value}
                      onClick={() => setBuildingType(bt.value as BuildingType)}
                      className={`rounded-lg border px-3 py-2 text-sm text-center transition-all ${
                        buildingType === bt.value
                          ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300'
                      }`}
                    >
                      {bt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="card-v41">
            <CardHeader className="pb-3">
              <CardTitle className="font-sora text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal-500" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600 dark:text-slate-400">State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Select state..." />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-slate-600 dark:text-slate-400">Market Area</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['urban', 'suburban', 'rural'] as LocationType[]).map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setLocation(loc)}
                        className={`rounded-lg border px-2 py-2 text-xs capitalize text-center transition-all ${
                          location === loc
                            ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Size & Quality */}
          <Card className="card-v41">
            <CardHeader className="pb-3">
              <CardTitle className="font-sora text-base flex items-center gap-2">
                <Ruler className="h-4 w-4 text-teal-500" />
                Size & Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="units" className="text-sm text-slate-600 dark:text-slate-400">
                    Total Units (residential)
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
                  <Label htmlFor="sqft" className="text-sm text-slate-600 dark:text-slate-400">
                    Total Square Footage
                  </Label>
                  <Input
                    id="sqft"
                    type="number"
                    value={sqft}
                    onChange={(e) => setSqft(Math.max(1000, parseInt(e.target.value) || 1000))}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-slate-600 dark:text-slate-400">Quality Tier</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'standard', label: 'Standard' },
                    { value: 'above-standard', label: 'Above Standard' },
                    { value: 'luxury', label: 'Luxury' },
                  ].map((qt) => (
                    <button
                      key={qt.value}
                      onClick={() => setQuality(qt.value as QualityTier)}
                      className={`rounded-lg border px-3 py-2 text-xs text-center transition-all ${
                        quality === qt.value
                          ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-teal-300'
                      }`}
                    >
                      {qt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Features */}
          <Card className="card-v41">
            <CardHeader className="pb-3">
              <CardTitle className="font-sora text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-500" />
                Special Features
              </CardTitle>
              <CardDescription>Each feature increases your incentive capture potential</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {FEATURES.map((feature) => (
                  <label
                    key={feature.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                      features.includes(feature.id)
                        ? 'border-teal-500 bg-teal-500/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'
                    }`}
                  >
                    <Checkbox
                      id={feature.id}
                      checked={features.includes(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                      className="data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                    />
                    <span className={`text-sm ${features.includes(feature.id) ? 'text-teal-700 dark:text-teal-300 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                      {feature.label}
                    </span>
                    {features.includes(feature.id) && (
                      <Badge className="ml-auto bg-teal-500/10 text-teal-600 border-teal-500/20 text-xs">
                        +{Math.round((FEATURE_INCENTIVE_BOOST[feature.id] ?? 0) * 100)}% incentive
                      </Badge>
                    )}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-6 lg:self-start">

          {/* TDC */}
          <Card className="card-v41 border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="font-sora text-sm text-slate-500 dark:text-slate-400">
                Estimated TDC Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasResults ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
                      {fmt(results.tdcLow)}
                    </span>
                    <span className="text-slate-400">—</span>
                    <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400">
                      {fmt(results.tdcHigh)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Total development cost estimate</p>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Enter project details to see estimates</p>
              )}
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          {hasResults && (
            <Card className="card-v41">
              <CardHeader className="pb-2">
                <CardTitle className="font-sora text-sm text-slate-500 dark:text-slate-400">
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {costBreakdown.map(({ label, low, high, pct, color }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{label}</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                        {fmt(low)} — {fmt(high)}
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <p className="text-xs text-slate-400 text-right font-mono">{Math.round(pct)}% of TDC</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Incentive Potential */}
          {hasResults && (
            <Card className="card-v41 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="font-sora text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Incentive Capture Potential
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {fmt(results.incentiveLow)}
                  </span>
                  <span className="text-slate-400">—</span>
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {fmt(results.incentiveHigh)}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono">
                    {results.incentivePctLow.toFixed(0)}%–{results.incentivePctHigh.toFixed(0)}% of TDC
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Incentive capture rate</span>
                    <span className="font-mono">{results.incentivePctHigh.toFixed(0)}%</span>
                  </div>
                  <Progress value={results.incentivePctHigh} max={60} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <Card className="card-v41 border-slate-200 dark:border-slate-700">
            <CardContent className="flex gap-2 pt-4">
              <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">
                Estimates are based on national averages and publicly available cost data. Actual costs vary significantly by market, contractor, and site conditions. These figures are for planning purposes only and should not be used for financing applications without professional appraisal.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

