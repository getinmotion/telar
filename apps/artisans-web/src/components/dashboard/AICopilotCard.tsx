import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useShopPublish } from '@/hooks/useShopPublish';

const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

// Each insight: a human message + one focused action
interface Insight {
  message: string;
  cta: string;
  route: string;
  icon: string;
}

function buildInsight(shopAny: any, canPublish: boolean, isMarketplaceLive: boolean): Insight {
  const hasLogo     = !!shopAny?.logoUrl;
  const hasBanner   = !!shopAny?.bannerUrl || (shopAny?.heroConfig?.slides?.length ?? 0) > 0;
  const hasClaim    = !!shopAny?.brandClaim;
  const hasProfile  = !!shopAny?.artisanProfileCompleted;
  const hasWhatsapp = !!shopAny?.contactConfig?.whatsapp;
  const hasPolicy   = (shopAny?.policiesConfig?.returnPolicy?.length ?? 0) > 30;
  const hasInstagram = !!shopAny?.socialLinks?.instagram;

  // Published & live in marketplace
  if (isMarketplaceLive) {
    if (!hasProfile) return {
      message: 'Tu tienda está en el marketplace, pero los compradores que llegan desde allí buscan la historia detrás de la pieza. Completa tu perfil artesanal — es lo que convierte curiosos en clientes.',
      cta: 'Completar perfil artesanal',
      route: '/dashboard/artisan-profile-wizard',
      icon: 'person_pin',
    };
    if (!hasInstagram) return {
      message: 'Las tiendas con Instagram vinculado generan 2× más tráfico desde el marketplace. Conecta tu cuenta para que los compradores puedan seguirte.',
      cta: 'Vincular Instagram',
      route: '/mi-tienda/configurar',
      icon: 'photo_camera',
    };
    return {
      message: 'Vas muy bien. El siguiente paso para crecer es subir productos con más fotos — los artículos con 4+ imágenes se venden hasta 3× más rápido en el marketplace.',
      cta: 'Gestionar catálogo',
      route: '/inventario',
      icon: 'photo_library',
    };
  }

  // Ready to publish
  if (canPublish && !hasProfile) return {
    message: 'Casi todo está listo para enviar tu tienda a curación. Solo falta completar tu perfil artesanal — es el criterio #1 que evalúa el equipo editorial de TELAR.',
    cta: 'Completar perfil',
    route: '/dashboard/artisan-profile-wizard',
    icon: 'person_pin',
  };

  // Step-by-step guidance for incomplete shops
  if (!hasLogo) return {
    message: 'El logo es lo primero que ve un comprador. Sin él, tu tienda parece genérica en el marketplace. Sube uno — no necesita ser perfecto, puede ser una foto de tu marca o taller.',
    cta: 'Subir logo',
    route: '/mi-tienda/configurar',
    icon: 'store',
  };
  if (!hasBanner) return {
    message: 'Las tiendas con imagen de portada reciben el doble de clics en el directorio. Sube una foto de tu trabajo, tu taller, o tus manos creando — algo que cuente una historia.',
    cta: 'Subir imagen de portada',
    route: '/mi-tienda/configurar',
    icon: 'panorama',
  };
  if (!hasWhatsapp) return {
    message: 'WhatsApp cierra ventas 5× más rápido que el email. Los compradores de artesanía quieren hablar con el artesano — dale esa posibilidad antes de activar tu tienda.',
    cta: 'Agregar WhatsApp',
    route: '/mi-tienda/configurar',
    icon: 'chat',
  };
  if (!hasPolicy) return {
    message: 'Antes de comprar, el 68% de los compradores busca la política de devoluciones. Sin ella, muchos se van sin comprar. Te tomará 2 minutos configurarla.',
    cta: 'Configurar política',
    route: '/mi-tienda/configurar',
    icon: 'policy',
  };
  if (!hasClaim) return {
    message: 'Tu tienda tiene logo, banner y contacto — solo le falta tu voz. El eslogan es la frase que resume por qué tu trabajo vale la pena. Ponle palabras.',
    cta: 'Definir eslogan',
    route: '/mi-tienda/configurar',
    icon: 'edit',
  };
  return {
    message: 'Tu tienda está casi lista. Revisa la configuración completa para asegurarte de que todo esté en orden antes de activarla.',
    cta: 'Revisar configuración',
    route: '/mi-tienda/configurar',
    icon: 'checklist',
  };
}

