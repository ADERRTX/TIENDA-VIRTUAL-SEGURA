import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'line' | 'block' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'line',
}) => {
  const variantClass = {
    line: 'h-4 w-full rounded-md',
    block: 'h-24 w-full rounded-xl',
    circle: 'w-10 h-10 rounded-full shrink-0',
  }[variant];

  return (
    <div
      className={`relative overflow-hidden bg-surface-2/80 ${variantClass} ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-line/40 to-transparent" />
    </div>
  );
};

export default Skeleton;
