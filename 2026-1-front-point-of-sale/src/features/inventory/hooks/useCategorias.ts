import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { categoriasApi } from '../services/categorias.service';
import { Categoria, CategoriaPayload } from '../types/inventory.types';

const QUERY_KEY = ['categorias'];

export function useCategorias(search = '') {
  return useQuery({
    queryKey: [...QUERY_KEY, search],
    queryFn: () => categoriasApi.list({ page: 1, limit: 100, search: search || undefined }),
  });
}

export function useCategoriaMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const create = useMutation({
    mutationFn: (payload: CategoriaPayload) => categoriasApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CategoriaPayload> }) =>
      categoriasApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => categoriasApi.remove(id),
    onSuccess: invalidate,
  });

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      return (error.response?.data as { error?: string })?.error ?? 'Error al guardar la categoria.';
    }
    return 'Error al guardar la categoria.';
  };

  return { create, update, remove, getErrorMessage };
}

export type { Categoria };
