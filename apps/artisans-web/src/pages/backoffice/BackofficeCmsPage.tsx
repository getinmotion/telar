import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowRight, Eye, EyeOff, Save, Trash2, ChevronDown, Plus, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useCmsAdmin } from '@/hooks/useCmsAdmin';
import { telarApi } from '@/integrations/api/telarApi';
import type { CmsSection, CmsSectionType } from '@/services/cms-sections.types';
import { SANS, SERIF, lc } from '@/components/dashboard/dashboardStyles';
import {
  ORANGE, ORANGE_MID,
  SECTION_TYPE_META,
  renderSectionForm,
} from '@/components/cms/SectionFormFields';
import { SectionPreview } from '@/components/cms/SectionPreview';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const GREEN = '#15803d';

// ─── Data ────────────────────────────────────────────────────────────────────
const PAGE_CARDS = [
  { key: 'tecnicas',    label: '/tecnicas',    description: 'Técnicas artesanales documentadas', icon: 'auto_stories' },
  { key: 'home',        label: '/ (home)',      description: 'Página principal del marketplace',   icon: 'home'         },
  { key: 'colecciones', label: '/colecciones',  description: 'Índice de colecciones curadas',      icon: 'collections'  },
];

const SECTION_TYPES = Object.entries(SECTION_TYPE_META).map(([value, meta]) => ({
  value: value as CmsSectionType,
  ...meta,
}));

function emptyPayloadFor(type: CmsSectionType): Record<string, any> {
  switch (type) {
    case 'hero':             return { kicker: '', title: '', subtitle: '', body: '', totalCountLabel: '' };
    case 'quote':            return { kicker: '', body: '', attribution: '' };
    case 'two_column_intro': return { kicker: '', title: '', body: '', columns: [{ kicker: '', title: '', body: '' }, { kicker: '', title: '', body: '' }] };
    case 'technique_grid':   return { kicker: '', title: '', cards: Array(4).fill({ title: '', body: '', slug: '', imageKey: '' }) };
    case 'featured_aside_card': return { title: '', body: '', ctaLabel: '', ctaHref: '' };
    case 'metrics_stat':     return { kicker: '', value: '', caption: '' };
    case 'muestra_intro':    return { kicker: '', title: '', body: '' };
    case 'archive_label':    return { kicker: '' };
    case 'editorial_footer': return { kicker: '', title: '', body: '', links: Array(3).fill({ label: '', href: '' }), asideTitle: '', asideBody: '', asideCtaLabel: '', copyright: '', edition: '' };
    case 'home_value_props': return { cards: Array(3).fill({ title: '', body: '', imageUrl: '' }) };
    case 'home_section_header': return { slot: '', kicker: '', title: '', subtitle: '', ctaLabel: '', ctaHref: '', imageUrl: '', imageAlt: '' };
    case 'home_block':       return { slot: '', kicker: '', title: '', body: '', ctaLabel: '', ctaHref: '', imageUrl: '', variant: 'light' };
    case 'home_hero_carousel': return { description: '', tagline: '', primaryCtaLabel: '', primaryCtaHref: '', secondaryCtaLabel: '', secondaryCtaHref: '', autoplaySeconds: 6, slides: [{ title: '', subtitle: '', imageUrl: '', imageAlt: '', origin: '', quote: '' }] };
    case 'content_pick':     return { slot: '', targetType: 'collection', slug: '', label: '', ctaLabel: '', variant: 'banner', overrideTitle: '', overrideExcerpt: '', overrideImageUrl: '' };
    case 'embedded_widget':  return { widget: 'categories_grid', kicker: '', title: '', subtitle: '', ctaLabel: '', ctaHref: '' };
    default:                 return {};
  }
}

