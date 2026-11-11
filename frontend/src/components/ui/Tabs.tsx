import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'pills' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'pills',
}) => {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`flex items-center gap-1.5 overflow-x-auto pb-1 text-sm ${
        variant === 'underline' ? 'border-b border-line' : 'p-1 bg-surface-2 rounded-xl border border-line'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 -mb-[1px] transition-colors whitespace-nowrap min-h-[44px] ${
                isActive
                  ? 'border-brand text-brand font-semibold'
                  : 'border-transparent text-ink-muted hover:text-ink hover:border-line'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-brand/15 text-brand font-semibold' : 'bg-surface-3 text-ink-muted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all duration-150 whitespace-nowrap text-xs sm:text-sm min-h-[40px] sm:min-h-[36px] ${
              isActive
                ? 'bg-surface text-brand font-semibold shadow-sm border border-line'
                : 'text-ink-muted hover:text-ink hover:bg-surface-3/50 border border-transparent'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full tabular ${
                  isActive ? 'bg-brand/10 text-brand font-semibold' : 'bg-surface-3 text-ink-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
