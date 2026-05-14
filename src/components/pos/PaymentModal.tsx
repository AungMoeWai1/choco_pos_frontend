import React, { useState } from 'react';
import { CreditCard, Banknote, Smartphone, X, Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/currency';
import { useCreateOrder } from '../../hooks/useOrders';
import clsx from 'clsx';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'kbzpay' | 'wavepay';

interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
}

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="w-5 h-5" />,
  card: <CreditCard className="w-5 h-5" />,
  kbzpay: <Smartphone className="w-5 h-5" />,
  wavepay: <Smartphone className="w-5 h-5" />,
};

const methodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  kbzpay: 'KBZ Pay',
  wavepay: 'Wave Pay',
};

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, onSuccess }) => {
  const { items, customer_id, discount_percent, discount_amount, notes, grand_total, subtotal, tax_amount, clearCart } =
    useCartStore();
  const createOrder = useCreateOrder();

  const total = grand_total();
  const sub = subtotal();
  const tax = tax_amount();

  const [payments, setPayments] = useState<PaymentEntry[]>([{ method: 'cash', amount: total }]);
  const [isSplit, setIsSplit] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const change = totalPaid - total;

  const handleMethodChange = (index: number, method: PaymentMethod) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, method } : p))
    );
  };

  const handleAmountChange = (index: number, amount: number) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, amount } : p))
    );
  };

  const addPayment = () => {
    setPayments((prev) => [...prev, { method: 'cash', amount: Math.max(0, total - totalPaid) }]);
    setIsSplit(true);
  };

  const removePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (totalPaid < total) return;

    const discountFromPercent = (sub * discount_percent) / 100;
    const finalDiscount = discount_amount > 0 ? discount_amount : discountFromPercent;

    try {
      await createOrder.mutateAsync({
        customer: customer_id || undefined,
        items: items.map((item) => ({
          product: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_amount: item.discount_amount,
          line_total: item.line_total,
        })),
        payments: payments.map((p) => ({
          payment_method: p.method,
          amount: p.amount,
        })),
        discount_percent,
        discount_amount: finalDiscount,
        notes,
      });
      clearCart();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Order creation failed:', err);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Payment" size="md">
      <div className="space-y-4">
        {/* Order summary */}
        <div className="bg-primary-50 rounded-xl p-4 space-y-1">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Subtotal</span>
            <span>{formatCurrency(sub)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-text-primary border-t border-primary-100 pt-2 mt-2">
            <span>Total Due</span>
            <span className="text-secondary">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment entries */}
        {payments.map((payment, idx) => (
          <div key={idx} className="space-y-3">
            {/* Method selector */}
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(methodLabels) as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleMethodChange(idx, m)}
                  className={clsx(
                    'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-medium',
                    payment.method === m
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 text-text-secondary hover:border-primary-200 hover:bg-primary-50'
                  )}
                >
                  {methodIcons[m]}
                  {methodLabels[m]}
                </button>
              ))}
            </div>

            {/* Amount input */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={payment.amount || ''}
                  onChange={(e) => handleAmountChange(idx, parseFloat(e.target.value) || 0)}
                  className="w-full border-2 border-primary rounded-xl px-4 py-3 text-lg font-bold text-text-primary focus:outline-none focus:border-secondary"
                  placeholder="0"
                />
              </div>
              {isSplit && idx > 0 && (
                <button
                  onClick={() => removePayment(idx)}
                  className="p-2 text-danger hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Quick amounts (for cash only) */}
            {payment.method === 'cash' && (
              <div className="flex gap-2 flex-wrap">
                {QUICK_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountChange(idx, amount)}
                    className="px-3 py-1 bg-primary-50 hover:bg-primary-100 text-primary text-xs font-medium rounded-lg transition-colors"
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
                <button
                  onClick={() => handleAmountChange(idx, total)}
                  className="px-3 py-1 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-medium rounded-lg transition-colors"
                >
                  Exact
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add split payment */}
        <button
          onClick={addPayment}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary-600 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add another payment method
        </button>

        {/* Change */}
        {change > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm font-medium text-success">Change to give:</span>
            <span className="text-lg font-bold text-success">{formatCurrency(change)}</span>
          </div>
        )}

        {totalPaid < total && totalPaid > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm font-medium text-danger">Remaining:</span>
            <span className="text-lg font-bold text-danger">{formatCurrency(total - totalPaid)}</span>
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={totalPaid < total || createOrder.isPending}
          loading={createOrder.isPending}
          className="w-full"
          size="lg"
        >
          Complete Payment
        </Button>
      </div>
    </Modal>
  );
};

export default PaymentModal;
