import apiClient from './client';
import { Category, PaginatedResponse, Product, ProductType, StockHistory } from '../types';

export interface ProductFilters {
  category?: number;
  status?: string;
  search?: string;
  page?: number;
}

export const productsApi = {
  list: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const res = await apiClient.get('/products/', { params: filters });
    return res.data;
  },

  get: async (id: number): Promise<Product> => {
    const res = await apiClient.get(`/products/${id}/`);
    return res.data;
  },

  create: async (data: FormData | Partial<Product>): Promise<Product> => {
    const res = await apiClient.post('/products/', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  update: async (id: number, data: FormData | Partial<Product>): Promise<Product> => {
    const res = await apiClient.patch(`/products/${id}/`, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}/`);
  },

  lowStock: async (): Promise<Product[]> => {
    const res = await apiClient.get('/products/low_stock/');
    return res.data;
  },

  byBarcode: async (barcode: string): Promise<Product> => {
    const res = await apiClient.get('/products/by_barcode/', { params: { barcode } });
    return res.data;
  },

  adjustStock: async (
    id: number,
    movement_type: string,
    quantity: number,
    notes?: string
  ): Promise<Product> => {
    const res = await apiClient.post(`/products/${id}/adjust_stock/`, {
      movement_type,
      quantity,
      notes,
    });
    return res.data;
  },

  stockHistory: async (id: number): Promise<StockHistory[]> => {
    const res = await apiClient.get(`/products/${id}/stock_history/`);
    return res.data;
  },

  // Categories
  listCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get('/categories/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    const res = await apiClient.post('/categories/', data);
    return res.data;
  },

  updateCategory: async (id: number, data: Partial<Category>): Promise<Category> => {
    const res = await apiClient.patch(`/categories/${id}/`, data);
    return res.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}/`);
  },

  // Product Types
  listProductTypes: async (): Promise<ProductType[]> => {
    const res = await apiClient.get('/product-types/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },
};
