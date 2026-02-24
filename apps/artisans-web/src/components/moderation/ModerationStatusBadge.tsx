import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Edit, AlertCircle, XCircle, FileText, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ModerationStatus = 
  | 'draft'
  | 'pending_moderation'
  | 'approved'
  | 'approved_with_edits'
  | 'changes_requested'
  | 'rejected'
  | 'archived';

interface ModerationStatusBadgeProps {
  status: ModerationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<ModerationStatus, {
  label: string;
  icon: React.ComponentType<any>;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
}> = {
  draft: {
    label: 'Borrador',
    icon: FileText,
    variant: 'secondary',
    className: 'bg-muted text-muted-foreground',
  },
  pending_moderation: {
    label: 'En revisión',
    icon: Clock,
    variant: 'outline',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  approved: {
    label: 'Aprobado',
    icon: CheckCircle,
    variant: 'default',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  },
  approved_with_edits: {
    label: 'Aprobado con ajustes',
    icon: Edit,
    variant: 'default',
    className: 'bg-teal-500/10 text-teal-600 border-teal-500/30',
  },
  changes_requested: {
    label: 'Cambios solicitados',
    icon: AlertCircle,
    variant: 'outline',
    className: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  },
  rejected: {
    label: 'Rechazado',
    icon: XCircle,
    variant: 'destructive',
    className: 'bg-red-500/10 text-red-600 border-red-500/30',
  },
  archived: {
    label: 'Archivado',
    icon: Archive,
    variant: 'secondary',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
  },
};

export const ModerationStatusBadge: React.FC<ModerationStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const config = statusConfig[status as ModerationStatus] || statusConfig.draft;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'font-medium border',
        config.className,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className="mr-1" size={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
};