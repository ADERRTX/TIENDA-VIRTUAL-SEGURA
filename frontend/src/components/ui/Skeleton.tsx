import React from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'w-full h-4' }) => {
  return (
    <div
      className={`bg-line/40 animate-pulse rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
};
