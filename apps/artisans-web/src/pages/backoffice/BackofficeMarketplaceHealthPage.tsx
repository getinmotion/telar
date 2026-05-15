import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';
import { useModerationStats, ShopSummary } from '@/hooks/useModerationStats';
import { SANS, SERIF, lc } from '@/components/dashboard/dashboardStyles';

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY   = '#142239';
const ORANGE = '#ec6d13';
const GOLDEN = '#c29200';
const GREEN  = '#166534';
const RED    = '#dc2626';

// ─── Health score por tienda ──────────────────────────────────────────────────
interface ShopHealth {
  shop: ShopSummary;
  score: number;
  missing: string[];
}

function calcShopScore(shop: ShopSummary): ShopHealth {
  let score = 0;
  const missing: string[] = [];

  if (shop.logoUrl) {
    score += 25;
  } else {
    missing.push('Sin logo');
  }
  if (shop.hasBankData) {
    score += 25;
  } else {
    missing.push('Sin datos de cobro');
  }
  if (shop.marketplaceApproved) {
    score += 20;
  } else {
    missing.push('No aprobada en MKT');
  }
  if (shop.publishStatus === 'published') {
    score += 20;
  } else {
    missing.push('No publicada');
  }
  if (shop.region) {
    score += 10;
  } else {
    missing.push('Sin región');
  }

  return { shop, score, missing };
}

function scoreColor(score: number): string {
  if (score >= 80) return GREEN;
  if (score >= 50) return GOLDEN;
  return ORANGE;
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Saludable';
  if (score >= 50) return 'Incompleta';
  return 'Crítica';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface AlertChipProps {
  count: number;
  label: string;
  icon: React.ReactNode;
  urgent?: boolean;
  onClick?: () => void;
}

const AlertChip: React.FC<AlertChipProps> = ({ count, label, icon, urgent, onClick }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all"
    style={{
      background: count > 0 ? (urgent ? 'rgba(236,109,19,0.1)' : 'rgba(20,34,57,0.05)') : 'rgba(22,101,52,0.06)',
      border: count > 0 ? (urgent ? '1px solid rgba(236,109,19,0.25)' : '1px solid rgba(20,34,57,0.1)') : '1px solid rgba(22,101,52,0.2)',
      cursor: onClick ? 'pointer' : 'default',
    }}
  >
    <span style={{ color: count > 0 ? (urgent ? ORANGE : NAVY) : GREEN }}>{icon}</span>
    <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: count > 0 ? (urgent ? ORANGE : NAVY) : GREEN, lineHeight: 1 }}>
      {count}
    </span>
    <span style={{ ...lc(0.4), fontSize: 9, maxWidth: 100 }}>{label}</span>
  </button>
);

interface ScoreBarProps {
  score: number;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ score }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div style={{ flex: 1, height: 4, background: 'rgba(20,34,57,0.08)', borderRadius: 999 }}>
      <div
        style={{
          height: '100%',
          width: `${score}%`,
          background: scoreColor(score),
          borderRadius: 999,
          transition: 'width 0.6s ease',
        }}
      />
    </div>
    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: scoreColor(score), minWidth: 28, textAlign: 'right' }}>
      {score}
    </span>
  </div>
);

// ─── Dimensional scoring ──────────────────────────────────────────────────────
interface DimScores { branding: number; storytelling: number; operacion: number }

function calcDimScores(shop: ShopSummary): DimScores {
  // Branding: logo (50) + banner (30) + region (20)
  const branding =
    (shop.logoUrl ? 50 : 0) +
    (shop.bannerUrl ? 30 : 0) +
    (shop.region ? 20 : 0);

  // Storytelling: description (60) + craftType (40)
  const storytelling =
    (shop.description && shop.description.trim().length > 30 ? 60 : shop.description ? 30 : 0) +
    (shop.craftType ? 40 : 0);

  // Operación: bankData (40) + published (35) + marketplaceApproved (25)
  const operacion =
    (shop.hasBankData ? 40 : 0) +
    (shop.publishStatus === 'published' ? 35 : 0) +
    (shop.marketplaceApproved ? 25 : 0);

  return { branding, storytelling, operacion };
}

