import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { rolesApi } from '../services/roles.service';
import { RolPayload } from '../types/settings.types';

const QUERY_KEY = ['roles'];

export function useRoles() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => rolesApi.list({ page: 1, limit: 100 }),
  });
}

export function usePermisos(enabled = true) {
  return useQuery({
    queryKey: ['permisos'],
    queryFn: () => rolesApi.getPermisos(),
    enabled,
  });
}

export function useRolMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      return (error.response?.data as { error?: string })?.error ?? 'Error al guardar el rol.';
    }
    return 'Error al guardar el rol.';
  };

  const create = useMutation({
    mutationFn: (payload: RolPayload) => rolesApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RolPayload> }) =>
      rolesApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => rolesApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove, getErrorMessage };
}
