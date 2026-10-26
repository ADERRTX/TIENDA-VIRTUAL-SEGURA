import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="block text-xs font-semibold text-ink-muted mb-1.5">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-[#0C1428] border ${
            error ? 'border-status-danger' : 'border-line'
          } rounded-xl px-4 py-2.5 text-sm text-ink placeholder-ink-faint outline-none transition focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-50 ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-status-danger">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-ink-faint">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
