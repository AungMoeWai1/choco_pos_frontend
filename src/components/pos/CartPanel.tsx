import React, { useState } from 'react';
import { Trash2, Plus, Minus, User, ChevronDown } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/currency';
import { useCustomers } from '../../hooks/useCustomers';
import clsx from 'clsx';

interface CartPanelProps {
  onCheckout: () => void;
}

const CartPanel: React.FC<CartPanelProps> = ({ onCheckout }) => {
  const {
    items,
    customer_id,
    customer_name,
    discount_percent,
    discount_amount,
    notes,
    updateQty,
    removeItem,
    setCustomer,
    setDiscountPercent,
    setDiscountAmount,
    setNotes,
    subtotal,
    tax_amount,
    grand_total,
  } = useCartStore();

  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  const { data: customersData } = useCustomers({
    search: customerSearch || undefined,
  });
  const customers = customersData?.results || [];

  const sub = subtotal();
  const tax = tax_amount();
  const total = grand_total();
  const discountFromPercent = (sub * discount_percent) / 100;
  const totalDiscount = discount_amount > 0 ? discount_amount : discountFromPercent;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-card border border-gray-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-text-primary">Current Order</h2>
      </div>

      {/* Customer selector */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <button
            onClick={() => setShowCustomerSearch(!showCustomerSearch)}
            className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm hover:border-primary transition-colors"
          >
            <User className="w-4 h-4 text-text-secondary" />
            <span className={customer_id ? 'text-text-primary font-medium' : 'text-text-secondary'}>
              {customer_name || 'Walk-in Customer'}
            </span>
            <ChevronDown className="w-4 h-4 text-text-secondary ml-auto" />
          </button>

          {showCustomerSearch && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
              <input
                type="text"
                placeholder="Search customer..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border-b border-gray-100 focus:outline-none"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto">
                <button
                  onClick={() => {
                    setCustomer(null, null);
                    setShowCustomerSearch(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-text-secondary hover:bg-primary-50 text-left"
                >
                  Walk-in Customer
                </button>
                {customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCustomer(c.id, c.full_name);
                      setShowCustomerSearch(false);
                      setCustomerSearch('');
                    }}
                    className="w-full px-3 py-2 text-sm text-text-primary hover:bg-primary-50 text-left"
                  >
                    <span className="font-medium">{c.full_name}</span>
                    <span className="text-text-secondary ml-2 text-xs">{c.phone}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary py-8">
            <span className="text-4xl mb-2">🛒</span>
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs mt-1">Click a product to add it</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.product_id} className="flex items-center gap-2 py-2 border-b border-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{item.product_name}</p>
                  <p className="text-xs text-text-secondary">{formatCurrency(item.unit_price)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQty(item.product_id, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center hover:bg-primary-100 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-primary" />
                  </button>
                  <span className="w-7 text-center text-sm font-medium text-text-primary">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.product_id, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-primary-50 flex items-center justify-center hover:bg-primary-100 transition-colors"
                  >
                    <Plus className="w-3 h-3 text-primary" />
                  </button>
                </div>
                <span className="text-sm font-semibold text-text-primary w-20 text-right">
                  {formatCurrency(item.line_total)}
                </span>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-danger hover:text-red-700 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount & notes */}
      <div className="px-4 py-3 border-t border-gray-100 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-text-secondary mb-1">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={discount_percent || ''}
              onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-text-secondary mb-1">Discount MMK</label>
            <input
              type="number"
              min="0"
              value={discount_amount || ''}
              onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Order notes..."
          />
        </div>
      </div>

      {/* Totals */}
      <div className="px-4 py-3 border-t border-gray-100 bg-primary-50/40 rounded-b-xl">
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Subtotal</span>
            <span>{formatCurrency(sub)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Discount</span>
              <span>-{formatCurrency(totalDiscount)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-text-primary border-t border-gray-200 pt-2 mt-2">
            <span>Total</span>
            <span className="text-secondary">{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className={clsx(
            'w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150',
            items.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-600 active:scale-[0.98]'
          )}
        >
          Checkout — {formatCurrency(total)}
        </button>
      </div>
    </div>
  );
};

export default CartPanel;
