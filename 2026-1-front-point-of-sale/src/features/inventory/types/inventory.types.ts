export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion: string | null;
  usuario_ingreso: string;
  fecha_ingreso: string;
}

export interface Ubicacion {
  id_ubicacion: number;
  nombre_ubicacion: string;
  descripcion: string | null;
  usuario_ingreso: string;
  fecha_ingreso: string;
}

export interface CategoriaPayload {
  nombre_categoria: string;
  descripcion?: string;
}

export interface UbicacionPayload {
  nombre_ubicacion: string;
  descripcion?: string;
}

export interface Producto {
  id_producto: number;
  nombre_producto: string;
  descripcion: string | null;
  codigo_barras: string | null;
  precio_costo: number;
  precio_venta: number;
  es_servicio: boolean;
  id_categoria: number | null;
  nombre_categoria: string | null;
  activo: boolean;
  usuario_ingreso: string;
  fecha_ingreso: string;
}

export interface ProductoPayload {
  nombre_producto: string;
  descripcion?: string;
  codigo_barras?: string;
  precio_costo: number;
  precio_venta: number;
  es_servicio?: boolean;
  id_categoria?: number;
}

export interface ProductoUpdatePayload extends Partial<ProductoPayload> {
  codigo_barras?: string | null;
  id_categoria?: number | null;
  activo?: boolean;
}
