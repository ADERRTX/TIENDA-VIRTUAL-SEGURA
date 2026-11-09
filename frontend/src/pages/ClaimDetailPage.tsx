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
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';
import { ApiError } from '../lib/http';
import {
  ArrowLeft,
  Scale,
  MessageSquare,
  Send,
  User,
  Store,
  Gavel,
} from 'lucide-react';

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
  const isSeller = Boolean(user && user.role === 'SELLER');
  const canAppeal = claim?.status === 'RESUELTO' && (isClaimant || isSeller);

  function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Regreso a la lista */}
      <Link
        to="/reclamos"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-brand transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Volver a la cola de reclamos</span>
      </Link>

      {/* Estados de Carga */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" className="h-36 w-full" />
          <Skeleton variant="block" className="h-48 w-full" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <ErrorState
          title="Error al consultar el reclamo"
          description={errorMessage(error)}
          onRetry={() => refetch()}
        />
      )}

      {/* Detalle y Sala de Mediación */}
      {claim && (
        <div className="flex flex-col gap-6">
          {/* Cabecera del Reclamo */}
          <Card padding="lg" className="flex flex-col gap-4 shadow-md">
            <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 border border-warning/30 text-warning">
                  <Scale className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-base font-extrabold text-ink">
                    Expediente de Mediación #{claim.id.slice(0, 8).toUpperCase()}
                  </h1>
                  <span className="text-[11px] text-ink-muted">
                    Iniciado el {formatDate(claim.createdAt)}
                  </span>
                </div>
              </div>

              <StatusBadge status={claim.status} category="claim" />
            </header>

            {/* Metadatos del caso */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-ink-muted">
                <User className="h-4 w-4 text-info shrink-0" />
                <span>
                  Reclamante: <strong className="text-ink">{claim.claimant?.fullName ?? 'Usuario'}</strong>
                </span>
              </div>

              {claim.subOrder?.seller?.storeName && (
                <div className="flex items-center gap-2 text-ink-muted">
                  <Store className="h-4 w-4 text-brand shrink-0" />
                  <span>
                    Comercio involucrado: <strong className="text-ink">{claim.subOrder.seller.storeName}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Motivo original */}
            <div className="p-3.5 rounded-xl border border-line bg-surface-2/60 flex flex-col gap-1 text-xs">
              <span className="font-bold text-ink uppercase tracking-wider text-[10px]">
                Motivo del Reclamo:
              </span>
              <p className="text-ink-muted leading-relaxed whitespace-pre-wrap">
                {claim.reason}
              </p>
            </div>

            {/* Resolución emitida */}
            {claim.resolution && (
              <div className="p-4 rounded-xl border border-brand/30 bg-brand-soft/40 flex items-start gap-3 text-xs">
                <Gavel className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-brand uppercase tracking-wider">
                    {i18n.claims.resolutionTitle}
                  </span>
                  <p className="text-ink font-semibold">
                    {(i18n.claims.resolutions as Record<string, string>)[claim.resolution] ?? claim.resolution}
                  </p>
                </div>
              </div>
            )}

            {/* Botón de apelación */}
            {canAppeal && (
              <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                <span className="text-xs text-ink-muted">¿En desacuerdo con el veredicto emitido?</span>
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={appeal.isPending}
                  onClick={() => appeal.mutate()}
                  className="font-semibold text-xs"
                >
                  {i18n.claims.appeal}
                </Button>
              </div>
            )}
            {appeal.isError && (
              <p className="text-xs text-danger">{errorMessage(appeal.error)}</p>
            )}
          </Card>

          {/* Sala de Conversación / Mensajes */}
          <Card padding="lg" className="flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-3 border-b border-line/60">
              <MessageSquare className="h-5 w-5 text-brand" />
              <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
                {i18n.claims.messages}
              </h2>
            </div>

            {claim.messages.length === 0 && (
              <p className="text-xs text-ink-muted py-4 text-center">
                Aún no hay respuestas cruzadas en este expediente.
              </p>
            )}

            {/* Lista de mensajes */}
            <div className="flex flex-col gap-3">
              {claim.messages.map((message) => {
                const role = message.author?.role;
                const isSupportMessage = role === 'ADMIN' || role === 'SUPPORT';
                const isSellerMessage = role === 'SELLER';

                return (
                  <div
                    key={message.id}
                    className={`flex flex-col gap-1.5 p-3.5 rounded-xl border text-xs leading-relaxed ${
                      isSupportMessage
                        ? 'border-brand/40 bg-brand-soft/20 ring-1 ring-brand/20'
                        : isSellerMessage
                          ? 'border-warning/30 bg-surface-2'
                          : 'border-line bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-1 border-b border-line/30">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">
                          {message.author?.fullName ?? message.author?.email ?? 'Usuario'}
                        </span>
                        {role && (
                          <Badge
                            variant={
                              isSupportMessage
                                ? 'brand'
                                : isSellerMessage
                                  ? 'warning'
                                  : 'neutral'
                            }
                            size="sm"
                          >
                            {((i18n.roles as Record<string, string>)[role]) || role}
                          </Badge>
                        )}
                      </div>

                      <span className="text-[10px] text-ink-muted">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>

                    <p className="text-ink text-xs whitespace-pre-wrap pt-0.5">
                      {message.body}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Formulario para enviar mensaje */}
            {claim.status !== 'RESUELTO' && (
              <form onSubmit={sendMessage} className="flex flex-col gap-3 pt-3 border-t border-line/60">
                <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
                  <span>Responder en el caso</span>
                  <textarea
                    className="w-full min-h-[80px] rounded-lg border border-line bg-surface-2 p-3 text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
                    rows={3}
                    required
                    minLength={2}
                    placeholder="Escribe tu mensaje para el comprador, vendedor y equipo de soporte..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </label>

                {addMessage.isError && (
                  <p className="text-xs text-danger">{errorMessage(addMessage.error)}</p>
                )}

                <Button
                  type="submit"
                  size="sm"
                  className="self-end font-semibold text-xs gap-1.5"
                  isLoading={addMessage.isPending}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{i18n.claims.sendMessage}</span>
                </Button>
              </form>
            )}
          </Card>

          {/* Panel Dictamen de Resolución (Solo STAFF / ADMINISTRACIÓN) */}
          {isStaff && claim.status !== 'RESUELTO' && (
            <Card padding="lg" className="flex flex-col gap-4 border-brand/50 shadow-lg">
              <div className="flex items-center gap-2.5 pb-3 border-b border-line/60">
                <Gavel className="h-5 w-5 text-brand" />
                <div className="flex flex-col">
                  <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
                    Resolución Oficial de Soporte
                  </h2>
                  <span className="text-xs text-ink-muted">
                    Como personal de soporte/admin, puedes dictaminar el cierre y custodia de fondos.
                  </span>
                </div>
              </div>

              <form onSubmit={submitResolution} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
                  <span>Dictamen de resolución</span>
                  <select
                    className="h-10 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                  >
                    {Object.entries(i18n.claims.resolutions).map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                {resolution === 'REEMBOLSO' && (
                  <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
                    <span>Monto a reembolsar (S/., opcional para reembolso parcial)</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Monto exacto en soles"
                      className="h-10 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink tabular focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
                      value={refund}
                      onChange={(e) => setRefund(e.target.value)}
                    />
                  </label>
                )}

                {resolve.isError && (
                  <p className="text-xs text-danger">{errorMessage(resolve.error)}</p>
                )}

                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  className="self-end font-semibold text-xs gap-1.5"
                  isLoading={resolve.isPending}
                >
                  <Gavel className="h-3.5 w-3.5" />
                  <span>Emitir Dictamen de Resolución</span>
                </Button>
              </form>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
