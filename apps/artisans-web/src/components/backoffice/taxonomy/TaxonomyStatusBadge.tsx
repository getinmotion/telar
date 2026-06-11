import React from 'react';
<<<<<<< HEAD
import { SANS } from '@/components/dashboard/dashboardStyles';
=======
import {
  SANS, GREEN_MOD, AMBER, AMBER_DARK, RED, SKY, GRAY_500,
  greenA, amberA, amberDarkA, redA, skyA,
} from '@/components/dashboard/dashboardStyles';
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119

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
<<<<<<< HEAD
  approved:  { color: '#15803d', bg: 'rgba(21,128,61,0.08)',   border: 'rgba(21,128,61,0.2)',    icon: 'check_circle'  },
  pending:   { color: '#d97706', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',   icon: 'schedule'      },
  rejected:  { color: '#dc2626', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',    icon: 'cancel'        },
  emergente: { color: '#b45309', bg: 'rgba(180,83,9,0.08)',    border: 'rgba(180,83,9,0.2)',     icon: 'trending_up'   },
  regional:  { color: '#0369a1', bg: 'rgba(3,105,161,0.08)',   border: 'rgba(3,105,161,0.2)',    icon: 'map'           },
};

const fallback = { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)', icon: 'circle' };
=======
  approved:  { color: GREEN_MOD,  bg: greenA(0.08),     border: greenA(0.2),     icon: 'check_circle'  },
  pending:   { color: AMBER,      bg: amberA(0.08),     border: amberA(0.2),     icon: 'schedule'      },
  rejected:  { color: RED,        bg: redA(0.08),       border: redA(0.2),       icon: 'cancel'        },
  emergente: { color: AMBER_DARK, bg: amberDarkA(0.08), border: amberDarkA(0.2), icon: 'trending_up'   },
  regional:  { color: SKY,        bg: skyA(0.08),       border: skyA(0.2),       icon: 'map'           },
};

const fallback = { color: GRAY_500, bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.18)', icon: 'circle' };
>>>>>>> 55b6c814fec72ddbe13ae07fd096a2d1354fc119

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
