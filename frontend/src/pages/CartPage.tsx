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
      <div className="flex flex-col gap-4 max-w-4xl">
        <Skeleton variant="block" className="h-10 w-48" />
        <Skeleton variant="block" className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-8 w-8" />}
        title="Inicia sesión para gestionar tu carrito"
        description="Para guardar artículos y disfrutar de compras con custodia segura, inicia sesión con tu cuenta."
        actionLabel={i18n.nav.login}
        onAction={() => navigate('/login')}
      />
    );
  }

  const hasItems = cart && cart.groups.length > 0;

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Encabezado */}
      <PageHeader
        title={i18n.cart.title}
        description="Revisa los productos seleccionados antes de proceder a la custodia y pago."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Catálogo', to: '/catalogo' },
          { label: 'Carrito de Compras' },
        ]}
      />

      {/* Estados de Carga */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" className="h-32 w-full" />
          <Skeleton variant="block" className="h-32 w-full" />
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
          icon={<ShoppingCart className="h-8 w-8" />}
          title={i18n.cart.empty}
          description="No tienes productos en tu carrito de compras actualmente."
          actionLabel={i18n.cart.startShopping}
          onAction={() => navigate('/catalogo')}
        />
      )}

      {/* Advertencias de stock o precio */}
      {cart && cart.warnings.length > 0 && (
        <div className="rounded-xl border border-warning/40 bg-warning-soft p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-warning uppercase tracking-wider">
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

      {/* Contenido del Carrito (Layout 2 columnas en desktop) */}
      {!isLoading && !isError && hasItems && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Lista de Grupos por Vendedor (2 columnas) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {cart.groups.map((group) => (
              <Card key={group.sellerId} padding="md" className="flex flex-col gap-4">
                {/* Cabecera del vendedor */}
                <div className="flex items-center justify-between pb-3 border-b border-line/60">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-brand" />
                    <span className="text-xs text-ink-muted">{i18n.cart.sellerGroup}</span>
                    <span className="text-sm font-bold text-ink">{group.storeName}</span>
                  </div>
                  <span className="text-xs text-ink-muted font-medium">
                    Sub-pedido independiente
                  </span>
                </div>

                {/* Items del vendedor */}
                <div className="flex flex-col divide-y divide-line/40">
                  {group.items.map((item) => (
                    <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Imagen */}
                      <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-line bg-surface-2">
                        {item.image ? (
                          <img
                            src={imageUrl(item.image)}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-ink-muted">
                            Sin foto
                          </div>
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
                      <div className="flex items-center gap-1.5 border border-line rounded-lg p-0.5 bg-surface-2">
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          disabled={busy || item.quantity <= 1}
                          onClick={() =>
                            updateItem.mutate({ variantId: item.variantId, quantity: item.quantity - 1 })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface text-ink-muted hover:text-ink disabled:opacity-30 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold tabular text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          disabled={busy || item.quantity >= item.stock}
                          onClick={() =>
                            updateItem.mutate({ variantId: item.variantId, quantity: item.quantity + 1 })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface text-ink-muted hover:text-ink disabled:opacity-30 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Total por línea */}
                      <span className="text-sm font-bold text-ink tabular min-w-[80px] text-right">
                        {formatMoney(item.total)}
                      </span>

                      {/* Botón eliminar */}
                      <button
                        type="button"
                        aria-label="Eliminar producto"
                        disabled={busy}
                        onClick={() => removeItem.mutate(item.variantId)}
                        className="p-1.5 rounded-lg text-ink-muted hover:text-danger hover:bg-danger-soft transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Subtotal del grupo */}
                <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                  <span className="text-ink-muted">{i18n.cart.subtotal} del comercio:</span>
                  <span className="font-bold text-ink tabular text-sm">
                    {formatMoney(group.subtotal)}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Resumen de Compra (Columna lateral sticky) */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-4">
            <Card padding="lg" className="flex flex-col gap-4 shadow-xl">
              <h2 className="text-base font-bold text-ink border-b border-line/60 pb-3">
                Resumen de la Orden
              </h2>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between text-ink-muted">
                  <span>Comercios participantes:</span>
                  <span className="font-semibold text-ink">{cart.groups.length}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Total de artículos:</span>
                  <span className="font-semibold text-ink">{cart.totalItems}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Costo de custodia (Escrow):</span>
                  <span className="text-brand font-semibold">Gratis</span>
                </div>
              </div>

              <div className="pt-3 border-t border-line flex items-baseline justify-between">
                <span className="text-sm font-bold text-ink">{i18n.cart.total}:</span>
                <span className="text-2xl font-black text-brand tabular">
                  {formatMoney(cart.total)}
                </span>
              </div>

              {/* Botón de Checkout */}
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/checkout')}
                className="w-full font-bold gap-2 mt-2 shadow-lg shadow-brand/10"
              >
                <span>{i18n.cart.checkout}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              {/* Garantía de custodia */}
              <div className="flex items-start gap-2 pt-2 text-[11px] text-ink-muted leading-relaxed">
                <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <span>
                  Tu compra está protegida por custodia bancaria simulada. El vendedor solo cobra tras tu confirmación.
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
