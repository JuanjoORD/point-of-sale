export interface VentasRangoFilters {
  fecha_inicio: string;
  fecha_fin: string;
  id_ubicacion?: number;
}

export interface VentasRangoResponse {
  fecha_inicio: string;
  fecha_fin: string;
  id_ubicacion?: number;
  total_ventas: number;
  cantidad_tickets: number;
  ticket_promedio: number;
}

export interface TopProductosFilters {
  fecha_inicio: string;
  fecha_fin: string;
  id_ubicacion?: number;
  limit?: number;
}

export interface TopProducto {
  id_producto: number;
  nombre_producto: string;
  cantidad_vendida: number;
  total_vendido: number;
}

export interface TopProductosResponse {
  fecha_inicio: string;
  fecha_fin: string;
  id_ubicacion?: number;
  data: TopProducto[];
}
