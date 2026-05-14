import apiClient from './client';
import {
  CashDrawerReport,
  DashboardData,
  InventoryReport,
  PaymentMethodReport,
  SalesReport,
  TopCustomer,
  TopProduct,
} from '../types';

export const reportsApi = {
  dashboard: async (): Promise<DashboardData> => {
    const res = await apiClient.get('/reports/dashboard/');
    return res.data;
  },

  sales: async (params: {
    start_date?: string;
    end_date?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<SalesReport[]> => {
    const res = await apiClient.get('/reports/sales/', { params });
    return res.data;
  },

  topProducts: async (params: {
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<TopProduct[]> => {
    const res = await apiClient.get('/reports/top-products/', { params });
    return res.data;
  },

  topCustomers: async (): Promise<TopCustomer[]> => {
    const res = await apiClient.get('/reports/top-customers/');
    return res.data;
  },

  paymentMethods: async (): Promise<PaymentMethodReport[]> => {
    const res = await apiClient.get('/reports/payment-methods/');
    return res.data;
  },

  cashDrawer: async (date?: string): Promise<CashDrawerReport> => {
    const res = await apiClient.get('/reports/cash-drawer/', { params: { date } });
    return res.data;
  },

  inventory: async (): Promise<InventoryReport> => {
    const res = await apiClient.get('/reports/inventory/');
    return res.data;
  },
};
