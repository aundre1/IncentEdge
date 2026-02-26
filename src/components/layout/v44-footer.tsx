'use client';

import { cn } from '@/lib/utils';

export function V44Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-8 bg-deep z-30 border-t border-deep-700/50">
      <div className="h-full max-w-[1600px] mx-auto px-4 lg:px-6 flex items-center justify-between">
        {/* Left: System status */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-[11px] text-sage tracking-wide">
            All Systems Operational
          </span>
        </div>

        {/* Right: Metrics */}
        <div className="hidden sm:flex items-center gap-4 font-mono text-[11px] text-sage tracking-wide">
          <span>
            DB: <span className="text-sage-300">3,847 programs</span>
          </span>
          <span className="text-deep-600">|</span>
          <span>
            API: <span className="text-emerald-400">156ms</span>
          </span>
          <span className="text-deep-600">|</span>
          <span>
            Uptime: <span className="text-sage-300">99.99%</span>
          </span>
          <span className="text-deep-600">|</span>
          <span className="text-sage/50">v44.0</span>
        </div>
      </div>
    </footer>
  );
}
