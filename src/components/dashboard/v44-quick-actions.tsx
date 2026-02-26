'use client';

import { FileText, BarChart3, ArrowLeftRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  variant: 'primary' | 'secondary';
}

const actions: QuickAction[] = [
  { label: 'Generate Grant Application', icon: FileText, variant: 'primary' },
  { label: 'ROI Calculator', icon: BarChart3, variant: 'secondary' },
  { label: 'List Credits for Sale', icon: ArrowLeftRight, variant: 'secondary' },
  { label: 'Export LP Report', icon: Download, variant: 'secondary' },
];

export function V44QuickActions() {
  return (
    <Card className="card-v41 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-deep-950 dark:text-sage-200">
          Quick Actions
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const isPrimary = action.variant === 'primary';

          return (
            <Button
              key={action.label}
              type="button"
              variant={isPrimary ? 'default' : 'outline'}
              className={cn(
                'w-full justify-start gap-2.5 text-sm font-medium',
                isPrimary
                  ? 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white'
                  : cn(
                      'bg-white dark:bg-deep-800',
                      'border-sage-300 dark:border-teal-800/30',
                      'text-deep-700 dark:text-sage-300',
                      'hover:bg-sage-100 dark:hover:bg-deep-700',
                      'hover:border-teal-400 dark:hover:border-teal-600'
                    )
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {action.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
