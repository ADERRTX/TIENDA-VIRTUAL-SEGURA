import { useState, type FormEvent } from 'react';
import {
  useAdminSellerAction,
  useAdminSellers,
  type SellerProfile,
} from '../api/sellers';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';

const inputClass =
  'w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
const statusLabels = i18n.sellerStatus as Record<string, string>;

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

function SellerRow({ seller }: { seller: SellerProfile }) {
  const action = useAdminSellerAction();
  const [reasonFor, setReasonFor] = useState<'reject' | 'suspend' | null>(null);
  const [reason, setReason] = useState('');

  const close = () => {
    setReasonFor(null);
    setReason('');
    action.reset();
  };

  function submitReason(event: FormEvent) {
    event.preventDefault();
    if (!reasonFor) return;
    action.mutate({ id: seller.id, action: reasonFor, reason: reason.trim() }, { onSuccess: close });
  }

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold">{seller.storeName}</h2>
          {seller.user && (
            <p className="text-xs text-ink-muted">
              {seller.user.fullName} {seller.user.email ? `· ${seller.user.email}` : ''}
            </p>
          )}
        </div>
        <span className="rounded-full border border-brand/50 px-3 py-1 text-xs font-semibold text-brand">
          {statusLabels[seller.status] ?? seller.status}
        </span>
      </header>
      {seller.description && <p className="text-sm text-ink-muted">{seller.description}</p>}

      <div className="flex flex-wrap gap-2">
        {seller.status !== 'ACTIVE' && (
          <Button
            size="sm"
            isLoading={action.isPending && !reasonFor}
            onClick={() => action.mutate({ id: seller.id, action: 'approve' })}
          >
            {i18n.admin.approve}
          </Button>
        )}
        {seller.status === 'PENDING' && (
          <Button variant="danger" size="sm" onClick={() => setReasonFor('reject')}>
            {i18n.admin.reject}
          </Button>
        )}
        {seller.status === 'ACTIVE' && (
          <Button variant="danger" size="sm" onClick={() => setReasonFor('suspend')}>
            {i18n.admin.suspend}
          </Button>
        )}
      </div>
      {action.isError && !reasonFor && <p className="text-sm text-red-400">{errorMessage(action.error)}</p>}

      <Modal
        isOpen={reasonFor !== null}
        onClose={close}
        title={reasonFor === 'reject' ? i18n.admin.reject : i18n.admin.suspend}
      >
        <form onSubmit={submitReason} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            {i18n.admin.reasonPrompt}
            <textarea className={inputClass} rows={3} required minLength={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
          {action.isError && <p className="text-sm text-red-400">{errorMessage(action.error)}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={close}>
              {i18n.common.cancel}
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={action.isPending}>
              {i18n.common.save}
            </Button>
          </div>
        </form>
      </Modal>
    </article>
  );
}

export default function AdminSellersPage() {
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAdminSellers(status, page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{i18n.admin.sellersTitle}</h1>
        <select
          className={`${inputClass} w-auto`}
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos</option>
          <option value="PENDING">{statusLabels.PENDING}</option>
          <option value="ACTIVE">{statusLabels.ACTIVE}</option>
          <option value="SUSPENDED">{statusLabels.SUSPENDED}</option>
        </select>
      </div>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}
      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{errorMessage(error)}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}
      {data && data.items.length === 0 && <p className="text-ink-muted">No hay vendedores con ese estado.</p>}
      {data?.items.map((seller) => <SellerRow key={seller.id} seller={seller} />)}

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