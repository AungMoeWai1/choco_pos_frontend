import apiClient from './client';
import { Shift, Store, Terminal, User } from '../types';

export const settingsApi = {
  // Store
  getStores: async (): Promise<Store[]> => {
    const res = await apiClient.get('/stores/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },

  createStore: async (data: Partial<Store>): Promise<Store> => {
    const res = await apiClient.post('/stores/', data);
    return res.data;
  },

  updateStore: async (id: number, data: Partial<Store>): Promise<Store> => {
    const res = await apiClient.patch(`/stores/${id}/`, data);
    return res.data;
  },

  // Terminals
  getTerminals: async (): Promise<Terminal[]> => {
    const res = await apiClient.get('/terminals/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },

  createTerminal: async (data: Partial<Terminal>): Promise<Terminal> => {
    const res = await apiClient.post('/terminals/', data);
    return res.data;
  },

  // Shifts
  getShifts: async (): Promise<Shift[]> => {
    const res = await apiClient.get('/shifts/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },

  getCurrentShift: async (): Promise<Shift | null> => {
    try {
      const res = await apiClient.get('/shifts/current/');
      return res.data;
    } catch {
      return null;
    }
  },

  openShift: async (data: { opening_balance: number; terminal?: number }): Promise<Shift> => {
    const res = await apiClient.post('/shifts/', data);
    return res.data;
  },

  closeShift: async (id: number, closing_balance: number): Promise<Shift> => {
    const res = await apiClient.post(`/shifts/${id}/close/`, { closing_balance });
    return res.data;
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get('/users/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },

  createUser: async (data: Partial<User> & { password: string }): Promise<User> => {
    const res = await apiClient.post('/users/', data);
    return res.data;
  },

  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const res = await apiClient.patch(`/users/${id}/`, data);
    return res.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/users/${id}/`);
  },
};
