import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ubicacionesApi } from '../services/ubicaciones.service';
import { Ubicacion, UbicacionPayload } from '../types/inventory.types';

const QUERY_KEY = ['ubicaciones'];

export function useUbicaciones(search = '', options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...QUERY_KEY, search],
    queryFn: () => ubicacionesApi.list({ page: 1, limit: 100, search: search || undefined }),
    enabled: options?.enabled ?? true,
  });
}

export function useUbicacionMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const create = useMutation({
    mutationFn: (payload: UbicacionPayload) => ubicacionesApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UbicacionPayload> }) =>
      ubicacionesApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => ubicacionesApi.remove(id),
    onSuccess: invalidate,
  });

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      return (error.response?.data as { error?: string })?.error ?? 'Error al guardar la ubicacion.';
    }
    return 'Error al guardar la ubicacion.';
  };

  return { create, update, remove, getErrorMessage };
}

export type { Ubicacion };
