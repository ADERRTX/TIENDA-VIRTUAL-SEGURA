import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';

const links = [
  { to: '/', label: i18n.nav.home, end: true },
  { to: '/catalogo', label: i18n.nav.catalog, end: false },
  { to: '/carrito', label: i18n.nav.cart, end: false },
];

export default function PublicLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <header className="border-b border-line bg-surface-2">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-bold text-lg text-brand">
            {i18n.app.name}
          </Link>

          <nav className="order-last w-full md:order-none md:w-auto flex items-center gap-5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${
                    isActive ? 'text-brand' : 'text-ink-muted hover:text-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              {i18n.nav.login}
            </Button>
            <Button size="sm" onClick={() => navigate('/registro')}>
              {i18n.nav.register}
            </Button>
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