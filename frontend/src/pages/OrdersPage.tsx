import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCancelOrder, useOrders, type MyOrder, type SubOrder } from '../api/orders';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { i18n } from '../i18n/es';
import { formatDate, formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';

const labels = i18n.orderStatus as Record<string, string>;

function statusLabel(status: string): string {
  return labels[status] ?? status;
}

function orderTotal(order: MyOrder): number {
  return order.subOrders
    .flatMap((sub) => sub.items)
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

function StatusTag({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-brand/50 px-3 py-1 text-xs font-semibold text-brand">
      {statusLabel(status)}
    </span>
  );
}
function CancelSubOrder({ subOrder }: { subOrder: SubOrder }) {
  const [confirming, setConfirming] = useState(false);
  const cancel = useCancelOrder();

  const closeModal = () => {
    setConfirming(false);
    cancel.reset();
  };

  return (
    <>
      <Button variant="danger" size="sm" className="self-start" onClick={() => setConfirming(true)}>
        {i18n.orders.cancelOrder}
      </Button>
      <Modal isOpen={confirming} onClose={closeModal} title={i18n.orders.cancelOrder}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">{i18n.orders.cancelOrderPrompt}</p>
          {cancel.isError && (
            <p className="text-sm text-red-400">
              {cancel.error instanceof ApiError ? cancel.error.message : i18n.common.error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={closeModal}>
              {i18n.common.back}
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={cancel.isPending}
              onClick={() => cancel.mutate(subOrder.id, { onSuccess: closeModal })}
            >
              {i18n.orders.cancelOrder}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
function OrderCard({ order }: { order: MyOrder }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-line bg-surface-2 p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold">Pedido #{order.id.slice(0, 8)}</h2>
          <p className="text-xs text-ink-muted">{formatDate(order.createdAt)}</p>
        </div>
        <StatusTag status={order.status} />
      </header>

      {order.subOrders.map((sub) => (
        <div key={sub.id} className="flex flex-col gap-2 border-t border-line pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {i18n.cart.sellerGroup} {sub.seller.storeName}
            </p>
            <StatusTag status={sub.status} />
          </div>
          <ul className="flex flex-col gap-1 text-sm">
            {sub.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatMoney(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          {sub.status === 'PAGADO' && <CancelSubOrder subOrder={sub} />}
        </div>
      ))}

      <footer className="flex flex-wrap items-end justify-between gap-2 border-t border-line pt-3">
        <p className="text-xs text-ink-muted">
          Entrega: {order.address.label} · {order.address.line1}, {order.address.city},{' '}
          {order.address.province}
        </p>
        <p className="text-lg">
          {i18n.cart.total}: <span className="font-bold text-brand">{formatMoney(orderTotal(order))}</span>
        </p>
      </footer>
    </article>
  );
}

export default function OrdersPage() {
  const { data, isLoading, isError, error, refetch } = useOrders();
  const needsLogin = error instanceof ApiError && error.status === 401;

  return (
    <section className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-2xl font-bold">{i18n.orders.title}</h1>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}

      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{needsLogin ? 'Inicia sesión para ver tus pedidos.' : i18n.common.error}</p>
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

      {data && data.length === 0 && <p className="text-ink-muted">{i18n.orders.empty}</p>}

      {data?.map((order) => <OrderCard key={order.id} order={order} />)}
    </section>
  );
}