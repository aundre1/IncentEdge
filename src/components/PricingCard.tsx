'use client';

import * as React from 'react';
import { Check, Zap, Building2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PricingTier, formatPrice, calculateSavings } from '@/lib/stripe';

interface PricingCardProps {
  tier: PricingTier;
  showPilotPricing?: boolean;
  onSelect?: (tier: PricingTier, usePilot: boolean) => void;
  isLoading?: boolean;
  currentTier?: string;
}

const tierIcons: Record<string, React.ReactNode> = {
  starter: <Building2 className="h-6 w-6" />,
  pro: <Zap className="h-6 w-6" />,
  enterprise: <Sparkles className="h-6 w-6" />,
};

export function PricingCard({
  tier,
  showPilotPricing = true,
  onSelect,
  isLoading = false,
  currentTier,
}: PricingCardProps) {
  const isCurrentPlan = currentTier === tier.id;
  const isEnterprise = tier.id === 'enterprise';
  const displayPrice = showPilotPricing && tier.pilotPrice > 0 ? tier.pilotPrice : tier.monthlyPrice;
  const savings = calculateSavings(tier.monthlyPrice, tier.pilotPrice);

  const handleClick = () => {
    if (onSelect && !isCurrentPlan) {
      onSelect(tier, showPilotPricing && tier.pilotPrice > 0);
    }
  };

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all duration-200',
        tier.highlighted && 'border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]',
        isCurrentPlan && 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
      )}
    >
      {/* Popular badge */}
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-blue-600 text-white hover:bg-blue-600">
            Most Popular
          </Badge>
        </div>
      )}

      {/* Current plan badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="success">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        {/* Icon */}
        <div
          className={cn(
            'mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl',
            tier.highlighted
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          )}
        >
          {tierIcons[tier.id]}
        </div>

        <CardTitle className="text-xl font-semibold">{tier.name}</CardTitle>
        <CardDescription className="text-sm">{tier.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Pricing */}
        <div className="text-center">
          {isEnterprise ? (
            <div className="space-y-1">
              <p className="text-3xl font-bold">Custom</p>
              <p className="text-sm text-muted-foreground">Contact us for pricing</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Pilot discount badge */}
              {showPilotPricing && savings > 0 && (
                <Badge variant="warning" className="mb-2">
                  {savings}% OFF Pilot Program
                </Badge>
              )}

              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{formatPrice(displayPrice)}</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              {/* Original price strikethrough */}
              {showPilotPricing && savings > 0 && (
                <p className="text-sm text-muted-foreground">
                  <span className="line-through">{formatPrice(tier.monthlyPrice)}</span>
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                    Save {formatPrice(tier.monthlyPrice - tier.pilotPrice)}/mo
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  tier.highlighted
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                )}
              >
                <Check className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          className={cn(
            'w-full',
            tier.highlighted && 'bg-blue-600 hover:bg-blue-700',
            isCurrentPlan && 'bg-emerald-600 hover:bg-emerald-700'
          )}
          variant={isCurrentPlan ? 'default' : tier.highlighted ? 'default' : 'outline'}
          size="lg"
          onClick={handleClick}
          disabled={isLoading || isCurrentPlan}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </span>
          ) : isCurrentPlan ? (
            'Current Plan'
          ) : (
            tier.ctaText
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Simplified card for embedding in other pages
interface PricingCardSimpleProps {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  ctaText: string;
  priceId: string;
  onSelect?: () => void;
  isLoading?: boolean;
}

export function PricingCardSimple({
  name,
  price,
  features,
  highlighted = false,
  ctaText,
  onSelect,
  isLoading = false,
}: PricingCardSimpleProps) {
  return (
    <Card className={cn('relative', highlighted && 'border-blue-500 shadow-lg')}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-blue-600 text-white">Most Popular</Badge>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle>{name}</CardTitle>
        <p className="text-3xl font-bold">{price}</p>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2">
          {features.slice(0, 5).map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={highlighted ? 'default' : 'outline'}
          onClick={onSelect}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}
