import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../lib/http';

export interface CartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  variantName: string;
  price: number; // céntimos
  stock: number;
  quantity: number;
  total: number;
  image: string | null; // fileName
}

export interface CartGroup {
  sellerId: string;
  storeName: string;
  subtotal: number;
  items: CartItem[];
}

export interface Cart {
  groups: CartGroup[];
  total: number;
  totalItems: number;
  warnings: string[];
}

export function useCart(enabled: boolean) {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await http<Cart>('/cart');
      return response.data;
    },
    enabled,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { variantId: string; quantity: number }) =>
      http<Cart>('/cart/items', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { variantId: string; quantity: number }) =>
      http<Cart>(`/cart/items/${input.variantId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: input.quantity }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) =>
      http<Cart>(`/cart/items/${variantId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
}
