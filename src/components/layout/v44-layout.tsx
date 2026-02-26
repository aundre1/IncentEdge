'use client';

import { V44Ticker } from './v44-ticker';
import { V44Header } from './v44-header';
import { V44Breadcrumb } from './v44-breadcrumb';
import { V44Footer } from './v44-footer';
import { type ProjectInfo } from '@/data/incentives';

interface V44LayoutProps {
  children: React.ReactNode;
  currentProject: string;
  projectData?: Record<string, ProjectInfo>;
}

export function V44Layout({ children, currentProject, projectData }: V44LayoutProps) {
  return (
    <div className="min-h-screen bg-deep-50 dark:bg-deep-950">
      {/* Bloomberg-style scrolling ticker */}
      <V44Ticker />

      {/* Main navigation header */}
      <V44Header />

      {/* Breadcrumb bar with data freshness */}
      <V44Breadcrumb currentProject={currentProject} projectData={projectData} />

      {/* Main content area */}
      <main className="max-w-[1600px] mx-auto px-4 py-6 md:px-6 lg:px-8 mb-10">
        {children}
      </main>

      {/* Fixed bottom footer */}
      <V44Footer />
    </div>
  );
}
