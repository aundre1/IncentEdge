'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Leaf, DollarSign, Clock, Shield, Zap, BarChart3, CheckCircle2, ChevronRight } from 'lucide-react';
import { V44Ticker } from '@/components/layout/v44-ticker';
import RegistrationModal from '@/components/RegistrationModal';
import { PRICING_TIERS } from '@/lib/stripe';
import sampleIncentivesData from '@/data/sample-incentives.json';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollToSamples = () => {
    const element = document.getElementById('sample-results');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

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
                Find Your Incentives in 60 Seconds
              </h1>

              <p className="text-lg text-deep-500 dark:text-sage-400 mb-10 leading-relaxed max-w-2xl">
                Discover, analyze, and capture incentives across 30,007+ programs.
                What takes consultants 200+ hours, IncentEdge delivers in under 60 seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <button
                  onClick={scrollToSamples}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-teal-600 dark:bg-teal-600 text-white text-[14px] font-semibold hover:bg-teal-700 dark:hover:bg-teal-500 transition-colors"
                >
                  See Free Sample
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-deep-200 dark:border-deep-700 text-deep-700 dark:text-sage-300 text-[14px] font-semibold hover:bg-deep-50 dark:hover:bg-deep-800 transition-colors"
                >
                  Start Free Trial
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
              { label: 'Time Saved', value: '100+ Hours', desc: 'Per project analyzed' },
              { label: 'Accuracy', value: '92%', desc: 'AI-powered matching' },
            ].map((stat) => (
              <div key={stat.label} className="px-6 py-8 text-center">
                <div className="font-mono text-2xl font-bold text-deep-900 dark:text-white">{stat.value}</div>
                <div className="text-xs font-semibold text-deep-500 dark:text-sage-400 mt-1 uppercase tracking-wider">{stat.label}</div>
                <div className="text-xs text-sage-500 mt-0.5">{stat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Sample Results Section */}
        <section id="sample-results" className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="mb-14">
            <h2 className="font-sora text-3xl md:text-4xl font-bold text-deep-900 dark:text-deep-100 mb-2">
              10 Programs Your Project May Qualify For
            </h2>
            <p className="text-deep-500 dark:text-sage-400 max-w-2xl">
              Here's a sample of incentive opportunities we found based on common renewable energy and efficiency projects.
            </p>
          </div>

          {/* Incentive Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {sampleIncentivesData.programs.map((incentive) => (
              <div
                key={incentive.id}
                className="rounded-xl border border-deep-100 dark:border-deep-800 bg-white dark:bg-deep-900 p-6 hover:shadow-md transition-all hover:border-teal-200 dark:hover:border-teal-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-sora font-semibold text-lg text-deep-900 dark:text-deep-100">
                      {incentive.name}
                    </h3>
                  </div>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-teal-100 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300">
                    {incentive.jurisdiction}
                  </span>
                </div>

                <p className="text-sm text-deep-600 dark:text-sage-400 mb-4 leading-relaxed">
                  {incentive.description}
                </p>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {incentive.estimatedValue}
                  </span>
                  <span className="text-xs text-deep-500 dark:text-sage-500">estimated value</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-deep-100 dark:border-deep-800">
                  <span className="text-xs font-medium text-deep-500 dark:text-sage-400">
                    {incentive.programType}
                  </span>
                  <button className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
                    Learn More
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section Below Samples */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-2xl border border-teal-100 dark:border-teal-800 p-12 text-center">
            <h3 className="font-sora text-2xl md:text-3xl font-bold text-deep-900 dark:text-deep-100 mb-3">
              Get Your Full Analysis
            </h3>
            <p className="text-deep-600 dark:text-sage-400 mb-8 max-w-xl mx-auto">
              Download a comprehensive PDF report with all matching incentives, eligibility analysis, and next steps for your specific project.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-[14px] font-semibold transition-colors"
            >
              Download Full Report
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="border-t border-deep-100 dark:border-deep-800 bg-deep-50/50 dark:bg-deep-900/30">
          <div className="max-w-[1200px] mx-auto px-6 py-20">
            <div className="mb-14 text-center">
              <h2 className="font-sora text-3xl md:text-4xl font-bold text-deep-900 dark:text-deep-100 mb-2">
                Simple, Transparent Pricing
              </h2>
              <p className="text-deep-500 dark:text-sage-400 max-w-2xl mx-auto">
                Choose the plan that fits your portfolio. All plans include a 14-day free trial with no credit card required.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mb-12">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`rounded-xl border p-8 transition-all ${
                    tier.highlighted
                      ? 'border-teal-500 bg-white dark:bg-deep-800 shadow-lg shadow-teal-500/10 ring-2 ring-teal-500/30'
                      : 'border-deep-200 dark:border-deep-700 bg-white dark:bg-deep-900'
                  }`}
                >
                  {tier.highlighted && (
                    <div className="inline-block mb-4 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/30 text-xs font-semibold text-teal-700 dark:text-teal-300">
                      Most Popular
                    </div>
                  )}

                  <h3 className="font-sora text-2xl font-bold text-deep-900 dark:text-deep-100 mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-deep-500 dark:text-sage-400 text-sm mb-6">
                    {tier.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-deep-900 dark:text-white">
                      ${tier.monthlyPrice}
                    </span>
                    <span className="text-deep-500 dark:text-sage-400 ml-2">/month</span>
                  </div>

                  <button
                    onClick={() => {
                      if (tier.id === 'enterprise') {
                        window.location.href = '/contact?plan=enterprise';
                      } else {
                        window.location.href = '/signup';
                      }
                    }}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors mb-8 ${
                      tier.highlighted
                        ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white'
                        : 'bg-deep-100 hover:bg-deep-200 dark:bg-deep-800 dark:hover:bg-deep-700 text-deep-900 dark:text-deep-100'
                    }`}
                  >
                    {tier.id === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </button>

                  <ul className="space-y-4">
                    {tier.features.slice(0, 6).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-deep-600 dark:text-sage-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Value Props */}
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                { icon: Zap, title: 'Save 100+ Hours', desc: 'Per project on incentive research' },
                { icon: Building2, title: '30,007+ Programs', desc: 'Verified across all 50 states' },
                { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 compliant encryption' },
              ].map((prop, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-teal-100 dark:bg-teal-900/30">
                      <prop.icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-deep-900 dark:text-deep-100">{prop.title}</h3>
                    <p className="text-sm text-deep-500 dark:text-sage-400">{prop.desc}</p>
                  </div>
                </div>
              ))}
            </div>
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

        {/* Final CTA */}
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

      {/* Registration Modal */}
      <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

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
