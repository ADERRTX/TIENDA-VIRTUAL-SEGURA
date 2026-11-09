import { useState, type FormEvent } from 'react';
import {
  useDispatchOrder,
  useSellerAction,
  useSellerOrders,
  type SellerSubOrder,
} from '../api/seller';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { i18n } from '../i18n/es';
import { formatDate, formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';
import {
  Package,
  User,
  MapPin,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

function DispatchButton({ subOrder }: { subOrder: SellerSubOrder }) {
  const [open, setOpen] = useState(false);
  const [carrier, setCarrier] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [date, setDate] = useState('');
  const dispatch = useDispatchOrder();
  const text = i18n.seller.dispatchModal;

  const close = () => {
    setOpen(false);
    dispatch.reset();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const estimatedDate = new Date(`${date}T12:00:00`).toISOString();
    dispatch.mutate({ id: subOrder.id, carrier, trackingCode, estimatedDate }, { onSuccess: close });
  };

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        className="font-semibold text-xs gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Truck className="h-3.5 w-3.5" />
        <span>{i18n.seller.actions.dispatch}</span>
      </Button>

      <Modal isOpen={open} onClose={close} title={text.title} size="md">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
            <span>{text.carrier}</span>
            <input
              className="h-10 px-3.5 rounded-lg border border-line bg-surface-2 text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
              placeholder="Ej. Olva Courier, Shalom, Urbano"
              value={carrier}
              required
              minLength={2}
              onChange={(e) => setCarrier(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
            <span>{text.trackingCode}</span>
            <input
              className="h-10 px-3.5 rounded-lg border border-line bg-surface-2 text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
              placeholder="Ej. TRK-98234-PE"
              value={trackingCode}
              required
              minLength={3}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
            <span>{text.estimatedDate}</span>
            <input
              type="date"
              className="h-10 px-3.5 rounded-lg border border-line bg-surface-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
              value={date}
              required
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          {dispatch.isError && (
            <p className="text-xs text-danger flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errorMessage(dispatch.error)}</span>
            </p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-line/50">
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              {i18n.common.cancel}
            </Button>
            <Button type="submit" size="sm" isLoading={dispatch.isPending} className="font-semibold">
              {text.confirm}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Actions({ subOrder }: { subOrder: SellerSubOrder }) {
  const action = useSellerAction();
  const run = (name: 'confirm' | 'prepare') => action.mutate({ id: subOrder.id, action: name });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {subOrder.status === 'PAGADO' && (
        <Button
          size="sm"
          variant="primary"
          className="text-xs font-semibold gap-1.5"
          isLoading={action.isPending}
          onClick={() => run('confirm')}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{i18n.seller.actions.confirm}</span>
        </Button>
      )}

      {subOrder.status === 'CONFIRMADO' && (
        <Button
          size="sm"
          variant="secondary"
          className="text-xs font-semibold gap-1.5"
          isLoading={action.isPending}
          onClick={() => run('prepare')}
        >
          <Clock className="h-3.5 w-3.5 text-brand" />
          <span>{i18n.seller.actions.prepare}</span>
        </Button>
      )}

      {subOrder.status === 'EN_PREPARACION' && <DispatchButton subOrder={subOrder} />}

      {action.isError && (
        <p className="text-xs text-danger flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{errorMessage(action.error)}</span>
        </p>
      )}
    </div>
  );
}

function SubOrderCard({ subOrder }: { subOrder: SellerSubOrder }) {
  const total = subOrder.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const { buyer, address } = subOrder.order;

  return (
    <Card padding="md" className="flex flex-col gap-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-brand border border-line">
            <Package className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-sm text-ink">
              Sub-pedido #{subOrder.id.slice(0, 8).toUpperCase()}
            </h2>
            <span className="text-[11px] text-ink-muted">
              {formatDate(subOrder.createdAt)}
            </span>
          </div>
        </div>

        <StatusBadge status={subOrder.status} category="order" />
      </header>

      {/* Info del comprador y destino */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2 text-ink-muted">
          <User className="h-4 w-4 text-brand shrink-0" />
          <span>
            Comprador: <strong className="text-ink">{buyer.fullName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-ink-muted">
          <MapPin className="h-4 w-4 text-info shrink-0" />
          <span className="truncate">
            {address.label} · {address.line1}, {address.city}
          </span>
        </div>
      </div>

      {/* Items del pedido */}
      <ul className="flex flex-col divide-y divide-line/30 text-xs border-t border-line/50 pt-2">
        {subOrder.items.map((item) => (
          <li key={item.id} className="py-2 flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-ink font-medium">{item.name}</span>
              <span className="text-ink-muted">× {item.quantity}</span>
            </div>
            <span className="font-bold text-ink tabular">
              {formatMoney(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {/* Acciones y Total */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60">
        <Actions subOrder={subOrder} />

        <div className="flex items-baseline gap-2">
          <span className="text-xs text-ink-muted font-medium">{i18n.cart.total}:</span>
          <span className="text-base font-black text-brand tabular">
            {formatMoney(total)}
          </span>
        </div>
      </footer>
    </Card>
  );
}

export default function SellerOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useSellerOrders(page);
  const needsLogin = error instanceof ApiError && error.status === 401;
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader
        title={i18n.seller.pendingOrders}
        description="Gestiona y despacha los sub-pedidos adquiridos por compradores en tu tienda."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Panel de Vendedor' },
          { label: 'Pedidos por Atender' },
        ]}
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" className="h-36 w-full" />
          <Skeleton variant="block" className="h-36 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title={needsLogin ? 'Inicio de sesión requerido' : 'Error al consultar pedidos'}
          description={
            needsLogin
              ? 'Inicia sesión como comercio vendedor para ver tus pedidos.'
              : errorMessage(error)
          }
          actionLabel={needsLogin ? i18n.nav.login : i18n.common.retry}
          onAction={needsLogin ? () => (window.location.href = '/login') : () => refetch()}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="Sin pedidos pendientes"
          description="Actualmente no tienes pedidos pendientes de confirmación o despacho."
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {data.items.map((subOrder) => (
              <SubOrderCard key={subOrder.id} subOrder={subOrder} />
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
