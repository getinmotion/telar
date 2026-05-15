import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, ImageOff, Store, Clock, CheckCircle, Zap, TrendingUp, ShieldAlert } from 'lucide-react';
import { ModerationStatusBadge } from '../ModerationStatusBadge';
import { ScoreBadge } from './ScoreBadge';
import type { QueueScoreApi } from '@/services/moderation.actions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export interface QueueCardItem {
  id: string;
  type: 'product' | 'shop';
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
  issues?: string[];
}

interface QueueCardProps {
  item: QueueCardItem;
  score?: QueueScoreApi | null;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onQuickApprove?: (id: string) => void;
  onQuickReview?: (id: string) => void;
  className?: string;
}

const STATUS_ACCENT: Record<string, string> = {
  pending_moderation: 'border-l-amber-400',
  changes_requested:  'border-l-orange-400',
  rejected:           'border-l-red-400',
  approved:           'border-l-emerald-400',
  approved_with_edits:'border-l-teal-400',
  draft:              'border-l-gray-300',
};

export const QueueCard: React.FC<QueueCardProps> = ({
  item,
  score,
  isSelected,
  onSelect,
  onQuickApprove,
  onQuickReview,
  className,
}) => {
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
    addSuffix: true,
    locale: es,
  });

  const accentClass = STATUS_ACCENT[item.status] ?? 'border-l-gray-200';
  const hasScore = score && (score.priorityScore > 0 || score.riskScore > 0 || score.commercialScore > 0);

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={cn(
        'group relative flex flex-col rounded-xl border-l-4 border border-gray-100 bg-white cursor-pointer',
        'transition-all duration-150 hover:shadow-md hover:border-gray-200',
        isSelected && 'ring-2 ring-[#151b2d]/20 border-[#151b2d]/30 shadow-md',
        accentClass,
        className,
      )}
    >
      {/* Image hero */}
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-lg bg-gray-50">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-gray-300">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}

        {/* Type badge */}
        {item.type === 'shop' && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
            <Store className="h-2.5 w-2.5" />
            Taller
          </div>
        )}

        {/* Issues overlay — top right */}
        {item.issues && item.issues.length > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            <AlertTriangle className="h-2.5 w-2.5" />
            {item.issues.length} {item.issues.length === 1 ? 'alerta' : 'alertas'}
          </div>
        )}

        {/* Gradient at bottom */}
        {item.imageUrl && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        )}

        {/* Title overlay on image */}
        {item.imageUrl && (
          <div className="absolute bottom-0 inset-x-0 px-3 pb-2.5">
            <p className="text-white text-sm font-semibold leading-tight line-clamp-1 drop-shadow">
              {item.title}
            </p>
            {item.subtitle && (
              <p className="text-white/75 text-[10px] mt-0.5 line-clamp-1">{item.subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex flex-col gap-2.5 p-3">
        {/* Title when no image */}
        {!item.imageUrl && (
          <div>
            <p className="text-sm font-semibold text-[#151b2d] leading-tight line-clamp-2">{item.title}</p>
            {item.subtitle && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.subtitle}</p>
            )}
          </div>
        )}

        {/* Status + time */}
        <div className="flex items-center justify-between gap-2">
          <ModerationStatusBadge status={item.status} size="sm" />
          <span className="flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
            <Clock className="h-2.5 w-2.5" />
            {timeAgo}
          </span>
        </div>

        {/* Issues detail */}
        {item.issues && item.issues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.issues.slice(0, 3).map((issue) => (
              <span
                key={issue}
                className="inline-flex items-center gap-0.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700 font-medium"
              >
                {issue}
              </span>
            ))}
            {item.issues.length > 3 && (
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] text-gray-500">
                +{item.issues.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Score bars */}
        {hasScore && (
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {score!.priorityScore > 0 && (
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-0.5 text-[9px] font-medium text-gray-500 uppercase tracking-wide">
                  <Zap className="h-2.5 w-2.5 text-amber-500" />
                  Prio
                </span>
                <div className="h-1 rounded-full bg-gray-100">
                  <div
                    className={cn('h-full rounded-full', score!.priorityScore >= 60 ? 'bg-red-400' : score!.priorityScore >= 30 ? 'bg-amber-400' : 'bg-green-400')}
                    style={{ width: `${score!.priorityScore}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-500 tabular-nums">{score!.priorityScore}</span>
              </div>
            )}
            {score!.riskScore > 0 && (
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-0.5 text-[9px] font-medium text-gray-500 uppercase tracking-wide">
                  <ShieldAlert className="h-2.5 w-2.5 text-red-400" />
                  Riesgo
                </span>
                <div className="h-1 rounded-full bg-gray-100">
                  <div
                    className={cn('h-full rounded-full', score!.riskScore >= 60 ? 'bg-red-400' : score!.riskScore >= 30 ? 'bg-amber-400' : 'bg-green-400')}
                    style={{ width: `${score!.riskScore}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-500 tabular-nums">{score!.riskScore}</span>
              </div>
            )}
            {score!.commercialScore > 0 && (
              <div className="flex flex-col gap-0.5">
                <span className="flex items-center gap-0.5 text-[9px] font-medium text-gray-500 uppercase tracking-wide">
                  <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
                  Pot.
                </span>
                <div className="h-1 rounded-full bg-gray-100">
                  <div
                    className={cn('h-full rounded-full bg-emerald-400')}
                    style={{ width: `${score!.commercialScore}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-500 tabular-nums">{score!.commercialScore}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions — always visible */}
        <div className="flex gap-2 pt-1 border-t border-gray-50">
          {onQuickApprove && item.status === 'pending_moderation' && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onQuickApprove(item.id); }}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <CheckCircle className="h-3 w-3" />
              Aprobar
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onQuickReview?.(item.id); }}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-50 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Revisar
          </button>
        </div>
      </div>
    </div>
  );
};
