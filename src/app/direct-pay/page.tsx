'use client';

import * as React from 'react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DirectPayBadge } from '@/components/DirectPayBadge';
import {
  checkDirectPayEligibility,
  estimateDirectPayValue,
  getDirectPayRegistrationInfo,
  type EntityType,
  type DirectPayEntity,
  type EligibleCreditSection,
} from '@/lib/direct-pay-checker';
import { formatCurrency, formatCompactCurrency, cn } from '@/lib/utils';
import {
  Zap,
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Calendar,
  ExternalLink,
  DollarSign,
  Percent,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Sun,
  Wind,
  Battery,
  Flame,
} from 'lucide-react';

// US States for dropdown
const US_STATES = [
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
  { value: 'DC', label: 'District of Columbia' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'VI', label: 'U.S. Virgin Islands' },
  { value: 'GU', label: 'Guam' },
];

// Entity types for Direct Pay
const ENTITY_TYPES: { value: EntityType; label: string; description: string }[] = [
  { value: 'nonprofit', label: '501(c)(3) Nonprofit', description: 'Tax-exempt charitable organizations' },
  { value: 'municipal', label: 'Municipal Government', description: 'City, county, or local government entities' },
  { value: 'state', label: 'State Government', description: 'State agencies and authorities' },
  { value: 'tribal', label: 'Tribal Government', description: 'Indian tribal governments and entities' },
  { value: 'rural-electric-coop', label: 'Rural Electric Cooperative', description: 'Member-owned electric utilities' },
  { value: 'for-profit', label: 'For-Profit Entity', description: 'Taxable business entities' },
  { value: 'other', label: 'Other Organization', description: 'Other entity types' },
];

// Project types
const PROJECT_TYPES: { value: string; label: string; creditSection: EligibleCreditSection; icon: React.ElementType }[] = [
  { value: 'solar', label: 'Solar PV', creditSection: '48', icon: Sun },
  { value: 'wind', label: 'Wind Energy', creditSection: '45', icon: Wind },
  { value: 'storage', label: 'Battery Storage', creditSection: '48E', icon: Battery },
  { value: 'geothermal', label: 'Geothermal', creditSection: '48', icon: Flame },
  { value: 'ev-charging', label: 'EV Charging Infrastructure', creditSection: '30C', icon: Zap },
  { value: 'clean-vehicles', label: 'Commercial Clean Vehicles', creditSection: '45W', icon: Building2 },
];

// Bonus eligibility options
interface BonusOptions {
  domesticContent: boolean;
  energyCommunity: boolean;
  lowIncomeCommunity: boolean;
  lowIncomeResidential: boolean;
  prevailingWage: boolean;
  apprenticeship: boolean;
}

