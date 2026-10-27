import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMe } from '../api/auth';
import {
  useAddClaimMessage,
  useAppealClaim,
  useClaim,
  useResolveClaim,
} from '../api/claims';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';
import { ApiError } from '../lib/http';
import { claimStatusLabels } from './ClaimsPage';

const inputClass =
  'w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : i18n.common.error;
}

export default function ClaimDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: user } = useMe();
  const { data: claim, isLoading, isError, error, refetch } = useClaim(id);
  const addMessage = useAddClaimMessage(id);
  const appeal = useAppealClaim(id);
  const resolve = useResolveClaim(id);
  const [body, setBody] = useState('');
  const [resolution, setResolution] = useState('SIN_FUNDAMENTO');
  const [refund, setRefund] = useState('');

  const isStaff = user?.role === 'ADMIN' || user?.role === 'SUPPORT';
  const isClaimant = Boolean(user && claim && claim.claimantId === user.id);

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    addMessage.mutate(body.trim(), { onSuccess: () => setBody('') });
  }

  function submitResolution(event: FormEvent) {
    event.preventDefault();
    const cents = refund ? Math.round(Number(refund) * 100) : undefined;
    resolve.mutate({
      resolution,
      ...(resolution === 'REEMBOLSO' && cents ? { refundAmount: cents } : {}),
    });
  }

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <Link to="/reclamos" className="text-sm text-ink-muted hover:text-brand">
        ← {i18n.claims.title}
      </Link>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}

      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{errorMessage(error)}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}

      {claim && (
        <>
          <header className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-xl font-bold">Reclamo #{claim.id.slice(0, 8)}</h1>
              <span className="rounded-full border border-brand/50 px-3 py-1 text-xs font-semibold text-brand">
                {claimStatusLabels[claim.status] ?? claim.status}
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              {claim.claimant?.fullName ?? ''} · {formatDate(claim.createdAt)}
              {claim.subOrder?.seller?.storeName ? ` · ${claim.subOrder.seller.storeName}` : ''}
            </p>
            <p className="text-sm">{claim.reason}</p>
            {claim.resolution && (
              <p className="border-t border-line pt-2 text-sm">
                <strong>{i18n.claims.resolutionTitle}:</strong>{' '}
                {(i18n.claims.resolutions as Record<string, string>)[claim.resolution] ??
                  claim.resolution}
              </p>
            )}
          </header>

          {claim.status === 'RESUELTO' && isClaimant && (
            <div className="flex flex-col items-start gap-2">
              <Button
                variant="secondary"
                size="sm"
                isLoading={appeal.isPending}
                onClick={() => appeal.mutate()}
              >
                {i18n.claims.appeal}
              </Button>
              {appeal.isError && <p className="text-sm text-red-400">{errorMessage(appeal.error)}</p>}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h2 className="font-bold">{i18n.claims.messages}</h2>
            {claim.messages.length === 0 && (
              <p className="text-sm text-ink-muted">Aún no hay mensajes.</p>
            )}
            {claim.messages.map((message) => (
              <article
                key={message.id}
                className="flex flex-col gap-1 rounded-2xl border border-line bg-surface-2 p-3"
              >
                <p className="text-xs text-ink-muted">
                  {message.author?.fullName ?? message.author?.email ?? 'Usuario'}
                  {message.author?.role ? ` · ${message.author.role}` : ''} ·{' '}
                  {formatDate(message.createdAt)}
                </p>
                <p className="text-sm">{message.body}</p>
              </article>
            ))}

            {claim.status !== 'RESUELTO' && (
              <form onSubmit={sendMessage} className="flex flex-col gap-2">
                <textarea
                  className={inputClass}
                  rows={3}
                  required
                  minLength={2}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                {addMessage.isError && (
                  <p className="text-sm text-red-400">{errorMessage(addMessage.error)}</p>
                )}
                <Button type="submit" size="sm" className="self-end" isLoading={addMessage.isPending}>
                  {i18n.claims.sendMessage}
                </Button>
              </form>
            )}
          </div>

          {isStaff && claim.status !== 'RESUELTO' && (
            <form
              onSubmit={submitResolution}
              className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2 p-5"
            >
              <h2 className="font-bold">{i18n.claims.resolveAs}</h2>
              <select
                className={inputClass}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              >
                {Object.entries(i18n.claims.resolutions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {resolution === 'REEMBOLSO' && (
                <label className="flex flex-col gap-1 text-sm">
                  Monto a reembolsar (S/, opcional)
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    className={inputClass}
                    value={refund}
                    onChange={(e) => setRefund(e.target.value)}
                  />
                </label>
              )}
              {resolve.isError && <p className="text-sm text-red-400">{errorMessage(resolve.error)}</p>}
              <Button type="submit" size="sm" className="self-end" isLoading={resolve.isPending}>
                {i18n.claims.resolutionTitle}
              </Button>
            </form>
          )}
        </>
      )}
    </section>
  );
}