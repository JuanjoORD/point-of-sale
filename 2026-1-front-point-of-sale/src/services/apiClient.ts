import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const refreshClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request: adjuntar access token ───────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('pos_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: manejar 401 (token expirado/inválido) ──────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | null;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('pos_refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await refreshClient.post('/auth/refresh', {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token, user } = refreshResponse.data as {
            access_token: string;
            refresh_token: string;
            user: unknown;
          };

          localStorage.setItem('pos_access_token', access_token);
          localStorage.setItem('pos_refresh_token', refresh_token);
          localStorage.setItem('pos_user', JSON.stringify(user));

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch {
          // Si refresh falla, se fuerza cierre de sesión.
        }
      }

      // Limpiar sesión y redirigir al login
      localStorage.removeItem('pos_access_token');
      localStorage.removeItem('pos_refresh_token');
      localStorage.removeItem('pos_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
