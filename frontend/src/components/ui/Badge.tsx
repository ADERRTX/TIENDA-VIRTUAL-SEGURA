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
    brand: 'bg-brand/10 text-brand border border-brand/25',
    success: 'bg-success/8 text-success border border-success/30',
    ok: 'bg-success/8 text-success border border-success/30',
    warning: 'bg-warning/8 text-warning border border-warning/30',
    danger: 'bg-danger/8 text-danger border border-danger/30',
    info: 'bg-info/8 text-info border border-info/30',
    accent: 'bg-accent/10 text-accent border border-accent/25',
    neutral: 'bg-surface-2 text-ink-muted border border-line',
  }[variant];

  const dotClasses = {
    brand: 'bg-brand',
    success: 'bg-success',
    ok: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    info: 'bg-info',
    accent: 'bg-accent',
    neutral: 'bg-ink-muted',
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
