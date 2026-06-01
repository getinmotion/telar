import React from 'react';
import { useNavigate } from 'react-router-dom';

const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

interface MissionsAgentCardProps {
  completedCount: number;
  totalCount: number;
  nextMission: { title: string; route: string; icon: string } | null;
  loading?: boolean;
}

function buildMessage(completedCount: number, totalCount: number): string {
  if (completedCount === 0) {
    return 'Tu camino artesanal empieza aquí. Cada misión construye la base de tu tienda — empieza creando tu espacio en TELAR y el resto fluirá.';
  }
  if (completedCount < 4) {
    return 'Vas avanzando. Las misiones que completes ahora son las que deciden si un comprador confía en tu tienda o sigue buscando. Continúa con la siguiente.';
  }
  if (completedCount < totalCount) {
    return 'Casi terminaste el recorrido fundacional. Con estos últimos pasos tu tienda tiene todo lo que necesita para atraer y convencer compradores.';
  }
  return '¡Camino artesanal completado! Tu tienda está completamente configurada. El equipo de TELAR puede evaluar tu perfil para el marketplace.';
}

export const MissionsAgentCard: React.FC<MissionsAgentCardProps> = ({
  completedCount,
  totalCount,
  nextMission,
  loading,
}) => {
  const navigate = useNavigate();
  const progressPct = Math.round((completedCount / totalCount) * 100);

  if (loading) {
    return (
      <div style={{ background: '#151b2d', borderRadius: 16, padding: '20px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[80, 60, 40].map(w => (
            <div key={w} style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.06)', width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }

  const badgeColor = progressPct >= 80 ? '#4ade80' : progressPct >= 40 ? '#fbbf24' : '#f87171';
  const badgeBg   = progressPct >= 80 ? 'rgba(74,222,128,0.1)' : progressPct >= 40 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)';
  const message   = buildMessage(completedCount, totalCount);
  const isComplete = completedCount >= totalCount;

  return (
    <div style={{ background: '#151b2d', borderRadius: 16, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
      {/* Accent blob */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 160, height: 160,
        borderRadius: '50%', background: 'rgba(236,109,19,0.06)', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, position: 'relative' }}>
        <span className="material-symbols-outlined" style={{ color: '#ec6d13', fontSize: 18 }}>flag</span>
        <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', flex: 1 }}>
          Camino Artesanal
        </span>
        <span style={{
          fontSize: 11, fontFamily: SANS, fontWeight: 700,
          color: badgeColor, background: badgeBg,
          borderRadius: 20, padding: '2px 8px',
        }}>
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, background: '#ec6d13', width: `${progressPct}%`, transition: 'width 0.6s ease' }} />
      </div>

      {/* Message */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: isComplete ? 0 : 16, alignItems: 'flex-start' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(236,109,19,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ec6d13' }}>
              {isComplete ? 'emoji_events' : 'psychology'}
            </span>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.72)', margin: 0 }}>
            {message}
          </p>
        </div>

        {!isComplete && nextMission && (
          <button
            onClick={() => navigate(nextMission.route)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#ec6d13', color: 'white', border: 'none',
              borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
              fontFamily: SANS, fontSize: 12, fontWeight: 700,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Continuar
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
};
