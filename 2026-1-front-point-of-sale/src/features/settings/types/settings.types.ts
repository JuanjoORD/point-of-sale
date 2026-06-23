export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  activo: boolean;
  ultimo_login: string | null;
  roles: string[];
  es_usuario_sistema?: boolean;
}

export interface RolDisponible {
  id_rol: number;
  nombre_rol: string;
  descripcion: string | null;
}

export interface UsuarioPayload {
  nombre: string;
  email: string;
  password?: string;
  activo?: boolean;
  roles: number[];
}

export interface Rol {
  id_rol: number;
  nombre_rol: string;
  descripcion: string | null;
  permisos: string[];
}

export interface Permiso {
  id_permiso: number;
  codigo_permiso: string;
  descripcion: string | null;
}

export interface RolPayload {
  nombre_rol: string;
  descripcion?: string;
  permisos: number[];
}

export interface ProfilePayload {
  nombre?: string;
  password?: string;
}
