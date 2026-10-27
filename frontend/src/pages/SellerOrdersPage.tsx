import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  useDispatchOrder,
  useSellerAction,
  useSellerOrders,
  type SellerSubOrder,
} from '../api/seller';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { i18n } from '../i18n/es';
import { formatDate, formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';

const labels = i18n.orderStatus as Record<string, string>;
const inputClass =
  'w-full min-h-[44px] rounded-xl border border-line bg-bg px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

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
      <Button size="sm" className="self-start" onClick={() => setOpen(true)}>
        {i18n.seller.actions.dispatch}
      </Button>
      <Modal isOpen={open} onClose={close} title={text.title}>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {text.carrier}
            <input className={inputClass} value={carrier} required minLength={2} onChange={(e) => setCarrier(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {text.trackingCode}
            <input className={inputClass} value={trackingCode} required minLength={3} onChange={(e) => setTrackingCode(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {text.estimatedDate}
            <input type="date" className={inputClass} value={date} required onChange={(e) => setDate(e.target.value)} />
          </label>
          {dispatch.isError && <p className="text-sm text-red-400">{errorMessage(dispatch.error)}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={close}>
              {i18n.common.cancel}
            </Button>
            <Button type="submit" size="sm" isLoading={dispatch.isPending}>
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
    <div className="flex flex-col items-start gap-2">
      {subOrder.status === 'PAGADO' && (
        <Button size="sm" isLoading={action.isPending} onClick={() => run('confirm')}>
          {i18n.seller.actions.confirm}
        </Button>
      )}
      {subOrder.status === 'CONFIRMADO' && (
        <Button size="sm" isLoading={action.isPending} onClick={() => run('prepare')}>
          {i18n.seller.actions.prepare}
        </Button>
      )}
      {subOrder.status === 'EN_PREPARACION' && <DispatchButton subOrder={subOrder} />}
      {action.isError && <p className="text-sm text-red-400">{errorMessage(action.error)}</p>}
    </div>
  );
}

function SubOrderCard({ subOrder }: { subOrder: SellerSubOrder }) {
  const total = subOrder.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const { buyer, address } = subOrder.order;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold">Pedido #{subOrder.id.slice(0, 8)}</h2>
          <p className="text-xs text-ink-muted">{formatDate(subOrder.createdAt)}</p>
        </div>
        <span className="rounded-full border border-brand/50 px-3 py-1 text-xs font-semibold text-brand">
          {labels[subOrder.status] ?? subOrder.status}
        </span>
      </header>

      <p className="text-sm">
        Comprador: <strong>{buyer.fullName}</strong>
      </p>
      <p className="text-xs text-ink-muted">
        Entrega: {address.label} · {address.line1}, {address.city}, {address.province}
      </p>

      <ul className="flex flex-col gap-1 border-t border-line pt-3 text-sm">
        {subOrder.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatMoney(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <footer className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-3">
        <Actions subOrder={subOrder} />
        <p className="text-lg">
          {i18n.cart.total}: <span className="font-bold text-brand">{formatMoney(total)}</span>
        </p>
      </footer>
    </article>
  );
}

export default function SellerOrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useSellerOrders(page);
  const needsLogin = error instanceof ApiError && error.status === 401;
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  return (
    <section className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-2xl font-bold">{i18n.seller.pendingOrders}</h1>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}

      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">
            {needsLogin ? 'Inicia sesión como vendedor para ver tus pedidos.' : errorMessage(error)}
          </p>
          {needsLogin ? (
            <Link to="/login" className="font-semibold text-brand underline">
              {i18n.nav.login}
            </Link>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              {i18n.common.retry}
            </Button>
          )}
        </div>
      )}

      {data && data.items.length === 0 && <p className="text-ink-muted">No tienes pedidos todavía.</p>}

      {data?.items.map((subOrder) => <SubOrderCard key={subOrder.id} subOrder={subOrder} />)}

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