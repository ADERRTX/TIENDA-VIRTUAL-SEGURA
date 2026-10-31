import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../lib/http';
import type { PageMeta } from './seller';

export interface Category {
  id: string;
  name: string;
}

export interface SellerProductVariant {
  id: string;
  name: string;
  price: number; // céntimos
  stock: number;
}

export interface SellerProductImage {
  id: string;
  fileName: string;
  isMain: boolean;
}

export interface SellerProduct {
  id: string;
  title: string;
  description: string;
  status: string;
  category?: { id: string; name: string };
  variants: SellerProductVariant[];
  images: SellerProductImage[];
}

export interface CreateProductInput {
  categoryId: string;
  title: string;
  description: string;
  variantName: string;
  price: number; // céntimos
  stock: number;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await http<Category[]>('/categories');
      return response.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useSellerProducts(page: number) {
  return useQuery({
    queryKey: ['seller-products', page],
    queryFn: async () => {
      const response = await http<SellerProduct[], PageMeta>(`/seller/products?page=${page}`);
      return { items: response.data, meta: response.meta };
    },
  });
}

function useRefreshProducts() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    void queryClient.invalidateQueries({ queryKey: ['products'] });
  };
}

export function useCreateProduct() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      const response = await http<SellerProduct>('/seller/products', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return response.data;
    },
    onSuccess: refresh,
  });
}

export function useDeleteProduct() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await http<{ ok: boolean }>(`/seller/products/${productId}`, {
        method: 'DELETE',
      });
      return response.data;
    },
    onSuccess: refresh,
  });
}

export function useUploadImage() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: async (input: { productId: string; file: File }) => {
      const body = new FormData();
      body.append('file', input.file);
      const response = await http<SellerProductImage>(
        `/seller/products/${input.productId}/images`,
        { method: 'POST', body },
      );
      return response.data;
    },
    onSuccess: refresh,
  });
}

export function useDeleteImage() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: async (input: { productId: string; imageId: string }) => {
      const response = await http<{ ok: boolean }>(
        `/seller/products/${input.productId}/images/${input.imageId}`,
        { method: 'DELETE' },
      );
      return response.data;
    },
    onSuccess: refresh,
  });
}
export function useUpdateProduct() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: async (input: { id: string; data: { title?: string; description?: string } }) => {
      const response = await http<unknown>(`/seller/products/${input.id}`, {
        method: 'PATCH',
        body: JSON.stringify(input.data),
      });
      return response.data;
    },
    onSuccess: refresh,
  });
}

export function useUpdateVariant() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: async (input: {
      productId: string;
      variantId: string;
      data: { name?: string; price?: number; stock?: number };
    }) => {
      const response = await http<unknown>(
        `/seller/products/${input.productId}/variants/${input.variantId}`,
        { method: 'PATCH', body: JSON.stringify(input.data) },
      );
      return response.data;
    },
    onSuccess: refresh,
  });
}

export function useCreateVariant() {
  const refresh = useRefreshProducts();
  return useMutation({
    mutationFn: async (input: {
      productId: string;
      data: { name: string; price: number; stock: number };
    }) => {
      const response = await http<unknown>(`/seller/products/${input.productId}/variants`, {
        method: 'POST',
        body: JSON.stringify(input.data),
      });
      return response.data;
    },
    onSuccess: refresh,
  });
}