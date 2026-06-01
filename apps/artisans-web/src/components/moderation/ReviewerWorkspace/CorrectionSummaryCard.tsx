import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SANS } from '@/components/dashboard/dashboardStyles';
import type { FieldCorrection, CorrectionType } from './CorrectionTypeSelector';

interface CorrectionSummaryCardProps {
  corrections: FieldCorrection[];
  className?: string;
}

const TYPE_STYLES: Record<CorrectionType, { color: string; bg: string; border: string; icon: string; label: string; note: string }> = {
  minor: {
    color: '#2563eb', bg: 'rgba(37,99,235,0.07)', border: 'rgba(37,99,235,0.18)',
    icon: 'info', label: 'Menor', note: 'No notifica al artesano',
  },
  medium: {
    color: '#d97706', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.18)',
    icon: 'notifications', label: 'Medio', note: 'Artesano será notificado',
  },
  grave: {
    color: '#ea580c', bg: 'rgba(234,88,12,0.07)', border: 'rgba(234,88,12,0.18)',
    icon: 'warning', label: 'Importante', note: 'Requiere confirmación del artesano',
  },
};

const ORDER: CorrectionType[] = ['grave', 'medium', 'minor'];

export const CorrectionSummaryCard: React.FC<CorrectionSummaryCardProps> = ({ corrections, className }) => {
  if (corrections.length === 0) return null;

  const grouped = ORDER.reduce<Record<CorrectionType, FieldCorrection[]>>(
    (acc, t) => { acc[t] = corrections.filter((c) => c.type === t); return acc; },
    { grave: [], medium: [], minor: [] },
  );

  return (
    <div style={{ borderRadius: 10, border: '1px solid rgba(84,67,62,0.1)', background: 'rgba(255,255,255,0.9)', overflow: 'hidden' }} className={className}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(84,67,62,0.08)', background: 'rgba(84,67,62,0.03)' }}>
        <p style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#151b2d', margin: 0 }}>
          Resumen de cambios — {corrections.length} campo{corrections.length !== 1 ? 's' : ''} modificado{corrections.length !== 1 ? 's' : ''}
        </p>
        <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.5)', marginTop: 2 }}>
          Esto quedará en el historial de auditoría TELAR.
        </p>
      </div>

      {ORDER.map((type) => {
        const items = grouped[type];
        if (items.length === 0) return null;
        const s = TYPE_STYLES[type];

        return (
          <div key={type} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(84,67,62,0.06)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 6, borderRadius: 6, padding: '2px 8px', background: s.bg, border: `1px solid ${s.border}` }}>
              <span className="material-symbols-outlined" style={{ fontSize: 12, color: s.color }}>{s.icon}</span>
              <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</span>
              <span style={{ fontFamily: SANS, fontSize: 10, color: s.color, opacity: 0.7 }}>— {s.note}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 4 }}>
              {items.map((c) => (
                <div key={c.field} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: SANS, fontSize: 11 }}>
                  <span style={{ fontWeight: 600, color: 'rgba(84,67,62,0.55)', width: 96, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.fieldLabel}</span>
                  <span style={{ textDecoration: 'line-through', color: 'rgba(84,67,62,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>{c.oldValue || '(vacío)'}</span>
                  <ArrowRight style={{ width: 11, height: 11, color: 'rgba(84,67,62,0.3)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: '#151b2d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>{c.newValue || '(vacío)'}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
