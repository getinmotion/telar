import React, { useEffect, useRef, useState } from 'react';
import type { NewWizardState } from '../hooks/useNewWizardState';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import { getAllMaterials, type Material } from '@/services/materials.actions';

interface Props {
  state: NewWizardState;
  update: (updates: Partial<NewWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  step: number;
  totalSteps: number;
}

const IMAGE_SLOTS = [
  { index: 0, icon: 'add_a_photo', label: 'Foto principal', hint: 'Pieza completa · fondo limpio', required: true },
  { index: 1, icon: 'texture', label: 'Detalle', hint: 'Acercamiento al material' },
  { index: 2, icon: 'view_in_ar', label: 'Lateral', hint: 'Forma y volumen' },
  { index: 3, icon: 'photo_camera', label: 'Otro ángulo', hint: 'Vista adicional del producto' },
  { index: 4, icon: 'place', label: 'Entorno', hint: 'Pieza en su contexto' },
] as const;

const AI_STATES = {
  empty: {
    visual: 'Esperando foto principal para analizar forma, textura, iluminación y fondo.',
    materials: 'Selecciona materiales o agrega una foto de detalle para sugerir coincidencias.',
    next: 'Con el nombre, la descripción y los materiales, TELAR podrá ayudarte a completar identidad, técnica y categoría en el paso 2.',
  },
};

export const Step1NewPiece: React.FC<Props> = ({ state, update, onNext, onSaveDraft, isSavingDraft, step, totalSteps }) => {
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [materialSearch, setMaterialSearch] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recognitionRef = useRef<any>(null);

  const canContinue = state.name.trim().length > 0 && state.shortDescription.trim().length > 0;

  useEffect(() => {
    getAllMaterials()
      .then(setAllMaterials)
      .catch(() => {});
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CO';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join('');
      update({ shortDescription: transcript });
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const toggleMaterial = (materialId: string) => {
    const current = state.materials;
    if (current.includes(materialId)) {
      update({ materials: current.filter(id => id !== materialId) });
    } else {
      update({ materials: [...current, materialId] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const images = [...state.images];
    images[index] = file;
    update({ images });
    e.target.value = '';
  };

  const handleDeleteImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const images = [...state.images];
    images.splice(index, 1, undefined as unknown as File);
    while (images.length > 0 && !images[images.length - 1]) images.pop();
    update({ images });
  };

  const getPreviewUrl = (img: File | string | undefined): string | null => {
    if (!img) return null;
    return typeof img === 'string' ? img : URL.createObjectURL(img);
  };

  const filteredMaterials = materialSearch.trim()
    ? allMaterials.filter(m => m.name.toLowerCase().includes(materialSearch.toLowerCase()))
    : allMaterials;

  const selectedNames = state.materials
    .map(id => allMaterials.find(m => m.id === id)?.name ?? id)
    .filter(Boolean);

  const hasSpeechSupport = typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <div className="min-h-screen flex flex-col pb-24 box-border" style={{ background: 'transparent' }}>
      <WizardHeader
        step={step}
        totalSteps={totalSteps}
        icon="add_photo_alternate"
        title="Nueva pieza"
        subtitle="Captura inicial para que TELAR entienda qué estás creando"
      />

      <main className="w-full flex-1 flex min-h-0 max-w-[1200px] mx-auto">
        <div
          className="p-8 w-full flex min-h-0 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.65)',
            boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)',
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start w-full">
            <div className="lg:col-span-7 flex flex-col gap-8">
              <section className="space-y-6">
                {/* Name input — clear affordance */}
                <div className="space-y-2">
                  <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block">
                    Nombre de la pieza
                  </label>
                  <input
                    type="text"
                    value={state.name}
                    onChange={e => update({ name: e.target.value })}
                    placeholder="Ej. Vasija de barro, bolso tejido, collar en chaquira..."
                    className="w-full rounded-lg px-4 py-3 font-['Noto_Serif'] text-[22px] text-[#151b2d] border border-[#e2d5cf]/40 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/20 cursor-text transition-all hover:border-[#e2d5cf]/70"
                    style={{ background: 'rgba(247,244,239,0.4)' }}
                  />
                </div>

                {/* Description — dictation button INSIDE textarea wrapper */}
                <div className="space-y-2">
                  <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block">
                    Descripción breve
                  </label>
                  <div className="relative">
                    <textarea
                      value={state.shortDescription}
                      onChange={e => update({ shortDescription: e.target.value })}
                      placeholder="Cuéntanos brevemente qué es esta pieza, cómo está hecha o para qué sirve."
                      rows={4}
                      className="w-full border border-[#e2d5cf]/40 p-4 pr-14 text-[14px] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70"
                      style={{ background: 'rgba(247,244,239,0.4)' }}
                    />
                    {hasSpeechSupport && (
                      <button
                        type="button"
                        onClick={toggleRecording}
                        title={isRecording ? 'Detener dictado' : 'Dictar descripción'}
                        className={`absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full transition-all ${
                          isRecording
                            ? 'bg-[#ef4444] text-white shadow-md animate-pulse'
                            : 'bg-[#54433e]/8 text-[#54433e]/50 hover:bg-[#ec6d13]/15 hover:text-[#ec6d13]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isRecording ? 'stop' : 'mic'}
                        </span>
                      </button>
                    )}
                    {isRecording && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                        <span className="text-[10px] text-[#ef4444] font-[700]">Escuchando</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Image gallery */}
              <section className="flex flex-col gap-3">
                <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block">
                  Registro Visual
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <ImageSlot
                      slot={IMAGE_SLOTS[0]}
                      preview={getPreviewUrl(state.images[0])}
                      inputRef={el => { fileInputRefs.current[0] = el; }}
                      onFileChange={e => handleFileChange(e, 0)}
                      onDelete={e => handleDeleteImage(0, e)}
                      height="h-full min-h-[270px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-[45%] shrink-0">
                    {IMAGE_SLOTS.slice(1).map(slot => (
                      <ImageSlot
                        key={slot.index}
                        slot={slot}
                        preview={getPreviewUrl(state.images[slot.index])}
                        inputRef={el => { fileInputRefs.current[slot.index] = el; }}
                        onFileChange={e => handleFileChange(e, slot.index)}
                        onDelete={e => handleDeleteImage(slot.index, e)}
                        height="h-[130px]"
                        small
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Materials */}
              <section
                className="p-5 border border-[#e2d5cf]/20 flex-1 min-h-[140px] rounded-lg"
                style={{ background: '#ffffff', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.02)' }}
              >
                <div className="flex justify-between items-center mb-4">
                  <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60">
                    Materiales de la pieza
                  </label>
                  {state.materials.length > 0 && (
                    <span className="text-[10px] font-[600] text-[#ec6d13]">
                      {state.materials.length} seleccionado{state.materials.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {selectedNames.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedNames.map((name, i) => (
                      <span
                        key={state.materials[i]}
                        className="flex items-center gap-1.5 bg-[#ec6d13]/10 border border-[#ec6d13]/20 text-[#ec6d13] px-3 py-1 rounded-full text-[11px] font-[600]"
                      >
                        {name}
                        <button
                          onClick={() => toggleMaterial(state.materials[i])}
                          className="hover:text-[#ef4444] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {allMaterials.length > 0 && (
                  <input
                    type="text"
                    value={materialSearch}
                    onChange={e => setMaterialSearch(e.target.value)}
                    placeholder="Buscar material..."
                    className="w-full border border-[#e2d5cf]/40 rounded-lg px-4 py-2.5 text-[13px] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/40 focus:ring-2 focus:ring-[#ec6d13]/10 transition-all mb-3 hover:border-[#e2d5cf]/70"
                    style={{ background: 'rgba(247,244,239,0.4)' }}
                  />
                )}

                {allMaterials.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {filteredMaterials
                      .filter(m => !state.materials.includes(m.id))
                      .map(mat => (
                        <button
                          key={mat.id}
                          onClick={() => toggleMaterial(mat.id)}
                          className="bg-[#ec6d13]/5 border border-[#ec6d13]/20 hover:bg-[#ec6d13]/10 px-3 py-1.5 rounded-full text-[11px] font-[500] text-[#ec6d13] flex items-center gap-1 transition-colors"
                        >
                          {mat.name}
                          <span className="material-symbols-outlined text-[12px]">add</span>
                        </button>
                      ))}
                    {filteredMaterials.filter(m => !state.materials.includes(m.id)).length === 0 && materialSearch && (
                      <p className="text-[12px] text-[#54433e]/50 italic">Sin resultados para "{materialSearch}"</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[12px] text-[#54433e]/40 italic">Cargando materiales...</p>
                )}
              </section>
            </div>

            {/* AI observation panel */}
            <div className="lg:col-span-5 h-full">
              <section
                className="h-full text-white flex flex-col relative overflow-hidden border border-white/10 shadow-lg rounded-xl p-5 min-h-[480px]"
                style={{ background: '#151b2d' }}
              >
                <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#ec6d13]">psychology</span>
                    <h3 className="font-['Noto_Serif'] text-[16px] font-[500] text-white">Observación IA</h3>
                  </div>
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13] animate-pulse" />
                    <span className="text-[9px] font-[800] tracking-widest text-white/60 uppercase">
                      Esperando señales...
                    </span>
                  </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col gap-3">
                  {[
                    { label: 'Lectura visual', text: AI_STATES.empty.visual },
                    { label: 'Materiales posibles', text: AI_STATES.empty.materials },
                    { label: 'Próximo paso', text: AI_STATES.empty.next },
                  ].map(({ label, text }) => (
                    <div
                      key={label}
                      className="p-4 backdrop-blur-sm rounded-lg"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1.5">{label}</p>
                      <p className="text-[13px] text-white/80 leading-snug">{text}</p>
                    </div>
                  ))}
                </div>

                <div className="relative z-10 pt-5 border-t border-white/10 shrink-0 mt-auto">
                  <p className="text-center text-[9px] font-[800] uppercase tracking-widest text-white/30 py-2">
                    Tus sugerencias aparecerán cuando agregues una foto, descripción o materiales.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <WizardFooter
        step={step}
        totalSteps={totalSteps}
        onNext={onNext}
        onSaveDraft={onSaveDraft}
        isSavingDraft={isSavingDraft}
        nextDisabled={!canContinue}
        disabledReason={!canContinue ? 'Faltan datos obligatorios.' : undefined}
      />
    </div>
  );
};

// ── ImageSlot ──────────────────────────────────────────────────────────────────

interface ImageSlotProps {
  slot: typeof IMAGE_SLOTS[number];
  preview: string | null;
  inputRef: (el: HTMLInputElement | null) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (e: React.MouseEvent) => void;
  height: string;
  small?: boolean;
}

const ImageSlot: React.FC<ImageSlotProps> = ({
  slot,
  preview,
  inputRef,
  onFileChange,
  onDelete,
  height,
  small,
}) => {
  const inputEl = useRef<HTMLInputElement | null>(null);
  const handleClick = () => inputEl.current?.click();

  return (
    <div
      onClick={handleClick}
      className={`relative flex flex-col items-center justify-center border border-[#e2d5cf]/40 cursor-pointer overflow-hidden rounded-lg ${height} group transition-all hover:border-[#ec6d13]/30 hover:shadow-sm`}
      style={{ background: '#ffffff' }}
    >
      {preview ? (
        <>
          <img src={preview} className="w-full h-full object-cover" alt={slot.label} />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={onDelete}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-[#ef4444] hover:text-white text-[#54433e] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
            <span className="text-white text-[10px] font-[700] uppercase tracking-widest">
              Cambiar foto
            </span>
          </div>
        </>
      ) : (
        <>
          <span className={`material-symbols-outlined ${small ? 'text-2xl' : 'text-4xl'} text-[#54433e]/25 mb-1.5 group-hover:scale-110 group-hover:text-[#ec6d13] transition-all`}>
            {slot.icon}
          </span>
          <span className={`${small ? 'text-[10px]' : 'text-[13px]'} font-[800] uppercase tracking-widest text-[#54433e]/60 mb-0.5 text-center px-2`}>
            {slot.label}
          </span>
          <span className={`${small ? 'text-[10px]' : 'text-[11px]'} text-[#54433e]/35 leading-tight text-center px-3`}>
            {slot.hint}
          </span>
          {('required' in slot && slot.required) && (
            <div className="absolute bottom-3 left-0 w-full flex justify-center">
              <span className="text-[10px] font-[800] uppercase tracking-widest text-[#ef4444]/70">
                Obligatoria
              </span>
            </div>
          )}
        </>
      )}
      <input
        ref={el => {
          inputEl.current = el;
          inputRef(el);
        }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
};
