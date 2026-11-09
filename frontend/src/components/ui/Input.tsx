import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : generatedId);
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-xs font-semibold text-ink-muted">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`w-full min-h-[44px] h-11 bg-surface-2 border ${
              error
                ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger text-ink'
                : 'border-line focus:border-brand focus:ring-1 focus:ring-brand text-ink'
            } rounded-lg px-3.5 text-sm placeholder-ink-faint outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <div id={errorId} className="flex items-center gap-1.5 text-xs text-danger" role="alert">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-ink-faint">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
