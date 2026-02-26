'use client';

import { tickerItems } from '@/data/incentives';
import { cn } from '@/lib/utils';

export function V44Ticker() {
  const items = tickerItems;

  // Duplicate items for seamless infinite scroll
  const duplicated = [...items, ...items];

  return (
    <div className="relative h-8 bg-deep overflow-hidden select-none z-50">
      <div
        className="flex items-center h-full gap-8 animate-ticker-scroll hover:[animation-play-state:paused] whitespace-nowrap"
      >
        {duplicated.map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="flex items-center gap-2 shrink-0"
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-sage">
              {item.label}
            </span>
            <span className="text-xs font-semibold text-white">
              {item.value}
            </span>
            {item.badge && (
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm',
                  item.badgeType === 'new' && 'bg-emerald-500/20 text-emerald-400',
                  item.badgeType === 'urgent' && 'bg-amber-500/20 text-amber-400'
                )}
              >
                {item.badge}
              </span>
            )}
            <span className="text-deep-600 mx-2">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
