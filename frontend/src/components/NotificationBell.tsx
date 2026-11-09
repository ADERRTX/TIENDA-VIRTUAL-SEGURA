import { useState, useRef, useEffect } from 'react';
import { useMarkAllRead, useMarkRead, useNotifications } from '../api/notifications';
import { formatDate } from '../lib/formatters';
import { Button } from './ui/Button';
import { Bell, CheckCheck, Inbox } from 'lucide-react';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data } = useNotifications(true);
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const unread = data?.unreadCount ?? 0;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={`Notificaciones ${unread > 0 ? `(${unread} no leídas)` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-line/60 bg-surface-2/60 text-ink-muted transition-all duration-150 hover:border-line hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1 text-xs font-medium text-brand-ink shadow-sm animate-fade-in">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 flex max-h-[28rem] w-80 sm:w-96 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-lg animate-scale-in">
          {/* Cabecera del popover */}
          <div className="flex items-center justify-between border-b border-line/60 bg-surface-2/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">Notificaciones</span>
              {unread > 0 && (
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand border border-brand/20">
                  {unread} nueva{unread > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {unread > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-brand hover:text-brand-hover px-2 gap-1"
                isLoading={markAll.isPending}
                onClick={() => markAll.mutate()}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </Button>
            )}
          </div>

          {/* Lista scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-line/40 max-h-80">
            {(!data || data.items.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-ink-muted mb-2">
                  <Inbox className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-ink-muted">No tienes notificaciones pendientes.</p>
              </div>
            ) : (
              data.items.map((n) => {
                const isUnread = !n.readAt;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (isUnread) markRead.mutate(n.id);
                    }}
                    className={`w-full flex items-start gap-3 p-3.5 text-left transition-colors duration-150 hover:bg-surface-2/80 ${
                      isUnread ? 'bg-surface-2/40' : 'opacity-70'
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        isUnread ? 'bg-brand' : 'bg-transparent'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-ink leading-relaxed font-normal break-words">
                        {n.message}
                      </p>
                      <span className="mt-1 block text-xs text-ink-muted">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
