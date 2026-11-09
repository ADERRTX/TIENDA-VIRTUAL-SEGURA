import { useState, type FormEvent } from 'react';
import { useMySeller, useUpdateMySeller, type SellerProfile } from '../api/sellers';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';
import { Store, CheckCircle2, AlertCircle } from 'lucide-react';

function StoreForm({ seller }: { seller: SellerProfile }) {
  const [storeName, setStoreName] = useState(seller.storeName);
  const [description, setDescription] = useState(seller.description ?? '');
  const update = useUpdateMySeller();

  function submit(event: FormEvent) {
    event.preventDefault();
    update.mutate({ storeName: storeName.trim(), description: description.trim() });
  }

  return (
    <Card padding="lg" className="flex flex-col gap-5">
      <div className="flex items-center gap-3 pb-3 border-b border-line/60">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 border border-brand/30 text-brand">
          <Store className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-ink">Información del Comercio</h2>
          <span className="text-xs text-ink-muted">Configura los datos públicos visibles para tus compradores</span>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input
          label={i18n.seller.storeNamePrompt}
          required
          minLength={3}
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />

        <Textarea
          label={i18n.seller.descriptionPrompt}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {update.isError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-soft text-danger border border-danger/30 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {update.error instanceof ApiError ? update.error.message : i18n.common.error}
            </span>
          </div>
        )}

        {update.isSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-soft text-brand border border-brand/30 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{i18n.common.success}</span>
          </div>
        )}

        <Button
          type="submit"
          size="sm"
          className="self-start font-semibold px-6"
          isLoading={update.isPending}
        >
          {i18n.common.save}
        </Button>
      </form>
    </Card>
  );
}

export default function SellerStorePage() {
  const { data: seller, isLoading } = useMySeller(true);

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <PageHeader
        title="Mi Tienda"
        description="Administra la identidad y descripción pública de tu comercio en la plataforma."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Panel de Vendedor' },
          { label: 'Mi Tienda' },
        ]}
      />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" className="h-10 w-48" />
          <Skeleton variant="block" className="h-44 w-full" />
        </div>
      )}

      {!isLoading && !seller && (
        <p className="text-sm text-ink-muted">No se encontró información de tu tienda.</p>
      )}

      {seller && <StoreForm key={seller.id} seller={seller} />}
    </div>
  );
}
