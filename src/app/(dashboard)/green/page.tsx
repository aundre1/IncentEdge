'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Leaf,
  Sun,
  Wind,
  Zap,
  Battery,
  Thermometer,
  Building2,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Loader2,
  CheckCircle2,
  ArrowUpRight,
  Bookmark,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { createClient } from '@/lib/supabase/client';

// ============================================================================
// GREEN INCENTIVE TYPES
// ============================================================================

interface GreenIncentive {
  id: string | number;
  name: string;
  title?: string;
  description?: string;
  agency?: string;
  category: string;
  type: 'ira' | 'state' | 'utility' | 'local';
  technology?: string;
  maxValue?: number;
  baseRate?: number;
  bonuses?: { name: string; rate: number; description: string }[];
  eligibility?: string[];
  state?: string;
  deadline?: string;
  status?: string;
}

interface TechnologyCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  iraRate: string;
  programs: number;
  totalValue: number;
}

// ============================================================================
// IRA CREDITS DATA
// ============================================================================

const IRA_CREDITS = [
  {
    id: 'itc-48',
    name: 'Investment Tax Credit (ITC)',
    section: 'Section 48',
    baseRate: 0.30,
    description: 'Tax credit for solar, storage, geothermal, and other clean energy equipment',
    technologies: ['Solar PV', 'Battery Storage', 'Geothermal', 'Fuel Cells', 'Small Wind'],
    bonuses: [
      { name: 'Domestic Content', rate: 0.10, description: 'US-manufactured components' },
      { name: 'Energy Community', rate: 0.10, description: 'Located in brownfield or coal community' },
      { name: 'Low-Income', rate: 0.10, description: 'Serves low-income communities' },
      { name: 'Prevailing Wage', rate: 0.30, description: 'Apprenticeship + wage requirements (required for 30% base)' },
    ],
  },
  {
    id: 'ptc-45',
    name: 'Production Tax Credit (PTC)',
    section: 'Section 45',
    baseRate: 0.027, // per kWh
    description: 'Tax credit for electricity production from qualified clean energy facilities',
    technologies: ['Wind', 'Geothermal', 'Solar', 'Hydro', 'Marine'],
    bonuses: [
      { name: 'Domestic Content', rate: 0.003, description: 'US-manufactured components' },
      { name: 'Energy Community', rate: 0.003, description: 'Located in brownfield or coal community' },
    ],
  },
  {
    id: '45l',
    name: 'Energy Efficient Home Credit',
    section: 'Section 45L',
    baseRate: 2500,
    isFixed: true,
    description: 'Credit for energy efficient new homes meeting ENERGY STAR standards',
    technologies: ['Multifamily', 'Single Family', 'Manufactured Housing'],
    tiers: [
      { name: 'ENERGY STAR', value: 2500 },
      { name: 'Zero Energy Ready', value: 5000 },
    ],
  },
  {
    id: '179d',
    name: 'Energy Efficient Commercial Buildings',
    section: 'Section 179D',
    baseRate: 5.00, // per sqft
    description: 'Deduction for energy efficient commercial and multifamily buildings',
    technologies: ['Envelope', 'HVAC', 'Lighting', 'Whole Building'],
    maxDeduction: '$5.00/sqft',
  },
  {
    id: 'elap',
    name: 'Low-Income Housing ITC',
    section: 'LIHTC/IRA Integration',
    baseRate: 0.30,
    description: 'Enhanced ITC for affordable housing projects with clean energy',
    technologies: ['Solar + Affordable', 'Storage + Affordable', 'EV Charging + Affordable'],
    bonuses: [
      { name: 'Affordable Housing', rate: 0.20, description: 'Additional 20% for qualified affordable housing' },
    ],
  },
];

