'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Leaf, DollarSign, Clock, Shield, Zap, BarChart3, CheckCircle2, Search, ChevronRight } from 'lucide-react';
import { V44Ticker } from '@/components/layout/v44-ticker';
import { IncentiveSearchAutocomplete } from '@/components/IncentiveSearchAutocomplete';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-deep-950">
      {/* Ticker */}
      <V44Ticker />

      {/* Header */}
      <header className="sticky top-0 z-50 h-[72px] bg-white/95 dark:bg-deep-950/95 backdrop-blur-sm border-b border-deep-100 dark:border-deep-800">
        <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 opacity-0 animate-logo-fade-in">
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
            <Link href="/pricing" className="text-[13px] text-deep-600 dark:text-sage-400 hover:text-deep-900 dark:hover:text-deep-100 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-[13px] text-deep-600 dark:text-sage-400 hover:text-deep-900 dark:hover:text-deep-100 transition-colors">
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

      <main className="flex-1">
        {/* Hero */}
        <section className="relative">
          <div className="max-w-[1200px] mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-teal-200 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/20 px-4 py-1.5 text-[12px] text-teal-700 dark:text-teal-300 mb-8">
                <Zap className="w-3.5 h-3.5 mr-2" />
                AI-Powered Incentive Intelligence — All Sectors, 50 States
              </div>

              <h1 className="font-sora text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight text-deep-900 dark:text-white leading-[1.1] mb-6">
                The incentive intelligence platform for{' '}
                <span className="text-teal-500">infrastructure investors</span>
              </h1>

              <p className="text-lg text-deep-500 dark:text-sage-400 mb-10 leading-relaxed max-w-2xl">
                Discover, analyze, and capture incentives across 30,007+ programs.
                What takes consultants 200+ hours, IncentEdge delivers in under 60 seconds.
              </p>

              {/* Search Bar */}
              <div className="mb-10">
                <IncentiveSearchAutocomplete
                  variant="hero"
                  placeholder="Search 30,007 programs — try &quot;NYSERDA&quot;, &quot;ITC&quot;, or &quot;solar&quot;..."
                />
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-deep-900 dark:bg-teal-600 text-white text-[14px] font-semibold hover:bg-deep-800 dark:hover:bg-teal-500 transition-colors"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 dark:border-deep-700 text-deep-700 dark:text-sage-300 text-[14px] font-semibold hover:bg-deep-50 dark:hover:bg-deep-800 transition-colors"
                >
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-y border-deep-100 dark:border-deep-800">
          <div className="max-w-[1200px] mx-auto grid gap-0 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-deep-100 dark:divide-deep-800">
            {[
              { label: 'TAM', value: '$500B+', desc: 'Annual incentive market' },
              { label: 'Programs', value: '30,007+', desc: 'Federal, state & local' },
              { label: 'Success Rate', value: '85%', desc: 'Application approval' },
              { label: 'Time Savings', value: '99.5%', desc: 'vs manual research' },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-8 text-center">
                <div className="font-mono text-2xl font-bold text-deep-900 dark:text-white">{stat.value}</div>
                <div className="text-xs font-semibold text-deep-500 dark:text-sage-400 mt-1 uppercase tracking-wider">{stat.label}</div>
                <div className="text-xs text-sage-500 mt-0.5">{stat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="mb-14">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100">Three Integrated Silos</h2>
            <p className="mt-3 text-deep-500 dark:text-sage-500 max-w-xl">
              The only platform that integrates discovery, application, and monetization into a single workflow.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: 'Discovery Engine',
                desc: 'AI-powered analysis of 30,007+ programs with sub-60 second eligibility screening across all 50 states.',
                color: 'text-teal-500',
                bg: 'bg-teal-50 dark:bg-teal-900/20',
                border: 'border-teal-100 dark:border-teal-800/30',
              },
              {
                icon: Leaf,
                title: 'Application Services',
                desc: 'AI-generated applications with 85% success rate, trained on millions of winning applications.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                border: 'border-emerald-100 dark:border-emerald-800/30',
              },
              {
                icon: DollarSign,
                title: 'Monetization Marketplace',
                desc: 'Connect with 50+ institutional buyers. Get 95-97 cents on the dollar vs 70-85 traditional.',
                color: 'text-deep-600 dark:text-sage-300',
                bg: 'bg-deep-50 dark:bg-deep-800/50',
                border: 'border-deep-100 dark:border-deep-700',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`rounded-xl border ${feature.border} ${feature.bg} p-6 hover:shadow-sm transition-all`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-deep-900 shadow-sm border border-deep-100 dark:border-deep-700`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="mt-4 font-sora text-lg font-semibold text-deep-900 dark:text-deep-100">{feature.title}</h3>
                <p className="mt-2 text-sm text-deep-500 dark:text-sage-500 leading-relaxed">
                  {feature.desc}
                </p>
                <Link
                  href="/signup"
                  className={`inline-flex items-center gap-1 mt-4 text-sm font-medium ${feature.color} hover:underline`}
                >
                  Learn more
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/50">
          <div className="max-w-[1200px] mx-auto px-6 py-16">
            <div className="flex flex-wrap items-center justify-center gap-8 text-[13px] font-mono">
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-900">
                <Shield className="w-4 h-4 text-teal-500" />
                <span className="font-semibold text-deep-900 dark:text-deep-100">SOC 2</span>
                <span className="text-sage-500">Compliant</span>
              </span>
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-deep-900 dark:text-deep-100">92%</span>
                <span className="text-sage-500">AI Accuracy</span>
              </span>
              <span className="flex items-center gap-2 px-4 py-2 rounded-lg border border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-900">
                <BarChart3 className="w-4 h-4 text-teal-500" />
                <span className="font-semibold text-deep-900 dark:text-deep-100">30,007</span>
                <span className="text-sage-500">Programs</span>
              </span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-deep-100 dark:border-deep-800">
          <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
            <h2 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100">
              Stop leaving money on the table
            </h2>
            <p className="mt-4 text-deep-500 dark:text-sage-500 max-w-xl mx-auto">
              Join leading developers who have captured $1B+ in incentives with IncentEdge.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 rounded-lg bg-deep-900 dark:bg-teal-600 text-white text-[14px] font-semibold hover:bg-deep-800 dark:hover:bg-teal-500 transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-950">
        <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-6 text-sm text-sage-500">
          <div>&copy; 2026 IncentEdge. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-deep-900 dark:hover:text-deep-100 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
