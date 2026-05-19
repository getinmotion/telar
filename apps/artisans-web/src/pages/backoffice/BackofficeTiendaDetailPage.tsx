import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink, MapPin, Package, CreditCard, Globe, Instagram, Facebook } from 'lucide-react';
import { getArtisanShopById } from '@/services/artisanShops.actions';
import { ArtisanShop } from '@/types/artisanShop.types';
import { useModerationStats } from '@/hooks/useModerationStats';
import {
  toggleShopMarketplaceApproval,
  publishShopAdmin,
} from '@/services/moderation.actions';
import { SANS, SERIF, lc } from '@/components/dashboard/dashboardStyles';
import { toast } from 'sonner';

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY   = '#142239';
const ORANGE = '#ec6d13';
const GOLDEN = '#c29200';
const GREEN  = '#166534';

// ─── Health score ─────────────────────────────────────────────────────────────
interface HealthFactor { label: string; value: boolean; points: number; }

function calcHealth(shop: ArtisanShop): { score: number; factors: HealthFactor[] } {
  const factors: HealthFactor[] = [
    { label: 'Logo',              value: !!shop.logoUrl,                                    points: 20 },
    { label: 'Banner',            value: !!shop.bannerUrl,                                   points: 10 },
    { label: 'Historia',          value: !!shop.story && shop.story.length > 50,             points: 15 },
    { label: 'Datos de cobro',    value: !!shop.idContraparty,                               points: 25 },
    { label: 'Aprobada MKT',      value: shop.marketplaceApproved === true,                  points: 15 },
    { label: 'Publicada',         value: shop.publishStatus === 'published',                 points: 10 },
    { label: 'Región',            value: !!shop.region,                                      points: 5  },
  ];
  const score = factors.filter(f => f.value).reduce((s, f) => s + f.points, 0);
  return { score, factors };
}

function scoreColor(score: number) {
  if (score >= 80) return GREEN;
  if (score >= 50) return GOLDEN;
  return ORANGE;
}

