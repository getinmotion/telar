import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SANS, SERIF } from '@/components/dashboard/dashboardStyles';

const C = '#dc2626';
const rgba = (a: number) => `rgba(239,68,68,${a})`;

export type RejectionReasonType =
  | 'quality_insufficient'
  | 'inconsistent_info'
  | 'policy_violation'
  | 'fraud'
  | 'duplicate'
  | 'invalid_content';

interface RejectionModeProps {
  onReject: (reason: RejectionReasonType, comment: string) => Promise<void>;
  moderating: boolean;
}

const REJECTION_REASONS: {
  value: RejectionReasonType;
  label: string;
  hint: string;
  severity: 'high' | 'medium';
}[] = [
  { value: 'quality_insufficient', label: 'Calidad insuficiente', hint: 'Imágenes borrosas, descripción muy incompleta o pieza no lista para el marketplace.', severity: 'medium' },
  { value: 'inconsistent_info',    label: 'Información inconsistente', hint: 'El nombre, categoría o materiales no corresponden al producto real.', severity: 'medium' },
  { value: 'policy_violation',     label: 'No cumple políticas', hint: 'Viola los términos del marketplace (producto prohibido, derechos, etc.).', severity: 'high' },
  { value: 'fraud',                label: 'Posible fraude', hint: 'Producto falso, copiado o de dudosa procedencia.', severity: 'high' },
  { value: 'duplicate',            label: 'Duplicado grave', hint: 'Ya existe esta pieza publicada con información idéntica.', severity: 'medium' },
  { value: 'invalid_content',      label: 'Contenido inválido', hint: 'Producto vacío, incompleto o sin relación con artesanías.', severity: 'medium' },
];

export const RejectionMode: React.FC<RejectionModeProps> = ({ onReject, moderating }) => {
  const [selectedReason, setSelectedReason] = useState<RejectionReasonType | null>(null);
  const [comment, setComment] = useState('');
  const [hoveredReason, setHoveredReason] = useState<string | null>(null);

  const canSubmit = selectedReason && comment.trim().length >= 20;

  const handleReject = async () => {
    if (!selectedReason || !comment.trim()) return;
    await onReject(selectedReason, comment.trim());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#b91c1c', padding: '16px 20px', borderBottom: `1px solid rgba(239,68,68,0.4)` }}>
        <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(255,255,255,0.2)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'white' }}>warning</span>
        </div>
        <div>
          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>No disponible para el marketplace</p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
            Acción permanente. El artesano recibirá tu retroalimentación por correo.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
        {/* Motivos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C }}>
            Motivo principal
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {REJECTION_REASONS.map(({ value, label, hint, severity }) => {
              const isSelected = selectedReason === value;
              const isHovered = hoveredReason === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedReason(value)}
                  onMouseEnter={() => setHoveredReason(value)}
                  onMouseLeave={() => setHoveredReason(null)}
                  style={{
                    borderRadius: 10, padding: '10px 14px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.12s',
                    border: isSelected ? `2px solid ${C}` : `1.5px solid ${isHovered ? rgba(0.25) : rgba(0.12)}`,
                    background: isSelected ? rgba(0.05) : isHovered ? rgba(0.03) : 'rgba(255,255,255,0.8)',
                    ...(isSelected ? { boxShadow: `0 0 0 3px ${rgba(0.12)}` } : {}),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: isSelected ? C : '#151b2d' }}>
                      {label}
                    </span>
                    {severity === 'high' && (
                      <span style={{ borderRadius: 9999, padding: '1px 7px', fontFamily: SANS, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: isSelected ? rgba(0.12) : 'rgba(84,67,62,0.06)', color: isSelected ? C : 'rgba(84,67,62,0.5)' }}>
                        GRAVE
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: 11, marginTop: 2, lineHeight: 1.45, color: isSelected ? rgba(0.8) : 'rgba(84,67,62,0.55)', margin: '3px 0 0' }}>
                    {hint}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Retroalimentación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C }}>
              Retroalimentación al artesano
            </label>
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: comment.trim().length >= 20 ? C : 'rgba(84,67,62,0.35)' }}>
              {comment.trim().length}/20 mín.
            </span>
          </div>
          <Textarea
            placeholder="Explica de forma clara y constructiva qué necesita mejorar esta pieza para estar en el marketplace."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="text-sm bg-white resize-none"
          />
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: `2px solid ${rgba(0.15)}`, background: rgba(0.04), padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {selectedReason && (
          <p style={{ fontFamily: SANS, fontSize: 11, color: C, fontWeight: 600, textAlign: 'center', margin: 0 }}>
            Motivo: <span style={{ fontWeight: 800 }}>{REJECTION_REASONS.find(r => r.value === selectedReason)?.label}</span>
          </p>
        )}
        <button
          onClick={handleReject}
          disabled={moderating || !canSubmit}
          style={{
            width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 10, border: 'none', cursor: (moderating || !canSubmit) ? 'not-allowed' : 'pointer',
            background: C, color: 'white',
            fontFamily: SANS, fontSize: 14, fontWeight: 800,
            opacity: (moderating || !canSubmit) ? 0.4 : 1, transition: 'all 0.15s',
          }}
        >
          {moderating ? (
            <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>cancel</span>
          )}
          Confirmar — no publicar esta pieza
        </button>
      </div>
    </div>
  );
};
