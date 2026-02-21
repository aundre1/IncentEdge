import { Metadata } from 'next';
import Link from 'next/link';
import {
  Plus,
  Filter,
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  Building2,
  Sun,
  Droplets,
  Zap,
  MapPin,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const metadata: Metadata = {
  title: 'Projects | IncentEdge',
  description: 'Manage your real estate and infrastructure projects.',
};

// Mock data - will be replaced with Supabase query
const projects = [
  {
    id: '1',
    name: 'Mount Vernon Mixed-Use',
    description: 'Mixed-use development with 200 residential units and ground floor retail',
    sector_type: 'real-estate',
    building_type: 'Mixed-Use',
    status: 'active',
    address: '123 Main St, Mount Vernon, NY',
    state: 'NY',
    total_units: 200,
    affordable_units: 120,
    total_sqft: 250000,
    total_development_cost: 85000000,
    total_potential_incentives: 45200000,
    total_captured_incentives: 12500000,
    applications: 3,
    matches: 12,
    progress: 65,
    estimated_completion: '2027-06-30',
    created_at: '2025-11-15',
  },
  {
    id: '2',
    name: 'Yonkers Affordable Housing',
    description: 'LIHTC affordable housing project with 150 units',
    sector_type: 'real-estate',
    building_type: 'Multifamily',
    status: 'active',
    address: '456 Oak Ave, Yonkers, NY',
    state: 'NY',
    total_units: 150,
    affordable_units: 150,
    total_sqft: 180000,
    total_development_cost: 55000000,
    total_potential_incentives: 28500000,
    total_captured_incentives: 0,
    applications: 2,
    matches: 8,
    progress: 40,
    estimated_completion: '2027-12-15',
    created_at: '2025-12-01',
  },
  {
    id: '3',
    name: 'New Rochelle Solar Farm',
    description: '25 MW utility-scale solar installation',
    sector_type: 'clean-energy',
    building_type: 'Solar',
    status: 'on-hold',
    address: 'Industrial Park Rd, New Rochelle, NY',
    state: 'NY',
    total_units: null,
    affordable_units: null,
    total_sqft: null,
    capacity_mw: 25,
    total_development_cost: 32000000,
    total_potential_incentives: 15800000,
    total_captured_incentives: 0,
    applications: 1,
    matches: 15,
    progress: 20,
    estimated_completion: '2026-09-30',
    created_at: '2026-01-05',
  },
  {
    id: '4',
    name: 'White Plains Office Conversion',
    description: 'Office-to-residential conversion project',
    sector_type: 'real-estate',
    building_type: 'Mixed-Use',
    status: 'active',
    address: '789 Corporate Blvd, White Plains, NY',
    state: 'NY',
    total_units: 180,
    affordable_units: 54,
    total_sqft: 220000,
    total_development_cost: 72000000,
    total_potential_incentives: 38400000,
    total_captured_incentives: 8200000,
    applications: 4,
    matches: 10,
    progress: 55,
    estimated_completion: '2027-03-15',
    created_at: '2025-10-20',
  },
];

function formatCurrency(value: number) {
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getSectorIcon(sector: string) {
  switch (sector) {
    case 'clean-energy':
      return Sun;
    case 'water':
      return Droplets;
    case 'transportation':
      return Zap;
    default:
      return Building2;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return <Badge variant="success">Active</Badge>;
    case 'on-hold':
      return <Badge variant="warning">On Hold</Badge>;
    case 'completed':
      return <Badge variant="info">Completed</Badge>;
    case 'archived':
      return <Badge variant="secondary">Archived</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function ProjectCard({ project }: { project: typeof projects[0] }) {
  const SectorIcon = getSectorIcon(project.sector_type);
  const captureRate = project.total_potential_incentives > 0
    ? Math.round((project.total_captured_incentives / project.total_potential_incentives) * 100)
    : 0;

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <SectorIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                <Link href={`/projects/${project.id}`} className="hover:underline">
                  {project.name}
                </Link>
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {project.address}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(project.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/projects/${project.id}`}>View Details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/projects/${project.id}/edit`}>Edit Project</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/projects/${project.id}/eligibility`}>Run Eligibility Scan</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Type:</span>{' '}
            <span className="font-medium">{project.building_type}</span>
          </div>
          {project.total_units && (
            <div>
              <span className="text-muted-foreground">Units:</span>{' '}
              <span className="font-medium">
                {project.total_units} ({project.affordable_units} affordable)
              </span>
            </div>
          )}
          {project.capacity_mw && (
            <div>
              <span className="text-muted-foreground">Capacity:</span>{' '}
              <span className="font-medium">{project.capacity_mw} MW</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">TDC:</span>{' '}
            <span className="font-medium">{formatCurrency(project.total_development_cost)}</span>
          </div>
        </div>

        {/* Incentive Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Incentive Capture</span>
            <span className="font-medium">
              {formatCurrency(project.total_captured_incentives)} / {formatCurrency(project.total_potential_incentives)}
            </span>
          </div>
          <Progress value={captureRate} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{captureRate}% captured</span>
            <span>{project.matches} matches • {project.applications} applications</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Est. {formatDate(project.estimated_completion)}
          </span>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/projects/${project.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your real estate and infrastructure projects
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Tabs defaultValue="grid">
            <TabsList>
              <TabsTrigger value="grid" className="px-3">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({projects.filter(p => p.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="on-hold">On Hold ({projects.filter(p => p.status === 'on-hold').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed (0)</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Project Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first project to start discovering incentives.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
}
