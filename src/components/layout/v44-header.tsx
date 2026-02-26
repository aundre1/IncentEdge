'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Moon,
  Sun,
  Bell,
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
  Sparkles,
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
  Send,
  Loader2,
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

const navItems = [
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase, badge: null },
  { href: '/discover', label: 'Discover', icon: Compass, badge: null },
  { href: '/matching', label: 'Matching', icon: Sparkles, badge: 'AI' },
  { href: '/reports', label: 'Reports', icon: FileText, badge: null },
];

const moreToolsItems = [
  { label: 'Eligibility Calculator', icon: Calculator, href: '/tools/calculator' },
  { label: 'Incentive Map', icon: Map, href: '/tools/map' },
  { label: 'Deadline Tracker', icon: Clock, href: '/tools/deadlines' },
  { label: 'Cost Estimator', icon: Scale, href: '/tools/cost-estimator' },
  { label: 'Compliance Checker', icon: FileCheck, href: '/tools/compliance' },
];

const moreResourcesItems = [
  { label: 'Program Database', icon: BookOpen, href: '/resources/programs' },
  { label: 'Federal Programs', icon: Landmark, href: '/resources/federal' },
  { label: 'State Programs', icon: Building2, href: '/resources/state' },
  { label: 'Application Guides', icon: FileText, href: '/resources/guides' },
  { label: 'Success Stories', icon: Users, href: '/resources/success-stories' },
];

