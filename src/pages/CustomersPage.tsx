import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Card from '../components/ui/Card';
import Table, { Column } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import {
  useCustomers,
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useAdjustLoyalty,
  useCustomerPurchaseHistory,
  useCustomerLoyaltyHistory,
} from '../hooks/useCustomers';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/date';
import { Customer } from '../types';

const customerSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  address: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CustomerForm = z.infer<typeof customerSchema>;

const tierColors: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  bronze: 'default',
  silver: 'info',
  gold: 'warning',
  platinum: 'success',
};

const CustomerDetail: React.FC<{ customerId: number; onClose: () => void }> = ({
  customerId,
  onClose,
}) => {
  const [tab, setTab] = useState<'info' | 'purchases' | 'loyalty'>('info');
  const { data: customer } = useCustomer(customerId);
  const { data: purchases } = useCustomerPurchaseHistory(customerId);
  const { data: loyaltyHistory } = useCustomerLoyaltyHistory(customerId);
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const adjustLoyalty = useAdjustLoyalty();

  if (!customer) return <Spinner />;

  const handleAdjust = async () => {
    await adjustLoyalty.mutateAsync({ id: customerId, points: adjustPoints, reason: adjustReason });
    setShowAdjust(false);
    setAdjustPoints(0);
    setAdjustReason('');
  };

  return (
    <Modal open onClose={onClose} title={customer.full_name} size="xl">
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-100 pb-3">
          {['info', 'purchases', 'loyalty'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as typeof tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-text-secondary">Phone: </span><span>{customer.phone || '-'}</span></div>
              <div><span className="text-text-secondary">Email: </span><span>{customer.email || '-'}</span></div>
              <div><span className="text-text-secondary">Loyalty Points: </span><span className="font-bold text-secondary">{customer.loyalty_points}</span></div>
              <div><span className="text-text-secondary">Tier: </span><Badge variant={tierColors[customer.loyalty_tier]}>{customer.loyalty_tier}</Badge></div>
              <div><span className="text-text-secondary">Total Spent: </span><span className="font-bold">{formatCurrency(customer.total_spent)}</span></div>
              <div><span className="text-text-secondary">Status: </span><Badge variant={customer.is_active ? 'success' : 'default'}>{customer.is_active ? 'Active' : 'Inactive'}</Badge></div>
            </div>
            <Button
              variant="outline"
              icon={<Star className="w-4 h-4" />}
              onClick={() => setShowAdjust(!showAdjust)}
            >
              Adjust Points
            </Button>
            {showAdjust && (
              <div className="bg-amber-50 p-4 rounded-xl space-y-3">
                <Input
                  label="Points (use negative to deduct)"
                  type="number"
                  value={adjustPoints}
                  onChange={(e) => setAdjustPoints(parseInt(e.target.value) || 0)}
                />
                <Input
                  label="Reason"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
                <Button loading={adjustLoyalty.isPending} onClick={handleAdjust} size="sm">
                  Apply Adjustment
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === 'purchases' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(purchases || []).length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-4">No purchases yet</p>
            ) : (
              (purchases || []).map((order) => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <div>
                    <span className="font-medium">{order.order_number}</span>
                    <span className="text-text-secondary ml-2">{formatDateTime(order.created_at)}</span>
                  </div>
                  <span className="font-bold text-secondary">{formatCurrency(order.grand_total)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'loyalty' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(loyaltyHistory || []).length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-4">No loyalty history</p>
            ) : (
              (loyaltyHistory || []).map((entry) => (
                <div key={entry.id} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <div>
                    <span className="text-text-secondary">{formatDateTime(entry.created_at)}</span>
                    <p className="text-text-primary">{entry.reason}</p>
                  </div>
                  <span className={`font-bold ${entry.points >= 0 ? 'text-success' : 'text-danger'}`}>
                    {entry.points >= 0 ? '+' : ''}{entry.points}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

const CustomersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<number | null>(null);

  const { data, isLoading } = useCustomers({
    search: search || undefined,
    loyalty_tier: tierFilter || undefined,
    page,
  });

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomerMut = useDeleteCustomer();

  const customers = data?.results || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: { is_active: true },
  });

  const openCreate = () => {
    reset({ is_active: true });
    setEditCustomer(null);
    setModalOpen(true);
  };

  const openEdit = (customer: Customer) => {
    reset({
      full_name: customer.full_name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      is_active: customer.is_active,
    });
    setEditCustomer(customer);
    setModalOpen(true);
  };

  const onSubmit = async (data: CustomerForm) => {
    if (editCustomer) {
      await updateCustomer.mutateAsync({ id: editCustomer.id, data });
    } else {
      await createCustomer.mutateAsync(data);
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteCustomer) return;
    await deleteCustomerMut.mutateAsync(deleteCustomer.id);
    setDeleteCustomer(null);
  };

  const columns: Column<Customer>[] = [
    {
      key: 'full_name',
      header: 'Customer',
      render: (row) => (
        <div>
          <p className="font-medium text-text-primary">{row.full_name}</p>
          <p className="text-xs text-text-secondary">{row.email || row.phone || '-'}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (row) => row.phone || '-' },
    {
      key: 'loyalty_tier',
      header: 'Tier',
      render: (row) => <Badge variant={tierColors[row.loyalty_tier]}>{row.loyalty_tier}</Badge>,
    },
    {
      key: 'loyalty_points',
      header: 'Points',
      render: (row) => <span className="font-medium text-secondary">{row.loyalty_points}</span>,
    },
    {
      key: 'total_spent',
      header: 'Total Spent',
      render: (row) => <span className="font-semibold">{formatCurrency(row.total_spent)}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => <Badge variant={row.is_active ? 'success' : 'default'}>{row.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setViewCustomer(row.id); }}
            className="p-1.5 rounded-lg hover:bg-primary-50 text-text-secondary hover:text-primary transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="p-1.5 rounded-lg hover:bg-primary-50 text-text-secondary hover:text-primary transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteCustomer(row); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-danger transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <Input
              label="Search"
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-44">
            <Select
              label="Tier"
              value={tierFilter}
              onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
              options={[
                { value: 'bronze', label: 'Bronze' },
                { value: 'silver', label: 'Silver' },
                { value: 'gold', label: 'Gold' },
                { value: 'platinum', label: 'Platinum' },
              ]}
              placeholder="All Tiers"
            />
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Add Customer
          </Button>
        </div>
      </Card>

      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-text-primary">Customers ({data?.count || 0})</h2>
        </div>
        <Table
          columns={columns}
          data={customers}
          loading={isLoading}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => setViewCustomer(row.id)}
        />
        {data && data.count > 20 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-text-secondary">
              {(page - 1) * 20 + 1}–{Math.min(page * 20, data.count)} of {data.count}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <Button size="sm" variant="outline" disabled={!data.next} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Customer Detail */}
      {viewCustomer && (
        <CustomerDetail customerId={viewCustomer} onClose={() => setViewCustomer(null)} />
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCustomer ? 'Edit Customer' : 'Add Customer'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
              {editCustomer ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Full Name" error={errors.full_name?.message} {...register('full_name')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Address" {...register('address')} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" {...register('is_active')} className="w-4 h-4 rounded" />
            <label htmlFor="active" className="text-sm text-text-primary">Active</label>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
        title="Delete Customer"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteCustomer(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteCustomerMut.isPending} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-text-secondary">
          Delete <span className="font-semibold text-text-primary">{deleteCustomer?.full_name}</span>?
        </p>
      </Modal>
    </div>
  );
};

export default CustomersPage;
