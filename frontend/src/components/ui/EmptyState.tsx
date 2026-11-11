import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-line bg-surface ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-mint text-brand border border-mint-strong flex items-center justify-center mb-4 shadow-sm">
        {icon || <PackageOpen size={30} strokeWidth={1.5} />}
      </div>
      <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-muted max-w-sm mb-5">{description}</p>}
      {action ? (
        <div className="mt-2">{action}</div>
      ) : actionLabel && onAction ? (
        <div className="mt-2">
          <Button size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default EmptyState;
