import { Link, useNavigate } from 'react-router-dom';
import { useMe } from '../api/auth';
import { useCart, useRemoveCartItem, useUpdateCartItem } from '../api/cart';
import { imageUrl } from '../api/products';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';
import {
  ShoppingCart,
  Trash2,
  Store,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Minus,
  Plus,
  Package,
} from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: loadingUser } = useMe();
  const { data: cart, isLoading, isError, refetch } = useCart(Boolean(user));
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const busy = updateItem.isPending || removeItem.isPending;

  if (loadingUser) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl mx-auto">
        <Skeleton variant="block" className="h-10 w-48" />
        <Skeleton variant="block" className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-8 w-8 text-brand" aria-hidden="true" />}
        title="Inicia sesión para gestionar tu carrito"
        description="Para guardar artículos y disfrutar de compras con custodia segura, inicia sesión con tu cuenta."
        actionLabel={i18n.nav.login}
        onAction={() => navigate('/login')}
      />
    );
  }

  const hasItems = cart && cart.groups.length > 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto">
      {/* Encabezado */}
      <PageHeader
        title={i18n.cart.title}
        titleClassName="font-display"
        description="Revisa los productos seleccionados antes de proceder a la custodia y pago."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Catálogo', to: '/catalogo' },
          { label: 'Carrito de Compras' },
        ]}
      />

      {/* Estados de Carga */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Skeleton variant="block" className="h-40 w-full" />
            <Skeleton variant="block" className="h-40 w-full" />
          </div>
          <Skeleton variant="block" className="h-64 w-full" />
        </div>
      )}

      {/* Error al cargar */}
      {isError && (
        <ErrorState
          title="Error al consultar tu carrito"
          description="No se pudieron sincronizar los artículos del carrito con el servidor."
          onRetry={() => refetch()}
        />
      )}

      {/* Carrito Vacío */}
      {!isLoading && !isError && !hasItems && (
        <EmptyState
          icon={<ShoppingCart className="h-8 w-8 text-brand" aria-hidden="true" />}
          title={i18n.cart.empty}
          description="No tienes productos en tu carrito de compras actualmente."
          actionLabel={i18n.cart.startShopping}
          onAction={() => navigate('/catalogo')}
        />
      )}

      {/* Avisos de precio o stock cambiado en aviso warning-soft */}
      {cart && cart.warnings.length > 0 && (
        <div
          role="status"
          className="rounded-xl border border-warning/30 bg-warning/8 p-4 flex items-start gap-3 shadow-sm"
        >
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-warning uppercase tracking-wider">
              {i18n.cart.warnings}
            </span>
            <ul className="text-xs text-ink-muted list-disc pl-4 space-y-0.5">
              {cart.warnings.map((warning, idx) => (
                <li key={idx}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Contenido del Carrito: Dos columnas en escritorio */}
      {!isLoading && !isError && hasItems && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Izquierda: Un grupo por vendedor dentro de una tarjeta blanca */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {cart.groups.map((group) => (
              <Card key={group.sellerId} padding="md" className="flex flex-col gap-4 shadow-sm">
                {/* Cabecera del vendedor */}
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint text-brand shrink-0">
                      <Store className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-ink-muted">{i18n.cart.sellerGroup}:</span>
                      <span className="text-sm font-semibold text-ink">{group.storeName}</span>
                    </div>
                  </div>
                  <span className="text-xs text-ink-muted font-medium bg-surface-2 px-2 py-0.5 rounded-full border border-line">
                    Sub-pedido
                  </span>
                </div>

                {/* Items del vendedor */}
                <div className="flex flex-col divide-y divide-line">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                    >
                      {/* Miniatura del producto */}
                      <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-line bg-surface-2 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={imageUrl(item.image)}
                            alt={`Fotografía de ${item.title}`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-ink-muted/50" aria-hidden="true" />
                        )}
                      </div>

                      {/* Info del producto */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/catalogo/${item.productId}`}
                          className="text-sm font-semibold text-ink hover:text-brand transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-ink-muted">{item.variantName}</p>
                        <p className="text-xs font-semibold text-brand tabular mt-1">
                          {formatMoney(item.price)} c/u
                        </p>
                      </div>

                      {/* Selector de cantidad */}
                      <div className="flex items-center gap-1 border border-line rounded-lg p-0.5 bg-surface-2 shadow-sm">
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          disabled={busy || item.quantity <= 1}
                          onClick={() =>
                            updateItem.mutate({
                              variantId: item.variantId,
                              quantity: item.quantity - 1,
                            })
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface text-ink-muted hover:text-ink disabled:opacity-30 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold tabular text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          disabled={busy || item.quantity >= item.stock}
                          onClick={() =>
                            updateItem.mutate({
                              variantId: item.variantId,
                              quantity: item.quantity + 1,
                            })
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface text-ink-muted hover:text-ink disabled:opacity-30 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Total por línea */}
                      <span className="text-sm font-semibold text-ink tabular min-w-[80px] text-right">
                        {formatMoney(item.total)}
                      </span>

                      {/* Botón eliminar */}
                      <button
                        type="button"
                        aria-label="Eliminar producto"
                        disabled={busy}
                        onClick={() => removeItem.mutate(item.variantId)}
                        className="p-2 rounded-lg text-ink-muted hover:text-danger hover:bg-danger/8 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subtotal del grupo */}
                <div className="pt-3 border-t border-line flex items-center justify-between text-xs">
                  <span className="text-ink-muted font-medium">Subtotal de {group.storeName}:</span>
                  <span className="font-semibold text-ink tabular text-sm">
                    {formatMoney(group.subtotal)}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Derecha: Tarjeta de resumen pegajosa (sticky) con subtotal por vendedor, total y botón primario */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-4">
            <Card padding="lg" className="flex flex-col gap-5 shadow-sm">
              <h2 className="text-base font-semibold text-ink border-b border-line pb-3">
                Resumen del Pedido
              </h2>

              {/* Subtotal por cada vendedor */}
              <div className="flex flex-col gap-2.5 border-b border-line pb-3">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  Subtotales por comercio
                </span>
                {cart.groups.map((group) => (
                  <div key={group.sellerId} className="flex justify-between items-center text-xs">
                    <span className="text-ink truncate max-w-[160px]">{group.storeName}</span>
                    <span className="font-semibold text-ink tabular">
                      {formatMoney(group.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Métricas y envío */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between text-ink-muted">
                  <span>Total de artículos:</span>
                  <span className="font-semibold text-ink tabular">{cart.totalItems}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Custodia de pago (Escrow):</span>
                  <span className="text-brand font-semibold">Gratis</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Costos de envío:</span>
                  <span className="text-brand font-semibold">Gratis</span>
                </div>
              </div>

              {/* Total definitivo */}
              <div className="pt-3 border-t border-line flex items-baseline justify-between">
                <span className="text-base font-semibold text-ink">{i18n.cart.total}:</span>
                <span className="text-2xl font-semibold text-brand tabular">
                  {formatMoney(cart.total)}
                </span>
              </div>

              {/* Botón primario: Continuar con el pedido */}
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/checkout')}
                className="w-full font-semibold gap-2 shadow-sm text-sm"
              >
                <span>{i18n.cart.checkout}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>

              {/* Explicación de custodia */}
              <div className="flex items-start gap-2.5 pt-2 text-xs text-ink-muted leading-relaxed">
                <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Tus fondos quedan retenidos bajo custodia TVS. El comercio solo cobra tras tu confirmación de entrega conforme.
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
