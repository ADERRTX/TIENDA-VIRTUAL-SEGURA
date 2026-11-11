import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogout, type User as AuthUser } from '../../api/auth';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { i18n } from '../../i18n/es';
import { User, LogOut, Store, ChevronDown } from 'lucide-react';

export interface UserMenuProps {
  user: AuthUser | null | undefined;
}

export function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate();
  const logout = useLogout();
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

  if (!user) {
    return (
      <div className="hidden sm:flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/login')}
          className="text-xs"
        >
          {i18n.nav.login}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/registro')}
          className="text-xs"
        >
          {i18n.nav.register}
        </Button>
      </div>
    );
  }

  const userInitials = (user.fullName || user.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const roleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'brand' as const;
      case 'SUPPORT':
        return 'info' as const;
      case 'SELLER':
        return 'warning' as const;
      default:
        return 'neutral' as const;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border border-line/60 bg-surface-2/60 hover:bg-surface-2 hover:border-line transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-brand font-medium text-xs border border-brand/30">
          {userInitials}
        </div>
        <div className="hidden lg:flex flex-col text-left">
          <span className="text-xs font-semibold text-ink leading-tight max-w-[120px] truncate">
            {user.fullName || user.email}
          </span>
          <span className="text-xs text-ink-muted capitalize">
            {i18n.roles[user.role]}
          </span>
        </div>
        <ChevronDown
          className={`h-3 w-3 text-ink-muted transition-transform duration-150 ${
            open ? 'rotate-180 text-brand' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Opciones de usuario"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-lg z-50 animate-scale-in"
        >
          <div className="px-3 py-2.5 border-b border-line/50 mb-1">
            <p className="text-xs font-semibold text-ink truncate">
              {user.fullName || 'Usuario'}
            </p>
            <p className="text-xs text-ink-muted truncate">{user.email}</p>
            <div className="mt-1.5">
              <Badge variant={roleBadgeVariant(user.role)} size="sm">
                {i18n.roles[user.role]}
              </Badge>
            </div>
          </div>

          <Link
            to="/cuenta"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors font-medium"
          >
            <User className="h-4 w-4" />
            <span>Mi Cuenta y Seguridad</span>
          </Link>

          {user.role === 'BUYER' && (
            <Link
              to="/vender"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors font-medium"
            >
              <Store className="h-4 w-4" />
              <span>Solicitar Cuenta Vendedor</span>
            </Link>
          )}

          <div className="my-1 border-t border-line/50" />

          <button
            type="button"
            role="menuitem"
            disabled={logout.isPending}
            onClick={() => {
              setOpen(false);
              logout.mutate(undefined, { onSuccess: () => navigate('/') });
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-danger hover:bg-danger/8 transition-colors font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>{i18n.nav.logout}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
