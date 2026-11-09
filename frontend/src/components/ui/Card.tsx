import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'surface-2';
  highlight?: boolean;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  highlight = false,
  interactive = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const bgClass = variant === 'surface' ? 'bg-surface' : 'bg-surface-2';

  const borderClass = highlight
    ? 'border-brand/50 shadow-[0_0_15px_rgba(45,212,191,0.12)]'
    : 'border-line';

  const paddingClass = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }[padding];

  const interactiveClass = interactive
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-surface-2/80 hover:shadow-sm cursor-pointer'
    : 'transition-colors duration-150';

  return (
    <div
      className={`${bgClass} border ${borderClass} rounded-xl ${paddingClass} ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
