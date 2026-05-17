import React from 'react';
import { AlertTriangle, ImageOff, Store, Clock, CheckCircle } from 'lucide-react';
import { ModerationStatusBadge } from '../ModerationStatusBadge';
import type { QueueScoreApi } from '@/services/moderation.actions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { SANS, SERIF, glassPrimary, glassGreen, GREEN_MOD } from '@/components/dashboard/dashboardStyles';
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
          : 'bg-transparent border-[1.5px] border-stone-400/40',
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
    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-700 shrink-0">
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
      style={{
        ...(isChecked ? glassGreen : glassPrimary),
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 10,
        borderLeft: `3px solid ${accentColor}`, cursor: 'pointer',
        transition: 'all 0.12s',
        outline: isSelected ? `2px solid ${GREEN_MOD}` : 'none', outlineOffset: 1,
      }}
    >
      {onCheckChange && (
        <Checkbox checked={isChecked} onChange={() => onCheckChange(item.id, !isChecked)} />
      )}

      {/* Thumbnail */}
      <div style={{
        width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
        background: 'rgba(21,27,45,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <ImageOff style={{ width: 20, height: 20, color: 'rgba(84,67,62,0.3)' }} />
        }
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#151b2d', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
          {item.type === 'shop' && (
            <span style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.5)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Store style={{ width: 10, height: 10 }} /> Taller
            </span>
          )}
          {item.subtitle && (
            <span style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
              {item.subtitle}
            </span>
          )}
          {item.region && (
            <span style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.4)', flexShrink: 0 }}>
              {item.region}
            </span>
          )}
          <span style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.4)', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <Clock style={{ width: 10, height: 10 }} /> {timeAgo}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <ModerationStatusBadge status={item.status} size="sm" />
        {(item.issues?.length ?? 0) > 0 && <IssuesBadge count={item.issues!.length} />}
        <div className="flex items-center gap-1">
          {onQuickApprove && item.status === 'pending_moderation' && (
            <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickApprove(item.id); }}
              className="h-7 text-[11px] border-green-700/20 bg-green-700/7 text-green-700 hover:bg-green-700/15 gap-1">
              <CheckCircle className="w-3 h-3" /> Aprobar
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickReview?.(item.id); }}
            className="h-7 text-[11px] border-stone-900/10 bg-stone-900/4 text-stone-500 hover:bg-stone-100">
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
      style={{
        ...(isChecked ? glassGreen : glassPrimary),
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.15s', display: 'flex', flexDirection: 'column',
        outline: isSelected ? `2px solid ${GREEN_MOD}` : 'none', outlineOffset: 1,
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      {/* Photo */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: 'rgba(21,27,45,0.05)', overflow: 'hidden' }}>
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageOff style={{ width: 28, height: 28, color: 'rgba(84,67,62,0.25)' }} />
            </div>
        }
        {/* Checkbox overlay */}
        {onCheckChange && (
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <Checkbox checked={isChecked} onChange={() => onCheckChange(item.id, !isChecked)} />
          </div>
        )}
        {/* Issues badge */}
        {(item.issues?.length ?? 0) > 0 && (
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            <IssuesBadge count={item.issues!.length} />
          </div>
        )}
        {/* Gradient + title overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(21,27,45,0.65) 0%, transparent 50%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 10px 8px' }}>
          <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'white', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title}
          </p>
          {item.subtitle && (
            <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <ModerationStatusBadge status={item.status} size="sm" />
          <span style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.4)', flexShrink: 0 }}>
            {timeAgo}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onQuickApprove && item.status === 'pending_moderation' && (
            <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickApprove(item.id); }}
              className="h-6 px-2 text-[10px] border-green-700/20 bg-green-700/7 text-green-700 hover:bg-green-700/15 gap-1">
              <CheckCircle className="w-2.5 h-2.5" /> Ok
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickReview?.(item.id); }}
            className="h-6 px-2 text-[10px] border-stone-900/10 bg-stone-900/4 text-stone-500 hover:bg-stone-100">
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
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 12px', cursor: 'pointer',
        borderBottom: '1px solid rgba(21,27,45,0.04)',
        background: isChecked ? 'rgba(21,128,61,0.05)' : isSelected ? 'rgba(21,128,61,0.03)' : 'transparent',
        borderLeft: `2px solid ${isSelected || isChecked ? accentColor : 'transparent'}`,
        transition: 'background 0.1s',
      }}
    >
      {onCheckChange && (
        <Checkbox checked={isChecked} onChange={() => onCheckChange(item.id, !isChecked)} />
      )}

      {/* 32x32 thumb */}
      <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'rgba(21,27,45,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          : <ImageOff style={{ width: 12, height: 12, color: 'rgba(84,67,62,0.3)' }} />
        }
      </div>

      {/* Name — flex 2 */}
      <p style={{ flex: '2 1 0', fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#151b2d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
        {item.title}
      </p>

      {/* Shop — flex 1.5 */}
      <p style={{ flex: '1.5 1 0', fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
        {item.subtitle ?? '—'}
      </p>

      {/* Region — flex 1 */}
      <p style={{ flex: '1 1 0', fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
        {item.region ?? '—'}
      </p>

      {/* Status */}
      <div style={{ flexShrink: 0 }}>
        <ModerationStatusBadge status={item.status} size="sm" />
      </div>

      {/* Issues */}
      <div style={{ width: 40, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
        {(item.issues?.length ?? 0) > 0
          ? <IssuesBadge count={item.issues!.length} />
          : <span style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.3)' }}>—</span>
        }
      </div>

      {/* Date */}
      <span style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.4)', flexShrink: 0, width: 90, textAlign: 'right' }}>
        {timeAgo}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {onQuickApprove && item.status === 'pending_moderation' && (
          <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickApprove(item.id); }}
            className="h-6 px-2 text-[10px] border-green-700/20 bg-green-700/7 text-green-700 hover:bg-green-700/15">
            <CheckCircle className="w-2.5 h-2.5" />
          </Button>
        )}
        <Button type="button" size="sm" variant="outline" onClick={e => { e.stopPropagation(); onQuickReview?.(item.id); }}
          className="h-6 px-2 text-[10px] border-stone-900/10 bg-transparent text-stone-500 hover:bg-stone-100">
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
