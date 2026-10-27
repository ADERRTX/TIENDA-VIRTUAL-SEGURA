import { useQuery } from '@tanstack/react-query';
import { http } from '../lib/http';

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

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await http<Product[]>('/products');
      return response.data;
    },
  });
}

export function imageUrl(fileName: string): string {
  return `/api/v1/uploads/${encodeURIComponent(fileName)}`;
}

export function mainImage(product: Product): ProductImage | undefined {
  return product.images.find((img) => img.isMain) ?? product.images[0];
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