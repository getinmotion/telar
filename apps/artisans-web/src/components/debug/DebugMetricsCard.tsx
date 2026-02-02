import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressRing } from '@/components/ui/progress-ring';

interface DebugMetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  progress?: number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
}

export const DebugMetricsCard: React.FC<DebugMetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  status = 'neutral',
  progress,
  subtitle,
  trend
}) => {
  const statusColors = {
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-yellow-200 bg-yellow-50/50',
    error: 'border-red-200 bg-red-50/50',
    neutral: 'border-border bg-card'
  };

  const iconColors = {
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
    neutral: 'text-primary bg-primary/10'
  };

  const progressColors = {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    neutral: '#B8FF5C'
  };

  return (
    <Card className={cn("border-2 transition-all hover:shadow-md", statusColors[status])}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold mb-2">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {trend.label}
                </span>
                <span className={cn(
                  "text-xs font-bold",
                  trend.value > 0 ? "text-green-600" : trend.value < 0 ? "text-red-600" : "text-muted-foreground"
                )}>
                  {trend.value > 0 ? '+' : ''}{trend.value}
                </span>
              </div>
            )}
          </div>
          
          {progress !== undefined ? (
            <ProgressRing
              progress={progress}
              size={80}
              strokeWidth={6}
              color={progressColors[status]}
              showPercentage={true}
            />
          ) : (
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              iconColors[status]
            )}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
