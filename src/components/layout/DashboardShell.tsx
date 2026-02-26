'use client';

import { usePathname } from 'next/navigation';
import { DashboardNav } from './DashboardNav';

/**
 * DashboardShell wraps page content with the DashboardNav component.
 * It auto-detects the current tab from the URL pathname.
 *
 * Rendered inside the (dashboard) layout, below V40Layout header.
 * Uses negative margins to break out of the <main> padding so the nav
 * stretches full-width, then re-applies padding for child content.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Extract first path segment: '/discover/abc' -> 'discover', '/portfolio' -> 'portfolio'
  const segments = pathname.split('/').filter(Boolean);
  const currentTab = segments[0] || 'dashboard';

  return (
    <>
      {/* Pull the nav out of the <main> padding so it goes full-width */}
      <div className="-mx-4 -mt-6 md:-mx-6 lg:-mx-8 mb-6">
        <DashboardNav currentTab={currentTab} />
      </div>
      {children}
    </>
  );
}
