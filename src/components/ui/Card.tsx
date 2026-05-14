import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, padding = true, hover = false, onClick }) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-card border border-gray-50',
        padding && 'p-5',
        hover && 'cursor-pointer hover:shadow-card-hover transition-shadow duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
