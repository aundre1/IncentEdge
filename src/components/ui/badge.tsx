import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
        warning:
          'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
        info:
          'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        federal:
          'bg-[rgba(26,43,74,0.08)] text-[#1A2B4A] border-[rgba(26,43,74,0.15)] dark:bg-[rgba(26,43,74,0.3)] dark:text-sage-300',
        state:
          'bg-[rgba(40,122,137,0.08)] text-teal-600 border-[rgba(40,122,137,0.15)] dark:bg-[rgba(40,122,137,0.2)] dark:text-teal-300',
        local:
          'bg-[rgba(143,181,166,0.1)] text-[#3D7A6A] border-[rgba(143,181,166,0.2)] dark:bg-[rgba(143,181,166,0.15)] dark:text-sage-300',
        utility:
          'bg-[rgba(74,153,168,0.08)] text-teal-400 border-[rgba(74,153,168,0.15)] dark:bg-[rgba(74,153,168,0.15)] dark:text-teal-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
