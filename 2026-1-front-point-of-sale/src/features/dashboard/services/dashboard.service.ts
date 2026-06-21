import apiClient from '@/services/apiClient';
import { ApiResponse } from '@/shared/types/api.types';
import { VentasDiaFilters, VentasDiaResponse } from '../types/dashboard.types';

export const dashboardApi = {
  getVentasDia: async (params?: VentasDiaFilters) => {
    const { data } = await apiClient.get<ApiResponse<VentasDiaResponse>>('/dashboard/ventas-dia', {
      params,
    });
    return data.data;
  },
};
