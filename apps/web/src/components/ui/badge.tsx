import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-white shadow-xs',
        secondary:
          'border-transparent bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        destructive:
          'border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
        outline: 'text-slate-700 border-slate-200 dark:text-slate-300 dark:border-slate-700',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
        warning:
          'border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
        info:
          'border-sky-200 bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
        mint:
          'border-[#B6EAD5] bg-[#D9F5EA] text-[#0A6D53] dark:bg-[#0F9D78]/20 dark:text-[#A7F3D0] dark:border-[#0F9D78]/40',
        navy:
          'border-transparent bg-[#142B3B] text-white dark:bg-[#1D3D53] dark:text-slate-100',
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

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

