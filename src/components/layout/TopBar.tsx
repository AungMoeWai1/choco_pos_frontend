import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const pageTitles: Record<string, string> = {
  '/pos': 'POS Terminal',
  '/dashboard': 'Dashboard',
  '/orders': 'Orders',
  '/products': 'Products',
  '/categories': 'Categories',
  '/customers': 'Customers',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const TopBar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const title = pageTitles[location.pathname] || 'Choco POS';

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between shadow-sm">
      <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-primary-50 text-text-secondary transition-colors relative">
          <Bell className="w-5 h-5" />
        </button>
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-sm font-semibold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-text-primary leading-tight">{user.full_name}</p>
              <p className="text-xs text-text-secondary capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
