import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useApplySeller, useMySeller } from '../api/sellers';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';
import {
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function SellerApplyPage() {
  const { data: seller, isLoading } = useMySeller(true);
  const apply = useApplySeller();
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = description.trim();
    apply.mutate({ storeName: storeName.trim(), ...(text ? { description: text } : {}) });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-xl mx-auto">
        <Skeleton variant="block" className="h-10 w-48" />
        <Skeleton variant="block" className="h-44 w-full" />
      </div>
    );
  }

  if (seller) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <PageHeader
          title="Solicitud de Comercio Vendedor"
          description="Estado actual de tu acreditación comercial en Tienda Virtual Segura."
          breadcrumbs={[
            { label: 'Inicio', to: '/' },
            { label: 'Vender en TVS' },
          ]}
        />

        <Card padding="lg" className="flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-line/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 border border-brand/30 text-brand">
                <Store className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-base font-semibold text-ink">{seller.storeName}</h2>
                <span className="text-xs text-ink-muted">Identificador comercial</span>
              </div>
            </div>

            <StatusBadge status={seller.status} category="seller" />
          </div>

          {seller.status === 'PENDING' && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-warning/30 bg-warning-soft">
              <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-semibold text-warning uppercase tracking-wider">
                  En Proceso de Revisión
                </span>
                <p className="text-ink-muted leading-relaxed">
                  {i18n.seller.pendingReview} Verificamos la identidad de cada comercio para garantizar compras y ventas seguras.
                </p>
              </div>
            </div>
          )}

          {seller.status === 'ACTIVE' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-success/30 bg-success-soft">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-semibold text-success uppercase tracking-wider">
                    Comercio Activo y Verificado
                  </span>
                  <p className="text-ink-muted leading-relaxed">
                    Tu tienda cuenta con credenciales activas. Puedes publicar productos, definir precios y despachar pedidos protegidos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link
                  to="/vendedor/productos"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface-2 hover:border-brand/40 transition-colors text-xs font-semibold text-ink"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-brand" />
                    <span>{i18n.seller.myProducts}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
                </Link>

                <Link
                  to="/vendedor/pedidos"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface-2 hover:border-brand/40 transition-colors text-xs font-semibold text-ink"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-brand" />
                    <span>{i18n.seller.pendingOrders}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
                </Link>
              </div>
            </div>
          )}

          {(seller.status === 'SUSPENDED' || seller.status === 'REJECTED') && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-danger/30 bg-danger-soft">
              <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-semibold text-danger uppercase tracking-wider">
                  Acceso Comercial Suspendido o Denegado
                </span>
                <p className="text-ink-muted leading-relaxed">
                  Tu comercio ha sido suspendido o tu solicitud fue rechazada por administración. Para consultar detalles, comunícate con el equipo de soporte.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <PageHeader
        title={i18n.seller.applyTitle}
        description={i18n.seller.applyDesc}
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Solicitar Afiliación Comercial' },
        ]}
      />

      <Card padding="lg" className="flex flex-col gap-6">
        <div className="flex items-start gap-3 p-3.5 rounded-xl border border-brand/30 bg-brand-soft text-xs text-ink-muted leading-relaxed">
          <ShieldCheck className="h-5 w-5 text-brand shrink-0 mt-0.5" />
          <span>
            Los comercios en TVS operan bajo custodia simulada. Recibirás pagos garantizados una vez que el comprador confirme la recepción física de su pedido.
          </span>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input
            label={i18n.seller.storeNamePrompt}
            required
            minLength={3}
            placeholder="Ej. ElectroHogar Perú, Modas Lima"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />

          <Textarea
            label={i18n.seller.descriptionPrompt}
            rows={4}
            placeholder="Describe el tipo de catálogo, productos y cobertura de tus envíos..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {apply.isError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-soft text-danger border border-danger/30 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>
                {apply.error instanceof ApiError ? apply.error.message : i18n.common.error}
              </span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={apply.isPending}
            className="w-full sm:w-auto self-start font-medium px-8 "
          >
            {i18n.seller.submitApplication}
          </Button>
        </form>
      </Card>
    </div>
  );
}
