import apiClient from '@/services/apiClient';
import { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import { Permiso, Rol, RolPayload } from '../types/settings.types';

export const rolesApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get<PaginatedResponse<Rol>>('/roles', { params });
    return data;
  },

  getPermisos: async () => {
    const { data } = await apiClient.get<ApiResponse<Permiso[]>>('/roles/permisos');
    return data.data;
  },

  create: async (payload: RolPayload) => {
    const { data } = await apiClient.post<ApiResponse<Rol>>('/roles', payload);
    return data.data;
  },

  update: async (id: number, payload: Partial<RolPayload>) => {
    const { data } = await apiClient.put<ApiResponse<Rol>>(`/roles/${id}`, payload);
    return data.data;
  },

  remove: async (id: number) => {
    await apiClient.delete(`/roles/${id}`);
  },
};
