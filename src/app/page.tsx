'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Leaf, DollarSign, Clock, Shield, Zap, BarChart3, CheckCircle2 } from 'lucide-react';
import { V44Ticker } from '@/components/layout/v44-ticker';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-deep-50 dark:bg-deep-950">
      {/* Ticker */}
      <V44Ticker />

      {/* Header */}
      <header className="sticky top-0 z-50 h-[72px] bg-gradient-to-b from-deep-900 to-deep-800 border-b border-teal-500/20">
        <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 opacity-0 animate-logo-fade-in">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-400 flex items-center justify-center font-sora font-extrabold text-[15px] text-white shadow-lg shadow-teal-500/30 ring-1 ring-teal-300/40">
              IE
            </div>
            <div>
              <span className="font-sora font-bold text-[19px] text-deep-100 tracking-tight">
                Incent<em className="not-italic text-teal-400">Edge</em>
              </span>
              <div className="text-[9px] text-sage-500 uppercase tracking-[1.5px] font-medium -mt-0.5">
                Incentive Intelligence
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-[13px] text-sage-500 hover:text-deep-100 transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-[13px] text-sage-500 hover:text-deep-100 transition-colors">
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white text-[13px] font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-deep-900 via-deep-800 to-deep-50 dark:to-deep-950" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(40,122,137,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(40,122,137,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative max-w-[1200px] mx-auto px-6 py-24 md:py-32 text-center">
            <div className="inline-flex items-center rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-[12px] text-teal-300 mb-8">
              <Zap className="w-3.5 h-3.5 mr-2" />
              AI-Powered Incentive Intelligence — Every Sector, Every Program
            </div>

            <h1 className="font-sora text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              Transform from{' '}
              <span className="text-sage-400">20% minority partner</span>
              {' '}to{' '}
              <span className="bg-gradient-to-r from-teal-400 to-teal-300 bg-clip-text text-transparent">
                55%+ majority owner
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg text-sage-400 mb-10">
              AI-powered incentive discovery, application, and monetization.
              Identify $168.7M+ in incentives in under 60 seconds vs. 200+ hours of manual research.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white text-[14px] font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-sage-300/30 text-sage-300 text-[14px] font-semibold hover:bg-sage-500/5 transition-all"
              >
                Watch Demo
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-[13px] font-mono">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-teal-500/20 bg-teal-500/5">
                <Shield className="w-4 h-4 text-teal-400" />
                <span className="text-teal-300 font-semibold">SOC 2</span>
                <span className="text-sage-300">Compliant</span>
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-green-500/20 bg-green-500/5">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-semibold">92%</span>
                <span className="text-sage-300">AI Accuracy</span>
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-teal-500/20 bg-teal-500/5">
                <BarChart3 className="w-4 h-4 text-teal-400" />
                <span className="text-teal-300 font-semibold">24,458</span>
                <span className="text-sage-300">Programs</span>
              </span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-deep-200 dark:border-teal-500/10 bg-white/50 dark:bg-deep-900/50">
          <div className="max-w-[1200px] mx-auto grid gap-8 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'TAM', value: '$500B+', desc: 'Annual incentive market' },
              { label: 'Programs', value: '24,458+', desc: 'Federal, state, local' },
              { label: 'Success Rate', value: '85%', desc: 'Application approval' },
              { label: 'Time Savings', value: '99.5%', desc: 'vs manual research' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-3xl font-bold text-teal-500">{stat.value}</div>
                <div className="text-sm font-semibold text-deep-600 dark:text-sage-400 mt-1">{stat.label}</div>
                <div className="text-xs text-deep-500 dark:text-sage-500">{stat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-[1200px] mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="font-sora text-3xl font-bold text-deep-950 dark:text-deep-100">Three Integrated Silos</h2>
            <p className="mt-4 text-deep-500 dark:text-sage-500">
              The only platform that integrates discovery, application, and monetization.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: 'Discovery Engine',
                desc: 'AI-powered analysis of 24,000+ programs with sub-60 second eligibility screening.',
                color: 'text-teal-500',
                bg: 'bg-teal-500/10',
              },
              {
                icon: Leaf,
                title: 'Application Services',
                desc: 'AI-generated applications with 85% success rate, trained on 5M+ winning applications.',
                color: 'text-green-500',
                bg: 'bg-green-500/10',
              },
              {
                icon: DollarSign,
                title: 'Monetization Marketplace',
                desc: 'Connect with 50+ institutional buyers. Get 95-97 cents on the dollar vs 70-85 traditional.',
                color: 'text-sage-600',
                bg: 'bg-sage-500/10',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-deep-200 dark:border-teal-500/10 bg-white dark:bg-deep-900 p-6 shadow-sm hover:border-teal-400 hover:shadow-md transition-all"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="mt-4 font-sora text-lg font-semibold text-deep-950 dark:text-deep-100">{feature.title}</h3>
                <p className="mt-2 text-sm text-deep-500 dark:text-sage-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-deep-200 dark:border-teal-500/10 bg-white/50 dark:bg-deep-900/50">
          <div className="max-w-[1200px] mx-auto px-6 py-24 text-center">
            <Clock className="mx-auto h-12 w-12 text-teal-500 mb-6" />
            <h2 className="font-sora text-3xl font-bold text-deep-950 dark:text-deep-100">
              Stop leaving money on the table
            </h2>
            <p className="mt-4 text-deep-500 dark:text-sage-500 max-w-xl mx-auto">
              Join leading developers who have captured $1B+ in incentives with IncentEdge.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white text-[14px] font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-deep-900 border-t border-teal-500/20">
        <div className="max-w-[1400px] mx-auto flex h-16 items-center justify-between px-6 text-sm text-sage-500">
          <div>&copy; 2026 IncentEdge. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-deep-100 transition-colors">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-deep-100 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
