import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Edit, AlertCircle, XCircle, FileText, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODERATION_STATUS_LABELS } from '@/constants/moderation-copy';

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
  icon: React.ComponentType<{ className?: string; size?: number }>;
  className: string;
}> = {
  draft:              { icon: FileText,     className: 'bg-muted text-muted-foreground border-muted' },
  pending_moderation: { icon: Clock,        className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  approved:           { icon: CheckCircle,  className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  approved_with_edits:{ icon: Edit,         className: 'bg-teal-500/10 text-teal-600 border-teal-500/30' },
  changes_requested:  { icon: AlertCircle,  className: 'bg-orange-500/10 text-orange-600 border-orange-500/30' },
  rejected:           { icon: XCircle,      className: 'bg-red-500/10 text-red-600 border-red-500/30' },
  archived:           { icon: Archive,      className: 'bg-gray-500/10 text-gray-500 border-gray-500/30' },
};

export const ModerationStatusBadge: React.FC<ModerationStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const config = statusConfig[status as ModerationStatus] ?? statusConfig.draft;
  const label = MODERATION_STATUS_LABELS[status] ?? MODERATION_STATUS_LABELS['draft'];
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
      variant="outline"
      className={cn('font-medium border', config.className, sizeClasses[size])}
    >
      {showIcon && <Icon className="mr-1" size={iconSizes[size]} />}
      {label}
    </Badge>
  );
};