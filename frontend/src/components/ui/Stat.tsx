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
  iconBg?: 'mint' | 'sun' | 'brand' | 'info';
  className?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  change,
  helperText,
  icon,
  iconBg = 'mint',
  className = '',
}) => {
  const iconBgClasses = {
    mint: 'bg-mint text-brand border border-mint-strong',
    sun: 'bg-sun-soft text-sun border border-sun/30',
    brand: 'bg-brand-soft text-brand border border-brand/25',
    info: 'bg-info/10 text-info border border-info/30',
  }[iconBg];

  return (
    <Card className={`flex flex-col justify-between ${className}`} padding="md">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBgClasses}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink tabular">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              change.isPositive
                ? 'bg-success/8 text-success border border-success/30'
                : 'bg-danger/8 text-danger border border-danger/30'
            }`}
          >
            {change.isPositive ? '+' : ''}
            {change.value}
          </span>
        )}
      </div>

      {helperText && <p className="text-xs text-ink-muted mt-1">{helperText}</p>}
    </Card>
  );
};

export default Stat;
