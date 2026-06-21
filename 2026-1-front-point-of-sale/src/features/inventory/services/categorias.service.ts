import apiClient from '@/services/apiClient';
import { PaginatedResponse } from '@/shared/types/api.types';
import { Categoria, CategoriaPayload } from '../types/inventory.types';

export const categoriasApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Categoria>>('/categorias', { params });
    return data;
  },

  create: async (payload: CategoriaPayload) => {
    const { data } = await apiClient.post<{ data: Categoria }>('/categorias', payload);
    return data.data;
  },

  update: async (id: number, payload: Partial<CategoriaPayload>) => {
    const { data } = await apiClient.put<{ data: Categoria }>(`/categorias/${id}`, payload);
    return data.data;
  },

  remove: async (id: number) => {
    await apiClient.delete(`/categorias/${id}`);
  },
};
