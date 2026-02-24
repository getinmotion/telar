import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardActionCardProps {
  // Header
  badge?: { 
    label: string; 
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'success' | 'recommended';
  };
  actionIcon?: React.ReactNode;
  
  // Visual principal
  icon: React.ReactNode;
  iconBackground?: string;
  
  // Contenido
  category?: string;
  title: string;
  subtitle?: string;
  
  // Progreso (opcional)
  progress?: {
    current: number;
    total: number;
    label?: string;
  };
  
  // Metadata adicional
  metadata?: Array<{ 
    icon: React.ReactNode; 
    value: string;
  }>;
  
  // CTA
  primaryAction: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  
  // Estado visual
  status?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

export const DashboardActionCard: React.FC<DashboardActionCardProps> = ({
  badge,
  actionIcon,
  icon,
  iconBackground,
  category,
  title,
  subtitle,
  progress,
  metadata,
  primaryAction,
  secondaryAction,
  status = 'default',
  className
}) => {
  // Status color mappings
  const statusColors = {
    default: 'bg-primary/20 text-primary',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    info: 'bg-accent/20 text-accent'
  };

  const iconBgClass = iconBackground || statusColors[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "neumorphic h-full overflow-hidden group transition-all duration-300",
        "hover:shadow-neumorphic-hover relative",
        className
      )}>
        <CardContent className="p-0 pb-20">
          {/* Header con badge */}
          {badge && (
            <div className="absolute top-4 left-4 z-10">
              <Badge 
                variant={badge.variant || 'default'}
                className="rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
              >
                {badge.label}
              </Badge>
            </div>
          )}

          {/* Contenedor visual grande - zona superior */}
          <div className="mx-4 mt-4 mb-6 rounded-2xl bg-white/80 dark:bg-muted/20 h-40 flex items-center justify-center relative overflow-hidden">
            {/* Icono centrado dentro del contenedor */}
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center",
              "neumorphic-inset transition-all duration-300",
              "group-hover:scale-105",
              iconBgClass
            )}>
              {icon}
            </div>
            
            {/* Action icon en esquina del contenedor si existe */}
            {actionIcon && (
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                {actionIcon}
              </motion.div>
            )}
          </div>

          {/* Contenido principal - centrado */}
          <div className="px-6 pb-4 text-center space-y-2">
            {category && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                {category}
              </p>
            )}
            <h3 className="text-lg font-bold text-foreground leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Barra de progreso (opcional) */}
          {progress && (
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>{progress.label || 'Progreso'}</span>
                <span className="font-semibold">{progress.current}/{progress.total}</span>
              </div>
              <Progress 
                value={(progress.current / progress.total) * 100} 
                className="h-2 shadow-inner"
              />
            </div>
          )}

          {/* Metadata adicional */}
          {metadata && metadata.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex items-center justify-center gap-4 text-xs">
                {metadata.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1.5 text-muted-foreground"
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Action como link sutil (si existe) */}
          {secondaryAction && (
            <div className="px-6 pb-4 text-center">
              <button
                onClick={secondaryAction.onClick}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
              >
                {secondaryAction.label}
              </button>
            </div>
          )}

          {/* CTA - Texto + Círculo oscuro en esquina inferior derecha */}
          <div className="absolute bottom-4 right-4 flex items-center gap-3">
            {/* Texto siempre visible */}
            <span className="text-sm font-semibold text-foreground">
              {primaryAction.label}
            </span>
            
            {/* Círculo oscuro con flecha */}
            <motion.button
              onClick={primaryAction.onClick}
              className={cn(
                "w-12 h-12 rounded-full",
                "bg-foreground text-background",
                "flex items-center justify-center",
                "shadow-lg hover:shadow-xl transition-shadow"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
