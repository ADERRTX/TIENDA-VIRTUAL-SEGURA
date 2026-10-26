import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'accent' | 'ok' | 'danger' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  }[size];

  const variantClasses = {
    brand: 'bg-brand/15 text-brand border border-brand/30',
    accent: 'bg-accent/15 text-accent border border-accent/30',
    ok: 'bg-status-ok/15 text-status-ok border border-status-ok/30',
    danger: 'bg-status-danger/15 text-status-danger border border-status-danger/30',
    warning: 'bg-status-warning/15 text-status-warning border border-status-warning/30',
    neutral: 'bg-line/60 text-ink-muted border border-line',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full select-none ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};
