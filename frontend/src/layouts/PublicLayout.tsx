import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '../api/auth';
import { useCart } from '../api/cart';
import { i18n } from '../i18n/es';
import { AppHeader } from '../components/layout/AppHeader';
import { MobileMenu } from '../components/layout/MobileMenu';
import { AppFooter } from '../components/layout/AppFooter';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import type { NavItem } from '../components/layout/types';
import {
  Package,
  Scale,
  Store,
  Layers,
  Truck,
  Users,
  FileText,
  FileCheck2,
  Settings,
  ShieldCheck,
} from 'lucide-react';

const publicLinks: NavItem[] = [
  { to: '/', label: i18n.nav.home, end: true },
  { to: '/catalogo', label: i18n.nav.catalog },
];

const buyerLinks: NavItem[] = [
  { to: '/pedidos', label: i18n.nav.orders, icon: <Package className="h-4 w-4" aria-hidden="true" /> },
  { to: '/reclamos', label: 'Reclamos', icon: <Scale className="h-4 w-4" aria-hidden="true" /> },
  { to: '/vender', label: 'Vender en TVS', icon: <Store className="h-4 w-4" aria-hidden="true" /> },
];

const sellerLinks: NavItem[] = [
  { to: '/vendedor/tienda', label: 'Mi Tienda', icon: <Store className="h-4 w-4" aria-hidden="true" /> },
  { to: '/vendedor/productos', label: 'Mis Productos', icon: <Layers className="h-4 w-4" aria-hidden="true" /> },
  { to: '/vendedor/pedidos', label: 'Ventas por Atender', icon: <Package className="h-4 w-4" aria-hidden="true" /> },
  { to: '/reclamos', label: 'Reclamos', icon: <Scale className="h-4 w-4" aria-hidden="true" /> },
];

const supportLinks: NavItem[] = [
  { to: '/reclamos', label: 'Mediación de Reclamos', icon: <Scale className="h-4 w-4" aria-hidden="true" /> },
  { to: '/envios', label: 'Control de Envíos', icon: <Truck className="h-4 w-4" aria-hidden="true" /> },
];

const adminNavItems: NavItem[] = [
  { to: '/admin/vendedores', label: 'Solicitudes y Vendedores', icon: <Store className="h-4 w-4" aria-hidden="true" /> },
  { to: '/admin/usuarios', label: 'Gestión de Usuarios', icon: <Users className="h-4 w-4" aria-hidden="true" /> },
  { to: '/reclamos', label: 'Mediación de Reclamos', icon: <Scale className="h-4 w-4" aria-hidden="true" /> },
  { to: '/envios', label: 'Envíos y Despachos', icon: <Truck className="h-4 w-4" aria-hidden="true" /> },
  { to: '/admin/reportes', label: 'Reportes y Métricas', icon: <FileText className="h-4 w-4" aria-hidden="true" /> },
  { to: '/admin/auditoria', label: 'Registro de Auditoría', icon: <FileCheck2 className="h-4 w-4" aria-hidden="true" /> },
  { to: '/admin/configuracion', label: 'Configuración de Plazos', icon: <Settings className="h-4 w-4" aria-hidden="true" /> },
  { to: '/admin/simulador', label: 'Simulador de Eventos', icon: <Layers className="h-4 w-4" aria-hidden="true" /> },
];

export default function PublicLayout() {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const logout = useLogout();
  const { data: cart } = useCart(Boolean(user));
  const cartCount = user ? (cart?.totalItems ?? 0) : 0;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => navigate('/') });
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans antialiased selection:bg-mint-strong selection:text-deep">
      {/* Enlace accesible para saltar directamente al contenido principal */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand focus:text-brand-ink focus:rounded-lg focus:font-semibold focus:shadow-lg focus:ring-2 focus:ring-brand-ink"
      >
        Saltar al contenido principal
      </a>

      {/* Encabezado Principal */}
      <AppHeader
        user={user}
        cartCount={cartCount}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        publicLinks={publicLinks}
        adminLinks={adminNavItems}
        sellerLinks={sellerLinks}
        supportLinks={supportLinks}
      />

      {/* Franja informativa de Compra Protegida */}
      <div className="border-b border-mint-strong bg-mint py-1.5 px-4 text-center">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-xs sm:text-sm font-medium text-ink">
          <ShieldCheck className="h-4 w-4 text-brand shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-semibold">{i18n.app.protectedPurchase}</strong>: {i18n.app.protectedPurchaseDesc}
          </span>
        </div>
      </div>

      {/* Menú Móvil (Drawer Lateral) */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
        publicLinks={publicLinks}
        buyerLinks={buyerLinks}
        sellerLinks={sellerLinks}
        supportLinks={supportLinks}
        adminLinks={adminNavItems}
      />

      {/* Contenido Principal con padding inferior en móvil si hay barra de navegación */}
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 outline-none ${
          user ? 'pb-24 md:pb-8' : ''
        }`}
      >
        <Outlet />
      </main>

      {/* Pie de Página */}
      <AppFooter user={user} />

      {/* Barra de navegación inferior móvil para usuarios con sesión */}
      <MobileBottomNav user={user} cartCount={cartCount} />
    </div>
  );
}
