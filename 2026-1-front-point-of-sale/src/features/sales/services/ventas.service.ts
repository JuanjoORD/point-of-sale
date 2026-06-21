import apiClient from '@/services/apiClient';
import { CreateVentaPayload, VentaResumen } from '../types/sales.types';

export const ventasApi = {
  create: async (payload: CreateVentaPayload) => {
    const { data } = await apiClient.post<{ data: VentaResumen; message?: string }>(
      '/ventas',
      payload,
    );
    return data.data;
  },
};
