'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Edit,
  Building2,
  MapPin,
  DollarSign,
  Leaf,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

// Mock projects data (matching projects/page.tsx)
const projects = [
  {
    id: '1',
    name: 'Mount Vernon Mixed-Use',
    description: 'Mixed-use development with 200 residential units and ground floor retail',
    building_type: 'Mixed-Use',
    project_type: 'new-construction',
    status: 'active',
    address: '123 Main St, Mount Vernon, NY',
    state: 'NY',
    municipality: 'Mount Vernon',
    total_units: 200,
    affordable_units: 120,
    total_sqft: 250000,
    affordability_pct: 60,
    total_development_cost: 85000000,
    estimated_completion: '2027-06-30',
    certifications: {
      leed: true,
      energy_star: true,
      passive_house: false,
      solar_renewable: false,
      ev_charging: false,
      prevailing_wage: false,
    },
    entity_type: 'LLC',
    tax_exempt: false,
  },
  {
    id: '2',
    name: 'Yonkers Affordable Housing',
    description: 'LIHTC affordable housing project with 150 units',
    building_type: 'Multifamily',
    project_type: 'new-construction',
    status: 'active',
    address: '456 Oak Ave, Yonkers, NY',
    state: 'NY',
    municipality: 'Yonkers',
    total_units: 150,
    affordable_units: 150,
    total_sqft: 180000,
    affordability_pct: 100,
    total_development_cost: 55000000,
    estimated_completion: '2027-12-15',
    certifications: {
      leed: false,
      energy_star: true,
      passive_house: false,
      solar_renewable: false,
      ev_charging: false,
      prevailing_wage: true,
    },
    entity_type: 'Nonprofit',
    tax_exempt: true,
  },
  {
    id: '3',
    name: 'New Rochelle Solar Farm',
    description: '25 MW utility-scale solar installation',
    building_type: 'Solar',
    project_type: 'new-construction',
    status: 'on-hold',
    address: 'Industrial Park Rd, New Rochelle, NY',
    state: 'NY',
    municipality: 'New Rochelle',
    total_units: 0,
    affordable_units: 0,
    total_sqft: 0,
    affordability_pct: 0,
    total_development_cost: 32000000,
    estimated_completion: '2026-09-30',
    certifications: {
      leed: false,
      energy_star: false,
      passive_house: false,
      solar_renewable: true,
      ev_charging: false,
      prevailing_wage: true,
    },
    entity_type: 'LLC',
    tax_exempt: false,
  },
  {
    id: '4',
    name: 'White Plains Office Conversion',
    description: 'Office-to-residential conversion project',
    building_type: 'Mixed-Use',
    project_type: 'rehabilitation',
    status: 'active',
    address: '789 Corporate Blvd, White Plains, NY',
    state: 'NY',
    municipality: 'White Plains',
    total_units: 180,
    affordable_units: 54,
    total_sqft: 220000,
    affordability_pct: 30,
    total_development_cost: 72000000,
    estimated_completion: '2027-03-15',
    certifications: {
      leed: true,
      energy_star: false,
      passive_house: false,
      solar_renewable: false,
      ev_charging: true,
      prevailing_wage: true,
    },
    entity_type: 'Corp',
    tax_exempt: false,
  },
];

type CertKey = 'leed' | 'energy_star' | 'passive_house' | 'solar_renewable' | 'ev_charging' | 'prevailing_wage';

