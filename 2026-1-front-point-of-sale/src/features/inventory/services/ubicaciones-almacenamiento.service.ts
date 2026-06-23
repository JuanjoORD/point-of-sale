import apiClient from '@/services/apiClient';
import { PaginatedResponse } from '@/shared/types/api.types';
import {
  UbicacionAlmacenamiento,
  UbicacionAlmacenamientoPayload,
} from '../types/inventory.types';

export const ubicacionesAlmacenamientoApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<UbicacionAlmacenamiento>>(
      '/ubicaciones-almacenamiento',
      { params },
    );
    return data;
  },

  create: async (payload: UbicacionAlmacenamientoPayload) => {
    const { data } = await apiClient.post<{ data: UbicacionAlmacenamiento }>(
      '/ubicaciones-almacenamiento',
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: Partial<UbicacionAlmacenamientoPayload>) => {
    const { data } = await apiClient.put<{ data: UbicacionAlmacenamiento }>(
      `/ubicaciones-almacenamiento/${id}`,
      payload,
    );
    return data.data;
  },

  remove: async (id: number) => {
    await apiClient.delete(`/ubicaciones-almacenamiento/${id}`);
  },
};
