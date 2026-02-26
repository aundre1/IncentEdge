'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Briefcase,
  Compass,
  Sparkles,
  FileText,
  PenLine,
  MoreHorizontal,
  Leaf,
  Wrench,
  BookOpen,
  ArrowLeftRight,
  Menu,
  X,
  Sun,
  Moon,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardNavProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
};

// ============================================================================
// CONSTANTS
// ============================================================================

const TABS: Tab[] = [
  { id: 'portfolio',      label: 'Portfolio',      href: '/portfolio',      icon: Briefcase },
  { id: 'discover',       label: 'Discover',       href: '/discover',       icon: Compass   },
  { id: 'matching',       label: 'Matching',       href: '/matching',       icon: Sparkles  },
  { id: 'reports',        label: 'Reports',        href: '/reports',        icon: FileText  },
  { id: 'grant-writing',  label: 'Grant Writing',  href: '/grant-writing',  icon: PenLine   },
];

const MORE_ITEMS = [
  { id: 'marketplace', label: 'Marketplace',      href: '/marketplace', icon: ArrowLeftRight },
  { id: 'green',       label: 'Green Incentives', href: '/green',       icon: Leaf           },
  { id: 'tools',       label: 'Tools',            href: '/tools',       icon: Wrench         },
  { id: 'resources',   label: 'Resources',        href: '/resources',   icon: BookOpen       },
];

// ============================================================================
// THEME TOGGLE (inline — avoids importing separate component)
// ============================================================================

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-md bg-navy-800 dark:bg-navy-700 animate-pulse" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="flex h-8 w-8 items-center justify-center rounded-md text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-700 dark:text-navy-400 dark:hover:bg-navy-800 dark:hover:text-navy-200"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

// ============================================================================
// COMMAND K BUTTON
// ============================================================================

function CommandKButton() {
  return (
    <button
      aria-label="Open command palette (⌘K)"
      className="hidden md:flex items-center gap-1.5 rounded-md border border-navy-200 bg-navy-50 px-2.5 py-1.5 text-xs font-medium text-navy-500 transition-colors hover:border-navy-300 hover:bg-navy-100 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-400 dark:hover:border-navy-600 dark:hover:bg-navy-700"
    >
      <Command className="h-3 w-3" />
      <span>K</span>
    </button>
  );
}

// ============================================================================
// DESKTOP TAB
// ============================================================================

function DesktopTab({
  tab,
  isActive,
  onClick,
}: {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors',
        'border-b-2',
        isActive
          ? 'border-accent-500 text-accent-600 dark:border-accent-400 dark:text-accent-400'
          : 'border-transparent text-navy-500 hover:text-navy-900 dark:text-navy-400 dark:hover:text-navy-100'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {tab.label}
    </Link>
  );
}

// ============================================================================
// MOBILE NAV ITEM
// ============================================================================

function MobileNavItem({
  tab,
  isActive,
  onClick,
}: {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:text-accent-400'
          : 'text-navy-700 hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-navy-800'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {tab.label}
    </Link>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DashboardNav({ currentTab = '', onTabChange }: DashboardNavProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleTabChange = React.useCallback(
    (tabId: string) => {
      onTabChange?.(tabId);
      setMobileOpen(false);
    },
    [onTabChange]
  );

  const isMoreActive = MORE_ITEMS.some((item) => item.id === currentTab);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* NAV BAR                                                             */}
      {/* ------------------------------------------------------------------ */}
      <nav
        aria-label="Dashboard navigation"
        className="sticky top-0 z-40 w-full border-b border-navy-200 bg-white dark:border-navy-800 dark:bg-navy-900"
      >
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 md:px-6">
          {/* ---- Logo ---- */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 py-3 font-sora text-lg font-bold text-navy-900 transition-opacity hover:opacity-80 dark:text-white"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-500">
              <span className="font-mono text-xs font-bold text-white">IE</span>
            </div>
            <span>IncentEdge</span>
          </Link>

          {/* ---- Desktop tabs ---- */}
          <div className="hidden md:flex items-center -mb-px">
            {TABS.map((tab) => (
              <DesktopTab
                key={tab.id}
                tab={tab}
                isActive={currentTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
              />
            ))}

            {/* More dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors border-b-2',
                    isMoreActive
                      ? 'border-accent-500 text-accent-600 dark:border-accent-400 dark:text-accent-400'
                      : 'border-transparent text-navy-500 hover:text-navy-900 dark:text-navy-400 dark:hover:text-navy-100'
                  )}
                  aria-label="More navigation options"
                >
                  <MoreHorizontal className="h-4 w-4 shrink-0" />
                  More
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {MORE_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link
                        href={item.href}
                        onClick={() => handleTabChange(item.id)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4 text-navy-500 dark:text-navy-400" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ---- Right actions ---- */}
          <div className="flex items-center gap-2">
            <CommandKButton />
            <ThemeToggle />

            {/* Hamburger — mobile only */}
            <button
              className="flex md:hidden h-8 w-8 items-center justify-center rounded-md text-navy-500 transition-colors hover:bg-navy-100 dark:text-navy-400 dark:hover:bg-navy-800"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* MOBILE MENU PANEL                                                */}
        {/* ---------------------------------------------------------------- */}
        {mobileOpen && (
          <div className="border-t border-navy-200 bg-white px-4 py-3 dark:border-navy-800 dark:bg-navy-900 md:hidden">
            <div className="flex flex-col gap-1">
              {TABS.map((tab) => (
                <MobileNavItem
                  key={tab.id}
                  tab={tab}
                  isActive={currentTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                />
              ))}

              {/* More section divider */}
              <div className="my-1 h-px bg-navy-100 dark:bg-navy-800" />
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-navy-400 dark:text-navy-500">
                More
              </p>
              {MORE_ITEMS.map((item) => {
                const tab: Tab = { ...item, icon: item.icon };
                return (
                  <MobileNavItem
                    key={item.id}
                    tab={tab}
                    isActive={currentTab === item.id}
                    onClick={() => handleTabChange(item.id)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default DashboardNav;
