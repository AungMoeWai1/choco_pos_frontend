import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import { useDashboard, useSalesReport, useTopProducts } from '../hooks/useReports';
import { useOrders } from '../hooks/useOrders';
import { formatCurrency } from '../utils/currency';
import { formatDate, thirtyDaysAgo, today } from '../utils/date';
import Spinner from '../components/ui/Spinner';
import { Order } from '../types';

const KPICard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string;
}> = ({ title, value, icon, iconBg, trend }) => (
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        {trend && <p className="text-xs text-success mt-1">{trend}</p>}
      </div>
      <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
    </div>
  </Card>
);

const DashboardPage: React.FC = () => {
  const { data: dashboard, isLoading: dashLoading } = useDashboard();
  const { data: salesData } = useSalesReport({
    start_date: thirtyDaysAgo(),
    end_date: today(),
    group_by: 'day',
  });
  const { data: topProductsData } = useTopProducts({
    start_date: thirtyDaysAgo(),
    end_date: today(),
    limit: 5,
  });
  const { data: recentOrdersData } = useOrders({ page: 1 });

  const recentOrders = recentOrdersData?.results?.slice(0, 10) || [];

  const orderColumns = [
    { key: 'order_number', header: 'Order #' },
    {
      key: 'customer_name',
      header: 'Customer',
      render: (row: Order) => row.customer_name || 'Walk-in',
    },
    {
      key: 'grand_total',
      header: 'Total',
      render: (row: Order) => (
        <span className="font-semibold">{formatCurrency(row.grand_total)}</span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (row: Order) => (
        <Badge
          variant={
            row.payment_status === 'paid'
              ? 'success'
              : row.payment_status === 'partial'
              ? 'warning'
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
      render: (row: Order) => (
        <Badge
          variant={
            row.order_status === 'completed'
              ? 'success'
              : row.order_status === 'cancelled'
              ? 'danger'
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
      render: (row: Order) => formatDate(row.created_at),
    },
  ];

  if (dashLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Today's Revenue"
          value={formatCurrency(dashboard?.today_revenue || 0)}
          icon={<DollarSign className="w-6 h-6 text-success" />}
          iconBg="bg-green-50"
        />
        <KPICard
          title="Today's Orders"
          value={String(dashboard?.today_orders || 0)}
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <KPICard
          title="Monthly Revenue"
          value={formatCurrency(dashboard?.monthly_revenue || 0)}
          icon={<TrendingUp className="w-6 h-6 text-secondary" />}
          iconBg="bg-amber-50"
        />
        <KPICard
          title="Total Customers"
          value={String(dashboard?.total_customers || 0)}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          iconBg="bg-purple-50"
        />
        <KPICard
          title="Low Stock Items"
          value={String(dashboard?.low_stock_count || 0)}
          icon={<AlertTriangle className="w-6 h-6 text-danger" />}
          iconBg="bg-red-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales line chart */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-text-primary">Sales - Last 30 Days</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={salesData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6B4A2A' }}
                  tickFormatter={(val) => formatDate(val, 'MMM d')}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B4A2A' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                  labelFormatter={(label) => formatDate(String(label))}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C8860A"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#C8860A' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top products bar chart */}
        <Card padding={false}>
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-text-primary">Top Products</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={topProductsData || []}
                layout="vertical"
                margin={{ left: 0, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#6B4A2A' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="product_name"
                  width={80}
                  tick={{ fontSize: 10, fill: '#6B4A2A' }}
                  tickFormatter={(val: string) => val.length > 10 ? val.slice(0, 10) + '…' : val}
                />
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Revenue']}
                />
                <Bar dataKey="total_revenue" fill="#3D1A00" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card padding={false}>
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-text-primary">Recent Orders</h3>
        </div>
        <Table
          columns={orderColumns}
          data={recentOrders}
          keyExtractor={(row) => row.id}
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
