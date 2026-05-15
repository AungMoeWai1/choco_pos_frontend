import apiClient from './client';
import { Payment, PaginatedResponse } from '../types';

export const paymentsApi = {
  list: async (): Promise<PaginatedResponse<Payment>> => {
    const res = await apiClient.get('/payments/');
    return res.data;
  },

  get: async (id: number): Promise<Payment> => {
    const res = await apiClient.get(`/payments/${id}/`);
    return res.data;
  },

  create: async (data: Partial<Payment>): Promise<Payment> => {
    const res = await apiClient.post('/payments/', data);
    return res.data;
  },
};
