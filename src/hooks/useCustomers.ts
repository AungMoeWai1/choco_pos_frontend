import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi, CustomerFilters } from '../api/customers';
import { Customer } from '../types';

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersApi.list(filters),
  });
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.get(id),
    enabled: !!id,
  });
}

export function useCustomerPurchaseHistory(id: number) {
  return useQuery({
    queryKey: ['customer', id, 'purchases'],
    queryFn: () => customersApi.purchaseHistory(id),
    enabled: !!id,
  });
}

export function useCustomerLoyaltyHistory(id: number) {
  return useQuery({
    queryKey: ['customer', id, 'loyalty'],
    queryFn: () => customersApi.loyaltyHistory(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Customer>) => customersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) =>
      customersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useAdjustLoyalty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, points, reason }: { id: number; points: number; reason: string }) =>
      customersApi.adjustLoyalty(id, points, reason),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['customer', id] });
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
