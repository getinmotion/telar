import React, { useEffect, useState } from 'react';
import type { NewWizardState } from '../hooks/useNewWizardState';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import { getAllCrafts, getTechniquesByCraftId } from '@/services/crafts.actions';
import { getAllMaterials } from '@/services/materials.actions';

interface Props {
  state: NewWizardState;
  update: (updates: Partial<NewWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  step: number;
  totalSteps: number;
  onGoToStep?: (step: number) => void;
}

const softGlass = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(12px)',
  border: '0.5px solid rgba(0,0,0,0.08)',
};

export const Step5DigitalPassport: React.FC<Props> = ({ state, update, onNext, onBack, onSaveDraft, isSavingDraft, step, totalSteps, onGoToStep }) => {
  const [craftName, setCraftName] = useState<string | null>(null);
  const [techniqueName, setTechniqueName] = useState<string | null>(null);
  const [materialNames, setMaterialNames] = useState<string[]>([]);

  useEffect(() => {
    getAllCrafts()
      .then(crafts => {
        const craft = crafts.find(c => c.id === state.craftId);
        setCraftName(craft?.name ?? null);
        if (craft && state.primaryTechniqueId) {
          getTechniquesByCraftId(craft.id)
            .then(techs => setTechniqueName(techs.find(t => t.id === state.primaryTechniqueId)?.name ?? null))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [state.craftId, state.primaryTechniqueId]);

  useEffect(() => {
    if (state.materials.length > 0) {
      getAllMaterials()
        .then(mats => {
          const names = state.materials
            .map(id => mats.find(m => m.id === id)?.name)
            .filter(Boolean) as string[];
          setMaterialNames(names);
        })
        .catch(() => {});
    }
  }, [state.materials]);

  const getPreviewUrl = (img: File | string | undefined): string | null => {
    if (!img) return null;
    return typeof img === 'string' ? img : URL.createObjectURL(img);
  };

  const origin = [state.municipality, state.department, state.country].filter(Boolean).join(', ') || '—';

  const dimensions =
    state.heightCm && state.widthCm
      ? `${state.heightCm}cm x ${state.widthCm}cm`
      : '— × —';

  const technique = craftName ?? (state.craftId ? '…' : '—');
  const subTechnique = techniqueName ?? (state.primaryTechniqueId ? '…' : '—');
  const materialsText = materialNames.length > 0 ? materialNames.join(', ') : (state.materials.length > 0 ? '…' : '—');
  const elaborationText = state.elaborationTime ?? '—';
  const passportId = `TLR-PV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;

  return (
    <div className="min-h-screen pb-32" style={{ background: 'transparent' }}>
      <main
        className="flex flex-col gap-8"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}
      >
        <WizardHeader
          step={step}
          totalSteps={totalSteps}
          onBack={onBack}
          icon="verified"
          title="Pasaporte digital"
          subtitle="Vista previa del pasaporte de trazabilidad"
        />

        <div className="grid grid-cols-12 gap-4">
          {/* Main passport display */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            {/* Identity bar */}
            <div
              className="p-6 flex justify-between items-center rounded-xl"
              style={softGlass}
            >
              <div className="flex items-center gap-4">
                <span
                  className="font-['Manrope'] text-[10px] font-[800] px-3 py-1 rounded-full flex items-center gap-2"
                  style={{ background: 'rgba(22,101,52,0.05)', color: '#166534' }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#166534]" />
                  Pasaporte preparado
                </span>
              </div>
              <div className="text-right">
                <div
                  className="flex flex-col items-end pl-6"
                  style={{ borderLeft: '2px solid rgba(236,109,19,0.3)' }}
                >
                  <span className="font-['Manrope'] text-[#54433e]/60 block mb-1 text-[10px] font-[800] uppercase tracking-[0.2em]">
                    PASSPORT ID / PRODUCT ID
                  </span>
                  <span className="font-mono text-xl font-bold text-[#ec6d13] tracking-widest">
                    {passportId}
                  </span>
                </div>
              </div>
            </div>

            {/* Info cards */}
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: 'location_on',
                  label: 'ORIGEN Y AUTORÍA',
                  title: origin,
                  sub: state.workshopName ?? null,
                  editStep: 1,
                },
                {
                  icon: 'straighten',
                  label: 'DETALLES FÍSICOS',
                  title: dimensions,
                  sub: state.weightKg ? `Peso: ${state.weightKg} kg` : 'Peso no registrado',
                  editStep: 4,
                },
              ].map(({ icon, label, title, sub, editStep }) => (
                <div
                  key={label}
                  className="rounded-xl overflow-hidden"
                  style={softGlass}
                >
                  <div className="p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center border"
                        style={{ background: '#fdfaf6', borderColor: 'rgba(255,255,255,0.65)' }}
                      >
                        <span className="material-symbols-outlined text-[#ec6d13]">{icon}</span>
                      </div>
                      <div className="text-left">
                        <span className="font-['Manrope'] text-[10px] font-[800] text-[#54433e]/50 block uppercase tracking-widest">
                          {label}
                        </span>
                        <h3 className="font-['Noto_Serif'] text-2xl font-bold">{title}</h3>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#151b2d]/30">expand_more</span>
                  </div>
                  <div className="px-6 pb-6 flex justify-between items-end">
                    {sub !== null ? (
                      <p className="font-['Manrope'] text-[14px] font-[500] text-[#54433e]/80 italic">{sub}</p>
                    ) : (
                      <p className="font-['Manrope'] text-[12px] font-[500] text-[#54433e]/40 italic flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] shrink-0">info</span>
                        Completa el perfil artesanal y esta información aparecerá aquí automáticamente.
                      </p>
                    )}
                    <button
                      onClick={() => onGoToStep?.(editStep)}
                      className="font-['Manrope'] text-[11px] font-[800] text-[#ec6d13] cursor-pointer uppercase hover:underline"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Process narrative */}
            <div
              className="p-10 relative rounded-xl"
              style={softGlass}
            >
              <div className="flex justify-between items-start mb-10">
                <div className="flex flex-col gap-1">
                  <span className="font-['Manrope'] text-[10px] font-[800] text-[#54433e]/70 tracking-[0.15em] uppercase">
                    DOCUMENTO DE ORIGEN
                  </span>
                  <h3 className="font-['Noto_Serif'] text-2xl font-bold text-[#151b2d]">
                    Resumen del proceso
                  </h3>
                </div>
                <button
                  onClick={() => onGoToStep?.(1)}
                  className="font-['Manrope'] text-[11px] font-[800] text-[#ec6d13] uppercase hover:underline opacity-60"
                >
                  Editar
                </button>
              </div>

              <p
                className="font-['Noto_Serif'] text-4xl italic leading-[1.4] mb-12 text-[#151b2d] font-normal"
              >
                "{state.artisanalHistory
                  ? state.artisanalHistory.slice(0, 280) + (state.artisanalHistory.length > 280 ? '...' : '')
                  : 'La historia y el proceso de elaboración de esta pieza aparecerán aquí una vez que los completes en los pasos anteriores.'
                }"
              </p>

              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4"
                style={{ borderTop: '1px solid rgba(21,27,45,0.05)' }}
              >
                {[
                  { icon: 'eco', label: 'MATERIALES', value: materialsText },
                  { icon: 'foundation', label: 'TÉCNICA', value: technique },
                  { icon: 'draw', label: 'SUBTÉCNICA', value: subTechnique },
                  { icon: 'schedule', label: 'TIEMPO ESTIMADO', value: elaborationText },
                ].map(({ icon, label, value }) => (
                  <div key={label}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-[#ec6d13] text-lg">{icon}</span>
                      <span className="font-['Manrope'] text-[10px] font-[800] text-[#54433e]/50 uppercase tracking-widest">
                        {label}
                      </span>
                    </div>
                    <p className="font-['Manrope'] text-[14px] font-bold">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Media */}
            <div className="p-6 rounded-xl" style={softGlass}>
              <div className="flex justify-between items-center mb-8">
                <span className="font-['Manrope'] text-[10px] font-[800] text-[#54433e]/70 tracking-[0.15em] uppercase">
                  EVIDENCIA DE TRAZABILIDAD
                </span>
                <button
                  onClick={() => onGoToStep?.(3)}
                  className="font-['Manrope'] text-[11px] font-[800] text-[#ec6d13] uppercase hover:underline opacity-60"
                >
                  Gestionar Archivos
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {state.images.slice(0, 3).map((img, i) => {
                  const url = getPreviewUrl(img);
                  return url ? (
                    <div
                      key={i}
                      className="aspect-[4/5] rounded-lg overflow-hidden shadow-sm grayscale hover:grayscale-0 transition-all duration-500"
                    >
                      <img src={url} className="w-full h-full object-cover" alt={`Evidencia ${i + 1}`} />
                    </div>
                  ) : null;
                })}
                <div
                  className="aspect-[4/5] rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer"
                  style={{
                    border: '0.5px dashed rgba(21,27,45,0.2)',
                    background: 'rgba(21,27,45,0.02)',
                    color: 'rgba(21,27,45,0.4)',
                  }}
                >
                  <span className="material-symbols-outlined text-[24px] font-light">add</span>
                  <span className="font-['Manrope'] text-[10px] font-[800] mt-2 uppercase tracking-widest">
                    AÑADIR
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            {/* Info notice */}
            <div
              className="p-6 rounded-xl"
              style={{ ...softGlass, borderLeft: '4px solid #ec6d13' }}
            >
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-[#ec6d13]">info</span>
                <p className="font-['Manrope'] text-[14px] font-[500] text-[#54433e]">
                  El pasaporte digital no se emite todavía. Se activará automáticamente cuando la pieza sea aprobada para marketplace.
                </p>
              </div>
            </div>

            {/* Validation seal */}
            <div
              className="aspect-[3/4] p-4 flex flex-col items-center justify-center text-center rounded-xl"
              style={softGlass}
            >
              <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px dashed rgba(236,109,19,0.2)' }}
                />
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center border border-[#ec6d13]/10 shadow-xl backdrop-blur-md"
                  style={{ background: 'rgba(255,255,255,0.4)' }}
                >
                  <span
                    className="material-symbols-outlined text-[#ec6d13] text-[72px]"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 100" }}
                  >
                    verified
                  </span>
                </div>
              </div>
              <h4 className="font-['Noto_Serif'] text-3xl mb-4 tracking-tight">
                Sello de Validación
              </h4>
              <p className="font-['Manrope'] text-[#54433e] leading-relaxed px-6 mb-12 italic text-base">
                Este documento consolida la herencia cultural declarada, documentada y validada dentro del flujo interno de TELAR.
              </p>
              <div className="w-full flex flex-col gap-4">
                <div className="h-[2px] w-full relative overflow-hidden" style={{ background: 'rgba(21,27,45,0.05)' }}>
                  <div className="h-full bg-[#ec6d13] w-1/3 absolute left-0" />
                </div>
                <span className="font-['Manrope'] text-[10px] tracking-[0.4em] uppercase text-[#ec6d13] font-[800]">
                  ESTADO: CURADURÍA EN PROCESO
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        onSaveDraft={onSaveDraft}
        isSavingDraft={isSavingDraft}
        nextLabel="Continuar a revisión final"
        leftOffset={80}
      />
    </div>
  );
};
