import { useState, type FormEvent } from 'react';
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
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { Textarea } from '../components/ui/Textarea';
import { i18n } from '../i18n/es';
import { formatDate, formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';
import {
  Package,
  Store,
  MapPin,
  CheckCircle2,
  Scale,
  Star,
  XCircle,
} from 'lucide-react';

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

function orderTotal(order: MyOrder): number {
  return order.subOrders
    .flatMap((sub) => sub.items)
    .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
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
      <Button
        variant="danger"
        size="sm"
        className="text-xs"
        onClick={() => setConfirming(true)}
      >
        <XCircle className="h-3.5 w-3.5 mr-1" />
        {i18n.orders.cancelOrder}
      </Button>

      <Modal isOpen={confirming} onClose={closeModal} title={i18n.orders.cancelOrder} size="md">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-ink-muted leading-relaxed">
            {i18n.orders.cancelOrderPrompt}
          </p>

          {cancel.isError && (
            <p className="text-xs text-danger">{errorMessage(cancel.error)}</p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-line/50">
            <Button variant="ghost" size="sm" onClick={closeModal}>
              {i18n.common.back}
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={cancel.isPending}
              onClick={() => cancel.mutate(subOrder.id, { onSuccess: closeModal })}
            >
              Confirmar Cancelación
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
      <Button
        variant="primary"
        size="sm"
        className="text-xs font-semibold"
        onClick={() => setOpen(true)}
      >
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
        {i18n.orders.confirmDelivery}
      </Button>

      <Modal isOpen={open} onClose={close} title={i18n.orders.confirmDelivery} size="md">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-ink-muted leading-relaxed">
            {i18n.orders.confirmDeliveryPrompt} Al confirmar, los fondos en custodia serán liberados al comercio vendedor.
          </p>

          {confirm.isError && (
            <p className="text-xs text-danger">{errorMessage(confirm.error)}</p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-line/50">
            <Button variant="ghost" size="sm" onClick={close}>
              {i18n.common.back}
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={confirm.isPending}
              onClick={() => confirm.mutate(subOrder.id, { onSuccess: close })}
            >
              Confirmar Recepción Conforme
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
      <Button
        variant="secondary"
        size="sm"
        className="text-xs font-semibold"
        onClick={() => setOpen(true)}
      >
        <Scale className="h-3.5 w-3.5 mr-1 text-warning" />
        {i18n.orders.claimOrder}
      </Button>

      <Modal isOpen={open} onClose={close} title={i18n.claims.openTitle} size="md">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Textarea
            label={i18n.claims.reasonPrompt}
            rows={4}
            required
            minLength={10}
            placeholder="Explica qué ocurrió con tu producto o entrega para que el mediador evalúe tu caso..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {claim.isError && (
            <p className="text-xs text-danger">{errorMessage(claim.error)}</p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-line/50">
            <Button type="button" variant="ghost" size="sm" onClick={close}>
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
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-brand hover:text-brand-hover px-2"
        onClick={() => setOpen(true)}
      >
        <Star className="h-3.5 w-3.5 mr-1 text-sun fill-current" />
        {i18n.orders.reviewProduct}
      </Button>

      <Modal isOpen={open} onClose={close} title={`${i18n.reviews.writeTitle}: ${item.name}`} size="md">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 text-xs font-medium text-ink">
            <span>{i18n.reviews.starsPrompt}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} estrellas`}
                  onClick={() => setStars(n)}
                  className="p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      n <= stars ? 'text-sun fill-current' : 'text-line fill-transparent'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label={i18n.reviews.commentPrompt}
            rows={3}
            maxLength={500}
            placeholder="Comparte tu experiencia con este producto..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {review.isError && (
            <p className="text-xs text-danger">{errorMessage(review.error)}</p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-line/50">
            <Button type="button" variant="ghost" size="sm" onClick={close}>
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

function SubOrderActions({ subOrder }: { subOrder: SubOrder }) {
  const canClaim = ['ENTREGADO', 'EN_TRANSITO', 'EN_REPARTO'].includes(subOrder.status);

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      {subOrder.status === 'PAGADO' && <CancelSubOrder subOrder={subOrder} />}
      {canClaim && (
        <>
          {subOrder.status === 'ENTREGADO' && <ConfirmDelivery subOrder={subOrder} />}
          <ClaimButton subOrder={subOrder} />
        </>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: MyOrder }) {
  return (
    <Card padding="lg" className="flex flex-col gap-5 ">
      {/* Cabecera del Pedido Principal */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 border border-line text-brand">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-ink">
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-xs text-ink-muted">
              {formatDate(order.createdAt)}
            </span>
          </div>
        </div>

        <StatusBadge status={order.status} category="order" />
      </header>

      {/* Sub-pedidos por vendedor */}
      <div className="flex flex-col gap-4">
        {order.subOrders.map((sub) => (
          <div key={sub.id} className="flex flex-col gap-3 rounded-xl border border-line/60 bg-surface-2/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-brand" />
                <span className="text-xs text-ink-muted">{i18n.cart.sellerGroup}</span>
                <span className="text-xs font-medium text-ink">{sub.seller.storeName}</span>
              </div>
              <StatusBadge status={sub.status} category="order" size="sm" />
            </div>

            {/* Lista de productos del sub-pedido */}
            <ul className="flex flex-col divide-y divide-line/30 text-xs">
              {sub.items.map((item) => (
                <li key={item.id} className="py-2.5 first:pt-1 last:pb-1 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface border border-line text-ink-muted">
                      <Package className="h-5 w-5 text-brand" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-ink font-semibold">{item.name}</span>
                      <span className="text-ink-muted">Cantidad: {item.quantity}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-medium text-ink tabular">
                      {formatMoney(item.unitPrice * item.quantity)}
                    </span>
                    {sub.status === 'ENTREGADO' && <ReviewButton item={item} />}
                  </div>
                </li>
              ))}
            </ul>

            {/* Acciones contextuales del sub-pedido */}
            <SubOrderActions subOrder={sub} />
          </div>
        ))}
      </div>

      {/* Bitácora de Trazabilidad */}
      <OrderTimeline orderId={order.id} />

      {/* Pie de Pedido: Dirección y Total */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60 text-xs">
        <div className="flex items-center gap-2 text-ink-muted">
          <MapPin className="h-4 w-4 shrink-0 text-brand" />
          <span>
            {order.address.label} · {order.address.line1}, {order.address.city}, {order.address.province}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-ink-muted font-medium">{i18n.cart.total}:</span>
          <span className="text-lg font-semibold text-brand tabular">
            {formatMoney(orderTotal(order))}
          </span>
        </div>
      </footer>
    </Card>
  );
}

export default function OrdersPage() {
  const { data, isLoading, isError, error, refetch } = useOrders();
  const needsLogin = error instanceof ApiError && error.status === 401;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader
        title={i18n.orders.title}
        description="Consulta el estado de tus compras, códigos de seguimiento y confirma la recepción de pedidos."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Mis Pedidos' },
        ]}
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" className="h-44 w-full" />
          <Skeleton variant="block" className="h-44 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title={needsLogin ? 'Inicio de sesión requerido' : 'Error al cargar pedidos'}
          description={
            needsLogin
              ? 'Debes iniciar sesión con tu cuenta para ver tus pedidos y compras protegidas.'
              : 'Ocurrió un error al obtener la lista de pedidos.'
          }
          actionLabel={needsLogin ? i18n.nav.login : i18n.common.retry}
          onAction={needsLogin ? () => (window.location.href = '/login') : () => refetch()}
        />
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title={i18n.orders.empty}
          description="Aún no has realizado ninguna compra en Tienda Virtual Segura."
          actionLabel={i18n.cart.startShopping}
          onAction={() => (window.location.href = '/catalogo')}
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="flex flex-col gap-6">
          {data.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
