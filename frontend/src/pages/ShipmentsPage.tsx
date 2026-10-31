import { useState } from 'react';
import {
  useAddShipmentEvent,
  useShipments,
  type ShipmentEventType,
  type ShipmentSubOrder,
} from '../api/shipments';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatDate, formatDateOnly } from '../lib/formatters';
import { ApiError } from '../lib/http';

const statusLabels = i18n.orderStatus as Record<string, string>;

const eventLabels: Record<string, string> = {
  DESPACHADO: 'Despachado',
  EN_TRANSITO: 'En tránsito',
  EN_REPARTO: 'En reparto',
  ENTREGADO: 'Entregado',
};

const nextEvent: Record<string, ShipmentEventType | undefined> = {
  DESPACHADO: 'EN_TRANSITO',
  EN_TRANSITO: 'EN_REPARTO',
  EN_REPARTO: 'ENTREGADO',
};

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

function ShipmentCard({ subOrder }: { subOrder: ShipmentSubOrder }) {
  const add = useAddShipmentEvent();
  const next = nextEvent[subOrder.status];
  const { shipment, order } = subOrder;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold">Pedido #{subOrder.id.slice(0, 8)}</h2>
          <p className="text-xs text-ink-muted">Tienda: {subOrder.seller.storeName}</p>
        </div>
        <span className="rounded-full border border-brand/50 px-3 py-1 text-xs font-semibold text-brand">
          {statusLabels[subOrder.status] ?? subOrder.status}
        </span>
      </header>

      <p className="text-sm">
        Comprador: <strong>{order.buyer.fullName}</strong>
      </p>
      <p className="text-xs text-ink-muted">
        Entrega: {order.address.label} · {order.address.line1}, {order.address.city},{' '}
        {order.address.province}
      </p>
      <p className="text-xs text-ink-muted">
        Transportista: {shipment.carrier} · Guía: {shipment.trackingCode} · Entrega estimada:{' '}
        {formatDateOnly(shipment.estimatedDate)}
      </p>

      <ul className="flex flex-col gap-1 border-t border-line pt-3 text-sm">
        {subOrder.items.map((item) => (
          <li key={item.id}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <ol className="flex flex-col gap-1 border-t border-line pt-3 text-sm">
        {shipment.trackingEvents.map((event) => (
          <li key={event.id} className="flex justify-between gap-4">
            <span>{eventLabels[event.type] ?? event.type}</span>
            <span className="text-xs text-ink-muted">{formatDate(event.occurredAt)}</span>
          </li>
        ))}
      </ol>

      {next && (
        <Button
          size="sm"
          className="self-start"
          isLoading={add.isPending}
          onClick={() => add.mutate({ subOrderId: subOrder.id, type: next })}
        >
          Registrar: {eventLabels[next]}
        </Button>
      )}
      {add.isError && <p className="text-sm text-red-400">{errorMessage(add.error)}</p>}
    </article>
  );
}

export default function ShipmentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useShipments(page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Envíos en curso</h1>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}
      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{errorMessage(error)}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}
      {data && data.items.length === 0 && <p className="text-ink-muted">No hay envíos en curso.</p>}
      {data?.items.map((subOrder) => <ShipmentCard key={subOrder.id} subOrder={subOrder} />)}

      {meta && lastPage > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-ink-muted">
            Página {page} de {lastPage}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => setPage(page + 1)}>
            Siguiente
          </Button>
        </div>
      )}
    </section>
  );
}