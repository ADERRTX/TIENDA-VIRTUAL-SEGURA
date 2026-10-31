import { useState, type FormEvent } from 'react';
import { useMySeller, useUpdateMySeller, type SellerProfile } from '../api/sellers';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';

const inputClass =
  'w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

function StoreForm({ seller }: { seller: SellerProfile }) {
  const [storeName, setStoreName] = useState(seller.storeName);
  const [description, setDescription] = useState(seller.description ?? '');
  const update = useUpdateMySeller();

  function submit(event: FormEvent) {
    event.preventDefault();
    update.mutate({ storeName: storeName.trim(), description: description.trim() });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        {i18n.seller.storeNamePrompt}
        <input className={inputClass} required minLength={3} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        {i18n.seller.descriptionPrompt}
        <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      {update.isError && (
        <p className="text-sm text-red-400">
          {update.error instanceof ApiError ? update.error.message : i18n.common.error}
        </p>
      )}
      {update.isSuccess && <p className="text-sm text-brand">{i18n.common.success}</p>}
      <Button type="submit" className="self-start" isLoading={update.isPending}>
        {i18n.common.save}
      </Button>
    </form>
  );
}

export default function SellerStorePage() {
  const { data: seller, isLoading } = useMySeller(true);

  return (
    <section className="flex max-w-xl flex-col gap-4">
      <h1 className="text-2xl font-bold">Mi tienda</h1>
      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}
      {!isLoading && !seller && <p className="text-ink-muted">No se encontró tu tienda.</p>}
      {seller && <StoreForm key={seller.id} seller={seller} />}
    </section>
  );
}