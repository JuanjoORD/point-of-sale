import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ubicacionesAlmacenamientoApi } from '../services/ubicaciones-almacenamiento.service';
import {
  UbicacionAlmacenamiento,
  UbicacionAlmacenamientoPayload,
} from '../types/inventory.types';

const QUERY_KEY = ['ubicaciones-almacenamiento'];

export function useUbicacionesAlmacenamiento(search = '', options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...QUERY_KEY, search],
    queryFn: () =>
      ubicacionesAlmacenamientoApi.list({ page: 1, limit: 200, search: search || undefined }),
    enabled: options?.enabled ?? true,
  });
}

export function useUbicacionAlmacenamientoMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const create = useMutation({
    mutationFn: (payload: UbicacionAlmacenamientoPayload) =>
      ubicacionesAlmacenamientoApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UbicacionAlmacenamientoPayload> }) =>
      ubicacionesAlmacenamientoApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => ubicacionesAlmacenamientoApi.remove(id),
    onSuccess: invalidate,
  });

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      return (
        (error.response?.data as { error?: string })?.error ??
        'Error al guardar la ubicacion de almacenamiento.'
      );
    }
    return 'Error al guardar la ubicacion de almacenamiento.';
  };

  return { create, update, remove, getErrorMessage };
}

export type { UbicacionAlmacenamiento };
