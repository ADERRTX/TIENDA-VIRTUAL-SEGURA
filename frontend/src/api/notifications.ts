import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../lib/http';

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export function useNotifications(enabled: boolean) {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = (await http<AppNotification[]>('/notifications')) as unknown as {
        data: AppNotification[];
        unreadCount?: number;
      };
      const items = response.data ?? [];
      return {
        items,
        unreadCount: response.unreadCount ?? items.filter((n) => !n.readAt).length,
      };
    },
    enabled,
    refetchInterval: 30_000,
  });
}

function useRefresh() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };
}

export function useMarkRead() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => http<unknown>(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: refresh,
  });
}

export function useMarkAllRead() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: () => http<unknown>('/notifications/read-all', { method: 'PATCH' }),
    onSuccess: refresh,
  });
}