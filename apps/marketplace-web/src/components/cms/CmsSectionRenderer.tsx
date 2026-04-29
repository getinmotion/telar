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

interface Props {
  section: CmsSection;
  /** Optional override for the count shown in the hero block. */
  totalTechniqueCount?: number;
}

export function CmsSectionRenderer({ section, totalTechniqueCount }: Props) {
  const { data: techImages } = useProductImagesByTechnique();
  const p = section.payload ?? {};

  switch (section.type) {
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

    default:
      return null;
  }
}
