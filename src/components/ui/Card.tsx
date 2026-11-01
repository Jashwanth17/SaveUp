import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hoverable = false,
  onClick 
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0c0d13] border border-white/[0.07] rounded-2xl p-5 shadow-xl shadow-black/80 transition-all duration-200 ${
        hoverable ? 'hover:border-[#caa052]/35 hover:shadow-2xl hover:shadow-[#caa052]/5 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
