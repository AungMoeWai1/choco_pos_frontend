import React, { useState } from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import { useOrders, useReturnOrder } from '../hooks/useOrders';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/date';
import { Order } from '../types';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returned', label: 'Returned' },
];

const OrdersPage: React.FC = () => {
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnModal, setReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnItems, setReturnItems] = useState<Record<number, number>>({});

  const { data, isLoading } = useOrders({
    order_status: status || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    page,
  });

  const returnOrder = useReturnOrder();
  const orders = data?.results || [];

  const columns: Column<Order>[] = [
    { key: 'order_number', header: 'Order #' },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (row) => row.customer_name || 'Walk-in',
    },
    {
      key: 'cashier_name',
      header: 'Cashier',
      render: (row) => row.cashier_name || '-',
    },
    {
      key: 'grand_total',
      header: 'Total',
      render: (row) => <span className="font-semibold">{formatCurrency(row.grand_total)}</span>,
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (row) => (
        <Badge
          variant={
            row.payment_status === 'paid'
              ? 'success'
              : row.payment_status === 'partial'
              ? 'warning'
              : row.payment_status === 'refunded'
              ? 'info'
              : 'default'
          }
        >
          {row.payment_status}
        </Badge>
      ),
    },
    {
      key: 'order_status',
      header: 'Status',
      render: (row) => (
        <Badge
          variant={
            row.order_status === 'completed'
              ? 'success'
              : row.order_status === 'cancelled'
              ? 'danger'
              : row.order_status === 'suspended'
              ? 'warning'
              : 'default'
          }
        >
          {row.order_status}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(row);
          }}
          className="p-1.5 rounded-lg hover:bg-primary-50 text-text-secondary hover:text-primary transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const handleReturn = async () => {
    if (!selectedOrder) return;
    const items = Object.entries(returnItems)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ order_item_id: Number(id), quantity: qty }));

    await returnOrder.mutateAsync({
      id: selectedOrder.id,
      reason: returnReason,
      items,
    });
    setReturnModal(false);
    setSelectedOrder(null);
    setReturnItems({});
    setReturnReason('');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-40">
            <Select
              label="Status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              options={statusOptions}
            />
          </div>
          <div>
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            />
          </div>
          <div>
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            />
          </div>
          <Button
            variant="ghost"
            onClick={() => { setStatus(''); setStartDate(''); setEndDate(''); setPage(1); }}
          >
            Clear
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-text-primary">Orders ({data?.count || 0})</h2>
        </div>
        <Table
          columns={columns}
          data={orders}
          loading={isLoading}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => setSelectedOrder(row)}
          emptyMessage="No orders found"
        />
        {/* Pagination */}
        {data && data.count > 20 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-text-secondary">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, data.count)} of {data.count}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!data.next}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order ${selectedOrder.order_number}`}
          size="lg"
          footer={
            <>
              {selectedOrder.payment_status === 'paid' && selectedOrder.order_status === 'completed' && (
                <Button
                  variant="secondary"
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={() => setReturnModal(true)}
                >
                  Return Order
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">Customer: </span>
                <span className="font-medium">{selectedOrder.customer_name || 'Walk-in'}</span>
              </div>
              <div>
                <span className="text-text-secondary">Cashier: </span>
                <span className="font-medium">{selectedOrder.cashier_name || '-'}</span>
              </div>
              <div>
                <span className="text-text-secondary">Date: </span>
                <span className="font-medium">{formatDateTime(selectedOrder.created_at)}</span>
              </div>
              <div>
                <span className="text-text-secondary">Status: </span>
                <Badge variant={selectedOrder.order_status === 'completed' ? 'success' : 'default'}>
                  {selectedOrder.order_status}
                </Badge>
              </div>
            </div>

            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-text-secondary">Product</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-text-secondary">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-text-secondary">Price</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-text-secondary">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-2">{item.product_name}</td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                </div>
              )}
              {selectedOrder.tax_amount > 0 && (
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-1 mt-1">
                <span>Grand Total</span>
                <span className="text-secondary">{formatCurrency(selectedOrder.grand_total)}</span>
              </div>
            </div>

            {selectedOrder.payments && selectedOrder.payments.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Payments</h4>
                {selectedOrder.payments.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-gray-50 py-1.5">
                    <span className="capitalize text-text-secondary">{p.payment_method}</span>
                    <span className="font-medium">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Return Modal */}
      {selectedOrder && (
        <Modal
          open={returnModal}
          onClose={() => setReturnModal(false)}
          title="Return Order"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setReturnModal(false)}>Cancel</Button>
              <Button
                variant="danger"
                loading={returnOrder.isPending}
                onClick={handleReturn}
              >
                Confirm Return
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Return Reason"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Reason for return..."
            />
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Select items to return</p>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm">{item.product_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">Max: {item.quantity}</span>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={returnItems[item.id!] || 0}
                      onChange={(e) =>
                        setReturnItems((prev) => ({
                          ...prev,
                          [item.id!]: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersPage;
