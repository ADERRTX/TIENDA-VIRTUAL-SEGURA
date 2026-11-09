import type { ReactNode } from 'react';
import { useReports } from '../api/admin';
import { Card } from '../components/ui/Card';
import { Stat } from '../components/ui/Stat';
import { PageHeader } from '../components/ui/PageHeader';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';
import {
  DollarSign,
  CheckCircle2,
  Scale,
  Calendar,
  Package,
  Award,
  TrendingUp,
} from 'lucide-react';

const orderLabels = i18n.orderStatus as Record<string, string>;
const resolutionLabels = i18n.claims.resolutions as Record<string, string>;
const claimLabels: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_RESPUESTA: 'En respuesta del vendedor',
  RESUELTO: 'Resuelto',
  APELADO: 'Apelado',
  CERRADO: 'Cerrado',
};

function ReportCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Card padding="lg" className="flex flex-col gap-4 shadow-sm">
      <div className="flex items-center gap-2.5 pb-3 border-b border-line/60">
        <div className="text-brand">{icon}</div>
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function ReportRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-line/30 last:border-b-0 text-xs">
      <div className="flex flex-col">
        <span className="font-medium text-ink">{label}</span>
        {sub && <span className="text-[10px] text-ink-muted">{sub}</span>}
      </div>
      <span className="font-bold text-ink tabular text-right">{value}</span>
    </div>
  );
}

function EmptyReport() {
  return <p className="text-xs text-ink-muted py-3 text-center">Sin registros disponibles aún.</p>;
}

export default function AdminReportsPage() {
  const { data, isLoading, isError, error, refetch } = useReports();

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <PageHeader
        title={i18n.admin.reportsTitle}
        description="Métricas consolidadas de facturación, volumen de pedidos y resolución de disputas."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Panel Admin' },
          { label: 'Reportes y Métricas' },
        ]}
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton variant="block" className="h-28 w-full" />
            <Skeleton variant="block" className="h-28 w-full" />
            <Skeleton variant="block" className="h-28 w-full" />
          </div>
          <Skeleton variant="block" className="h-48 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Error al cargar métricas y reportes"
          description={error instanceof ApiError ? error.message : i18n.common.error}
          onRetry={() => refetch()}
        />
      )}

      {data && (
        <div className="flex flex-col gap-8">
          {/* Métricas Clave (KPIs Superiores) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat
              label="Ventas Totales Facturadas"
              value={formatMoney(data.sales.totalSales)}
              icon={<DollarSign className="h-5 w-5" />}
              helperText="Custodiadas"
            />
            <Stat
              label="Transacciones Aprobadas"
              value={String(data.sales.approvedTransactions)}
              icon={<CheckCircle2 className="h-5 w-5" />}
              helperText="Pagos verificados"
            />
            <Stat
              label="Reclamos Formales"
              value={String(data.claims.total)}
              icon={<Scale className="h-5 w-5" />}
              helperText="En mediación"
            />
          </div>

          {/* Bloques de Detalle en Cuadrícula 2 Columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Ventas por mes */}
            <ReportCard title="Ventas por Mes" icon={<Calendar className="h-4.5 w-4.5" />}>
              {data.sales.byMonth.length === 0 && <EmptyReport />}
              <div className="flex flex-col">
                {data.sales.byMonth.map((m) => (
                  <ReportRow key={m.month} label={m.month} value={formatMoney(m.amount)} />
                ))}
              </div>
            </ReportCard>

            {/* Pedidos por estado */}
            <ReportCard title="Pedidos por Estado" icon={<Package className="h-4.5 w-4.5" />}>
              {data.orders.length === 0 && <EmptyReport />}
              <div className="flex flex-col">
                {data.orders.map((o) => (
                  <ReportRow key={o.status} label={orderLabels[o.status] ?? o.status} value={`${o.count} pedidos`} />
                ))}
              </div>
            </ReportCard>

            {/* Reclamos por estado */}
            <ReportCard title="Reclamos por Estado" icon={<Scale className="h-4.5 w-4.5" />}>
              {data.claims.byStatus.length === 0 && <EmptyReport />}
              <div className="flex flex-col">
                {data.claims.byStatus.map((c) => (
                  <ReportRow key={c.status} label={claimLabels[c.status] ?? c.status} value={`${c.count} casos`} />
                ))}
              </div>
            </ReportCard>

            {/* Reclamos por resolución */}
            <ReportCard title="Resoluciones Dictaminadas" icon={<Award className="h-4.5 w-4.5" />}>
              {data.claims.byResolution.length === 0 && <EmptyReport />}
              <div className="flex flex-col">
                {data.claims.byResolution.map((r, index) => {
                  const key = r.resolution ?? r.status ?? String(index);
                  return (
                    <ReportRow
                      key={key}
                      label={resolutionLabels[key] ?? key}
                      value={`${r.count} dictámenes`}
                    />
                  );
                })}
              </div>
            </ReportCard>
          </div>

          {/* Productos más vendidos */}
          <ReportCard title="Productos Más Vendidos" icon={<TrendingUp className="h-4.5 w-4.5" />}>
            {data.top.length === 0 && <EmptyReport />}
            <div className="flex flex-col divide-y divide-line/30">
              {data.top.map((p) => (
                <ReportRow
                  key={p.variantId}
                  label={p.productTitle}
                  sub={`Variante: ${p.variantName} · ${p.quantitySold} unidades vendidas`}
                  value={formatMoney(p.revenue)}
                />
              ))}
            </div>
          </ReportCard>
        </div>
      )}
    </div>
  );
}