interface FormState {
  name: string;
  description: string;
  address: string;
  state: string;
  municipality: string;
  building_type: string;
  project_type: string;
  total_units: number;
  affordable_units: number;
  total_sqft: number;
  total_development_cost: number;
  affordability_pct: number;
  estimated_completion: string;
  certifications: Record<CertKey, boolean>;
  entity_type: string;
  tax_exempt: boolean;
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const project = projects.find((p) => p.id === id);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState<FormState>(() => {
    if (!project) {
      return {
        name: '',
        description: '',
        address: '',
        state: '',
        municipality: '',
        building_type: '',
        project_type: '',
        total_units: 0,
        affordable_units: 0,
        total_sqft: 0,
        total_development_cost: 0,
        affordability_pct: 0,
        estimated_completion: '',
        certifications: {
          leed: false,
          energy_star: false,
          passive_house: false,
          solar_renewable: false,
          ev_charging: false,
          prevailing_wage: false,
        },
        entity_type: '',
        tax_exempt: false,
      };
    }
    return {
      name: project.name,
      description: project.description,
      address: project.address,
      state: project.state,
      municipality: project.municipality,
      building_type: project.building_type,
      project_type: project.project_type,
      total_units: project.total_units,
      affordable_units: project.affordable_units,
      total_sqft: project.total_sqft,
      total_development_cost: project.total_development_cost,
      affordability_pct: project.affordability_pct,
      estimated_completion: project.estimated_completion,
      certifications: { ...project.certifications } as Record<CertKey, boolean>,
      entity_type: project.entity_type,
      tax_exempt: project.tax_exempt,
    };
  });

