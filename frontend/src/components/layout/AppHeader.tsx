import { Link, NavLink } from 'react-router-dom';
import type { User as AuthUser } from '../../api/auth';
import NotificationBell from '../NotificationBell';
import { UserMenu } from './UserMenu';
import { NavDropdown } from './NavDropdown';
import { ShieldCheck, ShoppingCart, Menu, X, Settings } from 'lucide-react';
import type { NavItem } from './types';

export interface AppHeaderProps {
  user: AuthUser | null | undefined;
  cartCount: number;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  publicLinks: NavItem[];
  adminLinks: NavItem[];
}

export function AppHeader({
  user,
  cartCount,
  mobileMenuOpen,
  onToggleMobileMenu,
  publicLinks,
  adminLinks,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-surface/85 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-6xl h-full flex items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo e Identidad */}
        <Link
          to="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 border border-brand/30 text-brand shadow-sm group-hover:bg-brand/20 transition-colors">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight text-ink leading-tight flex items-center gap-1.5">
              TVS
              <span className="text-xs font-semibold text-brand bg-brand-soft px-1.5 py-0.5 rounded-full border border-brand/25">
                Segura
              </span>
            </span>
            <span className="text-xs font-normal text-ink-muted hidden sm:inline leading-none">
              Tienda Virtual Segura
            </span>
          </div>
        </Link>

        {/* Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-brand bg-brand-soft/40 font-semibold'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Links específicos de BUYER */}
          {user?.role === 'BUYER' && (
            <>
              <NavLink
                to="/pedidos"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-brand bg-brand-soft/40 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`
                }
              >
                Mis Pedidos
              </NavLink>
              <NavLink
                to="/reclamos"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-brand bg-brand-soft/40 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`
                }
              >
                Reclamos
              </NavLink>
            </>
          )}

          {/* Links específicos de SELLER */}
          {user?.role === 'SELLER' && (
            <>
              <NavLink
                to="/vendedor/tienda"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-brand bg-brand-soft/40 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`
                }
              >
                Mi Tienda
              </NavLink>
              <NavLink
                to="/vendedor/productos"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-brand bg-brand-soft/40 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`
                }
              >
                Productos
              </NavLink>
              <NavLink
                to="/vendedor/pedidos"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-brand bg-brand-soft/40 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`
                }
              >
                Pedidos
              </NavLink>
              <NavLink
                to="/reclamos"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-brand bg-brand-soft/40 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`
                }
              >
                Reclamos
              </NavLink>
            </>
          )}

          {/* Links específicos de SUPPORT */}
          {user?.role === 'SUPPORT' && (
            <>
              <NavLink
                to="/reclamos"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-brand bg-brand-soft/40 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`
                }
              >
                Mediación de Reclamos
              </NavLink>
              <NavLink
                to="/envios"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-brand bg-brand-soft/40 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`
                }
              >
                Envíos
              </NavLink>
            </>
          )}

          {/* Dropdown de ADMINISTRADOR */}
          {user?.role === 'ADMIN' && (
            <NavDropdown
              label="Panel Admin"
              icon={<Settings className="h-4 w-4" />}
              headerTitle="Gestión del Sistema"
              items={adminLinks}
            />
          )}
        </nav>

        {/* Acciones del lado derecho (Desktop & Mobile trigger) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón de Carrito (BUYER o visitante) */}
          {(!user || user.role === 'BUYER') && (
            <Link
              to="/carrito"
              aria-label="Ver carrito de compras"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-line/60 bg-surface-2/60 text-ink-muted transition-all duration-150 hover:border-line hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-xs font-medium text-brand-ink shadow-sm animate-fade-in">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Campana de Notificaciones (si hay sesión activa) */}
          {user && <NotificationBell />}

          {/* Menú de Usuario (Perfil o Iniciar Sesión) */}
          <UserMenu user={user} />

          {/* Gatillo de menú móvil (< 768px) */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
            onClick={onToggleMobileMenu}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-line/60 bg-surface-2/60 text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
