import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../lib/http';

export interface OrderItem {
  id: string;
  name: string;
  unitPrice: number; // céntimos
  quantity: number;
}

export interface SubOrder {
  id: string;
  status: string;
  seller: { id: string; storeName: string };
  items: OrderItem[];
  shipment: unknown;
}

export interface MyOrder {
  id: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  subOrders: SubOrder[];
  address: { label: string; line1: string; city: string; province: string };
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await http<MyOrder[]>('/orders');
      return response.data;
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await http<unknown>(`/orders/${orderId}/cancel`, { method: 'POST' });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useConfirmDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subOrderId: string) => {
      const response = await http<unknown>(`/orders/${subOrderId}/confirm-delivery`, {
        method: 'POST',
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { orderItemId: string; stars: number; comment?: string }) => {
      const response = await http<unknown>('/reviews', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useCreateClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subOrderId: string; reason: string }) => {
      const response = await http<unknown>('/claims', {
        method: 'POST',
        body: JSON.stringify({ ...input, evidence: [] }),
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['claims'] });
    },
  });
}