import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Tag,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Coffee,
  ClipboardList,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'POS Terminal', to: '/pos', icon: <ShoppingCart className="w-5 h-5" /> },
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ['admin', 'manager'],
  },
  { label: 'Orders', to: '/orders', icon: <ClipboardList className="w-5 h-5" /> },
  {
    label: 'Products',
    to: '/products',
    icon: <Package className="w-5 h-5" />,
    roles: ['admin', 'manager'],
  },
  {
    label: 'Categories',
    to: '/categories',
    icon: <Tag className="w-5 h-5" />,
    roles: ['admin', 'manager'],
  },
  { label: 'Customers', to: '/customers', icon: <Users className="w-5 h-5" /> },
  {
    label: 'Reports',
    to: '/reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['admin', 'manager'],
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin', 'manager'],
  },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch (_) {}
    }
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-primary text-white transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-primary-600">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-secondary rounded-lg p-1.5">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Choco POS</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto bg-secondary rounded-lg p-1.5">
            <Coffee className="w-5 h-5 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg hover:bg-primary-600 text-primary-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 mx-auto mt-2 rounded-lg hover:bg-primary-600 text-primary-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-secondary text-white font-medium'
                  : 'text-primary-200 hover:bg-primary-600 hover:text-white'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            {item.icon}
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-primary-600 px-3 py-3">
        {!collapsed && user && (
          <div className="mb-2 px-2">
            <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
            <p className="text-xs text-primary-300 capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-primary-200 hover:bg-primary-600 hover:text-white transition-colors',
            collapsed ? 'justify-center' : ''
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
