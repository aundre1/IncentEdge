import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, Building2, Leaf, DollarSign, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">IncentEdge</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-sm">
              <span className="mr-2">🚀</span>
              Infrastructure&apos;s Bloomberg Terminal for Incentives
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Transform from{' '}
              <span className="text-muted-foreground">20% minority partner</span>
              {' '}to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                55%+ majority owner
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              AI-powered incentive discovery, application, and monetization.
              Identify $168.7M+ in incentives in under 60 seconds vs. 200+ hours of manual research.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-muted/50">
          <div className="container grid gap-8 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'TAM', value: '$500B+', desc: 'Annual incentive market' },
              { label: 'Programs', value: '20,000+', desc: 'Federal, state, local' },
              { label: 'Success Rate', value: '85%', desc: 'Application approval' },
              { label: 'Time Savings', value: '99.5%', desc: 'vs manual research' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm font-medium">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Three Integrated Silos</h2>
            <p className="mt-4 text-muted-foreground">
              The only platform that integrates discovery, application, and monetization.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: 'Discovery Engine',
                desc: 'AI-powered analysis of 20,000+ programs with sub-60 second eligibility screening.',
                color: 'text-blue-500',
              },
              {
                icon: Leaf,
                title: 'Application Services',
                desc: 'AI-generated applications with 85% success rate, trained on 5M+ winning applications.',
                color: 'text-emerald-500',
              },
              {
                icon: DollarSign,
                title: 'Monetization Marketplace',
                desc: 'Connect with 50+ institutional buyers. Get 95-97 cents on the dollar vs 70-85 traditional.',
                color: 'text-amber-500',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <feature.icon className={`h-10 w-10 ${feature.color}`} />
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t bg-muted/50">
          <div className="container px-4 py-24 text-center">
            <div className="mx-auto max-w-2xl space-y-6">
              <Clock className="mx-auto h-12 w-12 text-primary" />
              <h2 className="text-3xl font-bold">
                Stop leaving money on the table
              </h2>
              <p className="text-muted-foreground">
                Join leading developers who have captured $1B+ in incentives with IncentEdge.
              </p>
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between px-4 text-sm text-muted-foreground">
          <div>© 2026 IncentEdge. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
