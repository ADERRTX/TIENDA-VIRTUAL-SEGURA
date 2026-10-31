import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '../lib/http';
import type { PageMeta } from './seller';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
  seller: { id: string; storeName: string; status: string } | null;
}

export interface UserFilters {
  q: string;
  role: string;
  status: string;
}

export function useAdminUsers(filters: UserFilters, page: number) {
  return useQuery({
    queryKey: ['admin-users', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (filters.q) params.set('q', filters.q);
      if (filters.role) params.set('role', filters.role);
      if (filters.status) params.set('status', filters.status);
      const response = await http<AdminUser[], PageMeta>(`/admin/users?${params}`);
      return { items: response.data, meta: response.meta };
    },
  });
}
export interface ConfigEntry {
  key: string;
  value: string;
}

export function useAdminConfig() {
  return useQuery({
    queryKey: ['admin-config'],
    queryFn: async () => {
      const response = await http<ConfigEntry[]>('/admin/config');
      return response.data;
    },
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ConfigEntry) => {
      const response = await http<unknown>('/admin/config', {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-config'] });
    },
  });
}
export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
  actor: { fullName: string; email: string; role: string } | null;
}

export interface AuditFilters {
  entity: string;
  action: string;
}

export function useAuditLog(filters: AuditFilters, page: number) {
  return useQuery({
    queryKey: ['admin-audit', filters, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (filters.entity) params.set('entity', filters.entity);
      if (filters.action) params.set('action', filters.action);
      const response = await http<AuditEntry[], PageMeta>(`/admin/audit?${params}`);
      return { items: response.data, meta: response.meta };
    },
  });
}
export interface SalesReport {
  totalSales: number; // céntimos
  approvedTransactions: number;
  byMonth: { month: string; amount: number }[];
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface ClaimsReport {
  total: number;
  byStatus: StatusCount[];
  byResolution: { resolution?: string; status?: string; count: number }[];
}

export interface TopProduct {
  variantId: string;
  productTitle: string;
  variantName: string;
  quantitySold: number;
  revenue: number; // céntimos
}

export function useReports() {
  return useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const [sales, orders, claims, top] = await Promise.all([
        http<SalesReport>('/admin/reports/sales'),
        http<StatusCount[]>('/admin/reports/orders'),
        http<ClaimsReport>('/admin/reports/claims'),
        http<TopProduct[]>('/admin/reports/top-products'),
      ]);
      return { sales: sales.data, orders: orders.data, claims: claims.data, top: top.data };
    },
  });
}
export function useRunJob() {
  return useMutation({
    mutationFn: async (job?: string) => {
      const response = await http<unknown>('/admin/jobs/run', {
        method: 'POST',
        body: JSON.stringify(job ? { job } : {}),
      });
      return response.data;
    },
  });
}