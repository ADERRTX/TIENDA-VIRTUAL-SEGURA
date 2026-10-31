import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  imageUrl,
  mainImage,
  useProductSearch,
  type Product,
  type ProductFilters,
} from '../api/products';
import { useCategories } from '../api/sellerProducts';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';

const inputClass =
  'min-h-[44px] rounded-xl border border-line bg-bg px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
const emptyFilters: ProductFilters = { q: '', categoryId: '', inStock: false };

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
  const [filters, setFilters] = useState<ProductFilters>(emptyFilters);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const categories = useCategories();
  const { data, isLoading, isError, refetch } = useProductSearch(filters, page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;
  const hasFilters = filters.q !== '' || filters.categoryId !== '' || filters.inStock;

  const update = (patch: Partial<ProductFilters>) => {
    setFilters({ ...filters, ...patch });
    setPage(1);
  };

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{i18n.nav.catalog}</h1>

      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: search.trim() });
        }}
      >
        <input
          className={`${inputClass} min-w-[200px] flex-1`}
          placeholder={i18n.nav.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={inputClass}
          value={filters.categoryId}
          onChange={(e) => update({ categoryId: e.target.value })}
        >
          <option value="">Todas las categorías</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => update({ inStock: e.target.checked })}
          />
          Solo con stock
        </label>
        <Button type="submit" size="sm">
          Buscar
        </Button>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilters(emptyFilters);
              setSearch('');
              setPage(1);
            }}
          >
            Limpiar
          </Button>
        )}
      </form>

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

      {data && data.items.length === 0 && (
        <p className="text-ink-muted">
          {hasFilters ? 'No hay productos con esos filtros.' : 'Aún no hay productos publicados.'}
        </p>
      )}

      {data && data.items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

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