import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Calendar, ArrowRight, Building2 } from 'lucide-react';
import { getAllAgreements, Agreement } from '@/services/agreements.actions';
import { useModerationStats } from '@/hooks/useModerationStats';
import { SANS, SERIF, lc } from '@/components/dashboard/dashboardStyles';

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY   = '#142239';
const ORANGE = '#ec6d13';
const GOLDEN = '#c29200';
const GREEN  = '#166534';
const PURPLE = '#7c3aed';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 30) return `Hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  return `Hace ${Math.floor(months / 12)} años`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const BackofficeConveniosPage: React.FC = () => {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const { stats, loading: statsLoading, fetchStats } = useModerationStats();

  useEffect(() => {
    fetchStats();
    getAllAgreements()
      .then(setAgreements)
      .catch(e => setError(e.message ?? 'Error al cargar convenios'))
      .finally(() => setLoading(false));
  }, [fetchStats]);

  const totalShops   = stats.shops.all;
  const active       = agreements.filter(a => a.isEnableValidate).length;
  const inactive     = agreements.filter(a => !a.isEnableValidate).length;

  return (
    <div style={{ background: 'var(--background)', fontFamily: SANS, minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg, #2d1b69 0%, #1e1b4b 60%, #0f0a2e 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
        className="px-8 pt-10 pb-8"
      >
        <div style={{ position: 'absolute', top: -60, right: -40, width: 320, height: 320, background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: 80, width: 280, height: 280, background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span style={{ ...lc(1), fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 8, display: 'block' }}>
                Ecosistema · Convenios y alianzas
              </span>
              <h1 style={{ fontFamily: "'League Spartan', Arial, sans-serif", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 8 }}>
                Convenios
              </h1>
              <p style={{ fontFamily: SERIF, fontSize: 14, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                Alianzas institucionales · Acceso y permisos · Ecosistema cultural
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ ...lc(0.5), fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>convenios registrados</p>
              <p style={{ fontFamily: SANS, fontSize: 52, fontWeight: 800, lineHeight: 1, color: loading ? 'rgba(255,255,255,0.3)' : 'white' }}>
                {loading ? '—' : agreements.length}
              </p>
            </div>
          </div>

          {/* Strips */}
          <div className="flex gap-3 flex-wrap">
            {[
              { n: loading ? '—' : String(active),   label: 'convenios activos',   color: '#86efac' },
              { n: loading ? '—' : String(inactive),  label: 'inactivos',            color: 'rgba(255,255,255,0.4)' },
              { n: statsLoading ? '—' : String(totalShops), label: 'talleres en ecosistema', color: 'rgba(255,255,255,0.7)' },
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

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '16px 20px' }}>
            <p style={{ fontFamily: SANS, fontSize: 13, color: '#dc2626', fontWeight: 700 }}>{error}</p>
          </div>
        )}

        {/* ── Lista de convenios ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span style={{ ...lc(0.45), fontSize: 10 }}>Convenios registrados</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
            <span style={{ ...lc(0.3), fontSize: 9 }}>{loading ? '…' : `${agreements.length} en total`}</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 140, background: 'rgba(20,34,57,0.04)', borderRadius: 20, border: '1px solid rgba(20,34,57,0.07)' }} />
              ))}
            </div>
          ) : agreements.length === 0 ? (
            <div
              style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.65)',
                borderRadius: 20,
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: '0 2px 12px rgba(20,34,57,0.06)',
              }}
            >
              <Building2 style={{ width: 32, height: 32, color: 'rgba(20,34,57,0.2)', margin: '0 auto 12px' }} />
              <p style={{ fontFamily: "'League Spartan', Arial, sans-serif", fontSize: 16, fontWeight: 800, color: 'rgba(20,34,57,0.4)' }}>
                No hay convenios registrados
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(20,34,57,0.3)', fontStyle: 'italic', marginTop: 4 }}>
                Los convenios con aliados e instituciones aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {agreements.map(agreement => (
                <div
                  key={agreement.id}
                  style={{
                    background: 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: agreement.isEnableValidate
                      ? '1px solid rgba(124,58,237,0.15)'
                      : '1px solid rgba(255,255,255,0.65)',
                    borderRadius: 20,
                    padding: '20px 24px',
                    boxShadow: '0 2px 12px rgba(20,34,57,0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Accent glow */}
                  {agreement.isEnableValidate && (
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  )}

                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: agreement.isEnableValidate ? 'rgba(124,58,237,0.1)' : 'rgba(20,34,57,0.06)',
                      border: agreement.isEnableValidate ? '1px solid rgba(124,58,237,0.2)' : '1px solid rgba(20,34,57,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Building2 style={{ width: 18, height: 18, color: agreement.isEnableValidate ? PURPLE : 'rgba(20,34,57,0.25)' }} />
                    </div>

                    {/* Status badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {agreement.isEnableValidate ? (
                        <CheckCircle2 style={{ width: 12, height: 12, color: GREEN }} />
                      ) : (
                        <XCircle style={{ width: 12, height: 12, color: 'rgba(20,34,57,0.25)' }} />
                      )}
                      <span style={{
                        ...lc(1), fontSize: 8,
                        color: agreement.isEnableValidate ? GREEN : 'rgba(20,34,57,0.35)',
                      }}>
                        {agreement.isEnableValidate ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <p style={{
                    fontFamily: "'League Spartan', Arial, sans-serif",
                    fontSize: 16,
                    fontWeight: 800,
                    color: NAVY,
                    lineHeight: 1.2,
                    marginBottom: 6,
                  }}>
                    {agreement.name}
                  </p>

                  {/* Permission indicator */}
                  {agreement.permissionMongoId && (
                    <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(20,34,57,0.35)', fontWeight: 600, marginBottom: 12 }}>
                      Con permisos de validación
                    </p>
                  )}

                  {/* Footer */}
                  <div style={{ borderTop: '1px solid rgba(20,34,57,0.06)', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar style={{ width: 10, height: 10, color: 'rgba(20,34,57,0.3)' }} />
                      <span style={{ fontFamily: SERIF, fontSize: 11, color: 'rgba(20,34,57,0.4)', fontStyle: 'italic' }}>
                        {formatDate(agreement.createdAt)}
                      </span>
                    </div>
                    <span style={{ ...lc(0.3), fontSize: 8 }}>
                      {relativeTime(agreement.updatedAt ?? agreement.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Contexto del ecosistema ────────────────────────────────────── */}
        {!loading && agreements.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span style={{ ...lc(0.45), fontSize: 10 }}>Contexto del ecosistema</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(20,34,57,0.08)' }} />
            </div>

            <div
              style={{
                background: `linear-gradient(135deg, #2d1b69 0%, #1e1b4b 100%)`,
                borderRadius: 20,
                padding: '28px 32px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
                {[
                  { n: agreements.length,  label: 'convenios registrados',   icon: 'handshake' },
                  { n: active,              label: 'con validación activa',    icon: 'verified' },
                  { n: agreements.filter(a => a.permissionMongoId).length, label: 'con permisos asignados', icon: 'admin_panel_settings' },
                  { n: totalShops,          label: 'talleres en el ecosistema', icon: 'store' },
                ].map(({ n, label, icon }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'rgba(167,139,250,0.5)', display: 'block', marginBottom: 8 }}>{icon}</span>
                    <p style={{ fontFamily: SANS, fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1, marginBottom: 4 }}>
                      {statsLoading && label.includes('taller') ? '—' : n}
                    </p>
                    <p style={{ ...lc(1), color: 'rgba(167,139,250,0.5)', fontSize: 8 }}>{label}</p>
                  </div>
                ))}
              </div>

              <p style={{ fontFamily: SERIF, fontSize: 12, color: 'rgba(167,139,250,0.4)', fontStyle: 'italic', textAlign: 'center', marginTop: 24 }}>
                Los convenios definen quién puede acceder al ecosistema y con qué permisos
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 pb-4" style={{ borderTop: '1px solid rgba(20,34,57,0.07)' }}>
          <p style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(20,34,57,0.3)', fontStyle: 'italic' }}>
            Alianzas institucionales · Soberanía comercial del ecosistema artesanal
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackofficeConveniosPage;
