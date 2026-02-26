import { cn } from '@/lib/utils';

type ProgramCategory = 'federal' | 'state' | 'local' | 'utility' | string;

interface CategoryBadgeProps {
  category: ProgramCategory;
  className?: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  federal: 'bg-accent-700/10 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300 border border-accent-700/20',
  state:   'bg-accent-600/10 text-accent-600 dark:bg-accent-600/20 dark:text-accent-400 border border-accent-600/20',
  local:   'bg-accent-500/10 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400 border border-accent-500/20',
  utility: 'bg-accent-400/10 text-accent-600 dark:bg-accent-400/20 dark:text-accent-400 border border-accent-400/20',
};

const FALLBACK_STYLE =
  'bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-300 border border-navy-200 dark:border-navy-700';

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const style = CATEGORY_STYLES[category.toLowerCase()] ?? FALLBACK_STYLE;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide',
        style,
        className
      )}
    >
      {category}
    </span>
  );
}

export default CategoryBadge;
