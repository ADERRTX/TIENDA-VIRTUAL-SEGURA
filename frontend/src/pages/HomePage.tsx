import { ArrowDown, ArrowRight, Check, Clock3, LockKeyhole, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useProductSearch, imageUrl, mainImage, type Product, type ProductFilters } from '../api/products';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatMoney } from '../lib/formatters';

const availableProducts: ProductFilters = { q: '', categoryId: '', inStock: true };

function startingPrice(product: Product): number | null {
  const prices = product.variants
    .filter((variant) => variant.stock > 0)
    .map((variant) => variant.price);

  return prices.length > 0 ? Math.min(...prices) : null;
}

function FeaturedProduct({ product }: { product: Product }) {
  const image = mainImage(product);
  const price = startingPrice(product);

  return (
    <Link
      to={`/catalogo/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-white/[0.055] hover:shadow-[0_16px_50px_rgba(20,184,166,0.12)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
        {image ? (
          <img
            src={imageUrl(image.fileName)}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            Imagen no disponible
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-slate-950/75 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-md">
          {product.category.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-ink-faint">{product.seller.storeName}</p>
        <h3 className="mt-2 line-clamp-1 text-base font-semibold text-white">{product.title}</h3>
        <div className="mt-5 flex items-end justify-between gap-3">
          <p className="font-semibold text-brand">
            {price === null ? 'Consultar precio' : formatMoney(price)}
            {price !== null && <span className="ml-1 text-xs font-normal text-ink-muted">desde</span>}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition group-hover:text-brand">
            Ver producto <ArrowRight size={15} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CustodyCard() {
  const steps = [
    { icon: LockKeyhole, title: 'Pago confirmado', detail: 'Pago de prueba validado por TVS.' },
    { icon: Clock3, title: 'Fondos en custodia', detail: 'El vendedor aún no recibe el dinero.' },
    { icon: PackageCheck, title: 'Pedido finalizado', detail: 'Se libera si no hay reclamos pendientes.' },
  ];

  return (
    <aside className="relative mx-auto w-full max-w-lg lg:ml-auto" aria-label="Cómo funciona la Compra Protegida TVS">
      <div className="absolute -inset-8 rounded-[3rem] bg-brand/10 blur-3xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/65 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-brand">
              <ShieldCheck size={25} aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-white">Compra Protegida TVS</p>
              <p className="mt-1 text-xs text-ink-muted">Custodia simulada de principio a fin</p>
            </div>
          </div>
          <span className="rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
            Demo académica
          </span>
        </div>

        <p className="mt-6 text-sm leading-6 text-slate-300">
          Tu pago queda retenido por la plataforma. El vendedor lo recibe cuando el pedido finaliza sin reclamos pendientes.
        </p>

        <ol className="mt-7 space-y-5">
          {steps.map(({ icon: Icon, title, detail }, index) => (
            <li key={title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${index === 1 ? 'border-brand/30 bg-brand/10 text-brand shadow-[0_0_20px_rgba(45,212,191,0.12)]' : 'border-white/10 bg-white/[0.04] text-slate-300'}`}>
                  <Icon size={17} aria-hidden="true" />
                </span>
                {index < steps.length - 1 && <span className="mt-1 h-5 w-px bg-white/10" aria-hidden="true" />}
              </div>
              <div className="pt-0.5">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs leading-5 text-ink-muted">{detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-7 flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3 text-xs leading-5 text-ink-muted">
          <Check size={15} className="shrink-0 text-brand" aria-hidden="true" />
          <span>Los pagos y envíos de esta plataforma son simulados.</span>
        </div>
      </div>
    </aside>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useProductSearch(availableProducts, 1);
  const products = data?.items.slice(0, 4) ?? [];

  return (
    <div className="space-y-20 pb-8 sm:space-y-28">
      <section className="relative isolate grid items-center gap-14 py-8 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
        <div className="absolute -left-28 top-0 -z-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" aria-hidden="true" />
        <div className="absolute -right-20 bottom-0 -z-10 h-64 w-64 rounded-full bg-teal-400/[0.08] blur-[90px]" aria-hidden="true" />
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/[0.07] px-3.5 py-2 text-xs font-medium text-brand">
            <Sparkles size={14} aria-hidden="true" />
            Compra con más tranquilidad
          </div>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Compra seguro.
            <span className="mt-1 block bg-gradient-to-r from-cyan-300 via-brand to-teal-200 bg-clip-text text-transparent">
              Recibe con confianza.
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            {i18n.app.name} conecta compradores y vendedores con un proceso transparente y pagos en custodia simulada.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => navigate('/catalogo')} className="gap-2">
              Explorar productos <ArrowRight size={17} aria-hidden="true" />
            </Button>
            <a href="#productos" className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-ink-muted transition hover:text-white">
              Ver destacados <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
          <p className="mt-5 text-xs text-ink-faint">Proyecto académico · Pagos y envíos simulados</p>
        </div>

        <CustodyCard />
      </section>

      <section id="productos" className="scroll-mt-28">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Catálogo TVS</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">Productos disponibles</h2>
            <p className="mt-2 text-sm text-ink-muted">Explora publicaciones activas de vendedores TVS.</p>
          </div>
          <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-teal-200">
            Ir al catálogo <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Cargando productos">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]">
                <div className="aspect-[4/3] animate-pulse bg-white/[0.05]" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.07]" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.07]" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/[0.07]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-sm text-ink-muted">{i18n.common.error}</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => void refetch()}>
              {i18n.common.retry}
            </Button>
          </div>
        )}

        {!isLoading && !isError && products.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => <FeaturedProduct key={product.id} product={product} />)}
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <p className="font-medium text-white">Pronto encontrarás nuevas publicaciones.</p>
            <p className="mt-2 text-sm text-ink-muted">Mientras tanto, puedes explorar todo el catálogo.</p>
            <Button size="sm" className="mt-5" onClick={() => navigate('/catalogo')}>Explorar catálogo</Button>
          </div>
        )}
      </section>
    </div>
  );
}
