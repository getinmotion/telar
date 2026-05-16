import React from 'react';
import { SANS } from '@/components/dashboard/dashboardStyles';

interface Props {
  status: 'approved' | 'pending' | 'rejected' | string;
}

const LABELS: Record<string, string> = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
};

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  approved: { color: '#15803d', bg: 'rgba(21,128,61,0.08)',  border: 'rgba(21,128,61,0.2)',   icon: 'check_circle' },
  pending:  { color: '#d97706', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',  icon: 'schedule' },
  rejected: { color: '#dc2626', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',   icon: 'cancel' },
};

const fallback = { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)', icon: 'circle' };

export function TaxonomyStatusBadge({ status }: Props) {
  const s = STATUS_STYLES[status] ?? fallback;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 9999,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color,
      fontFamily: SANS, fontSize: 10, fontWeight: 700,
      letterSpacing: '0.05em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 11, lineHeight: 1 }}>
        {s.icon}
      </span>
      {LABELS[status] ?? status}
    </span>
  );
}
