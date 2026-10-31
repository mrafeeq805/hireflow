import * as React from 'react';

export interface FilterOption {
  label: string;
  value: any;
}

export interface FilterItem {
  label: string;
  value: any;
  options: FilterOption[];
  onChange: (value: any) => void;
}

interface FilterBarProps {
  children?: React.ReactNode;
  filters?: FilterItem[];
  searchComponent?: React.ReactNode;
  onClear?: () => void;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

export function FilterBar({
  children,
  filters,
  searchComponent,
  onClear,
  onReset,
  hasActiveFilters,
}: FilterBarProps) {
  const handleReset = onClear || onReset;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-[#142B3B]/40">
      {searchComponent}

      {filters?.map((filter, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {filter.label}:
          </label>
          <select
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#142B3B] text-slate-800 dark:text-slate-200 focus:outline-hidden"
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
          >
            {filter.options.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {children}

      {handleReset && (
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-medium text-slate-500 hover:text-[#0F9D78] transition-colors ml-auto px-2 py-1"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
