'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  MapPin,
  DollarSign,
  Zap,
  ArrowRight,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Leaf,
  Building,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnalysisResults, AnalysisResultsSkeleton, MatchedProgram, ProjectSummary, AnalysisTotals, QuickRecommendation } from '@/components/AnalysisResults';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';

// All 50 US states
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
  { value: 'multifamily', label: 'Multifamily' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'mixed-use', label: 'Mixed-Use' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
];

const PROJECT_TYPES = [
  { value: 'new_construction', label: 'New Construction' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
  { value: 'acquisition', label: 'Acquisition' },
];

const CERTIFICATIONS = [
  { value: 'leed', label: 'LEED' },
  { value: 'energy_star', label: 'Energy Star' },
  { value: 'passive_house', label: 'Passive House' },
  { value: 'ngbs', label: 'NGBS' },
  { value: 'well', label: 'WELL' },
];

const ENTITY_TYPES = [
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'government', label: 'Government / Municipal' },
  { value: 'tribal', label: 'Tribal' },
];

interface FormData {
  projectName: string;
  state: string;
  municipality: string;
  buildingType: string;
  projectType: string;
  totalUnits: string;
  totalSqft: string;
  affordablePercentage: number;
  certifications: string[];
  entityType: string;
  taxExempt: boolean;
  includeAIRecommendations: boolean;
  solarPlanned: boolean;
  totalDevelopmentCost: string;
}

interface FormErrors {
  state?: string;
  buildingType?: string;
  projectType?: string;
  totalUnits?: string;
  totalSqft?: string;
}

interface AnalysisResponse {
  success: boolean;
  analysis: {
    projectSummary: ProjectSummary;
    matchedPrograms: MatchedProgram[];
    totals: AnalysisTotals;
    recommendations: string[];
    warnings: string[];
    quickRecommendation?: QuickRecommendation | null;
    directPay?: {
      eligible: boolean;
      eligibleCredits: string[];
      explanation: string;
    } | null;
  };
  meta: {
    analyzedAt: string;
    responseTime: string;
    version: string;
    engineVersion: string;
    dataSource: 'live' | 'demo';
  };
  error?: string;
}

function AnalysisContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');
  const { profile } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Form data
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    state: 'NY',
    municipality: '',
    buildingType: 'multifamily',
    projectType: 'new_construction',
    totalUnits: '',
    totalSqft: '',
    affordablePercentage: 0,
    certifications: [],
    entityType: 'llc',
    taxExempt: false,
    includeAIRecommendations: false,
    solarPlanned: false,
    totalDevelopmentCost: '',
  });

  // Load project data if projectId is provided
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId]);

  async function loadProject(id: string) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        const affordablePct = data.total_units && data.affordable_units
          ? Math.round((data.affordable_units / data.total_units) * 100)
          : 0;

        setFormData({
          projectName: data.name || '',
          state: data.state || 'NY',
          municipality: data.city || '',
          buildingType: data.building_type?.toLowerCase().replace(/\s+/g, '-') || 'multifamily',
          projectType: data.construction_type?.replace(/\s+/g, '_').toLowerCase() || 'new_construction',
          totalUnits: data.total_units?.toString() || '',
          totalSqft: data.total_sqft?.toString() || '',
          affordablePercentage: affordablePct,
          certifications: data.target_certification ? [data.target_certification.toLowerCase()] : [],
          entityType: data.entity_type || 'llc',
          taxExempt: data.tax_exempt || false,
          includeAIRecommendations: false,
          solarPlanned: data.renewable_energy_types?.includes('solar') || false,
          totalDevelopmentCost: data.total_development_cost?.toString() || '',
        });
      }
    } catch (err) {
      console.error('Error loading project:', err);
    }
    setLoading(false);
  }

  function validateForm(): boolean {
    const errors: FormErrors = {};

    if (!formData.state) {
      errors.state = 'State is required';
    }
    if (!formData.buildingType) {
      errors.buildingType = 'Building type is required';
    }
    if (!formData.projectType) {
      errors.projectType = 'Project type is required';
    }
    if (formData.totalUnits && parseInt(formData.totalUnits) < 0) {
      errors.totalUnits = 'Units must be a positive number';
    }
    if (formData.totalSqft && parseInt(formData.totalSqft) < 0) {
      errors.totalSqft = 'Square footage must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function runAnalysis() {
    if (!validateForm()) {
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const requestBody = {
        projectName: formData.projectName || 'New Project',
        state: formData.state,
        municipality: formData.municipality || undefined,
        buildingType: formData.buildingType,
        projectType: formData.projectType,
        totalUnits: formData.totalUnits ? parseInt(formData.totalUnits) : undefined,
        totalSqft: formData.totalSqft ? parseInt(formData.totalSqft) : undefined,
        affordablePercentage: formData.affordablePercentage,
        targetCertification: formData.certifications.length > 0
          ? formData.certifications[0].toUpperCase()
          : undefined,
        entityType: formData.entityType,
        taxExempt: formData.taxExempt,
        includeAIRecommendations: formData.includeAIRecommendations,
        solarPlanned: formData.solarPlanned,
        totalDevelopmentCost: formData.totalDevelopmentCost
          ? parseFloat(formData.totalDevelopmentCost)
          : undefined,
      };

      const response = await fetch('/api/projects/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data: AnalysisResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResults(data);
      setStep(4);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleExportPDF() {
    if (!results) return;

    setIsExporting(true);

    try {
      // Try to use the reports API if available
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectSummary: results.analysis.projectSummary,
          matchedPrograms: results.analysis.matchedPrograms,
          totals: results.analysis.totals,
          recommendations: results.analysis.recommendations,
          warnings: results.analysis.warnings,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${results.analysis.projectSummary.name.replace(/\s+/g, '_')}_Incentive_Analysis.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        // Fallback: Generate simple text export
        const content = generateTextReport(results);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${results.analysis.projectSummary.name.replace(/\s+/g, '_')}_Incentive_Analysis.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      console.error('Export error:', err);
      // Fallback to text export
      const content = generateTextReport(results);
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${results.analysis.projectSummary.name.replace(/\s+/g, '_')}_Incentive_Analysis.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } finally {
      setIsExporting(false);
    }
  }

  function generateTextReport(data: AnalysisResponse): string {
    const { analysis } = data;
    const formatCurrency = (value: number) => {
      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
      return `$${value.toLocaleString()}`;
    };

    let report = `INCENTIVE ANALYSIS REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `${'='.repeat(50)}\n\n`;

    report += `PROJECT SUMMARY\n`;
    report += `-`.repeat(30) + `\n`;
    report += `Name: ${analysis.projectSummary.name}\n`;
    report += `Location: ${analysis.projectSummary.location}\n`;
    report += `Building Type: ${analysis.projectSummary.buildingType}\n`;
    report += `Project Type: ${analysis.projectSummary.projectType}\n`;
    report += `Total Units: ${analysis.projectSummary.totalUnits}\n`;
    report += `Total Sqft: ${analysis.projectSummary.totalSqft.toLocaleString()}\n`;
    report += `Affordable %: ${analysis.projectSummary.affordablePercentage}%\n\n`;

    report += `TOTAL POTENTIAL VALUE\n`;
    report += `-`.repeat(30) + `\n`;
    report += `Expected: ${formatCurrency(analysis.totals.estimatedTotal.expected)}\n`;
    report += `Range: ${formatCurrency(analysis.totals.estimatedTotal.min)} - ${formatCurrency(analysis.totals.estimatedTotal.max)}\n`;
    report += `Programs Matched: ${analysis.totals.totalPrograms}\n`;
    report += `High Confidence: ${analysis.totals.highConfidence}\n\n`;

    report += `MATCHED PROGRAMS\n`;
    report += `-`.repeat(30) + `\n`;
    analysis.matchedPrograms.forEach((program, i) => {
      report += `\n${i + 1}. ${program.programName}\n`;
      report += `   Category: ${program.category}\n`;
      report += `   Match Score: ${program.matchScore}%\n`;
      report += `   Estimated Value: ${formatCurrency(program.estimatedValue.expected)}\n`;
    });

    if (analysis.recommendations.length > 0) {
      report += `\n\nRECOMMENDATIONS\n`;
      report += `-`.repeat(30) + `\n`;
      analysis.recommendations.forEach((rec, i) => {
        report += `${i + 1}. ${rec}\n`;
      });
    }

    if (analysis.warnings.length > 0) {
      report += `\n\nWARNINGS\n`;
      report += `-`.repeat(30) + `\n`;
      analysis.warnings.forEach((warning, i) => {
        report += `${i + 1}. ${warning}\n`;
      });
    }

    report += `\n\n${'='.repeat(50)}\n`;
    report += `Report generated by IncentEdge\n`;

    return report;
  }

  const resetAnalysis = () => {
    setStep(1);
    setResults(null);
    setError(null);
    setFormErrors({});
  };

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (field in formErrors) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleCertification = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const stepProgress = results ? 100 : ((step - 1) / 3) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show results
  if (step === 4 && results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analysis Results
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Review your project's incentive eligibility
            {results.meta.dataSource === 'live' && (
              <Badge variant="outline" className="ml-2 text-xs">
                Live Data
              </Badge>
            )}
          </p>
        </div>

        <AnalysisResults
          projectSummary={results.analysis.projectSummary}
          matchedPrograms={results.analysis.matchedPrograms}
          totals={results.analysis.totals}
          recommendations={results.analysis.recommendations}
          warnings={results.analysis.warnings}
          quickRecommendation={results.analysis.quickRecommendation}
          directPay={results.analysis.directPay}
          onNewAnalysis={resetAnalysis}
          onExportPDF={handleExportPDF}
          isExporting={isExporting}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          New Project Analysis
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Enter project details to discover eligible incentives
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Step {Math.min(step, 3)} of 3</span>
          <span>{Math.round(stepProgress)}% complete</span>
        </div>
        <Progress value={stepProgress} className="h-2" />
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Analysis Error</p>
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto border-red-300 text-red-700 hover:bg-red-100"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Location & Basic Info */}
      {step === 1 && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Project Location
            </CardTitle>
            <CardDescription>
              Location determines which federal, state, and local programs apply
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => updateFormData('projectName', e.target.value)}
                placeholder="e.g., Downtown Mixed-Use Development"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => updateFormData('state', value)}
                >
                  <SelectTrigger id="state" className={`mt-1 ${formErrors.state ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.state && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.state}</p>
                )}
              </div>
              <div>
                <Label htmlFor="municipality">Municipality (Optional)</Label>
                <Input
                  id="municipality"
                  value={formData.municipality}
                  onChange={(e) => updateFormData('municipality', e.target.value)}
                  placeholder="e.g., New York City"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buildingType">
                  Building Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.buildingType}
                  onValueChange={(value) => updateFormData('buildingType', value)}
                >
                  <SelectTrigger id="buildingType" className={`mt-1 ${formErrors.buildingType ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select building type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUILDING_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.buildingType && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.buildingType}</p>
                )}
              </div>
              <div>
                <Label htmlFor="projectType">
                  Project Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.projectType}
                  onValueChange={(value) => updateFormData('projectType', value)}
                >
                  <SelectTrigger id="projectType" className={`mt-1 ${formErrors.projectType ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.projectType && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.projectType}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Project Details */}
      {step === 2 && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Project Details
            </CardTitle>
            <CardDescription>
              Project size and affordability determine eligible incentive categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalUnits">Total Units</Label>
                <Input
                  id="totalUnits"
                  type="number"
                  value={formData.totalUnits}
                  onChange={(e) => updateFormData('totalUnits', e.target.value)}
                  placeholder="100"
                  min="0"
                  className={`mt-1 ${formErrors.totalUnits ? 'border-red-500' : ''}`}
                />
                {formErrors.totalUnits && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.totalUnits}</p>
                )}
              </div>
              <div>
                <Label htmlFor="totalSqft">Total Square Footage</Label>
                <Input
                  id="totalSqft"
                  type="number"
                  value={formData.totalSqft}
                  onChange={(e) => updateFormData('totalSqft', e.target.value)}
                  placeholder="150000"
                  min="0"
                  className={`mt-1 ${formErrors.totalSqft ? 'border-red-500' : ''}`}
                />
                {formErrors.totalSqft && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.totalSqft}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="affordablePercentage" className="flex items-center justify-between">
                <span>Affordable Percentage</span>
                <span className="text-sm font-bold text-blue-600">{formData.affordablePercentage}%</span>
              </Label>
              <Slider
                id="affordablePercentage"
                value={[formData.affordablePercentage]}
                onValueChange={([value]) => updateFormData('affordablePercentage', value)}
                max={100}
                step={1}
                className="mt-3"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0%</span>
                <span>Market Rate</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              {formData.affordablePercentage >= 20 && (
                <p className="text-xs text-emerald-600 mt-2">
                  Qualifies for affordable housing incentives (LIHTC, etc.)
                </p>
              )}
            </div>

            <div>
              <Label className="mb-3 block">Certifications (Multi-select)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CERTIFICATIONS.map((cert) => (
                  <label
                    key={cert.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.certifications.includes(cert.value)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Checkbox
                      checked={formData.certifications.includes(cert.value)}
                      onCheckedChange={() => toggleCertification(cert.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {cert.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Entity & Options */}
      {step === 3 && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Entity & Analysis Options
            </CardTitle>
            <CardDescription>
              Entity type affects Direct Pay eligibility and bonus credits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entityType">Entity Type</Label>
                <Select
                  value={formData.entityType}
                  onValueChange={(value) => updateFormData('entityType', value)}
                >
                  <SelectTrigger id="entityType" className="mt-1">
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(formData.entityType === 'nonprofit' || formData.entityType === 'government' || formData.entityType === 'tribal') && (
                  <p className="text-xs text-emerald-600 mt-2">
                    Eligible for Direct Pay (IRA Section 6417)
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="totalDevelopmentCost">Total Development Cost (Optional)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="totalDevelopmentCost"
                    type="number"
                    value={formData.totalDevelopmentCost}
                    onChange={(e) => updateFormData('totalDevelopmentCost', e.target.value)}
                    placeholder="50000000"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Additional Options</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Checkbox
                    checked={formData.taxExempt}
                    onCheckedChange={(checked) => updateFormData('taxExempt', checked as boolean)}
                  />
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Tax Exempt Entity</p>
                    <p className="text-sm text-slate-500">Organization is a 501(c)(3) or similar tax-exempt entity</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Checkbox
                    checked={formData.solarPlanned}
                    onCheckedChange={(checked) => updateFormData('solarPlanned', checked as boolean)}
                  />
                  <Zap className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Solar / Renewable Energy Planned</p>
                    <p className="text-sm text-slate-500">Unlocks ITC and clean energy credits</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Checkbox
                    checked={formData.includeAIRecommendations}
                    onCheckedChange={(checked) => updateFormData('includeAIRecommendations', checked as boolean)}
                  />
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Include AI Recommendations</p>
                    <p className="text-sm text-slate-500">Get AI-powered analysis and optimization suggestions</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={runAnalysis}
                disabled={analyzing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeleton */}
      {analyzing && (
        <div className="mt-6">
          <AnalysisResultsSkeleton />
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="container py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading analysis...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AnalysisContent />
    </Suspense>
  );
}
