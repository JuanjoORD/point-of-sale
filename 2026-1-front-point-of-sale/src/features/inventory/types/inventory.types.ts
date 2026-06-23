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

export interface UbicacionAlmacenamiento {
  id_ubicacion_almacenamiento: number;
  estanteria: string;
  fila: string | null;
  caja: string | null;
  descripcion: string | null;
  usuario_ingreso: string;
  fecha_ingreso: string;
}

export interface UbicacionAlmacenamientoPayload {
  estanteria: string;
  fila?: string;
  caja?: string;
  descripcion?: string;
}

export function formatUbicacionAlmacenamiento(row: {
  estanteria: string;
  fila?: string | null;
  caja?: string | null;
}): string {
  const parts: string[] = [`Est. ${row.estanteria}`];
  if (row.fila) parts.push(`Fila ${row.fila}`);
  if (row.caja) parts.push(`Caja ${row.caja}`);
  return parts.join(' / ');
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
  id_ubicacion_almacenamiento: number | null;
  estanteria: string | null;
  fila: string | null;
  caja: string | null;
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
  id_ubicacion_almacenamiento?: number;
}

export interface ProductoUpdatePayload extends Partial<ProductoPayload> {
  codigo_barras?: string | null;
  id_categoria?: number | null;
  id_ubicacion_almacenamiento?: number | null;
  activo?: boolean;
}
