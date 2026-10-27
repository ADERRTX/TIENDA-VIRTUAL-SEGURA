import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { i18n } from '../i18n/es';
import { formatDate } from '../lib/formatters';
import { http } from '../lib/http';
import { Button } from './ui/Button';

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
    <div className="flex flex-col gap-2 border-t border-line pt-3">
      <Button variant="ghost" size="sm" className="self-start" onClick={() => setOpen(!open)}>
        {open ? 'Ocultar' : 'Ver'} {i18n.orders.timelineTitle}
      </Button>

      {open && isLoading && <div className="h-12 animate-pulse rounded-xl bg-bg" />}
      {open && isError && <p className="text-sm text-ink-muted">{i18n.common.error}</p>}
      {open && data && data.length === 0 && (
        <p className="text-sm text-ink-muted">Aún no hay eventos.</p>
      )}

      {open && data && data.length > 0 && (
        <ol className="flex flex-col gap-3 border-l border-line pl-4">
          {data.map((entry) => (
            <li key={entry.id} className="flex flex-col">
              <span className="text-sm font-semibold">{entry.title}</span>
              {entry.description && (
                <span className="text-xs text-ink-muted">{entry.description}</span>
              )}
              <span className="text-xs text-ink-muted">
                {formatDate(entry.timestamp)}
                {entry.actor ? ` · ${entry.actor}` : ''}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}