interface DimBarProps { label: string; value: number; color: string }
const DimBar: React.FC<DimBarProps> = ({ label, value, color }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ ...lc(0.4), fontSize: 8 }}>{label}</span>
      <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, color }}>{value}</span>
    </div>
    <div style={{ height: 5, background: 'rgba(20,34,57,0.08)', borderRadius: 999 }}>
      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 999, transition: 'width 0.5s ease' }} />
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const BackofficeMarketplaceHealthPage: React.FC = () => {
  const { stats, loading, fetchStats } = useModerationStats();
  const navigate = useNavigate();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const shopHealths = useMemo<ShopHealth[]>(() => {
    return stats.shopDetails.all.map(calcShopScore).sort((a, b) => a.score - b.score);
  }, [stats.shopDetails.all]);

  const dimAverages = useMemo(() => {
    const shops = stats.shopDetails.all;
    if (shops.length === 0) return { branding: 0, storytelling: 0, operacion: 0 };
    const sums = shops.reduce(
      (acc, s) => {
        const d = calcDimScores(s);
        return { branding: acc.branding + d.branding, storytelling: acc.storytelling + d.storytelling, operacion: acc.operacion + d.operacion };
      },
      { branding: 0, storytelling: 0, operacion: 0 },
    );
    return {
      branding: Math.round(sums.branding / shops.length),
      storytelling: Math.round(sums.storytelling / shops.length),
      operacion: Math.round(sums.operacion / shops.length),
    };
  }, [stats.shopDetails.all]);

  // Alertas operativas
  const shopsWithoutLogo     = shopHealths.filter(h => !h.shop.logoUrl).length;
  const shopsWithoutBankData = stats.shopsWithoutBankData;
  const shopsNotPublished    = stats.shopDetails.all.filter(s => s.publishStatus !== 'published').length;
  const shopsNotApproved     = stats.shopDetails.notApproved.length;
  const pendingProducts      = stats.products.pending_moderation;
  const changesProducts      = stats.products.changes_requested;
  const draftProducts        = stats.products.draft;
  const rejectedProducts     = stats.products.rejected;

  // Distribución de health scores
  const critical   = shopHealths.filter(h => h.score < 50).length;
  const incomplete = shopHealths.filter(h => h.score >= 50 && h.score < 80).length;
  const healthy    = shopHealths.filter(h => h.score >= 80).length;
  const total      = shopHealths.length;

  // Overall marketplace health
  const overallHealth = total > 0 ? Math.round(shopHealths.reduce((s, h) => s + h.score, 0) / total) : 0;

  const v = (n: number) => loading ? '—' : String(n);

  // Bottom 10 talleres que necesitan atención
  const needsAttention = shopHealths.filter(h => h.score < 80).slice(0, 12);

  return (
    <div style={{ background: 'var(--background)', fontFamily: SANS, minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
        className="px-8 pt-10 pb-8"
      >
        <div style={{ position: 'absolute', top: -60, right: -40, width: 320, height: 320, background: 'radial-gradient(circle, rgba(236,109,19,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: 80, width: 280, height: 280, background: 'radial-gradient(circle, rgba(194,146,0,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span style={{ ...lc(1), fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 8, display: 'block' }}>
                Capa 2 · Salud del marketplace
              </span>
              <h1 style={{ fontFamily: "'League Spartan', Arial, sans-serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>
                Marketplace Health
              </h1>
              <p style={{ fontFamily: SERIF, fontSize: 14, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                ¿El marketplace está sano? ¿Qué está roto? ¿Qué necesita curaduría?
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ ...lc(0.5), fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>salud promedio de talleres</p>
              <p style={{
                fontFamily: SANS,
                fontSize: 52,
                fontWeight: 800,
                lineHeight: 1,
                color: overallHealth >= 70 ? '#4ade80' : overallHealth >= 45 ? GOLDEN : ORANGE,
              }}>
                {loading ? '—' : overallHealth}
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>/ 100</p>
            </div>
          </div>

          {/* Health distribution pills */}
          <div className="flex gap-3 flex-wrap">
            {[
              { n: v(healthy),    label: 'talleres saludables',  color: '#4ade80' },
              { n: v(incomplete), label: 'incompletos',          color: GOLDEN },
              { n: v(critical),   label: 'críticos',             color: ORANGE },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.n}</span>
                <span style={{ ...lc(1), color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">

        {/* ── Alertas operativas ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span style={{ ...lc(0.45), fontSize: 10 }}>Alertas operativas</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
            {(critical > 0 || shopsWithoutBankData > 0 || pendingProducts > 0) && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(236,109,19,0.1)', border: '1px solid rgba(236,109,19,0.2)' }}>
                <AlertTriangle style={{ width: 10, height: 10, color: ORANGE }} />
                <span style={{ ...lc(1), color: ORANGE, fontSize: 9 }}>Atención requerida</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <AlertChip count={loading ? 0 : pendingProducts}      label="piezas en cola"           icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>} urgent onClick={() => navigate('/backoffice/moderacion')} />
            <AlertChip count={loading ? 0 : shopsWithoutBankData} label="talleres sin cobro"        icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>payments</span>} urgent onClick={() => navigate('/backoffice/tiendas')} />
            <AlertChip count={loading ? 0 : shopsWithoutLogo}     label="talleres sin logo"         icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>hide_image</span>} urgent />
            <AlertChip count={loading ? 0 : shopsNotPublished}    label="talleres sin publicar"     icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility_off</span>} />
            <AlertChip count={loading ? 0 : changesProducts}      label="piezas con cambios"        icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit_note</span>} />
            <AlertChip count={loading ? 0 : draftProducts}        label="piezas en borrador"        icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>draft</span>} />
            <AlertChip count={loading ? 0 : rejectedProducts}     label="piezas rechazadas"         icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>block</span>} urgent />
            <AlertChip count={loading ? 0 : shopsNotApproved}     label="talleres sin aprobación"   icon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>pending_actions</span>} />
          </div>
        </section>

        {/* ── Health score ranking ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span style={{ ...lc(0.45), fontSize: 10 }}>Talleres que necesitan atención</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
            <span style={{ ...lc(0.3), fontSize: 9 }}>Ordenados por health score · menor primero</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 80, background: 'rgba(20,34,57,0.04)', borderRadius: 16, border: '1px solid rgba(20,34,57,0.07)' }} />
              ))}
            </div>
          ) : needsAttention.length === 0 ? (
            <div
              style={{
                background: 'rgba(22,101,52,0.06)',
                border: '1px solid rgba(22,101,52,0.15)',
                borderRadius: 20,
                padding: '32px 24px',
                textAlign: 'center',
              }}
            >
              <CheckCircle2 style={{ width: 28, height: 28, color: GREEN, margin: '0 auto 12px' }} />
              <p style={{ fontFamily: "'League Spartan', Arial, sans-serif", fontSize: 16, fontWeight: 800, color: GREEN }}>
                Todos los talleres están en buen estado
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(20,34,57,0.4)', fontStyle: 'italic', marginTop: 4 }}>
                El ecosistema está saludable
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {needsAttention.map(({ shop, score, missing }) => (
                <div
                  key={shop.id}
                  style={{
                    background: score < 50 ? 'rgba(236,109,19,0.04)' : 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: score < 50 ? '1px solid rgba(236,109,19,0.15)' : '1px solid rgba(255,255,255,0.65)',
                    borderRadius: 16,
                    padding: '16px 20px',
                    boxShadow: '0 2px 8px rgba(20,34,57,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    {/* Avatar/logo */}
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: shop.logoUrl ? `url(${shop.logoUrl}) center/cover` : 'rgba(20,34,57,0.08)',
                      border: '1px solid rgba(20,34,57,0.08)',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {!shop.logoUrl && (
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'rgba(20,34,57,0.2)' }}>store</span>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'League Spartan', Arial, sans-serif", fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {shop.shopName}
                      </p>
                      <p style={{ ...lc(0.3), fontSize: 8 }}>
                        {shop.region ?? 'Sin región'} {shop.craftType ? `· ${shop.craftType}` : ''}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: scoreColor(score), lineHeight: 1 }}>{score}</p>
                      <p style={{ ...lc(0.4), fontSize: 7, color: scoreColor(score) }}>{scoreLabel(score)}</p>
                    </div>
                  </div>

                  <ScoreBar score={score} />

                  {missing.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                      {missing.map(m => (
                        <span key={m} style={{
                          fontFamily: SANS,
                          fontSize: 9,
                          fontWeight: 700,
                          color: ORANGE,
                          background: 'rgba(236,109,19,0.08)',
                          border: '1px solid rgba(236,109,19,0.15)',
                          borderRadius: 999,
                          padding: '2px 8px',
                        }}>{m}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Distribución por score ───────────────────────────────────── */}
        {!loading && total > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span style={{ ...lc(0.45), fontSize: 10 }}>Distribución de salud</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.65)',
                borderRadius: 20,
                padding: '24px 28px',
                boxShadow: '0 2px 12px rgba(20,34,57,0.06)',
              }}
            >
              {/* Visual bar chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, marginBottom: 12 }}>
                {Array.from({ length: 10 }, (_, i) => {
                  const min = i * 10;
                  const max = (i + 1) * 10;
                  const count = shopHealths.filter(h => h.score >= min && h.score < max).length;
                  const color = min < 50 ? ORANGE : min < 80 ? GOLDEN : GREEN;
                  const maxCount = Math.max(...Array.from({ length: 10 }, (_, j) => shopHealths.filter(h => h.score >= j * 10 && h.score < (j + 1) * 10).length));
                  const height = maxCount > 0 ? Math.round((count / maxCount) * 72) : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: '100%',
                        height: height || 4,
                        background: count > 0 ? color : 'rgba(20,34,57,0.07)',
                        borderRadius: 4,
                        opacity: count > 0 ? 1 : 0.4,
                        transition: 'height 0.6s ease',
                        alignSelf: 'flex-end',
                      }} />
                      <span style={{ fontFamily: SANS, fontSize: 8, color: 'rgba(20,34,57,0.3)', fontWeight: 700 }}>{min}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(20,34,57,0.07)', paddingTop: 16 }}>
                {[
                  { n: critical,   label: 'Score < 50 · Críticas',      color: ORANGE },
                  { n: incomplete, label: 'Score 50–79 · Incompletas',   color: GOLDEN },
                  { n: healthy,    label: 'Score ≥ 80 · Saludables',     color: GREEN  },
                ].map(({ n, label, color }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: SANS, fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{n}</p>
                    <p style={{ ...lc(0.35), fontSize: 8, marginTop: 4 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Salud dimensional del ecosistema ────────────────────────── */}
        {!loading && total > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span style={{ ...lc(0.45), fontSize: 10 }}>Salud dimensional del ecosistema</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
              <span style={{ ...lc(0.3), fontSize: 9 }}>Promedio de todos los talleres</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Radar visual */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.65)',
                  borderRadius: 20,
                  padding: '20px 24px',
                }}
              >
                <p style={{ ...lc(0.4), fontSize: 8, marginBottom: 12 }}>Radar de madurez</p>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart
                    data={[
                      { dim: 'Branding', score: dimAverages.branding },
                      { dim: 'Storytelling', score: dimAverages.storytelling },
                      { dim: 'Operación', score: dimAverages.operacion },
                    ]}
                  >
                    <PolarGrid stroke="rgba(20,34,57,0.08)" />
                    <PolarAngleAxis
                      dataKey="dim"
                      tick={{ fontFamily: SANS, fontSize: 11, fill: 'rgba(20,34,57,0.5)', fontWeight: 700 }}
                    />
                    <Radar
                      dataKey="score"
                      stroke="#7c3aed"
                      fill="#7c3aed"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Barras por dimensión */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.82)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.65)',
                  borderRadius: 20,
                  padding: '20px 24px',
                }}
              >
                <p style={{ ...lc(0.4), fontSize: 8, marginBottom: 20 }}>Detalle por dimensión</p>
                <DimBar label="Branding — logo, banner, región" value={dimAverages.branding} color="#7c3aed" />
                <DimBar label="Storytelling — descripción, tipo de artesanía" value={dimAverages.storytelling} color="#0d9488" />
                <DimBar label="Operación — cobro, publicación, aprobación MKT" value={dimAverages.operacion} color="#166534" />

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(20,34,57,0.07)' }}>
                  {[
                    { label: 'Branding < 50', count: stats.shopDetails.all.filter(s => calcDimScores(s).branding < 50).length, color: '#7c3aed' },
                    { label: 'Storytelling < 50', count: stats.shopDetails.all.filter(s => calcDimScores(s).storytelling < 50).length, color: '#0d9488' },
                    { label: 'Operación < 75', count: stats.shopDetails.all.filter(s => calcDimScores(s).operacion < 75).length, color: ORANGE },
                  ].map(({ label, count, color }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ ...lc(0.35), fontSize: 8 }}>{label}</span>
                      <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color }}>
                        {count} <span style={{ fontSize: 9, fontWeight: 500 }}>talleres</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Calidad visual ───────────────────────────────────────────── */}
        {!loading && shopsWithoutLogo > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span style={{ ...lc(0.45), fontSize: 10 }}>Calidad visual — talleres sin identidad</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
              <span style={{ ...lc(1), color: ORANGE, fontSize: 9 }}>{shopsWithoutLogo} sin logo</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {shopHealths
                .filter(h => !h.shop.logoUrl)
                .slice(0, 20)
                .map(({ shop }) => (
                  <div key={shop.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(236,109,19,0.06)', border: '1px solid rgba(236,109,19,0.12)' }}
                  >
                    <XCircle style={{ width: 12, height: 12, color: ORANGE, flexShrink: 0 }} />
                    <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: NAVY }}>{shop.shopName}</span>
                  </div>
                ))}
              {shopsWithoutLogo > 20 && (
                <div className="flex items-center px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(20,34,57,0.04)', border: '1px solid rgba(20,34,57,0.08)' }}>
                  <span style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(20,34,57,0.4)', fontStyle: 'italic' }}>
                    +{shopsWithoutLogo - 20} más
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2 pb-4" style={{ borderTop: '1px solid rgba(20,34,57,0.07)' }}>
          <p style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(20,34,57,0.3)', fontStyle: 'italic' }}>
            Marketplace Intelligence · Capa 2 del ecosistema
          </p>
          <button
            onClick={() => navigate('/backoffice/tiendas')}
            className="flex items-center gap-2 group"
            style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'rgba(20,34,57,0.4)' }}
          >
            Ver todas las tiendas
            <ArrowRight className="group-hover:translate-x-0.5 transition-transform" style={{ width: 13, height: 13 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackofficeMarketplaceHealthPage;
