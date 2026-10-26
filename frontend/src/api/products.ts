import { useQuery } from '@tanstack/react-query';
import { http } from '../lib/http';

export interface ProductVariant {
  id: string;
  name: string;
  price: number; // céntimos
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  variants: ProductVariant[];
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await http<Product[]>('/products');
      return response.data;
    },
  });
}