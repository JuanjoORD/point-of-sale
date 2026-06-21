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
