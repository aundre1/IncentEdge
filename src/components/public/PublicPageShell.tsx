import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PublicPageShellProps {
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

export function PublicPageShell({ breadcrumbs, children }: PublicPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-deep-950">
      {/* Public Header */}
      <header className="sticky top-0 z-50 h-[72px] bg-white/95 dark:bg-deep-950/95 backdrop-blur-sm border-b border-deep-100 dark:border-deep-800">
        <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center font-sora font-extrabold text-[15px] text-white shadow-lg shadow-teal-500/30 ring-2 ring-teal-300/50">
              IE
            </div>
            <div>
              <span className="font-sora font-bold text-[19px] text-deep-900 dark:text-deep-100 tracking-tight">
                Incent<em className="not-italic text-teal-500">Edge</em>
              </span>
              <div className="text-[9px] text-sage-500 uppercase tracking-[1.5px] font-medium -mt-0.5">
                Incentive Intelligence
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/use-cases"
              className="text-[13px] text-deep-600 dark:text-sage-400 hover:text-deep-900 dark:hover:text-deep-100 transition-colors"
            >
              Use Cases
            </Link>
            <Link
              href="/developers"
              className="text-[13px] text-deep-600 dark:text-sage-400 hover:text-deep-900 dark:hover:text-deep-100 transition-colors"
            >
              Developers
            </Link>
            <Link
              href="/pricing"
              className="text-[13px] text-deep-600 dark:text-sage-400 hover:text-deep-900 dark:hover:text-deep-100 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-[13px] text-deep-600 dark:text-sage-400 hover:text-deep-900 dark:hover:text-deep-100 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-deep-900 dark:bg-teal-600 text-white text-[13px] font-semibold hover:bg-deep-800 dark:hover:bg-teal-500 transition-colors"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="border-b border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30"
        >
          <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center gap-1.5 text-[12px] text-deep-500 dark:text-sage-500">
            <Link
              href="/"
              className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors"
            >
              Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-deep-300 dark:text-deep-600" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-deep-900 dark:text-deep-100 font-medium">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        </nav>
      )}

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-950">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center font-sora font-bold text-[13px] text-white">
                  IE
                </div>
                <span className="font-sora font-bold text-[16px] text-deep-900 dark:text-deep-100">
                  Incent<em className="not-italic text-teal-500">Edge</em>
                </span>
              </div>
              <p className="text-[13px] text-deep-500 dark:text-sage-500 leading-relaxed">
                AI-powered incentive intelligence for clean energy, real estate, and finance teams.
              </p>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-deep-400 dark:text-sage-600 mb-3">
                Use Cases
              </h4>
              <ul className="space-y-2">
                {[
                  { label: 'For Developers', href: '/use-cases/developers' },
                  { label: 'For Finance Teams', href: '/use-cases/finance-teams' },
                  { label: 'For Real Estate', href: '/use-cases/real-estate' },
                  { label: 'For Clean Energy', href: '/use-cases/clean-energy' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-deep-500 dark:text-sage-500 hover:text-deep-900 dark:hover:text-deep-100 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-deep-400 dark:text-sage-600 mb-3">
                Developers
              </h4>
              <ul className="space-y-2">
                {[
                  { label: 'Developer Hub', href: '/developers' },
                  { label: 'API Reference', href: '/developers/api' },
                  { label: 'Quick Start', href: '/developers/quickstart' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-deep-500 dark:text-sage-500 hover:text-deep-900 dark:hover:text-deep-100 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-deep-400 dark:text-sage-600 mb-3">
                Company
              </h4>
              <ul className="space-y-2">
                {[
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Privacy Policy', href: '/legal/privacy' },
                  { label: 'Terms of Service', href: '/legal/terms' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[13px] text-deep-500 dark:text-sage-500 hover:text-deep-900 dark:hover:text-deep-100 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-deep-100 dark:border-deep-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-sage-500">
            <span>&copy; 2026 IncentEdge. All rights reserved.</span>
            <span>217,000+ programs. 50 states. Real-time data.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
