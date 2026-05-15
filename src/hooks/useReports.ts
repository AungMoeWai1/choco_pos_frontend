import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

export function useDashboard() {
  return useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: reportsApi.dashboard,
    refetchInterval: 60000,
  });
}

export function useSalesReport(params: {
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
}) {
  return useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: () => reportsApi.sales(params),
  });
}

export function useTopProducts(params: {
  start_date?: string;
  end_date?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['reports', 'top-products', params],
    queryFn: () => reportsApi.topProducts(params),
  });
}

export function useTopCustomers() {
  return useQuery({
    queryKey: ['reports', 'top-customers'],
    queryFn: reportsApi.topCustomers,
  });
}

export function usePaymentMethodsReport() {
  return useQuery({
    queryKey: ['reports', 'payment-methods'],
    queryFn: reportsApi.paymentMethods,
  });
}

export function useCashDrawerReport(date?: string) {
  return useQuery({
    queryKey: ['reports', 'cash-drawer', date],
    queryFn: () => reportsApi.cashDrawer(date),
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: reportsApi.inventory,
  });
}
