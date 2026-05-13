import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useShopPublish } from '@/hooks/useShopPublish';

// ── Design tokens ─────────────────────────────────────────────────────────────
const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

// ── Types ─────────────────────────────────────────────────────────────────────
type CardState = 'loading' | 'incomplete' | 'ready' | 'published';

interface PriorityAction {
  label: string;
  section: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const AICopilotCard: React.FC = () => {
  const { shop, loading } = useArtisanShop();
  const { checkPublishRequirements } = useShopPublish(shop?.id);
  const navigate = useNavigate();

  const [canPublish, setCanPublish] = useState(false);
  const [reqsChecked, setReqsChecked] = useState(false);

  const checkReqs = useCallback(async () => {
    if (!shop?.id) return;
    const reqs = await checkPublishRequirements();
    setCanPublish(reqs.canPublish);
    setReqsChecked(true);
  }, [shop?.id, checkPublishRequirements]);

  useEffect(() => {
    if (shop?.id) checkReqs();
  }, [shop?.id, checkReqs]);

  // ── Completion score ────────────────────────────────────────────────────────
  const shopAny = shop as any;
  const logoUrl     = shopAny?.logoUrl;
  const bannerUrl   = shopAny?.bannerUrl;
  const brandClaim  = shopAny?.brandClaim;
  const artisanProfileCompleted = shopAny?.artisanProfileCompleted;
  const whatsapp    = shopAny?.contactConfig?.whatsapp;
  const returnPolicy = shopAny?.policiesConfig?.returnPolicy;
  const heroSlides  = (shopAny?.heroConfig as any)?.slides ?? [];
  const instagram   = shopAny?.socialLinks?.instagram;

  const checks = [
    !!logoUrl,
    !!bannerUrl,
    !!brandClaim,
    !!artisanProfileCompleted,
    !!whatsapp,
    !!(returnPolicy && returnPolicy.length > 30),
    !!(heroSlides.length > 0),
    !!instagram,
  ];
  const completionScore = Math.round(checks.filter(Boolean).length / 8 * 100);

  // ── Priority actions ────────────────────────────────────────────────────────
  const allActions: (PriorityAction & { check: boolean })[] = [
    { check: !!logoUrl,                                    label: 'Sube el logo de tu tienda',           section: 's1' },
    { check: !!bannerUrl || heroSlides.length > 0,         label: 'Tu tienda no tiene imagen de portada', section: 's2' },
    { check: !!artisanProfileCompleted,                    label: 'Completa tu perfil artesanal',         section: 's3' },
    { check: !!(returnPolicy && returnPolicy.length > 30), label: 'Agrega una política de devoluciones',  section: 's5' },
    { check: !!brandClaim,                                 label: 'Define el tagline de tu marca',        section: 's1' },
    { check: !!whatsapp,                                   label: 'Agrega tu WhatsApp de contacto',       section: 's4' },
  ];
  const topActions = allActions.filter(a => !a.check).slice(0, 3);

  // ── Card state ──────────────────────────────────────────────────────────────
  const isPublished = shop?.publishStatus === 'published';
  const isMarketplaceLive = isPublished && !!shopAny?.marketplaceApproved;

  let cardState: CardState = 'loading';
  if (!loading && shop) {
    if (isMarketplaceLive) {
      cardState = 'published';
    } else if (canPublish && reqsChecked && topActions.length === 0) {
      cardState = 'ready';
    } else if (!loading) {
      cardState = 'incomplete';
    }
  }

  const goToSection = (section: string) => {
    navigate(`/mi-tienda/configurar?section=${section}`);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: '#151b2d',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle bg accent */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 160, height: 160,
        borderRadius: '50%', background: 'rgba(236,109,19,0.07)', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span className="material-symbols-outlined" style={{ color: '#ec6d13', fontSize: 20 }}>
          psychology
        </span>
        <span style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
          Asistente de tienda
        </span>
        {cardState !== 'loading' && (
          <span style={{
            marginLeft: 'auto', fontSize: 12, fontFamily: SANS, fontWeight: 600,
            color: completionScore >= 80 ? '#4ade80' : completionScore >= 40 ? '#fbbf24' : '#f87171',
            background: completionScore >= 80 ? 'rgba(74,222,128,0.12)' : completionScore >= 40 ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
            borderRadius: 20, padding: '2px 8px',
          }}>
            {completionScore}% completo
          </span>
        )}
      </div>

      {/* Loading state */}
      {cardState === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.06)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      )}

      {/* Incomplete state */}
      {cardState === 'incomplete' && (
        <>
          {/* Progress bar */}
          <div style={{
            height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)',
            marginBottom: 14, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 4, background: '#ec6d13',
              width: `${completionScore}%`, transition: 'width 0.5s ease',
            }} />
          </div>

          {/* Priority actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topActions.length === 0 ? (
              <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                Tu tienda está casi lista — espera resultados de requisitos.
              </p>
            ) : (
              topActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => goToSection(action.section)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: '8px 12px', cursor: 'pointer',
                    transition: 'background 0.15s',
                    textAlign: 'left', width: '100%',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(236,109,19,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                >
                  <span className="material-symbols-outlined" style={{ color: '#ec6d13', fontSize: 16, flexShrink: 0 }}>
                    radio_button_unchecked
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1 }}>
                    {action.label}
                  </span>
                  <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>
                    arrow_forward
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* Ready to publish state */}
      {cardState === 'ready' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#4ade80',
              boxShadow: '0 0 6px #4ade80', display: 'inline-block', animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontFamily: SANS, fontSize: 14, color: '#fff', fontWeight: 600 }}>
              Tu tienda está lista para publicar 🚀
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#ec6d13', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 20px', fontFamily: SANS, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', alignSelf: 'flex-start',
            }}
          >
            Activar y enviar a curación
          </button>
        </div>
      )}

      {/* Published state */}
      {cardState === 'published' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '0 0 4px' }}>
            Sigue mejorando tu tienda
          </p>
          {[
            { label: 'Sube más fotos a tus productos',        icon: 'photo_camera' },
            { label: 'Agrega la historia de tu taller',       icon: 'history_edu' },
            { label: 'Crea una FAQ para tus compradores',     icon: 'quiz' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 8, padding: '8px 12px',
            }}>
              <span className="material-symbols-outlined" style={{ color: '#ec6d13', fontSize: 16 }}>
                {item.icon}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AICopilotCard;
