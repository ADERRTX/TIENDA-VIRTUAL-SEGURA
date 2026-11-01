import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '../api/auth';
import { useCart } from '../api/cart';
import NotificationBell from '../components/NotificationBell';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { ShieldCheck } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

export default function PublicLayout() {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const logout = useLogout();
  const { data: cart } = useCart(Boolean(user));
  const cartCount = user ? (cart?.totalItems ?? 0) : 0;

  const links: NavItem[] = [
    { to: '/', label: i18n.nav.home, end: true },
    { to: '/catalogo', label: i18n.nav.catalog },
    { to: '/carrito', label: i18n.nav.cart },
  ];

  if (user) {
    links.push({ to: '/reclamos', label: i18n.claims.title });
  }
  if (user?.role === 'BUYER') {
    links.push({ to: '/pedidos', label: i18n.nav.orders });
    links.push({ to: '/vender', label: i18n.nav.sell });
  }
  if (user?.role === 'SELLER') {
    links.push({ to: '/vendedor/productos', label: i18n.seller.myProducts });
    links.push({ to: '/vendedor/pedidos', label: i18n.seller.pendingOrders });
  }
  if (user?.role === 'SUPPORT' || user?.role === 'ADMIN') {
    links.push({ to: '/envios', label: 'Envíos' });
  }
  if (user?.role === 'ADMIN') {
    links.push({ to: '/admin/simulador', label: 'Simulador' });
    links.push({ to: '/admin/vendedores', label: 'Vendedores' });
    links.push({ to: '/admin/usuarios', label: 'Usuarios' });
    links.push({ to: '/admin/auditoria', label: 'Auditoría' });
    links.push({ to: '/admin/configuracion', label: 'Configuración' });
    links.push({ to: '/admin/reportes', label: 'Reportes' });
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-bg/75 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5" aria-label={`${i18n.app.name}, inicio`}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand/25 bg-brand/[0.08] text-brand shadow-[0_0_24px_rgba(45,212,191,0.12)] transition group-hover:shadow-[0_0_28px_rgba(45,212,191,0.22)]">
              <ShieldCheck size={21} aria-hidden="true" />
            </span>
            <span className="text-sm font-bold tracking-tight text-white sm:text-base">
              TVS<span className="ml-1.5 font-medium text-ink-muted">Tienda Virtual Segura</span>
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="order-3 flex w-full items-center gap-5 overflow-x-auto whitespace-nowrap py-1 md:order-none md:w-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end ?? false}
                className={({ isActive }) =>
                  `relative py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-brand' : 'text-ink-muted hover:text-white'
                  }`
                }
              >
                {link.label}
                {link.to === '/carrito' && cartCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand">
                    {cartCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell />
                <span className="hidden text-sm text-ink-muted lg:inline">
                  {user.fullName ?? user.email} · {i18n.roles[user.role]}
                </span>
                <Button variant="ghost" size="sm" disabled={logout.isPending} onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/') })}>
                  {i18n.nav.logout}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  {i18n.nav.login}
                </Button>
                <Button size="sm" onClick={() => navigate('/registro')}>
                  {i18n.nav.register}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <Outlet />
      </main>

      <footer className="border-t border-white/[0.07] bg-slate-950/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>{i18n.app.name} · Proyecto académico</span>
          <span>Pagos y envíos simulados · Custodia de pago simulada</span>
        </div>
      </footer>
    </div>
  );
}