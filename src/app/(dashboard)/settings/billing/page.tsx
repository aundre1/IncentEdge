'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { PRICING_TIERS, formatPrice, PricingTier } from '@/lib/stripe';

// Mock data - in production, fetch from API
interface SubscriptionData {
  tier: string;
  status: 'active' | 'past_due' | 'trialing' | 'canceled';
  currentPeriodEnd: string;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface UsageData {
  projectsThisMonth: number;
  projectsLimit: number | 'unlimited';
  analysesThisMonth: number;
  analysesLimit: number | 'unlimited';
  teamMembers: number;
  teamMembersLimit: number | 'unlimited';
  lastAnalysisDate: string;
}

const mockSubscription: SubscriptionData = {
  tier: 'pro',
  status: 'active',
  currentPeriodEnd: '2026-02-18T00:00:00Z',
  trialEnd: null,
  cancelAtPeriodEnd: false,
};

const mockUsage: UsageData = {
  projectsThisMonth: 12,
  projectsLimit: 'unlimited',
  analysesThisMonth: 47,
  analysesLimit: 'unlimited',
  teamMembers: 3,
  teamMembersLimit: 5,
  lastAnalysisDate: '2026-01-18T14:30:00Z',
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  active: { label: 'Active', color: 'success', icon: CheckCircle2 },
  trialing: { label: 'Trial', color: 'info', icon: Clock },
  past_due: { label: 'Past Due', color: 'destructive', icon: AlertCircle },
  canceled: { label: 'Canceled', color: 'warning', icon: AlertCircle },
};

export default function BillingSettingsPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [subscription] = React.useState<SubscriptionData>(mockSubscription);
  const [usage] = React.useState<UsageData>(mockUsage);

  const currentTier = PRICING_TIERS.find((t) => t.id === subscription.tier);
  const statusInfo = statusConfig[subscription.status] || statusConfig.active;
  const StatusIcon = statusInfo.icon;

  const handleOpenPortal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      // Could add toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUsagePercentage = (
    used: number,
    limit: number | 'unlimited'
  ): number => {
    if (limit === 'unlimited') return 0;
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sora text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription, view usage, and update payment methods
        </p>
      </div>

      {/* Alert for past due or trial */}
      {subscription.status === 'past_due' && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">
                Payment Past Due
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Your last payment failed. Please update your payment method to
                continue using IncentEdge.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                onClick={handleOpenPortal}
              >
                Update Payment Method
              </Button>
            </div>
          </div>
        </div>
      )}

      {subscription.trialEnd && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200">
                Trial Period Active
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your free trial ends on {formatDate(subscription.trialEnd)}. Add a
                payment method to continue after the trial.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Current Plan</CardTitle>
              <Badge variant={statusInfo.color as 'success' | 'info' | 'destructive' | 'warning'}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{currentTier?.name}</span>
                <span className="text-muted-foreground">
                  {currentTier
                    ? `${formatPrice(currentTier.pilotPrice)}/mo`
                    : 'Free'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentTier?.description}
              </p>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing period</span>
                <span>Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next billing date</span>
                <span>{formatDate(subscription.currentPeriodEnd)}</span>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <div className="flex justify-between text-amber-600">
                  <span>Cancels on</span>
                  <span>{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleOpenPortal}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Manage Billing
            </Button>
            {subscription.tier !== 'enterprise' && (
              <Button asChild className="flex-1">
                <Link href="/pricing">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Usage This Month</CardTitle>
              <Badge variant="outline">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </Badge>
            </div>
            <CardDescription>
              Your current usage across all features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Projects */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span>Projects</span>
                </div>
                <span className="font-mono">
                  {usage.projectsThisMonth}
                  {usage.projectsLimit !== 'unlimited' && (
                    <span className="text-muted-foreground">
                      /{usage.projectsLimit}
                    </span>
                  )}
                  {usage.projectsLimit === 'unlimited' && (
                    <span className="text-muted-foreground ml-1">
                      (unlimited)
                    </span>
                  )}
                </span>
              </div>
              {usage.projectsLimit !== 'unlimited' && (
                <Progress
                  value={getUsagePercentage(
                    usage.projectsThisMonth,
                    usage.projectsLimit
                  )}
                  className="h-2"
                />
              )}
            </div>

            {/* Analyses */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>Incentive Analyses</span>
                </div>
                <span className="font-mono">
                  {usage.analysesThisMonth}
                  {usage.analysesLimit !== 'unlimited' && (
                    <span className="text-muted-foreground">
                      /{usage.analysesLimit}
                    </span>
                  )}
                  {usage.analysesLimit === 'unlimited' && (
                    <span className="text-muted-foreground ml-1">
                      (unlimited)
                    </span>
                  )}
                </span>
              </div>
              {usage.analysesLimit !== 'unlimited' && (
                <Progress
                  value={getUsagePercentage(
                    usage.analysesThisMonth,
                    usage.analysesLimit
                  )}
                  className="h-2"
                />
              )}
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 text-center text-muted-foreground">
                    @
                  </span>
                  <span>Team Members</span>
                </div>
                <span className="font-mono">
                  {usage.teamMembers}
                  {usage.teamMembersLimit !== 'unlimited' && (
                    <span className="text-muted-foreground">
                      /{usage.teamMembersLimit}
                    </span>
                  )}
                  {usage.teamMembersLimit === 'unlimited' && (
                    <span className="text-muted-foreground ml-1">
                      (unlimited)
                    </span>
                  )}
                </span>
              </div>
              {usage.teamMembersLimit !== 'unlimited' && (
                <Progress
                  value={getUsagePercentage(
                    usage.teamMembers,
                    usage.teamMembersLimit
                  )}
                  className="h-2"
                />
              )}
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground">
              Last analysis: {formatDate(usage.lastAnalysisDate)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Features */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Plan Features</CardTitle>
          <CardDescription>
            Features included in your {currentTier?.name} subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentTier?.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
        {subscription.tier !== 'enterprise' && (
          <CardFooter className="border-t bg-slate-50 dark:bg-slate-900/50">
            <div className="flex w-full items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Need more features?
              </span>
              <Button variant="link" asChild>
                <Link href="/pricing">
                  View all plans
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-1 p-4"
          onClick={handleOpenPortal}
          disabled={isLoading}
        >
          <CreditCard className="h-5 w-5" />
          <span className="font-medium">Update Payment</span>
          <span className="text-xs text-muted-foreground">
            Change card or billing info
          </span>
        </Button>

        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-1 p-4"
          onClick={handleOpenPortal}
          disabled={isLoading}
        >
          <Calendar className="h-5 w-5" />
          <span className="font-medium">Billing History</span>
          <span className="text-xs text-muted-foreground">
            View invoices and receipts
          </span>
        </Button>

        <Button
          variant="outline"
          className="h-auto flex-col items-start gap-1 p-4"
          asChild
        >
          <Link href="/contact">
            <ExternalLink className="h-5 w-5" />
            <span className="font-medium">Contact Support</span>
            <span className="text-xs text-muted-foreground">
              Get help with billing
            </span>
          </Link>
        </Button>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Billing is managed securely through Stripe. All prices are in USD.
        <br />
        Questions? Contact{' '}
        <a
          href="mailto:billing@incentedge.com"
          className="text-blue-600 hover:underline"
        >
          billing@incentedge.com
        </a>
      </p>
    </div>
  );
}
