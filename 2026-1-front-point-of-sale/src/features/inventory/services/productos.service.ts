import apiClient from '@/services/apiClient';
import { PaginatedResponse } from '@/shared/types/api.types';
import { Producto, ProductoPayload, ProductoUpdatePayload } from '../types/inventory.types';

export const productosApi = {
  list: async (params?: { page?: number; limit?: number; search?: string; todos?: boolean }) => {
    const { data } = await apiClient.get<PaginatedResponse<Producto>>('/productos', {
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        todos: params?.todos ? '1' : undefined,
      },
    });
    return data;
  },

  create: async (payload: ProductoPayload) => {
    const { data } = await apiClient.post<{ data: Producto }>('/productos', payload);
    return data.data;
  },

  update: async (id: number, payload: ProductoUpdatePayload) => {
    const { data } = await apiClient.put<{ data: Producto }>(`/productos/${id}`, payload);
    return data.data;
  },

  remove: async (id: number) => {
    await apiClient.delete(`/productos/${id}`);
  },

  buscar: async (q: string) => {
    const { data } = await apiClient.get<{ data: Producto[] }>('/productos/buscar', { params: { q } });
    return data.data;
  },
};