// ─── Page stats ───────────────────────────────────────────────────────────────
interface PageStat { total: number; published: number; loading: boolean }

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BackofficeCmsPage() {
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pageStats, setPageStats] = useState<Record<string, PageStat>>(
    Object.fromEntries(PAGE_CARDS.map(p => [p.key, { total: 0, published: 0, loading: true }])),
  );

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardType, setWizardType] = useState<CmsSectionType>('hero');
  const [wizardDraft, setWizardDraft] = useState<Record<string, any>>({});
  const [wizardPublish, setWizardPublish] = useState(false);

  const cms = useCmsAdmin();

  const loadAllStats = useCallback(async () => {
    const results = await Promise.allSettled(
      PAGE_CARDS.map(p =>
        telarApi.get<{ data: CmsSection[] }>('/cms/sections', {
          params: { pageKey: p.key, includeUnpublished: 'true' },
        }),
      ),
    );
    setPageStats(prev => {
      const next = { ...prev };
      results.forEach((res, i) => {
        const key = PAGE_CARDS[i].key;
        if (res.status === 'fulfilled') {
          const list = res.value.data?.data ?? [];
          next[key] = { total: list.length, published: list.filter(s => s.published).length, loading: false };
        } else {
          next[key] = { ...prev[key], loading: false };
        }
      });
      return next;
    });
  }, []);

  useEffect(() => { loadAllStats(); }, [loadAllStats]);

  useEffect(() => {
    if (selectedPage) cms.fetchSections(selectedPage);
  }, [selectedPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const ordered = useMemo(
    () => [...cms.sections].sort((a, b) => a.position - b.position),
    [cms.sections],
  );

  const move = async (id: string, dir: -1 | 1) => {
    const idx = ordered.findIndex(s => s.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= ordered.length) return;
    const next = ordered.slice();
    [next[idx], next[swap]] = [next[swap], next[idx]];
    if (selectedPage) await cms.reorderSections(selectedPage, next.map(s => s.id));
  };

  const openWizard = () => {
    setWizardStep(1);
    setWizardType('hero');
    setWizardDraft(emptyPayloadFor('hero'));
    setWizardPublish(false);
    setWizardOpen(true);
  };

  const wizardSetField = (key: string, value: any) =>
    setWizardDraft(prev => ({ ...prev, [key]: value }));

  const wizardSetNested = (path: (string | number)[], value: any) =>
    setWizardDraft(prev => {
      const next = structuredClone(prev);
      let cur: any = next;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
      cur[path[path.length - 1]] = value;
      return next;
    });

  const handleWizardCreate = async () => {
    if (!selectedPage) return;
    const created = await cms.createSection({
      pageKey: selectedPage,
      type: wizardType,
      payload: wizardDraft,
      published: wizardPublish,
    });
    if (created) {
      setWizardOpen(false);
      loadAllStats();
    }
  };

  const currentCard = PAGE_CARDS.find(p => p.key === selectedPage);

  return (
    <div
      className="font-sans min-h-screen"
      style={{
        backgroundColor: '#f9f7f2',
        backgroundImage: `
          radial-gradient(circle at top left,  rgba(236,109,19,0.10) 0%, transparent 40%),
          radial-gradient(circle at bottom right, rgba(253,186,116,0.12) 0%, transparent 44%),
          radial-gradient(circle at top right, rgba(255,244,223,0.8)  0%, transparent 36%)
        `,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 px-8 py-4 bg-[#f9f7f2]/90 backdrop-blur-2xl border-b border-[#54433e]/[0.08]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(236,109,19,0.14) 0%, rgba(156,63,0,0.1) 100%)',
                border: '1px solid rgba(236,109,19,0.15)',
              }}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ color: ORANGE }}>auto_stories</span>
            </div>
            <div>
              <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>CMS</p>
              <p style={{ ...lc(0.45), fontSize: 10 }}>Contenido editorial</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] uppercase" style={{ color: ORANGE }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: ORANGE }} />
            CONTENIDO
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">

        {/* ── Quick access ─────────────────────────────────────────────────── */}
        <section>
          <SectionLabel color={ORANGE} label="Contenido editorial" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickCard
              icon="menu_book"
              label="Historias"
              description="Blog editorial · publicaciones · narrativas"
              onClick={() => navigate('/backoffice/historias')}
            />
            <QuickCard
              icon="collections_bookmark"
              label="Colecciones"
              description="Colecciones curadas · grupos temáticos"
              onClick={() => navigate('/backoffice/colecciones')}
            />
          </div>
        </section>

        {/* ── Secciones de página ───────────────────────────────────────────── */}
        <section>
          <SectionLabel color={ORANGE} label="Secciones de página" />

          {/* Page selector cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {PAGE_CARDS.map(page => {
              const stat = pageStats[page.key];
              const isActive = selectedPage === page.key;
              return (
                <button
                  key={page.key}
                  onClick={() => setSelectedPage(isActive ? null : page.key)}
                  className={[
                    'text-left rounded-3xl p-5 transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-xl',
                    isActive
                      ? 'bg-[#ec6d13]/[0.06] border-2 border-[#ec6d13]'
                      : 'bg-white/[0.82] border border-[#ec6d13]/[0.12] shadow-sm',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                      style={{ background: isActive ? 'rgba(236,109,19,0.15)' : 'rgba(236,109,19,0.08)' }}
                    >
                      <span className="material-symbols-outlined text-[16px]" style={{ color: ORANGE }}>{page.icon}</span>
                    </div>
                    {isActive && <span className="w-2 h-2 rounded-full" style={{ background: ORANGE }} />}
                  </div>
                  <p className="text-[13px] font-bold text-[#151b2d] mb-0.5" style={{ fontFamily: SANS }}>{page.label}</p>
                  <p className="text-[10px] text-[#54433e]/50 mb-3 leading-snug" style={{ fontFamily: SANS }}>{page.description}</p>
                  {stat.loading ? (
                    <p className="text-[10px] text-[#54433e]/30" style={{ fontFamily: SANS }}>—</p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-[20px] font-extrabold leading-none" style={{ fontFamily: SANS, color: isActive ? ORANGE : '#151b2d' }}>
                        {stat.total}
                      </span>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ fontFamily: SANS, color: isActive ? ORANGE_MID : 'rgba(84,67,62,0.5)' }}>secciones</p>
                        <p className="text-[9px] font-semibold" style={{ fontFamily: SANS, color: GREEN }}>{stat.published} publicadas</p>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Section list panel */}
          {selectedPage && (
            <div className="bg-white/[0.82] backdrop-blur-xl border border-[#ec6d13]/[0.12] rounded-3xl overflow-hidden shadow-sm">
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#ec6d13]/[0.08]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: ORANGE }}>{currentCard?.icon}</span>
                  <p className="text-[13px] font-bold text-[#151b2d]" style={{ fontFamily: SANS }}>{currentCard?.label}</p>
                  {!cms.loading && (
                    <span
                      className="text-[9px] font-extrabold tracking-[0.12em] uppercase rounded-lg px-2 py-0.5"
                      style={{ fontFamily: SANS, color: ORANGE_MID, background: 'rgba(236,109,19,0.08)', border: '1px solid rgba(236,109,19,0.2)' }}
                    >
                      {ordered.length} secciones
                    </span>
                  )}
                </div>
                <button
                  onClick={openWizard}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-[0.05em] text-white border-none cursor-pointer transition-opacity hover:opacity-90"
                  style={{ fontFamily: SANS, background: ORANGE }}
                >
                  <Plus className="w-3 h-3" />
                  Nueva sección
                </button>
              </div>

              {/* Sections list */}
              <div className="p-3">
                {cms.loading ? (
                  <div className="py-8 text-center">
                    <span className="material-symbols-outlined text-[28px] block mb-2 text-[#ec6d13]/30">hourglass_empty</span>
                    <p className="text-[12px] text-[#54433e]/40" style={{ fontFamily: SANS }}>Cargando secciones…</p>
                  </div>
                ) : ordered.length === 0 ? (
                  <div className="py-8 text-center">
                    <span className="material-symbols-outlined text-[36px] block mb-3 text-[#ec6d13]/25">article</span>
                    <p className="text-[14px] font-bold text-[#151b2d] mb-1" style={{ fontFamily: SERIF }}>Sin secciones</p>
                    <p className="text-[11px] text-[#54433e]/40" style={{ fontFamily: SANS }}>Crea la primera con "Nueva sección".</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ordered.map((section, idx) => (
                      <CmsSectionCard
                        key={section.id}
                        section={section}
                        isFirst={idx === 0}
                        isLast={idx === ordered.length - 1}
                        saving={cms.saving}
                        onMoveUp={() => move(section.id, -1)}
                        onMoveDown={() => move(section.id, 1)}
                        onTogglePublish={() => cms.updateSection(section.id, { published: !section.published })}
                        onSavePayload={payload => cms.updateSection(section.id, { payload })}
                        onDelete={async () => { const ok = await cms.deleteSection(section.id); if (ok) loadAllStats(); }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Wizard ─────────────────────────────────────────────────────────── */}
      {wizardOpen && (
        <WizardDialog
          step={wizardStep}
          type={wizardType}
          draft={wizardDraft}
          publish={wizardPublish}
          saving={cms.saving}
          selectedPage={selectedPage}
          onClose={() => setWizardOpen(false)}
          onStepChange={setWizardStep}
          onTypeChange={t => { setWizardType(t); setWizardDraft(emptyPayloadFor(t)); }}
          onPublishChange={setWizardPublish}
          setField={wizardSetField}
          setNested={wizardSetNested}
          setDraft={setWizardDraft}
          onCreate={handleWizardCreate}
        />
      )}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center gap-1.5">
        <span className="w-[7px] h-[7px] rounded-full shrink-0 inline-block" style={{ background: color }} />
        <span style={{ ...lc(0.45), fontSize: 10 }}>{label}</span>
      </span>
      <div className="flex-1 h-px" style={{ background: `${color}1a` }} />
    </div>
  );
}

// ─── Quick access card ────────────────────────────────────────────────────────
function QuickCard({ icon, label, description, onClick }: {
  icon: string; label: string; description: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 bg-white/[0.82] backdrop-blur-xl border border-[#ec6d13]/[0.12] shadow-sm cursor-pointer"
    >
      <div className="w-10 h-10 rounded-[14px] shrink-0 flex items-center justify-center bg-[#ec6d13]/[0.08]">
        <span className="material-symbols-outlined text-[20px]" style={{ color: ORANGE }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[#151b2d]" style={{ fontFamily: SANS }}>{label}</p>
        <p className="text-[11px] text-[#54433e]/50 leading-snug" style={{ fontFamily: SANS }}>{description}</p>
      </div>
      <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 w-3.5 h-3.5" style={{ color: ORANGE }} />
    </button>
  );
}

// ─── Collapsible section card ─────────────────────────────────────────────────
interface CmsSectionCardProps {
  section: CmsSection;
  isFirst: boolean;
  isLast: boolean;
  saving: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePublish: () => void;
  onSavePayload: (payload: Record<string, any>) => Promise<unknown>;
  onDelete: () => void;
}

function CmsSectionCard({ section, isFirst, isLast, saving, onMoveUp, onMoveDown, onTogglePublish, onSavePayload, onDelete }: CmsSectionCardProps) {
  const [draft, setDraft] = useState<Record<string, any>>(section.payload);
  const [dirty, setDirty] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { setDraft(section.payload); setDirty(false); }, [section.id, section.updatedAt, section.payload]);

  const setField = (key: string, value: any) => { setDraft(p => ({ ...p, [key]: value })); setDirty(true); };
  const setNested = (path: (string | number)[], value: any) => {
    setDraft(p => {
      const next = structuredClone(p);
      let cur: any = next;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
      cur[path[path.length - 1]] = value;
      return next;
    });
    setDirty(true);
  };

  const meta = SECTION_TYPE_META[section.type];

  return (
    <div className="rounded-2xl overflow-hidden bg-white/70 border border-[#ec6d13]/[0.10]">
      {/* Row header */}
      <div
        className={`flex items-center gap-3 cursor-pointer select-none px-4 py-3 ${expanded ? 'border-b border-[#ec6d13]/[0.08]' : ''}`}
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-[10px] font-extrabold tracking-[0.1em] text-[#54433e]/30 w-[18px] shrink-0" style={{ fontFamily: SANS }}>
          #{section.position + 1}
        </span>

        {/* Type chip */}
        <div className="flex items-center gap-1 shrink-0 rounded-[6px] px-2 py-0.5 bg-[#ec6d13]/[0.07] border border-[#ec6d13]/[0.18]">
          {meta && <span className="material-symbols-outlined text-[11px]" style={{ color: ORANGE_MID }}>{meta.icon}</span>}
          <span className="text-[9px] font-extrabold tracking-[0.12em] uppercase" style={{ fontFamily: SANS, color: ORANGE_MID }}>
            {meta?.label ?? section.type}
          </span>
        </div>

        <span className="text-[12px] font-semibold text-[#151b2d] flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ fontFamily: SANS }}>
          {summaryFor(section)}
        </span>

        {dirty && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ORANGE }} title="Sin guardar" />}

        <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
          <StatusPill published={section.published} />
          <Icn onClick={onMoveUp}   disabled={isFirst || saving} title="Subir"><ArrowUp   className="w-3 h-3" /></Icn>
          <Icn onClick={onMoveDown} disabled={isLast  || saving} title="Bajar"><ArrowDown className="w-3 h-3" /></Icn>
          <Icn onClick={onTogglePublish} title={section.published ? 'Despublicar' : 'Publicar'}>
            {section.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Icn>
          <Icn onClick={onDelete} danger title="Eliminar"><Trash2 className="w-3 h-3" /></Icn>
          <Icn onClick={() => setExpanded(e => !e)} title={expanded ? 'Contraer' : 'Expandir'}>
            <ChevronDown className="w-3 h-3 transition-transform duration-150" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />
          </Icn>
        </div>
      </div>

      {/* Expanded: split-pane form + preview */}
      {expanded && (
        <div className="flex flex-col md:flex-row">
          {/* Form */}
          <div className="flex-[55] min-w-0 p-5 space-y-4 bg-white/50">
            {meta && (
              <div className="flex items-center gap-2 pb-3 border-b border-[#ec6d13]/[0.08]">
                <span className="material-symbols-outlined text-[16px]" style={{ color: ORANGE }}>{meta.icon}</span>
                <div>
                  <p className="text-[12px] font-bold" style={{ color: ORANGE_MID, fontFamily: SANS }}>{meta.label}</p>
                  <p className="text-[10px] text-[#54433e]/50" style={{ fontFamily: SANS }}>{meta.description}</p>
                </div>
              </div>
            )}
            {renderSectionForm(section.type, draft, setField, setNested, setDraft)}
            <div className="flex items-center justify-between pt-3 border-t border-[#ec6d13]/[0.08]">
              <div className="flex items-center gap-2">
                <Switch checked={section.published} onCheckedChange={onTogglePublish} id={`pub-${section.id}`} />
                <label htmlFor={`pub-${section.id}`} className="text-[11px] font-semibold text-[#54433e]/60 cursor-pointer" style={{ fontFamily: SANS }}>
                  Publicada
                </label>
              </div>
              <button
                disabled={!dirty || saving}
                onClick={async () => { await onSavePayload(draft); setDirty(false); }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold border-none transition-all duration-150"
                style={{
                  fontFamily: SANS,
                  background: dirty ? ORANGE : 'rgba(84,67,62,0.06)',
                  color: dirty ? 'white' : 'rgba(84,67,62,0.35)',
                  cursor: dirty ? 'pointer' : 'not-allowed',
                }}
              >
                <Save className="w-3 h-3" /> Guardar
              </button>
            </div>
          </div>

          {/* Preview panel */}
          <div className="flex-[45] min-w-0 p-5 border-t md:border-t-0 md:border-l border-[#ec6d13]/[0.08] bg-[#fdfaf6]/60">
            <SectionPreview type={section.type} draft={draft} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className="text-[9px] font-extrabold tracking-[0.1em] uppercase px-2 py-0.5 rounded-[6px] mr-1"
      style={{
        fontFamily: SANS,
        background: published ? 'rgba(21,128,61,0.08)' : 'rgba(84,67,62,0.05)',
        color: published ? '#15803d' : 'rgba(84,67,62,0.4)',
        border: `1px solid ${published ? 'rgba(21,128,61,0.2)' : 'rgba(84,67,62,0.1)'}`,
      }}
    >
      {published ? 'Publicada' : 'Borrador'}
    </span>
  );
}

function Icn({ onClick, disabled, title, danger, children }: {
  onClick: () => void; disabled?: boolean; title?: string; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] border-none bg-transparent"
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'rgba(84,67,62,0.15)' : danger ? '#dc2626' : 'rgba(84,67,62,0.45)',
      }}
    >
      {children}
    </button>
  );
}

function summaryFor(s: CmsSection) {
  const p = s.payload ?? {};
  return p.title || p.kicker || p.body?.slice?.(0, 50) || `Sección ${s.id.slice(0, 6)}`;
}

// ─── Wizard dialog ────────────────────────────────────────────────────────────
interface WizardProps {
  step: 1 | 2 | 3;
  type: CmsSectionType;
  draft: Record<string, any>;
  publish: boolean;
  saving: boolean;
  selectedPage: string | null;
  onClose: () => void;
  onStepChange: (s: 1 | 2 | 3) => void;
  onTypeChange: (t: CmsSectionType) => void;
  onPublishChange: (v: boolean) => void;
  setField: (k: string, v: any) => void;
  setNested: (path: (string | number)[], v: any) => void;
  setDraft: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onCreate: () => Promise<void>;
}

const STEP_LABELS = ['Tipo', 'Contenido', 'Publicar'];

function WizardDialog({ step, type, draft, publish, saving, selectedPage, onClose, onStepChange, onTypeChange, onPublishChange, setField, setNested, setDraft, onCreate }: WizardProps) {
  const meta = SECTION_TYPE_META[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#151b2d]/45 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full flex flex-col overflow-hidden"
        style={{
          background: '#fdfaf6',
          borderRadius: 28,
          maxWidth: step === 2 ? 900 : 640,
          maxHeight: '88vh',
          boxShadow: '0 24px 80px rgba(21,27,45,0.2)',
          transition: 'max-width 0.2s ease',
        }}
      >
        {/* Wizard header */}
        <div className="px-7 pt-6 pb-0 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[18px] font-bold text-[#151b2d]" style={{ fontFamily: SERIF }}>Nueva sección</p>
              {selectedPage && (
                <p className="text-[11px] text-[#54433e]/50 mt-0.5" style={{ fontFamily: SANS }}>
                  Página: {PAGE_CARDS.find(p => p.key === selectedPage)?.label}
                </p>
              )}
            </div>
            <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-[#54433e]/40 text-xl leading-none">✕</button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-6">
            {STEP_LABELS.map((label, i) => {
              const n = (i + 1) as 1 | 2 | 3;
              const done = step > n;
              const active = step === n;
              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
                      style={{
                        fontFamily: SANS,
                        background: done ? GREEN : active ? ORANGE : 'rgba(84,67,62,0.1)',
                        color: done || active ? 'white' : 'rgba(84,67,62,0.4)',
                      }}
                    >
                      {done ? <Check className="w-3 h-3" /> : n}
                    </div>
                    <span
                      className="text-[11px]"
                      style={{
                        fontFamily: SANS,
                        fontWeight: active ? 700 : 500,
                        color: active ? '#151b2d' : done ? GREEN : 'rgba(84,67,62,0.4)',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className="flex-1 h-px mx-3" style={{ background: done ? 'rgba(21,128,61,0.3)' : 'rgba(84,67,62,0.1)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-7">

          {/* Step 1: Choose type */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2 pb-4">
              {SECTION_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => onTypeChange(t.value)}
                  className="text-left transition-all duration-150 rounded-[14px] p-3 cursor-pointer"
                  style={{
                    background: type === t.value ? 'rgba(236,109,19,0.08)' : 'rgba(255,255,255,0.7)',
                    border: type === t.value ? `1.5px solid ${ORANGE}` : '1px solid rgba(84,67,62,0.1)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[16px]" style={{ color: type === t.value ? ORANGE : 'rgba(84,67,62,0.4)' }}>
                      {t.icon}
                    </span>
                    <span className="text-[12px] font-bold" style={{ fontFamily: SANS, color: type === t.value ? ORANGE_MID : '#151b2d' }}>
                      {t.label}
                    </span>
                  </div>
                  <p className="text-[10px] leading-snug text-[#54433e]/50" style={{ fontFamily: SANS }}>{t.description}</p>
                  {/* Layout thumb */}
                  <LayoutThumb type={t.value} active={type === t.value} />
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Fill form + live preview */}
          {step === 2 && (
            <div className="flex gap-6 pb-4">
              {/* Form */}
              <div className="flex-[55] min-w-0 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: ORANGE }}>{meta?.icon}</span>
                  <span className="text-[12px] font-bold" style={{ fontFamily: SANS, color: ORANGE_MID }}>{meta?.label}</span>
                  <span className="text-[11px] text-[#54433e]/45" style={{ fontFamily: SANS }}>— {meta?.description}</span>
                </div>
                {renderSectionForm(type, draft, setField, setNested, setDraft)}
              </div>
              {/* Preview */}
              <div className="flex-[45] min-w-0 sticky top-0">
                <SectionPreview type={type} draft={draft} />
              </div>
            </div>
          )}

          {/* Step 3: Review + publish */}
          {step === 3 && (
            <div className="space-y-4 pb-4">
              <div className="bg-white/80 border border-[#ec6d13]/[0.12] rounded-2xl p-5">
                <p className="text-[10px] font-extrabold tracking-[0.12em] uppercase mb-3" style={{ fontFamily: SANS, color: ORANGE_MID }}>Resumen</p>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px]" style={{ color: ORANGE }}>{meta?.icon}</span>
                  <div>
                    <p className="text-[14px] font-bold text-[#151b2d]" style={{ fontFamily: SANS }}>{meta?.label}</p>
                    <p className="text-[11px] text-[#54433e]/50" style={{ fontFamily: SANS }}>{meta?.description}</p>
                    {draft.title && <p className="text-[13px] mt-1.5 text-[#151b2d]" style={{ fontFamily: SERIF }}>"{draft.title}"</p>}
                    {!draft.title && draft.kicker && <p className="text-[12px] text-[#54433e]/60 mt-1.5" style={{ fontFamily: SANS }}>Kicker: {draft.kicker}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white/80 border border-[#ec6d13]/[0.12] rounded-2xl p-5">
                <p className="text-[10px] font-extrabold tracking-[0.12em] uppercase mb-3" style={{ fontFamily: SANS, color: ORANGE_MID }}>Publicación</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-[#151b2d]" style={{ fontFamily: SANS }}>
                      {publish ? 'Publicar ahora' : 'Guardar como borrador'}
                    </p>
                    <p className="text-[11px] text-[#54433e]/50 mt-0.5" style={{ fontFamily: SANS }}>
                      {publish ? 'La sección será visible en la página inmediatamente.' : 'Puedes publicarla más adelante desde el editor.'}
                    </p>
                  </div>
                  <Switch checked={publish} onCheckedChange={onPublishChange} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard footer */}
        <div
          className="flex items-center justify-between px-7 py-4 border-t border-[#54433e]/[0.08] shrink-0"
          style={{ background: 'rgba(249,247,242,0.8)' }}
        >
          <button
            onClick={() => step === 1 ? onClose() : onStepChange((step - 1) as 1 | 2 | 3)}
            className="px-5 py-2 rounded-full bg-transparent border border-[#54433e]/[0.15] text-[12px] font-semibold text-[#54433e]/60 cursor-pointer"
            style={{ fontFamily: SANS }}
          >
            {step === 1 ? 'Cancelar' : '← Atrás'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => onStepChange((step + 1) as 2 | 3)}
              className="px-6 py-2 rounded-full border-none text-white text-[12px] font-bold cursor-pointer hover:opacity-90 transition-opacity"
              style={{ fontFamily: SANS, background: ORANGE }}
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={onCreate}
              disabled={saving}
              className="flex items-center gap-1.5 px-6 py-2 rounded-full border-none text-[12px] font-bold"
              style={{
                fontFamily: SANS,
                background: saving ? 'rgba(84,67,62,0.1)' : ORANGE,
                color: saving ? 'rgba(84,67,62,0.3)' : 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? 'Creando…' : 'Crear sección'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Layout thumb for wizard step 1 ──────────────────────────────────────────
function LayoutThumb({ type, active }: { type: CmsSectionType; active: boolean }) {
  const fg = active ? `rgba(236,109,19,0.35)` : 'rgba(84,67,62,0.12)';
  const bg = active ? `rgba(236,109,19,0.06)` : 'rgba(84,67,62,0.04)';
  const accent = active ? `rgba(236,109,19,0.6)` : 'rgba(84,67,62,0.2)';

  // Each thumb is a tiny 56×34 SVG showing the section's layout structure
  const thumbs: Partial<Record<CmsSectionType, React.ReactNode>> = {
    hero: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill={fg} />
        <rect x="6" y="8" width="20" height="3" rx="1" fill={accent} />
        <rect x="6" y="13" width="30" height="5" rx="1.5" fill={bg} opacity="2" style={{ fill: 'white', opacity: 0.5 }} />
        <rect x="6" y="20" width="24" height="2" rx="1" fill={bg} style={{ fill: 'rgba(255,255,255,0.3)' }} />
        <rect x="6" y="26" width="14" height="4" rx="2" fill={accent} />
      </svg>
    ),
    quote: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill={bg} />
        <rect x="20" y="5" width="16" height="6" rx="2" fill={accent} opacity="0.5" />
        <rect x="8" y="14" width="40" height="2.5" rx="1" fill={fg} />
        <rect x="12" y="18" width="32" height="2.5" rx="1" fill={fg} />
        <rect x="18" y="26" width="20" height="2" rx="1" fill={accent} opacity="0.4" />
      </svg>
    ),
    two_column_intro: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill={bg} />
        <rect x="4" y="5" width="22" height="3" rx="1" fill={fg} />
        <rect x="4" y="10" width="48" height="2" rx="1" fill={fg} opacity="0.5" />
        <rect x="4" y="16" width="23" height="13" rx="2" fill={fg} opacity="0.6" />
        <rect x="29" y="16" width="23" height="13" rx="2" fill={fg} opacity="0.6" />
      </svg>
    ),
    technique_grid: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill={bg} />
        <rect x="4" y="4" width="22" height="12" rx="2" fill={fg} />
        <rect x="30" y="4" width="22" height="12" rx="2" fill={fg} />
        <rect x="4" y="19" width="22" height="12" rx="2" fill={fg} />
        <rect x="30" y="19" width="22" height="12" rx="2" fill={fg} />
      </svg>
    ),
    metrics_stat: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill={accent} />
        <rect x="16" y="6" width="24" height="3" rx="1" fill="rgba(255,255,255,0.4)" />
        <rect x="10" y="12" width="36" height="10" rx="2" fill="rgba(255,255,255,0.7)" />
        <rect x="18" y="26" width="20" height="2.5" rx="1" fill="rgba(255,255,255,0.3)" />
      </svg>
    ),
    home_hero_carousel: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill="#151b2d" opacity="0.7" />
        <rect x="4" y="8" width="30" height="4" rx="1.5" fill="rgba(255,255,255,0.7)" />
        <rect x="4" y="14" width="22" height="2.5" rx="1" fill="rgba(255,255,255,0.3)" />
        <rect x="4" y="22" width="12" height="5" rx="2.5" fill={accent} />
        <rect x="18" y="22" width="12" height="5" rx="2.5" fill="rgba(255,255,255,0.15)" />
        <circle cx="47" cy="29" r="2" fill={accent} />
        <circle cx="52" cy="29" r="1.2" fill="rgba(255,255,255,0.2)" />
      </svg>
    ),
    home_block: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill={fg} />
        <rect x="4" y="6" width="14" height="2.5" rx="1" fill={accent} />
        <rect x="4" y="11" width="26" height="4" rx="1.5" fill="rgba(255,255,255,0.6)" />
        <rect x="4" y="17" width="22" height="2" rx="1" fill="rgba(255,255,255,0.3)" />
        <rect x="4" y="26" width="14" height="4" rx="2" fill={accent} />
        <rect x="34" y="4" width="18" height="26" rx="3" fill="rgba(255,255,255,0.15)" />
      </svg>
    ),
    home_value_props: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill={bg} />
        <rect x="3" y="4" width="15" height="20" rx="2" fill={fg} />
        <rect x="21" y="4" width="15" height="20" rx="2" fill={fg} />
        <rect x="39" y="4" width="14" height="20" rx="2" fill={fg} />
        <rect x="3" y="27" width="15" height="2.5" rx="1" fill={accent} opacity="0.5" />
        <rect x="21" y="27" width="15" height="2.5" rx="1" fill={accent} opacity="0.5" />
        <rect x="39" y="27" width="14" height="2.5" rx="1" fill={accent} opacity="0.5" />
      </svg>
    ),
    editorial_footer: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill="#151b2d" opacity="0.75" />
        <rect x="4" y="5" width="20" height="3" rx="1" fill="rgba(255,255,255,0.6)" />
        <rect x="4" y="10" width="48" height="1" rx="0.5" fill="rgba(255,255,255,0.1)" />
        <rect x="4" y="13" width="13" height="2" rx="1" fill="rgba(255,255,255,0.25)" />
        <rect x="21" y="13" width="13" height="2" rx="1" fill="rgba(255,255,255,0.25)" />
        <rect x="38" y="13" width="14" height="2" rx="1" fill="rgba(255,255,255,0.25)" />
        <rect x="4" y="28" width="30" height="1.5" rx="0.5" fill="rgba(255,255,255,0.1)" />
      </svg>
    ),
    content_pick: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill={bg} />
        <rect x="4" y="4" width="28" height="18" rx="2" fill={fg} />
        <rect x="4" y="24" width="14" height="2.5" rx="1" fill={fg} />
        <rect x="4" y="28" width="20" height="2" rx="1" fill={accent} opacity="0.5" />
        <rect x="36" y="4" width="16" height="26" rx="2" fill={accent} opacity="0.2" />
      </svg>
    ),
    embedded_widget: (
      <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
        <rect width="56" height="34" rx="4" fill={bg} stroke={fg} strokeWidth="1" strokeDasharray="3 2" />
        <rect x="22" y="8" width="12" height="12" rx="3" fill={accent} opacity="0.5" />
        <rect x="10" y="24" width="36" height="2.5" rx="1" fill={fg} />
      </svg>
    ),
  };

  const defaultThumb = (
    <svg width="56" height="34" viewBox="0 0 56 34" fill="none">
      <rect width="56" height="34" rx="4" fill={bg} />
      <rect x="4" y="6" width="14" height="2.5" rx="1" fill={accent} opacity="0.6" />
      <rect x="4" y="11" width="32" height="4" rx="1.5" fill={fg} />
      <rect x="4" y="17" width="26" height="2" rx="1" fill={fg} opacity="0.5" />
      <rect x="4" y="27" width="16" height="3" rx="1.5" fill={accent} opacity="0.5" />
    </svg>
  );

  return (
    <div className="mt-2 opacity-80">
      {thumbs[type] ?? defaultThumb}
    </div>
  );
}
