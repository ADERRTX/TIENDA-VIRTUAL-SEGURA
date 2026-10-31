import { useState } from 'react';
import { useAdminUsers, type AdminUser, type UserFilters } from '../api/admin';
import { Button } from '../components/ui/Button';
import { i18n } from '../i18n/es';
import { formatDateOnly } from '../lib/formatters';
import { ApiError } from '../lib/http';

const inputClass =
  'min-h-[44px] rounded-xl border border-line bg-bg px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
const roleLabels = i18n.roles as Record<string, string>;
const sellerLabels = i18n.sellerStatus as Record<string, string>;
const emptyFilters: UserFilters = { q: '', role: '', status: '' };

function UserRow({ user }: { user: AdminUser }) {
  return (
    <article className="flex flex-col gap-1 rounded-2xl border border-line bg-surface-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold">{user.fullName}</h2>
        <span className="rounded-full border border-brand/50 px-3 py-1 text-xs font-semibold text-brand">
          {roleLabels[user.role] ?? user.role}
        </span>
      </div>
      <p className="text-sm text-ink-muted">{user.email}</p>
      <p className="text-xs text-ink-muted">
        Estado: {user.status} · Registro: {formatDateOnly(user.createdAt)}
        {user.seller && ` · Tienda: ${user.seller.storeName} (${sellerLabels[user.seller.status] ?? user.seller.status})`}
      </p>
    </article>
  );
}

export default function AdminUsersPage() {
  const [filters, setFilters] = useState<UserFilters>(emptyFilters);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAdminUsers(filters, page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  const update = (patch: Partial<UserFilters>) => {
    setFilters({ ...filters, ...patch });
    setPage(1);
  };

  return (
    <section className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold">{i18n.admin.usersTitle}</h1>

      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: search.trim() });
        }}
      >
        <input
          className={`${inputClass} flex-1`}
          placeholder="Buscar por nombre o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={inputClass} value={filters.role} onChange={(e) => update({ role: e.target.value })}>
          <option value="">Todos los roles</option>
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          Buscar
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
      {data && data.items.length === 0 && <p className="text-ink-muted">No hay usuarios con ese filtro.</p>}
      {data?.items.map((user) => <UserRow key={user.id} user={user} />)}

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