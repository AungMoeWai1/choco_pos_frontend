import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, OrderFilters, CreateOrderPayload } from '../api/orders';

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.list(filters),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

export function useSuspendedOrders() {
  return useQuery({
    queryKey: ['orders', 'suspended'],
    queryFn: ordersApi.suspended,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderPayload) => ordersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useSuspendOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersApi.suspend(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useReturnOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      reason,
      items,
    }: {
      id: number;
      reason: string;
      items: Array<{ order_item_id: number; quantity: number }>;
    }) => ordersApi.returnOrder(id, reason, items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
