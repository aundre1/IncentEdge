'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Database,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Zap,
  Building2,
  Search,
  Sparkles,
  Compass,
  Briefcase,
  Leaf,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

// Icon mapping for navigation items
const iconMap = {
  LayoutDashboard,
  FolderKanban,
  Database,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  CreditCard,
  Sparkles,
  Compass,
  Briefcase,
  Leaf,
};

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof iconMap;
  badge?: number | string;
  children?: { label: string; href: string }[];
}

const mainNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    icon: 'Briefcase',
  },
  {
    label: 'Matching',
    href: '/matching',
    icon: 'Sparkles',
    badge: 'AI',
  },
  {
    label: 'Discover',
    href: '/discover',
    icon: 'Compass',
    badge: '24K+',
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: 'FolderKanban',
    children: [
      { label: 'All Projects', href: '/projects' },
      { label: 'Active', href: '/projects?status=active' },
      { label: 'Archived', href: '/projects?status=archived' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    icon: 'Database',
    children: [
      { label: 'All Programs', href: '/programs' },
      { label: 'Federal', href: '/programs?category=federal' },
      { label: 'State', href: '/programs?category=state' },
      { label: 'Local', href: '/programs?category=local' },
      { label: 'Utility', href: '/programs?category=utility' },
    ],
  },
  {
    label: 'Green Incentives',
    href: '/green',
    icon: 'Leaf',
  },
  {
    label: 'Applications',
    href: '/applications',
    icon: 'FileText',
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: 'BarChart3',
  },
];

const bottomNavItems: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: 'Settings' },
  { label: 'Help & Docs', href: '/help', icon: 'HelpCircle' },
  { label: 'Billing', href: '/billing', icon: 'CreditCard' },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [openItems, setOpenItems] = React.useState<string[]>(['Projects']);

  const toggleItem = (label: string) => {
    setOpenItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href.split('?')[0]);
  };

  const renderNavItem = (item: NavItem, isBottom = false) => {
    const Icon = iconMap[item.icon];
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openItems.includes(item.label);

    if (collapsed) {
      return (
        <TooltipProvider key={item.label} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (hasChildren) {
      return (
        <Collapsible
          key={item.label}
          open={isOpen}
          onOpenChange={() => toggleItem(item.label)}
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {item.badge}
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-1">
            <div className="ml-7 space-y-1 border-l pl-3">
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                    pathname === child.href
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
          active
            ? 'bg-accent text-accent-foreground font-medium'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </div>
        {item.badge && (
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b px-4',
          collapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold">IncentEdge</span>
            <span className="text-xs text-muted-foreground">
              Incentive Intelligence
            </span>
          </div>
        )}
      </div>

      {/* Search (Linear-style) */}
      {!collapsed && (
        <div className="p-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {mainNavItems.map((item) => renderNavItem(item))}
      </nav>

      <Separator />

      {/* Bottom Navigation */}
      <nav className="space-y-1 p-3">
        {bottomNavItems.map((item) => renderNavItem(item, true))}
      </nav>

      {/* Organization Selector */}
      {!collapsed && (
        <div className="border-t p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">AoRa Development</span>
              <span className="text-xs text-muted-foreground">Professional</span>
            </div>
            <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
    </aside>
  );
}
