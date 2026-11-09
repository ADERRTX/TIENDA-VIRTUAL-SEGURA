import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, disabled, rows = 3, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : generatedId);
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={textareaId} className="text-xs font-semibold text-ink-muted">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`w-full min-h-[90px] bg-surface-2 border ${
            error
              ? 'border-danger focus:border-danger focus:ring-1 focus:ring-danger text-ink'
              : 'border-line focus:border-brand focus:ring-1 focus:ring-brand text-ink'
          } rounded-lg p-3 text-sm placeholder-ink-faint outline-none transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
export default Textarea;
