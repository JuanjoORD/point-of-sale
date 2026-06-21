export interface CartItem {
  id_producto: number;
  nombre_producto: string;
  codigo_barras: string | null;
  precio_venta: number;
  es_servicio: boolean;
  cantidad: number;
  /** Stock total disponible; null para servicios. */
  stock_disponible: number | null;
}

export interface CartActionResult {
  ok: boolean;
  error?: string;
}

export interface CreateVentaPayload {
  id_cliente: number;
  id_ubicacion: number;
  descuento_adicional?: number;
  observaciones?: string;
  detalle: {
    id_producto: number;
    cantidad: number;
    precio_unitario?: number;
    descuento_linea?: number;
  }[];
}

export interface VentaDetalleResumen {
  id_producto: number;
  nombre_producto: string;
  cantidad: number;
  total_linea: number;
}

export interface VentaResumen {
  id_venta: number;
  numero_venta: string;
  nombre_cliente: string;
  nombre_ubicacion: string;
  subtotal: number;
  descuento_total: number;
  total: number;
  detalle: VentaDetalleResumen[];
}