const TECHNOLOGY_CATEGORIES: TechnologyCategory[] = [
  {
    id: 'solar',
    name: 'Solar PV',
    icon: <Sun className="w-5 h-5" />,
    description: 'Photovoltaic systems and solar installations',
    iraRate: '30-50% ITC',
    programs: 847,
    totalValue: 125000000000,
  },
  {
    id: 'storage',
    name: 'Battery Storage',
    icon: <Battery className="w-5 h-5" />,
    description: 'Energy storage systems and batteries',
    iraRate: '30-50% ITC',
    programs: 312,
    totalValue: 45000000000,
  },
  {
    id: 'wind',
    name: 'Wind Energy',
    icon: <Wind className="w-5 h-5" />,
    description: 'Small and large wind turbines',
    iraRate: '2.75¢/kWh PTC',
    programs: 156,
    totalValue: 89000000000,
  },
  {
    id: 'geothermal',
    name: 'Geothermal',
    icon: <Thermometer className="w-5 h-5" />,
    description: 'Ground source heat pumps and geothermal systems',
    iraRate: '30% ITC',
    programs: 234,
    totalValue: 12000000000,
  },
  {
    id: 'ev',
    name: 'EV Infrastructure',
    icon: <Zap className="w-5 h-5" />,
    description: 'Electric vehicle charging stations',
    iraRate: '30% credit',
    programs: 567,
    totalValue: 7500000000,
  },
  {
    id: 'efficiency',
    name: 'Energy Efficiency',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Building envelope, HVAC, and efficiency upgrades',
    iraRate: '$5/sqft 179D',
    programs: 1245,
    totalValue: 34000000000,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

// ============================================================================
// IRA CREDIT CALCULATOR CARD
// ============================================================================

function IRACreditCalculator() {
  const [systemCost, setSystemCost] = useState(5000000);
  const [bonuses, setBonuses] = useState<string[]>(['prevailing']);

  const calculation = useMemo(() => {
    let baseRate = 0.06; // 6% without prevailing wage
    if (bonuses.includes('prevailing')) {
      baseRate = 0.30; // 30% with prevailing wage
    }

    let totalRate = baseRate;
    if (bonuses.includes('domestic')) totalRate += 0.10;
    if (bonuses.includes('energy_community')) totalRate += 0.10;
    if (bonuses.includes('low_income')) totalRate += 0.10;

    const creditValue = systemCost * totalRate;

    return {
      baseRate,
      totalRate,
      creditValue,
      bonusBreakdown: [
        { name: 'Base Rate', rate: baseRate, value: systemCost * baseRate },
        ...(bonuses.includes('domestic') ? [{ name: 'Domestic Content', rate: 0.10, value: systemCost * 0.10 }] : []),
        ...(bonuses.includes('energy_community') ? [{ name: 'Energy Community', rate: 0.10, value: systemCost * 0.10 }] : []),
        ...(bonuses.includes('low_income') ? [{ name: 'Low-Income', rate: 0.10, value: systemCost * 0.10 }] : []),
      ],
    };
  }, [systemCost, bonuses]);

  const toggleBonus = (bonus: string) => {
    setBonuses(prev =>
      prev.includes(bonus)
        ? prev.filter(b => b !== bonus)
        : [...prev, bonus]
    );
  };

  return (
    <Card className="card-v41">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="font-sora">IRA ITC Calculator</CardTitle>
            <CardDescription>Estimate your Investment Tax Credit</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Cost Input */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Clean Energy System Cost
          </label>
          <div className="relative mt-2">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="number"
              value={systemCost}
              onChange={(e) => setSystemCost(Number(e.target.value))}
              className="pl-8 font-mono"
            />
          </div>
        </div>

        {/* Bonus Toggles */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            IRA Bonus Credits
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={bonuses.includes('prevailing') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleBonus('prevailing')}
              className={bonuses.includes('prevailing') ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Prevailing Wage (30%)
            </Button>
            <Button
              variant={bonuses.includes('domestic') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleBonus('domestic')}
              className={bonuses.includes('domestic') ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Domestic Content (+10%)
            </Button>
            <Button
              variant={bonuses.includes('energy_community') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleBonus('energy_community')}
              className={bonuses.includes('energy_community') ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              Energy Community (+10%)
            </Button>
            <Button
              variant={bonuses.includes('low_income') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleBonus('low_income')}
              className={bonuses.includes('low_income') ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Low-Income (+10%)
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="pt-4 border-t border-slate-200 dark:border-navy-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-500">Total Credit Rate</span>
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {formatPercent(calculation.totalRate)}
            </span>
          </div>

          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg p-4 border border-emerald-500/20">
            <p className="text-sm text-slate-500 mb-1">Estimated Tax Credit</p>
            <p className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(calculation.creditValue)}
            </p>
          </div>

          {/* Breakdown */}
          <div className="mt-4 space-y-2">
            {calculation.bonusBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{formatPercent(item.rate)}</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function GreenIncentivesPage() {
  const [incentives, setIncentives] = useState<GreenIncentive[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadGreenIncentives();
  }, []);

  async function loadGreenIncentives() {
    setLoading(true);
    const supabase = createClient();

    try {
      // Load incentives with green/clean energy keywords
      const { data, error } = await supabase
        .from('incentive_awards')
        .select('*')
        .or('title.ilike.%solar%,title.ilike.%energy%,title.ilike.%clean%,title.ilike.%renewable%,title.ilike.%ev%,title.ilike.%electric%,title.ilike.%efficiency%,title.ilike.%green%,title.ilike.%geothermal%,title.ilike.%wind%,title.ilike.%battery%')
        .limit(100);

      if (!error && data) {
        const mapped = data.map(item => ({
          id: item.id,
          name: item.title || item.name,
          description: item.description,
          agency: item.agency,
          category: item.category,
          type: item.source === 'Federal' ? 'ira' as const :
                item.source === 'Utility' ? 'utility' as const :
                item.source === 'Local' ? 'local' as const : 'state' as const,
          maxValue: item.funding_amount,
          state: item.state,
          status: 'active',
        }));
        setIncentives(mapped);
      }
    } catch (err) {
      console.error('Error loading green incentives:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredIncentives = useMemo(() => {
    return incentives.filter(inc => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!inc.name?.toLowerCase().includes(query) &&
            !inc.agency?.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (selectedTechnology !== 'all') {
        const tech = selectedTechnology.toLowerCase();
        if (!inc.name?.toLowerCase().includes(tech)) {
          return false;
        }
      }
      return true;
    });
  }, [incentives, searchQuery, selectedTechnology]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sora">
                Green Incentives
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                IRA tax credits, clean energy rebates & sustainability programs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-lg px-4 py-2">
            <TrendingUp className="w-4 h-4 mr-2" />
            $369B IRA Funding
          </Badge>
        </div>
      </div>

      {/* Technology Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {TECHNOLOGY_CATEGORIES.map((tech) => (
          <Card
            key={tech.id}
            className={`card-v41 cursor-pointer transition-all hover:border-emerald-500/50 ${
              selectedTechnology === tech.id ? 'border-emerald-500 bg-emerald-500/5' : ''
            }`}
            onClick={() => setSelectedTechnology(selectedTechnology === tech.id ? 'all' : tech.id)}
          >
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                {tech.icon}
              </div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                {tech.name}
              </h3>
              <p className="text-xs text-emerald-600 font-mono mt-1">
                {tech.iraRate}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {tech.programs} programs
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 dark:bg-navy-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ira">IRA Credits</TabsTrigger>
          <TabsTrigger value="programs">All Programs</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* IRA Summary */}
            <Card className="card-v41 lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-sora">Inflation Reduction Act (IRA)</CardTitle>
                <CardDescription>
                  Largest climate investment in US history - $369 billion in clean energy incentives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {IRA_CREDITS.slice(0, 3).map((credit) => (
                  <div
                    key={credit.id}
                    className="flex items-start justify-between p-4 rounded-lg bg-slate-50 dark:bg-navy-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          {credit.section}
                        </Badge>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {credit.name}
                        </h4>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 max-w-lg">
                        {credit.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {credit.technologies.slice(0, 4).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono text-emerald-600">
                        {credit.isFixed ? formatCurrency(credit.baseRate) : formatPercent(credit.baseRate)}
                      </p>
                      <p className="text-xs text-slate-500">base rate</p>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full" onClick={() => setActiveTab('ira')}>
                  View All IRA Credits
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-4">
              <Card className="card-v41 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                <CardContent className="p-6 text-center">
                  <Leaf className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold font-mono text-emerald-600">
                    {filteredIncentives.length}
                  </p>
                  <p className="text-sm text-slate-500">Green Programs Found</p>
                </CardContent>
              </Card>

              <Card className="card-v41">
                <CardContent className="p-6 text-center">
                  <Sun className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                    30-50%
                  </p>
                  <p className="text-sm text-slate-500">ITC with Bonuses</p>
                </CardContent>
              </Card>

              <Card className="card-v41">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                    $5/sqft
                  </p>
                  <p className="text-sm text-slate-500">Max 179D Deduction</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* IRA Credits Tab */}
        <TabsContent value="ira" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {IRA_CREDITS.map((credit) => (
              <Card key={credit.id} className="card-v41">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 mb-2">
                        {credit.section}
                      </Badge>
                      <CardTitle className="font-sora">{credit.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {credit.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold font-mono text-emerald-600">
                        {credit.isFixed ? formatCurrency(credit.baseRate) : formatPercent(credit.baseRate)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {credit.isFixed ? 'per unit' : 'base rate'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Technologies */}
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Eligible Technologies</p>
                    <div className="flex flex-wrap gap-1">
                      {credit.technologies.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Bonuses */}
                  {credit.bonuses && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Available Bonuses</p>
                      <div className="space-y-2">
                        {credit.bonuses.map((bonus) => (
                          <div
                            key={bonus.name}
                            className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-navy-800"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {bonus.name}
                              </p>
                              <p className="text-xs text-slate-500">{bonus.description}</p>
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              +{credit.isFixed ? formatCurrency(bonus.rate) : formatPercent(bonus.rate)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tiers */}
                  {credit.tiers && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Credit Tiers</p>
                      <div className="space-y-2">
                        {credit.tiers.map((tier) => (
                          <div
                            key={tier.name}
                            className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-navy-800"
                          >
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {tier.name}
                            </p>
                            <span className="font-mono font-semibold text-emerald-600">
                              {formatCurrency(tier.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* All Programs Tab */}
        <TabsContent value="programs" className="space-y-4">
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search green incentives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedTechnology} onValueChange={setSelectedTechnology}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Technology" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technologies</SelectItem>
                {TECHNOLOGY_CATEGORIES.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredIncentives.length === 0 ? (
            <Card className="card-v41">
              <CardContent className="flex flex-col items-center py-12">
                <Leaf className="w-12 h-12 text-slate-300" />
                <h3 className="mt-4 text-lg font-semibold">No programs found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredIncentives.map((incentive) => (
                <Card key={incentive.id} className="card-v41 hover:border-emerald-500/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={
                            incentive.type === 'ira' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            incentive.type === 'state' ? 'badge-state' :
                            incentive.type === 'utility' ? 'badge-utility' :
                            'badge-local'
                          }>
                            {incentive.type === 'ira' ? 'IRA/Federal' :
                             incentive.type.charAt(0).toUpperCase() + incentive.type.slice(1)}
                          </Badge>
                          {incentive.state && (
                            <Badge variant="outline">{incentive.state}</Badge>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {incentive.name}
                        </h4>
                        {incentive.agency && (
                          <p className="text-sm text-slate-500">{incentive.agency}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {incentive.maxValue && (
                          <>
                            <p className="text-xl font-bold font-mono text-emerald-600">
                              {formatCurrency(incentive.maxValue)}
                            </p>
                            <p className="text-xs text-slate-500">max funding</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end mt-3">
                      <Link href={`/discover/${incentive.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                          <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <IRACreditCalculator />

            <Card className="card-v41">
              <CardHeader>
                <CardTitle className="font-sora">IRA Bonus Stacking</CardTitle>
                <CardDescription>
                  Maximize your tax credits by qualifying for multiple bonus adders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Prevailing Wage & Apprenticeship
                      </h4>
                    </div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-300">
                      Required for the full 30% ITC base rate. Projects over 1 MW must meet these requirements.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                        Domestic Content (+10%)
                      </h4>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Use US-manufactured steel, iron, and manufactured products to qualify for additional 10% credit.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                        Energy Community (+10%)
                      </h4>
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-300">
                      Located in brownfield site, coal closure area, or census tract with fossil fuel employment.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-700 dark:text-purple-400">
                        Low-Income Community (+10-20%)
                      </h4>
                    </div>
                    <p className="text-sm text-purple-600 dark:text-purple-300">
                      Projects serving low-income communities or on Indian land can receive additional 10-20% bonus.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-navy-700">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Info className="w-4 h-4" />
                    <p>Maximum combined ITC rate with all bonuses: <span className="font-bold text-emerald-600">50%</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
