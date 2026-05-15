import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, text }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={clsx(sizes[size], 'animate-spin text-primary')} />
      {text && <span className="text-sm text-text-secondary">{text}</span>}
    </div>
  );
};

export default Spinner;
