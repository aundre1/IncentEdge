import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface IncentiveHeaderProps {
  breadcrumbs: BreadcrumbItem[];
}

export function IncentiveHeader({ breadcrumbs }: IncentiveHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-[72px] bg-white/95 backdrop-blur-sm border-b border-deep-100">
      <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center font-sora font-extrabold text-[15px] text-white shadow-lg shadow-teal-500/30 ring-2 ring-teal-300/50">
            IE
          </div>
          <div>
            <span className="font-sora font-bold text-[19px] text-deep-900 tracking-tight">
              Incent<em className="not-italic text-teal-500">Edge</em>
            </span>
            <div className="text-[9px] text-sage-500 uppercase tracking-[1.5px] font-medium -mt-0.5">
              Incentive Intelligence
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/incentives" className="text-[13px] text-deep-600 hover:text-deep-900 transition-colors">
            Incentives
          </Link>
          <Link href="/pricing" className="text-[13px] text-deep-600 hover:text-deep-900 transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="text-[13px] text-deep-600 hover:text-deep-900 transition-colors">
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-deep-900 text-white text-[13px] font-semibold hover:bg-deep-800 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </div>

      {/* Breadcrumb row */}
      <div className="bg-deep-50 border-b border-deep-100">
        <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center gap-1.5 text-[12px]">
          <Link href="/" className="text-deep-500 hover:text-deep-800 transition-colors">Home</Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-deep-300" />
              {crumb.href ? (
                <Link href={crumb.href} className="text-deep-500 hover:text-deep-800 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-deep-800 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

export function IncentiveCTA({ headline, sub }: { headline: string; sub: string }) {
  return (
    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 p-10 md:p-14 text-center">
      <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 mb-3">
        {headline}
      </h2>
      <p className="text-deep-600 mb-8 max-w-xl mx-auto">{sub}</p>
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-semibold transition-colors"
      >
        Get Started Free
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export function IncentiveFooter() {
  return (
    <footer className="border-t border-deep-100 bg-white">
      <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-6 text-sm text-sage-500">
        <div>&copy; 2026 IncentEdge. All rights reserved.</div>
        <div className="flex gap-6">
          <Link href="/legal/privacy" className="hover:text-deep-900 transition-colors">Privacy</Link>
          <Link href="/legal/terms" className="hover:text-deep-900 transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
