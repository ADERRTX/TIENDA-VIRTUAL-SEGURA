import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '../api/auth';
import { useCart } from '../api/cart';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';

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
if (user?.role === 'BUYER') {
  links.push({ to: '/pedidos', label: i18n.nav.orders });
}
  if (user?.role === 'SELLER') {
      links.push({ to: '/vendedor/productos', label: i18n.seller.myProducts });
    links.push({ to: '/vendedor/pedidos', label: i18n.seller.pendingOrders });
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <header className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-bold text-lg text-brand">
            {i18n.app.name}
          </Link>

          <nav className="order-last w-full md:order-none md:w-auto flex flex-wrap items-center gap-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end ?? false}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${
                    isActive ? 'text-brand' : 'text-ink-muted hover:text-ink'
                  }`
                }
              >
                {link.label}
                {link.to === '/carrito' && cartCount > 0 && (
                  <span className="ml-1 rounded-full bg-brand px-2 py-0.5 text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-ink-muted">
                  {user.fullName ?? user.email} · {i18n.roles[user.role]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={logout.isPending}
                  onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/') })}
                >
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

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-line py-4 text-center text-xs text-ink-muted">
        {i18n.app.name} · Proyecto académico
      </footer>
    </div>
  );
}