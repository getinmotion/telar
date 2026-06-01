import React from 'react';
import { AlertTriangle, ImageOff, Store, Clock, CheckCircle } from 'lucide-react';
import { ModerationStatusBadge } from '../ModerationStatusBadge';
import type { QueueScoreApi } from '@/services/moderation.actions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QueueCardItem {
  id: string;
  type: 'product' | 'shop';
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
  issues?: string[];
  region?: string;
  category?: string;
  sku?: string | null;
  email?: string | null;
}

export type QueueViewMode = 'list' | 'grid' | 'table';

interface QueueCardProps {
  item: QueueCardItem;
  score?: QueueScoreApi | null;
  viewMode?: QueueViewMode;
  isSelected?: boolean;
  isChecked?: boolean;
  onSelect: (id: string) => void;
  onCheckChange?: (id: string, checked: boolean) => void;
  onQuickApprove?: (id: string) => void;
  onQuickReview?: (id: string) => void;
  className?: string;
}

export const STATUS_ACCENT_COLOR: Record<string, string> = {
  pending_moderation: '#f59e0b',
  changes_requested:  '#f97316',
  rejected:           '#ef4444',
  approved:           '#10b981',
  approved_with_edits:'#14b8a6',
  draft:              '#9ca3af',
};

// ─── Checkbox ────────────────────────────────────────────────────────────────

function Checkbox({ checked, onChange }: { checked?: boolean; onChange: () => void }) {
  return (
    <div
      onClick={e => { e.stopPropagation(); onChange(); }}
      className={cn(
        'w-4 h-4 rounded shrink-0 cursor-pointer flex items-center justify-center transition-colors',
        checked
          ? 'bg-green-700 border-green-700 border-[1.5px]'
          : 'bg-transparent border-[1.5px] border-slate-300',
      )}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

// ─── Issues badge ────────────────────────────────────────────────────────────

function IssuesBadge({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 shrink-0">
      <AlertTriangle className="w-2.5 h-2.5" />
      {count}
    </span>
  );
}

// ─── List view ───────────────────────────────────────────────────────────────

function ListCard({ item, isSelected, isChecked, onSelect, onCheckChange, onQuickApprove, onQuickReview }: QueueCardProps) {
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es });
  const accentColor = STATUS_ACCENT_COLOR[item.status] ?? '#9ca3af';

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all group',
        isSelected
          ? 'bg-green-50 border-green-200 shadow-sm ring-1 ring-green-700/20'
          : isChecked
          ? 'bg-green-50/60 border-green-200/60'
          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm',
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
    >
      {onCheckChange && (
        <Checkbox checked={isChecked} onChange={() => onCheckChange(item.id, !isChecked)} />
      )}

      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          : <ImageOff className="w-5 h-5 text-slate-300" />
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate leading-snug">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {item.type === 'shop' && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Store className="w-2.5 h-2.5" /> Taller
            </span>
          )}
          {item.subtitle && (
            <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
              {item.subtitle}
            </span>
          )}
          {item.region && (
            <span className="text-[10px] text-slate-400 shrink-0">{item.region}</span>
          )}
          <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
            <Clock className="w-2.5 h-2.5" /> {timeAgo}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        <ModerationStatusBadge status={item.status} size="sm" />
        {(item.issues?.length ?? 0) > 0 && <IssuesBadge count={item.issues!.length} />}
        <div className="flex items-center gap-1">
          {onQuickApprove && item.status === 'pending_moderation' && (
            <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickApprove(item.id); }}
              className="h-7 text-[11px] border-green-200 bg-green-50 text-green-700 hover:bg-green-100 gap-1">
              <CheckCircle className="w-3 h-3" /> Aprobar
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickReview?.(item.id); }}
            className="h-7 text-[11px] border-slate-200 text-slate-500 hover:bg-slate-50">
            Ver
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Grid view ───────────────────────────────────────────────────────────────

