import apiClient from '@/services/apiClient';
import { PaginatedResponse } from '@/shared/types/api.types';

interface InventarioRow {
  cantidad_actual: number;
}

export const inventarioApi = {
  getTotalStock: async (id_producto: number): Promise<number> => {
    const { data } = await apiClient.get<PaginatedResponse<InventarioRow>>('/inventario', {
      params: { id_producto, limit: 100 },
    });
    return data.data.reduce((sum, row) => sum + Number(row.cantidad_actual), 0);
  },
};
