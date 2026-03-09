'use client';

import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
  errorStack?: string;
}

const isDev = process.env.NODE_ENV === 'development';

/**
 * DashboardErrorBoundary
 *
 * Catches render errors thrown by any child of the dashboard page
 * and surfaces a user-friendly recovery UI.
 *
 * - Production: shows generic message and a reload button
 * - Development: also exposes the raw error message and stack trace
 *
 * Usage:
 *   <DashboardErrorBoundary>
 *     <DashboardPage />
 *   </DashboardErrorBoundary>
 */
export class DashboardErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message,
      errorStack: error.stack,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[DashboardErrorBoundary] Dashboard crashed:', {
      message: error.message,
      componentStack: info.componentStack?.slice(0, 500),
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, errorMessage: undefined, errorStack: undefined });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Dashboard Unavailable
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Dashboard data temporarily unavailable. Refresh the page or contact support.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={this.handleReload}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
            <Button
              variant="outline"
              onClick={this.handleRetry}
              className="border-gray-300 dark:border-gray-600"
            >
              Try Again
            </Button>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            If this problem persists, please{' '}
            <a
              href="mailto:support@incentedge.com"
              className="underline hover:text-gray-600 dark:hover:text-gray-300"
            >
              contact support
            </a>
            .
          </p>

          {/* Dev-only error detail panel */}
          {isDev && this.state.errorMessage && (
            <details className="mt-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/10 text-left">
              <summary className="cursor-pointer px-4 py-2 text-xs font-medium text-red-700 dark:text-red-400 select-none">
                [DEV] Error details
              </summary>
              <div className="px-4 pb-4 pt-2 space-y-2">
                <p className="text-xs font-semibold text-red-800 dark:text-red-300">
                  {this.state.errorMessage}
                </p>
                {this.state.errorStack && (
                  <pre className="overflow-auto text-[10px] text-red-700 dark:text-red-400 whitespace-pre-wrap">
                    {this.state.errorStack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }
}
