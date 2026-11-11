import React from 'react';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg ' +
    'disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'min-h-[38px] h-9 px-3 text-xs gap-1.5',
    md: 'min-h-[44px] h-11 px-4 text-sm gap-2',
    lg: 'min-h-[48px] h-12 px-6 text-base gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-brand text-brand-ink font-semibold hover:bg-brand-hover shadow-sm border border-brand/80',
    secondary:
      'bg-surface text-ink border border-line hover:bg-surface-2 hover:border-ink-muted/30 shadow-sm',
    danger:
      'bg-danger text-brand-ink font-medium hover:bg-danger/90 shadow-sm border border-danger',
    amber:
      'bg-sun-soft text-sun-ink font-medium border border-sun/40 hover:bg-sun/25',
    ghost:
      'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-2',
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size={size === 'lg' ? 'md' : 'sm'} className="mr-1.5" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
