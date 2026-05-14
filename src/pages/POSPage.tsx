import React, { useState } from 'react';
import { PauseCircle, RotateCcw, Trash2, Archive } from 'lucide-react';
import ProductGrid from '../components/pos/ProductGrid';
import CartPanel from '../components/pos/CartPanel';
import PaymentModal from '../components/pos/PaymentModal';
import SuspendedOrdersDrawer from '../components/pos/SuspendedOrdersDrawer';
import { useCartStore } from '../store/cartStore';
import { useCreateOrder } from '../hooks/useOrders';
import { ordersApi } from '../api/orders';

const POSPage: React.FC = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [showSuspended, setShowSuspended] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const { items, customer_id, discount_percent, discount_amount, notes, clearCart, subtotal, grand_total, tax_amount } = useCartStore();
  const createOrder = useCreateOrder();

  const handleHoldOrder = async () => {
    if (items.length === 0) return;
    const sub = subtotal();
    const discountFromPercent = (sub * discount_percent) / 100;
    const finalDiscount = discount_amount > 0 ? discount_amount : discountFromPercent;

    try {
      const order = await createOrder.mutateAsync({
        customer: customer_id || undefined,
        items: items.map((item) => ({
          product: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          line_total: item.line_total,
        })),
        payments: [],
        discount_percent,
        discount_amount: finalDiscount,
        notes,
      });
      await ordersApi.suspend(order.id);
      clearCart();
      setSuccessMsg('Order held successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to hold order:', err);
    }
  };

  const handleNewOrder = () => {
    clearCart();
  };

  const handlePaymentSuccess = () => {
    setSuccessMsg('Payment successful!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Success notification */}
      {successMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-success text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Main POS layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Product grid */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 bg-background">
          <ProductGrid />
        </div>

        {/* Right: Cart panel */}
        <div className="w-80 xl:w-96 flex-shrink-0 p-4 flex flex-col">
          <CartPanel onCheckout={() => setShowPayment(true)} />
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleHoldOrder}
          disabled={items.length === 0 || createOrder.isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-text-secondary hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <PauseCircle className="w-4 h-4" />
          Hold Order
        </button>

        <button
          onClick={() => setShowSuspended(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-text-secondary hover:bg-primary-50 hover:text-primary hover:border-primary-200 transition-colors"
        >
          <Archive className="w-4 h-4" />
          Recall Order
        </button>

        <button
          onClick={handleNewOrder}
          disabled={items.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-text-secondary hover:bg-green-50 hover:text-success hover:border-green-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          New Order
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm text-text-secondary">
          <span className="font-medium">{items.length} item(s)</span>
          {items.length > 0 && (
            <button
              onClick={handleNewOrder}
              className="p-1 text-danger hover:bg-red-50 rounded-lg transition-colors"
              title="Clear cart"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
      />
      <SuspendedOrdersDrawer
        open={showSuspended}
        onClose={() => setShowSuspended(false)}
      />
    </div>
  );
};

export default POSPage;
