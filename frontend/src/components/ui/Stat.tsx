import React from 'react';
import { Card } from './Card';

export interface StatProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    isPositive?: boolean;
  };
  helperText?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  change,
  helperText,
  icon,
  className = '',
}) => {
  return (
    <Card className={`flex flex-col justify-between ${className}`} padding="md">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-ink-muted shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-ink tabular">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              change.isPositive
                ? 'bg-success/15 text-success border border-success/30'
                : 'bg-danger/15 text-danger border border-danger/30'
            }`}
          >
            {change.isPositive ? '+' : ''}
            {change.value}
          </span>
        )}
      </div>

      {helperText && <p className="text-xs text-ink-faint mt-1">{helperText}</p>}
    </Card>
  );
};

export default Stat;
