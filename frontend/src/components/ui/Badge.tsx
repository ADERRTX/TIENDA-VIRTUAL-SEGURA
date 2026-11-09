import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'accent' | 'ok' | 'danger' | 'warning' | 'neutral' | 'success' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }[size];

  const variantClasses = {
    brand: 'bg-brand/12 text-brand border border-brand/25',
    success: 'bg-success/12 text-success border border-success/25',
    ok: 'bg-success/12 text-success border border-success/25',
    warning: 'bg-warning/12 text-warning border border-warning/25',
    danger: 'bg-danger/12 text-danger border border-danger/25',
    info: 'bg-info/12 text-info border border-info/25',
    accent: 'bg-warning/12 text-warning border border-warning/25',
    neutral: 'bg-surface-2 text-ink-muted border border-line',
  }[variant];

  const dotClasses = {
    brand: 'bg-brand',
    success: 'bg-success',
    ok: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    accent: 'bg-warning',
    neutral: 'bg-ink-faint',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full select-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses}`} aria-hidden="true" />}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
