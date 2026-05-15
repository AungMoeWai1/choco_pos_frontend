import React from 'react';
import { X, ShoppingCart, Clock } from 'lucide-react';
import { useSuspendedOrders } from '../../hooks/useOrders';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import Spinner from '../ui/Spinner';
import { Order } from '../../types';

interface SuspendedOrdersDrawerProps {
  open: boolean;
  onClose: () => void;
}

const SuspendedOrdersDrawer: React.FC<SuspendedOrdersDrawerProps> = ({ open, onClose }) => {
  const { data: orders, isLoading } = useSuspendedOrders();
  const { addItem, setCustomer, clearCart } = useCartStore();

  const recallOrder = (order: Order) => {
    clearCart();
    if (order.customer) {
      setCustomer(order.customer, order.customer_name || null);
    }
    order.items.forEach((item) => {
      // Build a minimal product-like object for the cart
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.product,
          name: item.product_name || '',
          sku: item.sku || '',
          price: item.unit_price,
          stock_quantity: 999,
          low_stock_threshold: 0,
          status: 'active',
          category: 0,
          created_at: '',
          updated_at: '',
        });
      }
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative ml-auto w-80 bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-text-primary flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            Suspended Orders
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <Spinner className="mt-8" />
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No suspended orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => recallOrder(order)}
                  className="w-full text-left bg-primary-50 hover:bg-primary-100 rounded-xl p-3 transition-colors border border-primary-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{order.order_number}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {order.customer_name || 'Walk-in'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {order.items.length} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary text-sm">
                        {formatCurrency(order.grand_total)}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {formatDateTime(order.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuspendedOrdersDrawer;
