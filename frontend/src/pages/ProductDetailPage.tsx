import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMe } from '../api/auth';
import { useAddToCart } from '../api/cart';
import { imageUrl, mainImage, useProduct } from '../api/products';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';
import { ApiError } from '../lib/http';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useMe();
  const addToCart = useAddToCart();
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const notFound = isError && (error as { status?: number } | null)?.status === 404;
  const image = product ? mainImage(product) : undefined;

  function handleAdd(variantId: string) {
    setFeedback(null);
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart.mutate(
      { variantId, quantity: 1 },
      {
        onSuccess: () => setFeedback({ ok: true, text: 'Agregado al carrito.' }),
        onError: (err) =>
          setFeedback({
            ok: false,
            text: err instanceof ApiError ? err.message : i18n.common.error,
          }),
      },
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <Link to="/catalogo" className="text-sm text-ink-muted hover:text-brand">
        ← {i18n.nav.catalog}
      </Link>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="aspect-[4/3] animate-pulse rounded-2xl bg-surface-2" />
          <div className="h-48 animate-pulse rounded-2xl bg-surface-2" />
        </div>
      )}

      {notFound && (
        <p className="text-ink-muted">Este producto no existe o ya no está disponible.</p>
      )}

      {isError && !notFound && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{i18n.common.error}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}

      {product && (
        <div className="grid gap-6 md:grid-cols-2">
          {image ? (
            <img
              src={imageUrl(image.fileName)}
              alt={product.title}
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-surface-2 text-sm text-ink-muted">
              Sin imagen
            </div>
          )}

          <div className="flex flex-col gap-4">
            <p className="text-xs text-ink-muted">{product.category.name}</p>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <p className="text-ink-muted">{product.description}</p>
            <p className="text-sm text-ink-muted">Vendido por {product.seller.storeName}</p>

            <div className="flex flex-col gap-2">
              <h2 className="font-bold">Variantes</h2>
              {product.variants.length === 0 && (
                <p className="text-sm text-ink-muted">Sin variantes disponibles.</p>
              )}
              {product.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2 p-3"
                >
                  <div>
                    <p className="font-bold">{variant.name}</p>
                    <p className="text-xs text-ink-muted">
                      {variant.stock > 0 ? `${variant.stock} disponibles` : 'Agotado'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-brand">{formatMoney(variant.price)}</p>
                    <Button
                      size="sm"
                      disabled={variant.stock === 0 || addToCart.isPending}
                      onClick={() => handleAdd(variant.id)}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              ))}

              {feedback && (
                <p className={`text-sm ${feedback.ok ? 'text-brand' : 'text-red-500'}`}>
                  {feedback.text}{' '}
                  {feedback.ok && (
                    <Link to="/carrito" className="underline">
                      Ver carrito
                    </Link>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}