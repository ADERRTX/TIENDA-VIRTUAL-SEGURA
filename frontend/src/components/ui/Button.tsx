import React from 'react';

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
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'min-h-[38px] px-3.5 py-1.5 text-xs',
    md: 'min-h-[44px] px-5 py-2.5 text-sm',
    lg: 'min-h-[48px] px-6 py-3 text-base',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-b from-[#3FE0CB] to-[#14B8A6] text-[#04211D] border border-brand/50 shadow-[0_0_18px_rgba(45,212,191,0.35)] hover:brightness-110 active:translate-y-0.5',
    secondary:
      'bg-surface-2 text-ink border border-line hover:border-brand/50 hover:text-white',
    amber:
      'bg-gradient-to-b from-[#FFC85C] to-[#F59E0B] text-[#2A1A02] border border-accent/50 shadow-[0_0_18px_rgba(255,176,32,0.3)] hover:brightness-110 active:translate-y-0.5',
    danger:
      'bg-gradient-to-b from-[#F87171] to-[#DC2626] text-white border border-red-500/50 shadow-[0_0_16px_rgba(248,113,113,0.3)] hover:brightness-110 active:translate-y-0.5',
    ghost:
      'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-2',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};
