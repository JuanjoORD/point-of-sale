import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '../../services/apiClient';

export interface AuthUser {
  id_usuario: number;
  nombre: string;
  email: string;
  permisos: string[];
  es_gestor_seguridad?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permiso: string) => boolean;
  /** Permiso RBAC o flag es_gestor_seguridad (gestion usuarios/roles). */
  canManageSecurity: (permiso: string) => boolean;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

interface ProfileResponse {
  user: AuthUser;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('pos_user');
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    localStorage.setItem('pos_access_token', data.access_token);
    localStorage.setItem('pos_refresh_token', data.refresh_token);
    localStorage.setItem('pos_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Si el token ya expiró, de todas formas se limpia sesión local.
    }

    setUser(null);
    localStorage.removeItem('pos_user');
    localStorage.removeItem('pos_access_token');
    localStorage.removeItem('pos_refresh_token');
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('pos_access_token');
    if (!token) return;

    const loadProfile = async (): Promise<void> => {
      try {
        const { data } = await apiClient.get<ProfileResponse>('/auth/perfil');
        setUser(data.user);
        localStorage.setItem('pos_user', JSON.stringify(data.user));
      } catch {
        setUser(null);
        localStorage.removeItem('pos_user');
        localStorage.removeItem('pos_access_token');
        localStorage.removeItem('pos_refresh_token');
      }
    };

    loadProfile().catch(() => {
      // Estado manejado dentro de loadProfile.
    });
  }, []);

  const hasPermission = useCallback(
    (permiso: string): boolean => {
      if (!user) return false;
      return user.permisos.includes(permiso);
    },
    [user],
  );

  const canManageSecurity = useCallback(
    (permiso: string): boolean => {
      if (!user) return false;
      if (user.es_gestor_seguridad) return true;
      return user.permisos.includes(permiso);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, hasPermission, canManageSecurity }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
