'use client';

import { Shield, Zap, Database, Clock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustBadge {
  icon: React.ElementType;
  text: string;
}

const badges: TrustBadge[] = [
  { icon: Shield, text: 'SOC 2 Compliant' },
  { icon: Zap, text: 'AI-Powered \u00B7 92% Accuracy' },
  { icon: Database, text: '3,847 Programs' },
  { icon: Clock, text: 'Updated 4 min ago' },
  { icon: Globe, text: 'NYSERDA PON Funded' },
];

export function V44TrustBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.text}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5',
              'rounded-md border text-xs font-medium',
              'bg-sage-100 dark:bg-deep-800 border-sage-300 dark:border-teal-800/30',
              'text-deep-600 dark:text-sage-400'
            )}
          >
            <Icon className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400 shrink-0" />
            <span>{badge.text}</span>
          </div>
        );
      })}
    </div>
  );
}
