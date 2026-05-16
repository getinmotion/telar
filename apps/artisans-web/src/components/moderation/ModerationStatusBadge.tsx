import React from 'react';
import { SANS } from '@/components/dashboard/dashboardStyles';
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

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  draft:               { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)', icon: 'draft' },
  pending_moderation:  { color: '#d97706', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',   icon: 'schedule' },
  approved:            { color: '#15803d', bg: 'rgba(21,128,61,0.08)',   border: 'rgba(21,128,61,0.2)',    icon: 'check_circle' },
  approved_with_edits: { color: '#0d9488', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.2)',   icon: 'edit' },
  changes_requested:   { color: '#ea580c', bg: 'rgba(234,88,12,0.08)',   border: 'rgba(234,88,12,0.2)',    icon: 'warning' },
  rejected:            { color: '#dc2626', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',    icon: 'cancel' },
  archived:            { color: '#6b7280', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.14)', icon: 'inventory_2' },
};

const ICON_SIZE: Record<string, number> = { sm: 11, md: 13, lg: 15 };
const FONT_SIZE: Record<string, number> = { sm: 9, md: 10, lg: 12 };
const PADDING: Record<string, string> = { sm: '1px 6px', md: '2px 8px', lg: '3px 10px' };

export const ModerationStatusBadge: React.FC<ModerationStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  const label = MODERATION_STATUS_LABELS[status] ?? MODERATION_STATUS_LABELS['draft'];

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: PADDING[size], borderRadius: 9999,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color,
      fontFamily: SANS, fontSize: FONT_SIZE[size], fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {showIcon && (
        <span className="material-symbols-outlined" style={{ fontSize: ICON_SIZE[size], lineHeight: 1 }}>
          {s.icon}
        </span>
      )}
      {label}
    </span>
  );
};
