import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../lib/http';
import type { PageMeta } from './seller';

export interface ClaimListItem {
  id: string;
  status: string;
  reason: string;
  createdAt: string;
  claimant?: { fullName?: string };
  subOrder?: { seller?: { storeName: string }; order?: { id: string } };
}

export interface ClaimMessage {
  id: string;
  body: string;
  createdAt: string;
  author?: { id: string; fullName?: string; email?: string; role?: string };
}

export interface ClaimDetail {
  id: string;
  status: string;
  reason: string;
  resolution?: string | null;
  createdAt: string;
  claimantId: string;
  claimant?: { fullName?: string };
  resolvedBy?: { fullName?: string } | null;
  messages: ClaimMessage[];
  subOrder?: { seller?: { storeName: string }; order?: { id: string } };
}

export function useClaims(page: number) {
  return useQuery({
    queryKey: ['claims', page],
    queryFn: async () => {
      const response = await http<ClaimListItem[], PageMeta>(`/claims?page=${page}`);
      return { items: response.data, meta: response.meta };
    },
  });
}

export function useClaim(id: string | undefined) {
  return useQuery({
    queryKey: ['claim', id],
    queryFn: async () => {
      const response = await http<ClaimDetail>(`/claims/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });
}

function useRefreshClaim(id: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['claim', id] });
    void queryClient.invalidateQueries({ queryKey: ['claims'] });
    void queryClient.invalidateQueries({ queryKey: ['orders'] });
  };
}

export function useAddClaimMessage(id: string) {
  const refresh = useRefreshClaim(id);
  return useMutation({
    mutationFn: async (body: string) => {
      const response = await http<unknown>(`/claims/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      return response.data;
    },
    onSuccess: refresh,
  });
}

export function useAppealClaim(id: string) {
  const refresh = useRefreshClaim(id);
  return useMutation({
    mutationFn: async () => {
      const response = await http<unknown>(`/claims/${id}/appeal`, { method: 'POST' });
      return response.data;
    },
    onSuccess: refresh,
  });
}

export function useResolveClaim(id: string) {
  const refresh = useRefreshClaim(id);
  return useMutation({
    mutationFn: async (input: { resolution: string; refundAmount?: number }) => {
      const response = await http<unknown>(`/claims/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return response.data;
    },
    onSuccess: refresh,
  });
}