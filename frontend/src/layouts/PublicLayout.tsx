import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '../api/auth';
import { useCart } from '../api/cart';
import NotificationBell from '../components/NotificationBell';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { i18n } from '../i18n/es';
import {
  ShieldCheck,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Store,
  Package,
  Layers,
  FileCheck2,
  Settings,
  Scale,
  Truck,
  FileText,
  Users,
  Lock,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  icon?: React.ReactNode;
}

export default function PublicLayout() {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const logout = useLogout();
  const { data: cart } = useCart(Boolean(user));
  const cartCount = user ? (cart?.totalItems ?? 0) : 0;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera o pulsar Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
        setAdminDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Bloquear scroll de fondo cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Links primarios comunes y por rol
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

  // Determinar iniciales del usuario
  const userInitials = (user?.fullName || user?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Role badge color helper
  const roleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'brand';
      case 'SUPPORT':
        return 'info';
      case 'SELLER':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans antialiased selection:bg-brand/30 selection:text-brand">
      {/* HEADER PRINCIPAL */}
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
              <span className="text-base font-extrabold tracking-tight text-ink leading-tight flex items-center gap-1.5">
                TVS
                <span className="text-[10px] font-semibold text-brand bg-brand-soft px-1.5 py-0.2 rounded-full border border-brand/25">
                  Segura
                </span>
              </span>
              <span className="text-[11px] font-normal text-ink-muted hidden sm:inline leading-none">
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
              <div className="relative" ref={adminDropdownRef}>
                <button
                  type="button"
                  onClick={() => setAdminDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    adminDropdownOpen
                      ? 'text-brand bg-brand-soft/40 font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Panel Admin</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${adminDropdownOpen ? 'rotate-180 text-brand' : ''}`} />
                </button>

                {adminDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-2xl z-50 animate-scale-in">
                    <div className="px-2.5 py-1.5 text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                      Gestión del Sistema
                    </div>
                    {adminNavItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setAdminDropdownOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-brand-soft text-brand font-semibold'
                              : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                          }`
                        }
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
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
                <ShoppingCart className="h-4.5 w-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-ink shadow-sm animate-fade-in">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Campana de Notificaciones (si hay sesión activa) */}
            {user && <NotificationBell />}

            {/* Usuario autenticado: Menú de Perfil */}
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg border border-line/60 bg-surface-2/60 hover:bg-surface-2 hover:border-line transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-brand font-bold text-xs border border-brand/30">
                    {userInitials}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-ink leading-tight max-w-[120px] truncate">
                      {user.fullName || user.email}
                    </span>
                    <span className="text-[10px] text-ink-muted capitalize">
                      {i18n.roles[user.role]}
                    </span>
                  </div>
                  <ChevronDown className={`h-3 w-3 text-ink-muted transition-transform duration-150 ${userDropdownOpen ? 'rotate-180 text-brand' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-surface p-1.5 shadow-2xl z-50 animate-scale-in">
                    <div className="px-3 py-2.5 border-b border-line/50 mb-1">
                      <p className="text-xs font-semibold text-ink truncate">
                        {user.fullName || 'Usuario'}
                      </p>
                      <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                      <div className="mt-1.5">
                        <Badge variant={roleBadgeVariant(user.role)} size="sm">
                          {i18n.roles[user.role]}
                        </Badge>
                      </div>
                    </div>

                    <Link
                      to="/cuenta"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors font-medium"
                    >
                      <User className="h-4 w-4" />
                      <span>Mi Cuenta y Seguridad</span>
                    </Link>

                    {user.role === 'BUYER' && (
                      <Link
                        to="/vender"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors font-medium"
                      >
                        <Store className="h-4 w-4" />
                        <span>Solicitar Cuenta Vendedor</span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-line/50" />

                    <button
                      type="button"
                      disabled={logout.isPending}
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout.mutate(undefined, { onSuccess: () => navigate('/') });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-danger hover:bg-danger-soft transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{i18n.nav.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
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
            )}

            {/* Gatillo de menú móvil (< 768px) */}
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-line/60 bg-surface-2/60 text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MENÚ MÓVIL (DRAWER LATERAL) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          {/* Backdrop con blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Contenedor del Drawer */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-surface border-l border-line p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 animate-slide-up">
            <div className="flex flex-col gap-5">
              {/* Encabezado del Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-line/60">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 border border-brand/30 text-brand">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold text-sm text-ink">TVS Segura</span>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar navegación"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line/60 bg-surface-2 text-ink-muted hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Perfil del usuario en móvil */}
              {user ? (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-line/60">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand font-bold text-sm border border-brand/30">
                    {userInitials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-ink truncate">
                      {user.fullName || user.email}
                    </span>
                    <span className="text-[11px] text-ink-muted">
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
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    {i18n.nav.login}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/registro');
                    }}
                  >
                    {i18n.nav.register}
                  </Button>
                </div>
              )}

              {/* Enlaces de navegación en móvil */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-2 py-1">
                  Navegación
                </span>
                {publicLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileMenuOpen(false)}
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
                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-2 py-1 mt-3">
                      Comprador
                    </span>
                    {buyerLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
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
                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-2 py-1 mt-3">
                      Comercio Vendedor
                    </span>
                    {sellerLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
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
                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-2 py-1 mt-3">
                      Soporte y Mediación
                    </span>
                    {supportLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
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
                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider px-2 py-1 mt-3">
                      Administración
                    </span>
                    {adminNavItems.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
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
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-surface-2"
                >
                  <User className="h-4 w-4" />
                  <span>Mi Cuenta</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout.mutate(undefined, { onSuccess: () => navigate('/') });
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger-soft text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{i18n.nav.logout}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* PIE DE PÁGINA (FOOTER) PROFESIONAL */}
      <footer className="border-t border-line bg-surface mt-auto">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Columna 1: Marca y Propuesta de Valor */}
            <div className="md:col-span-1 flex flex-col gap-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 border border-brand/30 text-brand">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <span className="text-base font-extrabold text-ink tracking-tight">TVS Segura</span>
              </Link>
              <p className="text-xs text-ink-muted leading-relaxed">
                Marketplace seguro con custodia de pagos simulada (escrow). Garantizamos transacciones protegidas con liberación de fondos solo tras confirmación de entrega o resolución justa de reclamos.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-brand mt-1">
                <Lock className="h-3.5 w-3.5" />
                <span className="font-semibold text-[11px]">Custodia Criptográfica & Auditoría Inmutable</span>
              </div>
            </div>

            {/* Columna 2: Compras */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Compras Protegidas
              </span>
              <ul className="flex flex-col gap-2 text-xs text-ink-muted">
                <li>
                  <Link to="/catalogo" className="hover:text-brand transition-colors">
                    Catálogo de Productos
                  </Link>
                </li>
                <li>
                  <Link to="/carrito" className="hover:text-brand transition-colors">
                    Mi Carrito de Compras
                  </Link>
                </li>
                <li>
                  <Link to="/pedidos" className="hover:text-brand transition-colors">
                    Seguimiento de Pedidos
                  </Link>
                </li>
                <li>
                  <Link to="/reclamos" className="hover:text-brand transition-colors">
                    Centro de Reclamos y Disputas
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Vendedores & Logística */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Comercios y Soporte
              </span>
              <ul className="flex flex-col gap-2 text-xs text-ink-muted">
                <li>
                  <Link to="/vender" className="hover:text-brand transition-colors">
                    Vender en TVS (Afiliación)
                  </Link>
                </li>
                <li>
                  <Link to="/cuenta" className="hover:text-brand transition-colors">
                    Seguridad y Sesiones
                  </Link>
                </li>
                <li>
                  <span className="text-ink-faint">Políticas de Devolución Segura</span>
                </li>
                <li>
                  <span className="text-ink-faint">Reglas de Liberación de Pagos</span>
                </li>
              </ul>
            </div>

            {/* Columna 4: Garantías de Seguridad */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-ink uppercase tracking-wider">
                Garantías del Sistema
              </span>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-2/60 border border-line/60">
                  <ShieldCheck className="h-4 w-4 text-brand shrink-0" />
                  <span className="text-[11px] text-ink-muted">
                    Contratos de Custodia por Pedido
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-2/60 border border-line/60">
                  <FileCheck2 className="h-4 w-4 text-info shrink-0" />
                  <span className="text-[11px] text-ink-muted">
                    Trazabilidad e IP en Registro de Auditoría
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Barra inferior */}
          <div className="mt-10 pt-6 border-t border-line/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
            <p>
              © 2026 {i18n.app.name}. Entorno de demostración y evaluación de seguridad informática.
            </p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-[11px] font-medium text-ink">Servicios Seguros Operativos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
