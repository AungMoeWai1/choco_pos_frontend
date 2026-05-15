import apiClient from './client';
import { LoginResponse, User } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await apiClient.post('/auth/login/', { email, password });
    return res.data;
  },

  logout: async (refresh: string): Promise<void> => {
    await apiClient.post('/auth/logout/', { refresh });
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get('/users/me/');
    return res.data;
  },

  updateMe: async (data: Partial<User>): Promise<User> => {
    const res = await apiClient.patch('/users/me/', data);
    return res.data;
  },

  changePassword: async (data: { old_password: string; new_password: string }): Promise<void> => {
    await apiClient.post('/users/change-password/', data);
  },
};
