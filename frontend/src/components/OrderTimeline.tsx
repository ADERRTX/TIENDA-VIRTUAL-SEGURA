import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';
import { http } from '../lib/http';
import { Button } from './ui/Button';
import { Skeleton } from './ui/Skeleton';
import { History, ChevronDown, Clock } from 'lucide-react';

interface TimelineEntry {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  type: string;
  actor?: string;
}

function useTimeline(orderId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['timeline', orderId],
    queryFn: async () => {
      const response = await http<TimelineEntry[]>(`/orders/${orderId}/timeline`);
      return response.data;
    },
    enabled,
  });
}

export default function OrderTimeline({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useTimeline(orderId, open);

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-3">
      <Button
        variant="ghost"
        size="sm"
        className="self-start gap-1.5 text-xs text-ink-muted hover:text-ink px-2 min-h-[36px]"
        onClick={() => setOpen(!open)}
      >
        <History className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{open ? 'Ocultar' : 'Ver'} {i18n.orders.timelineTitle}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180 text-brand' : ''}`} aria-hidden="true" />
      </Button>

      {open && isLoading && (
        <div className="flex flex-col gap-2 pl-4">
          <Skeleton variant="line" className="h-4 w-40" />
          <Skeleton variant="line" className="h-4 w-60" />
        </div>
      )}

      {open && isError && (
        <p className="text-xs text-danger pl-4" role="alert">No se pudo cargar la trazabilidad del pedido.</p>
      )}

      {open && data && data.length === 0 && (
        <p className="text-xs text-ink-muted pl-4">Aún no hay eventos registrados en la bitácora.</p>
      )}

      {open && data && data.length > 0 && (
        <ol className="relative ml-3 flex flex-col gap-4 border-l-2 border-line pl-4 py-2">
          {data.map((entry, idx) => {
            const isLatest = idx === data.length - 1;
            return (
              <li key={entry.id} className="relative flex flex-col gap-0.5 group">
                {/* Nodo circular: activo en brand, completados en success */}
                <span
                  className={`absolute -left-[21px] top-1 flex h-2.5 w-2.5 rounded-full ring-4 ring-surface shadow-sm ${
                    isLatest ? 'bg-brand' : 'bg-success'
                  }`}
                  aria-hidden="true"
                />

                <span className="text-xs font-semibold text-ink leading-tight">
                  {entry.title}
                </span>

                {entry.description && (
                  <span className="text-xs text-ink-muted leading-relaxed">
                    {entry.description}
                  </span>
                )}

                <div className="flex items-center gap-2 text-xs text-ink-muted mt-0.5">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <span>{formatDate(entry.timestamp)}</span>
                  {entry.actor && (
                    <>
                      <span>·</span>
                      <span className="text-ink-muted">Por: {entry.actor}</span>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
