import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { http } from '../../lib/http';
import { i18n } from '../../i18n/es';
import { ShieldCheck } from 'lucide-react';
import type { User as AuthUser } from '../../api/auth';

export interface AppFooterProps {
  user?: AuthUser | null;
}

export function AppFooter({ user }: AppFooterProps) {
  const { data: healthData, isError: healthError } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => (await http<{ status: string }>('/health')).data,
    refetchInterval: 60000,
    retry: false,
    staleTime: 30000,
  });

  const isDegraded = healthError || (healthData && healthData.status !== 'ok');

  return (
    <footer className="w-full bg-deep text-brand-ink mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pb-10 border-b border-deep-2">
          {/* Columna 1: Tienda */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 text-brand-ink">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint text-deep font-semibold">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-base font-semibold tracking-tight">{i18n.app.name}</span>
            </Link>
            <p className="text-xs text-deep-muted leading-relaxed max-w-sm">
              Plataforma de comercio electrónico con custodia de pagos. Los fondos se mantienen seguros hasta la confirmación de entrega satisfactoria.
            </p>
            <ul className="flex flex-col gap-2 text-xs text-deep-muted mt-2">
              <li>
                <Link to="/catalogo" className="hover:text-brand-ink transition-colors">
                  {i18n.nav.catalog}
                </Link>
              </li>
              <li>
                <Link to="/carrito" className="hover:text-brand-ink transition-colors">
                  {i18n.nav.cart}
                </Link>
              </li>
              {(!user || user.role === 'BUYER') && (
                <li>
                  <Link to="/vender" className="hover:text-brand-ink transition-colors">
                    Vender en TVS
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Columna 2: Mi cuenta según rol */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-muted">
              {user ? `Mi Cuenta (${i18n.roles[user.role]})` : 'Mi Cuenta'}
            </span>
            <ul className="flex flex-col gap-2 text-xs text-deep-muted">
              {!user && (
                <>
                  <li>
                    <Link to="/login" className="hover:text-brand-ink transition-colors">
                      {i18n.nav.login}
                    </Link>
                  </li>
                  <li>
                    <Link to="/registro" className="hover:text-brand-ink transition-colors">
                      {i18n.nav.register}
                    </Link>
                  </li>
                </>
              )}

              {user?.role === 'BUYER' && (
                <>
                  <li>
                    <Link to="/pedidos" className="hover:text-brand-ink transition-colors">
                      {i18n.nav.orders}
                    </Link>
                  </li>
                  <li>
                    <Link to="/reclamos" className="hover:text-brand-ink transition-colors">
                      Mis Reclamos
                    </Link>
                  </li>
                  <li>
                    <Link to="/cuenta" className="hover:text-brand-ink transition-colors">
                      Datos y Direcciones
                    </Link>
                  </li>
                </>
              )}

              {user?.role === 'SELLER' && (
                <>
                  <li>
                    <Link to="/vendedor/tienda" className="hover:text-brand-ink transition-colors">
                      Mi Tienda
                    </Link>
                  </li>
                  <li>
                    <Link to="/vendedor/productos" className="hover:text-brand-ink transition-colors">
                      Mis Productos
                    </Link>
                  </li>
                  <li>
                    <Link to="/vendedor/pedidos" className="hover:text-brand-ink transition-colors">
                      Pedidos por Atender
                    </Link>
                  </li>
                  <li>
                    <Link to="/reclamos" className="hover:text-brand-ink transition-colors">
                      Reclamos Comerciales
                    </Link>
                  </li>
                </>
              )}

              {user?.role === 'SUPPORT' && (
                <>
                  <li>
                    <Link to="/reclamos" className="hover:text-brand-ink transition-colors">
                      Mediación de Reclamos
                    </Link>
                  </li>
                  <li>
                    <Link to="/envios" className="hover:text-brand-ink transition-colors">
                      Control de Envíos
                    </Link>
                  </li>
                  <li>
                    <Link to="/cuenta" className="hover:text-brand-ink transition-colors">
                      Mi Perfil
                    </Link>
                  </li>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <li>
                    <Link to="/admin/vendedores" className="hover:text-brand-ink transition-colors">
                      Solicitudes de Vendedores
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/usuarios" className="hover:text-brand-ink transition-colors">
                      Gestión de Usuarios
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/auditoria" className="hover:text-brand-ink transition-colors">
                      Registro de Auditoría
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/reportes" className="hover:text-brand-ink transition-colors">
                      Reportes y Métricas
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Columna 3: Ayuda */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-deep-muted">
              Ayuda y Garantías
            </span>
            <ul className="flex flex-col gap-2 text-xs text-deep-muted">
              <li>
                <Link to="/reclamos" className="hover:text-brand-ink transition-colors">
                  Centro de Mediación y Disputas
                </Link>
              </li>
              <li>
                <Link to="/pedidos" className="hover:text-brand-ink transition-colors">
                  Consulta de Estado de Envío
                </Link>
              </li>
              <li>
                <Link to="/cuenta" className="hover:text-brand-ink transition-colors">
                  Seguridad de la Cuenta y Sesiones
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea inferior: Proyecto académico y estado de servicio real */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-deep-muted">
          <p>
            © 2026 {i18n.app.name}. Proyecto académico de comercio electrónico con custodia y seguridad informática.
          </p>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isDegraded ? 'bg-warning' : 'bg-success'
              }`}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-brand-ink">
              {isDegraded ? 'Servicios degradados' : 'Servicios operativos'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
