export interface Cliente {
  id_cliente: number;
  nombre_cliente: string;
  nit: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  es_consumidor_final: boolean;
  activo: boolean;
  usuario_ingreso: string;
  fecha_ingreso: string;
}

export interface ClientePayload {
  nombre_cliente: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface ClienteUpdatePayload extends Partial<ClientePayload> {
  nit?: string | null;
  activo?: boolean;
}
