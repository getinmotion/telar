import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './card';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  gradient?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
  iconClassName,
  gradient = 'from-neon-green-400 to-neon-green-600'
}) => {
  return (
    <Card className={cn(
      "p-6 shadow-float hover:shadow-hover transition-all duration-300 hover:scale-[1.02] bg-white border-0",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-charcoal mb-2">
            {value}
          </p>
          {trend && (
            <div className={cn(
              "flex items-center text-sm font-semibold",
              trend.isPositive ? "text-neon-green-600" : "text-red-600"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg",
          gradient,
          iconClassName
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};
