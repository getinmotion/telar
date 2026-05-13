import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { updateArtisanShop } from '@/services/artisanShops.actions';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { uploadImage, UploadFolder } from '@/services/fileUpload.actions';
import { createAIService } from '@/services/AIService';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  dark:   '#151b2d',
  orange: '#ec6d13',
  muted:  '#54433e',
  sans:   "'Manrope', sans-serif",
  serif:  "'Noto Serif', serif",
};
const glass: React.CSSProperties = {
  background:           'rgba(255,255,255,0.82)',
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               '1px solid rgba(255,255,255,0.65)',
};

// ─── Section nav ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { key: 's1', icon: 'palette',        label: 'Identidad'  },
  { key: 's2', icon: 'panorama',       label: 'Hero'       },
  { key: 's3', icon: 'person_pin',     label: 'Perfil'     },
  { key: 's4', icon: 'contacts',       label: 'Contacto'   },
  { key: 's5', icon: 'policy',         label: 'Políticas'  },
  { key: 's6', icon: 'preview',        label: 'Diseño'     },
] as const;

// ─── Micro-components ─────────────────────────────────────────────────────────
const GlassCard: React.FC<{ children: React.ReactNode; id?: string; className?: string }> = ({ children, id, className = '' }) => (
  <div id={id} className={`rounded-2xl scroll-mt-20 ${className}`} style={{ ...glass, padding: 24 }}>{children}</div>
);

const FieldLabel: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <div style={{ marginBottom: 6 }}>
    <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: `${T.muted}80` }}>{children}</span>
    {hint && <span style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}40`, marginLeft: 6 }}>{hint}</span>}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1px solid rgba(84,67,62,0.14)`, outline: 'none',
  fontFamily: T.sans, fontSize: 13, color: T.dark,
  background: 'rgba(247,244,239,0.5)', transition: 'border-color 0.2s',
};

const Btn: React.FC<{
  onClick?: () => void; loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'ghost'; type?: 'button' | 'submit';
  children: React.ReactNode; title?: string;
}> = ({ onClick, loading, disabled, variant = 'primary', type = 'button', title, children }) => (
  <button type={type} onClick={onClick} disabled={loading || disabled} title={title}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: T.sans, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
      textTransform: 'uppercase', padding: '10px 20px', borderRadius: 100,
      cursor: loading || disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
      opacity: disabled && !loading ? 0.4 : 1,
      background: loading || disabled ? (variant === 'primary' ? T.orange : 'transparent') : variant === 'primary' ? T.orange : 'transparent',
      color: variant === 'primary' ? 'white' : T.orange,
      border: variant === 'ghost' ? `1px solid rgba(236,109,19,0.3)` : 'none',
    }}
  >{children}</button>
);

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string; sub?: string }> = ({ value, onChange, label, sub }) => (
  <label className="flex items-center justify-between gap-4 cursor-pointer py-3 px-4 rounded-xl transition-colors"
    style={{ background: value ? 'rgba(236,109,19,0.04)' : `${T.dark}03`, border: `1px solid ${value ? 'rgba(236,109,19,0.12)' : `${T.dark}07`}` }}>
    <div>
      <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.dark }}>{label}</p>
      {sub && <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}55`, marginTop: 1 }}>{sub}</p>}
    </div>
    <div onClick={() => onChange(!value)} className="shrink-0 rounded-full transition-all"
      style={{ width: 40, height: 22, background: value ? T.orange : `${T.dark}20`, position: 'relative', cursor: 'pointer' }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
    </div>
  </label>
);

// ─── SourceBadge — reference-only field indicator ─────────────────────────────
const SourceBadge: React.FC<{ source: string; href?: string }> = ({ source, href }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: `${T.muted}60`, background: `${T.dark}07`, border: `1px solid ${T.dark}10`, padding: '2px 8px', borderRadius: 100 }}>
      Del {source}
    </span>
    {href && (
      <a href={href} style={{ fontFamily: T.sans, fontSize: 10, color: T.orange, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
        Editar <span className="material-symbols-outlined" style={{ fontSize: 12 }}>arrow_forward</span>
      </a>
    )}
  </span>
);

// ─── SectionStatusBadge ───────────────────────────────────────────────────────
const SectionStatusBadge: React.FC<{ status: 'complete' | 'partial' | 'empty' }> = ({ status }) => {
  const map = {
    complete: { emoji: '✅', label: 'Completo',    bg: 'rgba(34,197,94,0.08)',   color: '#16a34a' },
    partial:  { emoji: '⚠️', label: 'Incompleto',  bg: 'rgba(236,109,19,0.08)', color: T.orange  },
    empty:    { emoji: '🔴', label: 'Vacío',        bg: 'rgba(239,68,68,0.08)',  color: '#ef4444' },
  };
  const { emoji, label, bg, color } = map[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 100, background: bg, fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
      {emoji} {label}
    </span>
  );
};

// ─── DestBadge ────────────────────────────────────────────────────────────────
const DestBadge: React.FC<{ mkt?: boolean; own?: boolean }> = ({ mkt = false, own = false }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    {mkt && <span style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: `${T.muted}65`, background: `${T.dark}06`, padding: '2px 8px', borderRadius: 100 }}>🏪 Marketplace</span>}
    {own && <span style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 700, color: `${T.muted}65`, background: `${T.dark}06`, padding: '2px 8px', borderRadius: 100 }}>🛍️ Mi tienda</span>}
  </span>
);

// ─── AiPanel ──────────────────────────────────────────────────────────────────
const AiPanel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl overflow-hidden" style={{ background: T.dark, border: '1px solid rgba(255,255,255,0.07)' }}>
    <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: T.orange }}>psychology</span>
        <span style={{ fontFamily: T.serif, fontSize: 14, color: 'white' }}>{title}</span>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.orange }} />
        <span style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>IA</span>
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

// ─── AiBadge ──────────────────────────────────────────────────────────────────
const AiBadge: React.FC = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 100, background: 'rgba(236,109,19,0.1)', border: '1px solid rgba(236,109,19,0.2)', fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.orange }}>
    <span className="material-symbols-outlined" style={{ fontSize: 11 }}>auto_awesome</span>IA
  </span>
);

// ─── SecHead ──────────────────────────────────────────────────────────────────
const SecHead: React.FC<{ icon: string; title: string; sub?: string; status?: 'complete' | 'partial' | 'empty'; mkt?: boolean; own?: boolean }> =
  ({ icon, title, sub, status, mkt, own }) => (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined mt-0.5" style={{ fontSize: 20, color: T.orange }}>{icon}</span>
        <div>
          <p style={{ fontFamily: T.serif, fontSize: 18, color: T.dark, lineHeight: 1.2 }}>{title}</p>
          {sub && <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}55`, marginTop: 2 }}>{sub}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {status && <SectionStatusBadge status={status} />}
        {(mkt !== undefined || own !== undefined) && <DestBadge mkt={mkt} own={own} />}
      </div>
    </div>
  );

// ─── ImageUploadSlot ──────────────────────────────────────────────────────────
const ImageUploadSlot: React.FC<{
  label: string; hint?: string; url: string; uploading: boolean;
  onFile: (f: File) => void; onRemove: () => void;
  aspect?: string; icon?: string;
}> = ({ label, hint, url, uploading, onFile, onRemove, aspect = 'aspect-video', icon = 'add_photo_alternate' }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div onClick={() => !uploading && ref.current?.click()}
        className={`relative ${aspect} rounded-xl overflow-hidden cursor-pointer group`}
        style={{ background: url ? 'transparent' : `${T.dark}05`, border: `2px dashed ${T.dark}12` }}>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.8)', zIndex: 10 }}>
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: 24, color: T.orange }}>progress_activity</span>
          </div>
        )}
        {url
          ? <img src={url} className="w-full h-full object-cover" alt={label} />
          : <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: `${T.muted}25` }}>{icon}</span>
              <span style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}40`, textAlign: 'center' }}>Subir imagen</span>
            </div>
        }
        {url && !uploading && (
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: 'white' }}>Cambiar</span>
            <button onClick={e => { e.stopPropagation(); onRemove(); }}
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'white', fontFamily: T.sans, fontSize: 10, fontWeight: 700 }}>
              Quitar
            </button>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
      </div>
    </div>
  );
};

// ─── ScoreRing ────────────────────────────────────────────────────────────────
const ScoreRing: React.FC<{ value: number; label: string; color: string; icon: string }> = ({ value, label, color, icon }) => {
  const r = 22; const circ = 2 * Math.PI * r; const dash = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={32} cy={32} r={r} fill="none" stroke={`${color}18`} strokeWidth={5} />
          <circle cx={32} cy={32} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color }}>{icon}</span>
        </div>
      </div>
      <p style={{ fontFamily: T.sans, fontSize: 18, fontWeight: 800, color: T.dark, lineHeight: 1 }}>{value}<span style={{ fontSize: 10 }}>%</span></p>
      <p style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}60`, textAlign: 'center' }}>{label}</p>
    </div>
  );
};

// ─── Live previews ────────────────────────────────────────────────────────────
interface PreviewProps {
  shopName: string; brandClaim: string; craftType: string;
  region: string; municipality: string; logoUrl: string;
  bannerUrl: string; marketplaceApproved: boolean; slug: string;
}

