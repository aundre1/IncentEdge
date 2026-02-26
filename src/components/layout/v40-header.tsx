'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Moon,
  Sun,
  User,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  Menu,
  X,
  Command,
  Briefcase,
  Compass,
  BarChart3,
  FileText,
  Calculator,
  Map,
  Clock,
  BookOpen,
  Building2,
  Scale,
  Landmark,
  FileCheck,
  Users,
  Zap,
  Send,
  Loader2,
  PenLine,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/analysis', label: 'Analysis', icon: BarChart3 },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/grant-writing', label: 'Grant Writing', icon: PenLine },
];

const toolsItems = [
  { label: 'Eligibility Calculator', icon: Calculator, href: '/tools/calculator' },
  { label: 'Incentive Map', icon: Map, href: '/tools/map' },
  { label: 'Deadline Tracker', icon: Clock, href: '/tools/deadlines' },
  { label: 'Cost Estimator', icon: Scale, href: '/tools/cost-estimator' },
  { label: 'Compliance Checker', icon: FileCheck, href: '/tools/compliance' },
  { label: 'ROI Analyzer', icon: BarChart3, href: '/tools/roi' },
];

const resourcesItems = [
  { label: 'Program Database', icon: BookOpen, href: '/resources/programs' },
  { label: 'Federal Programs', icon: Landmark, href: '/resources/federal' },
  { label: 'State Programs', icon: Building2, href: '/resources/state' },
  { label: 'Application Guides', icon: FileText, href: '/resources/guides' },
  { label: 'Success Stories', icon: Users, href: '/resources/success-stories' },
];

