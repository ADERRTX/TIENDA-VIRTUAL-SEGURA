import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className = '', id, children, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : generatedId);
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={selectId} className="text-xs font-semibold text-ink-muted">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full min-h-[44px] h-11 bg-surface border ${
              error
                ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger text-ink'
                : 'border-line focus:border-brand focus:ring-1 focus:ring-brand text-ink'
            } rounded-lg pl-3.5 pr-10 text-sm appearance-none outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted">
            <ChevronDown size={16} />
          </div>
        </div>
        {error ? (
          <div id={errorId} className="flex items-center gap-1.5 text-xs text-danger" role="alert">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-ink-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';
export default Select;
