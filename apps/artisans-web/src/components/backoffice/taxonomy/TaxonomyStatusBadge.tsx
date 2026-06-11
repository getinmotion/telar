import React from 'react';
import {
  SANS, GREEN_MOD, AMBER, AMBER_DARK, RED, SKY, GRAY_500,
  greenA, amberA, amberDarkA, redA, skyA,
} from '@/components/dashboard/dashboardStyles';

interface Props {
  status: 'approved' | 'pending' | 'rejected' | string;
}

const LABELS: Record<string, string> = {
  approved:  'Aprobado',
  pending:   'Pendiente',
  rejected:  'Rechazado',
  emergente: 'Emergente',
  regional:  'Regional',
};

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  approved:  { color: GREEN_MOD,  bg: greenA(0.08),     border: greenA(0.2),     icon: 'check_circle'  },
  pending:   { color: AMBER,      bg: amberA(0.08),     border: amberA(0.2),     icon: 'schedule'      },
  rejected:  { color: RED,        bg: redA(0.08),       border: redA(0.2),       icon: 'cancel'        },
  emergente: { color: AMBER_DARK, bg: amberDarkA(0.08), border: amberDarkA(0.2), icon: 'trending_up'   },
  regional:  { color: SKY,        bg: skyA(0.08),       border: skyA(0.2),       icon: 'map'           },
};

const fallback = { color: GRAY_500, bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)', icon: 'circle' };

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
