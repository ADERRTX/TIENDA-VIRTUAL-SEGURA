import { useNavigate, Link } from 'react-router-dom';
import { useProducts, imageUrl, mainImage } from '../api/products';
import { useCategories } from '../api/sellerProducts';
import { useMe } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { ProductCard } from '../components/ProductCard';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';
import {
  ShieldCheck,
  Truck,
  Scale,
  ArrowRight,
  Tag,
  Package,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const { data: products, isLoading: loadingProducts } = useProducts();
  const { data: categories } = useCategories();

  const heroProducts = products?.slice(0, 4) ?? [];
  const catalogProducts = products?.slice(0, 8) ?? [];

  return (
    <div className="flex flex-col gap-12 sm:gap-16 py-2 sm:py-6">
      {/* 1. HERO SECTION DENTRO DE .section-mint */}
      <section className="section-mint relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Lado izquierdo: Textos y botones */}
          <div className="lg:col-span-7 flex flex-col gap-5 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-surface/80 px-3 py-1 text-xs font-medium text-brand w-fit shadow-sm">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Custodia real en cada transacción</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink leading-[1.15]">
              {i18n.app.name} — {i18n.app.tagline}
            </h1>

            <p className="text-sm sm:text-base text-ink-muted max-w-xl leading-relaxed">
              Tu dinero se mantiene en custodia protegida hasta que recibes y verificas tu producto a satisfacción. Compra sin incertidumbre y vende con total respaldo.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/catalogo')}
                className="gap-2 font-semibold"
              >
                <span>Explorar catálogo</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate(user ? '/vender' : '/login')}
                className="gap-2 font-medium"
              >
                <span>Quiero vender</span>
              </Button>
            </div>
          </div>

          {/* Lado derecho: Mosaico de hasta 4 productos reales */}
          <div className="lg:col-span-5 w-full">
            {loadingProducts ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-surface p-3 border border-line shadow-sm flex flex-col gap-2">
                    <Skeleton variant="block" className="h-24 w-full" />
                    <Skeleton variant="line" className="h-4 w-3/4" />
                    <Skeleton variant="line" className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : heroProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {heroProducts.map((p) => {
                  const img = mainImage(p);
                  const price = p.variants?.[0]?.price ?? 0;
                  return (
                    <Link
                      key={p.id}
                      to={`/catalogo/${p.id}`}
                      className="group flex flex-col rounded-xl bg-surface p-3 border border-line shadow-sm hover:-translate-y-0.5 hover:border-brand-soft transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-surface-2 mb-2 relative">
                        {img ? (
                          <img
                            src={imageUrl(img.fileName)}
                            alt={`Producto ${p.title}`}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ink-muted/50">
                            <Package size={28} strokeWidth={1.5} aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-ink line-clamp-1 group-hover:text-brand transition-colors">
                        {p.title}
                      </span>
                      <span className="text-xs font-semibold text-brand tabular mt-1">
                        {formatMoney(price)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<Package className="h-8 w-8 text-brand" aria-hidden="true" />}
                title="Catálogo en preparación"
                description="Próximamente los vendedores publicarán artículos con custodia de pago activa."
                className="bg-surface/80"
              />
            )}
          </div>
        </div>
      </section>

      {/* 2. FRANJA DE CONFIANZA (3 TARJETAS EXACTAS CON ICONO EN MINT) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tarjeta 1 */}
        <Card padding="lg" className="flex flex-col gap-3">
          <div className="w-12 h-12 rounded-xl bg-mint text-brand flex items-center justify-center shrink-0 border border-mint-strong">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-ink">Compra protegida</h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            El dinero queda en custodia hasta que confirmas la recepción.
          </p>
        </Card>

        {/* Tarjeta 2 */}
        <Card padding="lg" className="flex flex-col gap-3">
          <div className="w-12 h-12 rounded-xl bg-mint text-brand flex items-center justify-center shrink-0 border border-mint-strong">
            <Truck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-ink">Seguimiento del envío</h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Línea de tiempo del pedido con control transparente de despacho y entrega.
          </p>
        </Card>

        {/* Tarjeta 3 */}
        <Card padding="lg" className="flex flex-col gap-3">
          <div className="w-12 h-12 rounded-xl bg-mint text-brand flex items-center justify-center shrink-0 border border-mint-strong">
            <Scale className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-ink">Reclamos y mediación</h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Puedes abrir un reclamo con evidencia si surge cualquier desacuerdo en la entrega.
          </p>
        </Card>
      </section>

      {/* 3. SECCIÓN CATEGORÍAS CON TÍTULO DISPLAY CENTRADO */}
      {categories && categories.length > 0 && (
        <section className="flex flex-col gap-6 text-center">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              Explora por categoría
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
              Encuentra artículos verificados con custodia y garantía directa de entrega
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogo?categoria=${cat.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-line text-xs sm:text-sm font-medium text-ink hover:border-brand/40 hover:bg-surface-2 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Tag className="h-3.5 w-3.5 text-brand shrink-0" aria-hidden="true" />
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. SECCIÓN PRODUCTOS DISPONIBLES */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink">
              Productos disponibles
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Artículos publicados listos para despacho inmediato
            </p>
          </div>

          <Link
            to="/catalogo"
            className="text-xs sm:text-sm font-semibold text-brand hover:text-brand-dark flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-surface p-4 border border-line shadow-sm flex flex-col gap-3">
                <Skeleton variant="block" className="aspect-[4/3] w-full" />
                <Skeleton variant="line" className="h-4 w-1/3" />
                <Skeleton variant="line" className="h-5 w-3/4" />
                <Skeleton variant="line" className="h-6 w-1/2" />
              </div>
            ))}
          </div>
        ) : catalogProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {catalogProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="h-10 w-10 text-brand" aria-hidden="true" />}
            title="Sin productos activos"
            description="En este momento no hay productos en venta en el catálogo."
            actionLabel="Ver catálogo"
            onAction={() => navigate('/catalogo')}
          />
        )}
      </section>

      {/* 5. BANDA .section-deep: "¿TIENES UN NEGOCIO? VENDE EN TVS" */}
      <section className="section-deep text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-10">
        <div className="flex flex-col gap-2 max-w-xl">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-brand-ink">
            ¿Tienes un negocio? Vende en TVS
          </h2>
          <p className="text-xs sm:text-sm text-deep-muted leading-relaxed">
            Publica tus productos, gestiona tus envíos con trazabilidad de transporte y cobra tus ventas con garantía de fondos en custodia.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate(user ? '/vender' : '/login')}
            className="bg-surface text-deep font-semibold hover:bg-surface-2 border-0 shadow-sm px-6"
          >
            Comenzar a vender
          </Button>
        </div>
      </section>
    </div>
  );
}
