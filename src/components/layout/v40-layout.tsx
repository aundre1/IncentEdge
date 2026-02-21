'use client';

import { V40Header } from './v40-header';
import { TickerBar } from './ticker-bar';

interface V40LayoutProps {
  children: React.ReactNode;
}

export function V40Layout({ children }: V40LayoutProps) {
  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950">
      {/* V41: Ticker Bar - Bloomberg style market data */}
      <TickerBar />

      {/* V41: Header - Navy 100px with exact V40 styling */}
      <V40Header />

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-6 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
