import { useState, type FormEvent } from 'react';
import {
  useAdminSellerAction,
  useAdminSellers,
  type SellerProfile,
} from '../api/sellers';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { i18n } from '../i18n/es';
import { ApiError } from '../lib/http';
import {
  Store,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Mail,
} from 'lucide-react';

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
    <Card padding="md" className="flex flex-col gap-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-brand border border-line">
            <Store className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-semibold text-sm text-ink">{seller.storeName}</h2>
            {seller.user && (
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-info" />
                  <span>{seller.user.fullName}</span>
                </span>
                {seller.user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-brand" />
                    <span>{seller.user.email}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <StatusBadge status={seller.status} category="seller" />
      </header>

      {seller.description && (
        <p className="text-xs text-ink-muted leading-relaxed">
          {seller.description}
        </p>
      )}

      {/* Acciones de administración */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/50">
        {seller.status !== 'ACTIVE' && (
          <Button
            size="sm"
            variant="primary"
            className="text-xs font-semibold gap-1.5"
            isLoading={action.isPending && !reasonFor}
            onClick={() => action.mutate({ id: seller.id, action: 'approve' })}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{i18n.admin.approve}</span>
          </Button>
        )}

        {seller.status === 'PENDING' && (
          <Button
            variant="danger"
            size="sm"
            className="text-xs font-semibold gap-1.5"
            onClick={() => setReasonFor('reject')}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>{i18n.admin.reject}</span>
          </Button>
        )}

        {seller.status === 'ACTIVE' && (
          <Button
            variant="danger"
            size="sm"
            className="text-xs font-semibold gap-1.5"
            onClick={() => setReasonFor('suspend')}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{i18n.admin.suspend}</span>
          </Button>
        )}
      </div>

      {action.isError && !reasonFor && (
        <p className="text-xs text-danger">{errorMessage(action.error)}</p>
      )}

      {/* Modal con motivo obligatorio */}
      <Modal
        isOpen={reasonFor !== null}
        onClose={close}
        title={reasonFor === 'reject' ? 'Rechazar Solicitud de Vendedor' : 'Suspender Cuenta de Vendedor'}
        size="md"
      >
        <form onSubmit={submitReason} className="flex flex-col gap-4">
          <Textarea
            label={i18n.admin.reasonPrompt}
            rows={3}
            required
            minLength={3}
            placeholder="Indica el motivo justificado de la decisión administrativa..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {action.isError && (
            <p className="text-xs text-danger">{errorMessage(action.error)}</p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-line/50">
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              {i18n.common.cancel}
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={action.isPending}
              disabled={reason.trim().length < 3}
            >
              Confirmar Decisión
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

export default function AdminSellersPage() {
  const [status, setStatus] = useState('PENDING');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useAdminSellers(status, page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader
        title={i18n.admin.sellersTitle}
        description="Acreditación, aprobación y suspensión de comercios vendedores de la plataforma."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Panel Admin' },
          { label: 'Vendedores' },
        ]}
      />

      {/* Filtro por estado */}
      <Card padding="sm" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-ink-muted pl-1">Filtrar por estado:</span>
        <div className="w-full sm:w-64">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los comercios</option>
            <option value="PENDING">{statusLabels.PENDING}</option>
            <option value="ACTIVE">{statusLabels.ACTIVE}</option>
            <option value="SUSPENDED">{statusLabels.SUSPENDED}</option>
            <option value="REJECTED">{statusLabels.REJECTED}</option>
          </Select>
        </div>
      </Card>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" className="h-32 w-full" />
          <Skeleton variant="block" className="h-32 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Error al consultar vendedores"
          description={errorMessage(error)}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data && data.items.length === 0 && (
        <EmptyState
          icon={<Store className="h-8 w-8" />}
          title="Sin registros de vendedores"
          description="No se encontraron solicitudes o comercios registrados bajo el filtro seleccionado."
        />
      )}

      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {data.items.map((seller) => (
              <SellerRow key={seller.id} seller={seller} />
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
