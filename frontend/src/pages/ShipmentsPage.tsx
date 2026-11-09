import { useState } from 'react';
import {
  useAddShipmentEvent,
  useShipments,
  type ShipmentEventType,
  type ShipmentSubOrder,
} from '../api/shipments';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';
import { i18n } from '../i18n/es';
import { formatDate, formatDateOnly } from '../lib/formatters';
import { ApiError } from '../lib/http';
import {
  Truck,
  Store,
  User,
  MapPin,
  Calendar,
  Barcode,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

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
    <Card padding="md" className="flex flex-col gap-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-info border border-line">
            <Truck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-semibold text-sm text-ink">
              Envío de Pedido #{subOrder.id.slice(0, 8).toUpperCase()}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Store className="h-3 w-3 text-brand" />
              <span>Tienda: {subOrder.seller.storeName}</span>
            </div>
          </div>
        </div>

        <StatusBadge status={subOrder.status} category="order" />
      </header>

      {/* Datos logísticos y guía */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-surface-2/60 border border-line/60 text-xs">
        <div className="flex items-center gap-2 text-ink">
          <Truck className="h-4 w-4 text-info shrink-0" />
          <div>
            <span className="block text-xs text-ink-muted uppercase">Transportista</span>
            <span className="font-medium">{shipment.carrier}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-ink">
          <Barcode className="h-4 w-4 text-brand shrink-0" />
          <div>
            <span className="block text-xs text-ink-muted uppercase">N° Guía</span>
            <span className="font-mono font-medium">{shipment.trackingCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-ink">
          <Calendar className="h-4 w-4 text-warning shrink-0" />
          <div>
            <span className="block text-xs text-ink-muted uppercase">Entrega estimada</span>
            <span className="font-semibold">{formatDateOnly(shipment.estimatedDate)}</span>
          </div>
        </div>
      </div>

      {/* Comprador y Dirección */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 text-ink-muted">
          <User className="h-4 w-4 text-brand shrink-0" />
          <span>
            Destinatario: <strong className="text-ink">{order.buyer.fullName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-ink-muted">
          <MapPin className="h-4 w-4 text-info shrink-0" />
          <span className="truncate">
            {order.address.label} · {order.address.line1}, {order.address.city}
          </span>
        </div>
      </div>

      {/* Eventos de Trazabilidad Logística */}
      <div className="flex flex-col gap-2 border-t border-line/60 pt-3 text-xs">
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">
          Bitácora de Eventos de Encomienda:
        </span>
        <ol className="relative ml-2 flex flex-col gap-2.5 border-l-2 border-line/80 pl-3 py-1">
          {shipment.trackingEvents.map((event) => (
            <li key={event.id} className="relative flex items-center justify-between gap-3 text-xs">
              <span className="absolute -left-[17px] top-1.5 flex h-2 w-2 rounded-full bg-info ring-2 ring-surface" />
              <span className="font-semibold text-ink">
                {eventLabels[event.type] ?? event.type}
              </span>
              <span className="text-xs text-ink-muted">
                {formatDate(event.occurredAt)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Botón para avanzar estado */}
      {next && (
        <div className="pt-2 border-t border-line/60 flex items-center justify-between">
          <Button
            size="sm"
            variant="primary"
            className="font-semibold text-xs gap-1.5"
            isLoading={add.isPending}
            onClick={() => add.mutate({ subOrderId: subOrder.id, type: next })}
          >
            <span>Registrar avance: {eventLabels[next]}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>

          {add.isError && (
            <p className="text-xs text-danger flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errorMessage(add.error)}</span>
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

export default function ShipmentsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('ALL');
  const { data, isLoading, isError, error, refetch } = useShipments(page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  const tabs = [
    { id: 'ALL', label: 'Todos', count: data?.items?.length },
    { id: 'DESPACHADO', label: 'Despachados' },
    { id: 'EN_TRANSITO', label: 'En tránsito' },
    { id: 'ENTREGADO', label: 'Entregados' },
  ];

  const items = (data?.items ?? []).filter(
    (subOrder) => activeTab === 'ALL' || subOrder.status === activeTab,
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader
        title="Control de Envíos y Logística"
        description="Supervisión en tiempo real de encomiendas despachadas por transportista."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Envíos en Curso' },
        ]}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" className="h-40 w-full" />
          <Skeleton variant="block" className="h-40 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Error al consultar envíos"
          description={errorMessage(error)}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={<Truck className="h-8 w-8" />}
          title="Sin envíos en este estado"
          description="Actualmente no hay pedidos con guías en la sección seleccionada."
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {items.map((subOrder) => (
              <ShipmentCard key={subOrder.id} subOrder={subOrder} />
            ))}
          </div>

          {meta && lastPage > 1 && (
            <div className="pt-2 border-t border-line/40">
              <Pagination
                page={page}
                totalPages={lastPage}
                totalItems={meta.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
