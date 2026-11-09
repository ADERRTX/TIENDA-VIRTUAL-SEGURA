import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  ariaLabel = 'Cargando...',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
  }[size];

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-block rounded-full border-current border-t-transparent animate-spin ${sizeMap} ${className}`}
    >
      <span className="sr-only">{ariaLabel}</span>
    </span>
  );
};
