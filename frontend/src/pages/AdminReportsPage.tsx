import type { ReactNode } from 'react';
import { useReports } from '../api/admin';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';

const orderLabels = i18n.orderStatus as Record<string, string>;
const resolutionLabels = i18n.claims.resolutions as Record<string, string>;
const claimLabels: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_RESPUESTA: 'En respuesta del vendedor',
  RESUELTO: 'Resuelto',
  APELADO: 'Apelado',
  CERRADO: 'Cerrado',
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface-2 p-4">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="text-2xl font-bold text-brand">{value}</span>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-5">
      <h2 className="font-bold text-brand">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-ink-muted">Sin datos todavía.</p>;
}

export default function AdminReportsPage() {
  const { data, isLoading, isError, error, refetch } = useReports();

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">{i18n.admin.reportsTitle}</h1>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}
      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{error instanceof ApiError ? error.message : i18n.common.error}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Ventas totales" value={formatMoney(data.sales.totalSales)} />
            <Stat label="Transacciones aprobadas" value={String(data.sales.approvedTransactions)} />
            <Stat label="Reclamos" value={String(data.claims.total)} />
          </div>

          <Block title="Ventas por mes">
            {data.sales.byMonth.length === 0 && <Empty />}
            {data.sales.byMonth.map((m) => (
              <Row key={m.month} label={m.month} value={formatMoney(m.amount)} />
            ))}
          </Block>

          <Block title="Pedidos por estado">
            {data.orders.length === 0 && <Empty />}
            {data.orders.map((o) => (
              <Row key={o.status} label={orderLabels[o.status] ?? o.status} value={String(o.count)} />
            ))}
          </Block>

          <Block title="Reclamos por estado">
            {data.claims.byStatus.length === 0 && <Empty />}
            {data.claims.byStatus.map((c) => (
              <Row key={c.status} label={claimLabels[c.status] ?? c.status} value={String(c.count)} />
            ))}
          </Block>

          <Block title="Reclamos por resolución">
            {data.claims.byResolution.length === 0 && <Empty />}
            {data.claims.byResolution.map((r, index) => {
              const key = r.resolution ?? r.status ?? String(index);
              return <Row key={key} label={resolutionLabels[key] ?? key} value={String(r.count)} />;
            })}
          </Block>

          <Block title="Productos más vendidos">
            {data.top.length === 0 && <Empty />}
            {data.top.map((p) => (
              <Row
                key={p.variantId}
                label={`${p.productTitle} · ${p.variantName} (${p.quantitySold} u.)`}
                value={formatMoney(p.revenue)}
              />
            ))}
          </Block>
        </>
      )}
    </section>
  );
}