import { useQuery } from '@tanstack/react-query';
import { productosApi } from '@/features/inventory/services/productos.service';

export function useProductSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['productos', 'buscar', trimmed],
    queryFn: () => productosApi.buscar(trimmed),
    enabled: trimmed.length >= 1,
  });
}
