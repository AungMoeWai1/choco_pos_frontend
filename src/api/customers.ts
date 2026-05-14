import apiClient from './client';
import { Customer, LoyaltyHistory, Order, PaginatedResponse } from '../types';

export interface CustomerFilters {
  is_active?: boolean;
  loyalty_tier?: string;
  search?: string;
  page?: number;
}

export const customersApi = {
  list: async (filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> => {
    const res = await apiClient.get('/customers/', { params: filters });
    return res.data;
  },

  get: async (id: number): Promise<Customer> => {
    const res = await apiClient.get(`/customers/${id}/`);
    return res.data;
  },

  create: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await apiClient.post('/customers/', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
    const res = await apiClient.patch(`/customers/${id}/`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}/`);
  },

  purchaseHistory: async (id: number): Promise<Order[]> => {
    const res = await apiClient.get(`/customers/${id}/purchase_history/`);
    return res.data;
  },

  loyaltyHistory: async (id: number): Promise<LoyaltyHistory[]> => {
    const res = await apiClient.get(`/customers/${id}/loyalty_history/`);
    return res.data;
  },

  adjustLoyalty: async (id: number, points: number, reason: string): Promise<Customer> => {
    const res = await apiClient.post(`/customers/${id}/adjust_loyalty/`, { points, reason });
    return res.data;
  },
};
