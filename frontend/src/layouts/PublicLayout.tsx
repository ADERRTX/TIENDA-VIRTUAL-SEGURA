import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '../api/auth';
import { useCart } from '../api/cart';
import { i18n } from '../i18n/es';
import { AppHeader } from '../components/layout/AppHeader';
import { MobileMenu } from '../components/layout/MobileMenu';
import { AppFooter } from '../components/layout/AppFooter';
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
} from 'lucide-react';

const publicLinks: NavItem[] = [
  { to: '/', label: i18n.nav.home, end: true },
  { to: '/catalogo', label: i18n.nav.catalog },
];

const buyerLinks: NavItem[] = [
  { to: '/pedidos', label: i18n.nav.orders, icon: <Package className="h-4 w-4" /> },
  { to: '/reclamos', label: 'Reclamos', icon: <Scale className="h-4 w-4" /> },
  { to: '/vender', label: 'Vender en TVS', icon: <Store className="h-4 w-4" /> },
];

const sellerLinks: NavItem[] = [
  { to: '/vendedor/tienda', label: 'Mi Tienda', icon: <Store className="h-4 w-4" /> },
  { to: '/vendedor/productos', label: 'Mis Productos', icon: <Layers className="h-4 w-4" /> },
  { to: '/vendedor/pedidos', label: 'Por Atender', icon: <Package className="h-4 w-4" /> },
  { to: '/reclamos', label: 'Reclamos', icon: <Scale className="h-4 w-4" /> },
];

const supportLinks: NavItem[] = [
  { to: '/reclamos', label: 'Mediación de Reclamos', icon: <Scale className="h-4 w-4" /> },
  { to: '/envios', label: 'Control de Envíos', icon: <Truck className="h-4 w-4" /> },
];

const adminNavItems: NavItem[] = [
  { to: '/admin/vendedores', label: 'Solicitudes y Vendedores', icon: <Store className="h-4 w-4" /> },
  { to: '/admin/usuarios', label: 'Gestión de Usuarios', icon: <Users className="h-4 w-4" /> },
  { to: '/reclamos', label: 'Mediación de Reclamos', icon: <Scale className="h-4 w-4" /> },
  { to: '/envios', label: 'Envíos y Despachos', icon: <Truck className="h-4 w-4" /> },
  { to: '/admin/reportes', label: 'Reportes y Métricas', icon: <FileText className="h-4 w-4" /> },
  { to: '/admin/auditoria', label: 'Registro de Auditoría', icon: <FileCheck2 className="h-4 w-4" /> },
  { to: '/admin/configuracion', label: 'Configuración de Plazos', icon: <Settings className="h-4 w-4" /> },
  { to: '/admin/simulador', label: 'Simulador de Eventos', icon: <Layers className="h-4 w-4" /> },
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
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans antialiased selection:bg-brand/30 selection:text-brand">
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
      />

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

      {/* Contenido Principal */}
      <main id="main-content" tabIndex={-1} className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8 outline-none">
        <Outlet />
      </main>

      {/* Pie de Página */}
      <AppFooter />
    </div>
  );
}
