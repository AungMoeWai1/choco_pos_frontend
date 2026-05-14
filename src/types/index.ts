export interface User {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  full_name: string;
  is_active?: boolean;
  phone?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Customer {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address?: string;
  loyalty_points: number;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_spent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyHistory {
  id: number;
  customer: number;
  points: number;
  reason: string;
  created_at: string;
}

export interface ProductType {
  id: number;
  name: string;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  product_type?: number;
  product_type_name?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  category: number;
  category_name?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface StockHistory {
  id: number;
  product: number;
  movement_type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface OrderItem {
  id?: number;
  product: number;
  product_name?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  line_total: number;
}

export interface Payment {
  id?: number;
  payment_method: 'cash' | 'card' | 'kbzpay' | 'wavepay';
  amount: number;
  reference?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer?: number;
  customer_name?: string;
  cashier?: number;
  cashier_name?: string;
  items: OrderItem[];
  payments: Payment[];
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  amount_paid: number;
  change_amount: number;
  notes?: string;
  order_status: 'pending' | 'completed' | 'suspended' | 'cancelled' | 'returned';
  payment_status: 'unpaid' | 'paid' | 'partial' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  today_revenue: number;
  today_orders: number;
  monthly_revenue: number;
  total_customers: number;
  low_stock_count: number;
  recent_orders?: Order[];
}

export interface SalesReport {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  total_revenue: number;
  total_quantity: number;
}

export interface TopCustomer {
  customer_id: number;
  customer_name: string;
  total_spent: number;
  order_count: number;
}

export interface PaymentMethodReport {
  payment_method: string;
  total_amount: number;
  count: number;
}

export interface CashDrawerReport {
  date: string;
  opening_balance: number;
  cash_sales: number;
  cash_refunds: number;
  closing_balance: number;
}

export interface InventoryReport {
  total_products: number;
  total_stock_value: number;
  low_stock_products: Product[];
  out_of_stock_products: Product[];
  all_products: Product[];
}

export interface Store {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_rate: number;
  currency: string;
  logo?: string;
}

export interface Terminal {
  id: number;
  name: string;
  store: number;
  is_active: boolean;
}

export interface Shift {
  id: number;
  terminal?: number;
  cashier: number;
  cashier_name?: string;
  opening_balance: number;
  closing_balance?: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string;
}

export interface CartItem {
  product_id: number;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  discount_amount: number;
  line_total: number;
  image?: string;
}
