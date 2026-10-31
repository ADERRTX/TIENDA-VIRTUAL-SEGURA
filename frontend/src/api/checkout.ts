import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../lib/http';

export interface Address {
  id: string;
  label: string;
  line1: string;
  city: string;
  province: string;
  country: string;
  isDefault: boolean;
}

export interface NewAddress {
  label: string;
  line1: string;
  city: string;
  province: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  [key: string]: unknown;
}

export type PaymentResult = Record<string, unknown>;

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await http<Address[]>('/users/addresses');
      return response.data;
    },
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewAddress) => {
      const response = await http<Address>('/users/addresses', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (addressId: string) => {
      const response = await http<Order>('/orders', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({ addressId }),
      });
      return response.data;
    },
  });
}

export function usePay() {
  return useMutation({
    mutationFn: async (input: { orderId: string; token: string }) => {
      const response = await http<PaymentResult>('/payments', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return response.data;
    },
  });
}
export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; data: Partial<NewAddress> }) => {
      const response = await http<Address>(`/users/addresses/${input.id}`, {
        method: 'PATCH',
        body: JSON.stringify(input.data),
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await http<unknown>(`/users/addresses/${id}`, { method: 'DELETE' });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}