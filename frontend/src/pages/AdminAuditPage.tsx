import { useState, type FormEvent } from 'react';
import { useAuditLog, type AuditEntry, type AuditFilters } from '../api/admin';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';
import { ApiError } from '../lib/http';
import { FileCheck2, User, Clock, Filter, Code } from 'lucide-react';

const roleLabels = i18n.roles as Record<string, string>;

function EntryRow({ entry }: { entry: AuditEntry }) {
  const [showPayload, setShowPayload] = useState(false);

  return (
    <Card padding="md" className="flex flex-col gap-2.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-line/60">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-brand bg-brand-soft px-2 py-0.5 rounded border border-brand/20">
            {entry.action}
          </span>
          <span className="text-xs text-ink-muted">·</span>
          <span className="text-xs font-semibold text-ink">
            {entry.entity} #{entry.entityId.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
          <Clock className="h-3 w-3" />
          <span>{formatDate(entry.createdAt)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-ink-muted">
          <User className="h-3.5 w-3.5 text-info" />
          <span>
            Operador:{' '}
            <strong className="text-ink">
              {entry.actor
                ? `${entry.actor.fullName} (${roleLabels[entry.actor.role] ?? entry.actor.role})`
                : 'Sistema Automático'}
            </strong>
          </span>
        </div>

        {entry.payload && (
          <button
            type="button"
            onClick={() => setShowPayload(!showPayload)}
            className="flex items-center gap-1 text-[11px] font-semibold text-brand hover:text-brand-hover transition-colors"
          >
            <Code className="h-3 w-3" />
            <span>{showPayload ? 'Ocultar payload' : 'Ver payload JSON'}</span>
          </button>
        )}
      </div>

      {showPayload && entry.payload && (
        <pre className="mt-1 p-3 rounded-lg bg-surface-2 border border-line text-[11px] font-mono text-ink-muted overflow-x-auto leading-relaxed">
          {JSON.stringify(entry.payload, null, 2)}
        </pre>
      )}
    </Card>
  );
}

export default function AdminAuditPage() {
  const [filters, setFilters] = useState<AuditFilters>({ entity: '', action: '' });
  const [form, setForm] = useState<AuditFilters>({ entity: '', action: '' });
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAuditLog(filters, page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFilters({ entity: form.entity.trim(), action: form.action.trim() });
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader
        title={i18n.admin.auditTitle}
        description="Bitácora inmutable de eventos de seguridad, inicios de sesión y operaciones administrativas."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Panel Admin' },
          { label: 'Auditoría' },
        ]}
      />

      {/* Formulario de filtros */}
      <Card padding="sm">
        <form onSubmit={submit} className="flex flex-wrap items-center gap-3">
          <input
            className="h-10 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand flex-1 min-w-[180px] transition-all"
            placeholder="Filtrar por entidad (ej. order, user, claim)..."
            value={form.entity}
            onChange={(e) => setForm({ ...form, entity: e.target.value })}
          />

          <input
            className="h-10 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand flex-1 min-w-[180px] transition-all"
            placeholder="Filtrar por acción (ej. LOGIN_SUCCESS, USER_BLOCKED)..."
            value={form.action}
            onChange={(e) => setForm({ ...form, action: e.target.value })}
          />

          <Button type="submit" size="sm" className="font-semibold px-4 gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtrar</span>
          </Button>
        </form>
      </Card>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton variant="block" className="h-24 w-full" />
          <Skeleton variant="block" className="h-24 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Error al consultar registros de auditoría"
          description={error instanceof ApiError ? error.message : i18n.common.error}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={<FileCheck2 className="h-8 w-8" />}
          title="Sin registros encontrados"
          description="No se hallaron eventos de auditoría que coincidan con los filtros aplicados."
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {data.items.map((entry) => (
              <EntryRow key={entry.id} entry={entry} />
            ))}
          </div>

          {meta && lastPage > 1 && (
            <div className="pt-2 border-t border-line/40">
              <Pagination
                page={page}
                totalPages={lastPage}
                totalItems={meta.total}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
