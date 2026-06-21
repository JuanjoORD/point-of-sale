import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/dashboard.service';
import { VentasDiaFilters } from '../types/dashboard.types';

const QUERY_KEY = ['dashboard', 'ventas-dia'];

export function useVentasDia(filters: VentasDiaFilters) {
  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () =>
      dashboardApi.getVentasDia({
        fecha: filters.fecha || undefined,
        id_ubicacion: filters.id_ubicacion,
      }),
  });
}
