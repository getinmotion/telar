/**
 * CmsSectionRenderer — renders a single CmsSection of a known type. Unknown
 * types render nothing so the page degrades gracefully when we prototype new
 * payload shapes from the admin UI before adding a renderer.
 */

import { Link } from 'react-router-dom';
import type { CmsSection } from '@/services/cms-sections.actions';
import {
  useProductImagesByTechnique,
  getTechniqueImage,
} from '@/hooks/useProductImagesByTechnique';
import { CmsHeroCarousel } from '@/components/cms/CmsHeroCarousel';

interface Props {
  section: CmsSection;
  /** Optional override for the count shown in the hero block. */
  totalTechniqueCount?: number;
}

export function CmsSectionRenderer({ section, totalTechniqueCount }: Props) {
  const { data: techImages } = useProductImagesByTechnique();
  const p = section.payload ?? {};

  switch (section.type) {
    case 'hero_split': {
      const imageOnRight = (p.imageSide || 'right') !== 'left';
      const text = (
        <div className="flex-1 space-y-6">
          {p.kicker && (
            <span
              className="text-[11px] uppercase tracking-[0.4em] font-bold font-sans"
              style={{ color: '#ec6d13' }}
            >
              {p.kicker}
            </span>
          )}
          {p.title && (
            <h1
              className="text-5xl md:text-6xl font-serif font-bold leading-tight"
              style={{ letterSpacing: '-0.02em', color: '#1b1c19' }}
            >
              {p.title}
            </h1>
          )}
          {p.subtitle && (
            <p
              className="text-xl md:text-2xl font-serif italic leading-relaxed"
              style={{ color: '#584237' }}
            >
              {p.subtitle}
            </p>
          )}
          {p.body && (
            <p
              className="text-base leading-relaxed max-w-xl"
              style={{ color: 'rgba(44,44,44,0.7)' }}
            >
              {p.body}
            </p>
          )}
          {p.ctaLabel && p.ctaHref && (
            <Link
              to={p.ctaHref}
              className="inline-block mt-4 px-10 py-4 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#1b1c19] transition-colors duration-300"
              style={{ backgroundColor: '#ec6d13' }}
            >
              {p.ctaLabel}
            </Link>
          )}
        </div>
      );
      const image = (
        <div className="flex-1">
          <div
            className="aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-sm"
            style={{ backgroundColor: '#e4e2dd' }}
          >
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.imageAlt || ''}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
        </div>
      );
      return (
        <section className="max-w-[1400px] mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
            {imageOnRight ? (<>{text}{image}</>) : (<>{image}{text}</>)}
          </div>
        </section>
      );
    }

    case 'hero':
      return (
        <header className="mb-32 max-w-4xl">
          {p.kicker && (
            <span
              className="text-[11px] uppercase tracking-[0.4em] mb-6 block font-bold font-sans"
              style={{ color: '#ec6d13' }}
            >
              {p.kicker}
            </span>
          )}
          {p.title && (
            <h1
              className="font-serif text-6xl md:text-8xl font-bold leading-[1.05] mb-10"
              style={{ letterSpacing: '-0.02em' }}
            >
              {p.title}
            </h1>
          )}
          <div className="flex flex-col md:flex-row gap-12 items-baseline">
            {p.body && (
              <p
                className="text-lg leading-relaxed max-w-xl opacity-90"
                style={{ color: '#584237' }}
              >
                {p.body}
              </p>
            )}
            {p.totalCountLabel && (
              <div
                className="flex flex-col border-l pl-8"
                style={{ borderColor: 'rgba(140,114,101,0.3)' }}
              >
                <span className="text-4xl font-serif font-bold">
                  {totalTechniqueCount ?? '—'}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-sans">
                  {p.totalCountLabel}
                </span>
              </div>
            )}
          </div>
        </header>
      );

    case 'quote':
      return (
        <section
          className="mb-48 -mx-8 md:-mx-16 py-32 px-8 md:px-16 overflow-hidden"
          style={{ backgroundColor: '#1b1c19', color: '#f9f7f2' }}
        >
          <div className="max-w-5xl">
            {p.kicker && (
              <span className="text-[10px] uppercase tracking-[0.5em] opacity-40 mb-12 block font-sans">
                {p.kicker}
              </span>
            )}
            <blockquote
              className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.1] italic mb-12"
              style={{ letterSpacing: '-0.02em' }}
            >
              "{p.body}"
            </blockquote>
            {p.attribution && (
              <cite className="text-[11px] uppercase tracking-[0.4em] not-italic opacity-60 font-sans">
                {p.attribution}
              </cite>
            )}
          </div>
        </section>
      );

    case 'two_column_intro': {
      const cols: any[] = Array.isArray(p.columns) ? p.columns : [];
      return (
        <section className="mb-24">
          <div className="max-w-4xl mb-16">
            {p.kicker && (
              <span
                className="text-[10px] uppercase tracking-[0.5em] mb-6 block font-bold font-sans"
                style={{ color: '#ec6d13' }}
              >
                {p.kicker}
              </span>
            )}
            {p.title && (
              <h2
                className="font-serif text-5xl md:text-6xl font-bold leading-[1.05] mb-10"
                style={{ letterSpacing: '-0.02em' }}
              >
                {p.title}
              </h2>
            )}
            {p.body && (
              <p
                className="text-lg leading-relaxed opacity-90"
                style={{ color: '#584237' }}
              >
                {p.body}
              </p>
            )}
          </div>
          {cols.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {cols.map((col, i) => (
                <div
                  key={i}
                  className="p-10 border-t-2"
                  style={{ backgroundColor: '#f0eee9', borderColor: '#ec6d13' }}
                >
                  {col.kicker && (
                    <span
                      className="text-[10px] uppercase tracking-[0.3em] font-bold font-sans block mb-4"
                      style={{ color: '#ec6d13' }}
                    >
                      {col.kicker}
                    </span>
                  )}
                  {col.title && (
                    <h3 className="font-serif text-2xl font-bold mb-4 italic">
                      {col.title}
                    </h3>
                  )}
                  {col.body && (
                    <p
                      className="text-sm leading-relaxed opacity-80"
                      style={{ color: '#584237' }}
                    >
                      {col.body}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    case 'technique_grid': {
      const cards: any[] = Array.isArray(p.cards) ? p.cards : [];
      return (
        <section className="mb-48">
          <div className="mb-12">
            {p.kicker && (
              <span
                className="text-[10px] uppercase tracking-[0.4em] font-bold font-sans block mb-4"
                style={{ color: 'rgba(44,44,44,0.4)' }}
              >
                {p.kicker}
              </span>
            )}
            {p.title && (
              <h3
                className="font-serif text-3xl md:text-4xl font-bold leading-tight"
                style={{ letterSpacing: '-0.02em' }}
              >
                {p.title}
              </h3>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {cards.map((card, i) => {
              const img = card.imageKey
                ? getTechniqueImage(techImages, card.imageKey)
                : null;
              const inner = (
                <>
                  <div
                    className="aspect-[4/3] overflow-hidden mb-6"
                    style={{ backgroundColor: '#e4e2dd' }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span
                          className="font-serif italic text-3xl"
                          style={{ color: 'rgba(44,44,44,0.08)' }}
                        >
                          {card.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-serif text-2xl font-bold mb-3 group-hover:text-[#ec6d13] transition-colors">
                    {card.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed opacity-80"
                    style={{ color: '#584237' }}
                  >
                    {card.body}
                  </p>
                </>
              );
              return card.slug ? (
                <Link
                  key={i}
                  to={`/tecnica/${card.slug}`}
                  className="group block"
                >
                  {inner}
                </Link>
              ) : (
                <div key={i} className="group">
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    case 'featured_aside_card':
      return (
        <div
          className="p-10 md:p-12 flex flex-col justify-center"
          style={{ backgroundColor: '#f0eee9' }}
        >
          <div
            className="mb-6 flex items-center justify-center w-10 h-10"
            style={{
              backgroundColor: 'rgba(236,109,19,0.1)',
              color: '#ec6d13',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          {p.title && (
            <h4 className="font-serif text-xl font-bold mb-4 italic">
              {p.title}
            </h4>
          )}
          {p.body && (
            <p
              className="text-xs leading-relaxed opacity-80 mb-6"
              style={{ color: '#584237' }}
            >
              {p.body}
            </p>
          )}
          {p.ctaLabel &&
            (p.ctaHref ? (
              <Link
                to={p.ctaHref}
                className="text-[10px] uppercase tracking-[0.3em] font-bold w-fit border-b font-sans"
                style={{ borderColor: '#1b1c19' }}
              >
                {p.ctaLabel}
              </Link>
            ) : (
              <button
                className="text-[10px] uppercase tracking-[0.3em] font-bold w-fit border-b font-sans"
                style={{ borderColor: '#1b1c19' }}
              >
                {p.ctaLabel}
              </button>
            ))}
        </div>
      );

    case 'metrics_stat':
      return (
        <div
          className="col-span-12 md:col-span-3 p-10 flex flex-col justify-between aspect-square md:aspect-auto"
          style={{ backgroundColor: '#ec6d13', color: '#fff' }}
        >
          {p.kicker && (
            <span className="text-[10px] uppercase tracking-[0.3em] font-sans">
              {p.kicker}
            </span>
          )}
          <div>
            {p.value && (
              <span className="text-6xl font-serif font-bold block mb-2">
                {p.value}
              </span>
            )}
            {p.caption && (
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 font-sans">
                {p.caption}
              </p>
            )}
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
        </div>
      );

    case 'muestra_intro':
      return (
        <div className="mb-12 max-w-3xl">
          {p.kicker && (
            <span
              className="text-[10px] uppercase tracking-[0.5em] mb-4 block font-bold font-sans"
              style={{ color: '#ec6d13' }}
            >
              {p.kicker}
            </span>
          )}
          {p.title && (
            <h2
              className="font-serif text-4xl md:text-5xl font-bold leading-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              {p.title}
            </h2>
          )}
          {p.body && (
            <p
              className="mt-4 text-base leading-relaxed opacity-80"
              style={{ color: '#584237' }}
            >
              {p.body}
            </p>
          )}
        </div>
      );

    case 'archive_label':
      return (
        <h2
          className="text-[10px] uppercase tracking-[0.5em] mb-24 block font-bold text-center font-sans"
          style={{ color: '#ec6d13' }}
        >
          {p.kicker}
        </h2>
      );

    case 'editorial_footer': {
      const links: any[] = Array.isArray(p.links) ? p.links : [];
      return (
        <footer
          className="mb-24 pt-24 border-t"
          style={{ borderColor: 'rgba(140,114,101,0.2)' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <div>
              {p.kicker && (
                <p
                  className="text-[10px] uppercase tracking-[0.5em] mb-8 block font-bold font-sans"
                  style={{ color: '#ec6d13' }}
                >
                  {p.kicker}
                </p>
              )}
              {p.title && (
                <h3
                  className="font-serif text-4xl font-bold mb-8 leading-tight"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {p.title}
                </h3>
              )}
              {p.body && (
                <p
                  className="leading-relaxed opacity-80 text-lg mb-10"
                  style={{ color: '#584237' }}
                >
                  {p.body}
                </p>
              )}
              {links.length > 0 && (
                <div className="flex gap-8 flex-wrap">
                  {links.map((l, i) => (
                    <Link
                      key={i}
                      to={l.href || '#'}
                      className="text-[10px] uppercase tracking-[0.2em] font-bold border-b font-sans"
                      style={{ borderColor: '#1b1c19' }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div
              className="p-12 flex flex-col justify-between"
              style={{ backgroundColor: '#eae8e3' }}
            >
              <div className="max-w-xs">
                {p.asideTitle && (
                  <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-4 opacity-50 font-sans">
                    {p.asideTitle}
                  </h4>
                )}
                {p.asideBody && (
                  <p className="text-sm leading-relaxed mb-8">
                    {p.asideBody}
                  </p>
                )}
              </div>
              {p.asideCtaLabel && (
                <button
                  className="w-full py-4 border text-[10px] uppercase tracking-[0.3em] font-bold transition-colors hover:bg-[#1b1c19] hover:text-[#f9f7f2] font-sans"
                  style={{ borderColor: '#1b1c19' }}
                >
                  {p.asideCtaLabel}
                </button>
              )}
            </div>
          </div>
          {(p.copyright || p.edition) && (
            <div
              className="mt-24 pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-8"
              style={{ borderColor: 'rgba(140,114,101,0.1)' }}
            >
              {p.copyright && (
                <span className="text-[9px] uppercase tracking-[0.4em] opacity-40 font-sans">
                  {p.copyright}
                </span>
              )}
              {p.edition && (
                <span className="text-[9px] uppercase tracking-[0.4em] opacity-40 font-sans">
                  {p.edition}
                </span>
              )}
            </div>
          )}
        </footer>
      );
    }

    case 'home_hero_carousel': {
      const slides: any[] = Array.isArray(p.slides) ? p.slides : [];
      return (
        <CmsHeroCarousel
          description={p.description}
          tagline={p.tagline}
          primaryCtaLabel={p.primaryCtaLabel}
          primaryCtaHref={p.primaryCtaHref}
          secondaryCtaLabel={p.secondaryCtaLabel}
          secondaryCtaHref={p.secondaryCtaHref}
          autoplaySeconds={p.autoplaySeconds}
          slides={slides}
        />
      );
    }

    case 'home_value_props': {
      const cards: any[] = Array.isArray(p.cards) ? p.cards : [];
      return (
        <section className="py-12 bg-[#fdfaf6]/50 border-b border-[#2c2c2c]/5">
          <div className="max-w-[1400px] mx-auto px-6 grid md:grid-cols-3 gap-12">
            {cards.map((c, i) => (
              <div key={i} className="space-y-3">
                {c.imageUrl && (
                  <div className="aspect-square bg-[#e5e1d8] overflow-hidden mb-4">
                    <img
                      src={c.imageUrl}
                      alt={c.title ?? ''}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                {c.title && (
                  <h4 className="font-serif italic text-xl">{c.title}</h4>
                )}
                {c.body && (
                  <p className="text-xs text-[#2c2c2c]/60 leading-relaxed uppercase tracking-wider">
                    {c.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }

    case 'home_section_header':
      return (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            {p.kicker && (
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] block mb-4 opacity-40">
                {p.kicker}
              </span>
            )}
            {p.title && (
              <h2 className={`text-5xl font-serif mb-4 ${p.italicTitle ? 'italic' : ''}`}>{p.title}</h2>
            )}
            {p.subtitle && (
              <p className="text-[#2c2c2c]/60 italic font-serif">
                {p.subtitle}
              </p>
            )}
          </div>
          {p.ctaLabel && p.ctaHref && (
            <Link
              to={p.ctaHref}
              className="text-xs font-bold uppercase tracking-widest border-b border-[#2c2c2c] flex items-center gap-2 pb-1 hover:text-[#ec6d13] hover:border-[#ec6d13] transition-colors w-fit"
            >
              {p.ctaLabel}
            </Link>
          )}
        </div>
      );

    case 'home_block': {
      const variant = (p.variant as string) || 'light';
      if (variant === 'dark') {
        return (
          <section className="bg-[#2c2c2c] text-[#fdfaf6] py-32">
            <div className="max-w-[1400px] mx-auto px-6">
              {p.kicker && (
                <h2 className="text-xs font-bold uppercase tracking-[0.5em] text-center mb-20 opacity-40">
                  {p.kicker}
                </h2>
              )}
              <div className="text-center space-y-10 max-w-2xl mx-auto">
                {p.title && (
                  <h3 className="text-4xl md:text-5xl font-serif">{p.title}</h3>
                )}
                {p.body && (
                  <p className="text-2xl font-serif italic opacity-90">
                    {p.body}
                  </p>
                )}
                {p.ctaLabel && p.ctaHref && (
                  <Link
                    to={p.ctaHref}
                    className="inline-block border border-[#ec6d13] text-[#ec6d13] px-10 py-4 uppercase text-xs tracking-widest hover:bg-[#ec6d13] hover:text-white transition-all"
                  >
                    {p.ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          </section>
        );
      }
      if (variant === 'bordered') {
        return (
          <section className="py-24 px-6 max-w-[1400px] mx-auto">
            <div className="border border-[#2c2c2c]/10 p-12 md:p-24 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
              <div className="max-w-xl space-y-8 relative z-10">
                {p.kicker && (
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50">
                    {p.kicker}
                  </span>
                )}
                {p.title && (
                  <h2 className="text-4xl md:text-5xl font-serif">{p.title}</h2>
                )}
                {p.body && (
                  <p className="text-xl text-[#2c2c2c]/70 leading-relaxed italic">
                    {p.body}
                  </p>
                )}
                {p.ctaLabel && p.ctaHref && (
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                    <Link
                      to={p.ctaHref}
                      className="border-b border-[#2c2c2c] pb-1 hover:text-[#ec6d13] hover:border-[#ec6d13] transition-colors"
                    >
                      {p.ctaLabel}
                    </Link>
                  </div>
                )}
              </div>
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.title || ''}
                  className="w-full md:w-1/2 aspect-[4/3] object-cover"
                />
              )}
            </div>
          </section>
        );
      }
      if (variant === 'cream') {
        return (
          <section className="py-24 px-6 bg-[#fdfaf6]">
            <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-16 items-center">
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.title || ''}
                  className="w-full aspect-square object-cover"
                />
              )}
              <div className="space-y-6">
                {p.kicker && (
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50">
                    {p.kicker}
                  </span>
                )}
                {p.title && (
                  <h2 className="text-5xl font-serif">{p.title}</h2>
                )}
                {p.body && (
                  <p className="text-xl text-[#2c2c2c]/70 leading-relaxed font-light">
                    {p.body}
                  </p>
                )}
                {p.ctaLabel && p.ctaHref && (
                  <Link
                    to={p.ctaHref}
                    className="inline-block border-b border-[#2c2c2c] pb-1 text-xs font-bold uppercase tracking-widest hover:text-[#ec6d13] hover:border-[#ec6d13] transition-colors"
                  >
                    {p.ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          </section>
        );
      }
      // light (default)
      return (
        <section className="py-24 px-6 max-w-[1400px] mx-auto">
          <div className="space-y-6 max-w-3xl">
            {p.kicker && (
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-50">
                {p.kicker}
              </span>
            )}
            {p.title && (
              <h2 className="text-4xl md:text-5xl font-serif">{p.title}</h2>
            )}
            {p.body && (
              <p className="text-xl text-[#2c2c2c]/70 leading-relaxed italic">
                {p.body}
              </p>
            )}
            {p.ctaLabel && p.ctaHref && (
              <Link
                to={p.ctaHref}
                className="inline-block border-b border-[#2c2c2c] pb-1 text-xs font-bold uppercase tracking-widest hover:text-[#ec6d13] hover:border-[#ec6d13] transition-colors w-fit"
              >
                {p.ctaLabel}
              </Link>
            )}
          </div>
        </section>
      );
    }

    case 'about_hero': {
      return (
        <section className="max-w-[1400px] mx-auto px-6 mb-24">
          <div className="relative rounded-2xl overflow-hidden">
            {p.bgImageUrl && (
              <img
                src={p.bgImageUrl}
                alt={p.bgImageAlt || ''}
                className="absolute inset-0 w-full h-full object-cover"
                style={p.bgObjectPosition ? { objectPosition: p.bgObjectPosition } : undefined}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2c2c2c]/85 via-[#2c2c2c]/60 to-[#2c2c2c]/30" />
            <div className="relative px-8 md:px-16 py-20 md:py-32">
              <h1 className="text-5xl md:text-7xl leading-[0.85] font-serif mb-6 text-white tracking-tight">
                {p.titleLineTop && <>{p.titleLineTop}<br /></>}
                {p.titleLineItalic && <span className="italic text-[#ec6d13]">{p.titleLineItalic}</span>}
                {p.titleLineBottom && <><br />{p.titleLineBottom}</>}
              </h1>
              {p.body && (
                <p className="text-base md:text-lg text-white/80 max-w-2xl font-sans leading-relaxed">
                  {p.body}
                </p>
              )}
            </div>
          </div>
        </section>
      );
    }

    case 'about_two_col': {
      const imageOnRight = (p.imageSide || 'right') === 'right';
      const bullets: string[] = Array.isArray(p.bullets) ? p.bullets : [];
      const paragraphs: string[] = Array.isArray(p.paragraphs) ? p.paragraphs : [];
      const textCol = (
        <div className={imageOnRight ? '' : 'order-1 md:order-2'}>
          {p.kicker && (
            <div className="inline-flex items-center gap-2 bg-[#ec6d13]/10 px-4 py-2 rounded-full mb-6">
              <span className="text-[10px] uppercase tracking-widest font-sans text-[#ec6d13] font-bold">
                {p.kicker}
              </span>
            </div>
          )}
          <h2 className="text-4xl md:text-5xl leading-tight font-serif mb-6 text-[#2c2c2c] tracking-tight">
            {p.titleLineTop && <>{p.titleLineTop}<br /></>}
            {p.titleLineItalic && <span className="italic text-[#ec6d13]">{p.titleLineItalic}</span>}
          </h2>
          {p.intro && (
            <p className="text-sm md:text-base text-[#2c2c2c]/70 font-sans leading-relaxed mb-4">
              {p.intro}
            </p>
          )}
          {paragraphs.map((para, i) => (
            <p key={i} className="text-sm md:text-base text-[#2c2c2c]/70 font-sans leading-relaxed mb-4">
              {para}
            </p>
          ))}
          {bullets.length > 0 && (
            <ul className="space-y-3 mb-6">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ec6d13] mt-2 flex-shrink-0" />
                  <span className="text-sm text-[#2c2c2c]/70 font-sans leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          )}
          {p.outro && (
            <p className="text-sm md:text-base text-[#2c2c2c]/70 font-sans leading-relaxed">
              {p.outro}
            </p>
          )}
        </div>
      );

      const imgCol = (
        <div
          className={`relative h-[400px] md:h-[500px] rounded-lg overflow-hidden ${
            imageOnRight ? '' : 'order-2 md:order-1'
          }`}
        >
          {p.imageUrl && (
            <img
              src={p.imageUrl}
              alt={p.imageAlt || ''}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ec6d13]/20 to-[#ec6d13]/5 -z-10" />
          {(p.statValue || p.statLabel) && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2c2c2c]/80 via-[#2c2c2c]/30 to-transparent p-6 md:p-8">
              {p.statValue && (
                <div className="text-5xl md:text-6xl font-bold text-white mb-1 font-serif">
                  {p.statValue}
                </div>
              )}
              {p.statLabel && (
                <div className="text-[10px] uppercase tracking-widest text-white/80 font-sans font-bold">
                  {p.statLabel}
                </div>
              )}
            </div>
          )}
          {(p.overlayKicker || p.overlayTitle) && !p.statValue && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2c2c2c]/80 via-[#2c2c2c]/30 to-transparent p-6 md:p-8">
              {p.overlayKicker && (
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-sans text-white/70 font-bold mb-2">
                  {p.overlayKicker}
                </p>
              )}
              {p.overlayTitle && (
                <p className="font-serif italic text-2xl md:text-3xl text-white leading-tight">
                  {p.overlayTitle}
                </p>
              )}
            </div>
          )}
        </div>
      );

      return (
        <section className="max-w-[1400px] mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {imageOnRight ? (
              <>
                {textCol}
                {imgCol}
              </>
            ) : (
              <>
                {imgCol}
                {textCol}
              </>
            )}
          </div>
        </section>
      );
    }

    case 'about_wide_block': {
      const paragraphs: string[] = Array.isArray(p.paragraphs) ? p.paragraphs : [];
      return (
        <section className="max-w-[1400px] mx-auto px-6 mb-24">
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-[#2c2c2c]/5">
            {p.kicker && (
              <div className="inline-flex items-center gap-2 bg-[#ec6d13]/10 px-4 py-2 rounded-full mb-6">
                <span className="text-[10px] uppercase tracking-widest font-sans text-[#ec6d13] font-bold">
                  {p.kicker}
                </span>
              </div>
            )}
            <h2 className="text-4xl md:text-5xl leading-tight font-serif mb-8 text-[#2c2c2c] tracking-tight">
              {p.titleLineTop && <>{p.titleLineTop}<br /></>}
              {p.titleLineItalic && <span className="italic text-[#ec6d13]">{p.titleLineItalic}</span>}
            </h2>
            <div className="space-y-5 max-w-3xl">
              {paragraphs.map((para, i) => (
                <p key={i} className="text-base md:text-lg text-[#2c2c2c]/70 font-sans leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case 'about_cta': {
      const ctas: any[] = Array.isArray(p.ctas) ? p.ctas : [];
      return (
        <section className="max-w-[1400px] mx-auto px-6 mb-32">
          <div className="bg-gradient-to-r from-[#ec6d13] to-[#ec6d13]/80 rounded-2xl p-12 md:p-16 text-center text-white">
            <h2 className="text-4xl md:text-5xl leading-tight font-serif mb-6 tracking-tight">
              {p.titleLineTop && <>{p.titleLineTop}<br /></>}
              {p.titleLineItalic && <span className="italic">{p.titleLineItalic}</span>}
            </h2>
            {p.body && (
              <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-8 font-sans leading-relaxed">
                {p.body}
              </p>
            )}
            {ctas.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {ctas.map((cta, i) =>
                  cta.variant === 'outline' ? (
                    <Link
                      key={i}
                      to={cta.href}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-colors"
                    >
                      {cta.label}
                    </Link>
                  ) : (
                    <Link
                      key={i}
                      to={cta.href}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 bg-white text-[#ec6d13] hover:bg-white/90 transition-colors"
                    >
                      {cta.label}
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    case 'territorios_hero': {
      const stats: any[] = Array.isArray(p.stats) ? p.stats : [];
      return (
        <section className="px-8 pt-24 pb-12 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-8">
            {p.kicker && (
              <span
                className="text-sm tracking-[0.3em] uppercase mb-6 block font-sans font-bold"
                style={{ color: '#ec6d13' }}
              >
                {p.kicker}
              </span>
            )}
            {p.title && (
              <h1
                className="text-6xl md:text-8xl font-serif font-bold leading-tight mb-8"
                style={{ letterSpacing: '-0.02em', color: '#1b1c19' }}
              >
                {p.title}
              </h1>
            )}
            {p.body && (
              <p
                className="text-xl md:text-2xl font-serif italic max-w-2xl leading-relaxed"
                style={{ color: '#584237' }}
              >
                {p.body}
              </p>
            )}
          </div>
          {stats.length > 0 && (
            <div className="md:col-span-4 flex flex-col justify-end items-start md:items-end text-left md:text-right space-y-4">
              {stats.map((s, i) => (
                <div key={i}>
                  <span className="block text-4xl font-serif" style={{ color: '#ec6d13' }}>
                    {s.value}
                  </span>
                  <span
                    className="text-xs tracking-widest uppercase font-sans"
                    style={{ color: '#584237' }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      );
    }

    case 'territorios_dark_quote': {
      const leftStats: any[] = Array.isArray(p.leftStats) ? p.leftStats : [];
      return (
        <section className="py-32" style={{ backgroundColor: '#1b1c19', color: '#e4e2dd' }}>
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
              <div className="space-y-12">
                {p.quote && (
                  <div className="max-w-md">
                    <span className="text-4xl mb-6 block" style={{ color: '#ec6d13' }}>"</span>
                    <p className="text-3xl font-serif leading-snug mb-6">{p.quote}</p>
                    <div className="w-16 h-[2px]" style={{ backgroundColor: '#ec6d13' }} />
                  </div>
                )}
                {leftStats.length > 0 && (
                  <div className="grid grid-cols-2 gap-8">
                    {leftStats.map((s, i) => (
                      <div
                        key={i}
                        className="p-8 border rounded-lg"
                        style={{ borderColor: 'rgba(228,226,221,0.1)' }}
                      >
                        <span
                          className="block text-5xl font-serif mb-2"
                          style={{ color: s.color || '#ec6d13' }}
                        >
                          {s.value}
                        </span>
                        <p className="text-xs uppercase tracking-widest opacity-60 font-sans">
                          {s.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="relative aspect-video md:aspect-square rounded-xl overflow-hidden flex items-center justify-center p-12"
                style={{ backgroundColor: 'rgba(228,226,221,0.05)' }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                <div className="relative z-10 text-center">
                  {p.rightTitle && (
                    <h4 className="text-4xl font-serif mb-6" style={{ color: '#f9f7f2' }}>
                      {p.rightTitle}
                    </h4>
                  )}
                  {p.rightBody && (
                    <p
                      className="max-w-sm mx-auto leading-relaxed italic"
                      style={{ color: 'rgba(228,226,221,0.7)' }}
                    >
                      {p.rightBody}
                    </p>
                  )}
                  <div className="mt-12 flex justify-center gap-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ec6d13' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(236,109,19,0.4)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'rgba(236,109,19,0.2)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    case 'historias_hero': {
      return (
        <header className="max-w-[1400px] mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-32 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {p.kicker && (
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#2c2c2c]/40 font-bold">
                {p.kicker}
              </span>
            )}
            {p.title && (
              <h1 className="text-6xl md:text-8xl font-serif italic leading-[0.9] tracking-tight">
                {p.title}
              </h1>
            )}
            {p.body && (
              <p className="text-xl md:text-2xl text-[#2c2c2c]/70 leading-relaxed font-light italic font-serif max-w-3xl mx-auto">
                {p.body}
              </p>
            )}
            {p.ctaLabel && p.ctaHref && (
              <div className="pt-4">
                <a
                  href={p.ctaHref}
                  className="inline-block px-10 py-4 bg-[#ec6d13] text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#2c2c2c] transition-colors duration-300"
                >
                  {p.ctaLabel}
                </a>
              </div>
            )}
          </div>
        </header>
      );
    }

    case 'historias_story_types_grid': {
      const cards: any[] = Array.isArray(p.cards) ? p.cards : [];
      return (
        <section className="max-w-[1400px] mx-auto px-6 py-10 md:py-10 border-y border-[#2c2c2c]/5">
          <div className="mb-16">
            {p.kicker && (
              <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-4 text-[#2c2c2c]/40">
                {p.kicker}
              </h3>
            )}
            {p.title && (
              <p className="text-3xl md:text-4xl font-serif italic">{p.title}</p>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {cards.map((card, i) => (
              <Link
                key={i}
                to={card.href}
                className="group p-8 md:p-10 border border-[#2c2c2c]/10 hover:border-[#ec6d13]/30 hover:bg-white transition-all duration-300 text-center"
              >
                <div className="w-12 h-px bg-[#ec6d13]/40 mx-auto mb-6 group-hover:w-16 transition-all" />
                {card.title && (
                  <h4 className="font-serif text-xl md:text-2xl italic mb-2 group-hover:text-[#ec6d13] transition-colors">
                    {card.title}
                  </h4>
                )}
                {card.subtitle && (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#2c2c2c]/40 font-bold">
                    {card.subtitle}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      );
    }

    case 'historias_capsule_quote': {
      return (
        <section className="py-24 md:py-32 px-6 bg-white/50 border-y border-[#2c2c2c]/5">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-px bg-[#ec6d13]/40 mx-auto mb-16" />
            <blockquote className="font-serif italic text-3xl md:text-4xl leading-relaxed text-[#2c2c2c]">
              {p.body}
            </blockquote>
            <div className="w-16 h-px bg-[#ec6d13]/40 mx-auto mt-16" />
          </div>
        </section>
      );
    }

    case 'historias_final_cta': {
      const ctas: any[] = Array.isArray(p.ctas) ? p.ctas : [];
      return (
        <section className="bg-[#1a1a1a] py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-12 px-6">
            <div className="space-y-6">
              {p.kicker && (
                <p className="text-[10px] uppercase tracking-[0.5em] text-[#ec6d13] font-bold">
                  {p.kicker}
                </p>
              )}
              {(p.titleLineTop || p.titleLineBottom) && (
                <h2 className="text-4xl md:text-6xl font-serif leading-[1.1] text-[#f9f7f2] italic">
                  {p.titleLineTop && <>{p.titleLineTop}<br /></>}
                  {p.titleLineBottom}
                </h2>
              )}
            </div>
            {ctas.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                {ctas.map((cta, i) =>
                  cta.variant === 'primary' ? (
                    <Link
                      key={i}
                      to={cta.href}
                      className="px-12 py-4 bg-[#ec6d13] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-[#2c2c2c] transition-all"
                    >
                      {cta.label}
                    </Link>
                  ) : (
                    <Link
                      key={i}
                      to={cta.href}
                      className="px-12 py-4 border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest hover:border-[#ec6d13] hover:text-[#ec6d13] transition-all"
                    >
                      {cta.label}
                    </Link>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
