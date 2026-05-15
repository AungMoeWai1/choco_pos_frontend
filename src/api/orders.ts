import apiClient from './client';
import { Order, PaginatedResponse } from '../types';

export interface OrderFilters {
  order_status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
}

export interface CreateOrderPayload {
  customer?: number;
  items: Array<{
    product: number;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    line_total: number;
  }>;
  payments: Array<{
    payment_method: string;
    amount: number;
    reference?: string;
  }>;
  discount_percent?: number;
  discount_amount?: number;
  notes?: string;
}

export const ordersApi = {
  list: async (filters?: OrderFilters): Promise<PaginatedResponse<Order>> => {
    const res = await apiClient.get('/orders/', { params: filters });
    return res.data;
  },

  get: async (id: number): Promise<Order> => {
    const res = await apiClient.get(`/orders/${id}/`);
    return res.data;
  },

  create: async (data: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post('/orders/', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Order>): Promise<Order> => {
    const res = await apiClient.patch(`/orders/${id}/`, data);
    return res.data;
  },

  suspend: async (id: number): Promise<Order> => {
    const res = await apiClient.post(`/orders/${id}/suspend/`);
    return res.data;
  },

  cancel: async (id: number): Promise<Order> => {
    const res = await apiClient.post(`/orders/${id}/cancel/`);
    return res.data;
  },

  suspended: async (): Promise<Order[]> => {
    const res = await apiClient.get('/orders/suspended/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },

  returnOrder: async (
    id: number,
    reason: string,
    items: Array<{ order_item_id: number; quantity: number }>
  ): Promise<Order> => {
    const res = await apiClient.post(`/orders/${id}/return_order/`, { reason, items });
    return res.data;
  },
};
