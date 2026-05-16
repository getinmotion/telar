import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDown, ArrowUp, ArrowRight, Eye, EyeOff,
  Save, Trash2, Plus, Check, FileText,
} from 'lucide-react';
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
import { MarketplacePreviewShell } from '@/components/cms/preview/MarketplacePreviewShell';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const GREEN = '#15803d';

// ─── Data ────────────────────────────────────────────────────────────────────
const PAGE_TABS = [
  { key: 'home',        label: 'Home',        icon: 'home'         },
  { key: 'tecnicas',    label: 'Técnicas',    icon: 'auto_stories' },
  { key: 'colecciones', label: 'Colecciones', icon: 'collections'  },
];

const SECTION_TYPES = Object.entries(SECTION_TYPE_META).map(([value, meta]) => ({
  value: value as CmsSectionType,
  ...meta,
}));

function emptyPayloadFor(type: CmsSectionType): Record<string, any> {
  switch (type) {
    case 'hero':               return { kicker: '', title: '', subtitle: '', body: '', totalCountLabel: '' };
    case 'quote':              return { kicker: '', body: '', attribution: '' };
    case 'two_column_intro':   return { kicker: '', title: '', body: '', columns: [{ kicker: '', title: '', body: '' }, { kicker: '', title: '', body: '' }] };
    case 'technique_grid':     return { kicker: '', title: '', cards: Array(4).fill({ title: '', body: '', slug: '', imageKey: '' }) };
    case 'featured_aside_card':return { title: '', body: '', ctaLabel: '', ctaHref: '' };
    case 'metrics_stat':       return { kicker: '', value: '', caption: '' };
    case 'muestra_intro':      return { kicker: '', title: '', body: '' };
    case 'archive_label':      return { kicker: '' };
    case 'editorial_footer':   return { kicker: '', title: '', body: '', links: Array(3).fill({ label: '', href: '' }), asideTitle: '', asideBody: '', asideCtaLabel: '', copyright: '', edition: '' };
    case 'home_value_props':   return { cards: Array(3).fill({ title: '', body: '', imageUrl: '' }) };
    case 'home_section_header':return { slot: '', kicker: '', title: '', subtitle: '', ctaLabel: '', ctaHref: '', imageUrl: '', imageAlt: '' };
    case 'home_block':         return { slot: '', kicker: '', title: '', body: '', ctaLabel: '', ctaHref: '', imageUrl: '', variant: 'light' };
    case 'home_hero_carousel': return { description: '', tagline: '', primaryCtaLabel: '', primaryCtaHref: '', secondaryCtaLabel: '', secondaryCtaHref: '', autoplaySeconds: 6, slides: [{ title: '', subtitle: '', imageUrl: '', imageAlt: '', origin: '', quote: '' }] };
    case 'content_pick':       return { slot: '', targetType: 'collection', slug: '', label: '', ctaLabel: '', variant: 'banner', overrideTitle: '', overrideExcerpt: '', overrideImageUrl: '' };
    case 'embedded_widget':    return { widget: 'categories_grid', kicker: '', title: '', subtitle: '', ctaLabel: '', ctaHref: '' };
    default:                   return {};
  }
}

