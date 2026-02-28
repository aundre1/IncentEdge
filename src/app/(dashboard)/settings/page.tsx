// FILE: /Users/dremacmini/Desktop/OC/incentedge/Site/src/app/(dashboard)/settings/page.tsx
'use client';

import Link from 'next/link';
import {
  User,
  CreditCard,
  Bell,
  Users,
  Shield,
  Plug,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const settingSections = [
  {
    title: 'Account & Profile',
    description: 'Update your name, email, and contact information',
    icon: User,
    href: '/settings/profile',
    badge: null,
  },
  {
    title: 'Billing & Subscription',
    description: 'Manage your plan, payment methods, and invoices',
    icon: CreditCard,
    href: '/settings/billing',
    badge: 'Pro',
  },
  {
    title: 'Notifications',
    description: 'Control which alerts and emails you receive',
    icon: Bell,
    href: '/settings/notifications',
    badge: null,
  },
  {
    title: 'Team & Permissions',
    description: 'Invite team members and manage access roles',
    icon: Users,
    href: '/settings/team',
    badge: null,
  },
  {
    title: 'Security',
    description: 'Password, two-factor authentication, and sessions',
    icon: Shield,
    href: '/settings/security',
    badge: null,
  },
  {
    title: 'API & Integrations',
    description: 'API keys, webhooks, and third-party integrations',
    icon: Plug,
    href: '/settings/integrations',
    badge: null,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sora text-navy-900 dark:text-white">
            Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your account, preferences, and subscription
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {settingSections.map((section) => (
          <Link key={section.title} href={section.href} className="group">
            <Card className="card-v41 hover:border-teal-500/50 hover:bg-teal-500/5 dark:hover:border-teal-400/50 dark:hover:bg-teal-500/5 transition-colors h-full">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-lg bg-teal-100 p-2.5 dark:bg-teal-900/30 shrink-0">
                  <section.icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-navy-900 dark:text-white">
                      {section.title}
                    </h3>
                    {section.badge && (
                      <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-transparent text-xs">
                        {section.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {section.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Danger Zone */}
      <Card className="card-v41 border-red-200 dark:border-red-900/50">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-100 p-2.5 dark:bg-red-900/30 shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-red-700 dark:text-red-400">
                  Danger Zone
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  This action cannot be undone. All your data, projects, and analyses will be permanently deleted.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 shrink-0"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        IncentEdge v44.0 · Need help?{' '}
        <Link
          href="/help"
          className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
        >
          Contact Support
        </Link>
      </p>
    </div>
  );
}
