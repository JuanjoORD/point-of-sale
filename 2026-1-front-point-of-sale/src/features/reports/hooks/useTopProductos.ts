import { useQuery } from '@tanstack/react-query';
import { reportesApi } from '../services/reportes.service';
import { TopProductosFilters } from '../types/reports.types';

const hasValidRange = (filters: TopProductosFilters): boolean =>
  Boolean(filters.fecha_inicio && filters.fecha_fin) &&
  filters.fecha_inicio <= filters.fecha_fin;

export function useTopProductosCantidad(filters: TopProductosFilters, enabled = true) {
  return useQuery({
    queryKey: ['reportes', 'top-productos-cantidad', filters],
    queryFn: () => reportesApi.getTopProductosCantidad(filters),
    enabled: enabled && hasValidRange(filters),
  });
}

export function useTopProductosValor(filters: TopProductosFilters, enabled = true) {
  return useQuery({
    queryKey: ['reportes', 'top-productos-valor', filters],
    queryFn: () => reportesApi.getTopProductosValor(filters),
    enabled: enabled && hasValidRange(filters),
  });
}
