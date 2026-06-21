import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { productosApi } from '../services/productos.service';
import { Producto, ProductoPayload, ProductoUpdatePayload } from '../types/inventory.types';

const QUERY_KEY = ['productos'];

export function useProductos(search = '', includeInactive = false) {
  return useQuery({
    queryKey: [...QUERY_KEY, search, includeInactive],
    queryFn: () =>
      productosApi.list({
        page: 1,
        limit: 100,
        search: search || undefined,
        todos: includeInactive,
      }),
  });
}

export function useProductoMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const create = useMutation({
    mutationFn: (payload: ProductoPayload) => productosApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoUpdatePayload }) =>
      productosApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => productosApi.remove(id),
    onSuccess: invalidate,
  });

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      return (error.response?.data as { error?: string })?.error ?? 'Error al guardar el producto.';
    }
    return 'Error al guardar el producto.';
  };

  return { create, update, remove, getErrorMessage };
}

export type { Producto };
