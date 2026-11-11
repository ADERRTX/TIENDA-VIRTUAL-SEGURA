import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMe } from '../api/auth';
import { useAddToCart } from '../api/cart';
import { imageUrl, useProduct, useProductReviews } from '../api/products';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { Tabs } from '../components/ui/Tabs';
import { i18n } from '../i18n/es';
import { formatMoney, formatDate } from '../lib/formatters';
import { ApiError } from '../lib/http';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Store,
  Star,
  Minus,
  Plus,
  ShoppingBag,
  Package,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useMe();
  const addToCart = useAddToCart();
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const { data: reviewsData, isLoading: loadingReviews } = useProductReviews(id);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'descripcion' | 'reseñas'>('descripcion');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const notFound = isError && (error as { status?: number } | null)?.status === 404;
  const variants = product?.variants ?? [];
  const images = product?.images ?? [];

  // Inicializar variante seleccionada por defecto
  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      const withStock = variants.find((v) => v.stock > 0);
      setSelectedVariantId(withStock ? withStock.id : (variants[0]?.id ?? null));
    }
  }, [variants, selectedVariantId]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const activeImage = images[activeImageIndex] || images[0];

  function handleAddToCart() {
    if (!selectedVariant || !inStock) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setFeedback(null);
    addToCart.mutate(
      { variantId: selectedVariant.id, quantity },
      {
        onSuccess: () =>
          setFeedback({
            ok: true,
            text: `Se agregaron ${quantity} unidad(es) de ${selectedVariant.name} a tu carrito.`,
          }),
        onError: (err) =>
          setFeedback({
            ok: false,
            text: err instanceof ApiError ? err.message : i18n.common.error,
          }),
      },
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-16 md:pb-6">
      {/* Enlace de regreso */}
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-brand transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>Volver al Catálogo</span>
      </Link>

      {/* Estado de Carga */}
      {isLoading && (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          <div className="lg:col-span-6 flex gap-4">
            <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="block" className="h-16 w-16" />
              ))}
            </div>
            <Skeleton variant="block" className="aspect-[4/3] w-full flex-1" />
          </div>
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Skeleton variant="line" className="w-1/4" />
            <Skeleton variant="line" className="w-3/4 h-8" />
            <Skeleton variant="line" className="w-1/3 h-10" />
            <Skeleton variant="line" className="w-full h-24" />
            <Skeleton variant="block" className="h-36 w-full" />
          </div>
        </div>
      )}

      {/* Producto no encontrado */}
      {notFound && (
        <EmptyState
          icon={<AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />}
          title="Producto no disponible"
          description="Este producto no existe o ha sido retirado de la plataforma comercial."
          actionLabel="Explorar otros productos"
          onAction={() => navigate('/catalogo')}
        />
      )}

      {/* Error de red / backend */}
      {isError && !notFound && (
        <ErrorState
          title="Error al cargar el producto"
          description="No se pudo obtener el detalle del artículo. Por favor reintenta la consulta."
          onRetry={() => refetch()}
        />
      )}

      {/* Detalle del Producto */}
      {product && (
        <div className="flex flex-col gap-12">
          {/* Distribución de dos columnas en escritorio */}
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Columna Izquierda: Galería con miniaturas e imagen grande sobre recuadro blanco */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row gap-4">
              {/* Columna de miniaturas */}
              {images.length > 1 && (
                <div className="flex sm:flex-col gap-2.5 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto max-h-[460px] pb-1 sm:pb-0">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-16 w-16 rounded-xl overflow-hidden border bg-surface transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        activeImageIndex === idx
                          ? 'border-brand ring-2 ring-brand/30 shadow-sm'
                          : 'border-line hover:border-brand/40 opacity-80 hover:opacity-100'
                      }`}
                      aria-label={`Ver miniatura ${idx + 1}`}
                    >
                      <img
                        src={imageUrl(img.fileName)}
                        alt={`Miniatura ${idx + 1} de ${product.title}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Imagen grande sobre recuadro blanco */}
              <div className="flex-1 order-1 sm:order-2 rounded-2xl border border-line bg-surface p-2.5 shadow-sm">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-2 flex items-center justify-center">
                  {activeImage ? (
                    <img
                      src={imageUrl(activeImage.fileName)}
                      alt={`Fotografía principal de ${product.title}`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-ink-muted">
                      <Package size={48} strokeWidth={1.5} aria-hidden="true" />
                      <span className="text-xs">Sin imagen disponible</span>
                    </div>
                  )}

                  {/* Badge flotante de categoría */}
                  {product.category?.name && (
                    <div className="absolute top-3 left-3">
                      <span className="rounded-md bg-surface/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-ink border border-line">
                        {product.category.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Información, precio, chips de variante, cantidad y compra */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              {/* Categoría y Título font-display */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                  {product.category?.name || 'Comercio verificado'}
                </span>
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink tracking-tight leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Precio grande con tabular-nums */}
              <div className="flex items-baseline gap-3 pb-2 border-b border-line">
                <span className="text-3xl sm:text-4xl font-semibold text-ink tabular">
                  {selectedVariant ? formatMoney(selectedVariant.price) : 'Sin precio'}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    inStock
                      ? 'bg-success/8 text-success border border-success/30'
                      : 'bg-danger/8 text-danger border border-danger/30'
                  }`}
                >
                  {inStock ? `${selectedVariant?.stock} en stock` : 'Agotado'}
                </span>
              </div>

              {/* Selector de variantes como chips */}
              {variants.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    Selecciona una variante
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => {
                      const isSelected = selectedVariantId === v.id;
                      const hasVarStock = v.stock > 0;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          disabled={!hasVarStock}
                          onClick={() => {
                            setSelectedVariantId(v.id);
                            setQuantity(1);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                            isSelected
                              ? 'bg-mint text-brand border-brand/50 font-semibold shadow-sm'
                              : hasVarStock
                              ? 'bg-surface text-ink border-line hover:border-brand/30 hover:bg-surface-2'
                              : 'bg-surface-2 text-ink-muted/50 border-line/60 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <span>{v.name}</span>
                          <span className="tabular font-semibold text-ink-muted">
                            {formatMoney(v.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selector de cantidad con botones - y + */}
              {inStock && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    Cantidad
                  </span>
                  <div className="flex items-center rounded-lg border border-line bg-surface shadow-sm">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-l-lg text-ink-muted hover:bg-surface-2 hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <span className="w-12 text-center text-sm font-semibold text-ink tabular select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= (selectedVariant?.stock ?? 1)}
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(selectedVariant?.stock ?? 1, q + 1),
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-r-lg text-ink-muted hover:bg-surface-2 hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {/* Botón primario "Agregar al carrito" en escritorio */}
              <div className="hidden md:flex flex-col gap-2 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  disabled={!inStock || addToCart.isPending}
                  isLoading={addToCart.isPending}
                  onClick={handleAddToCart}
                  className="w-full text-base font-semibold gap-2 shadow-sm"
                >
                  <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                  <span>
                    {inStock
                      ? `Agregar al carrito — ${formatMoney(
                          (selectedVariant?.price ?? 0) * quantity,
                        )}`
                      : 'Sin stock disponible'}
                  </span>
                </Button>
              </div>

              {/* Aviso inline de retroalimentación tras agregar */}
              {feedback && (
                <div
                  role="status"
                  className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium border ${
                    feedback.ok
                      ? 'bg-brand-soft text-brand border-brand/30'
                      : 'bg-danger/8 text-danger border-danger/30'
                  }`}
                >
                  {feedback.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>{feedback.text}</span>
                  {feedback.ok && (
                    <Link
                      to="/carrito"
                      className="underline ml-auto font-semibold text-brand hover:text-brand-dark inline-flex items-center gap-1"
                    >
                      <span>Ver carrito</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              )}

              {/* Tarjeta .section-mint con la explicación de Compra Protegida */}
              <div className="section-mint !p-4 sm:!p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand">
                  <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{i18n.app.protectedPurchase}</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {i18n.app.protectedPurchaseDesc}
                </p>
              </div>

              {/* Bloque de la tienda vendedora */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-brand shrink-0 border border-mint-strong">
                    <Store className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-ink-muted">Vendido por</span>
                    <span className="text-sm font-semibold text-ink">
                      {product.seller.storeName}
                    </span>
                  </div>
                </div>
                <Badge variant="brand" size="sm">
                  Verificado
                </Badge>
              </div>
            </div>
          </div>

          {/* Componente Tabs: "Descripción" y "Reseñas" */}
          <div className="flex flex-col gap-6 pt-6 border-t border-line">
            <Tabs
              tabs={[
                { id: 'descripcion', label: 'Descripción del producto' },
                {
                  id: 'reseñas',
                  label: 'Opiniones y Reseñas',
                  count: reviewsData?.count ?? 0,
                },
              ]}
              activeTab={activeTab}
              onChange={(tabId) => setActiveTab(tabId as 'descripcion' | 'reseñas')}
              variant="pills"
            />

            {/* Contenido Pestaña 1: Descripción */}
            {activeTab === 'descripcion' && (
              <div className="rounded-xl border border-line bg-surface p-6 text-sm text-ink-muted leading-relaxed whitespace-pre-line shadow-sm">
                <h2 className="text-base font-semibold text-ink mb-3">
                  Detalles del artículo
                </h2>
                {product.description ||
                  'El vendedor no incluyó una descripción adicional para este producto.'}
              </div>
            )}

            {/* Contenido Pestaña 2: Reseñas con estrellas color sun */}
            {activeTab === 'reseñas' && (
              <div className="flex flex-col gap-6">
                {/* Resumen de Calificación Promedio Real */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border border-line bg-surface shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun-soft text-sun shrink-0 border border-sun/30">
                      <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-semibold text-ink tabular">
                          {reviewsData?.average !== null && reviewsData?.average !== undefined
                            ? Number(reviewsData.average).toFixed(1)
                            : '0.0'}
                        </span>
                        <span className="text-xs text-ink-muted">de 5 estrellas</span>
                      </div>
                      <span className="text-xs text-ink-muted">
                        Basado en {reviewsData?.count ?? 0}{' '}
                        {(reviewsData?.count ?? 0) === 1
                          ? 'opinión verificada'
                          : 'opiniones verificadas'}
                      </span>
                    </div>
                  </div>

                  {/* Estrellas visuales color sun */}
                  {reviewsData?.average !== null && reviewsData?.average !== undefined && (
                    <div className="flex items-center gap-1 text-sun" aria-label={`Calificación ${reviewsData.average} de 5`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(Number(reviewsData.average))
                              ? 'fill-current text-sun'
                              : 'text-line fill-transparent'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Lista de reseñas con inicial del autor en círculo */}
                {loadingReviews ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="rounded-xl border border-line bg-surface p-4 flex flex-col gap-2">
                        <Skeleton variant="line" className="w-1/4" />
                        <Skeleton variant="line" className="w-3/4" />
                        <Skeleton variant="line" className="w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : reviewsData && reviewsData.items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviewsData.items.map((review) => {
                      const authorName = review.user?.fullName || 'Comprador verificado';
                      const authorInitial = (authorName[0] || 'C').toUpperCase();

                      return (
                        <div
                          key={review.id}
                          className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {/* Círculo con inicial del autor */}
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-brand font-semibold text-xs border border-mint-strong shrink-0">
                                {authorInitial}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-ink">
                                  {authorName}
                                </span>
                                <span className="text-xs text-ink-muted">
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                            </div>

                            {/* Estrellas individuales */}
                            <div className="flex items-center gap-0.5 text-sun" aria-label={`${review.stars} estrellas`}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-3.5 w-3.5 ${
                                    s <= review.stars
                                      ? 'fill-current text-sun'
                                      : 'text-line fill-transparent'
                                  }`}
                                  aria-hidden="true"
                                />
                              ))}
                            </div>
                          </div>

                          {review.comment && (
                            <p className="text-xs text-ink-muted leading-relaxed pl-10">
                              "{review.comment}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-line bg-surface p-8 text-center text-ink-muted">
                    <MessageSquare className="h-8 w-8 text-ink-muted mx-auto mb-2 opacity-50" aria-hidden="true" />
                    <p className="text-sm font-medium">Este producto aún no tiene calificaciones registradas.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Móvil: Botón de agregar fijo en la parte inferior */}
          <div
            className={`fixed left-0 right-0 z-30 p-3 bg-surface/95 backdrop-blur-md border-t border-line shadow-lg md:hidden ${
              user ? 'bottom-16' : 'bottom-0'
            }`}
          >
            <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
              <div className="flex flex-col">
                <span className="text-xs text-ink-muted">Total a pagar:</span>
                <span className="text-lg font-semibold text-ink tabular">
                  {formatMoney((selectedVariant?.price ?? 0) * quantity)}
                </span>
              </div>
              <Button
                size="md"
                variant="primary"
                disabled={!inStock || addToCart.isPending}
                isLoading={addToCart.isPending}
                onClick={handleAddToCart}
                className="flex-1 font-semibold min-h-[44px]"
              >
                <ShoppingBag className="h-4 w-4 mr-1.5" aria-hidden="true" />
                <span>{inStock ? 'Agregar al carrito' : 'Agotado'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
