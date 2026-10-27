
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  useCancelOrder,
  useConfirmDelivery,
  useCreateClaim,
  useCreateReview,
  useOrders,
  type MyOrder,
  type OrderItem,
  type SubOrder,
} from '../api/orders';
import OrderTimeline from '../components/OrderTimeline';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { i18n } from '../i18n/es';
import { formatDate, formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';

const labels = i18n.orderStatus as Record<string, string>;
const inputClass =
  'w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

function statusLabel(status: string): string {
  return labels[status] ?? status;
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
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
          {cancel.isError && <p className="text-sm text-red-400">{errorMessage(cancel.error)}</p>}
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

function ConfirmDelivery({ subOrder }: { subOrder: SubOrder }) {
  const [open, setOpen] = useState(false);
  const confirm = useConfirmDelivery();

  const close = () => {
    setOpen(false);
    confirm.reset();
  };

  return (
    <>
      <Button size="sm" className="self-start" onClick={() => setOpen(true)}>
        {i18n.orders.confirmDelivery}
      </Button>
      <Modal isOpen={open} onClose={close} title={i18n.orders.confirmDelivery}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-muted">{i18n.orders.confirmDeliveryPrompt}</p>
          {confirm.isError && <p className="text-sm text-red-400">{errorMessage(confirm.error)}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={close}>
              {i18n.common.back}
            </Button>
            <Button
              size="sm"
              isLoading={confirm.isPending}
              onClick={() => confirm.mutate(subOrder.id, { onSuccess: close })}
            >
              {i18n.orders.confirmDelivery}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function ClaimButton({ subOrder }: { subOrder: SubOrder }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const claim = useCreateClaim();

  const close = () => {
    setOpen(false);
    claim.reset();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    claim.mutate(
      { subOrderId: subOrder.id, reason: reason.trim() },
      {
        onSuccess: () => {
          setReason('');
          close();
        },
      },
    );
  };

  return (
    <>
      <Button variant="secondary" size="sm" className="self-start" onClick={() => setOpen(true)}>
        {i18n.orders.claimOrder}
      </Button>
      <Modal isOpen={open} onClose={close} title={i18n.claims.openTitle}>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {i18n.claims.reasonPrompt}
            <textarea
              className={inputClass}
              rows={4}
              required
              minLength={10}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          {claim.isError && <p className="text-sm text-red-400">{errorMessage(claim.error)}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={close}>
              {i18n.common.cancel}
            </Button>
            <Button type="submit" size="sm" isLoading={claim.isPending}>
              {i18n.claims.submit}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function ReviewButton({ item }: { item: OrderItem }) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const review = useCreateReview();

  const close = () => {
    setOpen(false);
    review.reset();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = comment.trim();
    review.mutate(
      { orderItemId: item.id, stars, ...(text ? { comment: text } : {}) },
      { onSuccess: close },
    );
  };

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        {i18n.orders.reviewProduct}
      </Button>
      <Modal isOpen={open} onClose={close} title={`${i18n.reviews.writeTitle}: ${item.name}`}>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-sm">
            {i18n.reviews.starsPrompt}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} estrellas`}
                  onClick={() => setStars(n)}
                  className={`text-2xl ${n <= stars ? 'text-brand' : 'text-ink-muted'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            {i18n.reviews.commentPrompt}
            <textarea
              className={inputClass}
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>
          {review.isError && <p className="text-sm text-red-400">{errorMessage(review.error)}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={close}>
              {i18n.common.cancel}
            </Button>
            <Button type="submit" size="sm" isLoading={review.isPending}>
              {i18n.reviews.submit}
            </Button>
          </div>
        </form>
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
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="flex items-center gap-2">
                  {formatMoney(item.unitPrice * item.quantity)}
                  {sub.status === 'FINALIZADO' && <ReviewButton item={item} />}
                </span>
              </li>
            ))}
          </ul>
          {sub.status === 'PAGADO' && <CancelSubOrder subOrder={sub} />}
       {['ENTREGADO', 'EN_TRANSITO', 'EN_REPARTO'].includes(sub.status) && (
  <div className="flex flex-wrap gap-2">
    {sub.status === 'ENTREGADO' && <ConfirmDelivery subOrder={sub} />}
    <ClaimButton subOrder={sub} />
  </div>
)}
        </div>
      ))}
<OrderTimeline orderId={order.id} />
      <footer className="flex flex-wrap items-end justify-between gap-2 border-t border-line pt-3">
        <p className="text-xs text-ink-muted">
          Entrega: {order.address.label} · {order.address.line1}, {order.address.city},{' '}
          {order.address.province}
        </p>
        <p className="text-lg">
          {i18n.cart.total}:{' '}
          <span className="font-bold text-brand">{formatMoney(orderTotal(order))}</span>
        </p>
      </footer>
    </article>
  );
}

export default function OrdersPage() {
  const { data, isLoading, isError, error, refetch } = useOrders();
  const needsLogin = error instanceof ApiError && error.status === 401;

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">{i18n.orders.title}</h1>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}

      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">
            {needsLogin ? 'Inicia sesión para ver tus pedidos.' : i18n.common.error}
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

      {data && data.length === 0 && <p className="text-ink-muted">{i18n.orders.empty}</p>}

      {data?.map((order) => <OrderCard key={order.id} order={order} />)}
    </section>
  );
}