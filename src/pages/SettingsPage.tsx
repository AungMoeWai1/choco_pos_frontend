import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import Spinner from '../components/ui/Spinner';
import { settingsApi } from '../api/settings';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/date';
import { User, Shift } from '../types';

const userSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['admin', 'manager', 'cashier']),
  password: z.string().min(8, 'Min 8 characters').optional(),
  is_active: z.boolean().default(true),
});

type UserForm = z.infer<typeof userSchema>;

const tabs = ['Store', 'Users', 'Shifts'];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Store');

  // Store
  const { data: stores } = useQuery({ queryKey: ['stores'], queryFn: settingsApi.getStores });
  const store = stores?.[0];
  const qc = useQueryClient();

  // Users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: settingsApi.getUsers,
  });

  const [userModal, setUserModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const createUser = useMutation({
    mutationFn: settingsApi.createUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => settingsApi.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
  const deleteUserMut = useMutation({
    mutationFn: (id: number) => settingsApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    reset: resetUser,
    formState: { errors: userErrors, isSubmitting: userSubmitting },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: 'cashier', is_active: true },
  });

  const openCreateUser = () => {
    resetUser({ role: 'cashier', is_active: true });
    setEditUser(null);
    setUserModal(true);
  };

  const openEditUser = (user: User) => {
    resetUser({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      is_active: user.is_active ?? true,
    });
    setEditUser(user);
    setUserModal(true);
  };

  const onUserSubmit = async (data: UserForm) => {
    if (editUser) {
      const { password, ...rest } = data;
      await updateUser.mutateAsync({ id: editUser.id, data: password ? data : rest });
    } else {
      await createUser.mutateAsync(data as UserForm & { password: string });
    }
    setUserModal(false);
  };

  // Shifts
  const { data: shifts } = useQuery({ queryKey: ['shifts'], queryFn: settingsApi.getShifts });
  const { data: currentShift } = useQuery({
    queryKey: ['shifts', 'current'],
    queryFn: settingsApi.getCurrentShift,
  });

  const [openShiftModal, setOpenShiftModal] = useState(false);
  const [closeShiftModal, setCloseShiftModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);

  const openShiftMut = useMutation({
    mutationFn: (data: { opening_balance: number }) => settingsApi.openShift(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] });
      setOpenShiftModal(false);
    },
  });

  const closeShiftMut = useMutation({
    mutationFn: ({ id, balance }: { id: number; balance: number }) =>
      settingsApi.closeShift(id, balance),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shifts'] });
      setCloseShiftModal(false);
    },
  });

  const updateStoreMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      settingsApi.updateStore(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stores'] }),
  });

  const [storeForm, setStoreForm] = useState<Record<string, string | number>>({});
  React.useEffect(() => {
    if (store) {
      setStoreForm({
        name: store.name,
        address: store.address || '',
        phone: store.phone || '',
        email: store.email || '',
        tax_rate: store.tax_rate,
        currency: store.currency,
      });
    }
  }, [store]);

  const userColumns = [
    { key: 'full_name', header: 'Name', render: (row: User) => <span className="font-medium">{row.full_name}</span> },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (row: User) => (
        <Badge variant={row.role === 'admin' ? 'danger' : row.role === 'manager' ? 'warning' : 'default'}>
          {row.role}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row: User) => (
        <Badge variant={(row.is_active ?? true) ? 'success' : 'default'}>
          {(row.is_active ?? true) ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: User) => (
        <div className="flex gap-1">
          <button onClick={() => openEditUser(row)} className="p-1.5 rounded-lg hover:bg-primary-50 text-text-secondary hover:text-primary">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleteUser(row)} className="p-1.5 rounded-lg hover:bg-red-50 text-text-secondary hover:text-danger">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const shiftColumns = [
    { key: 'cashier_name', header: 'Cashier', render: (row: Shift) => row.cashier_name || String(row.cashier) },
    {
      key: 'status',
      header: 'Status',
      render: (row: Shift) => <Badge variant={row.status === 'open' ? 'success' : 'default'}>{row.status}</Badge>,
    },
    {
      key: 'opening_balance',
      header: 'Opening',
      render: (row: Shift) => formatCurrency(row.opening_balance),
    },
    {
      key: 'closing_balance',
      header: 'Closing',
      render: (row: Shift) => row.closing_balance ? formatCurrency(row.closing_balance) : '-',
    },
    {
      key: 'opened_at',
      header: 'Opened',
      render: (row: Shift) => formatDateTime(row.opened_at),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-primary text-white' : 'bg-white text-text-secondary hover:bg-primary-50 border border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Store Tab */}
      {activeTab === 'Store' && (
        <Card>
          <h3 className="font-semibold text-text-primary mb-4">Store Settings</h3>
          {!store ? (
            <p className="text-text-secondary text-sm">No store configured yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(storeForm).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs text-text-secondary capitalize mb-1">{key.replace('_', ' ')}</label>
                  <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(e) =>
                      setStoreForm((prev) => ({
                        ...prev,
                        [key]: typeof value === 'number' ? parseFloat(e.target.value) : e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <Button
                  loading={updateStoreMut.isPending}
                  onClick={() => store && updateStoreMut.mutate({ id: store.id, data: storeForm })}
                >
                  Save Store Settings
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Users Tab */}
      {activeTab === 'Users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-text-primary">Users ({users?.length || 0})</h3>
            <Button icon={<Plus className="w-4 h-4" />} onClick={openCreateUser}>
              Add User
            </Button>
          </div>

          {usersLoading ? (
            <Spinner className="py-12" />
          ) : (
            <Card padding={false}>
              <Table
                columns={userColumns}
                data={users || []}
                keyExtractor={(row: User) => row.id}
              />
            </Card>
          )}

          {/* User Modal */}
          <Modal
            open={userModal}
            onClose={() => setUserModal(false)}
            title={editUser ? 'Edit User' : 'Add User'}
            footer={
              <>
                <Button variant="outline" onClick={() => setUserModal(false)}>Cancel</Button>
                <Button loading={userSubmitting} onClick={handleUserSubmit(onUserSubmit)}>
                  {editUser ? 'Update' : 'Create'}
                </Button>
              </>
            }
          >
            <form className="space-y-4">
              <Input label="Full Name" error={userErrors.full_name?.message} {...registerUser('full_name')} />
              <Input label="Email" type="email" error={userErrors.email?.message} {...registerUser('email')} />
              <Select
                label="Role"
                error={userErrors.role?.message}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'cashier', label: 'Cashier' },
                ]}
                {...registerUser('role')}
              />
              <Input
                label={editUser ? 'New Password (leave blank to keep)' : 'Password'}
                type="password"
                error={userErrors.password?.message}
                {...registerUser('password')}
              />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="user_active" {...registerUser('is_active')} className="w-4 h-4 rounded" />
                <label htmlFor="user_active" className="text-sm text-text-primary">Active</label>
              </div>
            </form>
          </Modal>

          {/* Delete User confirm */}
          <Modal
            open={!!deleteUser}
            onClose={() => setDeleteUser(null)}
            title="Delete User"
            footer={
              <>
                <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
                <Button
                  variant="danger"
                  loading={deleteUserMut.isPending}
                  onClick={async () => {
                    if (deleteUser) {
                      await deleteUserMut.mutateAsync(deleteUser.id);
                      setDeleteUser(null);
                    }
                  }}
                >
                  Delete
                </Button>
              </>
            }
          >
            <p className="text-text-secondary">Delete user <span className="font-semibold text-text-primary">{deleteUser?.full_name}</span>?</p>
          </Modal>
        </div>
      )}

      {/* Shifts Tab */}
      {activeTab === 'Shifts' && (
        <div className="space-y-4">
          {/* Current shift status */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary-50">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">
                    {currentShift ? 'Shift In Progress' : 'No Active Shift'}
                  </p>
                  {currentShift && (
                    <p className="text-sm text-text-secondary">
                      Opened by {currentShift.cashier_name} — {formatDateTime(currentShift.opened_at)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!currentShift && (
                  <Button onClick={() => setOpenShiftModal(true)}>Open Shift</Button>
                )}
                {currentShift && (
                  <Button variant="secondary" onClick={() => setCloseShiftModal(true)}>Close Shift</Button>
                )}
              </div>
            </div>
          </Card>

          <Card padding={false}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold">Shift History</h3>
            </div>
            <Table
              columns={shiftColumns}
              data={shifts || []}
              keyExtractor={(row: Shift) => row.id}
            />
          </Card>

          {/* Open Shift Modal */}
          <Modal
            open={openShiftModal}
            onClose={() => setOpenShiftModal(false)}
            title="Open Shift"
            footer={
              <>
                <Button variant="outline" onClick={() => setOpenShiftModal(false)}>Cancel</Button>
                <Button
                  loading={openShiftMut.isPending}
                  onClick={() => openShiftMut.mutate({ opening_balance: openingBalance })}
                >
                  Open Shift
                </Button>
              </>
            }
          >
            <Input
              label="Opening Balance (MMK)"
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
            />
          </Modal>

          {/* Close Shift Modal */}
          <Modal
            open={closeShiftModal}
            onClose={() => setCloseShiftModal(false)}
            title="Close Shift"
            footer={
              <>
                <Button variant="outline" onClick={() => setCloseShiftModal(false)}>Cancel</Button>
                <Button
                  variant="secondary"
                  loading={closeShiftMut.isPending}
                  onClick={() =>
                    currentShift &&
                    closeShiftMut.mutate({ id: currentShift.id, balance: closingBalance })
                  }
                >
                  Close Shift
                </Button>
              </>
            }
          >
            <Input
              label="Closing Balance (MMK)"
              type="number"
              value={closingBalance}
              onChange={(e) => setClosingBalance(parseFloat(e.target.value) || 0)}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
