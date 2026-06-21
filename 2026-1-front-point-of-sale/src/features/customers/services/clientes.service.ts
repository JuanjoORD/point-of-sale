import apiClient from '@/services/apiClient';
import { PaginatedResponse } from '@/shared/types/api.types';
import { Cliente, ClientePayload, ClienteUpdatePayload } from '../types/customers.types';

export const clientesApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Cliente>>('/clientes', { params });
    return data;
  },

  create: async (payload: ClientePayload) => {
    const { data } = await apiClient.post<{ data: Cliente }>('/clientes', payload);
    return data.data;
  },

  update: async (id: number, payload: ClienteUpdatePayload) => {
    const { data } = await apiClient.put<{ data: Cliente }>(`/clientes/${id}`, payload);
    return data.data;
  },

  remove: async (id: number) => {
    await apiClient.delete(`/clientes/${id}`);
  },
};
