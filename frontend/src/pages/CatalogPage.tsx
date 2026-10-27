import { Link } from 'react-router-dom';
import { imageUrl, mainImage, useProducts, type Product } from '../api/products';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';

function minPrice(product: Product): number | null {
  if (product.variants.length === 0) return null;
  return Math.min(...product.variants.map((variant) => variant.price));
}

function ProductCard({ product }: { product: Product }) {
  const price = minPrice(product);
  const image = mainImage(product);

  return (
    <Link
      to={`/catalogo/${product.id}`}
      className="flex flex-col gap-2 overflow-hidden rounded-2xl border border-line bg-surface-2 transition hover:border-brand"
    >
      {image ? (
        <img
          src={imageUrl(image.fileName)}
          alt={product.title}
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-surface text-sm text-ink-muted">
          Sin imagen
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-ink-muted">{product.category.name}</p>
        <h2 className="font-bold">{product.title}</h2>
        <p className="text-sm text-ink-muted line-clamp-2">{product.description}</p>
        <p className="mt-auto font-bold text-brand">
          {price === null ? 'Sin precio' : formatMoney(price)}
        </p>
        <p className="text-xs text-ink-muted">{product.seller.storeName}</p>
      </div>
    </Link>
  );
}

export default function CatalogPage() {
  const { data, isLoading, isError, refetch } = useProducts();

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{i18n.nav.catalog}</h1>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{i18n.common.error}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}

      {data && data.length === 0 && (
        <p className="text-ink-muted">Aún no hay productos publicados.</p>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}