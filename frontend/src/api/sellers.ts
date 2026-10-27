import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, http } from '../lib/http';
import type { PageMeta } from './seller';

export type SellerStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export interface SellerProfile {
  id: string;
  storeName: string;
  description?: string | null;
  status: SellerStatus;
  user?: { fullName?: string; email?: string } | null;
}

export function useMySeller(enabled: boolean) {
  return useQuery({
    queryKey: ['my-seller'],
    queryFn: async (): Promise<SellerProfile | null> => {
      try {
        const response = await http<SellerProfile>('/sellers/me');
        return response.data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled,
    retry: false,
  });
}

export function useApplySeller() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { storeName: string; description?: string }) => {
      const response = await http<SellerProfile>('/sellers/apply', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-seller'] });
    },
  });
}

export function useAdminSellers(status: string, page: number) {
  return useQuery({
    queryKey: ['admin-sellers', status, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set('status', status);
      const response = await http<SellerProfile[], PageMeta>(`/admin/sellers?${params}`);
      return { items: response.data, meta: response.meta };
    },
  });
}

export function useAdminSellerAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      action: 'approve' | 'reject' | 'suspend';
      reason?: string;
    }) => {
      const response = await http<SellerProfile>(`/admin/sellers/${input.id}/${input.action}`, {
        method: 'PATCH',
        ...(input.action === 'approve' ? {} : { body: JSON.stringify({ reason: input.reason }) }),
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
    },
  });
}