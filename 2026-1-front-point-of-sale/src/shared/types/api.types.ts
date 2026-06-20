// ── Respuesta estándar de la API ──────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

// ── Parámetros comunes de listado ─────────────────────────────────────────────
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
}
