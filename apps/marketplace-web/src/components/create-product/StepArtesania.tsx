import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  MOCK_CRAFTS,
  MOCK_TECHNIQUES,
  MOCK_CARE_TAGS,
  MOCK_CURATORIAL_CATEGORIES,
  MOCK_CERTIFICATION_BADGES,
  type CreateProductV2Data,
  type ArtisanalIdentity,
  type MaterialEntry,
  type CareTagEntry,
  type TaxonomyProposal,
  type CuratorialRequest,
  type PieceType,
  type StyleType,
  type ProcessType,
} from './types';

interface StepArtesaniaProps {
  data: CreateProductV2Data;
  onChange: (updates: Partial<CreateProductV2Data>) => void;
}

const PIECE_TYPES: { value: PieceType; label: string; desc: string }[] = [
  { value: 'funcional', label: 'Funcional', desc: 'Tiene un uso práctico' },
  { value: 'decorativa', label: 'Decorativa', desc: 'Principalmente estética' },
  { value: 'mixta', label: 'Mixta', desc: 'Combina uso y decoración' },
];

const STYLES: { value: StyleType; label: string }[] = [
  { value: 'tradicional', label: 'Tradicional' },
  { value: 'contemporaneo', label: 'Contemporáneo' },
  { value: 'fusion', label: 'Fusión' },
];

const PROCESS_TYPES: { value: ProcessType; label: string; desc: string }[] = [
  { value: 'manual', label: '100% Manual', desc: 'Hecho enteramente a mano' },
  { value: 'mixto', label: 'Mixto', desc: 'Combina técnicas manuales y herramientas' },
  { value: 'asistido', label: 'Asistido', desc: 'Con apoyo de maquinaria artesanal' },
];

