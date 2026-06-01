import React from 'react';

const SANS = "'Manrope', sans-serif";
const SERIF = "'Noto Serif', serif";

const CONTEXT_LABELS: Record<AgentPlaceholderProps['context'], string> = {
  brand:  'Agente de identidad de marca',
  hero:   'Agente de análisis visual',
  policy: 'Agente de política de devoluciones',
  faq:    'Agente de preguntas frecuentes',
};

interface AgentPlaceholderProps {
  context: 'brand' | 'hero' | 'policy' | 'faq';
}

export const AgentPlaceholder: React.FC<AgentPlaceholderProps> = ({ context }) => (
  <div
    style={{
      background: '#151b2d',
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className="material-symbols-outlined" style={{ color: 'rgba(236,109,19,0.5)', fontSize: 18 }}>
        psychology
      </span>
      <span style={{ fontFamily: SERIF, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
        {CONTEXT_LABELS[context]}
      </span>
      <span style={{
        fontFamily: SANS, fontSize: 8, fontWeight: 900, letterSpacing: '0.12em',
        textTransform: 'uppercase' as const, color: 'rgba(236,109,19,0.7)',
        background: 'rgba(236,109,19,0.1)', border: '1px solid rgba(236,109,19,0.2)',
        borderRadius: 100, padding: '2px 8px',
      }}>
        Próximamente
      </span>
    </div>

    {/* Body */}
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8, padding: '10px 14px',
    }}>
      <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 18, flexShrink: 0 }}>
        smart_toy
      </span>
      <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, lineHeight: 1.5 }}>
        Agente IA en camino — disponible pronto
      </p>
    </div>
  </div>
);

export default AgentPlaceholder;
