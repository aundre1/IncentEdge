'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Building2,
  ChevronDown,
  ChevronRight,
  Paperclip,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TYPES
// ============================================================================

type AppStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected';
type ViewMode = 'table' | 'kanban';

interface Application {
  id: string;
  program: string;
  agency: string;
  project: string;
  status: AppStatus;
  amount: number;
  deadline: string;
  submittedDate?: string;
  lastActivity: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  completionPct: number;
  requiredDocs: { name: string; done: boolean }[];
  notes: string;
  type: 'federal' | 'state' | 'local' | 'utility';
}

// ============================================================================
// DEMO DATA
// ============================================================================

const APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    program: 'IDA PILOT — Property Tax Abatement',
    agency: 'Westchester IDA',
    project: 'Mount Vernon Mixed-Use',
    status: 'under-review',
    amount: 18.0,
    deadline: '2026-03-15',
    submittedDate: '2026-02-01',
    lastActivity: '3 days ago',
    assignee: 'Steve Kumar',
    priority: 'critical',
    completionPct: 85,
    requiredDocs: [
      { name: 'Project Pro Forma', done: true },
      { name: 'PILOT Application Form', done: true },
      { name: 'Environmental Review', done: true },
      { name: 'Community Impact Statement', done: false },
    ],
    notes: 'IDA board meeting scheduled March 15. Community impact statement outstanding.',
    type: 'local',
  },
  {
    id: 'app-002',
    program: '4% LIHTC via Tax-Exempt Bonds',
    agency: 'IRS / NY HCR',
    project: 'Mount Vernon Mixed-Use',
    status: 'approved',
    amount: 17.7,
    deadline: '2026-04-30',
    submittedDate: '2025-12-10',
    lastActivity: '2 weeks ago',
    assignee: 'Aundre Oldacre',
    priority: 'high',
    completionPct: 100,
    requiredDocs: [
      { name: 'HCR Application Package', done: true },
      { name: 'Architect Certification', done: true },
      { name: 'Income Targeting Plan', done: true },
      { name: 'Financing Commitment Letters', done: true },
    ],
    notes: 'Approved. Closing documents in preparation. Estimated credit equity: $17.7M.',
    type: 'federal',
  },
  {
    id: 'app-003',
    program: 'NYSERDA New Construction Program',
    agency: 'NYSERDA',
    project: 'Mount Vernon Mixed-Use',
    status: 'submitted',
    amount: 4.8,
    deadline: '2026-04-01',
    submittedDate: '2026-02-14',
    lastActivity: '1 week ago',
    assignee: 'Steve Kumar',
    priority: 'high',
    completionPct: 100,
    requiredDocs: [
      { name: 'Energy Model (eQUEST)', done: true },
      { name: 'Commissioning Plan', done: true },
      { name: 'ASHRAE 90.1 Compliance Report', done: true },
    ],
    notes: 'Submitted via NYSERDA portal. Awaiting technical review assignment.',
    type: 'state',
  },
  {
    id: 'app-004',
    program: 'Section 48 ITC — Solar & Storage',
    agency: 'IRS',
    project: 'Mount Vernon Mixed-Use',
    status: 'draft',
    amount: 27.1,
    deadline: '2026-06-30',
    lastActivity: '5 days ago',
    assignee: 'Steve Kumar',
    priority: 'critical',
    completionPct: 45,
    requiredDocs: [
      { name: 'IRS Form 3468', done: false },
      { name: 'Solar System Spec Sheets', done: true },
      { name: 'Storage System Specs', done: true },
      { name: 'Engineer Certification Letter', done: false },
      { name: 'Utility Interconnection Agreement', done: false },
    ],
    notes: 'Waiting on utility interconnection agreement. Engineer cert expected next week.',
    type: 'federal',
  },
  {
    id: 'app-005',
    program: 'New Markets Tax Credit',
    agency: 'CDFI Fund',
    project: 'Mount Vernon Mixed-Use',
    status: 'draft',
    amount: 23.4,
    deadline: '2026-07-15',
    lastActivity: '2 days ago',
    assignee: 'Aundre Oldacre',
    priority: 'high',
    completionPct: 30,
    requiredDocs: [
      { name: 'NMTC Application', done: false },
      { name: 'CDE Partnership Agreement', done: false },
      { name: 'QLICI Loan Terms', done: false },
      { name: 'Community Impact Metrics', done: true },
    ],
    notes: 'Identifying CDE partner. Community impact data collected.',
    type: 'federal',
  },
  {
    id: 'app-006',
    program: '9% LIHTC Competitive Allocation',
    agency: 'NY HCR',
    project: 'Yonkers Affordable Housing',
    status: 'under-review',
    amount: 28.5,
    deadline: '2026-03-31',
    submittedDate: '2026-01-15',
    lastActivity: '1 day ago',
    assignee: 'Dr. Malcolm Adams',
    priority: 'critical',
    completionPct: 90,
    requiredDocs: [
      { name: 'Full HCR Application', done: true },
      { name: 'Market Study', done: true },
      { name: 'Architect Plans', done: true },
      { name: 'Neighborhood Impact Letter', done: true },
      { name: 'Scoring Worksheet', done: false },
    ],
    notes: 'Under HCR review. Scoring worksheet revision requested.',
    type: 'federal',
  },
  {
    id: 'app-007',
    program: 'HCR Housing Trust Fund',
    agency: 'NY HCR',
    project: 'Yonkers Affordable Housing',
    status: 'submitted',
    amount: 12.0,
    deadline: '2026-05-01',
    submittedDate: '2026-02-20',
    lastActivity: '4 days ago',
    assignee: 'Dr. Malcolm Adams',
    priority: 'high',
    completionPct: 100,
    requiredDocs: [
      { name: 'HTF Application', done: true },
      { name: 'Project Budget', done: true },
      { name: 'Financing Plan', done: true },
    ],
    notes: 'Submitted. Funding committee review in May.',
    type: 'state',
  },
  {
    id: 'app-008',
    program: 'FTA TOD Planning Grant',
    agency: 'FTA',
    project: 'New Rochelle Transit Hub',
    status: 'rejected',
    amount: 5.5,
    deadline: '2026-02-01',
    submittedDate: '2026-01-05',
    lastActivity: '3 weeks ago',
    assignee: 'Steve Kumar',
    priority: 'medium',
    completionPct: 100,
    requiredDocs: [
      { name: 'FTA Planning Grant App', done: true },
      { name: 'TOD Feasibility Study', done: true },
      { name: 'MTA Coordination Letter', done: true },
    ],
    notes: 'Rejected — insufficient transit ridership data. Reapply next cycle with updated counts.',
    type: 'federal',
  },
  {
    id: 'app-009',
    program: 'ESD Transit-Oriented Development Initiative',
    agency: 'Empire State Development',
    project: 'New Rochelle Transit Hub',
    status: 'draft',
    amount: 8.0,
    deadline: '2026-05-15',
    lastActivity: '1 week ago',
    assignee: 'Aundre Oldacre',
    priority: 'high',
    completionPct: 20,
    requiredDocs: [
      { name: 'ESD Application Form', done: false },
      { name: 'Economic Impact Analysis', done: false },
      { name: 'Letters of Support', done: true },
    ],
    notes: 'Letters of support secured from mayor and MTA. Application form in progress.',
    type: 'state',
  },
  {
    id: 'app-010',
    program: 'Con Edison EE Rebates',
    agency: 'Con Edison',
    project: 'Mount Vernon Mixed-Use',
    status: 'approved',
    amount: 2.5,
    deadline: '2026-08-01',
    submittedDate: '2026-01-20',
    lastActivity: '1 month ago',
    assignee: 'Steve Kumar',
    priority: 'medium',
    completionPct: 100,
    requiredDocs: [
      { name: 'Pre-Installation Review', done: true },
      { name: 'Equipment Specs', done: true },
    ],
    notes: 'Approved. Rebate check expected post-project completion.',
    type: 'utility',
  },
];

