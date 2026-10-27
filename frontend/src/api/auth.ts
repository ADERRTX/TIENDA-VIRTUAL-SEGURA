import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, http } from '../lib/http';

export type UserRole = 'BUYER' | 'SELLER' | 'SUPPORT' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await http<User>('/auth/me');
        return response.data;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      http<unknown>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      http<unknown>('/auth/register', { method: 'POST', body: JSON.stringify(input) }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => http<unknown>('/auth/logout', { method: 'POST' }),
    onSuccess: () => queryClient.setQueryData(['me'], null),
  });
}