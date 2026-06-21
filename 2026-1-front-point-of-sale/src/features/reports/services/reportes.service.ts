import apiClient from '@/services/apiClient';
import { ApiResponse } from '@/shared/types/api.types';
import {
  TopProductosFilters,
  TopProductosResponse,
  VentasRangoFilters,
  VentasRangoResponse,
} from '../types/reports.types';

export const reportesApi = {
  getVentasRango: async (params: VentasRangoFilters) => {
    const { data } = await apiClient.get<ApiResponse<VentasRangoResponse>>('/reportes/ventas', {
      params,
    });
    return data.data;
  },

  getTopProductosCantidad: async (params: TopProductosFilters) => {
    const { data } = await apiClient.get<ApiResponse<TopProductosResponse>>(
      '/reportes/top-productos-cantidad',
      { params },
    );
    return data.data;
  },

  getTopProductosValor: async (params: TopProductosFilters) => {
    const { data } = await apiClient.get<ApiResponse<TopProductosResponse>>(
      '/reportes/top-productos-valor',
      { params },
    );
    return data.data;
  },
};
