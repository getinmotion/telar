import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Store, 
  Palette, 
  Package, 
  Paintbrush, 
  BookOpen, 
  FileText, 
  Mail,
  CheckCircle,
  Share2,
  Lock,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMilestoneLabel } from '@/config/fixedTasks';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Store,
  Palette,
  Package,
  Paintbrush,
  BookOpen,
  FileText,
  Mail,
  CheckCircle,
  Share2
};

interface SimpleMissionCardProps {
  id: string;
  title: string;
  description: string;
  milestone: string;
  ctaLabel: string;
  ctaRoute: string;
  isCompleted: boolean;
  isLocked: boolean;
  icon: string;
  estimatedMinutes?: number;
}

export const SimpleMissionCard: React.FC<SimpleMissionCardProps> = ({
  id,
  title,
  description,
  milestone,
  ctaLabel,
  ctaRoute,
  isCompleted,
  isLocked,
  icon,
  estimatedMinutes
}) => {
  const navigate = useNavigate();
  const IconComponent = ICON_MAP[icon] || Package;
  const milestoneLabel = getMilestoneLabel(milestone);

  const handleCTAClick = () => {
    if (isLocked || isCompleted) return;
    navigate(ctaRoute);
  };

  // Milestone colors using semantic tokens
  const milestoneColors: Record<string, { bg: string; text: string; border: string }> = {
    formalization: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/30' },
    shop: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
    brand: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/30' },
    sales: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/30' },
    community: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/30' }
  };

  const colors = milestoneColors[milestone] || milestoneColors.shop;

  return (
    <Card 
      variant="neumorphic"
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        isCompleted && 'opacity-80',
        isLocked && 'opacity-60',
        !isCompleted && !isLocked && 'hover:scale-[1.02] active:scale-[0.98]'
      )}
    >
      <div className="flex items-stretch">
        {/* Contenedor visual - lado izquierdo */}
        <div className="w-32 h-32 flex-shrink-0 bg-white/80 dark:bg-muted/20 rounded-l-xl flex items-center justify-center m-3 rounded-xl">
          <div className={cn(
            'w-14 h-14 rounded-xl neumorphic-inset flex items-center justify-center',
            isCompleted ? 'bg-success/10' : colors.bg
          )}>
            {isCompleted ? (
              <CheckCircle className="w-7 h-7 text-success" />
            ) : isLocked ? (
              <Lock className="w-7 h-7 text-muted-foreground" />
            ) : (
              <IconComponent className={cn('w-7 h-7', colors.text)} />
            )}
          </div>
        </div>

        {/* Contenido central */}
        <div className="flex-1 py-4 pr-4 space-y-2">
          {/* Badge de milestone */}
          <Badge 
            variant="outline" 
            className={cn(
              'shadow-neumorphic-inset text-xs',
              colors.bg, 
              colors.text, 
              colors.border
            )}
          >
            {milestoneLabel}
          </Badge>
          
          {/* Título */}
          <h3 className={cn(
            'text-lg font-bold',
            isCompleted && 'text-muted-foreground line-through'
          )}>
            {title}
          </h3>
          
          {/* Descripción */}
          <p className={cn(
            'text-sm line-clamp-2',
            isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'
          )}>
            {description}
          </p>
          
          {/* Tiempo estimado */}
          {estimatedMinutes && !isCompleted && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{estimatedMinutes} min</span>
            </div>
          )}
        </div>

        {/* CTA - Lado derecho */}
        {!isCompleted && !isLocked && (
          <div className="flex items-center gap-3 pr-4 self-center">
            <span className="text-sm font-semibold text-foreground hidden sm:block">
              {ctaLabel}
            </span>
            <motion.button
              onClick={handleCTAClick}
              className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center gap-2 pr-4 text-sm text-success font-medium self-center">
            <CheckCircle className="w-5 h-5" />
            <span className="hidden sm:block">¡Completado!</span>
          </div>
        )}

        {isLocked && (
          <div className="flex items-center gap-2 pr-4 text-sm text-muted-foreground self-center">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:block">Bloqueado</span>
          </div>
        )}
      </div>
    </Card>
  );
};
