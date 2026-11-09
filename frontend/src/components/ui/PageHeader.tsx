import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-3 pb-4 border-b border-line/60 mb-6 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Migas de pan" className="flex items-center gap-1.5 text-xs text-ink-muted">
          {breadcrumbs.map((item, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {item.to && !isLast ? (
                  <Link to={item.to} className="hover:text-ink transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-ink font-medium' : ''}>{item.label}</span>
                )}
                {!isLast && <ChevronRight size={12} className="text-ink-faint shrink-0" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">{title}</h1>
          {description && <p className="text-sm text-ink-muted mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
