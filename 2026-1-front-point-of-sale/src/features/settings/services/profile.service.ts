import apiClient from '@/services/apiClient';
import { AuthUser } from '@/auth/contexts/AuthContext';
import { ProfilePayload } from '../types/settings.types';

export const profileApi = {
  update: async (payload: ProfilePayload) => {
    const { data } = await apiClient.put<{ user: AuthUser; message?: string }>(
      '/auth/perfil',
      payload,
    );
    return data.user;
  },
};
