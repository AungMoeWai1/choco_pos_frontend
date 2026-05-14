import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  customer_id: number | null;
  customer_name: string | null;
  discount_percent: number;
  discount_amount: number;
  notes: string;
  addItem: (product: Product) => void;
  updateQty: (product_id: number, qty: number) => void;
  removeItem: (product_id: number) => void;
  setCustomer: (id: number | null, name: string | null) => void;
  setDiscountPercent: (percent: number) => void;
  setDiscountAmount: (amount: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  tax_amount: () => number;
  grand_total: () => number;
}

const TAX_RATE = 0;

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  customer_id: null,
  customer_name: null,
  discount_percent: 0,
  discount_amount: 0,
  notes: '',

  addItem: (product: Product) => {
    const { items } = get();
    const existing = items.find((i) => i.product_id === product.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1, line_total: (i.quantity + 1) * i.unit_price - i.discount_amount }
            : i
        ),
      });
    } else {
      const newItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit_price: product.price,
        quantity: 1,
        discount_amount: 0,
        line_total: product.price,
        image: product.image,
      };
      set({ items: [...items, newItem] });
    }
  },

  updateQty: (product_id: number, qty: number) => {
    const { items } = get();
    if (qty <= 0) {
      set({ items: items.filter((i) => i.product_id !== product_id) });
    } else {
      set({
        items: items.map((i) =>
          i.product_id === product_id
            ? { ...i, quantity: qty, line_total: qty * i.unit_price - i.discount_amount }
            : i
        ),
      });
    }
  },

  removeItem: (product_id: number) => {
    set({ items: get().items.filter((i) => i.product_id !== product_id) });
  },

  setCustomer: (id, name) => {
    set({ customer_id: id, customer_name: name });
  },

  setDiscountPercent: (percent) => {
    set({ discount_percent: percent, discount_amount: 0 });
  },

  setDiscountAmount: (amount) => {
    set({ discount_amount: amount, discount_percent: 0 });
  },

  setNotes: (notes) => {
    set({ notes });
  },

  clearCart: () => {
    set({
      items: [],
      customer_id: null,
      customer_name: null,
      discount_percent: 0,
      discount_amount: 0,
      notes: '',
    });
  },

  subtotal: () => {
    return get().items.reduce((sum, item) => sum + item.line_total, 0);
  },

  tax_amount: () => {
    const { discount_percent, discount_amount } = get();
    const subtotal = get().subtotal();
    const discountFromPercent = (subtotal * discount_percent) / 100;
    const totalDiscount = discount_amount > 0 ? discount_amount : discountFromPercent;
    return (subtotal - totalDiscount) * TAX_RATE;
  },

  grand_total: () => {
    const { discount_percent, discount_amount } = get();
    const subtotal = get().subtotal();
    const discountFromPercent = (subtotal * discount_percent) / 100;
    const totalDiscount = discount_amount > 0 ? discount_amount : discountFromPercent;
    const tax = (subtotal - totalDiscount) * TAX_RATE;
    return subtotal - totalDiscount + tax;
  },
}));
