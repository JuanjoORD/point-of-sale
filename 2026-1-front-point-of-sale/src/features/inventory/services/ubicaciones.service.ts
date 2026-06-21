import apiClient from '@/services/apiClient';
import { PaginatedResponse } from '@/shared/types/api.types';
import { Ubicacion, UbicacionPayload } from '../types/inventory.types';

export const ubicacionesApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Ubicacion>>('/ubicaciones', { params });
    return data;
  },

  create: async (payload: UbicacionPayload) => {
    const { data } = await apiClient.post<{ data: Ubicacion }>('/ubicaciones', payload);
    return data.data;
  },

  update: async (id: number, payload: Partial<UbicacionPayload>) => {
    const { data } = await apiClient.put<{ data: Ubicacion }>(`/ubicaciones/${id}`, payload);
    return data.data;
  },

  remove: async (id: number) => {
    await apiClient.delete(`/ubicaciones/${id}`);
  },
};
