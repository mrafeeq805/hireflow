import * as React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-[#142B3B]/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D9F5EA] text-[#0F9D78] dark:bg-[#0F9D78]/20 dark:text-[#34D399]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {action ? (
        <div className="mt-6">{action}</div>
      ) : actionLabel && onAction ? (
        <Button onClick={onAction} className="mt-6" size="sm">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
