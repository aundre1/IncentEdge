'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  MapPin,
  DollarSign,
  Leaf,
  Zap,
  Loader2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  PROPERTY_TYPES,
  DEVELOPMENT_TYPES,
  US_STATES,
  ENERGY_SYSTEMS,
  CERTIFICATIONS,
  AMI_LEVELS,
} from '@/lib/constants';

// Form Schema
const projectSchema = z.object({
  // Step 1: Basic Info
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  sector_type: z.enum(['real-estate', 'clean-energy', 'water', 'waste', 'transportation', 'industrial']),
  building_type: z.string().min(1, 'Building type is required'),
  construction_type: z.enum(['new-construction', 'substantial-rehab', 'acquisition', 'refinance']),

  // Step 2: Location
  address_line1: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State is required'),
  zip_code: z.string().min(5, 'ZIP code is required'),
  county: z.string().optional(),

  // Step 3: Size & Units
  total_sqft: z.coerce.number().optional(),
  total_units: z.coerce.number().optional(),
  affordable_units: z.coerce.number().optional(),
  capacity_mw: z.coerce.number().optional(),
  stories: z.coerce.number().optional(),

  // Step 4: Financials
  total_development_cost: z.coerce.number().optional(),
  hard_costs: z.coerce.number().optional(),
  soft_costs: z.coerce.number().optional(),

  // Step 5: Sustainability
  target_certification: z.string().optional(),
  renewable_energy_types: z.array(z.string()).optional(),
  projected_energy_reduction_pct: z.coerce.number().optional(),
  domestic_content_eligible: z.boolean().optional(),
  prevailing_wage_commitment: z.boolean().optional(),

  // Step 6: Timeline
  estimated_start_date: z.string().optional(),
  estimated_completion_date: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const steps = [
  { id: 1, title: 'Project Info', description: 'Basic project details', icon: Building2 },
  { id: 2, title: 'Location', description: 'Where is it located?', icon: MapPin },
  { id: 3, title: 'Size & Units', description: 'Project scale', icon: Building2 },
  { id: 4, title: 'Financials', description: 'Development costs', icon: DollarSign },
  { id: 5, title: 'Sustainability', description: 'Green features', icon: Leaf },
  { id: 6, title: 'Review', description: 'Confirm details', icon: Check },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedEnergySystems, setSelectedEnergySystems] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      sector_type: 'real-estate',
      construction_type: 'new-construction',
      domestic_content_eligible: false,
      prevailing_wage_commitment: false,
      renewable_energy_types: [],
    },
  });

  const formData = watch();
  const progress = (currentStep / steps.length) * 100;

  const nextStep = async () => {
    // Validate current step fields before proceeding
    const fieldsToValidate: (keyof ProjectFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate.push('name', 'sector_type', 'building_type', 'construction_type');
        break;
      case 2:
        fieldsToValidate.push('address_line1', 'city', 'state', 'zip_code');
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Save to Supabase
      console.log('Form data:', data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to projects page
      router.push('/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEnergySystem = (systemId: string) => {
    setSelectedEnergySystems((prev) =>
      prev.includes(systemId)
        ? prev.filter((id) => id !== systemId)
        : [...prev, systemId]
    );
    setValue('renewable_energy_types',
      selectedEnergySystems.includes(systemId)
        ? selectedEnergySystems.filter((id) => id !== systemId)
        : [...selectedEnergySystems, systemId]
    );
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">
            Enter project details to discover eligible incentives
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              className={cn(
                'flex flex-col items-center gap-2',
                isActive && 'text-primary',
                !isActive && !isCompleted && 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  isActive && 'border-primary bg-primary text-primary-foreground',
                  isCompleted && 'border-primary bg-primary text-primary-foreground',
                  !isActive && !isCompleted && 'border-muted'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <div className="hidden text-center sm:block">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Steps */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Project Info */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mount Vernon Mixed-Use Development"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief project description"
                    {...register('description')}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Sector *</Label>
                    <Select
                      value={formData.sector_type}
                      onValueChange={(value) => setValue('sector_type', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="clean-energy">Clean Energy</SelectItem>
                        <SelectItem value="water">Water Infrastructure</SelectItem>
                        <SelectItem value="waste">Waste & Circular</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Building Type *</Label>
                    <Select
                      value={formData.building_type}
                      onValueChange={(value) => setValue('building_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.building_type && (
                      <p className="text-sm text-destructive">{errors.building_type.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Development Type *</Label>
                  <Select
                    value={formData.construction_type}
                    onValueChange={(value) => setValue('construction_type', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select development type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEVELOPMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address_line1">Street Address *</Label>
                  <Input
                    id="address_line1"
                    placeholder="123 Main Street"
                    {...register('address_line1')}
                  />
                  {errors.address_line1 && (
                    <p className="text-sm text-destructive">{errors.address_line1.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" placeholder="Mount Vernon" {...register('city')} />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setValue('state', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-sm text-destructive">{errors.state.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code *</Label>
                    <Input id="zip_code" placeholder="10550" {...register('zip_code')} />
                    {errors.zip_code && (
                      <p className="text-sm text-destructive">{errors.zip_code.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input id="county" placeholder="Westchester" {...register('county')} />
                </div>

                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-500" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Location-based incentives
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Your address helps us identify state, local, and utility-specific programs.
                        We'll automatically check for Opportunity Zones, Energy Communities, and other
                        geographic bonuses.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Size & Units */}
            {currentStep === 3 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="total_sqft">Total Square Feet</Label>
                    <Input
                      id="total_sqft"
                      type="number"
                      placeholder="250,000"
                      {...register('total_sqft')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stories">Stories</Label>
                    <Input
                      id="stories"
                      type="number"
                      placeholder="12"
                      {...register('stories')}
                    />
                  </div>
                </div>

                {formData.sector_type === 'real-estate' && (
                  <>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="total_units">Total Units</Label>
                        <Input
                          id="total_units"
                          type="number"
                          placeholder="200"
                          {...register('total_units')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="affordable_units">
                          Affordable Units
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="ml-1 inline h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Units restricted to tenants below 80% AMI</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="affordable_units"
                          type="number"
                          placeholder="120"
                          {...register('affordable_units')}
                        />
                      </div>
                    </div>
                  </>
                )}

                {formData.sector_type === 'clean-energy' && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="capacity_mw">
                        Generation Capacity (MW)
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="ml-1 inline h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Nameplate capacity in megawatts</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input
                        id="capacity_mw"
                        type="number"
                        step="0.1"
                        placeholder="25"
                        {...register('capacity_mw')}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Step 4: Financials */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="total_development_cost">Total Development Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="total_development_cost"
                      type="number"
                      className="pl-9"
                      placeholder="85,000,000"
                      {...register('total_development_cost')}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hard_costs">Hard Costs</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="hard_costs"
                        type="number"
                        className="pl-9"
                        placeholder="60,000,000"
                        {...register('hard_costs')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soft_costs">Soft Costs</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="soft_costs"
                        type="number"
                        className="pl-9"
                        placeholder="25,000,000"
                        {...register('soft_costs')}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
                  <div className="flex gap-3">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    <div className="text-sm">
                      <p className="font-medium text-emerald-900 dark:text-emerald-100">
                        Financial-based incentives
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-300">
                        Many incentives are calculated as a percentage of eligible costs or have
                        minimum investment thresholds. Accurate cost data improves our estimates.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 5: Sustainability */}
            {currentStep === 5 && (
              <>
                <div className="space-y-2">
                  <Label>Target Certification</Label>
                  <Select
                    value={formData.target_certification}
                    onValueChange={(value) => setValue('target_certification', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select certification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / Not Yet Decided</SelectItem>
                      {CERTIFICATIONS.map((cert) => (
                        <SelectItem key={cert.id} value={cert.id}>
                          {cert.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Renewable Energy Systems</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ENERGY_SYSTEMS.map((system) => (
                      <Button
                        key={system.id}
                        type="button"
                        variant={selectedEnergySystems.includes(system.id) ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => toggleEnergySystem(system.id)}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        {system.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>IRA Bonus Eligibility</Label>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Domestic Content Eligible</p>
                      <p className="text-sm text-muted-foreground">
                        Project uses steel, iron, and manufactured products produced in the U.S.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={formData.domestic_content_eligible ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValue('domestic_content_eligible', !formData.domestic_content_eligible)}
                    >
                      {formData.domestic_content_eligible ? 'Yes' : 'No'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Prevailing Wage Commitment</p>
                      <p className="text-sm text-muted-foreground">
                        Will pay prevailing wages for construction and maintenance
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={formData.prevailing_wage_commitment ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setValue('prevailing_wage_commitment', !formData.prevailing_wage_commitment)}
                    >
                      {formData.prevailing_wage_commitment ? 'Yes' : 'No'}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Project Details</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Name</dt>
                        <dd className="font-medium">{formData.name || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Sector</dt>
                        <dd className="font-medium capitalize">{formData.sector_type?.replace('-', ' ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Type</dt>
                        <dd className="font-medium">{formData.building_type || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Development</dt>
                        <dd className="font-medium capitalize">{formData.construction_type?.replace('-', ' ')}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Location</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Address</dt>
                        <dd className="text-right font-medium">{formData.address_line1 || '-'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">City, State</dt>
                        <dd className="font-medium">{formData.city}, {formData.state}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">ZIP</dt>
                        <dd className="font-medium">{formData.zip_code || '-'}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Size</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Square Feet</dt>
                        <dd className="font-medium">{formData.total_sqft?.toLocaleString() || '-'}</dd>
                      </div>
                      {formData.total_units && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Units</dt>
                          <dd className="font-medium">{formData.total_units}</dd>
                        </div>
                      )}
                      {formData.affordable_units && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Affordable</dt>
                          <dd className="font-medium">{formData.affordable_units}</dd>
                        </div>
                      )}
                      {formData.capacity_mw && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Capacity</dt>
                          <dd className="font-medium">{formData.capacity_mw} MW</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Financials</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">TDC</dt>
                        <dd className="font-medium">{formatCurrency(formData.total_development_cost)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Hard Costs</dt>
                        <dd className="font-medium">{formatCurrency(formData.hard_costs)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Soft Costs</dt>
                        <dd className="font-medium">{formatCurrency(formData.soft_costs)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Sustainability & Bonuses</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.target_certification && (
                      <Badge variant="secondary">{formData.target_certification}</Badge>
                    )}
                    {selectedEnergySystems.map((system) => (
                      <Badge key={system} variant="secondary">
                        {ENERGY_SYSTEMS.find((s) => s.id === system)?.label}
                      </Badge>
                    ))}
                    {formData.domestic_content_eligible && (
                      <Badge variant="success">Domestic Content</Badge>
                    )}
                    {formData.prevailing_wage_commitment && (
                      <Badge variant="success">Prevailing Wage</Badge>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="flex gap-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <p className="font-medium">Ready to discover incentives</p>
                      <p className="text-muted-foreground">
                        After creating the project, we'll automatically scan 20,000+ programs
                        to find matching incentives in under 60 seconds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between border-t p-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button type="button" onClick={nextStep}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Project
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