const EcommercePreview: React.FC<PreviewProps> = ({ shopName, brandClaim, craftType, region, municipality, logoUrl, bannerUrl, slug }) => (
  <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.dark}10`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
    <div className="relative" style={{ height: 110, background: bannerUrl ? 'transparent' : `linear-gradient(135deg, ${T.dark} 0%, #2a3550 100%)` }}>
      {bannerUrl && <img src={bannerUrl} className="w-full h-full object-cover" alt="" />}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-3 py-2" style={{ background: 'rgba(21,27,45,0.5)', backdropFilter: 'blur(8px)' }}>
        <span style={{ fontFamily: T.serif, fontSize: 10, color: 'white', letterSpacing: '0.06em' }}>TELAR</span>
        <div className="flex gap-1.5">
          {['Inicio', 'Catálogo', 'Historia'].map(t => <span key={t} style={{ fontFamily: T.sans, fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t}</span>)}
        </div>
      </div>
      <div className="absolute -bottom-4 left-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: 'white', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
          {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" alt="" /> : <span className="material-symbols-outlined" style={{ fontSize: 18, color: `${T.muted}40` }}>storefront</span>}
        </div>
      </div>
    </div>
    <div style={{ background: 'white', padding: '22px 12px 12px' }}>
      <p style={{ fontFamily: T.serif, fontSize: 14, color: T.dark }}>{shopName || 'Nombre de la tienda'}</p>
      {brandClaim && <p style={{ fontFamily: T.sans, fontSize: 9, color: `${T.muted}70`, marginTop: 2, fontStyle: 'italic' }}>"{brandClaim}"</p>}
      <div className="flex items-center gap-2 mt-2">
        {craftType && <span style={{ fontFamily: T.sans, fontSize: 8, fontWeight: 700, color: T.orange, background: 'rgba(236,109,19,0.08)', padding: '3px 7px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{craftType}</span>}
        {(municipality || region) && <span style={{ fontFamily: T.sans, fontSize: 8, color: `${T.muted}60` }}>{[municipality, region].filter(Boolean).join(', ')}</span>}
      </div>
    </div>
    {slug && <div style={{ background: `${T.dark}04`, borderTop: `1px solid ${T.dark}06`, padding: '5px 12px' }}>
      <span style={{ fontFamily: T.sans, fontSize: 9, color: `${T.muted}40` }}>telar.co/tienda/{slug}</span>
    </div>}
  </div>
);

const MarketplacePreview: React.FC<PreviewProps> = ({ shopName, craftType, region, municipality, logoUrl, bannerUrl, marketplaceApproved }) => (
  <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.dark}10`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', background: 'white' }}>
    <div style={{ height: 100, background: bannerUrl ? 'transparent' : `${T.dark}08`, position: 'relative', overflow: 'hidden' }}>
      {bannerUrl ? <img src={bannerUrl} className="w-full h-full object-cover" alt="" />
        : logoUrl ? <img src={logoUrl} className="w-full h-full object-contain p-4" alt="" style={{ background: '#fafafa' }} />
        : <div className="flex items-center justify-center h-full"><span className="material-symbols-outlined" style={{ fontSize: 32, color: `${T.muted}20` }}>storefront</span></div>
      }
      {marketplaceApproved && (
        <div className="absolute top-2 left-2 flex items-center gap-1" style={{ background: 'rgba(34,197,94,0.9)', borderRadius: 100, padding: '3px 8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 10, color: 'white' }}>verified</span>
          <span style={{ fontFamily: T.sans, fontSize: 8, fontWeight: 800, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Verificado</span>
        </div>
      )}
    </div>
    <div style={{ padding: '10px 12px 12px' }}>
      <p style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.dark }}>{shopName || 'Nombre de la tienda'}</p>
      {craftType && <p style={{ fontFamily: T.sans, fontSize: 10, color: T.orange, marginTop: 2, fontWeight: 600 }}>{craftType}</p>}
      {(municipality || region) && (
        <div className="flex items-center gap-1 mt-1.5">
          <span className="material-symbols-outlined" style={{ fontSize: 11, color: `${T.muted}40` }}>location_on</span>
          <span style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}60` }}>{[municipality, region].filter(Boolean).join(', ')}</span>
        </div>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const ShopConfigDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { shop, loading } = useArtisanShop();

  // Section refs for deep-link scroll
  const refs = {
    s1: useRef<HTMLDivElement>(null),
    s2: useRef<HTMLDivElement>(null),
    s3: useRef<HTMLDivElement>(null),
    s4: useRef<HTMLDivElement>(null),
    s5: useRef<HTMLDivElement>(null),
    s6: useRef<HTMLDivElement>(null),
  };

  // Scroll to section on mount (or when ?section param changes)
  useEffect(() => {
    const section = searchParams.get('section') as keyof typeof refs | null;
    if (section && refs[section]?.current) {
      setTimeout(() => refs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── S1: Brand Identity ──────────────────────────────────────────────────────
  const [logoUrl,        setLogoUrl]        = useState('');
  const [brandClaim,     setBrandClaim]     = useState('');
  const [uploadingLogo,  setUploadingLogo]  = useState(false);
  const [savingS1,       setSavingS1]       = useState(false);
  const [taglineSugs,    setTaglineSugs]    = useState<string[]>([]);
  const [genTagline,     setGenTagline]     = useState(false);

  // ── S2: Hero Images ─────────────────────────────────────────────────────────
  const [bannerUrl,       setBannerUrl]      = useState('');
  const [heroSlides,      setHeroSlides]     = useState<any[]>([]);
  const [uploadingBanner, setUploadingBanner]= useState(false);
  const [savingS2,        setSavingS2]       = useState(false);
  const [heroAnalysis,    setHeroAnalysis]   = useState<string | null>(null);
  const [analyzingHero,   setAnalyzingHero]  = useState(false);
  const [newSlideTitle,   setNewSlideTitle]  = useState('');
  const [newSlideSub,     setNewSlideSub]    = useState('');
  const [showAddSlide,    setShowAddSlide]   = useState(false);

  // ── S4: Contact & Location ──────────────────────────────────────────────────
  const [whatsapp,       setWhatsapp]        = useState('');
  const [email,          setEmail]           = useState('');
  const [socialInsta,    setSocialInsta]     = useState('');
  const [socialFb,       setSocialFb]        = useState('');
  const [socialTiktok,   setSocialTiktok]    = useState('');
  const [socialWeb,      setSocialWeb]       = useState('');
  const [savingS4,       setSavingS4]        = useState(false);

  // ── S5: Policies ────────────────────────────────────────────────────────────
  const [activeTab,       setActiveTab]      = useState<'s5a' | 's5b'>('s5a');
  const [returnPolicy,    setReturnPolicy]   = useState('');
  const [faqItems,        setFaqItems]       = useState<{ q: string; a: string }[]>([]);
  const [savingS5,        setSavingS5]       = useState(false);
  // S5a AI wizard
  const [wizardStep,     setWizardStep]      = useState<0 | 1 | 2>(0);
  const [wizDays,        setWizDays]         = useState('');
  const [wizCustom,      setWizCustom]       = useState(false);
  const [genPolicy,      setGenPolicy]       = useState(false);
  // S5b FAQ
  const [genFaq,         setGenFaq]          = useState(false);
  const [showFaqConfirm, setShowFaqConfirm]  = useState(false);
  const [pendingFaq,     setPendingFaq]      = useState<{ q: string; a: string }[]>([]);

  // ── S6: Design & Preview ────────────────────────────────────────────────────
  const [activeThemeId, setActiveThemeId]    = useState<string>('editorial');
  const [previewMode,   setPreviewMode]      = useState<'ecommerce' | 'marketplace'>('ecommerce');

  // ── Sync from shop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shop) return;
    const s = shop as any;
    setLogoUrl(s.logoUrl ?? '');
    setBrandClaim(s.brandClaim ?? '');
    setBannerUrl(s.bannerUrl ?? '');
    setHeroSlides(s.heroConfig?.slides ?? []);
    const cc = s.contactConfig ?? {};
    setWhatsapp(cc.whatsapp ?? '');
    setEmail(cc.email ?? '');
    const sl = s.socialLinks ?? {};
    setSocialInsta(sl.instagram ?? '');
    setSocialFb(sl.facebook ?? '');
    setSocialTiktok(sl.tiktok ?? '');
    setSocialWeb(sl.website ?? '');
    const pc = s.policiesConfig ?? {};
    setReturnPolicy(pc.returnPolicy ?? '');
    setFaqItems(pc.faq ?? []);
    setActiveThemeId(s.activeThemeId ?? 'editorial');
  }, [shop?.id]);

  // ── AI service ────────────────────────────────────────────────────────────────
  const aiService = useMemo(() => {
    if (!shop) return null;
    const s = shop as any;
    return createAIService({
      shopName:      s.shopName ?? '',
      craftType:     s.craftType ?? '',
      region:        s.department ?? s.region ?? '',
      municipality:  s.municipality ?? '',
      brandClaim:    brandClaim,
      artisanProfile: s.artisanProfile ?? null,
    });
  }, [shop?.id, brandClaim]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const withSave = async (setter: (v: boolean) => void, fn: () => Promise<void>) => {
    setter(true);
    try { await fn(); }
    catch (e: any) { toast.error('Error al guardar'); console.error(e); }
    finally { setter(false); }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: T.orange }}>progress_activity</span>
    </div>
  );
  if (!shop) return (
    <div className="flex-1 flex items-center justify-center">
      <p style={{ fontFamily: T.sans, color: T.muted }}>Tienda no encontrada</p>
    </div>
  );

  const s           = shop as any;
  const shopSlug    = s.slug ?? s.shopSlug ?? '';
  const isPublished = s.publishStatus === 'published';
  const mktApproved = !!s.marketplaceApproved;
  const artisanProfile = s.artisanProfile ?? {};
  const department  = s.department ?? artisanProfile.department ?? '';
  const municipality = s.municipality ?? artisanProfile.municipality ?? '';

  const previewProps: PreviewProps = {
    shopName: s.shopName ?? '', brandClaim, craftType: s.craftType ?? '',
    region: department, municipality, logoUrl, bannerUrl,
    marketplaceApproved: mktApproved, slug: shopSlug,
  };

  // ── Computed statuses ─────────────────────────────────────────────────────────
  const s1Status: 'complete' | 'partial' | 'empty' = logoUrl && brandClaim ? 'complete' : logoUrl || brandClaim ? 'partial' : 'empty';
  const s2Status: 'complete' | 'empty' = bannerUrl || heroSlides.length > 0 ? 'complete' : 'empty';
  const profilePct = (() => {
    const fields = [artisanProfile.artisanName, artisanProfile.learnedFromDetail, artisanProfile.techniques?.length > 0, artisanProfile.workingPhotos?.length > 0, artisanProfile.artisanPhoto, artisanProfile.territory];
    return Math.round(fields.filter(Boolean).length / fields.length * 100);
  })();
  const s3Status: 'complete' | 'partial' | 'empty' = s.artisanProfileCompleted ? 'complete' : profilePct > 30 ? 'partial' : 'empty';
  const s4Status: 'complete' | 'partial' | 'empty' = whatsapp && (email || socialInsta) ? 'complete' : whatsapp || email ? 'partial' : 'empty';
  const s5aStatus: 'complete' | 'empty' = returnPolicy.length > 30 ? 'complete' : 'empty';
  const s5bStatus: 'complete' | 'empty' = faqItems.length > 0 ? 'complete' : 'empty';
  const s5Status: 'complete' | 'partial' | 'empty' = s5aStatus === 'complete' && s5bStatus === 'complete' ? 'complete' : s5aStatus === 'complete' || s5bStatus === 'complete' ? 'partial' : 'empty';

  // ── Save handlers ─────────────────────────────────────────────────────────────
  const saveS1 = () => withSave(setSavingS1, async () => {
    await updateArtisanShop(shop.id, { brandClaim } as any);
    toast.success('Identidad guardada');
  });

  const saveS2 = () => withSave(setSavingS2, async () => {
    await updateArtisanShop(shop.id, { bannerUrl, heroConfig: { slides: heroSlides, autoplay: true, duration: 5000 } } as any);
    toast.success('Imágenes guardadas');
  });

  const saveS4 = () => withSave(setSavingS4, async () => {
    await updateArtisanShop(shop.id, {
      contactConfig: { ...(s.contactConfig ?? {}), whatsapp, email },
      socialLinks:   { ...(s.socialLinks ?? {}),   instagram: socialInsta, facebook: socialFb, tiktok: socialTiktok, website: socialWeb },
    } as any);
    toast.success('Contacto guardado');
  });

  const saveS5 = () => withSave(setSavingS5, async () => {
    await updateArtisanShop(shop.id, { policiesConfig: { returnPolicy: returnPolicy ?? '', faq: faqItems ?? [] } } as any);
    toast.success('Políticas guardadas');
  });

  // ── AI actions ────────────────────────────────────────────────────────────────
  const handleSuggestTagline = async () => {
    if (!aiService) return;
    setGenTagline(true);
    try {
      const sugs = await aiService.suggestTagline(brandClaim);
      setTaglineSugs(sugs);
    } catch { toast.error('Error al generar taglines'); }
    finally { setGenTagline(false); }
  };

  const handleAnalyzeHero = async () => {
    if (!aiService) return;
    const urls = [bannerUrl, ...heroSlides.map((sl: any) => sl.imageUrl || sl.url)].filter(Boolean);
    if (!urls.length) return;
    setAnalyzingHero(true);
    setHeroAnalysis(null);
    try {
      const res = await aiService.analyzeHeroImages(urls);
      setHeroAnalysis(res.suggestedDescription || res.suggestedName || 'Análisis completado');
    } catch { toast.error('Error al analizar imágenes'); }
    finally { setAnalyzingHero(false); }
  };

  const handleGeneratePolicy = async () => {
    if (!aiService || !wizDays) return;
    setGenPolicy(true);
    try {
      const text = await aiService.generateReturnPolicy({ days: wizDays, acceptCustom: wizCustom });
      setReturnPolicy(text);
      setWizardStep(2);
    } catch { toast.error('Error al generar política'); }
    finally { setGenPolicy(false); }
  };

  const handleGenerateFAQ = async () => {
    if (!aiService) return;
    setGenFaq(true);
    try {
      const items = await aiService.generateFAQ();
      if (faqItems.length > 0) {
        setPendingFaq(items);
        setShowFaqConfirm(true);
      } else {
        setFaqItems(items);
        toast.success('FAQ generado — edita y guarda');
      }
    } catch { toast.error('Error al generar FAQ'); }
    finally { setGenFaq(false); }
  };

  // ── FAQ helpers ────────────────────────────────────────────────────────────────
  const addFaq    = () => setFaqItems(prev => [...prev, { q: '', a: '' }]);
  const removeFaq = (i: number) => setFaqItems(prev => prev.filter((_, j) => j !== i));
  const updateFaq = (i: number, field: 'q' | 'a', val: string) =>
    setFaqItems(prev => prev.map((item, j) => j === i ? { ...item, [field]: val } : item));

  // ── Nav helper ────────────────────────────────────────────────────────────────
  const scrollTo = (key: keyof typeof refs) => {
    setSearchParams({ section: key });
    refs[key]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <Helmet><title>{`Configurar · ${s.shopName ?? 'Tienda'}`}</title></Helmet>

      <div className="overflow-y-auto flex-1 p-6 lg:p-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: `${T.muted}50`, marginBottom: 2 }}>
              Configuración de tienda
            </p>
            <p style={{ fontFamily: T.serif, fontSize: 24, color: T.dark }}>{s.shopName}</p>
          </div>
          <div className="flex items-center gap-2">
            {mktApproved
              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#16a34a', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '5px 12px', borderRadius: 100 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>verified</span>En marketplace
                </span>
              : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3b82f6', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', padding: '5px 12px', borderRadius: 100 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>hourglass_top</span>En revisión
                </span>
            }
            {shopSlug && (
              <button onClick={() => window.open(`/tienda/${shopSlug}${isPublished ? '' : '?preview=true'}`, '_blank')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.orange, background: 'rgba(236,109,19,0.07)', border: `1px solid rgba(236,109,19,0.2)`, padding: '5px 14px', borderRadius: 100, cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>open_in_new</span>
                {isPublished ? 'Ver tienda' : 'Vista previa'}
              </button>
            )}
          </div>
        </div>

        {/* Section nav */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 sticky top-0 z-10 py-2"
          style={{ background: 'rgba(247,244,239,0.85)', backdropFilter: 'blur(12px)', scrollbarWidth: 'none', marginLeft: -24, marginRight: -24, paddingLeft: 24, paddingRight: 24 }}>
          {SECTIONS.map(sec => (
            <button key={sec.key} onClick={() => scrollTo(sec.key as keyof typeof refs)}
              className="shrink-0 flex items-center gap-1.5 transition-all"
              style={{
                fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '7px 14px', borderRadius: 100, cursor: 'pointer', border: 'none',
                background: searchParams.get('section') === sec.key ? T.dark : 'rgba(255,255,255,0.7)',
                color: searchParams.get('section') === sec.key ? 'white' : `${T.muted}65`,
                boxShadow: searchParams.get('section') === sec.key ? '0 2px 8px rgba(21,27,45,0.14)' : 'none',
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{sec.icon}</span>
              {sec.label}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6">

          {/* ══ S1 — BRAND IDENTITY ══════════════════════════════════════════ */}
          <div ref={refs.s1}>
            <GlassCard id="s1">
              <SecHead icon="palette" title="Identidad de marca" sub="Logo y tagline · el corazón visual de tu tienda" status={s1Status} mkt={true} own={true} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Logo upload */}
                <ImageUploadSlot
                  label="Logo" hint="512×512px cuadrado"
                  url={logoUrl} uploading={uploadingLogo}
                  onFile={async file => {
                    setUploadingLogo(true);
                    try {
                      const r = await uploadImage(file, UploadFolder.SHOPS);
                      setLogoUrl(r.url);
                      await updateArtisanShop(shop.id, { logoUrl: r.url } as any);
                      toast.success('Logo actualizado');
                    } catch { toast.error('Error al subir logo'); }
                    finally { setUploadingLogo(false); }
                  }}
                  onRemove={() => { setLogoUrl(''); updateArtisanShop(shop.id, { logoUrl: '' } as any); }}
                  aspect="aspect-square" icon="store"
                />

                {/* Tagline + reference fields */}
                <div className="flex flex-col gap-4">
                  <div>
                    <FieldLabel>Tagline / Claim</FieldLabel>
                    <input value={brandClaim} onChange={e => setBrandClaim(e.target.value)}
                      placeholder="Ej. Tejidos que cuentan historias ancestrales" style={inputStyle} />
                  </div>
                  <div className="rounded-xl p-3" style={{ background: `${T.dark}04`, border: `1px solid ${T.dark}07` }}>
                    <div className="flex items-center justify-between mb-1">
                      <FieldLabel>Nombre de la tienda</FieldLabel>
                      <SourceBadge source="Onboarding" />
                    </div>
                    <p style={{ fontFamily: T.sans, fontSize: 13, color: T.dark }}>{s.shopName || '—'}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: `${T.dark}04`, border: `1px solid ${T.dark}07` }}>
                    <div className="flex items-center justify-between mb-1">
                      <FieldLabel>Descripción</FieldLabel>
                      <SourceBadge source="Perfil artesanal" href="/perfil-artesanal/configurar" />
                    </div>
                    <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}80`, lineHeight: 1.5 }}>
                      {artisanProfile.shortBio || s.description || <span style={{ color: `${T.muted}40`, fontStyle: 'italic' }}>Sin descripción — completa tu perfil artesanal</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI tagline panel */}
              <AiPanel title="Sugerir tagline">
                <div className="flex items-center gap-3 mb-3">
                  <Btn onClick={handleSuggestTagline} loading={genTagline} variant="ghost">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
                    {genTagline ? 'Generando…' : 'Sugerir taglines'}
                  </Btn>
                  <AiBadge />
                </div>
                {genTagline ? (
                  <div className="flex gap-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-8 flex-1 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />)}
                  </div>
                ) : taglineSugs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {taglineSugs.map((s, i) => (
                      <button key={i} onClick={() => setBrandClaim(s)}
                        style={{ fontFamily: T.sans, fontSize: 12, color: 'white', background: 'rgba(236,109,19,0.15)', border: '1px solid rgba(236,109,19,0.3)', padding: '6px 14px', borderRadius: 100, cursor: 'pointer', textAlign: 'left' }}>
                        {s}
                      </button>
                    ))}
                    <p style={{ fontFamily: T.sans, fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, width: '100%' }}>Haz clic en un tagline para usarlo</p>
                  </div>
                ) : (
                  <p style={{ fontFamily: T.sans, fontSize: 12, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>Genera taglines basados en tu perfil artesanal</p>
                )}
              </AiPanel>

              <div className="flex justify-end pt-4 mt-4 border-t" style={{ borderColor: `${T.dark}08` }}>
                <Btn onClick={saveS1} loading={savingS1}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>save</span>
                  Guardar identidad
                </Btn>
              </div>
            </GlassCard>
          </div>

          {/* ══ S2 — HERO IMAGES ════════════════════════════════════════════ */}
          <div ref={refs.s2}>
            <GlassCard id="s2">
              <SecHead icon="panorama" title="Imágenes de portada" sub="Banner y slides hero · visibles en tu tienda personal" status={s2Status} own={true} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <ImageUploadSlot
                  label="Banner principal" hint="1440×500px"
                  url={bannerUrl} uploading={uploadingBanner}
                  onFile={async file => {
                    setUploadingBanner(true);
                    try {
                      const r = await uploadImage(file, UploadFolder.HERO);
                      setBannerUrl(r.url);
                      await updateArtisanShop(shop.id, { bannerUrl: r.url } as any);
                      toast.success('Banner actualizado');
                    } catch { toast.error('Error al subir banner'); }
                    finally { setUploadingBanner(false); }
                  }}
                  onRemove={() => { setBannerUrl(''); updateArtisanShop(shop.id, { bannerUrl: '' } as any); }}
                  aspect="aspect-video" icon="panorama"
                />

                {/* Slides manager */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel>Slides del hero</FieldLabel>
                    <button onClick={() => setShowAddSlide(v => !v)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.orange, display: 'flex', alignItems: 'center', gap: 3, fontFamily: T.sans, fontSize: 10, fontWeight: 700 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>Agregar
                    </button>
                  </div>
                  {showAddSlide && (
                    <div className="rounded-xl p-3 mb-2 flex flex-col gap-2" style={{ background: 'rgba(236,109,19,0.05)', border: `1px solid rgba(236,109,19,0.15)` }}>
                      <input value={newSlideTitle} onChange={e => setNewSlideTitle(e.target.value)} placeholder="Título del slide" style={{ ...inputStyle, fontSize: 12 }} />
                      <input value={newSlideSub} onChange={e => setNewSlideSub(e.target.value)} placeholder="Subtítulo (opcional)" style={{ ...inputStyle, fontSize: 12 }} />
                      <div className="flex gap-2">
                        <Btn onClick={() => {
                          if (!newSlideTitle.trim()) return;
                          setHeroSlides(prev => [...prev, { id: `manual-${Date.now()}`, title: newSlideTitle, subtitle: newSlideSub }]);
                          setNewSlideTitle(''); setNewSlideSub(''); setShowAddSlide(false);
                        }} variant="primary">
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>check</span>Agregar
                        </Btn>
                        <Btn onClick={() => setShowAddSlide(false)} variant="ghost">Cancelar</Btn>
                      </div>
                    </div>
                  )}
                  {heroSlides.length === 0 ? (
                    <div className="rounded-xl py-5 flex flex-col items-center gap-2" style={{ background: `${T.dark}04`, border: `1px dashed ${T.dark}10` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22, color: `${T.muted}25` }}>view_carousel</span>
                      <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}45` }}>Sin slides — agrega uno</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {heroSlides.map((slide, i) => (
                        <div key={slide.id ?? i} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: `${T.dark}04`, border: `1px solid ${T.dark}07` }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 14, color: `${T.muted}30` }}>drag_indicator</span>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slide.title}</p>
                            {slide.subtitle && <p style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}55`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slide.subtitle}</p>}
                          </div>
                          <button onClick={() => setHeroSlides(heroSlides.filter((_, j) => j !== i))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${T.muted}35`, display: 'flex' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* AI panel */}
              <AiPanel title="Análisis visual IA">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Btn
                    onClick={handleAnalyzeHero}
                    loading={analyzingHero}
                    disabled={!bannerUrl && heroSlides.length === 0}
                    variant="ghost"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>image_search</span>
                    {analyzingHero ? 'Analizando…' : 'Analizar coherencia'}
                  </Btn>
                  {/* FUTURE AGENT SLOT — disabled real button */}
                  <button
                    disabled={true}
                    title="Próximamente — AI Agents"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontFamily: T.sans, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em',
                      textTransform: 'uppercase', padding: '10px 20px', borderRadius: 100,
                      cursor: 'not-allowed', opacity: 0.35,
                      background: 'transparent', color: T.orange,
                      border: `1px solid rgba(236,109,19,0.3)`,
                    }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
                    Generar portada con IA
                    <span style={{ fontFamily: T.sans, fontSize: 8, background: 'rgba(236,109,19,0.2)', padding: '2px 6px', borderRadius: 100 }}>Pronto</span>
                  </button>
                </div>
                {analyzingHero ? (
                  <div className="h-10 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                ) : heroAnalysis ? (
                  <p style={{ fontFamily: T.sans, fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{heroAnalysis}</p>
                ) : (
                  <p style={{ fontFamily: T.sans, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>Sube imágenes y presiona "Analizar" para obtener feedback visual</p>
                )}
              </AiPanel>

              <div className="flex justify-end pt-4 mt-4 border-t" style={{ borderColor: `${T.dark}08` }}>
                <Btn onClick={saveS2} loading={savingS2}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>save</span>
                  Guardar imágenes
                </Btn>
              </div>
            </GlassCard>
          </div>

          {/* ══ S3 — ARTISAN PROFILE ════════════════════════════════════════ */}
          <div ref={refs.s3}>
            <GlassCard id="s3">
              <SecHead icon="person_pin" title="Perfil artesanal" sub="Historia, técnicas, territorio y galería — alimenta la IA y el marketplace" status={s3Status} mkt={true} own={true} />

              <div className="flex items-start gap-4 mb-5 p-4 rounded-xl" style={{ background: `${T.dark}04` }}>
                <ScoreRing value={profilePct} label="Completitud" color={T.orange} icon="person_pin" />
                <div className="flex-1">
                  {artisanProfile.artisanPhoto && <img src={artisanProfile.artisanPhoto} className="w-12 h-12 rounded-full object-cover mb-2" alt="" />}
                  <p style={{ fontFamily: T.serif, fontSize: 16, color: T.dark }}>{artisanProfile.artisanName || s.shopName}</p>
                  {artisanProfile.territory && <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}55`, marginTop: 2 }}>{artisanProfile.territory}</p>}
                  {artisanProfile.learnedFromDetail && (
                    <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}70`, lineHeight: 1.6, marginTop: 6, fontStyle: 'italic', borderLeft: `2px solid ${T.orange}`, paddingLeft: 8 }}>
                      "{artisanProfile.learnedFromDetail.slice(0, 120)}…"
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Historia personal',    done: !!artisanProfile.learnedFromDetail },
                  { label: 'Técnicas y materiales', done: !!(artisanProfile.techniques?.length) },
                  { label: 'Galería humana',        done: !!(artisanProfile.workingPhotos?.length) },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2.5 p-3 rounded-xl"
                    style={{ background: done ? 'rgba(34,197,94,0.05)' : `${T.dark}04`, border: `1px solid ${done ? 'rgba(34,197,94,0.2)' : `${T.dark}07`}` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: done ? '#22c55e' : `${T.muted}25` }}>
                      {done ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: done ? '#16a34a' : `${T.muted}65` }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Badge */}
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: T.orange }}>hub</span>
                <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.orange }}>
                  Alimenta la IA en productos + Perfil en marketplace
                </span>
              </div>

              <button onClick={() => navigate('/perfil-artesanal/configurar')}
                className="w-full flex items-center gap-3 rounded-xl transition-opacity hover:opacity-90"
                style={{ padding: '14px 18px', background: T.dark, border: 'none', cursor: 'pointer' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: T.orange }}>edit_note</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 800, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {s.artisanProfileCompleted ? 'Editar perfil artesanal' : 'Completar perfil artesanal'}
                  </p>
                  <p style={{ fontFamily: T.sans, fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Wizard de 6 pasos · historia, técnica, galería</p>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)' }}>arrow_forward</span>
              </button>
            </GlassCard>
          </div>

          {/* ══ S4 — CONTACT & LOCATION ═════════════════════════════════════ */}
          <div ref={refs.s4}>
            <GlassCard id="s4">
              <SecHead icon="contacts" title="Contacto y ubicación" sub="Cómo encontrar y contactar tu taller" status={s4Status} mkt={true} own={true} />

              {/* Reference: location */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Departamento', value: department },
                  { label: 'Municipio',    value: municipality },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: `${T.dark}04`, border: `1px solid ${T.dark}07` }}>
                    <div className="flex items-center justify-between mb-1">
                      <FieldLabel>{label}</FieldLabel>
                      <SourceBadge source="Perfil artesanal" href="/perfil-artesanal/configurar" />
                    </div>
                    <p style={{ fontFamily: T.sans, fontSize: 13, color: value ? T.dark : `${T.muted}35`, fontStyle: value ? 'normal' : 'italic' }}>
                      {value || 'No definido'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Own fields */}
              <div className="flex flex-col gap-4 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel hint="Principal canal de contacto">WhatsApp</FieldLabel>
                    <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                      placeholder="+57 300 000 0000" style={inputStyle} />
                  </div>
                  <div>
                    <FieldLabel>Correo electrónico público</FieldLabel>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="taller@ejemplo.com" style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="mb-5">
                <FieldLabel>Redes sociales</FieldLabel>
                <div className="flex flex-col gap-2">
                  {([
                    ['Instagram',  'photo_camera',  socialInsta,   setSocialInsta,   'https://instagram.com/tu-taller'],
                    ['Facebook',   'thumb_up',       socialFb,      setSocialFb,      'https://facebook.com/tu-taller'],
                    ['TikTok',     'music_video',    socialTiktok,  setSocialTiktok,  'https://tiktok.com/@tu-taller'],
                    ['Sitio web',  'language',       socialWeb,     setSocialWeb,     'https://tu-sitio.com'],
                  ] as [string, string, string, React.Dispatch<React.SetStateAction<string>>, string][]).map(([label, icon, val, set, ph]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="material-symbols-outlined shrink-0" style={{ fontSize: 17, color: `${T.muted}35`, width: 22, textAlign: 'center' }}>{icon}</span>
                      <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t" style={{ borderColor: `${T.dark}08` }}>
                <Btn onClick={saveS4} loading={savingS4}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>save</span>
                  Guardar contacto
                </Btn>
              </div>
            </GlassCard>
          </div>

          {/* ══ S5 — POLICIES ════════════════════════════════════════════════ */}
          <div ref={refs.s5}>
            <GlassCard id="s5">
              <SecHead icon="policy" title="Políticas y confianza" sub="Devoluciones y FAQ — generados con IA, editables" status={s5Status} mkt={true} own={true} />

              {/* Tab switcher */}
              <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: `${T.dark}06`, width: 'fit-content' }}>
                {[
                  { key: 's5a' as const, label: 'Devoluciones', status: s5aStatus },
                  { key: 's5b' as const, label: 'FAQ',           status: s5bStatus },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-1.5 py-1.5 px-4 rounded-xl transition-all"
                    style={{ border: 'none', cursor: 'pointer', fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', background: activeTab === tab.key ? T.dark : 'transparent', color: activeTab === tab.key ? 'white' : `${T.muted}55` }}>
                    {tab.label}
                    <span style={{ fontSize: 9, marginLeft: 2 }}>
                      {tab.status === 'complete' ? '✅' : '🔴'}
                    </span>
                  </button>
                ))}
              </div>

              {/* S5a — Return policy */}
              {activeTab === 's5a' && (
                <div className="flex flex-col gap-4">
                  <AiPanel title="Asistente de política de devoluciones">
                    {wizardStep === 0 && (
                      <div className="flex flex-col gap-3">
                        <p style={{ fontFamily: T.sans, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>¿Cuántos días tiene el comprador para solicitar una devolución?</p>
                        <input value={wizDays} onChange={e => setWizDays(e.target.value)}
                          placeholder="Ej. 10 días" type="number" min="1"
                          style={{ ...inputStyle, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontFamily: T.sans }} />
                        <Btn onClick={() => { if (wizDays) setWizardStep(1); }} variant="ghost" disabled={!wizDays}>
                          Siguiente <span className="material-symbols-outlined" style={{ fontSize: 13 }}>arrow_forward</span>
                        </Btn>
                      </div>
                    )}
                    {wizardStep === 1 && (
                      <div className="flex flex-col gap-3">
                        <p style={{ fontFamily: T.sans, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>¿Aceptas devoluciones en piezas personalizadas?</p>
                        <div className="flex gap-2">
                          {[{ label: 'Sí, con condiciones', value: true }, { label: 'No se aceptan', value: false }].map(opt => (
                            <button key={String(opt.value)} onClick={() => setWizCustom(opt.value)}
                              style={{ flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', fontFamily: T.sans, fontSize: 12, fontWeight: 700, border: `1px solid ${wizCustom === opt.value ? T.orange : 'rgba(255,255,255,0.12)'}`, background: wizCustom === opt.value ? 'rgba(236,109,19,0.2)' : 'rgba(255,255,255,0.05)', color: wizCustom === opt.value ? T.orange : 'rgba(255,255,255,0.6)' }}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <Btn onClick={handleGeneratePolicy} loading={genPolicy} variant="ghost">
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
                          {genPolicy ? 'Generando política…' : 'Generar política'}
                        </Btn>
                      </div>
                    )}
                    {wizardStep === 2 && (
                      <div className="flex flex-col gap-2">
                        <p style={{ fontFamily: T.sans, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Política generada — puedes editarla abajo</p>
                        <button onClick={() => setWizardStep(0)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: `rgba(236,109,19,0.8)`, fontFamily: T.sans, fontSize: 10, fontWeight: 700, textAlign: 'left', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>refresh</span>Reiniciar asistente
                        </button>
                      </div>
                    )}
                  </AiPanel>

                  <div>
                    <FieldLabel hint="Editable — guarda cuando estés listo">Política de devoluciones</FieldLabel>
                    <textarea value={returnPolicy} onChange={e => setReturnPolicy(e.target.value)} rows={6}
                      placeholder="Aceptamos devoluciones dentro de los 10 días posteriores a la recepción…"
                      style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                </div>
              )}

              {/* S5b — FAQ */}
              {activeTab === 's5b' && (
                <div className="flex flex-col gap-4">
                  <AiPanel title="Sugerir preguntas frecuentes">
                    <div className="flex items-center gap-3">
                      <Btn onClick={handleGenerateFAQ} loading={genFaq} variant="ghost">
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>auto_awesome</span>
                        {genFaq ? 'Generando…' : 'Sugerir con IA'}
                      </Btn>
                      <AiBadge />
                    </div>
                    {genFaq && <p style={{ fontFamily: T.sans, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8, fontStyle: 'italic' }}>Generando preguntas frecuentes…</p>}
                  </AiPanel>

                  {/* FAQ confirm dialog */}
                  {showFaqConfirm && (
                    <div className="rounded-xl p-4" style={{ background: 'rgba(236,109,19,0.08)', border: '1px solid rgba(236,109,19,0.2)' }}>
                      <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 8 }}>¿Reemplazar las preguntas actuales?</p>
                      <div className="flex gap-2">
                        <Btn onClick={() => { setFaqItems(pendingFaq); setShowFaqConfirm(false); toast.success('FAQ actualizado'); }} variant="primary">Reemplazar</Btn>
                        <Btn onClick={() => { setFaqItems(prev => [...prev, ...pendingFaq]); setShowFaqConfirm(false); }} variant="ghost">Agregar a los existentes</Btn>
                        <Btn onClick={() => setShowFaqConfirm(false)} variant="ghost">Cancelar</Btn>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <FieldLabel hint="Visible en la tienda pública">Preguntas frecuentes</FieldLabel>
                    <Btn onClick={addFaq} variant="ghost">
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>add</span>Agregar
                    </Btn>
                  </div>

                  {faqItems.length === 0 ? (
                    <div className="rounded-xl py-6 flex flex-col items-center gap-2" style={{ background: `${T.dark}04`, border: `1px dashed ${T.dark}10` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 22, color: `${T.muted}25` }}>quiz</span>
                      <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}50` }}>Sin preguntas aún — usa el asistente IA o agrega manualmente</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {faqItems.map((item, i) => (
                        <div key={i} className="rounded-xl p-4" style={{ background: `${T.dark}04`, border: `1px solid ${T.dark}07` }}>
                          <div className="flex items-center justify-between mb-2">
                            <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: `${T.muted}50` }}>Pregunta {i + 1}</span>
                            <button onClick={() => removeFaq(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: `${T.muted}35`, display: 'flex' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                            </button>
                          </div>
                          <input value={item.q} onChange={e => updateFaq(i, 'q', e.target.value)}
                            placeholder="¿Cuánto tarda en llegar mi pedido?" style={{ ...inputStyle, marginBottom: 8 }} />
                          <textarea value={item.a} onChange={e => updateFaq(i, 'a', e.target.value)}
                            placeholder="Los pedidos tardan entre 3 y 7 días hábiles…" rows={2}
                            style={{ ...inputStyle, resize: 'vertical' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-4 mt-4 border-t" style={{ borderColor: `${T.dark}08` }}>
                <Btn onClick={saveS5} loading={savingS5}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>save</span>
                  Guardar políticas
                </Btn>
              </div>
            </GlassCard>
          </div>

          {/* ══ S6 — DESIGN & PREVIEW ═══════════════════════════════════════ */}
          <div ref={refs.s6}>
            <GlassCard id="s6">
              <SecHead icon="preview" title="Diseño y vista previa" sub="Elige una plantilla · previsualiza en marketplace y tienda propia" own={true} />

              {/* Template grid */}
              <div className="mb-6">
                <FieldLabel>Plantilla de tienda</FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {/* Active template */}
                  <button
                    onClick={() => { setActiveThemeId('editorial'); updateArtisanShop(shop.id, { activeThemeId: 'editorial' } as any); }}
                    className="relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={{ cursor: 'pointer', border: `2px solid ${activeThemeId === 'editorial' || !activeThemeId ? T.orange : `${T.dark}10`}`, background: activeThemeId === 'editorial' || !activeThemeId ? 'rgba(236,109,19,0.05)' : `${T.dark}03` }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: activeThemeId === 'editorial' || !activeThemeId ? T.orange : `${T.muted}30` }}>auto_stories</span>
                    <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: activeThemeId === 'editorial' || !activeThemeId ? T.dark : `${T.muted}65` }}>TELAR Editorial</span>
                    {(activeThemeId === 'editorial' || !activeThemeId) && (
                      <span style={{ position: 'absolute', top: 8, right: 8, fontFamily: T.sans, fontSize: 8, fontWeight: 800, background: T.orange, color: 'white', padding: '2px 6px', borderRadius: 100 }}>Activa</span>
                    )}
                  </button>

                  {/* Disabled future templates — real JSX, not comments */}
                  {[
                    { id: 'premium',    icon: 'workspace_premium', label: 'Premium'     },
                    { id: 'minimal',    icon: 'tonality',           label: 'Minimalista' },
                    { id: 'floral',     icon: 'local_florist',      label: 'Floral'      },
                  ].map(tpl => (
                    <div key={tpl.id}
                      style={{ position: 'relative', cursor: 'not-allowed', border: `2px solid ${T.dark}08`, background: `${T.dark}03`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.45, pointerEvents: 'none' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 28, color: `${T.muted}30` }}>{tpl.icon}</span>
                      <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: `${T.muted}50` }}>{tpl.label}</span>
                      <span style={{ position: 'absolute', top: 8, right: 8, fontFamily: T.sans, fontSize: 8, fontWeight: 800, background: `${T.dark}15`, color: `${T.muted}60`, padding: '2px 6px', borderRadius: 100 }}>Pronto</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <div className="flex items-center gap-1 p-1 rounded-2xl mb-4" style={{ background: `${T.dark}06`, width: 'fit-content' }}>
                  {(['ecommerce', 'marketplace'] as const).map(mode => (
                    <button key={mode} onClick={() => setPreviewMode(mode)}
                      className="flex items-center gap-1.5 py-2 px-4 rounded-xl transition-all"
                      style={{ border: 'none', cursor: 'pointer', fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', background: previewMode === mode ? T.dark : 'transparent', color: previewMode === mode ? 'white' : `${T.muted}55` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{mode === 'ecommerce' ? 'storefront' : 'apps'}</span>
                      {mode === 'ecommerce' ? 'Mi tienda' : 'Marketplace'}
                    </button>
                  ))}
                </div>

                <div className="max-w-sm">
                  {previewMode === 'ecommerce' ? <EcommercePreview {...previewProps} /> : <MarketplacePreview {...previewProps} />}
                </div>

                <p style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}40`, marginTop: 8 }}>
                  Guarda cambios en otras secciones para actualizar la vista previa
                </p>
              </div>
            </GlassCard>
          </div>

        </div>{/* /sections */}
      </div>
    </>
  );
};

export default ShopConfigDashboard;
