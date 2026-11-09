import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import type { NavItem } from './types';

export interface NavDropdownProps {
  label: string;
  icon?: React.ReactNode;
  headerTitle?: string;
  items: NavItem[];
}

export function NavDropdown({ label, icon, headerTitle, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          open
            ? 'text-brand bg-brand-soft/40 font-semibold'
            : 'text-ink-muted hover:text-ink hover:bg-surface-2'
        }`}
      >
        {icon}
        <span>{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-150 ${
            open ? 'rotate-180 text-brand' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute left-0 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-lg z-50 animate-scale-in"
        >
          {headerTitle && (
            <div className="px-2.5 py-1.5 text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {headerTitle}
            </div>
          )}
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-soft text-brand font-semibold'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default NavDropdown;
