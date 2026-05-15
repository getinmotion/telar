import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface HealthScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#10b981'; // emerald
  if (score >= 50) return '#f59e0b'; // amber
  if (score >= 25) return '#f97316'; // orange
  return '#ef4444'; // red
}

function getScoreLabel(score: number): string {
  if (score >= 75) return 'Buena';
  if (score >= 50) return 'Regular';
  if (score >= 25) return 'Baja';
  return 'Crítica';
}

const SIZE_CONFIG = {
  sm: { dim: 72, inner: 22, textSize: 'text-base', labelSize: 'text-[9px]' },
  md: { dim: 96, inner: 30, textSize: 'text-lg', labelSize: 'text-[10px]' },
  lg: { dim: 120, inner: 38, textSize: 'text-2xl', labelSize: 'text-xs' },
};

export const HealthScoreRing: React.FC<HealthScoreRingProps> = ({
  score,
  size = 'md',
  className,
}) => {
  const clamped = Math.max(0, Math.min(100, score));
  const color = getScoreColor(clamped);
  const label = getScoreLabel(clamped);
  const cfg = SIZE_CONFIG[size];

  const data = useMemo(
    () => [
      { value: clamped },
      { value: 100 - clamped },
    ],
    [clamped],
  );

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <ResponsiveContainer width={cfg.dim} height={cfg.dim}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={cfg.dim / 2 - cfg.inner}
            outerRadius={cfg.dim / 2 - 4}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={color} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold tabular-nums leading-none', cfg.textSize)} style={{ color }}>
          {clamped}
        </span>
        <span className={cn('text-muted-foreground font-medium', cfg.labelSize)}>{label}</span>
      </div>
    </div>
  );
};
