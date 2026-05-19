import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SANS, SERIF, GREEN_MOD } from '@/components/dashboard/dashboardStyles';

const rgba = (a: number) => `rgba(21,128,61,${a})`;

interface ApprovalModeProps {
  onApprove: (comment?: string) => Promise<void>;
  moderating: boolean;
}

export const ApprovalMode: React.FC<ApprovalModeProps> = ({ onApprove, moderating }) => {
  const [withNote, setWithNote] = useState(false);
  const [note, setNote] = useState('');
  const [hoverNote, setHoverNote] = useState(false);

  const handleApprove = async () => {
    await onApprove(withNote ? note.trim() || undefined : undefined);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '48px 32px', textAlign: 'center', borderBottom: `1px solid ${rgba(0.1)}` }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9999, background: rgba(0.08), boxShadow: `0 0 0 12px ${rgba(0.04)}` }}>
            <span className="material-symbols-outlined" style={{ fontSize: 40, color: GREEN_MOD }}>check_circle</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h3 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: '#151b2d', margin: 0 }}>Lista para el marketplace</h3>
          <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(84,67,62,0.65)', maxWidth: 260, margin: '0 auto', lineHeight: 1.5 }}>
            Esta pieza cumple con todos los criterios de calidad de TELAR.
          </p>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 9999, background: rgba(0.08), border: `1px solid ${rgba(0.2)}`, padding: '6px 16px', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: GREEN_MOD, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
          Estado: Aprobada y visible
        </span>
      </div>

      {/* Nota opcional */}
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button
          type="button"
          onClick={() => setWithNote((v) => !v)}
          onMouseEnter={() => setHoverNote(true)}
          onMouseLeave={() => setHoverNote(false)}
          style={{
            display: 'flex', width: '100%', alignItems: 'flex-start', gap: 12,
            borderRadius: 12, border: `1px dashed ${hoverNote ? rgba(0.3) : rgba(0.18)}`,
            background: hoverNote ? rgba(0.04) : 'rgba(255,255,255,0.7)',
            padding: '12px 16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: GREEN_MOD, flexShrink: 0, marginTop: 2 }}>chat</span>
          <div>
            <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#151b2d', margin: 0 }}>
              {withNote ? 'Quitar observación' : 'Agregar observación positiva'}
            </p>
            <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.55)', marginTop: 2 }}>
              Opcional — el artesano la verá junto con la notificación de aprobación
            </p>
          </div>
        </button>

        {withNote && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: GREEN_MOD }}>
              Mensaje al artesano
            </label>
            <Textarea
              placeholder="Ej: Excelente trabajo. Las fotos son muy claras y la descripción cuenta bien la historia de la pieza."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="text-sm bg-white resize-none"
            />
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ borderTop: `1px solid ${rgba(0.1)}`, background: rgba(0.04), padding: 20 }}>
        <button
          onClick={handleApprove}
          disabled={moderating}
          style={{
            width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 10, border: 'none', cursor: moderating ? 'not-allowed' : 'pointer',
            background: GREEN_MOD, color: 'white',
            fontFamily: SANS, fontSize: 14, fontWeight: 700,
            opacity: moderating ? 0.55 : 1, transition: 'all 0.15s',
          }}
        >
          {moderating ? (
            <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
          )}
          {withNote ? 'Aprobar con observación' : 'Aprobar y publicar'}
        </button>
      </div>
    </div>
  );
};
