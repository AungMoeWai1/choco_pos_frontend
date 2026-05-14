import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Spinner from '../components/ui/Spinner';
import {
  useSalesReport,
  useTopProducts,
  useTopCustomers,
  usePaymentMethodsReport,
  useCashDrawerReport,
  useInventoryReport,
} from '../hooks/useReports';
import { formatCurrency } from '../utils/currency';
import { formatDate, thirtyDaysAgo, today } from '../utils/date';
import { Product, SalesReport, TopProduct, TopCustomer, PaymentMethodReport } from '../types';

const COLORS = ['#3D1A00', '#C8860A', '#F5A623', '#2D7A4F', '#C0392B'];

const tabs = ['Sales', 'Products', 'Customers', 'Payments', 'Inventory', 'Cash Drawer'];

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Sales');
  const [startDate, setStartDate] = useState(thirtyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');
  const [cashDrawerDate, setCashDrawerDate] = useState(today());

  const { data: salesData, isLoading: salesLoading } = useSalesReport({
    start_date: startDate,
    end_date: endDate,
    group_by: groupBy,
  });
  const { data: topProducts, isLoading: topProdsLoading } = useTopProducts({
    start_date: startDate,
    end_date: endDate,
    limit: 10,
  });
  const { data: topCustomers } = useTopCustomers();
  const { data: paymentMethods } = usePaymentMethodsReport();
  const { data: cashDrawer } = useCashDrawerReport(cashDrawerDate);
  const { data: inventory, isLoading: invLoading } = useInventoryReport();

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'bg-white text-text-secondary hover:bg-primary-50 border border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sales Tab */}
      {activeTab === 'Sales' && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap gap-3 items-end">
              <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <Select
                label="Group By"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'day' | 'week' | 'month')}
                options={[
                  { value: 'day', label: 'Daily' },
                  { value: 'week', label: 'Weekly' },
                  { value: 'month', label: 'Monthly' },
                ]}
              />
            </div>
          </Card>

          {salesLoading ? (
            <Spinner className="py-12" />
          ) : (
            <>
              <Card padding={false}>
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-text-primary">Revenue Over Time</h3>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                      <XAxis dataKey="date" tickFormatter={(v) => formatDate(v, 'MMM d')} tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} labelFormatter={(l) => formatDate(String(l))} />
                      <Line type="monotone" dataKey="revenue" stroke="#C8860A" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card padding={false}>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-text-primary">Sales Data</h3>
                </div>
                <Table
                  columns={[
                    { key: 'date', header: 'Date', render: (row: SalesReport) => formatDate(row.date) },
                    { key: 'orders', header: 'Orders', render: (row: SalesReport) => String(row.orders) },
                    { key: 'revenue', header: 'Revenue', render: (row: SalesReport) => <span className="font-semibold">{formatCurrency(row.revenue)}</span> },
                  ]}
                  data={salesData || []}
                  keyExtractor={(row: SalesReport) => row.date}
                />
              </Card>
            </>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'Products' && (
        <div className="space-y-4">
          <Card>
            <div className="flex gap-3 items-end">
              <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </Card>

          {topProdsLoading ? (
            <Spinner className="py-12" />
          ) : (
            <>
              <Card padding={false}>
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold">Top Products by Revenue</h3>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={(topProducts || []).slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                      <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="product_name" width={100} tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + '…' : v} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} />
                      <Bar dataKey="total_revenue" fill="#3D1A00" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card padding={false}>
                <Table
                  columns={[
                    { key: 'product_name', header: 'Product', render: (row: TopProduct) => <span className="font-medium">{row.product_name}</span> },
                    { key: 'total_quantity', header: 'Qty Sold', render: (row: TopProduct) => String(row.total_quantity) },
                    { key: 'total_revenue', header: 'Revenue', render: (row: TopProduct) => <span className="font-semibold">{formatCurrency(row.total_revenue)}</span> },
                  ]}
                  data={topProducts || []}
                  keyExtractor={(row: TopProduct) => row.product_id}
                />
              </Card>
            </>
          )}
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'Customers' && (
        <Card padding={false}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold">Top Customers</h3>
          </div>
          <Table
            columns={[
              { key: 'customer_name', header: 'Customer', render: (row: TopCustomer) => <span className="font-medium">{row.customer_name}</span> },
              { key: 'order_count', header: 'Orders', render: (row: TopCustomer) => String(row.order_count) },
              { key: 'total_spent', header: 'Total Spent', render: (row: TopCustomer) => <span className="font-semibold">{formatCurrency(row.total_spent)}</span> },
            ]}
            data={topCustomers || []}
            keyExtractor={(row: TopCustomer) => row.customer_id}
          />
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === 'Payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding={false}>
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-semibold">Payment Methods Distribution</h3>
            </div>
            <div className="p-5 flex justify-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={paymentMethods || []}
                    dataKey="total_amount"
                    nameKey="payment_method"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(paymentMethods || []).map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card padding={false}>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold">Payment Summary</h3>
            </div>
            <Table
              columns={[
                { key: 'payment_method', header: 'Method', render: (row: PaymentMethodReport) => <span className="capitalize font-medium">{row.payment_method}</span> },
                { key: 'count', header: 'Count', render: (row: PaymentMethodReport) => String(row.count) },
                { key: 'total_amount', header: 'Total', render: (row: PaymentMethodReport) => <span className="font-semibold">{formatCurrency(row.total_amount)}</span> },
              ]}
              data={paymentMethods || []}
              keyExtractor={(row: PaymentMethodReport) => row.payment_method}
            />
          </Card>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'Inventory' && (
        <div className="space-y-4">
          {invLoading ? (
            <Spinner className="py-12" />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <p className="text-sm text-text-secondary">Total Products</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">{inventory?.total_products || 0}</p>
                </Card>
                <Card>
                  <p className="text-sm text-text-secondary">Stock Value</p>
                  <p className="text-2xl font-bold text-secondary mt-1">{formatCurrency(inventory?.total_stock_value || 0)}</p>
                </Card>
                <Card>
                  <p className="text-sm text-text-secondary">Low Stock Items</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{inventory?.low_stock_products?.length || 0}</p>
                </Card>
                <Card>
                  <p className="text-sm text-text-secondary">Out of Stock</p>
                  <p className="text-2xl font-bold text-danger mt-1">{inventory?.out_of_stock_products?.length || 0}</p>
                </Card>
              </div>

              {(inventory?.low_stock_products || []).length > 0 && (
                <Card padding={false}>
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-amber-700">Low Stock Products</h3>
                  </div>
                  <Table
                    columns={[
                      { key: 'name', header: 'Product', render: (row: Product) => <span className="font-medium">{row.name}</span> },
                      { key: 'sku', header: 'SKU' },
                      { key: 'stock_quantity', header: 'Stock', render: (row: Product) => <span className="font-bold text-amber-600">{row.stock_quantity}</span> },
                      { key: 'low_stock_threshold', header: 'Threshold', render: (row: Product) => String(row.low_stock_threshold) },
                    ]}
                    data={inventory?.low_stock_products || []}
                    keyExtractor={(row: Product) => row.id}
                  />
                </Card>
              )}

              <Card padding={false}>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold">All Products Inventory</h3>
                </div>
                <Table
                  columns={[
                    { key: 'name', header: 'Product', render: (row: Product) => <span className="font-medium">{row.name}</span> },
                    { key: 'sku', header: 'SKU' },
                    { key: 'category_name', header: 'Category', render: (row: Product) => row.category_name || '-' },
                    { key: 'stock_quantity', header: 'Stock', render: (row: Product) => String(row.stock_quantity) },
                    { key: 'price', header: 'Price', render: (row: Product) => formatCurrency(row.price) },
                  ]}
                  data={inventory?.all_products || []}
                  keyExtractor={(row: Product) => row.id}
                />
              </Card>
            </>
          )}
        </div>
      )}

      {/* Cash Drawer Tab */}
      {activeTab === 'Cash Drawer' && (
        <div className="space-y-4">
          <Card>
            <Input
              label="Date"
              type="date"
              value={cashDrawerDate}
              onChange={(e) => setCashDrawerDate(e.target.value)}
            />
          </Card>

          {cashDrawer && (
            <Card>
              <h3 className="font-semibold text-text-primary mb-4">Cash Drawer Report — {formatDate(cashDrawer.date)}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-xl p-4">
                  <p className="text-sm text-text-secondary">Opening Balance</p>
                  <p className="text-xl font-bold text-text-primary mt-1">{formatCurrency(cashDrawer.opening_balance)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-text-secondary">Cash Sales</p>
                  <p className="text-xl font-bold text-success mt-1">{formatCurrency(cashDrawer.cash_sales)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-sm text-text-secondary">Cash Refunds</p>
                  <p className="text-xl font-bold text-danger mt-1">{formatCurrency(cashDrawer.cash_refunds)}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-text-secondary">Closing Balance</p>
                  <p className="text-xl font-bold text-secondary mt-1">{formatCurrency(cashDrawer.closing_balance)}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
