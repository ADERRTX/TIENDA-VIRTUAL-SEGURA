import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { http } from '../../lib/http';
import { i18n } from '../../i18n/es';
import { ShieldCheck, FileCheck2 } from 'lucide-react';

export function AppFooter() {
  const { data: healthData, isError: healthError } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => (await http<{ status: string }>('/health')).data,
    refetchInterval: 60000,
    retry: false,
    staleTime: 30000,
  });

  const isDegraded = healthError || (healthData && healthData.status !== 'ok');

  return (
    <footer className="border-t border-line bg-surface mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Columna 1: Marca y Propuesta de Valor */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 border border-brand/30 text-brand">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-base font-semibold text-ink tracking-tight">TVS Segura</span>
            </Link>
            <p className="text-xs text-ink-muted leading-relaxed">
              Marketplace seguro con custodia de pagos simulada (escrow). Garantizamos transacciones protegidas con liberación de fondos solo tras confirmación de entrega o resolución justa de reclamos.
            </p>
          </div>

          {/* Columna 2: Compras */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-ink uppercase tracking-wider">
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
            <span className="text-xs font-semibold text-ink uppercase tracking-wider">
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
            <span className="text-xs font-semibold text-ink uppercase tracking-wider">
              Garantías del Sistema
            </span>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-2/60 border border-line/60">
                <ShieldCheck className="h-4 w-4 text-brand shrink-0" />
                <span className="text-xs text-ink-muted">
                  Contratos de Custodia por Pedido
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-2/60 border border-line/60">
                <FileCheck2 className="h-4 w-4 text-info shrink-0" />
                <span className="text-xs text-ink-muted">
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
            <span
              className={`h-2 w-2 rounded-full ${
                isDegraded ? 'bg-warning' : 'bg-success'
              }`}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-ink">
              {isDegraded ? 'Servicios degradados' : 'Servicios operativos'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
