'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  HelpCircle,
  Shield,
  Zap,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingCard } from '@/components/PricingCard';
import { PRICING_TIERS, PricingTier } from '@/lib/stripe';

// FAQ data
const faqs = [
  {
    question: 'What is included in the free trial?',
    answer:
      'The 14-day free trial gives you full access to your selected plan features. No credit card required to start. You can cancel anytime during the trial without being charged.',
  },
  {
    question: 'Can I change plans later?',
    answer:
      'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be prorated for the remaining billing period. When downgrading, the new rate applies at your next billing date.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express, Discover) and can arrange ACH transfers for Enterprise customers.',
  },
  {
    question: 'What happens when I reach my analysis limit?',
    answer:
      'For Starter plans, you\'ll receive a notification when approaching your limit. You can upgrade to Pro for unlimited analyses or wait until your monthly quota resets.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 30-day money-back guarantee for annual subscriptions. Monthly subscriptions can be canceled anytime but are not refundable for partial months.',
  },
  {
    question: 'What\'s included in the Pilot Program discount?',
    answer:
      'Early adopters get 50% off for the first 12 months. This includes all features of your selected tier. After the pilot period, you\'ll transition to regular pricing with advance notice.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. We use bank-level encryption (AES-256) for data at rest and TLS 1.3 for data in transit. We\'re SOC 2 Type II compliant and never share your project data.',
  },
  {
    question: 'How does Enterprise pricing work?',
    answer:
      'Enterprise pricing is customized based on your organization\'s needs, including number of users, custom integrations, and support requirements. Contact our sales team for a quote.',
  },
];

// Value propositions
const valueProps = [
  {
    icon: Zap,
    title: 'Save 100+ Hours',
    description: 'Per project on incentive research and application prep',
  },
  {
    icon: Building2,
    title: '$500B+ Incentive Database',
    description: '24,000+ verified programs across all 50 states',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with bank-level encryption',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);
  const [showPilotPricing, setShowPilotPricing] = React.useState(true);

  const handleSelectTier = async (tier: PricingTier, usePilot: boolean) => {
    if (tier.id === 'enterprise') {
      // Redirect to contact page for enterprise
      router.push('/contact?plan=enterprise');
      return;
    }

    setIsLoading(tier.id);

    try {
      const priceId = usePilot ? tier.pilotPriceId : tier.priceId;

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
          trialDays: 14,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // You could add toast notification here
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-white font-bold text-sm">
              IE
            </div>
            <span className="font-semibold">IncentEdge</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Log in
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <Badge variant="info" className="mb-4">
            Limited Time: 50% Off Pilot Program
          </Badge>
          <h1 className="font-sora text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Choose the plan that fits your portfolio. All plans include a 14-day free
            trial with no credit card required.
          </p>

          {/* Pricing toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={cn(
                'text-sm',
                !showPilotPricing && 'text-foreground font-medium',
                showPilotPricing && 'text-muted-foreground'
              )}
            >
              Standard Pricing
            </span>
            <button
              onClick={() => setShowPilotPricing(!showPilotPricing)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                showPilotPricing ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              )}
              aria-label="Toggle pilot pricing"
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  showPilotPricing ? 'left-[22px]' : 'left-0.5'
                )}
              />
            </button>
            <span
              className={cn(
                'text-sm',
                showPilotPricing && 'text-foreground font-medium',
                !showPilotPricing && 'text-muted-foreground'
              )}
            >
              Pilot Pricing
              <Badge variant="success" className="ml-2">
                Save 50%
              </Badge>
            </span>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 pb-16">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <PricingCard
                key={tier.id}
                tier={tier}
                showPilotPricing={showPilotPricing}
                onSelect={handleSelectTier}
                isLoading={isLoading === tier.id}
              />
            ))}
          </div>
        </section>

        {/* Value Props */}
        <section className="border-y bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 py-16">
            <div className="grid gap-8 md:grid-cols-3">
              {valueProps.map((prop, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <prop.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{prop.title}</h3>
                    <p className="text-sm text-muted-foreground">{prop.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-center font-sora text-2xl font-bold">
            Compare Plan Features
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            All the features you need to maximize your incentive capture rate
          </p>

          <div className="mx-auto mt-10 max-w-4xl overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-4 text-left font-medium">Feature</th>
                  {PRICING_TIERS.map((tier) => (
                    <th
                      key={tier.id}
                      className={cn(
                        'pb-4 text-center font-medium',
                        tier.highlighted && 'text-blue-600 dark:text-blue-400'
                      )}
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-4 text-sm">Projects per month</td>
                  <td className="py-4 text-center text-sm">5</td>
                  <td className="py-4 text-center text-sm font-medium text-blue-600">
                    Unlimited
                  </td>
                  <td className="py-4 text-center text-sm">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 text-sm">Incentive analyses</td>
                  <td className="py-4 text-center text-sm">25/month</td>
                  <td className="py-4 text-center text-sm font-medium text-blue-600">
                    Unlimited
                  </td>
                  <td className="py-4 text-center text-sm">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 text-sm">Team members</td>
                  <td className="py-4 text-center text-sm">1</td>
                  <td className="py-4 text-center text-sm font-medium text-blue-600">
                    Up to 5
                  </td>
                  <td className="py-4 text-center text-sm">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 text-sm">AI recommendations</td>
                  <td className="py-4 text-center">
                    <span className="text-slate-300">-</span>
                  </td>
                  <td className="py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-500" />
                  </td>
                  <td className="py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-500" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-sm">Direct Pay checker</td>
                  <td className="py-4 text-center">
                    <span className="text-slate-300">-</span>
                  </td>
                  <td className="py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-500" />
                  </td>
                  <td className="py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-500" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-sm">API access</td>
                  <td className="py-4 text-center">
                    <span className="text-slate-300">-</span>
                  </td>
                  <td className="py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-500" />
                  </td>
                  <td className="py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-500" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-sm">Priority support</td>
                  <td className="py-4 text-center">
                    <span className="text-slate-300">-</span>
                  </td>
                  <td className="py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-500" />
                  </td>
                  <td className="py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-500" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-sm">Custom integrations</td>
                  <td className="py-4 text-center">
                    <span className="text-slate-300">-</span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-slate-300">-</span>
                  </td>
                  <td className="py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-500" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 text-sm">Dedicated account manager</td>
                  <td className="py-4 text-center">
                    <span className="text-slate-300">-</span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-slate-300">-</span>
                  </td>
                  <td className="py-4 text-center">
                    <Check className="mx-auto h-5 w-5 text-emerald-500" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <HelpCircle className="mx-auto h-10 w-10 text-blue-600" />
                <h2 className="mt-4 font-sora text-2xl font-bold">
                  Frequently Asked Questions
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Everything you need to know about IncentEdge billing
                </p>
              </div>

              <div className="mt-10 space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-white dark:bg-slate-800"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === index ? null : index)
                      }
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <span className="font-medium">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center text-white md:p-12">
            <h2 className="font-sora text-2xl font-bold md:text-3xl">
              Ready to Maximize Your Incentive Capture?
            </h2>
            <p className="mt-3 text-blue-100">
              Start your 14-day free trial today. No credit card required.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50"
                asChild
              >
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} IncentEdge. All rights reserved.</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link href="/legal/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