function GridCard({ item, isSelected, isChecked, onSelect, onCheckChange, onQuickApprove, onQuickReview }: QueueCardProps) {
  const accentColor = STATUS_ACCENT_COLOR[item.status] ?? '#9ca3af';
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es });

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={cn(
        'rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col group',
        isSelected
          ? 'ring-2 ring-green-700 shadow-md'
          : 'shadow-sm hover:shadow-md',
        isChecked ? 'bg-green-50' : 'bg-white',
      )}
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      {/* Photo */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="w-7 h-7 text-slate-300" />
            </div>
        }
        {onCheckChange && (
          <div className="absolute top-2 left-2">
            <Checkbox checked={isChecked} onChange={() => onCheckChange(item.id, !isChecked)} />
          </div>
        )}
        {(item.issues?.length ?? 0) > 0 && (
          <div className="absolute top-2 right-2">
            <IssuesBadge count={item.issues!.length} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-xs font-bold text-white truncate leading-snug">{item.title}</p>
          {item.subtitle && (
            <p className="text-[10px] text-white/70 mt-0.5 truncate">{item.subtitle}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-2.5 py-2 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <ModerationStatusBadge status={item.status} size="sm" />
          <span className="text-[10px] text-slate-400 shrink-0">{timeAgo}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onQuickApprove && item.status === 'pending_moderation' && (
            <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickApprove(item.id); }}
              className="h-6 px-2 text-[10px] border-green-200 bg-green-50 text-green-700 hover:bg-green-100 gap-1">
              <CheckCircle className="w-2.5 h-2.5" /> Ok
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickReview?.(item.id); }}
            className="h-6 px-2 text-[10px] border-slate-200 text-slate-500 hover:bg-slate-50">
            Ver
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Table view ──────────────────────────────────────────────────────────────

function TableRow({ item, isSelected, isChecked, onSelect, onCheckChange, onQuickApprove, onQuickReview }: QueueCardProps) {
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es });
  const accentColor = STATUS_ACCENT_COLOR[item.status] ?? '#9ca3af';

  return (
    <div
      onClick={() => onSelect(item.id)}
      className={cn(
        'flex items-center gap-2.5 px-3 py-1.5 cursor-pointer border-b border-slate-50 transition-colors',
        isChecked ? 'bg-green-50' : isSelected ? 'bg-green-50/50' : 'hover:bg-slate-50',
      )}
      style={{ borderLeft: `2px solid ${isSelected || isChecked ? accentColor : 'transparent'}` }}
    >
      {onCheckChange && (
        <Checkbox checked={isChecked} onChange={() => onCheckChange(item.id, !isChecked)} />
      )}

      {/* 32x32 thumb */}
      <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          : <ImageOff className="w-3 h-3 text-slate-300" />
        }
      </div>

      <p className="flex-[2_1_0] text-xs font-semibold text-slate-800 truncate min-w-0">{item.title}</p>
      <p className="flex-[1.5_1_0] text-[11px] text-slate-500 truncate min-w-0">{item.subtitle ?? '—'}</p>
      <p className="flex-[1_1_0] text-[11px] text-slate-400 truncate min-w-0">{item.region ?? '—'}</p>

      <div className="shrink-0"><ModerationStatusBadge status={item.status} size="sm" /></div>

      <div className="w-10 flex justify-center shrink-0">
        {(item.issues?.length ?? 0) > 0
          ? <IssuesBadge count={item.issues!.length} />
          : <span className="text-[10px] text-slate-300">—</span>
        }
      </div>

      <span className="text-[10px] text-slate-400 shrink-0 w-24 text-right">{timeAgo}</span>

      <div className="flex items-center gap-1 shrink-0">
        {onQuickApprove && item.status === 'pending_moderation' && (
          <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickApprove(item.id); }}
            className="h-6 px-2 text-[10px] border-green-200 bg-green-50 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-2.5 h-2.5" />
          </Button>
        )}
        <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickReview?.(item.id); }}
          className="h-6 px-2 text-[10px] border-slate-200 text-slate-500 hover:bg-slate-50">
          Ver
        </Button>
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export const QueueCard: React.FC<QueueCardProps> = (props) => {
  const { viewMode = 'list' } = props;
  if (viewMode === 'grid') return <GridCard {...props} />;
  if (viewMode === 'table') return <TableRow {...props} />;
  return <ListCard {...props} />;
};