// ============================================================================
// STATUS CONFIG
// ============================================================================

const STATUS_CONFIG: Record<AppStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeClass: string;
  headerClass: string;
  bgClass: string;
}> = {
  draft: {
    label: 'Draft',
    icon: FileText,
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    headerClass: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    bgClass: 'border-gray-200 dark:border-gray-700',
  },
  submitted: {
    label: 'Submitted',
    icon: Send,
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    headerClass: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    bgClass: 'border-blue-200 dark:border-blue-800/50',
  },
  'under-review': {
    label: 'Under Review',
    icon: Clock,
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    headerClass: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    bgClass: 'border-amber-200 dark:border-amber-800/50',
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    headerClass: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    bgClass: 'border-green-200 dark:border-green-800/50',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    headerClass: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    bgClass: 'border-red-200 dark:border-red-800/50',
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; class: string }> = {
  low:      { label: 'Low',      class: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  medium:   { label: 'Medium',   class: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' },
  high:     { label: 'High',     class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' },
  critical: { label: 'Critical', class: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' },
};

const TYPE_BADGE: Record<string, string> = {
  federal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  state:   'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
  local:   'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200',
  utility: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
};

// ============================================================================
// PROGRESS BAR
// ============================================================================

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
      <div
        className={`h-1.5 rounded-full transition-all ${
          pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-teal-500' : pct >= 30 ? 'bg-amber-500' : 'bg-red-400'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ============================================================================
// APPLICATION CARD (Kanban)
// ============================================================================

function AppCard({ app }: { app: Application }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[app.status];
  const StatusIcon = statusCfg.icon;
  const doneDocs = app.requiredDocs.filter(d => d.done).length;

  return (
    <div className={`rounded-lg border ${statusCfg.bgClass} bg-white dark:bg-gray-900 shadow-sm`}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge className={TYPE_BADGE[app.type] + ' text-[10px]'}>
            {app.type.charAt(0).toUpperCase() + app.type.slice(1)}
          </Badge>
          <Badge className={PRIORITY_CONFIG[app.priority].class + ' text-[10px]'}>
            {PRIORITY_CONFIG[app.priority].label}
          </Badge>
        </div>
        <div className="text-sm font-semibold text-deep-900 dark:text-white leading-snug mb-1">
          {app.program}
        </div>
        <div className="text-xs text-deep-500 dark:text-gray-400 mb-2">{app.agency}</div>
        <div className="flex items-center justify-between text-xs text-deep-500 dark:text-gray-400 mb-2">
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {app.project.split(' ')[0]}
          </span>
          <span className="font-bold text-teal-700 dark:text-teal-300 text-sm">
            ${app.amount.toFixed(1)}M
          </span>
        </div>
        <ProgressBar pct={app.completionPct} />
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-deep-500 dark:text-gray-400">
          <span>{doneDocs}/{app.requiredDocs.length} docs</span>
          <span>{app.lastActivity}</span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex w-full items-center justify-between text-[10px] text-deep-400 dark:text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <span>Details</span>
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        {expanded && (
          <div className="mt-2 space-y-1.5 border-t border-gray-100 dark:border-gray-700/50 pt-2">
            {app.requiredDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[10px]">
                {doc.done
                  ? <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                  : <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                }
                <span className={doc.done ? 'text-deep-500 dark:text-gray-400 line-through' : 'text-deep-700 dark:text-gray-300'}>
                  {doc.name}
                </span>
              </div>
            ))}
            {app.notes && (
              <div className="flex items-start gap-1.5 text-[10px] text-deep-500 dark:text-gray-400 mt-1">
                <MessageSquare className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <span>{app.notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// KANBAN VIEW
// ============================================================================

function KanbanView({ applications }: { applications: Application[] }) {
  const columns: { status: AppStatus; label: string }[] = [
    { status: 'draft', label: 'Draft' },
    { status: 'submitted', label: 'Submitted' },
    { status: 'under-review', label: 'Under Review' },
    { status: 'approved', label: 'Approved' },
    { status: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(col => {
        const colApps = applications.filter(a => a.status === col.status);
        const colValue = colApps.reduce((s, a) => s + a.amount, 0);
        const cfg = STATUS_CONFIG[col.status];
        const ColIcon = cfg.icon;
        return (
          <div key={col.status} className="flex-shrink-0 w-72">
            <div className={`mb-3 flex items-center justify-between rounded-lg px-3 py-2 ${cfg.headerClass}`}>
              <div className="flex items-center gap-2">
                <ColIcon className="h-4 w-4" />
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="rounded-full bg-white/50 dark:bg-black/20 px-1.5 py-0.5 text-xs font-bold">
                  {colApps.length}
                </span>
              </div>
              {colApps.length > 0 && (
                <span className="text-xs font-semibold">${colValue.toFixed(1)}M</span>
              )}
            </div>
            <div className="space-y-2">
              {colApps.map(app => (
                <AppCard key={app.id} app={app} />
              ))}
              {colApps.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center text-xs text-deep-400 dark:text-gray-500">
                  No applications
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// TABLE VIEW
// ============================================================================

function TableView({ applications }: { applications: Application[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {['Program', 'Project', 'Type', 'Value', 'Status', 'Priority', 'Docs', 'Deadline', 'Assignee', 'Last Activity'].map(h => (
              <th key={h} className="pb-3 text-left font-medium text-deep-500 dark:text-gray-400 pr-4 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applications.map(app => {
            const statusCfg = STATUS_CONFIG[app.status];
            const StatusIcon = statusCfg.icon;
            const doneDocs = app.requiredDocs.filter(d => d.done).length;
            const totalDocs = app.requiredDocs.length;
            const deadline = new Date(app.deadline);
            const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <tr key={app.id} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="py-3 pr-4">
                  <div className="font-medium text-deep-900 dark:text-white max-w-[220px]">{app.program}</div>
                  <div className="text-xs text-deep-500 dark:text-gray-400">{app.agency}</div>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-deep-700 dark:text-gray-300">
                    <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-deep-400 dark:text-gray-500" />
                    {app.project.split(' ').slice(0, 2).join(' ')}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <Badge className={TYPE_BADGE[app.type] + ' text-xs'}>
                    {app.type.charAt(0).toUpperCase() + app.type.slice(1)}
                  </Badge>
                </td>
                <td className="py-3 pr-4 font-bold text-teal-700 dark:text-teal-300 whitespace-nowrap">
                  ${app.amount.toFixed(1)}M
                </td>
                <td className="py-3 pr-4">
                  <Badge className={statusCfg.badgeClass + ' inline-flex items-center gap-1'}>
                    <StatusIcon className="h-3 w-3" />
                    {statusCfg.label}
                  </Badge>
                </td>
                <td className="py-3 pr-4">
                  <Badge className={PRIORITY_CONFIG[app.priority].class + ' text-xs'}>
                    {PRIORITY_CONFIG[app.priority].label}
                  </Badge>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-3.5 w-3.5 text-deep-400 dark:text-gray-500" />
                    <span className={`text-xs ${doneDocs === totalDocs ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {doneDocs}/{totalDocs}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  <div className={`text-xs ${
                    app.status === 'approved' || app.status === 'rejected' ? 'text-deep-500 dark:text-gray-400' :
                    daysUntil <= 30 ? 'text-red-600 dark:text-red-400 font-semibold' :
                    daysUntil <= 90 ? 'text-amber-600 dark:text-amber-400' :
                    'text-deep-600 dark:text-gray-400'
                  }`}>
                    {app.deadline}
                    {app.status !== 'approved' && app.status !== 'rejected' && daysUntil > 0 && (
                      <span className="block text-[10px] text-deep-400 dark:text-gray-500">{daysUntil}d remaining</span>
                    )}
                  </div>
                </td>
                <td className="py-3 pr-4 text-deep-700 dark:text-gray-300 whitespace-nowrap text-xs">
                  {app.assignee.split(' ')[0]}
                </td>
                <td className="py-3 text-xs text-deep-500 dark:text-gray-400 whitespace-nowrap">
                  {app.lastActivity}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function ApplicationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    return APPLICATIONS.filter(app => {
      if (statusFilter !== 'all' && app.status !== statusFilter) return false;
      if (projectFilter !== 'all' && !app.project.toLowerCase().includes(projectFilter)) return false;
      if (searchQuery && !app.program.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !app.agency.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [statusFilter, projectFilter, searchQuery]);

  // Summary stats
  const totalValue = APPLICATIONS.reduce((s, a) => s + a.amount, 0);
  const approvedValue = APPLICATIONS.filter(a => a.status === 'approved').reduce((s, a) => s + a.amount, 0);
  const inProgressCount = APPLICATIONS.filter(a => a.status === 'under-review' || a.status === 'submitted').length;
  const criticalCount = APPLICATIONS.filter(a => a.priority === 'critical' && a.status !== 'approved' && a.status !== 'rejected').length;

  const statusCounts = {
    draft: APPLICATIONS.filter(a => a.status === 'draft').length,
    submitted: APPLICATIONS.filter(a => a.status === 'submitted').length,
    'under-review': APPLICATIONS.filter(a => a.status === 'under-review').length,
    approved: APPLICATIONS.filter(a => a.status === 'approved').length,
    rejected: APPLICATIONS.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-teal-600" />
              <h1 className="text-2xl font-bold text-deep-900 dark:text-white">Applications</h1>
            </div>
            <p className="text-sm text-deep-500 dark:text-gray-400">
              Track grant applications across all projects — from draft to approval
            </p>
          </div>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </div>

        {/* KPI cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Pipeline', value: `$${totalValue.toFixed(1)}M`, sub: `${APPLICATIONS.length} applications`, icon: DollarSign, color: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300' },
            { label: 'Approved / Won', value: `$${approvedValue.toFixed(1)}M`, sub: `${statusCounts.approved} programs approved`, icon: CheckCircle2, color: 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300' },
            { label: 'In Review', value: String(inProgressCount), sub: 'submitted or under review', icon: Clock, color: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300' },
            { label: 'Critical Priority', value: String(criticalCount), sub: 'require immediate action', icon: AlertCircle, color: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300' },
          ].map(card => {
            const CardIcon = card.icon;
            return (
              <Card key={card.label} className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-deep-500 dark:text-gray-400">{card.label}</p>
                      <p className="mt-1 text-2xl font-bold text-deep-900 dark:text-white">{card.value}</p>
                      <p className="text-xs text-deep-500 dark:text-gray-400 mt-0.5">{card.sub}</p>
                    </div>
                    <div className={`rounded-lg p-2 ${card.color}`}>
                      <CardIcon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Controls */}
        <Card className="mb-4 border border-gray-200 dark:border-gray-700/50 shadow-sm">
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-deep-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search programs or agencies..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 py-2 text-sm text-deep-900 dark:text-white placeholder-deep-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Filter className="h-4 w-4 text-deep-400 dark:text-gray-500" />
                  {(['all', 'draft', 'submitted', 'under-review', 'approved', 'rejected'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                        statusFilter === s
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-deep-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {s === 'all' ? `All (${APPLICATIONS.length})` :
                       s === 'under-review' ? `Review (${statusCounts['under-review']})` :
                       `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s as AppStatus]})`}
                    </button>
                  ))}
                </div>

                {/* View toggle */}
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === 'table'
                        ? 'bg-teal-600 text-white'
                        : 'bg-white dark:bg-gray-900 text-deep-600 dark:text-gray-400'
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      viewMode === 'kanban'
                        ? 'bg-teal-600 text-white'
                        : 'bg-white dark:bg-gray-900 text-deep-600 dark:text-gray-400'
                    }`}
                  >
                    Kanban
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <Card className="border border-gray-200 dark:border-gray-700/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {filteredApps.length} application{filteredApps.length !== 1 ? 's' : ''}
              {statusFilter !== 'all' && ` · ${STATUS_CONFIG[statusFilter].label}`}
            </CardTitle>
            <CardDescription>
              Total value: ${filteredApps.reduce((s, a) => s + a.amount, 0).toFixed(1)}M
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viewMode === 'table' ? (
              <TableView applications={filteredApps} />
            ) : (
              <KanbanView applications={filteredApps} />
            )}

            {filteredApps.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="mx-auto h-10 w-10 text-deep-300 dark:text-gray-600 mb-3" />
                <p className="text-sm font-medium text-deep-700 dark:text-gray-300">No applications found</p>
                <p className="text-xs text-deep-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
