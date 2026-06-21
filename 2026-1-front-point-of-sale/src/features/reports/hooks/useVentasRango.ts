import { useQuery } from '@tanstack/react-query';
import { reportesApi } from '../services/reportes.service';
import { VentasRangoFilters } from '../types/reports.types';

const QUERY_KEY = ['reportes', 'ventas'];

export function useVentasRango(filters: VentasRangoFilters, enabled = true) {
  const hasValidRange =
    Boolean(filters.fecha_inicio && filters.fecha_fin) &&
    filters.fecha_inicio <= filters.fecha_fin;

  return useQuery({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => reportesApi.getVentasRango(filters),
    enabled: enabled && hasValidRange,
  });
}
