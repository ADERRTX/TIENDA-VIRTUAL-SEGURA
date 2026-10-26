import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'surface-2';
  highlight?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  highlight = false,
  className = '',
  ...props
}) => {
  const bgClass = variant === 'surface' ? 'bg-surface' : 'bg-surface-2';
  const borderClass = highlight
    ? 'border-brand/40 shadow-[0_0_20px_rgba(45,212,191,0.15)]'
    : 'border-line/80';

  return (
    <div
      className={`${bgClass} border ${borderClass} rounded-2xl p-5 transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
