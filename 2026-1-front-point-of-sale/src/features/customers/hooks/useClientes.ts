import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { clientesApi } from '../services/clientes.service';
import { Cliente, ClientePayload, ClienteUpdatePayload } from '../types/customers.types';

const QUERY_KEY = ['clientes'];

export function useClientes(search = '') {
  return useQuery({
    queryKey: [...QUERY_KEY, search],
    queryFn: () =>
      clientesApi.list({
        page: 1,
        limit: 100,
        search: search || undefined,
      }),
  });
}

export function useClienteMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });

  const create = useMutation({
    mutationFn: (payload: ClientePayload) => clientesApi.create(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ClienteUpdatePayload }) =>
      clientesApi.update(id, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => clientesApi.remove(id),
    onSuccess: invalidate,
  });

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      return (error.response?.data as { error?: string })?.error ?? 'Error al guardar el cliente.';
    }
    return 'Error al guardar el cliente.';
  };

  return { create, update, remove, getErrorMessage };
}

export type { Cliente };
