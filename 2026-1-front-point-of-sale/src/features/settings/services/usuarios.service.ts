import apiClient from '@/services/apiClient';
import { ApiResponse, PaginatedResponse } from '@/shared/types/api.types';
import { RolDisponible, Usuario, UsuarioPayload } from '../types/settings.types';

export const usuariosApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await apiClient.get<PaginatedResponse<Usuario>>('/usuarios', { params });
    return data;
  },

  getRolesDisponibles: async () => {
    const { data } = await apiClient.get<ApiResponse<RolDisponible[]>>('/usuarios/roles-disponibles');
    return data.data;
  },

  create: async (payload: UsuarioPayload & { password: string }) => {
    const { data } = await apiClient.post<ApiResponse<Usuario>>('/usuarios', payload);
    return data.data;
  },

  update: async (id: number, payload: Partial<UsuarioPayload>) => {
    const { data } = await apiClient.put<ApiResponse<Usuario>>(`/usuarios/${id}`, payload);
    return data.data;
  },

  remove: async (id: number) => {
    await apiClient.delete(`/usuarios/${id}`);
  },
};
