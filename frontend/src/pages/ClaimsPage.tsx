import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClaims } from '../api/claims';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';
import { ApiError } from '../lib/http';

export const claimStatusLabels: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_RESPUESTA: 'En respuesta',
  RESUELTO: 'Resuelto',
  APELADO: 'Apelado',
};

export default function ClaimsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useClaims(page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">{i18n.claims.title}</h1>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}

      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">
            {error instanceof ApiError ? error.message : i18n.common.error}
          </p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}

      {data && data.items.length === 0 && (
        <p className="text-ink-muted">No hay reclamos registrados.</p>
      )}

      {data?.items.map((claim) => (
        <Link
          key={claim.id}
          to={`/reclamos/${claim.id}`}
          className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-5 transition hover:border-brand"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">Reclamo #{claim.id.slice(0, 8)}</h2>
            <span className="rounded-full border border-brand/50 px-3 py-1 text-xs font-semibold text-brand">
              {claimStatusLabels[claim.status] ?? claim.status}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-ink-muted">{claim.reason}</p>
          <p className="text-xs text-ink-muted">
            {claim.subOrder?.seller?.storeName ?? ''}
            {claim.claimant?.fullName ? ` · ${claim.claimant.fullName}` : ''} ·{' '}
            {formatDate(claim.createdAt)}
          </p>
        </Link>
      ))}

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