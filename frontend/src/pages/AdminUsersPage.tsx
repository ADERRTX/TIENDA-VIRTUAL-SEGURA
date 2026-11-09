import { useState, type FormEvent } from 'react';
import { useAdminUsers, useBlockUser, useUnblockUser, type AdminUser, type UserFilters } from '../api/admin';
import { useMe } from '../api/auth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { i18n } from '../i18n/es';
import { formatDateOnly } from '../lib/formatters';
import { ApiError } from '../lib/http';
import {
  Users,
  Search,
  User,
  Store,
  Calendar,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';

const roleLabels = i18n.roles as Record<string, string>;
const sellerLabels = i18n.sellerStatus as Record<string, string>;
const emptyFilters: UserFilters = { q: '', role: '', status: '' };

function UserRow({ user }: { user: AdminUser }) {
  const { data: me } = useMe();
  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const [modalAction, setModalAction] = useState<'block' | 'unblock' | null>(null);
  const [reason, setReason] = useState('');

  const isMe = me?.id === user.id;
  const isAdmin = user.role === 'ADMIN';
  const isBlocked = user.status === 'BLOCKED';

  const closeModal = () => {
    setModalAction(null);
    setReason('');
    blockUser.reset();
    unblockUser.reset();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    if (modalAction === 'block') {
      blockUser.mutate(
        { id: user.id, reason: reason.trim() },
        { onSuccess: closeModal },
      );
    } else if (modalAction === 'unblock') {
      unblockUser.mutate(
        { id: user.id, reason: reason.trim() },
        { onSuccess: closeModal },
      );
    }
  };

  const activeMutation = modalAction === 'block' ? blockUser : unblockUser;
  const isPending = blockUser.isPending || unblockUser.isPending;

  return (
    <>
      <Card padding="md" className="flex flex-col gap-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-line/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-brand border border-line">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-sm text-ink">{user.fullName}</h2>
              <span className="text-[11px] text-ink-muted">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={user.status} category="user" size="sm" />
            <Badge variant="brand" size="sm">
              {roleLabels[user.role] ?? user.role}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Registro: {formatDateOnly(user.createdAt)}</span>
            </span>

            {user.seller && (
              <span className="flex items-center gap-1 text-ink">
                <Store className="h-3.5 w-3.5 text-brand" />
                <span>
                  Tienda: {user.seller.storeName} ({sellerLabels[user.seller.status] ?? user.seller.status})
                </span>
              </span>
            )}
          </div>

          {/* Acciones de bloqueo administrativo */}
          {!isMe && !isAdmin && (
            <div>
              {isBlocked ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs px-2.5 font-semibold gap-1"
                  onClick={() => setModalAction('unblock')}
                >
                  <Unlock className="h-3 w-3 text-brand" />
                  <span>Desbloquear</span>
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  className="h-7 text-xs px-2.5 font-semibold gap-1"
                  onClick={() => setModalAction('block')}
                >
                  <Lock className="h-3 w-3" />
                  <span>Bloquear usuario</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Modal con motivo obligatorio */}
      <Modal
        isOpen={modalAction !== null}
        onClose={closeModal}
        title={modalAction === 'block' ? 'Bloquear Acceso de Usuario' : 'Desbloquear Acceso de Usuario'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 rounded-xl border border-warning/30 bg-warning-soft text-xs text-ink-muted leading-relaxed">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <span>
              {modalAction === 'block'
                ? `Al bloquear a ${user.fullName} (${user.email}), todas sus sesiones activas serán invalidadas inmediatamente mediante revocación de tokens.`
                : `Se restaurará el acceso de ${user.fullName} (${user.email}) para que pueda iniciar sesión normalmente.`}
            </span>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-ink">
            <span>Motivo obligatorio de la acción (mínimo 5 caracteres)</span>
            <textarea
              className="w-full min-h-[90px] rounded-lg border border-line bg-surface-2 p-3 text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
              placeholder="Indica la razón administrativa documentada..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={5}
            />
          </label>

          {activeMutation.isError && (
            <p className="text-xs text-danger">
              {activeMutation.error instanceof ApiError
                ? activeMutation.error.message
                : i18n.common.error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-line/50">
            <Button type="button" variant="ghost" size="sm" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={modalAction === 'block' ? 'danger' : 'primary'}
              size="sm"
              isLoading={isPending}
              disabled={reason.trim().length < 5}
            >
              {modalAction === 'block' ? 'Confirmar Bloqueo' : 'Confirmar Desbloqueo'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader
        title={i18n.admin.usersTitle}
        description="Directorio de usuarios registrados, roles y control administrativo de accesos."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Panel Admin' },
          { label: 'Gestión de Usuarios' },
        ]}
      />

      {/* Filtros de búsqueda */}
      <Card padding="sm" className="flex flex-col gap-3">
        <form
          className="flex flex-wrap items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: search.trim() });
          }}
        >
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo electrónico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-line bg-surface-2 text-xs text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all"
            />
          </div>

          <select
            className="h-10 px-3 rounded-lg border border-line bg-surface-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand min-w-[160px]"
            value={filters.role}
            onChange={(e) => update({ role: e.target.value })}
          >
            <option value="">Todos los roles</option>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <Button type="submit" size="sm" className="font-semibold px-4">
            Buscar
          </Button>
        </form>
      </Card>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" className="h-28 w-full" />
          <Skeleton variant="block" className="h-28 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Error al consultar usuarios"
          description={error instanceof ApiError ? error.message : i18n.common.error}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="Sin usuarios encontrados"
          description="No se encontraron cuentas bajo los criterios de búsqueda especificados."
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            {data.items.map((user) => (
              <UserRow key={user.id} user={user} />
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
