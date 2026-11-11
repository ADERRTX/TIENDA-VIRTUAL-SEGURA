import React from 'react';
import { NavLink } from 'react-router-dom';
import type { User as AuthUser } from '../../api/auth';
import { Home, Search, ShoppingCart, Package, Scale, Settings, User } from 'lucide-react';

export interface MobileBottomNavProps {
  user: AuthUser | null | undefined;
  cartCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ user, cartCount }) => {
  // Solo se muestra para usuarios con sesión activa
  if (!user) return null;

  // Enlace y etiqueta según el rol del usuario
  const roleItem = (() => {
    switch (user.role) {
      case 'SELLER':
        return {
          to: '/vendedor/pedidos',
          label: 'Ventas',
          icon: <Package className="h-5 w-5" aria-hidden="true" />,
        };
      case 'SUPPORT':
        return {
          to: '/reclamos',
          label: 'Reclamos',
          icon: <Scale className="h-5 w-5" aria-hidden="true" />,
        };
      case 'ADMIN':
        return {
          to: '/admin/vendedores',
          label: 'Panel',
          icon: <Settings className="h-5 w-5" aria-hidden="true" />,
        };
      case 'BUYER':
      default:
        return {
          to: '/pedidos',
          label: 'Pedidos',
          icon: <Package className="h-5 w-5" aria-hidden="true" />,
        };
    }
  })();

  return (
    <nav
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface/95 backdrop-blur-md border-t border-line shadow-lg"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {/* 1. Inicio */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 min-h-[48px] h-full py-1 transition-colors select-none ${
              isActive ? 'text-brand font-semibold' : 'text-ink-muted hover:text-ink'
            }`
          }
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs leading-none mt-1">Inicio</span>
        </NavLink>

        {/* 2. Catálogo */}
        <NavLink
          to="/catalogo"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 min-h-[48px] h-full py-1 transition-colors select-none ${
              isActive ? 'text-brand font-semibold' : 'text-ink-muted hover:text-ink'
            }`
          }
        >
          <Search className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs leading-none mt-1">Catálogo</span>
        </NavLink>

        {/* 3. Carrito con contador */}
        <NavLink
          to="/carrito"
          className={({ isActive }) =>
            `relative flex flex-col items-center justify-center flex-1 min-h-[48px] h-full py-1 transition-colors select-none ${
              isActive ? 'text-brand font-semibold' : 'text-ink-muted hover:text-ink'
            }`
          }
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-brand-ink shadow-sm">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-xs leading-none mt-1">Carrito</span>
        </NavLink>

        {/* 4. Pedidos o Panel según rol */}
        <NavLink
          to={roleItem.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 min-h-[48px] h-full py-1 transition-colors select-none ${
              isActive ? 'text-brand font-semibold' : 'text-ink-muted hover:text-ink'
            }`
          }
        >
          {roleItem.icon}
          <span className="text-xs leading-none mt-1">{roleItem.label}</span>
        </NavLink>

        {/* 5. Cuenta */}
        <NavLink
          to="/cuenta"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 min-h-[48px] h-full py-1 transition-colors select-none ${
              isActive ? 'text-brand font-semibold' : 'text-ink-muted hover:text-ink'
            }`
          }
        >
          <User className="h-5 w-5" aria-hidden="true" />
          <span className="text-xs leading-none mt-1">Cuenta</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
