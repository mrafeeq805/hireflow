import * as React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export function FormField({
  label,
  error,
  required,
  hint,
  className,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)} {...props}>
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        {hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

