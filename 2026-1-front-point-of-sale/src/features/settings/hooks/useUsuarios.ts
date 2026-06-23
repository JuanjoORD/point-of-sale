import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { usuariosApi } from '../services/usuarios.service';
import { UsuarioPayload } from '../types/settings.types';

const QUERY_KEY = ['usuarios'];

export function useUsuarios(search = '') {
  return useQuery({
    queryKey: [...QUERY_KEY, search],
    queryFn: () => usuariosApi.list({ page: 1, limit: 100, search: search || undefined }),
  });
}

export function useRolesDisponibles(enabled = true) {
  return useQuery({
    queryKey: ['roles-disponibles'],
    queryFn: () => usuariosApi.getRolesDisponibles(),
    enabled,
  });
}

export function useUsuarioMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      return (error.response?.data as { error?: string })?.error ?? 'Error al guardar el usuario.';
    }
    return 'Error al guardar el usuario.';
  };

  const create = useMutation({
    mutationFn: (payload: UsuarioPayload & { password: string }) => usuariosApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UsuarioPayload> }) =>
      usuariosApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => usuariosApi.remove(id),
    onSuccess: invalidate,
  });

  return { create, update, remove, getErrorMessage };
}
