import React from 'react';

interface ProgressBarProps {
  percent: number;
  color?: string;
  className?: string;
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  color,
  className = '',
  height = 'h-2',
}) => {
  const safePercent = Math.max(0, Math.min(100, percent));
  const autoColor = safePercent >= 90 ? 'bg-rose-500' : safePercent >= 70 ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className={`w-full bg-slate-950 ${height} rounded-full overflow-hidden border border-slate-800 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${!color ? autoColor : ''}`}
        style={{
          width: `${safePercent}%`,
          backgroundColor: color || undefined,
        }}
      />
    </div>
  );
};
