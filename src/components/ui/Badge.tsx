import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  const variants = {
    success: 'bg-green-100 text-success',
    danger: 'bg-red-100 text-danger',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