// ─── Quick action button ──────────────────────────────────────────────────────
const ActionBtn: React.FC<{ label: string; icon: string; onClick: () => void; variant?: 'default' | 'danger' | 'success'; loading?: boolean }> =
  ({ label, icon, onClick, variant = 'default', loading }) => {
    const colors = {
      default:  { bg: 'rgba(20,34,57,0.06)',  border: 'rgba(20,34,57,0.1)',  color: NAVY },
      danger:   { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', color: '#dc2626' },
      success:  { bg: 'rgba(22,101,52,0.08)', border: 'rgba(22,101,52,0.2)', color: GREEN },
    }[variant];

    return (
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{ background: colors.bg, border: `1px solid ${colors.border}`, fontFamily: SANS, fontSize: 12, fontWeight: 700, color: colors.color }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{icon}</span>
        {loading ? 'Cargando…' : label}
      </button>
    );
  };

// ─── Main ─────────────────────────────────────────────────────────────────────
const BackofficeTiendaDetailPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const [shop, setShop]       = useState<ArtisanShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { stats, loading: statsLoading, fetchStats } = useModerationStats();

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    Promise.all([
      getArtisanShopById(shopId),
      fetchStats(),
    ])
      .then(([s]) => setShop(s))
      .catch(() => toast.error('No se pudo cargar el perfil de la tienda'))
      .finally(() => setLoading(false));
  }, [shopId, fetchStats]);

  // Products for this shop from the moderation stats
  const shopProducts = useMemo(() => {
    if (!shopId) return { approved: 0, pending: 0, draft: 0, changes: 0, rejected: 0 };
    const all = [
      ...stats.productDetails.approved.filter(p => p.shopId === shopId),
      ...stats.productDetails.approved_with_edits.filter(p => p.shopId === shopId),
    ];
    return {
      approved:  all.length,
      pending:   stats.productDetails.pending_moderation.filter(p => p.shopId === shopId).length,
      draft:     stats.productDetails.draft.filter(p => p.shopId === shopId).length,
      changes:   stats.productDetails.changes_requested.filter(p => p.shopId === shopId).length,
      rejected:  stats.productDetails.rejected.filter(p => p.shopId === shopId).length,
    };
  }, [shopId, stats]);

  const health = useMemo(() => shop ? calcHealth(shop) : null, [shop]);

  // Actions
  async function handleApprove() {
    if (!shopId) return;
    setActionLoading('approve');
    try {
      await toggleShopMarketplaceApproval(shopId, true);
      setShop(s => s ? { ...s, marketplaceApproved: true, marketplaceApprovalStatus: 'approved' } : s);
      toast.success('Tienda aprobada para el marketplace');
    } catch { toast.error('Error al aprobar la tienda'); }
    finally { setActionLoading(null); }
  }

  async function handleReject() {
    if (!shopId) return;
    setActionLoading('reject');
    try {
      await toggleShopMarketplaceApproval(shopId, false);
      setShop(s => s ? { ...s, marketplaceApproved: false, marketplaceApprovalStatus: 'rejected' } : s);
      toast.success('Tienda rechazada del marketplace');
    } catch { toast.error('Error al rechazar la tienda'); }
    finally { setActionLoading(null); }
  }

  async function handleTogglePublish() {
    if (!shopId || !shop) return;
    const willPublish = shop.publishStatus !== 'published';
    setActionLoading('publish');
    try {
      await publishShopAdmin(shopId, willPublish ? 'publish' : 'unpublish');
      setShop(s => s ? { ...s, publishStatus: willPublish ? 'published' : 'pending_publish' } : s);
      toast.success(willPublish ? 'Tienda publicada' : 'Tienda despublicada');
    } catch { toast.error('Error al cambiar estado de publicación'); }
    finally { setActionLoading(null); }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ fontFamily: SERIF, fontSize: 14, color: 'rgba(20,34,57,0.4)', fontStyle: 'italic' }}>
          Cargando perfil…
        </p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <XCircle style={{ width: 40, height: 40, color: 'rgba(20,34,57,0.2)' }} />
        <p style={{ fontFamily: "'League Spartan', Arial, sans-serif", fontSize: 18, fontWeight: 800, color: 'rgba(20,34,57,0.4)' }}>
          Taller no encontrado
        </p>
        <button onClick={() => navigate('/backoffice/tiendas')}
          style={{ fontFamily: SANS, fontSize: 13, color: ORANGE, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Volver a tiendas
        </button>
      </div>
    );
  }

  const isPublished   = shop.publishStatus === 'published';
  const isApproved    = shop.marketplaceApproved === true;
  const hasBankData   = !!shop.idContraparty;

  return (
    <div style={{ background: 'var(--background)', fontFamily: SANS, minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: shop.bannerUrl
            ? `linear-gradient(to bottom, rgba(20,34,57,0.7) 0%, rgba(20,34,57,0.95) 100%), url(${shop.bannerUrl}) center/cover`
            : `linear-gradient(135deg, ${NAVY} 0%, #1e3354 60%, #142239 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
        className="px-8 pt-8 pb-8"
      >
        {!shop.bannerUrl && (
          <div style={{ position: 'absolute', top: -40, right: -40, width: 280, height: 280, background: 'radial-gradient(circle, rgba(194,146,0,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        )}

        <div className="relative max-w-6xl mx-auto">
          {/* Back */}
          <button
            onClick={() => navigate('/backoffice/tiendas')}
            className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
            style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Volver a tiendas
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            {/* Logo */}
            <div style={{
              width: 72, height: 72, borderRadius: 18, flexShrink: 0,
              background: shop.logoUrl ? `url(${shop.logoUrl}) center/cover` : 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {!shop.logoUrl && <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'rgba(255,255,255,0.3)' }}>store</span>}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <h1 style={{ fontFamily: "'League Spartan', Arial, sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {shop.shopName}
                </h1>
                {isApproved && <CheckCircle2 style={{ width: 18, height: 18, color: '#4ade80', flexShrink: 0 }} />}
              </div>

              <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>
                /{shop.shopSlug}
                {shop.region && <span style={{ marginLeft: 8 }}><MapPin style={{ width: 10, height: 10, display: 'inline', marginRight: 3 }} />{shop.region}</span>}
                {shop.craftType && <span style={{ marginLeft: 8 }}>· {shop.craftType}</span>}
              </p>

              {shop.brandClaim && (
                <p style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>
                  "{shop.brandClaim}"
                </p>
              )}

              {/* Status badges */}
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                {[
                  { label: isPublished ? 'Publicada' : 'No publicada', ok: isPublished },
                  { label: isApproved ? 'Aprobada MKT' : 'Sin aprobación', ok: isApproved },
                  { label: hasBankData ? 'Cobros listos' : 'Sin cobros', ok: hasBankData },
                ].map(b => (
                  <span key={b.label} style={{
                    fontFamily: SANS, fontSize: 10, fontWeight: 700,
                    color: b.ok ? '#4ade80' : 'rgba(255,255,255,0.4)',
                    background: b.ok ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.07)',
                    border: b.ok ? '1px solid rgba(74,222,128,0.25)' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 999, padding: '3px 10px',
                  }}>{b.label}</span>
                ))}
              </div>
            </div>

            {/* Health score */}
            {health && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ ...lc(0.5), fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>health score</p>
                <p style={{ fontFamily: SANS, fontSize: 52, fontWeight: 800, lineHeight: 1, color: scoreColor(health.score) }}>
                  {health.score}
                </p>
                <p style={{ fontFamily: SERIF, fontSize: 10, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>/ 100</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">

        {/* ── Acciones rápidas ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ ...lc(0.35), fontSize: 9, marginRight: 4 }}>Acciones</span>
          {!isApproved && (
            <ActionBtn label="Aprobar MKT" icon="verified" onClick={handleApprove} variant="success" loading={actionLoading === 'approve'} />
          )}
          {isApproved && (
            <ActionBtn label="Rechazar MKT" icon="block" onClick={handleReject} variant="danger" loading={actionLoading === 'reject'} />
          )}
          <ActionBtn
            label={isPublished ? 'Despublicar' : 'Publicar'}
            icon={isPublished ? 'visibility_off' : 'visibility'}
            onClick={handleTogglePublish}
            loading={actionLoading === 'publish'}
          />
          <ActionBtn
            label="Ver en marketplace"
            icon="open_in_new"
            onClick={() => window.open(`/${shop.shopSlug}`, '_blank')}
          />
        </div>

        {/* ── KPIs ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { n: statsLoading ? '—' : String(shopProducts.approved), label: 'Piezas aprobadas',  urgent: false },
            { n: statsLoading ? '—' : String(shopProducts.pending),  label: 'En cola',            urgent: shopProducts.pending > 0 },
            { n: statsLoading ? '—' : String(shopProducts.draft),    label: 'Borradores',         urgent: false },
            { n: statsLoading ? '—' : String(shopProducts.changes),  label: 'Con cambios',        urgent: shopProducts.changes > 0 },
            { n: statsLoading ? '—' : String(shopProducts.rejected), label: 'Rechazadas',         urgent: shopProducts.rejected > 0 },
          ].map(k => (
            <div key={k.label} style={{
              background: k.urgent ? 'rgba(236,109,19,0.07)' : 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: k.urgent ? '1px solid rgba(236,109,19,0.2)' : '1px solid rgba(255,255,255,0.65)',
              borderRadius: 16, padding: '16px 18px',
              boxShadow: '0 2px 8px rgba(20,34,57,0.05)',
            }}>
              <span style={{ ...lc(0.35), fontSize: 8 }}>{k.label}</span>
              <p style={{ fontFamily: SANS, fontSize: 32, fontWeight: 800, color: k.urgent ? ORANGE : NAVY, lineHeight: 1, marginTop: 6 }}>{k.n}</p>
            </div>
          ))}
        </div>

        {/* ── Health score breakdown + Info ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Health factors */}
          {health && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <span style={{ ...lc(0.45), fontSize: 10 }}>Perfil de completitud</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.65)',
                borderRadius: 20, padding: '20px 24px',
                boxShadow: '0 2px 12px rgba(20,34,57,0.06)',
              }}>
                {health.factors.map(f => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    {f.value
                      ? <CheckCircle2 style={{ width: 14, height: 14, color: GREEN, flexShrink: 0 }} />
                      : <XCircle     style={{ width: 14, height: 14, color: ORANGE, flexShrink: 0 }} />}
                    <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: f.value ? NAVY : 'rgba(20,34,57,0.5)', flex: 1 }}>{f.label}</span>
                    <span style={{ fontFamily: SANS, fontSize: 11, fontWeight: 800, color: f.value ? GREEN : 'rgba(20,34,57,0.25)' }}>
                      {f.value ? `+${f.points}` : `0/${f.points}`}
                    </span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(20,34,57,0.07)', marginTop: 4, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(20,34,57,0.4)', fontStyle: 'italic' }}>Score total</span>
                  <span style={{ fontFamily: SANS, fontSize: 28, fontWeight: 800, color: scoreColor(health.score) }}>{health.score}/100</span>
                </div>
              </div>
            </section>
          )}

          {/* Shop info */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span style={{ ...lc(0.45), fontSize: 10 }}>Información del taller</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.65)',
              borderRadius: 20, padding: '20px 24px',
              boxShadow: '0 2px 12px rgba(20,34,57,0.06)',
              height: '100%',
            }}>
              {[
                { label: 'Creado',         value: new Date(shop.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }), icon: 'calendar_today' },
                { label: 'Región',         value: shop.region ?? '—',    icon: 'map' },
                { label: 'Departamento',   value: shop.department ?? '—', icon: 'location_on' },
                { label: 'Municipio',      value: shop.municipality ?? '—', icon: 'apartment' },
                { label: 'Tipo artesanía', value: shop.craftType ?? '—',  icon: 'category' },
                { label: 'Datos de cobro', value: hasBankData ? 'Configurados' : 'Sin configurar', icon: 'payments', urgent: !hasBankData },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(20,34,57,0.05)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'rgba(20,34,57,0.25)', flexShrink: 0 }}>{row.icon}</span>
                  <span style={{ ...lc(0.35), fontSize: 9, width: 100, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: (row as any).urgent ? ORANGE : NAVY }}>{row.value}</span>
                </div>
              ))}

              {/* Social links */}
              {(shop.socialLinks?.instagram || shop.socialLinks?.facebook || shop.contactConfig?.whatsapp) && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  {shop.socialLinks?.instagram && (
                    <a href={`https://instagram.com/${shop.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: SANS, fontSize: 11, color: NAVY, textDecoration: 'none', opacity: 0.6 }}>
                      <Instagram style={{ width: 12, height: 12 }} /> Instagram
                    </a>
                  )}
                  {shop.socialLinks?.facebook && (
                    <a href={shop.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: SANS, fontSize: 11, color: NAVY, textDecoration: 'none', opacity: 0.6 }}>
                      <Facebook style={{ width: 12, height: 12 }} /> Facebook
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Historia del taller ───────────────────────────────────────── */}
        {shop.story && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span style={{ ...lc(0.45), fontSize: 10 }}>Historia del taller</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.65)',
              borderRadius: 20, padding: '24px 28px',
              boxShadow: '0 2px 12px rgba(20,34,57,0.06)',
            }}>
              <p style={{ fontFamily: SERIF, fontSize: 14, color: 'rgba(20,34,57,0.7)', fontStyle: 'italic', lineHeight: 1.7 }}>
                {shop.story}
              </p>
            </div>
          </section>
        )}

        {/* ── Timeline / registro ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span style={{ ...lc(0.45), fontSize: 10 }}>Timeline</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.65)',
            borderRadius: 20, padding: '20px 28px',
            boxShadow: '0 2px 12px rgba(20,34,57,0.06)',
          }}>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[
                { label: 'Registro',    date: shop.createdAt,                 icon: 'store',    done: true },
                { label: 'Actualizado', date: shop.updatedAt,                 icon: 'edit',     done: true },
                { label: 'Aprobado MKT',date: shop.marketplaceApprovedAt,     icon: 'verified', done: isApproved },
                { label: 'Publicación', date: isPublished ? shop.updatedAt : null, icon: 'public', done: isPublished },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: item.done ? NAVY : 'rgba(20,34,57,0.2)' }}>{item.icon}</span>
                    <span style={{ ...lc(0.4), fontSize: 9 }}>{item.label}</span>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: item.done && item.date ? NAVY : 'rgba(20,34,57,0.25)' }}>
                    {item.done && item.date
                      ? new Date(item.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 pb-4" style={{ borderTop: '1px solid rgba(20,34,57,0.07)' }}>
          <p style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(20,34,57,0.3)', fontStyle: 'italic' }}>
            Perfil CRM · {shop.shopName}
          </p>
          <button
            onClick={() => navigate('/backoffice/marketplace-health')}
            style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: 'rgba(20,34,57,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Ver salud del marketplace →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackofficeTiendaDetailPage;
