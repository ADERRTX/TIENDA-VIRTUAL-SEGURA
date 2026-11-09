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
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/PageHeader';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';
import { Search, Store, Tag, X, Image as ImageIcon } from 'lucide-react';

const emptyFilters: ProductFilters = { q: '', categoryId: '', inStock: false };

function minPrice(product: Product): number | null {
  if (product.variants.length === 0) return null;
  return Math.min(...product.variants.map((variant) => variant.price));
}

function ProductCard({ product }: { product: Product }) {
  const price = minPrice(product);
  const image = mainImage(product);
  const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);

  return (
    <Link
      to={`/catalogo/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {/* Imagen del Producto */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-2">
        {image ? (
          <img
            src={imageUrl(image.fileName)}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-ink-muted">
            <ImageIcon className="h-8 w-8 opacity-40" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}

        {/* Badge flotante de categoría */}
        <div className="absolute top-2.5 left-2.5">
          <span className="rounded-md bg-surface/90 backdrop-blur-xs px-2 py-0.5 text-[11px] font-semibold text-ink border border-line/50">
            {product.category.name}
          </span>
        </div>

        {/* Badge de stock si está agotado */}
        {totalStock === 0 && (
          <div className="absolute top-2.5 right-2.5">
            <Badge variant="danger" size="sm">Agotado</Badge>
          </div>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="flex flex-1 flex-col p-4 gap-2">
        {/* Vendedor verificado */}
        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
          <Store className="h-3.5 w-3.5 text-brand shrink-0" />
          <span className="truncate">{product.seller.storeName}</span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-ink group-hover:text-brand transition-colors line-clamp-1 text-sm sm:text-base">
          {product.title}
        </h3>

        {/* Descripción corta */}
        <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Precio y pie de tarjeta */}
        <div className="mt-auto pt-3 border-t border-line/40 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-ink-muted tracking-wider">
              Precio desde
            </span>
            <span className="text-base font-bold text-brand tabular">
              {price === null ? 'Sin precio' : formatMoney(price)}
            </span>
          </div>

          <span className="text-xs font-semibold text-ink-muted group-hover:text-ink transition-colors flex items-center gap-1">
            Ver detalle →
          </span>
        </div>
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
    <div className="flex flex-col gap-8">
      {/* Encabezado */}
      <PageHeader
        title={i18n.nav.catalog}
        description="Explora productos garantizados por comercios verificados con custodia segura de fondos."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Catálogo de Productos' },
        ]}
      />

      {/* Barra de Filtros y Búsqueda */}
      <Card padding="md" className="flex flex-col gap-4">
        <form
          className="flex flex-wrap items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: search.trim() });
          }}
        >
          {/* Campo de búsqueda con icono */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              type="text"
              placeholder={i18n.nav.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-3 rounded-lg border border-line bg-surface-2 text-sm text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
            />
          </div>

          {/* Selector de categoría */}
          <select
            value={filters.categoryId}
            onChange={(e) => update({ categoryId: e.target.value })}
            className="h-11 px-3.5 rounded-lg border border-line bg-surface-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all min-w-[180px]"
          >
            <option value="">Todas las categorías</option>
            {categories.data?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Checkbox de stock */}
          <label className="flex items-center gap-2 text-xs font-medium text-ink px-3 py-2.5 rounded-lg border border-line/60 bg-surface-2/60 cursor-pointer hover:bg-surface-2 transition-colors select-none">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => update({ inStock: e.target.checked })}
              className="h-4 w-4 rounded border-line bg-surface-2 text-brand focus:ring-brand focus:ring-offset-bg"
            />
            <span>Solo con stock</span>
          </label>

          {/* Botones de acción */}
          <Button type="submit" size="md" className="font-semibold px-5">
            Buscar
          </Button>

          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => {
                setFilters(emptyFilters);
                setSearch('');
                setPage(1);
              }}
              className="text-xs text-ink-muted hover:text-ink gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </Button>
          )}
        </form>
      </Card>

      {/* Estados de Carga (Skeletons Shimmer) */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
              <Skeleton variant="block" className="aspect-[4/3] w-full" />
              <Skeleton variant="line" className="w-1/3" />
              <Skeleton variant="line" className="w-4/5" />
              <Skeleton variant="line" className="w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Estado de Error */}
      {isError && (
        <ErrorState
          title="No pudimos cargar los productos"
          description="Ocurrió un error al consultar el catálogo. Revisa tu conexión o reintenta."
          onRetry={() => refetch()}
        />
      )}

      {/* Estado Vacío */}
      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={<Tag className="h-6 w-6" />}
          title="No se encontraron productos"
          description={
            hasFilters
              ? 'No hay productos publicados que coincidan con los filtros seleccionados.'
              : 'Aún no se han registrado productos en el catálogo comercial.'
          }
          actionLabel={hasFilters ? 'Limpiar filtros' : undefined}
          onAction={
            hasFilters
              ? () => {
                  setFilters(emptyFilters);
                  setSearch('');
                  setPage(1);
                }
              : undefined
          }
        />
      )}

      {/* Cuadrícula de Productos */}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Paginación */}
          {meta && lastPage > 1 && (
            <div className="pt-4 border-t border-line/40">
              <Pagination
                page={page}
                totalPages={lastPage}
                totalItems={meta.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
