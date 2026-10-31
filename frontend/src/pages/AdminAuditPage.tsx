import { useState, type FormEvent } from 'react';
import { useAuditLog, type AuditEntry, type AuditFilters } from '../api/admin';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';
import { ApiError } from '../lib/http';

const inputClass =
  'min-h-[44px] rounded-xl border border-line bg-bg px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
const roleLabels = i18n.roles as Record<string, string>;

function EntryRow({ entry }: { entry: AuditEntry }) {
  return (
    <article className="flex flex-col gap-1 rounded-2xl border border-line bg-surface-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-brand">{entry.action}</h2>
        <span className="text-xs text-ink-muted">{formatDate(entry.createdAt)}</span>
      </div>
      <p className="text-sm">
        {entry.actor
          ? `${entry.actor.fullName} (${roleLabels[entry.actor.role] ?? entry.actor.role})`
          : 'Sistema'}
      </p>
      <p className="text-xs text-ink-muted">
        Entidad: {entry.entity} · {entry.entityId.slice(0, 8)}
      </p>
      {entry.payload && (
        <p className="break-all text-xs text-ink-muted">{JSON.stringify(entry.payload)}</p>
      )}
    </article>
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
    <section className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">{i18n.admin.auditTitle}</h1>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          className={`${inputClass} flex-1`}
          placeholder="Entidad (ej. claim)"
          value={form.entity}
          onChange={(e) => setForm({ ...form, entity: e.target.value })}
        />
        <input
          className={`${inputClass} flex-1`}
          placeholder="Acción (ej. LOGIN_SUCCESS)"
          value={form.action}
          onChange={(e) => setForm({ ...form, action: e.target.value })}
        />
        <Button type="submit" size="sm">
          Filtrar
        </Button>
      </form>

      {isLoading && <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />}
      {isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5">
          <p className="text-ink-muted">{error instanceof ApiError ? error.message : i18n.common.error}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            {i18n.common.retry}
          </Button>
        </div>
      )}
      {data && data.items.length === 0 && <p className="text-ink-muted">No hay registros con ese filtro.</p>}
      {data?.items.map((entry) => <EntryRow key={entry.id} entry={entry} />)}

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