export function V40Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, signOut, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [askUsOpen, setAskUsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [askUsQuestion, setAskUsQuestion] = React.useState('');
  const [askUsEmail, setAskUsEmail] = React.useState('');
  const [askUsSubmitting, setAskUsSubmitting] = React.useState(false);
  const [askUsSuccess, setAskUsSuccess] = React.useState(false);

  // Keyboard shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Set default email when user changes
  React.useEffect(() => {
    if (user?.email && !askUsEmail) {
      setAskUsEmail(user.email);
    }
  }, [user?.email]);

  const isActive = (href: string) => {
    if (href === '/portfolio') {
      return pathname === '/portfolio' || pathname === '/dashboard' || pathname?.startsWith('/projects');
    }
    return pathname?.startsWith(href);
  };

  // Handle Ask Us form submission - stores to DB + sends email via API
  const handleAskUsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askUsQuestion.trim()) return;

    setAskUsSubmitting(true);

    try {
      // Call API endpoint which handles DB storage + email notification
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: askUsQuestion,
          email: askUsEmail || user?.email || null,
          name: profile?.full_name || null,
          source: 'ask_us_modal',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setAskUsSuccess(true);
      setAskUsQuestion('');

      // Reset after 2 seconds
      setTimeout(() => {
        setAskUsOpen(false);
        setAskUsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setAskUsSubmitting(false);
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* V41: Main Header - Navy 100px with exact V40 styling */}
      <header className="top-nav">
        <div className="h-full max-w-[1600px] mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">
          {/* Logo with animation */}
          <Link href="/portfolio" className="flex items-center gap-3 shrink-0 logo-animate">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-sora font-bold text-xl text-white tracking-tight">
                Incent<span className="text-blue-400">Edge</span>
              </span>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                V41 Beta
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - V40 Style */}
          <nav className="hidden xl:flex items-center gap-1 desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'nav-link flex items-center gap-2',
                  isActive(item.href) && 'active'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Center Search - Command Palette Style */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 bg-navy-800/50 border border-navy-700 rounded-lg hover:border-blue-500/50 hover:bg-navy-800 transition-all"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left">Search 30,000+ incentives...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-navy-700 text-slate-400 rounded border border-navy-600">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* More Dropdown (Tools + Resources) - V40 Style */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden lg:flex nav-link"
                >
                  More
                  <ChevronDown className="ml-1 w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-navy-900 border-navy-700">
                <DropdownMenuLabel className="text-slate-500 text-xs uppercase tracking-wider">Tools</DropdownMenuLabel>
                {toolsItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-blue-600/10">
                      <item.icon className="w-4 h-4 text-blue-400" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-navy-700" />
                <DropdownMenuLabel className="text-slate-500 text-xs uppercase tracking-wider">Resources</DropdownMenuLabel>
                {resourcesItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-blue-600/10">
                      <item.icon className="w-4 h-4 text-blue-400" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ask Us Button - Prominent Teal (Bob White Recommendation) */}
            <Button
              onClick={() => setAskUsOpen(true)}
              className="btn-teal font-semibold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ask Us</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="nav-link"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="nav-link">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-navy-900 border-navy-700">
                <DropdownMenuLabel className="text-slate-300 font-normal">
                  <div className="font-medium">{profile?.full_name || 'User'}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-navy-700" />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 text-slate-300 hover:bg-blue-600/10">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="flex items-center gap-2 text-slate-300 hover:bg-blue-600/10">
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-navy-700" />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden nav-link mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - V40 Grid Style */}
        {mobileMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 right-0 bg-navy-900 border-b border-navy-700 p-4 animate-in">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
            {/* Mobile Search */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-400 bg-navy-800 rounded-lg hover:bg-navy-700 transition-colors"
            >
              <Search className="w-4 h-4" />
              Search incentives...
            </button>
          </div>
        )}
      </header>

      {/* Search Modal - Command Palette Style */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-2xl bg-navy-900 border-navy-700 p-0">
          <form onSubmit={handleSearch}>
            <div className="flex items-center border-b border-navy-700 px-4">
              <Search className="w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search incentives by name, state, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 text-lg py-6"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs bg-navy-700 text-slate-400 rounded">
                ESC
              </kbd>
            </div>
          </form>
          {/* Quick filters */}
          <div className="px-4 py-3 border-b border-navy-800">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setSearchQuery('federal'); }}
                className="badge-federal text-xs px-3 py-1.5 rounded-full"
              >
                Federal
              </button>
              <button
                onClick={() => { setSearchQuery('state'); }}
                className="badge-state text-xs px-3 py-1.5 rounded-full"
              >
                State
              </button>
              <button
                onClick={() => { setSearchQuery('tax credit'); }}
                className="badge-local text-xs px-3 py-1.5 rounded-full"
              >
                Tax Credits
              </button>
              <button
                onClick={() => { setSearchQuery('grant'); }}
                className="badge-utility text-xs px-3 py-1.5 rounded-full"
              >
                Grants
              </button>
              <button
                onClick={() => { setSearchQuery('NY'); }}
                className="px-3 py-1.5 text-xs bg-teal-500/10 text-teal-500 border border-teal-500/20 rounded-full"
              >
                New York
              </button>
            </div>
          </div>
          {/* Search hints */}
          <div className="p-6 text-center">
            <p className="text-slate-500 text-sm">
              {searchQuery ? (
                <span>Press <kbd className="px-1.5 py-0.5 bg-navy-700 rounded text-xs">Enter</kbd> to search for "{searchQuery}"</span>
              ) : (
                'Start typing to search 30,000+ incentive programs...'
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ask Us Modal - With DB + Email Integration */}
      <Dialog open={askUsOpen} onOpenChange={setAskUsOpen}>
        <DialogContent className="sm:max-w-md bg-navy-900 border-navy-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 font-sora">
              <div className="p-2 rounded-lg bg-teal-500/10">
                <MessageCircle className="w-5 h-5 text-teal-500" />
              </div>
              Ask Us Anything
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Have questions about incentives or need help with your project? We typically respond within 24 hours.
            </DialogDescription>
          </DialogHeader>

          {askUsSuccess ? (
            <div className="py-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Question Sent!</h3>
              <p className="text-slate-400 text-sm">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleAskUsSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">Your Question</label>
                <textarea
                  value={askUsQuestion}
                  onChange={(e) => setAskUsQuestion(e.target.value)}
                  className="form-input-v41 mt-1 min-h-[120px] resize-none"
                  placeholder="What would you like to know about incentives?"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={askUsEmail}
                  onChange={(e) => setAskUsEmail(e.target.value)}
                  className="form-input-v41 mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">So we can respond to you</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-navy-700 text-slate-300 hover:bg-navy-800"
                  onClick={() => setAskUsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={askUsSubmitting || !askUsQuestion.trim()}
                  className="flex-1 btn-teal"
                >
                  {askUsSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
