export interface TopProductoDia {
  id_producto: number;
  nombre_producto: string;
  cantidad_vendida: number;
  total_vendido: number;
}

export interface VentasDiaResponse {
  fecha: string;
  id_ubicacion?: number;
  total_ventas: number;
  cantidad_tickets: number;
  ticket_promedio: number;
  top_productos: TopProductoDia[];
}

export interface VentasDiaFilters {
  fecha?: string;
  id_ubicacion?: number;
}
