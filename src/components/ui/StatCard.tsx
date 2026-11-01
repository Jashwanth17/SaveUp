import React, { ReactNode } from 'react';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon?: ReactNode;
  valueColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  valueColor = 'text-white',
}) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
        <span>{label}</span>
        {icon && <div className="p-1.5 rounded-lg bg-black/60 border border-white/5">{icon}</div>}
      </div>
      <div className={`text-2xl font-black ${valueColor}`}>{value}</div>
      {subtext && <div className="text-[11px] text-slate-500 mt-1">{subtext}</div>}
    </Card>
  );
};