interface PageStat { total: number; published: number; loading: boolean }

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BackofficeCmsPage() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pageStats, setPageStats] = useState<Record<string, PageStat>>(
    Object.fromEntries(PAGE_TABS.map(p => [p.key, { total: 0, published: 0, loading: true }])),
  );
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardType, setWizardType] = useState<CmsSectionType>('hero');
  const [wizardDraft, setWizardDraft] = useState<Record<string, any>>({});
  const [wizardPublish, setWizardPublish] = useState(false);

  const cms = useCmsAdmin();

  const loadAllStats = useCallback(async () => {
    const results = await Promise.allSettled(
      PAGE_TABS.map(p =>
        telarApi.get<{ data: CmsSection[] }>('/cms/sections', {
          params: { pageKey: p.key, includeUnpublished: 'true' },
        }),
      ),
    );
    setPageStats(prev => {
      const next = { ...prev };
      results.forEach((res, i) => {
        const key = PAGE_TABS[i].key;
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
    cms.fetchSections(activePage);
    setSelectedId(null);
  }, [activePage]); // eslint-disable-line react-hooks/exhaustive-deps

  const ordered = useMemo(
    () => [...cms.sections].sort((a, b) => a.position - b.position),
    [cms.sections],
  );

  const selectedSection = useMemo(
    () => ordered.find(s => s.id === selectedId) ?? null,
    [ordered, selectedId],
  );

  const move = async (id: string, dir: -1 | 1) => {
    const idx = ordered.findIndex(s => s.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= ordered.length) return;
    const next = ordered.slice();
    [next[idx], next[swap]] = [next[swap], next[idx]];
    await cms.reorderSections(activePage, next.map(s => s.id));
  };

  const openWizard = () => {
    setWizardStep(1); setWizardType('hero');
    setWizardDraft(emptyPayloadFor('hero'));
    setWizardPublish(false); setWizardOpen(true);
  };

  const handleWizardCreate = async () => {
    const created = await cms.createSection({
      pageKey: activePage, type: wizardType,
      payload: wizardDraft, published: wizardPublish,
    });
    if (created) { setWizardOpen(false); loadAllStats(); setSelectedId(created.id); }
  };

  return (
    <div
      className="font-sans flex flex-col"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9f7f2',
        backgroundImage: `
          radial-gradient(circle at top left,  rgba(236,109,19,0.08) 0%, transparent 40%),
          radial-gradient(circle at bottom right, rgba(253,186,116,0.10) 0%, transparent 44%)
        `,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#f9f7f2]/90 backdrop-blur-2xl border-b border-[#54433e]/[0.08]">
        <div className="flex items-center gap-0 px-6 h-14">
          {/* Branding */}
          <div className="flex items-center gap-2.5 mr-6 shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(236,109,19,0.15) 0%, rgba(156,63,0,0.08) 100%)', border: '1px solid rgba(236,109,19,0.18)' }}
            >
              <span className="material-symbols-outlined text-[15px]" style={{ color: ORANGE }}>auto_stories</span>
            </div>
            <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>CMS</span>
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase ml-1" style={{ color: ORANGE }}>· CONTENIDO</span>
          </div>

          {/* Page tabs */}
          <div className="flex items-stretch h-full gap-1">
            {PAGE_TABS.map(tab => {
              const stat = pageStats[tab.key];
              const active = activePage === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActivePage(tab.key)}
                  className={`flex items-center gap-1.5 px-4 border-b-2 text-[12px] font-semibold transition-colors ${
                    active
                      ? 'border-[#ec6d13] text-[#ec6d13]'
                      : 'border-transparent text-[#54433e]/50 hover:text-[#151b2d]'
                  }`}
                  style={{ fontFamily: SANS }}
                >
                  <span className="material-symbols-outlined text-[14px]">{tab.icon}</span>
                  {tab.label}
                  {!stat.loading && (
                    <span
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ml-0.5"
                      style={{
                        background: active ? 'rgba(236,109,19,0.12)' : 'rgba(84,67,62,0.07)',
                        color: active ? ORANGE : 'rgba(84,67,62,0.45)',
                      }}
                    >
                      {stat.total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Quick links */}
          <div className="flex items-center gap-2">
            <QuickBtn icon="menu_book" label="Historias" onClick={() => navigate('/backoffice/historias')} />
            <QuickBtn icon="collections_bookmark" label="Colecciones" onClick={() => navigate('/backoffice/colecciones')} />
            <button
              onClick={openWizard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-white border-none cursor-pointer hover:opacity-90 transition-opacity"
              style={{ fontFamily: SANS, background: ORANGE }}
            >
              <Plus className="w-3 h-3" /> Nueva sección
            </button>
          </div>
        </div>
      </header>

      {/* ── 3-panel body ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

        {/* Panel 1: Section list (left, fixed 260px) */}
        <aside className="w-[260px] shrink-0 flex flex-col border-r border-[#ec6d13]/[0.08] overflow-y-auto">
          {cms.loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#54433e]/30">
              <span className="material-symbols-outlined text-3xl">hourglass_empty</span>
              <p className="text-[11px]" style={{ fontFamily: SANS }}>Cargando…</p>
            </div>
          ) : ordered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-[#ec6d13]/20">article</span>
              <p className="text-[13px] font-bold text-[#151b2d]" style={{ fontFamily: SERIF }}>Sin secciones</p>
              <p className="text-[11px] text-[#54433e]/40" style={{ fontFamily: SANS }}>Crea la primera con "Nueva sección".</p>
              <button
                onClick={openWizard}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold text-white border-none cursor-pointer"
                style={{ fontFamily: SANS, background: ORANGE }}
              >
                <Plus className="w-3 h-3" /> Nueva sección
              </button>
            </div>
          ) : (
            <>
              {/* Stat bar */}
              <div className="px-4 py-2.5 border-b border-[#ec6d13]/[0.06] flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#151b2d]" style={{ fontFamily: SANS }}>{ordered.length} secciones</span>
                <span className="text-[10px]" style={{ color: GREEN, fontFamily: SANS }}>
                  · {ordered.filter(s => s.published).length} publicadas
                </span>
              </div>

              {/* Section rows */}
              <div className="flex-1 overflow-y-auto py-1.5">
                {ordered.map((section, idx) => {
                  const meta = SECTION_TYPE_META[section.type];
                  const active = selectedId === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setSelectedId(active ? null : section.id)}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 transition-colors ${
                        active
                          ? 'bg-[#ec6d13]/[0.07] border-r-2 border-[#ec6d13]'
                          : 'hover:bg-[#54433e]/[0.04]'
                      }`}
                    >
                      {/* Position */}
                      <span className="text-[9px] font-extrabold text-[#54433e]/25 w-4 shrink-0 text-right" style={{ fontFamily: SANS }}>
                        {idx + 1}
                      </span>

                      {/* Type icon */}
                      <span
                        className="material-symbols-outlined text-[14px] shrink-0"
                        style={{ color: active ? ORANGE : 'rgba(84,67,62,0.35)' }}
                      >
                        {meta?.icon ?? 'article'}
                      </span>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[11px] font-semibold leading-tight truncate"
                          style={{ fontFamily: SANS, color: active ? ORANGE_MID : '#151b2d' }}
                        >
                          {meta?.label ?? section.type}
                        </p>
                        <p className="text-[9px] truncate" style={{ fontFamily: SANS, color: 'rgba(84,67,62,0.45)' }}>
                          {summaryFor(section)}
                        </p>
                      </div>

                      {/* Status dot */}
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: section.published ? GREEN : 'rgba(84,67,62,0.2)' }}
                        title={section.published ? 'Publicada' : 'Borrador'}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Add button at bottom */}
              <div className="p-3 border-t border-[#ec6d13]/[0.06]">
                <button
                  onClick={openWizard}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold border border-dashed transition-colors hover:border-[#ec6d13] hover:text-[#ec6d13]"
                  style={{ fontFamily: SANS, color: 'rgba(84,67,62,0.4)', borderColor: 'rgba(84,67,62,0.2)' }}
                >
                  <Plus className="w-3 h-3" /> Nueva sección
                </button>
              </div>
            </>
          )}
        </aside>

        {/* Panel 2: Form (center, flex-1) */}
        <div className="flex-1 min-w-0 flex flex-col overflow-y-auto border-r border-[#ec6d13]/[0.08]">
          {selectedSection ? (
            <SectionEditPanel
              key={selectedSection.id}
              section={selectedSection}
              saving={cms.saving}
              isFirst={ordered[0]?.id === selectedSection.id}
              isLast={ordered[ordered.length - 1]?.id === selectedSection.id}
              onMoveUp={() => move(selectedSection.id, -1)}
              onMoveDown={() => move(selectedSection.id, 1)}
              onTogglePublish={() => cms.updateSection(selectedSection.id, { published: !selectedSection.published })}
              onSavePayload={payload => cms.updateSection(selectedSection.id, { payload })}
              onDelete={async () => {
                const ok = await cms.deleteSection(selectedSection.id);
                if (ok) { loadAllStats(); setSelectedId(null); }
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <FileText className="w-10 h-10 text-[#ec6d13]/20" />
              <p className="text-[15px] font-bold text-[#151b2d]" style={{ fontFamily: SERIF }}>
                Selecciona una sección
              </p>
              <p className="text-[12px] text-[#54433e]/45 max-w-xs leading-relaxed" style={{ fontFamily: SANS }}>
                Haz clic en cualquier sección de la lista para editar su contenido y ver el preview en vivo.
              </p>
            </div>
          )}
        </div>

        {/* Panel 3: Preview (right, fixed 420px) */}
        <div className="w-[420px] shrink-0 flex flex-col overflow-y-auto p-4" style={{ backgroundColor: '#f5f2ed' }}>
          <PreviewPanel section={selectedSection} />
        </div>
      </div>

      {/* ── Wizard ──────────────────────────────────────────────────────────── */}
      {wizardOpen && (
        <WizardDialog
          step={wizardStep}
          type={wizardType}
          draft={wizardDraft}
          publish={wizardPublish}
          saving={cms.saving}
          activePage={activePage}
          onClose={() => setWizardOpen(false)}
          onStepChange={setWizardStep}
          onTypeChange={t => { setWizardType(t); setWizardDraft(emptyPayloadFor(t)); }}
          onPublishChange={setWizardPublish}
          setField={(k, v) => setWizardDraft(p => ({ ...p, [k]: v }))}
          setNested={(path, v) => setWizardDraft(p => {
            const next = structuredClone(p);
            let cur: any = next;
            for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
            cur[path[path.length - 1]] = v;
            return next;
          })}
          setDraft={setWizardDraft}
          onCreate={handleWizardCreate}
        />
      )}
    </div>
  );
}

// ─── Quick header button ──────────────────────────────────────────────────────
function QuickBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors hover:bg-[#54433e]/[0.06]"
      style={{ fontFamily: SANS, color: 'rgba(84,67,62,0.55)', border: '1px solid rgba(84,67,62,0.12)' }}
    >
      <span className="material-symbols-outlined text-[13px]">{icon}</span>
      {label}
    </button>
  );
}

// ─── Section edit panel (center column) ───────────────────────────────────────
interface EditPanelProps {
  section: CmsSection;
  saving: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePublish: () => void;
  onSavePayload: (payload: Record<string, any>) => Promise<unknown>;
  onDelete: () => void;
}

function SectionEditPanel({ section, saving, isFirst, isLast, onMoveUp, onMoveDown, onTogglePublish, onSavePayload, onDelete }: EditPanelProps) {
  const [draft, setDraft] = useState<Record<string, any>>(section.payload);
  const [dirty, setDirty] = useState(false);

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
    <div className="flex flex-col h-full">
      {/* Form header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#ec6d13]/[0.08] shrink-0 bg-white/40">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(236,109,19,0.08)' }}
        >
          <span className="material-symbols-outlined text-[16px]" style={{ color: ORANGE }}>{meta?.icon ?? 'article'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-[#151b2d] leading-tight" style={{ fontFamily: SANS }}>{meta?.label ?? section.type}</p>
          <p className="text-[10px] text-[#54433e]/45 truncate" style={{ fontFamily: SANS }}>{meta?.description}</p>
        </div>
        {dirty && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ORANGE }} title="Cambios sin guardar" />}

        {/* Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Icn onClick={onMoveUp}   disabled={isFirst || saving} title="Subir"><ArrowUp   className="w-3 h-3" /></Icn>
          <Icn onClick={onMoveDown} disabled={isLast  || saving} title="Bajar"><ArrowDown className="w-3 h-3" /></Icn>
          <Icn onClick={onTogglePublish} title={section.published ? 'Despublicar' : 'Publicar'}>
            {section.published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Icn>
          <Icn onClick={onDelete} danger title="Eliminar"><Trash2 className="w-3 h-3" /></Icn>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {renderSectionForm(section.type, draft, setField, setNested, setDraft)}
      </div>

      {/* Form footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[#ec6d13]/[0.08] shrink-0 bg-white/40">
        <div className="flex items-center gap-2">
          <Switch checked={section.published} onCheckedChange={onTogglePublish} id={`pub-${section.id}`} />
          <label htmlFor={`pub-${section.id}`} className="text-[11px] font-semibold text-[#54433e]/55 cursor-pointer" style={{ fontFamily: SANS }}>
            {section.published ? 'Publicada' : 'Borrador'}
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
  );
}

// ─── Preview panel (right column) ────────────────────────────────────────────
function PreviewPanel({ section }: { section: CmsSection | null }) {
  const [draft, setDraft] = useState<Record<string, any>>(section?.payload ?? {});

  useEffect(() => {
    setDraft(section?.payload ?? {});
  }, [section?.id, section?.updatedAt]);

  if (!section) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <span className="material-symbols-outlined text-4xl text-[#ec6d13]/15">preview</span>
        <p className="text-[12px] font-bold text-[#151b2d]/40" style={{ fontFamily: SERIF }}>Preview</p>
        <p className="text-[10px] text-[#54433e]/35 max-w-[200px] leading-relaxed" style={{ fontFamily: SANS }}>
          Selecciona una sección para ver cómo se ve en el marketplace.
        </p>
      </div>
    );
  }

  return (
    <MarketplacePreviewShell type={section.type} draft={draft} />
  );
}

// ─── Icn button ───────────────────────────────────────────────────────────────
function Icn({ onClick, disabled, title, danger, children }: {
  onClick: () => void; disabled?: boolean; title?: string; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] border-none bg-transparent"
      style={{ cursor: disabled ? 'not-allowed' : 'pointer', color: disabled ? 'rgba(84,67,62,0.15)' : danger ? '#dc2626' : 'rgba(84,67,62,0.45)' }}
    >
      {children}
    </button>
  );
}

function summaryFor(s: CmsSection) {
  const p = s.payload ?? {};
  return p.title || p.kicker || p.body?.slice?.(0, 40) || `—`;
}

// ─── Wizard ───────────────────────────────────────────────────────────────────
interface WizardProps {
  step: 1 | 2 | 3;
  type: CmsSectionType;
  draft: Record<string, any>;
  publish: boolean;
  saving: boolean;
  activePage: string;
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

function WizardDialog({ step, type, draft, publish, saving, activePage, onClose, onStepChange, onTypeChange, onPublishChange, setField, setNested, setDraft, onCreate }: WizardProps) {
  const meta = SECTION_TYPE_META[type];
  const pageTab = PAGE_TABS.find(p => p.key === activePage);

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
          maxWidth: step === 2 ? 960 : 600,
          maxHeight: '90vh',
          boxShadow: '0 24px 80px rgba(21,27,45,0.22)',
          transition: 'max-width 0.2s ease',
        }}
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-0 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[18px] font-bold text-[#151b2d]" style={{ fontFamily: SERIF }}>Nueva sección</p>
              <p className="text-[11px] text-[#54433e]/50 mt-0.5" style={{ fontFamily: SANS }}>
                Página: {pageTab?.label ?? activePage}
              </p>
            </div>
            <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-[#54433e]/35 text-xl leading-none hover:text-[#54433e]/60 transition-colors">✕</button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-6">
            {STEP_LABELS.map((label, i) => {
              const n = (i + 1) as 1 | 2 | 3;
              const done = step > n; const active = step === n;
              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
                      style={{ fontFamily: SANS, background: done ? GREEN : active ? ORANGE : 'rgba(84,67,62,0.1)', color: done || active ? 'white' : 'rgba(84,67,62,0.4)' }}
                    >
                      {done ? <Check className="w-3 h-3" /> : n}
                    </div>
                    <span className="text-[11px]" style={{ fontFamily: SANS, fontWeight: active ? 700 : 500, color: active ? '#151b2d' : done ? GREEN : 'rgba(84,67,62,0.4)' }}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className="flex-1 h-px mx-3" style={{ background: done ? `rgba(21,128,61,0.3)` : 'rgba(84,67,62,0.1)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7">
          {/* Step 1: type selector */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2 pb-4">
              {SECTION_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => onTypeChange(t.value)}
                  className="text-left rounded-[14px] p-3 cursor-pointer transition-all duration-150"
                  style={{
                    background: type === t.value ? 'rgba(236,109,19,0.07)' : 'rgba(255,255,255,0.7)',
                    border: type === t.value ? `1.5px solid ${ORANGE}` : '1px solid rgba(84,67,62,0.1)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-[15px]" style={{ color: type === t.value ? ORANGE : 'rgba(84,67,62,0.35)' }}>{t.icon}</span>
                    <span className="text-[12px] font-bold" style={{ fontFamily: SANS, color: type === t.value ? ORANGE_MID : '#151b2d' }}>{t.label}</span>
                  </div>
                  <p className="text-[10px] leading-snug text-[#54433e]/45" style={{ fontFamily: SANS }}>{t.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: form + live preview */}
          {step === 2 && (
            <div className="flex gap-6 pb-4 min-h-[400px]">
              <div className="flex-[55] min-w-0 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#ec6d13]/[0.08]">
                  <span className="material-symbols-outlined text-[16px]" style={{ color: ORANGE }}>{meta?.icon}</span>
                  <div>
                    <p className="text-[12px] font-bold" style={{ fontFamily: SANS, color: ORANGE_MID }}>{meta?.label}</p>
                    <p className="text-[10px] text-[#54433e]/45" style={{ fontFamily: SANS }}>{meta?.description}</p>
                  </div>
                </div>
                {renderSectionForm(type, draft, setField, setNested, setDraft)}
              </div>
              <div className="flex-[45] min-w-0">
                <MarketplacePreviewShell type={type} draft={draft} />
              </div>
            </div>
          )}

          {/* Step 3: review + publish */}
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
                    <p className="text-[13px] font-bold text-[#151b2d]" style={{ fontFamily: SANS }}>{publish ? 'Publicar ahora' : 'Guardar como borrador'}</p>
                    <p className="text-[11px] text-[#54433e]/50 mt-0.5" style={{ fontFamily: SANS }}>
                      {publish ? 'Visible en la página inmediatamente.' : 'Puedes publicarla más adelante.'}
                    </p>
                  </div>
                  <Switch checked={publish} onCheckedChange={onPublishChange} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-[#54433e]/[0.08] shrink-0" style={{ background: 'rgba(249,247,242,0.8)' }}>
          <button
            onClick={() => step === 1 ? onClose() : onStepChange((step - 1) as 1 | 2 | 3)}
            className="px-5 py-2 rounded-full bg-transparent border border-[#54433e]/[0.15] text-[12px] font-semibold text-[#54433e]/55 cursor-pointer"
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
              onClick={onCreate} disabled={saving}
              className="flex items-center gap-1.5 px-6 py-2 rounded-full border-none text-[12px] font-bold"
              style={{ fontFamily: SANS, background: saving ? 'rgba(84,67,62,0.1)' : ORANGE, color: saving ? 'rgba(84,67,62,0.3)' : 'white', cursor: saving ? 'not-allowed' : 'pointer' }}
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
