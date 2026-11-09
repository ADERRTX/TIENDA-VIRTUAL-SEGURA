import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMe } from '../api/auth';
import { useAddToCart } from '../api/cart';
import { imageUrl, mainImage, useProduct } from '../api/products';
import ReviewsSection from '../components/ReviewsSection';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';
import {
  ArrowLeft,
  ShieldCheck,
  Store,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Image as ImageIcon,
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useMe();
  const addToCart = useAddToCart();
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const notFound = isError && (error as { status?: number } | null)?.status === 404;
  const image = product ? mainImage(product) : undefined;

  function handleAdd(variantId: string) {
    setFeedback(null);
    setSelectedVariantId(variantId);
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart.mutate(
      { variantId, quantity: 1 },
      {
        onSuccess: () => setFeedback({ ok: true, text: 'Producto agregado a tu carrito exitosamente.' }),
        onError: (err) =>
          setFeedback({
            ok: false,
            text: err instanceof ApiError ? err.message : i18n.common.error,
          }),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Enlace de regreso */}
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-brand transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Volver al Catálogo</span>
      </Link>

      {/* Estado de Carga */}
      {isLoading && (
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton variant="block" className="aspect-[4/3] w-full" />
          <div className="flex flex-col gap-4">
            <Skeleton variant="line" className="w-1/4" />
            <Skeleton variant="line" className="w-3/4 h-8" />
            <Skeleton variant="line" className="w-full h-20" />
            <Skeleton variant="block" className="h-32 w-full" />
          </div>
        </div>
      )}

      {/* Producto no encontrado */}
      {notFound && (
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Producto no disponible"
          description="Este producto no existe o ha sido retirado de la plataforma."
          actionLabel="Explorar otros productos"
          onAction={() => navigate('/catalogo')}
        />
      )}

      {/* Error de red / backend */}
      {isError && !notFound && (
        <ErrorState
          title="Error al cargar el producto"
          description="No se pudo obtener el detalle del producto. Inténtalo nuevamente."
          onRetry={() => refetch()}
        />
      )}

      {/* Detalle del Producto */}
      {product && (
        <div className="flex flex-col gap-10">
          <div className="grid gap-8 md:grid-cols-2 items-start">
            {/* Imagen Principal */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-lg">
              {image ? (
                <img
                  src={imageUrl(image.fileName)}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-muted">
                  <ImageIcon className="h-12 w-12 opacity-30" />
                  <span className="text-xs">Sin imagen principal</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="rounded-lg bg-surface/90 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold text-ink border border-line/60">
                  {product.category.name}
                </span>
              </div>
            </div>

            {/* Información y Compra */}
            <div className="flex flex-col gap-5">
              {/* Tienda vendedora */}
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <Store className="h-4 w-4 text-brand" />
                <span>Vendido y despachado por</span>
                <span className="font-semibold text-ink">{product.seller.storeName}</span>
                <Badge variant="brand" size="sm">Verificado</Badge>
              </div>

              {/* Título */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                {product.title}
              </h1>

              {/* Descripción */}
              <p className="text-sm text-ink-muted leading-relaxed">
                {product.description}
              </p>

              {/* Variantes y Selección */}
              <div className="flex flex-col gap-3 pt-2">
                <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
                  Variantes y Precios
                </h2>

                {product.variants.length === 0 && (
                  <p className="text-xs text-ink-muted">No hay variantes disponibles para este producto.</p>
                )}

                <div className="flex flex-col gap-2.5">
                  {product.variants.map((variant) => {
                    const isAddingThis = addToCart.isPending && selectedVariantId === variant.id;
                    const inStock = variant.stock > 0;

                    return (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3.5 transition-all hover:border-line-soft"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-ink">{variant.name}</span>
                          <span className={`text-xs ${inStock ? 'text-ink-muted' : 'text-danger'}`}>
                            {inStock ? `${variant.stock} unidades disponibles` : 'Sin stock'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-base font-bold text-brand tabular">
                            {formatMoney(variant.price)}
                          </span>
                          <Button
                            size="sm"
                            disabled={!inStock || addToCart.isPending}
                            isLoading={isAddingThis}
                            onClick={() => handleAdd(variant.id)}
                            className="font-medium"
                          >
                            <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mensaje de retroalimentación tras añadir */}
                {feedback && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium ${
                      feedback.ok
                        ? 'bg-brand-soft text-brand border border-brand/30'
                        : 'bg-danger-soft text-danger border border-danger/30'
                    }`}
                  >
                    {feedback.ok ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{feedback.text}</span>
                    {feedback.ok && (
                      <Link to="/carrito" className="underline ml-auto font-bold text-brand hover:text-brand-hover">
                        Ver carrito →
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Tarjeta de Garantía de Custodia TVS */}
              <div className="rounded-xl border border-brand/30 bg-surface-2/60 p-4 flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-brand">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Protección Integral de Pago TVS (Custodia Escrow)</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Tu dinero queda bajo custodia hasta que confirmes la entrega conforme. En caso de incidentes o incumplimiento, puedes iniciar una mediación con garantía de reembolso.
                </p>
              </div>
            </div>
          </div>

          {/* Sección de Opiniones y Reseñas (Ubicada debajo a todo lo ancho) */}
          <ReviewsSection productId={product.id} />
        </div>
      )}
    </div>
  );
}
