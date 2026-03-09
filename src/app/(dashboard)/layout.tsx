'use client';

import { Suspense } from 'react';
import { V44Ticker } from '@/components/layout/v44-ticker';
import { V44Header } from '@/components/layout/v44-header';
import { V44Footer } from '@/components/layout/v44-footer';
import { DashboardErrorBoundary } from '@/components/DashboardErrorBoundary';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-deep-50 dark:bg-deep-950">
      {/* V44: Ticker Bar */}
      <V44Ticker />

      {/* V44: Header */}
      <V44Header />

      {/* Main Content — wrapped with error boundary and suspense for graceful degradation */}
      <main className="max-w-[1600px] mx-auto px-4 py-4 md:px-6 lg:px-8 mb-8">
        <DashboardErrorBoundary>
          <Suspense fallback={<DashboardSkeleton />}>
            {children}
          </Suspense>
        </DashboardErrorBoundary>
      </main>

      {/* V44: Footer */}
      <V44Footer />
    </div>
  );
}