export default function DirectPayCalculatorPage() {
  // Form state
  const [entityType, setEntityType] = useState<EntityType | ''>('');
  const [projectType, setProjectType] = useState<string>('');
  const [projectCost, setProjectCost] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [bonusOptions, setBonusOptions] = useState<BonusOptions>({
    domesticContent: false,
    energyCommunity: false,
    lowIncomeCommunity: false,
    lowIncomeResidential: false,
    prevailingWage: true,
    apprenticeship: true,
  });
  const [showBonusDetails, setShowBonusDetails] = useState(false);

  // Calculate eligibility
  const eligibilityResult = useMemo(() => {
    if (!entityType) return null;

    const entity: DirectPayEntity = {
      type: entityType as EntityType,
      taxStatus: entityType === 'nonprofit' ? 'tax-exempt' :
                 entityType === 'municipal' || entityType === 'state' ? 'municipal' :
                 entityType === 'tribal' ? 'tribal' : 'for-profit',
      isRuralElectricCoop: entityType === 'rural-electric-coop',
    };

    return checkDirectPayEligibility(entity);
  }, [entityType]);

  // Calculate estimated value
  const valueEstimate = useMemo(() => {
    if (!eligibilityResult?.eligible || !projectCost || !projectType) return null;

    const cost = parseFloat(projectCost.replace(/[^0-9.]/g, ''));
    if (isNaN(cost) || cost <= 0) return null;

    const selectedProject = PROJECT_TYPES.find(p => p.value === projectType);
    if (!selectedProject) return null;

    return estimateDirectPayValue(selectedProject.creditSection, {
      totalInvestment: cost,
      meetsPrevailingWage: bonusOptions.prevailingWage,
      meetsApprenticeship: bonusOptions.apprenticeship,
      inEnergyCommunity: bonusOptions.energyCommunity,
      hasDomesticContent: bonusOptions.domesticContent,
    });
  }, [eligibilityResult, projectCost, projectType, bonusOptions]);

  // Calculate bonus breakdown
  const bonusBreakdown = useMemo(() => {
    const cost = parseFloat(projectCost.replace(/[^0-9.]/g, '')) || 0;
    if (cost <= 0) return null;

    const base = cost * 0.30;
    const bonuses: { label: string; rate: string; value: number; active: boolean }[] = [
      { label: 'Base ITC Credit', rate: '30%', value: base, active: true },
      { label: 'Domestic Content Bonus', rate: '+10%', value: cost * 0.10, active: bonusOptions.domesticContent },
      { label: 'Energy Community Bonus', rate: '+10%', value: cost * 0.10, active: bonusOptions.energyCommunity },
      { label: 'Low-Income Community Bonus', rate: '+10%', value: cost * 0.10, active: bonusOptions.lowIncomeCommunity },
      { label: 'Low-Income Residential Bonus', rate: '+20%', value: cost * 0.20, active: bonusOptions.lowIncomeResidential },
    ];

    const totalRate = 30 +
      (bonusOptions.domesticContent ? 10 : 0) +
      (bonusOptions.energyCommunity ? 10 : 0) +
      (bonusOptions.lowIncomeCommunity ? 10 : 0) +
      (bonusOptions.lowIncomeResidential ? 20 : 0);

    const totalValue = bonuses.filter(b => b.active).reduce((sum, b) => sum + b.value, 0);

    return { bonuses, totalRate, totalValue };
  }, [projectCost, bonusOptions]);

  const handleCheckEligibility = () => {
    setShowResults(true);
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleProjectCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      setProjectCost(parseInt(value).toLocaleString());
    } else {
      setProjectCost('');
    }
  };

  const registrationInfo = getDirectPayRegistrationInfo();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">IncentEdge</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-blue-50 to-white dark:from-emerald-950/20 dark:via-blue-950/20 dark:to-slate-950" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAyIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

          <div className="container relative px-4 py-20 md:py-28">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                IRA Section 6417 - Direct Pay
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Are You Eligible for{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Direct Pay Tax Credits?
                </span>
              </h1>

              <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto">
                Tax-exempt organizations can now receive ITC and PTC credits as{' '}
                <span className="font-semibold text-foreground">cash refunds</span>{' '}
                under IRA Section 6417. Check if your organization qualifies for up to{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">70% of project costs</span>{' '}
                back as direct payments from the IRS.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-lg px-8"
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Check Your Eligibility
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-lg" asChild>
                  <a href="#how-it-works">
                    Learn How It Works
                  </a>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { value: '$369B', label: 'IRA Clean Energy Investment', icon: DollarSign },
                  { value: '30-70%', label: 'Potential Credit Value', icon: Percent },
                  { value: '12+', label: 'Eligible Credit Types', icon: FileText },
                  { value: '2024-2032', label: 'Program Duration', icon: Calendar },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 shadow-sm">
                    <stat.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section id="calculator" className="container px-4 py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Direct Pay Eligibility Calculator</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Enter your organization and project details to instantly check eligibility
                and estimate your potential Direct Pay credit value.
              </p>
            </div>

            <Card className="border-2 border-emerald-200 dark:border-emerald-800 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/50 dark:to-blue-950/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  Organization & Project Information
                </CardTitle>
                <CardDescription>
                  All fields help us calculate your maximum potential credit
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                {/* Entity Type */}
                <div className="space-y-2">
                  <Label htmlFor="entity-type" className="text-base font-medium">
                    Organization Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={entityType} onValueChange={(value) => setEntityType(value as EntityType)}>
                    <SelectTrigger id="entity-type" className="h-12">
                      <SelectValue placeholder="Select your organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENTITY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{type.label}</span>
                            <span className="text-xs text-muted-foreground">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Type */}
                <div className="space-y-2">
                  <Label htmlFor="project-type" className="text-base font-medium">
                    Project Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger id="project-type" className="h-12">
                      <SelectValue placeholder="Select your clean energy project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4 text-emerald-600" />
                            <span>{type.label}</span>
                            <span className="text-xs text-muted-foreground">(Section {type.creditSection})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Project Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="project-cost" className="text-base font-medium">
                      Estimated Project Cost <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="project-cost"
                        type="text"
                        placeholder="1,000,000"
                        value={projectCost}
                        onChange={handleProjectCostChange}
                        className="h-12 pl-10 text-lg"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-base font-medium">
                      Project Location
                    </Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger id="state" className="h-12">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bonus Eligibility */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setShowBonusDetails(!showBonusDetails)}
                    className="flex items-center gap-2 text-base font-medium hover:text-emerald-600 transition-colors"
                  >
                    {showBonusDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Bonus Credit Eligibility (Optional)
                  </button>

                  {showBonusDetails && (
                    <div className="grid sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      {[
                        { key: 'domesticContent', label: 'Domestic Content', description: 'Steel, iron, and manufactured products from the US', rate: '+10%' },
                        { key: 'energyCommunity', label: 'Energy Community', description: 'Project in brownfield or fossil fuel community', rate: '+10%' },
                        { key: 'lowIncomeCommunity', label: 'Low-Income Community', description: 'Project located in qualified census tract', rate: '+10%' },
                        { key: 'lowIncomeResidential', label: 'Low-Income Residential', description: 'Serving low-income households', rate: '+20%' },
                        { key: 'prevailingWage', label: 'Prevailing Wage', description: 'Pay prevailing wages during construction', rate: 'Required for full credit' },
                        { key: 'apprenticeship', label: 'Apprenticeship', description: 'Meet apprenticeship labor hour requirements', rate: 'Required for full credit' },
                      ].map((bonus) => (
                        <label
                          key={bonus.key}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                            bonusOptions[bonus.key as keyof BonusOptions]
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={bonusOptions[bonus.key as keyof BonusOptions]}
                            onChange={(e) => setBonusOptions(prev => ({
                              ...prev,
                              [bonus.key]: e.target.checked
                            }))}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">{bonus.label}</span>
                              <Badge variant="outline" className="text-xs">{bonus.rate}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{bonus.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  size="lg"
                  className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleCheckEligibility}
                  disabled={!entityType || !projectType || !projectCost}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Check Eligibility & Calculate Credit
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            {showResults && eligibilityResult && (
              <div id="results-section" className="mt-8 space-y-6">
                {/* Eligibility Badge */}
                <Card className={cn(
                  "border-2",
                  eligibilityResult.eligible
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
                    : "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
                )}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <DirectPayBadge
                          eligible={eligibilityResult.eligible}
                          entityType={entityType}
                          size="lg"
                          showTooltip={false}
                        />
                        <div>
                          <h3 className="text-xl font-bold">
                            {eligibilityResult.eligible
                              ? 'Congratulations! You Qualify for Direct Pay'
                              : 'Not Eligible for Direct Pay'}
                          </h3>
                          <p className="text-muted-foreground">{eligibilityResult.reason}</p>
                        </div>
                      </div>

                      {eligibilityResult.eligible && valueEstimate && (
                        <div className="text-center md:text-right">
                          <p className="text-sm text-muted-foreground">Estimated Credit Value</p>
                          <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(valueEstimate.totalValue)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Credit Breakdown */}
                {eligibilityResult.eligible && bonusBreakdown && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-emerald-600" />
                        Credit Breakdown
                      </CardTitle>
                      <CardDescription>
                        Potential tax credit value based on your selections
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {bonusBreakdown.bonuses.map((bonus, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg",
                              bonus.active
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 opacity-50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {bonus.active ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                              )}
                              <div>
                                <span className="font-medium">{bonus.label}</span>
                                <span className="ml-2 text-sm text-muted-foreground">({bonus.rate})</span>
                              </div>
                            </div>
                            <span className={cn(
                              "font-semibold",
                              bonus.active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                            )}>
                              {bonus.active ? formatCurrency(bonus.value) : '$0'}
                            </span>
                          </div>
                        ))}

                        <div className="mt-4 pt-4 border-t-2 border-emerald-500">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold">Total Potential Credit</span>
                              <span className="ml-2 text-lg text-muted-foreground">({bonusBreakdown.totalRate}%)</span>
                            </div>
                            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(bonusBreakdown.totalValue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Eligible Credits */}
                {eligibilityResult.eligible && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-emerald-600" />
                        Eligible Credit Sections
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {eligibilityResult.eligibleCredits.map((credit) => (
                          <Badge key={credit} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            Section {credit}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Requirements & Notes */}
                {eligibilityResult.eligible && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Key Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {eligibilityResult.requirements.slice(0, 5).map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Important Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {eligibilityResult.notes.map((note, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Not Eligible Alternative */}
                {!eligibilityResult.eligible && (
                  <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Shield className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <div>
                          <h3 className="text-lg font-bold">Alternative: Credit Transferability</h3>
                          <p className="text-muted-foreground mt-1">
                            For-profit entities can still benefit from clean energy tax credits through
                            <strong> Section 6418 Credit Transferability</strong>. This allows you to sell
                            your tax credits to other taxpayers for cash, typically receiving 90-95 cents
                            on the dollar.
                          </p>
                          <Button variant="outline" className="mt-4" asChild>
                            <Link href="/signup">Learn About Credit Transferability</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-slate-50 dark:bg-slate-900 py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">How Direct Pay Works</h2>
                <p className="mt-3 text-muted-foreground">
                  Three simple steps to receive your clean energy tax credit as cash
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: '1',
                    title: 'Complete Your Project',
                    description: 'Install your qualifying clean energy system (solar, wind, storage, EV charging, etc.) and place it in service.',
                    icon: Building2,
                  },
                  {
                    step: '2',
                    title: 'Register with IRS',
                    description: 'Pre-register your project through the IRS Clean Energy Credit portal before filing your tax return.',
                    icon: FileText,
                  },
                  {
                    step: '3',
                    title: 'Receive Direct Payment',
                    description: 'File your tax return and receive your credit as a direct cash payment from the IRS.',
                    icon: DollarSign,
                  },
                ].map((item) => (
                  <Card key={item.step} className="relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-16 h-16 bg-emerald-600 rounded-br-full flex items-start justify-start p-2">
                      <span className="text-2xl font-bold text-white">{item.step}</span>
                    </div>
                    <CardContent className="pt-12">
                      <item.icon className="h-12 w-12 text-emerald-600 mb-4" />
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Key Dates */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Key Dates & Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {registrationInfo.timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* IRS Resources */}
              <Card className="mt-6 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold">Official IRS Guidance</h3>
                      <p className="text-sm text-muted-foreground">
                        Access detailed instructions and requirements from the IRS
                      </p>
                    </div>
                    <Button variant="outline" className="gap-2" asChild>
                      <a href={registrationInfo.portal} target="_blank" rel="noopener noreferrer">
                        IRS Direct Pay Portal
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Who Qualifies for Direct Pay?</h2>
              <p className="mt-3 text-muted-foreground">
                Tax-exempt entities that would otherwise be unable to utilize tax credits
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: '501(c)(3) Nonprofits', examples: 'Hospitals, schools, charities' },
                { title: 'State Governments', examples: 'State agencies, universities' },
                { title: 'Local Governments', examples: 'Cities, counties, municipalities' },
                { title: 'Tribal Governments', examples: 'Indian tribes, Alaska Native Corps' },
                { title: 'Rural Electric Co-ops', examples: 'Member-owned utilities' },
                { title: 'Public Schools', examples: 'K-12, community colleges' },
              ].map((entity) => (
                <Card key={entity.title} className="hover:border-emerald-300 transition-colors">
                  <CardContent className="pt-6">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-3" />
                    <h3 className="font-bold">{entity.title}</h3>
                    <p className="text-sm text-muted-foreground">{entity.examples}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-gradient-to-br from-emerald-600 to-blue-700 text-white py-16 md:py-24">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold">
                Get Your Full Incentive Analysis
              </h2>
              <p className="mt-4 text-emerald-100 text-lg">
                Direct Pay is just one of thousands of incentives your project may qualify for.
                Our AI analyzes your project against <strong>24,805 incentive programs</strong> to maximize your returns.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 bg-white text-emerald-700 hover:bg-slate-100">
                    Start Free Analysis
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-emerald-200">
                Powered by IncentEdge - 24,805 verified incentive programs across all 50 states
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 dark:bg-slate-950">
        <div className="container px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">IncentEdge</span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                Infrastructure&apos;s Bloomberg Terminal for Incentives
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/discover" className="hover:text-foreground">Discover</Link></li>
                <li><Link href="/analysis" className="hover:text-foreground">Analysis</Link></li>
                <li><Link href="/reports" className="hover:text-foreground">Reports</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/direct-pay" className="hover:text-foreground">Direct Pay Calculator</Link></li>
                <li><a href={registrationInfo.portal} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">IRS Guidance</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div>&copy; 2026 IncentEdge. All rights reserved.</div>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <span className="font-semibold text-emerald-600">24,805</span>
              <span>verified incentive programs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
