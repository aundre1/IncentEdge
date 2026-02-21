/**
 * PricingTable Component
 *
 * Displays pricing tiers with features in a responsive table/card layout
 */

'use client';

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { PRODUCT_TIERS, formatPrice, calculateAnnualSavings } from '@/lib/stripe/products';
import { CheckoutButton } from './CheckoutButton';

/**
 * Billing interval type
 */
type BillingInterval = 'monthly' | 'annual';

/**
 * PricingTable props
 */
export interface PricingTableProps {
  /** Show annual billing toggle */
  showAnnualToggle?: boolean;
  /** Default billing interval */
  defaultInterval?: BillingInterval;
  /** Custom class name */
  className?: string;
  /** Callback when tier is selected */
  onTierSelect?: (tierId: string, interval: BillingInterval) => void;
}

/**
 * PricingTable component
 */
export function PricingTable({
  showAnnualToggle = true,
  defaultInterval = 'monthly',
  className = '',
  onTierSelect,
}: PricingTableProps) {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(defaultInterval);

  return (
    <div className={`w-full ${className}`}>
      {/* Billing interval toggle */}
      {showAnnualToggle && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'annual'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Annual
              <span className="ml-1.5 text-xs text-green-600 dark:text-green-400 font-semibold">
                Save 10%
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {PRODUCT_TIERS.map((tier) => {
          const isAnnual = billingInterval === 'annual';
          const price = isAnnual
            ? tier.annualPriceInCents || tier.priceInCents * 12
            : tier.priceInCents;
          const priceId = isAnnual
            ? tier.stripeAnnualPriceId || tier.stripePriceId
            : tier.stripePriceId;

          const savings = isAnnual && tier.annualPriceInCents
            ? calculateAnnualSavings(tier.priceInCents, tier.annualPriceInCents)
            : 0;

          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl border-2 p-8 flex flex-col ${
                tier.highlighted
                  ? 'border-blue-500 shadow-xl scale-105'
                  : 'border-gray-200 dark:border-gray-700'
              } bg-white dark:bg-gray-800 transition-transform hover:scale-105`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Tier name */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {tier.name}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(price, isAnnual ? 'year' : 'month').split('/')[0]}
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                {isAnnual && savings > 0 && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400 font-medium">
                    Save {savings}% vs monthly
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <div className="mb-6">
                <CheckoutButton
                  priceId={priceId}
                  tier={tier.id}
                  className={`w-full ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                      : 'bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600'
                  } text-white font-semibold py-3 px-6 rounded-lg transition-colors`}
                  onSuccess={() => onTierSelect?.(tier.id, billingInterval)}
                >
                  {tier.ctaText}
                </CheckoutButton>
              </div>

              {/* Features list */}
              <div className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key limits */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Projects</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {tier.limits.maxProjects === 'unlimited'
                        ? 'Unlimited'
                        : tier.limits.maxProjects}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Team Members</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {tier.limits.maxTeamMembers === 'unlimited'
                        ? 'Unlimited'
                        : tier.limits.maxTeamMembers}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">API Requests</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">
                      {tier.limits.maxApiRequests === 'unlimited'
                        ? 'Unlimited'
                        : `${(tier.limits.maxApiRequests as number).toLocaleString()}/mo`}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Support</dt>
                    <dd className="font-medium text-gray-900 dark:text-white capitalize">
                      {tier.limits.supportLevel}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Questions about pricing?{' '}
          <a
            href="/contact"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Contact our sales team
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Pricing comparison table
 */
export function PricingComparisonTable({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white">
              Feature
            </th>
            <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 dark:text-white">
              Solo
            </th>
            <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 dark:text-white">
              Team
            </th>
            <th className="py-4 px-6 text-center text-sm font-semibold text-gray-900 dark:text-white">
              Enterprise
            </th>
          </tr>
        </thead>
        <tbody>
          {PRODUCT_TIERS[0].features.map((_, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="py-3 px-6 text-sm text-gray-700 dark:text-gray-300">
                Feature {index + 1}
              </td>
              {PRODUCT_TIERS.map((tier) => (
                <td key={tier.id} className="py-3 px-6 text-center">
                  {tier.features[index] ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
