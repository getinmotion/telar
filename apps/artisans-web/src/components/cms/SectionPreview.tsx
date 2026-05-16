import type { CmsSectionType } from '@/services/cms-sections.types';

interface SectionPreviewProps {
  type: CmsSectionType;
  draft: Record<string, any>;
}

const PH = 'rgba(84,67,62,0.12)'; // placeholder fill color
const EM = 'rgba(84,67,62,0.22)'; // empty text color
const ORANGE = '#ec6d13';

function Kicker({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] mb-1" style={{ color: ORANGE }}>
      {text}
    </p>
  );
}

function Title({ text, size = 'md' }: { text?: string; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'text-xl font-bold' : size === 'sm' ? 'text-xs font-bold' : 'text-base font-bold';
  return (
    <p className={`${cls} leading-snug text-[#151b2d] font-serif`}>
      {text || <span style={{ color: EM }}>Sin título</span>}
    </p>
  );
}

function Body({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="text-[11px] leading-relaxed text-[#54433e]/70 mt-1">
      {text.slice(0, 140)}{text.length > 140 ? '…' : ''}
    </p>
  );
}

function CtaButton({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold text-white" style={{ background: ORANGE }}>
      {label}
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4h6M4 1l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
}

function ImagePlaceholder({ url, alt, className = '' }: { url?: string; alt?: string; className?: string }) {
  return url ? (
    <img src={url} alt={alt || ''} className={`object-cover rounded-lg ${className}`} />
  ) : (
    <div className={`rounded-lg flex items-center justify-center ${className}`} style={{ background: PH }}>
      <span className="material-symbols-outlined text-[#54433e]/20 text-2xl">image</span>
    </div>
  );
}

// ─── Individual type previews ────────────────────────────────────────────────

function HeroPreview({ d }: { d: any }) {
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 140, background: 'linear-gradient(135deg, #151b2d 0%, #2d1f0e 100%)' }}>
      {d.imageUrl && <img src={d.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
      <div className="relative p-5 flex flex-col justify-end" style={{ minHeight: 140 }}>
        <Kicker text={d.kicker} />
        <p className="text-lg font-bold text-white leading-snug font-serif">
          {d.title || <span className="opacity-30">Sin título</span>}
        </p>
        {d.subtitle && <p className="text-[11px] text-white/60 mt-1">{d.subtitle}</p>}
        {d.body && <p className="text-[10px] text-white/50 mt-1 line-clamp-2">{d.body}</p>}
        {d.totalCountLabel && (
          <p className="text-[9px] font-bold uppercase tracking-widest mt-2" style={{ color: ORANGE }}>{d.totalCountLabel}</p>
        )}
      </div>
    </div>
  );
}

function QuotePreview({ d }: { d: any }) {
  return (
    <div className="p-5 text-center">
      <p className="text-5xl font-serif leading-none mb-2" style={{ color: ORANGE }}>"</p>
      <Kicker text={d.kicker} />
      <p className="text-sm font-serif italic text-[#151b2d] leading-relaxed">
        {d.body || <span style={{ color: EM }}>Sin cita</span>}
      </p>
      {d.attribution && (
        <p className="text-[10px] font-semibold mt-3" style={{ color: EM }}>— {d.attribution}</p>
      )}
    </div>
  );
}

function TwoColumnIntroPreview({ d }: { d: any }) {
  const cols = d.columns ?? [{}, {}];
  return (
    <div>
      <Kicker text={d.kicker} />
      <Title text={d.title} />
      {d.body && <Body text={d.body} />}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {cols.slice(0, 2).map((col: any, i: number) => (
          <div key={i} className="rounded-lg p-3" style={{ background: PH.replace('0.12', '0.07') }}>
            <p className="text-[9px] font-extrabold uppercase tracking-wider mb-1" style={{ color: ORANGE }}>{col.kicker || `Col. ${i + 1}`}</p>
            <p className="text-[11px] font-bold text-[#151b2d] leading-tight">{col.title || '—'}</p>
            {col.body && <p className="text-[9px] text-[#54433e]/60 mt-1 line-clamp-2">{col.body}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TechniqueGridPreview({ d }: { d: any }) {
  const cards = (d.cards ?? Array(4).fill({})).slice(0, 4);
  return (
    <div>
      <Kicker text={d.kicker} />
      <Title text={d.title} size="sm" />
      <div className="grid grid-cols-2 gap-2 mt-3">
        {cards.map((card: any, i: number) => (
          <div key={i} className="rounded-lg overflow-hidden" style={{ background: PH }}>
            <div className="h-14 flex items-center justify-center" style={{ background: PH }}>
              {card.imageKey
                ? <img src={card.imageKey} alt="" className="w-full h-full object-cover" />
                : <span className="material-symbols-outlined text-[#54433e]/20 text-lg">image</span>}
            </div>
            <div className="p-2">
              <p className="text-[9px] font-bold text-[#151b2d] line-clamp-1">{card.title || '—'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedAsideCardPreview({ d }: { d: any }) {
  return (
    <div className="rounded-xl p-4 border" style={{ borderColor: `${ORANGE}22` }}>
      <Title text={d.title} size="sm" />
      <Body text={d.body} />
      <CtaButton label={d.ctaLabel} />
    </div>
  );
}

function MetricsStatPreview({ d }: { d: any }) {
  return (
    <div className="rounded-xl p-5 text-center text-white" style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #9c3f00 100%)` }}>
      <Kicker text={d.kicker} />
      <p className="text-4xl font-extrabold font-serif leading-none">{d.value || '—'}</p>
      {d.caption && <p className="text-[10px] mt-1 opacity-75">{d.caption}</p>}
    </div>
  );
}

function MuestraIntroPreview({ d }: { d: any }) {
  return (
    <div>
      <Kicker text={d.kicker} />
      <Title text={d.title} />
      <Body text={d.body} />
    </div>
  );
}

function ArchiveLabelPreview({ d }: { d: any }) {
  return (
    <div className="py-6 text-center">
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#151b2d]">{d.kicker || 'ETIQUETA'}</p>
    </div>
  );
}

function EditorialFooterPreview({ d }: { d: any }) {
  return (
    <div className="rounded-xl p-4" style={{ background: '#151b2d' }}>
      <Kicker text={d.kicker} />
      <p className="text-sm font-bold text-white font-serif">{d.title || '—'}</p>
      <div className="flex gap-3 mt-3">
        {(d.links ?? Array(3).fill({})).slice(0, 3).map((l: any, i: number) => (
          <span key={i} className="text-[9px] text-white/40 underline">{l.label || `Link ${i + 1}`}</span>
        ))}
      </div>
      {d.copyright && <p className="text-[8px] text-white/25 mt-3">{d.copyright}</p>}
    </div>
  );
}

function HomeValuePropsPreview({ d }: { d: any }) {
  const cards = (d.cards ?? Array(3).fill({})).slice(0, 3);
  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((card: any, i: number) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <ImagePlaceholder url={card.imageUrl} className="h-14 w-full" />
          <div className="pt-2">
            <p className="text-[9px] font-bold text-[#151b2d] line-clamp-2">{card.title || `Prop. ${i + 1}`}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HomeSectionHeaderPreview({ d }: { d: any }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <Kicker text={d.kicker} />
        <Title text={d.title} />
        {d.subtitle && <p className="text-[10px] text-[#54433e]/60 mt-1">{d.subtitle}</p>}
        <CtaButton label={d.ctaLabel} />
      </div>
      {d.imageUrl && <ImagePlaceholder url={d.imageUrl} alt={d.imageAlt} className="w-20 h-20 shrink-0" />}
      {!d.imageUrl && (
        <div className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center" style={{ background: PH }}>
          <span className="material-symbols-outlined text-[#54433e]/20 text-2xl">image</span>
        </div>
      )}
    </div>
  );
}

const BLOCK_VARIANTS: Record<string, { bg: string; text: string }> = {
  light:    { bg: '#ffffff',  text: '#151b2d' },
  dark:     { bg: '#151b2d', text: '#ffffff'  },
  cream:    { bg: '#fdf5e8', text: '#151b2d'  },
  bordered: { bg: '#ffffff',  text: '#151b2d' },
};

function HomeBlockPreview({ d }: { d: any }) {
  const v = BLOCK_VARIANTS[d.variant] ?? BLOCK_VARIANTS.light;
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: v.bg,
        border: d.variant === 'bordered' ? `1px solid rgba(84,67,62,0.15)` : undefined,
      }}
    >
      {d.kicker && <p className="text-[9px] font-extrabold uppercase tracking-wider mb-1" style={{ color: ORANGE }}>{d.kicker}</p>}
      <p className="text-sm font-bold leading-snug font-serif" style={{ color: v.text }}>{d.title || '—'}</p>
      {d.body && <p className="text-[10px] mt-1 line-clamp-2" style={{ color: v.text, opacity: 0.6 }}>{d.body}</p>}
      {d.ctaLabel && (
        <div className="mt-3 inline-flex items-center gap-1 text-[9px] font-bold" style={{ color: ORANGE }}>
          {d.ctaLabel} →
        </div>
      )}
    </div>
  );
}

function HomeHeroCarouselPreview({ d }: { d: any }) {
  const slide = (d.slides ?? [{}])[0] ?? {};
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 130, background: '#151b2d' }}>
      {slide.imageUrl && <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
      <div className="relative p-4">
        {d.tagline && <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/40 mb-2">{d.tagline}</p>}
        <p className="text-base font-bold text-white font-serif leading-snug">{slide.title || 'Slide 1'}</p>
        {slide.subtitle && <p className="text-[10px] text-white/60 mt-1">{slide.subtitle}</p>}
        <div className="flex gap-2 mt-3">
          {d.primaryCtaLabel && <CtaButton label={d.primaryCtaLabel} />}
          {d.secondaryCtaLabel && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold text-white/70 border border-white/20">
              {d.secondaryCtaLabel}
            </div>
          )}
        </div>
        {(d.slides ?? []).length > 1 && (
          <div className="flex gap-1 mt-3">
            {(d.slides as any[]).map((_: any, i: number) => (
              <div key={i} className="rounded-full" style={{ width: i === 0 ? 16 : 5, height: 5, background: i === 0 ? ORANGE : 'rgba(255,255,255,0.25)' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContentPickPreview({ d }: { d: any }) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: `${ORANGE}22` }}>
      {d.overrideImageUrl && <img src={d.overrideImageUrl} alt="" className="w-full h-20 object-cover" />}
      {!d.overrideImageUrl && <div className="w-full h-20 flex items-center justify-center" style={{ background: PH }}><span className="material-symbols-outlined text-[#54433e]/20 text-2xl">image</span></div>}
      <div className="p-3">
        {d.label && <p className="text-[9px] font-extrabold uppercase tracking-wider mb-1" style={{ color: ORANGE }}>{d.label}</p>}
        <p className="text-xs font-bold text-[#151b2d] line-clamp-2">{d.overrideTitle || d.slug || '—'}</p>
        {d.overrideExcerpt && <p className="text-[9px] text-[#54433e]/60 mt-1 line-clamp-2">{d.overrideExcerpt}</p>}
        <CtaButton label={d.ctaLabel} />
      </div>
    </div>
  );
}

const WIDGET_ICONS: Record<string, string> = {
  categories_grid: 'grid_view',
  products_grid: 'storefront',
  workshop_banner: 'school',
  featured_collections: 'collections_bookmark',
  search_bar: 'search',
};

function EmbeddedWidgetPreview({ d }: { d: any }) {
  const icon = WIDGET_ICONS[d.widget] ?? 'widgets';
  return (
    <div className="rounded-xl p-4 border border-dashed border-[#54433e]/20 text-center">
      <span className="material-symbols-outlined text-3xl mb-2 block" style={{ color: ORANGE }}>{icon}</span>
      <p className="text-[10px] font-bold text-[#151b2d] uppercase tracking-wider">{d.widget || 'widget'}</p>
      {d.kicker && <Kicker text={d.kicker} />}
      {d.title && <p className="text-xs font-bold text-[#151b2d] mt-1">{d.title}</p>}
    </div>
  );
}

function GenericPreview({ d }: { d: any }) {
  return (
    <div>
      <Kicker text={d.kicker} />
      <Title text={d.title} />
      <Body text={d.body} />
      {d.ctaLabel && <CtaButton label={d.ctaLabel} />}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function SectionPreview({ type, draft }: SectionPreviewProps) {
  const d = draft ?? {};

  const inner = (() => {
    switch (type) {
      case 'hero':               return <HeroPreview d={d} />;
      case 'quote':              return <QuotePreview d={d} />;
      case 'two_column_intro':   return <TwoColumnIntroPreview d={d} />;
      case 'technique_grid':     return <TechniqueGridPreview d={d} />;
      case 'featured_aside_card':return <FeaturedAsideCardPreview d={d} />;
      case 'metrics_stat':       return <MetricsStatPreview d={d} />;
      case 'muestra_intro':      return <MuestraIntroPreview d={d} />;
      case 'archive_label':      return <ArchiveLabelPreview d={d} />;
      case 'editorial_footer':   return <EditorialFooterPreview d={d} />;
      case 'home_value_props':   return <HomeValuePropsPreview d={d} />;
      case 'home_section_header':return <HomeSectionHeaderPreview d={d} />;
      case 'home_block':         return <HomeBlockPreview d={d} />;
      case 'home_hero_carousel': return <HomeHeroCarouselPreview d={d} />;
      case 'content_pick':       return <ContentPickPreview d={d} />;
      case 'embedded_widget':    return <EmbeddedWidgetPreview d={d} />;
      default:                   return <GenericPreview d={d} />;
    }
  })();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: ORANGE }} />
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#54433e]/50">Preview</p>
      </div>
      <div className="flex-1 rounded-xl p-4 overflow-auto" style={{ background: '#f9f7f2', border: '1px solid rgba(84,67,62,0.07)' }}>
        {inner}
      </div>
      <p className="text-[8px] text-center text-[#54433e]/30 mt-2 font-medium">Representación aproximada · no pixel-perfect</p>
    </div>
  );
}
