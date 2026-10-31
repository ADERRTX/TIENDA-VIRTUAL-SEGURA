import { useQuery } from '@tanstack/react-query';
import { http } from '../lib/http';
import type { PageMeta } from './seller';

export interface ProductVariant {
  id: string;
  name: string;
  price: number; // céntimos
  stock: number;
}

export interface ProductImage {
  id: string;
  fileName: string;
  isMain: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  variants: ProductVariant[];
  images: ProductImage[];
  seller: { id: string; storeName: string };
  category: { id: string; name: string };
}

export function imageUrl(fileName: string): string {
  return `/api/v1/uploads/${encodeURIComponent(fileName)}`;
}

export function mainImage(product: Product): ProductImage | undefined {
  return product.images.find((img) => img.isMain) ?? product.images[0];
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

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const response = await http<Product>(`/products/${id}`);
      return response.data;
    },
    enabled: Boolean(id),
  });
}

export interface ProductFilters {
  q: string;
  categoryId: string;
  inStock: boolean;
}

export function useProductSearch(filters: ProductFilters, page: number) {
  return useQuery({
    queryKey: ['products', 'search', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), pageSize: '12' });
      if (filters.q) params.set('q', filters.q);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.inStock) params.set('inStock', 'true');
      const response = await http<Product[], PageMeta>(`/products?${params}`);
      return { items: response.data, meta: response.meta };
    },
  });
}

export interface ProductReview {
  id: string;
  stars: number;
  comment?: string | null;
  createdAt: string;
  user?: { fullName?: string } | null;
}

export interface ProductReviews {
  items: ProductReview[];
  average: number | null;
  count: number;
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const response = await http<ProductReviews>(`/products/${productId}/reviews`);
      return response.data;
    },
    enabled: Boolean(productId),
  });
}