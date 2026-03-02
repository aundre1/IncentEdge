'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * IncentEdge branded OAuth loading modal
 * Displays when user initiates OAuth sign-in, replacing the default browser behavior
 * with professional branding
 */
export function OAuthLoadingModal({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 rounded-lg bg-white dark:bg-slate-900 p-8 shadow-2xl">
        {/* IncentEdge Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 shadow-lg shadow-teal-500/20">
            <span className="text-white font-sora font-bold text-2xl">IE</span>
          </div>

          {/* Brand Name */}
          <div className="text-center">
            <h2 className="font-sora font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              Incent<span className="text-teal-400">Edge</span>
            </h2>
          </div>
        </div>

        {/* Loading State */}
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Signing into IncentEdge
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Redirecting to complete authentication...
          </p>
        </div>
      </div>
    </div>
  );
}
