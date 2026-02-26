'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /**
   * Optional section name for error messages (e.g. "Dashboard", "Search")
   */
  section?: string;
}

interface State {
  hasError: boolean;
  errorMessage?: string;
}

/**
 * React Error Boundary
 *
 * Catches unhandled errors in the component tree and shows a
 * user-friendly fallback instead of a blank/crashed screen.
 *
 * Usage:
 *   <ErrorBoundary section="Dashboard">
 *     <Dashboard />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console (replace with error tracking service like Sentry when available)
    console.error(
      `[ErrorBoundary] ${this.props.section ?? 'App'} crashed:`,
      error.message,
      info.componentStack?.slice(0, 300)
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {this.props.section ? `${this.props.section} error` : 'Something went wrong'}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This section encountered an unexpected error. Your data is safe.
            </p>
            <button
              onClick={this.handleRetry}
              className="mt-4 rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
