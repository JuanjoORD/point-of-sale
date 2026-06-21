import apiClient from '@/services/apiClient';
import { ApiResponse } from '@/shared/types/api.types';
import { VentasRangoFilters, VentasRangoResponse } from '../types/reports.types';

export const reportesApi = {
  getVentasRango: async (params: VentasRangoFilters) => {
    const { data } = await apiClient.get<ApiResponse<VentasRangoResponse>>('/reportes/ventas', {
      params,
    });
    return data.data;
  },
};
