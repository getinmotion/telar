import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface MetricItem {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description: string;
  color?: string;
}

interface UniversalMetricsProps {
  metrics: MetricItem[];
  isArtisan: boolean;
}

export const UniversalMetrics: React.FC<UniversalMetricsProps> = ({ metrics, isArtisan }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-float hover:shadow-hover transition-all duration-300 hover:scale-[1.02] border border-white/20"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {metric.title}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {metric.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full ${metric.color || 'bg-gradient-to-br from-primary/80 to-primary'} flex items-center justify-center shadow-md`}>
              <metric.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{metric.description}</p>
        </motion.div>
      ))}
    </div>
  );
};
