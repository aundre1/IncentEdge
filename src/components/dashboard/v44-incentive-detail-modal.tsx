'use client';

import { FileText, Download } from 'lucide-react';
import { cn, formatCompactCurrency } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Incentive } from '@/data/incentives';

function getLevelVariant(type: Incentive['type']) {
  switch (type) {
    case 'federal':
      return 'federal' as const;
    case 'state':
      return 'state' as const;
    case 'local':
      return 'local' as const;
    case 'utility':
      return 'utility' as const;
  }
}

function getStatusConfig(status: Incentive['status']) {
  switch (status) {
    case 'captured':
      return {
        label: 'Captured',
        className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
      };
    case 'pending':
      return {
        label: 'Pending',
        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
      };
    case 'at-risk':
      return {
        label: 'At Risk',
        className: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400',
      };
  }
}

interface V44IncentiveDetailModalProps {
  incentive: Incentive | null;
  open: boolean;
  onClose: () => void;
}

export function V44IncentiveDetailModal({
  incentive,
  open,
  onClose,
}: V44IncentiveDetailModalProps) {
  if (!incentive) return null;

  const levelVariant = getLevelVariant(incentive.type);
  const statusConfig = getStatusConfig(incentive.status);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-deep-900 border-sage-300 dark:border-teal-800/30">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-deep-950 dark:text-sage-200">
            {incentive.fullName || incentive.program}
          </DialogTitle>
          <DialogDescription className="text-sm text-sage-600 dark:text-sage-500">
            {incentive.agency}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Top metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-500">
                Estimated Value
              </p>
              <p className="font-mono text-2xl font-bold text-teal-600 dark:text-teal-400">
                {formatCompactCurrency(incentive.amount * 1_000_000)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-sage-600 dark:text-sage-500">
                AI Confidence
              </p>
              <p className="font-mono text-2xl font-bold text-deep-950 dark:text-sage-200">
                {incentive.prob}%
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={levelVariant} className="capitalize text-xs">
              {incentive.type}
            </Badge>
            <Badge
              variant="outline"
              className={cn('text-xs', statusConfig.className)}
            >
              {statusConfig.label}
            </Badge>
          </div>

          {/* Details grid */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-sage-200 dark:border-teal-800/20">
              <span className="text-xs font-medium text-sage-600 dark:text-sage-500">
                Deadline
              </span>
              <span className="text-sm font-mono font-semibold text-deep-950 dark:text-sage-200">
                {incentive.deadline}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-sage-200 dark:border-teal-800/20">
              <span className="text-xs font-medium text-sage-600 dark:text-sage-500">
                Agency
              </span>
              <span className="text-sm font-semibold text-deep-950 dark:text-sage-200">
                {incentive.agency}
              </span>
            </div>
            <div className="pt-2">
              <p className="text-xs font-medium text-sage-600 dark:text-sage-500 mb-1">
                Description
              </p>
              <p className="text-sm text-deep-700 dark:text-sage-400 leading-relaxed">
                {incentive.desc}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className={cn(
              'bg-white dark:bg-deep-800',
              'border-sage-300 dark:border-teal-800/30',
              'text-deep-700 dark:text-sage-300',
              'hover:bg-sage-100 dark:hover:bg-deep-700'
            )}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Summary
          </Button>
          <Button
            className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Start Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
