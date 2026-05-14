import React from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={clsx(
              'w-full border rounded-xl px-3 py-2 text-sm text-text-primary bg-white appearance-none pr-9',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:bg-gray-50 disabled:cursor-not-allowed',
              error ? 'border-danger' : 'border-gray-200',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="">{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-secondary">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