export const AICopilotCard: React.FC = () => {
  const { shop, loading } = useArtisanShop();
  const { checkPublishRequirements } = useShopPublish(shop?.id);
  const navigate = useNavigate();

  const [canPublish,    setCanPublish]    = useState(false);
  const [reqsChecked,   setReqsChecked]   = useState(false);

  const checkReqs = useCallback(async () => {
    if (!shop?.id) return;
    const reqs = await checkPublishRequirements();
    setCanPublish(reqs.canPublish);
    setReqsChecked(true);
  }, [shop?.id, checkPublishRequirements]);

  useEffect(() => {
    if (shop?.id) checkReqs();
  }, [shop?.id, checkReqs]);

  const shopAny = shop as any;
  const isPublished       = shop?.publishStatus === 'published';
  const isMarketplaceLive = isPublished && !!shopAny?.marketplaceApproved;

  const checks = [
    !!shopAny?.logoUrl,
    !!shopAny?.bannerUrl || (shopAny?.heroConfig?.slides?.length ?? 0) > 0,
    !!shopAny?.brandClaim,
    !!shopAny?.artisanProfileCompleted,
    !!shopAny?.contactConfig?.whatsapp,
    (shopAny?.policiesConfig?.returnPolicy?.length ?? 0) > 30,
    !!shopAny?.socialLinks?.instagram,
  ];
  const completionScore = Math.round(checks.filter(Boolean).length / checks.length * 100);

  if (loading || !shop) {
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

  const insight = buildInsight(shopAny, canPublish && reqsChecked, isMarketplaceLive);

  return (
    <div
      style={{
        background: '#151b2d',
        borderRadius: 16,
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle accent blob */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 160, height: 160,
        borderRadius: '50%', background: 'rgba(236,109,19,0.06)', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, position: 'relative' }}>
        <span className="material-symbols-outlined" style={{ color: '#ec6d13', fontSize: 18 }}>psychology</span>
        <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)', flex: 1 }}>
          Asistente de tienda
        </span>
        <span style={{
          fontSize: 11, fontFamily: SANS, fontWeight: 700,
          color: completionScore >= 80 ? '#4ade80' : completionScore >= 40 ? '#fbbf24' : '#f87171',
          background: completionScore >= 80 ? 'rgba(74,222,128,0.1)' : completionScore >= 40 ? 'rgba(251,191,36,0.1)' : 'rgba(248,113,113,0.1)',
          borderRadius: 20, padding: '2px 8px',
        }}>
          {completionScore}%
        </span>
      </div>

      {/* Thin progress bar */}
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', marginBottom: 16, overflow: 'hidden', position: 'relative' }}>
        <div style={{ height: '100%', borderRadius: 2, background: '#ec6d13', width: `${completionScore}%`, transition: 'width 0.6s ease' }} />
      </div>

      {/* Human message */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'flex-start' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(236,109,19,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ec6d13' }}>{insight.icon}</span>
          </div>
          <p style={{
            fontFamily: SANS, fontSize: 13, lineHeight: 1.65,
            color: 'rgba(255,255,255,0.72)', margin: 0,
          }}>
            {insight.message}
          </p>
        </div>

        <button
          onClick={() => navigate(insight.route)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#ec6d13', color: 'white', border: 'none',
            borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
            fontFamily: SANS, fontSize: 12, fontWeight: 700,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          {insight.cta}
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default AICopilotCard;