  if (!project) {
    return (
      <div className="space-y-6">
        <Link href="/projects">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold font-sora">Project not found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No project with ID <span className="font-mono font-medium">{id}</span> exists.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/projects">View All Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCert = (key: CertKey) => {
    setForm((prev) => ({
      ...prev,
      certifications: { ...prev.certifications, [key]: !prev.certifications[key] },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call — no actual backend call
    console.log('Saving project:', id, form);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSaving(false);
    setSaveSuccess(true);
    // Redirect after brief success display
    setTimeout(() => {
      router.push(`/projects/${id}`);
    }, 1500);
  };

  const SectorIcon = project.building_type === 'Solar' ? Sun : Building2;

  const certifications: { key: CertKey; label: string; description: string }[] = [
    { key: 'leed', label: 'LEED', description: 'Leadership in Energy and Environmental Design' },
    { key: 'energy_star', label: 'ENERGY STAR', description: 'EPA energy efficiency certification' },
    { key: 'passive_house', label: 'Passive House', description: 'Ultra-low energy building standard' },
    { key: 'solar_renewable', label: 'Solar / Renewable', description: 'On-site renewable energy systems' },
    { key: 'ev_charging', label: 'EV Charging', description: 'Electric vehicle charging infrastructure' },
    { key: 'prevailing_wage', label: 'Prevailing Wage', description: 'Davis-Bacon prevailing wage commitment' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Button */}
      <Link href={`/projects/${id}`}>
        <Button variant="ghost" className="gap-2 -ml-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Project
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600">
          <Edit className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora">Edit Project</h1>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-emerald-800 dark:text-emerald-300 text-sm">Changes saved successfully</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500">Redirecting to project page...</p>
          </div>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-600" />
            <CardTitle className="font-sora text-base">Basic Information</CardTitle>
          </div>
          <CardDescription>Project name, description, and location identifiers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Mount Vernon Mixed-Use"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief project description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="address"
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="pl-9"
                placeholder="123 Main St, City, NY"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>State</Label>
              <Select value={form.state} onValueChange={(v) => updateField('state', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="NJ">New Jersey</SelectItem>
                  <SelectItem value="CT">Connecticut</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="IL">Illinois</SelectItem>
                  <SelectItem value="PA">Pennsylvania</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="municipality">Municipality</Label>
              <Input
                id="municipality"
                value={form.municipality}
                onChange={(e) => updateField('municipality', e.target.value)}
                placeholder="e.g., Mount Vernon"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Project Specifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-600" />
            <CardTitle className="font-sora text-base">Project Specifications</CardTitle>
          </div>
          <CardDescription>Building type, unit counts, and scale details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Building Type</Label>
              <Select value={form.building_type} onValueChange={(v) => updateField('building_type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Multifamily">Multifamily</SelectItem>
                  <SelectItem value="Mixed-Use">Mixed-Use</SelectItem>
                  <SelectItem value="Single Family">Single Family</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Industrial">Industrial</SelectItem>
                  <SelectItem value="Solar">Solar / Renewable</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select value={form.project_type} onValueChange={(v) => updateField('project_type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-construction">New Construction</SelectItem>
                  <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                  <SelectItem value="acquisition">Acquisition</SelectItem>
                  <SelectItem value="acquisition-rehab">Acquisition + Rehab</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="total_units">Total Units</Label>
              <Input
                id="total_units"
                type="number"
                value={form.total_units || ''}
                onChange={(e) => updateField('total_units', Number(e.target.value))}
                placeholder="200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="affordable_units">Affordable Units</Label>
              <Input
                id="affordable_units"
                type="number"
                value={form.affordable_units || ''}
                onChange={(e) => updateField('affordable_units', Number(e.target.value))}
                placeholder="120"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_sqft">Total SqFt</Label>
              <Input
                id="total_sqft"
                type="number"
                value={form.total_sqft || ''}
                onChange={(e) => updateField('total_sqft', Number(e.target.value))}
                placeholder="250000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Financial Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-teal-600" />
            <CardTitle className="font-sora text-base">Financial Details</CardTitle>
          </div>
          <CardDescription>Development costs and affordability targeting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tdc">Total Development Cost</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="tdc"
                type="number"
                value={form.total_development_cost || ''}
                onChange={(e) => updateField('total_development_cost', Number(e.target.value))}
                className="pl-9"
                placeholder="85000000"
              />
            </div>
            {form.total_development_cost > 0 && (
              <p className="text-xs text-muted-foreground font-mono">
                = ${(form.total_development_cost / 1e6).toFixed(1)}M
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Affordable Housing %</Label>
              <Badge variant="secondary" className="font-mono text-sm">{form.affordability_pct}%</Badge>
            </div>
            <Slider
              value={[form.affordability_pct]}
              onValueChange={([v]) => updateField('affordability_pct', v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0% (market rate)</span>
              <span>100% (fully affordable)</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completion">Target Completion Date</Label>
            <div className="relative">
              <Input
                id="completion"
                type="date"
                value={form.estimated_completion}
                onChange={(e) => updateField('estimated_completion', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Certifications & Features */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-teal-600" />
            <CardTitle className="font-sora text-base">Certifications & Features</CardTitle>
          </div>
          <CardDescription>Green building standards and sustainability features that may unlock bonus incentives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {certifications.map((cert) => (
              <div key={cert.key} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                <Checkbox
                  id={cert.key}
                  checked={form.certifications[cert.key]}
                  onCheckedChange={() => toggleCert(cert.key)}
                  className="mt-0.5"
                />
                <div className="flex-1 cursor-pointer" onClick={() => toggleCert(cert.key)}>
                  <Label htmlFor={cert.key} className="font-medium cursor-pointer">{cert.label}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{cert.description}</p>
                </div>
                {form.certifications[cert.key] && (
                  <Badge variant="success" className="text-xs flex-shrink-0">Active</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Entity Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-600" />
            <CardTitle className="font-sora text-base">Entity Information</CardTitle>
          </div>
          <CardDescription>Legal entity type and tax status — affects incentive eligibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Entity Type</Label>
            <Select value={form.entity_type} onValueChange={(v) => updateField('entity_type', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LLC">LLC</SelectItem>
                <SelectItem value="Corp">Corporation</SelectItem>
                <SelectItem value="Nonprofit">Nonprofit (501(c)(3))</SelectItem>
                <SelectItem value="Government">Government / Public Agency</SelectItem>
                <SelectItem value="Tribal">Tribal Entity</SelectItem>
                <SelectItem value="Partnership">Partnership</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox
              id="tax_exempt"
              checked={form.tax_exempt}
              onCheckedChange={(v) => updateField('tax_exempt', Boolean(v))}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor="tax_exempt" className="font-medium cursor-pointer">Tax Exempt Organization</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Entity holds 501(c)(3) or equivalent tax-exempt status. Unlocks Direct Pay election under IRA Section 6417.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Actions */}
      <div className="flex items-center justify-between pb-6">
        <Button variant="outline" asChild>
          <Link href={`/projects/${id}`}>Cancel</Link>
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || saveSuccess}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white min-w-[140px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
