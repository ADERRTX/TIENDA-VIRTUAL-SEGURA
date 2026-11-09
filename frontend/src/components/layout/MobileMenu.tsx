import { useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import type { User as AuthUser } from '../../api/auth';
import { Button } from '../ui/Button';
import { i18n } from '../../i18n/es';
import { ShieldCheck, X, User, LogOut } from 'lucide-react';
import type { NavItem } from './types';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null | undefined;
  onLogout: () => void;
  publicLinks: NavItem[];
  buyerLinks: NavItem[];
  sellerLinks: NavItem[];
  supportLinks: NavItem[];
  adminLinks: NavItem[];
}

export function MobileMenu({
  isOpen,
  onClose,
  user,
  onLogout,
  publicLinks,
  buyerLinks,
  sellerLinks,
  supportLinks,
  adminLinks,
}: MobileMenuProps) {
  const navigate = useNavigate();

  // Bloquear scroll de fondo cuando el menú móvil está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const userInitials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-fade-in" role="dialog" aria-modal="true">
      {/* Backdrop con blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-surface border-l border-line p-5 shadow-lg flex flex-col justify-between overflow-y-auto z-10 animate-slide-up">
        <div className="flex flex-col gap-5">
          {/* Encabezado del Drawer */}
          <div className="flex items-center justify-between pb-4 border-b border-line/60">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 border border-brand/30 text-brand">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-semibold text-sm text-ink">TVS Segura</span>
            </div>
            <button
              type="button"
              aria-label="Cerrar navegación"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line/60 bg-surface-2 text-ink-muted hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Perfil del usuario en móvil */}
          {user ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-line/60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand font-medium text-sm border border-brand/30">
                {userInitials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-ink truncate">
                  {user.fullName || user.email}
                </span>
                <span className="text-xs text-ink-muted">
                  {i18n.roles[user.role]}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
              >
                {i18n.nav.login}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate('/registro');
                }}
              >
                {i18n.nav.register}
              </Button>
            </div>
          )}

          {/* Enlaces de navegación en móvil */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider px-2 py-1">
              Navegación
            </span>
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-soft text-brand font-semibold'
                      : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {user?.role === 'BUYER' && (
              <>
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider px-2 py-1 mt-3">
                  Comprador
                </span>
                {buyerLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-soft text-brand font-semibold'
                          : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                      }`
                    }
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </>
            )}

            {user?.role === 'SELLER' && (
              <>
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider px-2 py-1 mt-3">
                  Comercio Vendedor
                </span>
                {sellerLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-soft text-brand font-semibold'
                          : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                      }`
                    }
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </>
            )}

            {user?.role === 'SUPPORT' && (
              <>
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider px-2 py-1 mt-3">
                  Soporte y Mediación
                </span>
                {supportLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-soft text-brand font-semibold'
                          : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                      }`
                    }
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider px-2 py-1 mt-3">
                  Administración
                </span>
                {adminLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-soft text-brand font-semibold'
                          : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                      }`
                    }
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Pie del menú móvil */}
        {user && (
          <div className="pt-4 border-t border-line/60 flex flex-col gap-2">
            <Link
              to="/cuenta"
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Mi Cuenta</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger-soft text-left transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{i18n.nav.logout}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileMenu;
