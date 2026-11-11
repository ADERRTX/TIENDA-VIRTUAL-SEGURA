import { Link, NavLink, useNavigate } from 'react-router-dom';
import type { User as AuthUser } from '../../api/auth';
import NotificationBell from '../NotificationBell';
import { UserMenu } from './UserMenu';
import { NavDropdown } from './NavDropdown';
import { ShieldCheck, ShoppingCart, Menu, X, Settings, Search, Store, Scale } from 'lucide-react';
import type { NavItem } from './types';

export interface AppHeaderProps {
  user: AuthUser | null | undefined;
  cartCount: number;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  publicLinks: NavItem[];
  adminLinks: NavItem[];
  sellerLinks?: NavItem[];
  supportLinks?: NavItem[];
}

export function AppHeader({
  user,
  cartCount,
  mobileMenuOpen,
  onToggleMobileMenu,
  publicLinks,
  adminLinks,
  sellerLinks,
  supportLinks,
}: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl h-16 flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo e Identidad */}
        <Link
          to="/"
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg group shrink-0"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-brand border border-mint-strong shadow-sm group-hover:bg-mint-strong transition-colors">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
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

        {/* Buscador en forma de píldora (rounded-full) hacia /catalogo */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs mx-2">
          <button
            type="button"
            onClick={() => navigate('/catalogo')}
            className="w-full flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-2 border border-line text-xs text-ink-muted hover:border-brand/40 hover:bg-surface-3/50 hover:text-ink transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand text-left cursor-pointer"
            aria-label="Buscar productos en el catálogo"
          >
            <Search className="h-4 w-4 text-ink-muted shrink-0" aria-hidden="true" />
            <span className="truncate">Buscar en el catálogo...</span>
          </button>
        </div>

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
                    ? 'text-brand bg-brand-soft font-semibold'
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
                      ? 'text-brand bg-brand-soft font-semibold'
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
                      ? 'text-brand bg-brand-soft font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`
                }
              >
                Reclamos
              </NavLink>
            </>
          )}

          {/* Dropdown de VENDEDOR */}
          {user?.role === 'SELLER' && sellerLinks && (
            <NavDropdown
              label="Panel Vendedor"
              icon={<Store className="h-4 w-4" aria-hidden="true" />}
              headerTitle="Gestión de Tienda"
              items={sellerLinks}
            />
          )}

          {/* Dropdown de SOPORTE */}
          {user?.role === 'SUPPORT' && supportLinks && (
            <NavDropdown
              label="Panel Soporte"
              icon={<Scale className="h-4 w-4" aria-hidden="true" />}
              headerTitle="Atención y Mediación"
              items={supportLinks}
            />
          )}

          {/* Dropdown de ADMINISTRADOR */}
          {user?.role === 'ADMIN' && (
            <NavDropdown
              label="Panel Admin"
              icon={<Settings className="h-4 w-4" aria-hidden="true" />}
              headerTitle="Gestión del Sistema"
              items={adminLinks}
            />
          )}
        </nav>

        {/* Acciones del lado derecho */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón de búsqueda en móvil/tablet */}
          <button
            type="button"
            onClick={() => navigate('/catalogo')}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Buscar en el catálogo"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Botón de Carrito */}
          {(!user || user.role === 'BUYER') && (
            <Link
              to="/carrito"
              aria-label={`Ver carrito de compras, ${cartCount} productos`}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted transition-all duration-150 hover:border-brand/40 hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-sm"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-brand-ink shadow-sm animate-fade-in">
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
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors min-h-[44px] min-w-[44px]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