export function StepArtesania({ data, onChange }: StepArtesaniaProps) {
  const [newMaterial, setNewMaterial] = useState('');
  const [proposalMode, setProposalMode] = useState<'craft' | 'technique' | null>(null);
  const [proposalName, setProposalName] = useState('');
  const [proposalDesc, setProposalDesc] = useState('');

  const identity = data.artisanalIdentity ?? ({} as Partial<ArtisanalIdentity>);
  const materials = data.materials ?? [];
  const careTags = data.careTags ?? [];
  const proposals = data.taxonomyProposals ?? [];
  const curatorial = data.curatorialRequest ?? { badgeCodes: [] } as CuratorialRequest;

  const updateIdentity = (updates: Partial<ArtisanalIdentity>) => {
    onChange({ artisanalIdentity: { ...identity, ...updates } as ArtisanalIdentity });
  };

  // ── Proposals ─────────────────────────────────────
  const submitProposal = () => {
    if (!proposalMode || !proposalName.trim()) return;
    const newProposal: TaxonomyProposal = {
      type: proposalMode,
      name: proposalName.trim(),
      description: proposalDesc.trim() || undefined,
    };
    onChange({ taxonomyProposals: [...proposals, newProposal] });

    // Also set it as selected
    if (proposalMode === 'craft') {
      updateIdentity({ craft: proposalName.trim() });
    } else {
      updateIdentity({ primaryTechnique: proposalName.trim() });
    }

    setProposalName('');
    setProposalDesc('');
    setProposalMode(null);
  };

  const removeProposal = (idx: number) => {
    onChange({ taxonomyProposals: proposals.filter((_, i) => i !== idx) });
  };

  // ── Materials ─────────────────────────────────────
  const addMaterial = (isProposal = false) => {
    if (!newMaterial.trim()) return;
    const entry: MaterialEntry = {
      name: newMaterial.trim(),
      isPrimary: materials.length === 0,
      isProposal,
    };
    onChange({ materials: [...materials, entry] });
    if (isProposal) {
      onChange({
        materials: [...materials, entry],
        taxonomyProposals: [...proposals, { type: 'material', name: newMaterial.trim() }],
      });
    } else {
      onChange({ materials: [...materials, entry] });
    }
    setNewMaterial('');
  };

  const removeMaterial = (idx: number) => {
    onChange({ materials: materials.filter((_, i) => i !== idx) });
  };

  // ── Care Tags ─────────────────────────────────────
  const toggleCareTag = (tagName: string) => {
    const exists = careTags.some((t) => t.name === tagName);
    if (exists) {
      onChange({ careTags: careTags.filter((t) => t.name !== tagName) });
    } else {
      onChange({ careTags: [...careTags, { name: tagName, isFromCatalog: true }] });
    }
  };

  // ── Curatorial ────────────────────────────────────
  const updateCuratorial = (updates: Partial<CuratorialRequest>) => {
    onChange({ curatorialRequest: { ...curatorial, ...updates } });
  };

  const toggleBadge = (code: string) => {
    const codes = curatorial.badgeCodes;
    const next = codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code];
    updateCuratorial({ badgeCodes: next });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-12">
        <span className="text-primary font-bold uppercase text-[10px] tracking-[0.3em] mb-3 block">
          Paso 2 de 4
        </span>
        <h2 className="text-4xl lg:text-5xl font-serif italic text-charcoal mb-4">
          Identidad Artesanal
        </h2>
        <p className="text-charcoal/50 text-sm italic max-w-md mx-auto">
          El oficio, la técnica y los materiales que dan vida a tu pieza. Esta información
          enriquece el certificado digital.
        </p>
      </div>

      <div className="space-y-12">
        {/* ══════════ Oficio artesanal ══════════ */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Oficio artesanal
          </Label>
          <div className="flex flex-wrap gap-3">
            {MOCK_CRAFTS.map((craft) => (
              <button
                key={craft}
                onClick={() => updateIdentity({ craft })}
                className={`border px-4 py-2 text-[11px] uppercase tracking-[0.1em] font-bold transition-all ${
                  identity.craft === craft
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'border-charcoal/15 text-charcoal/50 hover:border-charcoal/40'
                }`}
              >
                {craft}
              </button>
            ))}
            {/* Propose new craft */}
            <button
              onClick={() => setProposalMode(proposalMode === 'craft' ? null : 'craft')}
              className={`border border-dashed px-4 py-2 text-[11px] uppercase tracking-[0.1em] font-bold transition-all flex items-center gap-1.5 ${
                proposalMode === 'craft'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-charcoal/20 text-charcoal/35 hover:border-primary/50 hover:text-primary/60'
              }`}
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Proponer oficio
            </button>
          </div>

          {/* Proposal form for craft */}
          {proposalMode === 'craft' && (
            <div className="bg-primary/5 border border-primary/15 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">lightbulb</span>
                <div>
                  <p className="text-xs font-bold text-charcoal/70 mb-1">Proponer un nuevo oficio</p>
                  <p className="text-[10px] text-charcoal/40 italic">
                    Tu propuesta será revisada por el equipo curatorial de Telar. Si es aprobada, estará disponible para todos los artesanos.
                  </p>
                </div>
              </div>
              <Input
                value={proposalName}
                onChange={(e) => setProposalName(e.target.value)}
                placeholder="Nombre del oficio"
                className="border-0 border-b border-primary/20 rounded-none px-0 py-2 text-sm italic placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
              />
              <Input
                value={proposalDesc}
                onChange={(e) => setProposalDesc(e.target.value)}
                placeholder="Breve descripción (opcional)"
                className="border-0 border-b border-primary/20 rounded-none px-0 py-2 text-[11px] italic placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
              />
              <button
                onClick={submitProposal}
                disabled={!proposalName.trim()}
                className="bg-primary text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-charcoal transition-all disabled:opacity-30"
              >
                Enviar propuesta
              </button>
            </div>
          )}
        </div>

        {/* ══════════ Técnica ══════════ */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Técnica principal
          </Label>
          <div className="flex flex-wrap gap-3">
            {MOCK_TECHNIQUES.map((tech) => (
              <button
                key={tech}
                onClick={() => updateIdentity({ primaryTechnique: tech })}
                className={`border px-4 py-2 text-[11px] uppercase tracking-[0.1em] font-bold transition-all ${
                  identity.primaryTechnique === tech
                    ? 'bg-primary text-white border-primary'
                    : 'border-charcoal/15 text-charcoal/50 hover:border-charcoal/40'
                }`}
              >
                {tech}
              </button>
            ))}
            {/* Propose new technique */}
            <button
              onClick={() => setProposalMode(proposalMode === 'technique' ? null : 'technique')}
              className={`border border-dashed px-4 py-2 text-[11px] uppercase tracking-[0.1em] font-bold transition-all flex items-center gap-1.5 ${
                proposalMode === 'technique'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-charcoal/20 text-charcoal/35 hover:border-primary/50 hover:text-primary/60'
              }`}
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Proponer técnica
            </button>
          </div>

          {/* Proposal form for technique */}
          {proposalMode === 'technique' && (
            <div className="bg-primary/5 border border-primary/15 p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">lightbulb</span>
                <div>
                  <p className="text-xs font-bold text-charcoal/70 mb-1">Proponer una nueva técnica</p>
                  <p className="text-[10px] text-charcoal/40 italic">
                    Describe la técnica para que el equipo curatorial pueda evaluarla y agregarla al catálogo.
                  </p>
                </div>
              </div>
              <Input
                value={proposalName}
                onChange={(e) => setProposalName(e.target.value)}
                placeholder="Nombre de la técnica"
                className="border-0 border-b border-primary/20 rounded-none px-0 py-2 text-sm italic placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
              />
              <Input
                value={proposalDesc}
                onChange={(e) => setProposalDesc(e.target.value)}
                placeholder="Breve descripción (opcional)"
                className="border-0 border-b border-primary/20 rounded-none px-0 py-2 text-[11px] italic placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
              />
              <button
                onClick={submitProposal}
                disabled={!proposalName.trim()}
                className="bg-primary text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-charcoal transition-all disabled:opacity-30"
              >
                Enviar propuesta
              </button>
            </div>
          )}
        </div>

        {/* Proposals pending badge */}
        {proposals.length > 0 && (
          <div className="bg-amber-50 border border-amber-200/60 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-lg">pending</span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-amber-700">
                Propuestas pendientes de aprobación
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {proposals.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 bg-amber-100/60 border border-amber-200/50 px-3 py-1.5 text-[11px] text-amber-800"
                >
                  <span className="text-[9px] uppercase tracking-wider font-bold text-amber-600">
                    {p.type === 'craft' ? 'Oficio' : p.type === 'technique' ? 'Técnica' : 'Material'}
                  </span>
                  <span className="italic">{p.name}</span>
                  <button onClick={() => removeProposal(idx)} className="text-amber-400 hover:text-amber-700">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ Tipo de pieza ══════════ */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Tipo de pieza
          </Label>
          <div className="grid grid-cols-3 gap-4">
            {PIECE_TYPES.map((pt) => (
              <button
                key={pt.value}
                onClick={() => updateIdentity({ pieceType: pt.value })}
                className={`border p-5 text-left transition-all ${
                  identity.pieceType === pt.value
                    ? 'border-charcoal bg-charcoal/5'
                    : 'border-charcoal/10 hover:border-charcoal/30'
                }`}
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1">
                  {pt.label}
                </span>
                <span className="block text-[10px] text-charcoal/40 italic">{pt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════ Estilo ══════════ */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Estilo
          </Label>
          <div className="flex gap-4">
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => updateIdentity({ style: s.value })}
                className={`border px-6 py-3 text-[11px] uppercase tracking-[0.15em] font-bold transition-all ${
                  identity.style === s.value
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'border-charcoal/15 text-charcoal/50 hover:border-charcoal/40'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════ Proceso ══════════ */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Proceso de elaboración
          </Label>
          <div className="grid grid-cols-3 gap-4">
            {PROCESS_TYPES.map((p) => (
              <button
                key={p.value}
                onClick={() => updateIdentity({ processType: p.value })}
                className={`border p-5 text-left transition-all ${
                  identity.processType === p.value
                    ? 'border-primary bg-primary/5'
                    : 'border-charcoal/10 hover:border-charcoal/30'
                }`}
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-charcoal/80 mb-1">
                  {p.label}
                </span>
                <span className="block text-[10px] text-charcoal/40 italic">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════ Tiempo de elaboración ══════════ */}
        <div className="space-y-3">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Tiempo estimado de elaboración
          </Label>
          <Input
            value={identity.estimatedElaborationTime ?? ''}
            onChange={(e) => updateIdentity({ estimatedElaborationTime: e.target.value })}
            placeholder="Ej: 5 a 8 horas de tejido continuo"
            className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-sm italic placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent"
          />
        </div>

        {/* ══════════ Materiales ══════════ */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Materiales
          </Label>

          {materials.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {materials.map((m, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-2 border px-4 py-2 text-xs ${
                    m.isProposal
                      ? 'border-amber-200 bg-amber-50/50 text-amber-800'
                      : 'border-charcoal/15 text-charcoal/70'
                  }`}
                >
                  {m.isPrimary && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  {m.isProposal && (
                    <span className="material-symbols-outlined text-[10px] text-amber-500">pending</span>
                  )}
                  {m.name}
                  <button onClick={() => removeMaterial(idx)} className="ml-1 text-charcoal/30 hover:text-charcoal">
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Input
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial(false))}
              placeholder="Escribe un material y presiona Enter"
              className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-sm italic placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent"
            />
            <button
              onClick={() => addMaterial(false)}
              className="border border-charcoal/20 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-charcoal/50 hover:border-charcoal hover:text-charcoal transition-all whitespace-nowrap"
            >
              Agregar
            </button>
            <button
              onClick={() => addMaterial(true)}
              disabled={!newMaterial.trim()}
              className="border border-dashed border-amber-300 px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-amber-600 hover:bg-amber-50 transition-all whitespace-nowrap disabled:opacity-30"
            >
              Proponer nuevo
            </button>
          </div>
          <p className="text-[10px] text-charcoal/30 italic">
            Si tu material no está en el catálogo, usa "Proponer nuevo" para enviarlo a revisión curatorial.
          </p>
        </div>

        {/* ══════════ Care Tags ══════════ */}
        <div className="space-y-4 pt-8 border-t border-charcoal/10">
          <div>
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
              Instrucciones de cuidado
            </Label>
            <p className="text-[10px] text-charcoal/30 italic mt-1">
              Selecciona las recomendaciones de cuidado para tu pieza
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {MOCK_CARE_TAGS.map((tag) => {
              const isSelected = careTags.some((t) => t.name === tag.name);
              return (
                <button
                  key={tag.name}
                  onClick={() => toggleCareTag(tag.name)}
                  className={`flex items-center gap-3 border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-charcoal bg-charcoal/5'
                      : 'border-charcoal/10 hover:border-charcoal/25'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg transition-colors ${
                      isSelected ? 'text-primary' : 'text-charcoal/20'
                    }`}
                  >
                    {tag.icon}
                  </span>
                  <span className={`text-xs ${isSelected ? 'text-charcoal font-bold' : 'text-charcoal/50'}`}>
                    {tag.name}
                  </span>
                  {isSelected && (
                    <span className="material-symbols-outlined text-sm text-primary ml-auto">check</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══════════ Certificación Curatorial ══════════ */}
        <div className="space-y-6 pt-8 border-t border-charcoal/10">
          <div>
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
              Certificaciones y sellos
            </Label>
            <p className="text-[10px] text-charcoal/30 italic mt-1">
              Solicita sellos de certificación para tu pieza. Serán verificados por el equipo curatorial de Telar.
            </p>
          </div>

          {/* Badges */}
          <div className="space-y-3">
            {MOCK_CERTIFICATION_BADGES.map((badge) => {
              const isSelected = curatorial.badgeCodes.includes(badge.code);
              return (
                <button
                  key={badge.code}
                  onClick={() => toggleBadge(badge.code)}
                  className={`w-full flex items-center gap-4 border p-5 text-left transition-all ${
                    isSelected
                      ? 'border-charcoal bg-charcoal text-white'
                      : 'border-charcoal/10 hover:border-charcoal/25'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${
                      isSelected ? 'text-primary' : 'text-charcoal/20'
                    }`}
                  >
                    {badge.icon}
                  </span>
                  <div className="flex-1">
                    <span
                      className={`block text-xs font-bold uppercase tracking-wider mb-0.5 ${
                        isSelected ? 'text-white' : 'text-charcoal/70'
                      }`}
                    >
                      {badge.name}
                    </span>
                    <span
                      className={`block text-[10px] italic ${
                        isSelected ? 'text-white/60' : 'text-charcoal/40'
                      }`}
                    >
                      {badge.description}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="material-symbols-outlined text-primary">verified</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Curatorial category request */}
          <div className="space-y-4">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
              Categoría curatorial
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {MOCK_CURATORIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateCuratorial({ categoryName: cat.name })}
                  className={`border p-5 text-left transition-all ${
                    curatorial.categoryName === cat.name
                      ? 'border-primary bg-primary/5'
                      : 'border-charcoal/10 hover:border-charcoal/25'
                  }`}
                >
                  <span
                    className={`block text-xs font-bold uppercase tracking-wider mb-1 ${
                      curatorial.categoryName === cat.name ? 'text-primary' : 'text-charcoal/70'
                    }`}
                  >
                    {cat.name}
                  </span>
                  <span className="block text-[10px] text-charcoal/40 italic">{cat.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes for curatorial team */}
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
              Notas para el equipo curatorial
            </Label>
            <Textarea
              value={curatorial.notes ?? ''}
              onChange={(e) => updateCuratorial({ notes: e.target.value })}
              placeholder="Información adicional que ayude al equipo curatorial a evaluar tu pieza..."
              rows={3}
              className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-sm italic placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
