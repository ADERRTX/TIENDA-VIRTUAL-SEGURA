import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClaims } from '../api/claims';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { Tabs } from '../components/ui/Tabs';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';
import { ApiError } from '../lib/http';
import { Scale, Store, User, Clock, ArrowRight } from 'lucide-react';

export const claimStatusLabels: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_RESPUESTA: 'En respuesta',
  RESUELTO: 'Resuelto',
  APELADO: 'Apelado',
};

export default function ClaimsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('ALL');
  const { data, isLoading, isError, error, refetch } = useClaims(page);
  const meta = data?.meta;
  const lastPage = meta ? Math.max(1, Math.ceil(meta.total / meta.pageSize)) : 1;

  const tabs = [
    { id: 'ALL', label: 'Todos', count: data?.items?.length },
    { id: 'ABIERTO', label: 'Abiertos' },
    { id: 'EN_RESPUESTA', label: 'En respuesta' },
    { id: 'RESUELTO', label: 'Resueltos' },
  ];

  const items = (data?.items ?? []).filter(
    (claim) => activeTab === 'ALL' || claim.status === activeTab,
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <PageHeader
        title={i18n.claims.title}
        description="Centro formal de mediación, resolución de controversias y garantías de compra."
        breadcrumbs={[
          { label: 'Inicio', to: '/' },
          { label: 'Reclamos y Mediación' },
        ]}
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton variant="block" className="h-32 w-full" />
          <Skeleton variant="block" className="h-32 w-full" />
        </div>
      )}

      {isError && (
        <ErrorState
          title="Error al consultar reclamos"
          description={error instanceof ApiError ? error.message : i18n.common.error}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          icon={<Scale className="h-8 w-8" />}
          title="Sin reclamos en esta categoría"
          description="No se encontraron controversias o mediaciones bajo el filtro seleccionado."
        />
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {items.map((claim) => (
              <Link
                key={claim.id}
                to={`/reclamos/${claim.id}`}
                className="group flex flex-col gap-3 rounded-xl border border-line bg-surface p-5 transition-all duration-150 hover:border-brand/50 hover:bg-surface-2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-warning border border-line">
                      <Scale className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm text-ink group-hover:text-brand transition-colors">
                      Reclamo #{claim.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  <StatusBadge status={claim.status} category="claim" />
                </div>

                <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                  "{claim.reason}"
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line/40 text-xs text-ink-muted">
                  <div className="flex items-center gap-3">
                    {claim.subOrder?.seller?.storeName && (
                      <span className="flex items-center gap-1">
                        <Store className="h-3 w-3 text-brand" />
                        <span>{claim.subOrder.seller.storeName}</span>
                      </span>
                    )}

                    {claim.claimant?.fullName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-info" />
                        <span>{claim.claimant.fullName}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(claim.createdAt)}</span>
                    <span className="text-brand font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>Ingresar a mediación</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
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