export function V44Header() {
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

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
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

  // Pre-fill email from user when available
  React.useEffect(() => {
    if (user?.email && !askUsEmail) {
      setAskUsEmail(user.email);
    }
  }, [user?.email, askUsEmail]);

  const isActive = (href: string) => {
    if (href === '/portfolio') {
      return pathname === '/portfolio' || pathname === '/dashboard' || pathname?.startsWith('/projects');
    }
    return pathname?.startsWith(href);
  };

  // Handle Ask Us form submission
  const handleAskUsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askUsQuestion.trim()) return;

    setAskUsSubmitting(true);
    try {
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

      if (!response.ok) throw new Error('Failed to submit');

      setAskUsSuccess(true);
      setAskUsQuestion('');

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

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AO';

  return (
    <>
      {/* V44 Header: 72px, gradient deep to #0F2832, sticky */}
      <header className="sticky top-0 z-50 h-[72px] bg-gradient-to-r from-deep to-deep-800 border-b border-deep-700/50">
        <div className="h-full max-w-[1600px] mx-auto px-4 lg:px-6 flex items-center justify-between gap-4">

          {/* Left: Logo */}
          <Link href="/portfolio" className="flex items-center gap-3 shrink-0 group">
            {/* IE Mark */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-shadow">
              <span className="text-white font-sora font-bold text-base">IE</span>
            </div>
            {/* Brand Text */}
            <div className="hidden sm:block">
              <span className="font-sora font-bold text-lg text-white tracking-tight">
                Incent<span className="text-teal-400">Edge</span>
              </span>
              <div className="text-[10px] text-sage uppercase tracking-widest font-medium font-mono">
                Incentive Intelligence
              </div>
            </div>
          </Link>

          {/* Center-left: Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all',
                  isActive(item.href)
                    ? 'text-white bg-teal-500/10 border-b-2 border-teal-400'
                    : 'text-sage hover:text-white hover:bg-deep-700/50'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.badge && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-sm bg-teal-500/20 text-teal-300 tracking-wider">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-sage hover:text-white hover:bg-deep-700/50 rounded-lg transition-all"
                >
                  More
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-deep border-deep-700">
                <DropdownMenuLabel className="text-sage-600 text-xs uppercase tracking-wider font-mono">
                  Tools
                </DropdownMenuLabel>
                {moreToolsItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2 text-sage-300 hover:text-white hover:bg-teal-500/10 cursor-pointer">
                      <item.icon className="w-4 h-4 text-teal-500" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-deep-700" />
                <DropdownMenuLabel className="text-sage-600 text-xs uppercase tracking-wider font-mono">
                  Resources
                </DropdownMenuLabel>
                {moreResourcesItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2 text-sage-300 hover:text-white hover:bg-teal-500/10 cursor-pointer">
                      <item.icon className="w-4 h-4 text-teal-500" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm bg-white/5 border border-sage/20 rounded-lg hover:border-teal-500/50 hover:bg-white/10 transition-all group"
            >
              <Search className="w-4 h-4 text-sage" />
              <span className="flex-1 text-left text-sage/70">
                Search 3,847 incentive programs...
              </span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-deep-700 text-sage rounded border border-deep-600">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Ask Us Button */}
            <Button
              onClick={() => setAskUsOpen(true)}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all border-0"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ask Us</span>
            </Button>

            {/* Notification Bell */}
            <button
              className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-sage/10 border border-sage/20 text-sage hover:text-white hover:bg-deep-700 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-500" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-sage/10 border border-sage/20 text-sage hover:text-white hover:bg-deep-700 transition-all"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {/* User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-sage-600 text-white text-xs font-bold tracking-wide hover:shadow-lg hover:shadow-teal-500/20 transition-all"
                  aria-label="User menu"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-deep border-deep-700">
                <DropdownMenuLabel className="text-white font-normal">
                  <div className="font-medium font-sora">{profile?.full_name || 'User'}</div>
                  <div className="text-xs text-sage">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-deep-700" />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 text-sage hover:text-white hover:bg-teal-500/10 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="flex items-center gap-2 text-sage hover:text-white hover:bg-teal-500/10 cursor-pointer">
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-deep-700" />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <button
              className="xl:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-sage/10 border border-sage/20 text-sage hover:text-white hover:bg-deep-700 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="xl:hidden absolute top-full left-0 right-0 bg-deep border-b border-deep-700 p-4 shadow-xl shadow-deep-950/50 z-50">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-teal-500/20 text-white border border-teal-500/30'
                      : 'bg-deep-800 text-sage hover:bg-deep-700 border border-deep-700'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-teal-500/20 text-teal-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
            {/* Mobile Search Trigger */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-sage bg-deep-800 rounded-lg hover:bg-deep-700 transition-colors border border-deep-700"
            >
              <Search className="w-4 h-4" />
              Search incentive programs...
            </button>
          </div>
        )}
      </header>

      {/* Search Modal (Command Palette) */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-2xl bg-deep border-deep-700 p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Search Incentive Programs</DialogTitle>
            <DialogDescription>
              Search across 3,847 incentive programs by name, state, or category.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSearch}>
            <div className="flex items-center border-b border-deep-700 px-4">
              <Search className="w-5 h-5 text-sage" />
              <Input
                placeholder="Search incentives by name, state, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent text-white placeholder:text-sage/50 focus-visible:ring-0 text-lg py-6"
                autoFocus
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-mono bg-deep-700 text-sage rounded border border-deep-600">
                ESC
              </kbd>
            </div>
          </form>
          {/* Quick filter badges */}
          <div className="px-4 py-3 border-b border-deep-800">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSearchQuery('federal')}
                className="text-xs px-3 py-1.5 rounded-full bg-deep-800 text-sage border border-deep-700 hover:border-teal-500/40 hover:text-teal-300 transition-colors"
              >
                Federal
              </button>
              <button
                onClick={() => setSearchQuery('state')}
                className="text-xs px-3 py-1.5 rounded-full bg-deep-800 text-sage border border-deep-700 hover:border-teal-500/40 hover:text-teal-300 transition-colors"
              >
                State
              </button>
              <button
                onClick={() => setSearchQuery('tax credit')}
                className="text-xs px-3 py-1.5 rounded-full bg-deep-800 text-sage border border-deep-700 hover:border-teal-500/40 hover:text-teal-300 transition-colors"
              >
                Tax Credits
              </button>
              <button
                onClick={() => setSearchQuery('grant')}
                className="text-xs px-3 py-1.5 rounded-full bg-deep-800 text-sage border border-deep-700 hover:border-teal-500/40 hover:text-teal-300 transition-colors"
              >
                Grants
              </button>
              <button
                onClick={() => setSearchQuery('NY')}
                className="text-xs px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:border-teal-500/40 transition-colors"
              >
                New York
              </button>
              <button
                onClick={() => setSearchQuery('IRA')}
                className="text-xs px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:border-teal-500/40 transition-colors"
              >
                IRA Programs
              </button>
            </div>
          </div>
          {/* Search hints */}
          <div className="p-6 text-center">
            <p className="text-sage/60 text-sm">
              {searchQuery ? (
                <span>
                  Press <kbd className="px-1.5 py-0.5 bg-deep-700 rounded text-xs font-mono text-sage">Enter</kbd> to search for &quot;{searchQuery}&quot;
                </span>
              ) : (
                'Start typing to search 3,847 incentive programs...'
              )}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ask Us Modal */}
      <Dialog open={askUsOpen} onOpenChange={setAskUsOpen}>
        <DialogContent className="sm:max-w-md bg-deep border-deep-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2 font-sora">
              <div className="p-2 rounded-lg bg-teal-500/10">
                <MessageCircle className="w-5 h-5 text-teal-500" />
              </div>
              Ask Us Anything
            </DialogTitle>
            <DialogDescription className="text-sage">
              Have questions about incentives or need help with your project? We typically respond within 24 hours.
            </DialogDescription>
          </DialogHeader>

          {askUsSuccess ? (
            <div className="py-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold text-white font-sora mb-2">Question Sent!</h3>
              <p className="text-sage text-sm">We&apos;ll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleAskUsSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-sage-300">Your Question</label>
                <textarea
                  value={askUsQuestion}
                  onChange={(e) => setAskUsQuestion(e.target.value)}
                  className="mt-1 w-full min-h-[120px] resize-none rounded-lg border border-deep-700 bg-deep-800 px-3 py-2 text-sm text-white placeholder:text-sage/40 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                  placeholder="What would you like to know about incentives?"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-sage-300">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={askUsEmail}
                  onChange={(e) => setAskUsEmail(e.target.value)}
                  className="mt-1 border-deep-700 bg-deep-800 text-white placeholder:text-sage/40 focus:border-teal-500 focus-visible:ring-teal-500"
                />
                <p className="text-xs text-sage/60 mt-1">So we can respond to you</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-deep-700 text-sage hover:bg-deep-800 hover:text-white"
                  onClick={() => setAskUsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={askUsSubmitting || !askUsQuestion.trim()}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0"
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
