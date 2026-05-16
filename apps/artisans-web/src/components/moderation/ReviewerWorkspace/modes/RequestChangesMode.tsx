import React, { useState } from 'react';
import { Loader2, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SANS } from '@/components/dashboard/dashboardStyles';

const C = '#d97706';
const rgba = (a: number) => `rgba(245,158,11,${a})`;

interface RequestChangesModeProps {
  onRequestChanges: (comment: string) => Promise<void>;
  moderating: boolean;
}

const CHANGE_TEMPLATES = [
  'Necesitamos al menos 3 fotos con fondo neutro y buena iluminación.',
  'La descripción debe contar la historia de la pieza y los materiales usados.',
  'Revisa la categoría — parece que no corresponde con el tipo de artesanía.',
  'Agrega el peso y dimensiones para que el cálculo de envío sea correcto.',
  'Los materiales indicados no coinciden con lo que se ve en las fotos.',
];

export const RequestChangesMode: React.FC<RequestChangesModeProps> = ({ onRequestChanges, moderating }) => {
  const [comment, setComment] = useState('');
  const [hoveredTpl, setHoveredTpl] = useState<number | null>(null);
  const canSubmit = comment.trim().length >= 20;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onRequestChanges(comment.trim());
  };

  const applyTemplate = (text: string) => {
    setComment((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n\n${text}` : text;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#f59e0b', padding: '16px 20px', borderBottom: `1px solid ${rgba(0.4)}` }}>
        <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: 'rgba(255,255,255,0.2)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'white' }}>chat</span>
        </div>
        <div>
          <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: 'white', margin: 0 }}>Pedir ajustes al artesano</p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
            La pieza queda en espera. El artesano puede corregirla y reenviarla.
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
        {/* Templates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C }}>
            Sugerencias comunes
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {CHANGE_TEMPLATES.map((tmpl, i) => (
              <button
                key={tmpl}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                onMouseEnter={() => setHoveredTpl(i)}
                onMouseLeave={() => setHoveredTpl(null)}
                style={{
                  display: 'flex', width: '100%', alignItems: 'flex-start', gap: 8,
                  borderRadius: 8, border: `1px solid ${hoveredTpl === i ? rgba(0.3) : rgba(0.15)}`,
                  background: hoveredTpl === i ? rgba(0.06) : 'rgba(255,255,255,0.7)',
                  padding: '8px 12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                <ChevronRight style={{ width: 13, height: 13, flexShrink: 0, color: C, marginTop: 1 }} />
                <span style={{ fontFamily: SANS, fontSize: 11, color: '#151b2d', lineHeight: 1.5 }}>{tmpl}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontFamily: SANS, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C }}>
              Mensaje al artesano
            </label>
            <span style={{ fontFamily: SANS, fontSize: 10, fontWeight: 600, color: canSubmit ? C : 'rgba(84,67,62,0.35)' }}>
              {comment.trim().length}/20 mín.
            </span>
          </div>
          <Textarea
            placeholder="Explica qué necesita mejorar para que la pieza sea aprobada. Sé específico y constructivo."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="text-sm bg-white resize-none"
          />
          <p style={{ fontFamily: SANS, fontSize: 10, color: rgba(0.7) }}>
            El artesano recibirá este mensaje y podrá editar y reenviar su pieza.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: `1px solid ${rgba(0.18)}`, background: rgba(0.05), padding: 20 }}>
        <button
          onClick={handleSubmit}
          disabled={moderating || !canSubmit}
          style={{
            width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            borderRadius: 10, border: 'none', cursor: (moderating || !canSubmit) ? 'not-allowed' : 'pointer',
            background: '#f59e0b', color: 'white',
            fontFamily: SANS, fontSize: 14, fontWeight: 700,
            opacity: (moderating || !canSubmit) ? 0.4 : 1, transition: 'all 0.15s',
          }}
        >
          {moderating ? (
            <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>chat</span>
          )}
          Enviar solicitud de ajustes
        </button>
      </div>
    </div>
  );
};
