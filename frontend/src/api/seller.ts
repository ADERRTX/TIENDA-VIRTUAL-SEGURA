import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../lib/http';

export interface SellerOrderItem {
  id: string;
  name: string;
  unitPrice: number; // céntimos
  quantity: number;
}

export interface SellerSubOrder {
  id: string;
  status: string;
  createdAt: string;
  order: {
    id: string;
    buyer: { fullName: string; email: string };
    address: { label: string; line1: string; city: string; province: string };
  };
  items: SellerOrderItem[];
  custody: { amount: number; status: string } | null;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
}

export function useSellerOrders(page: number) {
  return useQuery({
    queryKey: ['seller-orders', page],
    queryFn: async () => {
      const response = await http<SellerSubOrder[], PageMeta>(`/seller/orders?page=${page}`);
      return { items: response.data, meta: response.meta };
    },
  });
}

export function useSellerAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; action: 'confirm' | 'prepare' }) => {
      const response = await http<unknown>(`/seller/orders/${input.id}/${input.action}`, {
        method: 'POST',
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    },
  });
}

export function useDispatchOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      carrier: string;
      trackingCode: string;
      estimatedDate: string; // ISO datetime
    }) => {
      const { id, ...body } = input;
      const response = await http<unknown>(`/seller/orders/${id}/dispatch`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    },
  });
}