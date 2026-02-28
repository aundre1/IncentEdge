// FILE: /Users/dremacmini/Desktop/OC/incentedge/Site/src/app/(dashboard)/help/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  MessageCircle,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const quickActions = [
  {
    title: 'Documentation',
    description: 'Browse guides, tutorials, and API docs',
    icon: BookOpen,
    buttonLabel: 'Open Docs',
    href: '/resources/guides',
    color: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    title: 'Ask a Question',
    description: 'Get help from our team within 24 hours',
    icon: MessageCircle,
    buttonLabel: 'Ask Us',
    href: 'mailto:support@incentedge.com',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Video Tutorials',
    description: 'Watch step-by-step walkthroughs',
    icon: PlayCircle,
    buttonLabel: 'Watch Videos',
    href: '#',
    color: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];

const faqItems = [
  {
    question: 'How does IncentEdge find eligible programs for my project?',
    answer:
      'Our AI analyzes your project details against 30,007+ verified incentive programs using a multi-factor eligibility engine. It evaluates jurisdiction, project type, construction type, energy efficiency, and dozens of other criteria to surface the most relevant opportunities.',
  },
  {
    question: 'What is IRA Direct Pay and how do I qualify?',
    answer:
      'IRA Section 6417 allows tax-exempt entities \u2014 including nonprofits, municipal governments, and tribal governments \u2014 to receive direct cash payments equivalent to clean energy tax credits. IncentEdge automatically flags Direct Pay eligible programs in your results.',
  },
  {
    question: 'How current is the program database?',
    answer:
      'Our database is updated daily. We track federal register publications, state legislative changes, and utility program announcements. Each program shows a \u2018freshness\u2019 indicator \u2014 live, fresh (updated <30 days), stale, or outdated.',
  },
  {
    question: 'Can I export my incentive analysis as a PDF?',
    answer:
      'Yes. From any project\u2019s analysis page, click \u2018Generate Report\u2019 to export a professional PDF with program details, eligibility scores, and application timelines. Pro subscribers get branded reports.',
  },
  {
    question: 'How do I add team members?',
    answer:
      'Go to Settings \u2192 Team & Permissions. Enter your teammate\u2019s email address, assign a role (Admin, Manager, Analyst, or Viewer), and send the invitation. They\u2019ll receive an email to join your organization.',
  },
  {
    question: 'What\u2019s the difference between match score and eligibility?',
    answer:
      'Match score (0\u2013100%) indicates how well your project aligns with a program based on all criteria. Eligibility is a binary pass/fail for the minimum requirements. A project can be eligible but have a lower match score if some optional criteria aren\u2019t met.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'Go to Settings \u2192 Billing and click \u2018Manage Billing\u2019 to access the Stripe customer portal. You can cancel anytime and you\u2019ll retain access until the end of your billing period.',
  },
  {
    question: 'Does IncentEdge cover international programs?',
    answer:
      'Currently, IncentEdge covers U.S. federal, state, local, and utility programs across all 50 states. International coverage is planned for Q3 2026.',
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  isLast,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <div className={cn(!isLast && 'border-b border-slate-200 dark:border-slate-700/50')}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-teal-600 dark:hover:text-teal-400"
      >
        <span className="font-medium text-navy-900 dark:text-white">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-teal-500 dark:text-teal-400" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        )}
      >
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora text-navy-900 dark:text-white">
            Help & Support
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Find answers, contact support, or explore our documentation
          </p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <Card key={action.title} className="card-v41">
            <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
              <div className={cn('rounded-xl p-3', action.color)}>
                <action.icon className={cn('h-7 w-7', action.iconColor)} />
              </div>
              <div>
                <h3 className="font-semibold font-sora text-navy-900 dark:text-white">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {action.description}
                </p>
              </div>
              <Button
                variant="outline"
                asChild
                className="w-full border-slate-200 dark:border-slate-700 hover:border-teal-500/50 hover:bg-teal-500/5 dark:hover:border-teal-400/50 dark:hover:bg-teal-500/5"
              >
                <Link href={action.href}>{action.buttonLabel}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-lg font-semibold font-sora text-navy-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <Card className="card-v41">
          <CardContent className="p-5 sm:p-6">
            {faqItems.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openFAQ === index}
                onToggle={() => toggleFAQ(index)}
                isLast={index === faqItems.length - 1}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Still Need Help CTA */}
      <Card className="card-v41 bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-700 dark:to-teal-800 text-white border-none">
        <CardContent className="flex flex-col items-center text-center py-10 px-6 space-y-4">
          <div className="rounded-full bg-white/20 p-3">
            <Mail className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-semibold font-sora">Still need help?</h3>
            <p className="text-sm text-teal-100 mt-1">
              Usually responds within 24 hours
            </p>
          </div>
          <Button variant="secondary" asChild>
            <a href="mailto:support@incentedge.com">
              Contact our team
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
