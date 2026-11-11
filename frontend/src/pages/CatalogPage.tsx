import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useProductSearch,
  type ProductFilters,
} from '../api/products';
import { useCategories } from '../api/sellerProducts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { PageHeader } from '../components/ui/PageHeader';
import { ProductCard } from '../components/ProductCard';
import { i18n } from '../i18n/es';
import { Search, Tag, X, Check } from 'lucide-react';

const emptyFilters: ProductFilters = { q: '', categoryId: '', inStock: false };

export default function CatalogPage() {
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('categoria') || '';

  const [filters, setFilters] = useState<ProductFilters>({
    q: '',
    categoryId: urlCategory,
    inStock: false,
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const categories = useCategories();
  const { data, isLoading, isError, refetch } = useProductSearch(filters, page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;
  const hasFilters = filters.q !== '' || filters.categoryId !== '' || filters.inStock;

  // Sincronizar parámetro de categoría si cambia desde la URL
  useEffect(() => {
    if (urlCategory && urlCategory !== filters.categoryId) {
      setFilters((prev) => ({ ...prev, categoryId: urlCategory }));
      setPage(1);
    }
  }, [urlCategory]);

  const update = (patch: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setSearch('');
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* 1. Cabecera con PageHeader y título font-display */}
      <PageHeader
        title={i18n.nav.catalog}
        titleClassName="font-display"
        description="Explora productos garantizados por comercios verificados con custodia segura de fondos."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Catálogo de Productos' },
        ]}
      />

      {/* 2. Barra de herramientas móvil (buscador en píldora y chips horizontales) */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Buscador móvil en píldora */}
        <form
          className="relative w-full"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: search.trim() });
          }}
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            placeholder={i18n.nav.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] rounded-full bg-surface border border-line pl-9 pr-20 text-xs sm:text-sm text-ink placeholder-ink-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors shadow-sm"
          />
          <Button
            type="submit"
            size="sm"
            variant="primary"
            className="absolute right-1 top-1 bottom-1 rounded-full px-3 text-xs"
          >
            Buscar
          </Button>
        </form>

        {/* Chips de filtro horizontales con scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs select-none scrollbar-none">
          <button
            type="button"
            onClick={() => update({ categoryId: '' })}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border ${
              filters.categoryId === ''
                ? 'bg-mint text-brand border-brand/30 font-semibold'
                : 'bg-surface text-ink-muted border-line hover:text-ink'
            }`}
          >
            Todas las categorías
          </button>

          {categories.data?.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => update({ categoryId: cat.id })}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border ${
                filters.categoryId === cat.id
                  ? 'bg-mint text-brand border-brand/30 font-semibold'
                  : 'bg-surface text-ink-muted border-line hover:text-ink'
              }`}
            >
              {cat.name}
            </button>
          ))}

          {/* Chip toggle "Solo con stock" */}
          <button
            type="button"
            onClick={() => update({ inStock: !filters.inStock })}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
              filters.inStock
                ? 'bg-mint text-brand border-brand/30 font-semibold'
                : 'bg-surface text-ink-muted border-line hover:text-ink'
            }`}
          >
            {filters.inStock && <Check className="h-3.5 w-3.5 text-brand" aria-hidden="true" />}
            <span>Solo con stock</span>
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-full font-medium whitespace-nowrap text-danger hover:bg-danger/8 transition-colors border border-danger/30 flex items-center gap-1"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Disposición Principal: Barra lateral de 240 px en escritorio + Rejilla */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Barra lateral de filtros (240px en escritorio) */}
        <aside className="w-60 shrink-0 hidden md:flex flex-col gap-5 sticky top-20">
          <Card padding="md" className="flex flex-col gap-5 w-full">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                Filtros
              </span>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-danger hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Buscador en píldora */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                update({ q: search.trim() });
              }}
              className="flex flex-col gap-2"
            >
              <label htmlFor="desktop-search" className="text-xs font-semibold text-ink-muted">
                Palabra clave
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted pointer-events-none" aria-hidden="true" />
                <input
                  id="desktop-search"
                  type="text"
                  placeholder={i18n.nav.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full bg-surface-2 border border-line pl-8 pr-3 py-2 text-xs text-ink placeholder-ink-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors"
                />
              </div>
              <Button type="submit" size="sm" variant="secondary" className="w-full text-xs font-medium mt-1">
                Buscar
              </Button>
            </form>

            {/* Filtro de Categorías */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-ink-muted">Categoría</span>
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => update({ categoryId: '' })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filters.categoryId === ''
                      ? 'bg-mint text-brand font-semibold'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                  }`}
                >
                  Todas las categorías
                </button>
                {categories.data?.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => update({ categoryId: cat.id })}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filters.categoryId === cat.id
                        ? 'bg-mint text-brand font-semibold'
                        : 'text-ink-muted hover:text-ink hover:bg-surface-2'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Interruptor "Solo con stock" */}
            <div className="border-t border-line pt-4">
              <label className="flex items-center gap-2.5 text-xs font-medium text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => update({ inStock: e.target.checked })}
                  className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                />
                <span>Solo con stock</span>
              </label>
            </div>
          </Card>
        </aside>

        {/* Contenido Principal: Rejilla de productos (2 / 3 / 4 columnas) */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* Estados de Carga (Skeletons con la forma de la tarjeta) */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm">
                  <Skeleton variant="block" className="aspect-[4/3] w-full" />
                  <Skeleton variant="line" className="w-1/3" />
                  <Skeleton variant="line" className="w-4/5" />
                  <Skeleton variant="line" className="w-1/2" />
                  <Skeleton variant="line" className="h-9 w-full mt-2" />
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
              icon={<Tag className="h-8 w-8 text-brand" aria-hidden="true" />}
              title="No se encontraron productos"
              description={
                hasFilters
                  ? 'No hay productos publicados que coincidan con los filtros seleccionados.'
                  : 'Aún no se han registrado productos en el catálogo comercial.'
              }
              actionLabel={hasFilters ? 'Limpiar filtros' : undefined}
              onAction={hasFilters ? clearFilters : undefined}
            />
          )}

          {/* Rejilla de 2 / 3 / 4 columnas con ProductCard */}
          {!isLoading && !isError && data && data.items.length > 0 && (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {data.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Paginación */}
              {meta && lastPage > 1 && (
                <div className="pt-4 border-t border-line">
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
      </div>
    </div>
  );
}
