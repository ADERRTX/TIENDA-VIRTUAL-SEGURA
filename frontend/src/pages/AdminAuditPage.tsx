import { useState, type FormEvent } from 'react';
import { useAuditLog, type AuditEntry, type AuditFilters } from '../api/admin';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';
import { ApiError } from '../lib/http';
import { FileCheck2, User, Clock, Filter, Code } from 'lucide-react';

const roleLabels = i18n.roles as Record<string, string>;

export default function AdminAuditPage() {
  const [filters, setFilters] = useState<AuditFilters>({ entity: '', action: '' });
  const [form, setForm] = useState<AuditFilters>({ entity: '', action: '' });
  const [page, setPage] = useState(1);
  const [selectedPayload, setSelectedPayload] = useState<unknown | null>(null);
  const { data, isLoading, isError, error, refetch, isFetching } = useAuditLog(filters, page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setFilters({ entity: form.entity.trim(), action: form.action.trim() });
    setPage(1);
  };

  const columns: Column<AuditEntry>[] = [
    {
      key: 'action',
      header: 'Acción',
      render: (entry) => (
        <span className="font-mono font-medium text-xs text-brand bg-brand-soft px-2 py-0.5 rounded border border-brand/20 whitespace-nowrap">
          {entry.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Entidad Afectada',
      render: (entry) => (
        <span className="text-xs font-semibold text-ink whitespace-nowrap">
          {entry.entity} #{entry.entityId.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Operador / Actor',
      render: (entry) => (
        <div className="flex items-center gap-1.5 text-xs text-ink">
          <User className="h-3.5 w-3.5 text-info shrink-0" />
          <span className="truncate max-w-[180px]">
            {entry.actor
              ? `${entry.actor.fullName} (${roleLabels[entry.actor.role] ?? entry.actor.role})`
              : 'Sistema Automático'}
          </span>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Fecha y Hora',
      render: (entry) => (
        <div className="flex items-center gap-1.5 text-xs text-ink-muted whitespace-nowrap">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{formatDate(entry.createdAt)}</span>
        </div>
      ),
    },
    {
      key: 'payload',
      header: 'Detalle',
      render: (entry) => (
        entry.payload ? (
          <button
            type="button"
            onClick={() => setSelectedPayload(selectedPayload === entry.payload ? null : entry.payload)}
            className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
          >
            <Code className="h-3 w-3" />
            <span>{selectedPayload === entry.payload ? 'Cerrar' : 'Ver JSON'}</span>
          </button>
        ) : (
          <span className="text-ink-faint text-xs">—</span>
        )
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
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
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Filtrar por entidad (ej. order, user, claim)..."
              value={form.entity}
              onChange={(e) => setForm({ ...form, entity: e.target.value })}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Filtrar por acción (ej. LOGIN_SUCCESS, USER_BLOCKED)..."
              value={form.action}
              onChange={(e) => setForm({ ...form, action: e.target.value })}
            />
          </div>

          <Button type="submit" size="sm" className="font-semibold px-4 gap-1.5 h-11">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtrar</span>
          </Button>

          {isFetching && !isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-ink-muted pl-1">
              <Spinner size="sm" />
              <span>Actualizando...</span>
            </div>
          )}
        </form>
      </Card>

      {isError && (
        <ErrorState
          title="Error al consultar registros de auditoría"
          description={error instanceof ApiError ? error.message : i18n.common.error}
          onRetry={() => refetch()}
        />
      )}

      {!isError && (
        <div className="flex flex-col gap-6">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            keyExtractor={(entry) => entry.id}
            isLoading={isLoading}
            emptyState={
              <EmptyState
                icon={<FileCheck2 className="h-8 w-8" />}
                title="Sin registros encontrados"
                description="No se hallaron eventos de auditoría que coincidan con los filtros aplicados."
              />
            }
          />

          {Boolean(selectedPayload) && (
            <Card padding="md" className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-line/60">
                <span className="text-xs font-semibold text-ink">Payload del Registro</span>
                <button
                  type="button"
                  onClick={() => setSelectedPayload(null)}
                  className="text-xs text-ink-muted hover:text-ink"
                >
                  Cerrar
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-surface-2 border border-line text-xs font-mono text-ink-muted overflow-x-auto leading-relaxed max-h-60">
                {JSON.stringify(selectedPayload, null, 2)}
              </pre>
            </Card>
          )}

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
