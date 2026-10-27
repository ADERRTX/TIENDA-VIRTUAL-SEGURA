import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useApplySeller, useMySeller } from '../api/sellers';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';

const inputClass =
  'w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

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

  if (isLoading) return <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />;

  if (seller) {
    const statusLabel = (i18n.sellerStatus as Record<string, string>)[seller.status] ?? seller.status;
    return (
      <section className="flex max-w-xl flex-col gap-3">
        <h1 className="text-2xl font-bold">{seller.storeName}</h1>
        <p className="text-sm">
          Estado de tu solicitud:{' '}
          <span className="rounded-full border border-brand/50 px-3 py-1 text-xs font-semibold text-brand">
            {statusLabel}
          </span>
        </p>
        {seller.status === 'PENDING' && <p className="text-ink-muted">{i18n.seller.pendingReview}</p>}
        {seller.status === 'ACTIVE' && (
          <>
            <p className="text-ink-muted">
              Tu tienda está activa. Si no ves el menú de vendedor, cierra sesión y vuelve a entrar.
            </p>
            <Link to="/vendedor/productos" className="font-semibold text-brand underline">
              {i18n.seller.myProducts}
            </Link>
          </>
        )}
        {seller.status === 'SUSPENDED' && (
          <p className="text-ink-muted">Tu tienda está suspendida o fue rechazada. Contacta a soporte.</p>
        )}
      </section>
    );
  }

  return (
    <section className="flex max-w-xl flex-col gap-4">
      <h1 className="text-2xl font-bold">{i18n.seller.applyTitle}</h1>
      <p className="text-ink-muted">{i18n.seller.applyDesc}</p>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {i18n.seller.storeNamePrompt}
          <input className={inputClass} required minLength={3} value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {i18n.seller.descriptionPrompt}
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        {apply.isError && (
          <p className="text-sm text-red-400">
            {apply.error instanceof ApiError ? apply.error.message : i18n.common.error}
          </p>
        )}
        <Button type="submit" isLoading={apply.isPending}>
          {i18n.seller.submitApplication}
        </Button>
      </form>
    </section>
  );
}