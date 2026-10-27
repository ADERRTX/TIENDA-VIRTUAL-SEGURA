import { useState } from 'react';
import { useMarkAllRead, useMarkRead, useNotifications } from '../api/notifications';
import { formatDate } from '../lib/formatters';
import { Button } from './ui/Button';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data } = useNotifications(true);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const unread = data?.unreadCount ?? 0;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notificaciones"
        onClick={() => setOpen(!open)}
        className="relative px-2 text-lg"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 flex max-h-96 w-80 flex-col gap-2 overflow-y-auto rounded-2xl border border-line bg-surface-2 p-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Notificaciones</span>
            {unread > 0 && (
              <Button variant="ghost" size="sm" isLoading={markAll.isPending} onClick={() => markAll.mutate()}>
                Marcar todas
              </Button>
            )}
          </div>
          {data && data.items.length === 0 && (
            <p className="text-sm text-ink-muted">No tienes notificaciones.</p>
          )}
          {data?.items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => !n.readAt && markRead.mutate(n.id)}
              className={`flex flex-col gap-1 rounded-xl border border-line p-2 text-left ${
                n.readAt ? 'opacity-60' : 'border-brand/50'
              }`}
            >
              <span className="text-sm">{n.message}</span>
              <span className="text-xs text-ink-muted">{formatDate(n.createdAt)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}