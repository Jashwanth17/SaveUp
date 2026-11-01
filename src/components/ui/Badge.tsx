import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'gold' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'slate' | 'teal';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'gold', 
  className = '',
  size = 'sm' 
}) => {
  const variantStyles = {
    gold: 'bg-[#caa052]/12 text-[#ecd095] border-[#caa052]/25',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
    indigo: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25',
    teal: 'bg-teal-500/10 text-teal-300 border-teal-500/25',
    slate: 'bg-white/4 text-slate-300 border-white/8',
  }[variant];

  const sizeStyles = size === 'sm' ? 'text-[10px] px-2.5 py-0.5 rounded-full' : 'text-xs px-3 py-1 rounded-full';

  return (
    <span className={`inline-flex items-center gap-1 font-semibold border ${variantStyles} ${sizeStyles} ${className}`}>
      {children}
    </span>
  );
};
