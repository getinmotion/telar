import React, { useRef, useState } from 'react';
import type { NewWizardState } from '../hooks/useNewWizardState';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import {
  getStoriesByArtisan,
  createStory,
  type Story,
} from '@/services/story-library.actions';

interface Props {
  state: NewWizardState;
  update: (updates: Partial<NewWizardState>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  step: number;
  totalSteps: number;
  artisanId?: string;
  userId?: string;
}

const IMAGE_SLOTS = [
  { index: 0, icon: 'add_a_photo', label: 'Foto principal', hint: 'Pieza completa · fondo limpio', required: true },
  { index: 1, icon: 'texture', label: 'Detalle', hint: 'Acercamiento al material' },
  { index: 2, icon: 'view_in_ar', label: 'Lateral', hint: 'Forma y volumen' },
  { index: 3, icon: 'photo_camera', label: 'Otro ángulo', hint: 'Vista adicional del producto' },
  { index: 4, icon: 'place', label: 'Entorno', hint: 'Pieza en su contexto' },
] as const;

const hasSpeechSupport = typeof window !== 'undefined' &&
  ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export const Step1NewPiece: React.FC<Props> = ({ state, update, onNext, onBack, onSaveDraft, isSavingDraft, step, totalSteps, artisanId = '', userId = '' }) => {
  const [isRecordingDesc, setIsRecordingDesc] = useState(false);
  const [isRecordingHistory, setIsRecordingHistory] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const descRecognitionRef = useRef<any>(null);
  const historyRecognitionRef = useRef<any>(null);

  // Story library state
  const [stories, setStories] = useState<Story[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSavingStory, setIsSavingStory] = useState(false);

  const canContinue = state.name.trim().length > 0 && state.shortDescription.trim().length > 0;

  const loadStories = () => {
    if (!artisanId || loadingStories) return;
    setLoadingStories(true);
    getStoriesByArtisan(artisanId)
      .then(setStories)
      .catch(() => {})
      .finally(() => setLoadingStories(false));
  };

  const handleOpenPicker = () => {
    setShowPicker(v => !v);
    if (!showPicker && stories.length === 0) loadStories();
  };

  const handleSelectStory = (story: Story) => {
    update({ artisanalHistory: story.content });
    setShowPicker(false);
  };

  const handleSaveStory = async () => {
    const content = (state.artisanalHistory ?? '').trim();
    if (!content || !saveTitle.trim() || !artisanId) return;
    setIsSavingStory(true);
    try {
      const saved = await createStory({
        artisanId,
        title: saveTitle.trim(),
        type: 'origin_story',
        content,
        isPublic: false,
      });
      setStories(prev => [saved, ...prev]);
      setSaveTitle('');
      setShowSaveDialog(false);
    } catch {
      // toast de error por interceptor
    } finally {
      setIsSavingStory(false);
    }
  };

  const makeToggleRecording = (
    field: 'shortDescription' | 'artisanalHistory',
    isRecording: boolean,
    setIsRecording: (v: boolean) => void,
    recognitionRef: React.MutableRefObject<any>,
  ) => () => {
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
      update({ [field]: transcript });
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const toggleRecordingDesc = makeToggleRecording(
    'shortDescription', isRecordingDesc, setIsRecordingDesc, descRecognitionRef,
  );
  const toggleRecordingHistory = makeToggleRecording(
    'artisanalHistory', isRecordingHistory, setIsRecordingHistory, historyRecognitionRef,
  );

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

  const cardStyle = {
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.65)',
  } as const;

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <main className="w-full max-w-[1200px] mx-auto pt-10 pb-32 px-6 md:px-10">
        <WizardHeader
          step={step}
          totalSteps={totalSteps}
          onBack={onBack}
          icon="add_photo_alternate"
          title="Nueva pieza"
          subtitle="Captura inicial para que TELAR entienda qué estás creando"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── AI sidebar ────────────────────────────────────────────────── */}
          <aside className="lg:col-span-3">
            <div
              className="p-5 sticky top-8 flex flex-col gap-4 rounded-2xl"
              style={{ background: '#151b2d' }}
            >
              <div className="flex flex-col gap-1 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ec6d13] text-[16px]">psychology</span>
                  <h2 className="font-['Manrope'] text-[10px] font-[800] text-white tracking-widest uppercase">
                    Observación IA
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13] animate-pulse shrink-0" />
                  <span className="text-[9px] font-[800] tracking-widest text-white/50 uppercase">
                    Esperando señales...
                  </span>
                </div>
              </div>

              {[
                { label: 'Lectura visual', text: 'Esperando foto principal para analizar forma, textura, iluminación y fondo.' },
                { label: 'Historia detectada', text: 'Agrega una historia o dictá tu proceso para que TELAR entienda el valor cultural de tu pieza.' },
                { label: 'Próximo paso', text: 'Con el nombre, la descripción y la historia, TELAR podrá ayudarte a completar identidad, técnica y categoría en el paso 2.' },
              ].map(({ label, text }) => (
                <div
                  key={label}
                  className="p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1.5">{label}</p>
                  <p className="text-[12px] text-white/75 leading-snug">{text}</p>
                </div>
              ))}

              <p className="text-center text-[9px] font-[800] uppercase tracking-widest text-white/25 pt-2 border-t border-white/10">
                Las sugerencias aparecen al agregar foto, descripción o historia.
              </p>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────────── */}
          <section className="lg:col-span-9 space-y-4">

            {/* Name */}
            <div className="p-5 rounded-2xl" style={cardStyle}>
              <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2">
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

            {/* Image gallery */}
            <div className="p-5 rounded-2xl" style={cardStyle}>
              <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-3">
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
            </div>

            {/* Description */}
            <div className="p-5 rounded-2xl" style={cardStyle}>
              <div className="flex items-baseline justify-between mb-2">
                <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block">
                  Descripción breve
                </label>
                <span className="text-[11px] text-[#54433e]/40">Lo que verá el comprador en la tienda</span>
              </div>
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
                    onClick={toggleRecordingDesc}
                    title={isRecordingDesc ? 'Detener dictado' : 'Dictar descripción'}
                    className={`absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full transition-all ${
                      isRecordingDesc
                        ? 'bg-[#ef4444] text-white shadow-md animate-pulse'
                        : 'bg-[#54433e]/8 text-[#54433e]/50 hover:bg-[#ec6d13]/15 hover:text-[#ec6d13]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isRecordingDesc ? 'stop' : 'mic'}
                    </span>
                  </button>
                )}
                {isRecordingDesc && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                    <span className="text-[10px] text-[#ef4444] font-[700]">Escuchando</span>
                  </div>
                )}
              </div>
            </div>

            {/* Historia y contexto */}
            <div className="p-5 rounded-2xl" style={cardStyle}>
              <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-1">
                Historia y contexto
                <span className="ml-2 text-[#54433e]/30 normal-case font-[500] tracking-normal">— Opcional</span>
              </label>
              <p className="text-[11px] text-[#54433e]/40 leading-snug mb-3">
                No es la descripción del producto — es el origen. ¿De quién aprendiste? ¿Qué representa esta pieza para tu comunidad? Esta historia aparece en el pasaporte digital de la obra.
              </p>
              <div className="relative">
                <textarea
                  value={state.artisanalHistory ?? ''}
                  onChange={e => update({ artisanalHistory: e.target.value })}
                  placeholder="¿Qué historia guarda esta pieza? ¿Cómo llegó esta técnica a tus manos? ¿Qué representa para tu comunidad o para ti?"
                  rows={4}
                  className="w-full border border-[#e2d5cf]/30 p-4 pr-14 text-[13px] text-[#151b2d] font-[500] resize-none focus:outline-none focus:ring-1 focus:ring-[#ec6d13]/30 focus:border-[#ec6d13]/20 rounded-lg transition-colors hover:border-[#e2d5cf]/60"
                  style={{ background: 'rgba(247,244,239,0.5)' }}
                />
                {hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={toggleRecordingHistory}
                    title={isRecordingHistory ? 'Detener dictado' : 'Dictar historia'}
                    className={`absolute bottom-3 right-3 flex items-center justify-center w-9 h-9 rounded-full transition-all ${
                      isRecordingHistory
                        ? 'bg-[#ef4444] text-white shadow-md animate-pulse'
                        : 'bg-[#54433e]/8 text-[#54433e]/50 hover:bg-[#ec6d13]/15 hover:text-[#ec6d13]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isRecordingHistory ? 'stop' : 'mic'}
                    </span>
                  </button>
                )}
                {isRecordingHistory && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                    <span className="text-[10px] text-[#ef4444] font-[700]">Escuchando</span>
                  </div>
                )}
              </div>

              {/* ── Story library actions ───────────────────────────────── */}
              <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                {/* Cargar historia guardada */}
                <button
                  type="button"
                  onClick={handleOpenPicker}
                  className="flex items-center gap-1.5 text-[11px] font-[700] text-[#54433e]/50 hover:text-[#ec6d13] transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {showPicker ? 'expand_less' : 'menu_book'}
                  </span>
                  {showPicker ? 'Cerrar biblioteca' : 'Usar historia guardada'}
                </button>

                {/* Guardar historia actual */}
                {(state.artisanalHistory ?? '').trim().length > 10 && !showSaveDialog && (
                  <button
                    type="button"
                    onClick={() => { setShowSaveDialog(true); setSaveTitle(state.name ? `Historia: ${state.name}` : ''); }}
                    className="flex items-center gap-1.5 text-[11px] font-[700] text-[#54433e]/50 hover:text-[#ec6d13] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">bookmark_add</span>
                    Guardar para futuros productos
                  </button>
                )}
              </div>

              {/* Save dialog */}
              {showSaveDialog && (
                <div
                  className="mt-3 p-4 rounded-xl space-y-3"
                  style={{ background: 'rgba(236,109,19,0.04)', border: '1px solid rgba(236,109,19,0.15)' }}
                >
                  <p className="text-[10px] font-[800] uppercase tracking-widest text-[#ec6d13]/80">
                    Guardar en tu biblioteca de historias
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={saveTitle}
                      onChange={e => setSaveTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !isSavingStory && handleSaveStory()}
                      placeholder="Dale un nombre a esta historia..."
                      autoFocus
                      className="flex-1 border border-[#ec6d13]/20 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#ec6d13]/50 transition-all"
                    />
                    <button
                      onClick={handleSaveStory}
                      disabled={!saveTitle.trim() || isSavingStory}
                      className="px-4 py-2 rounded-lg bg-[#ec6d13] text-white text-[10px] font-[800] uppercase tracking-widest hover:bg-[#d4600f] disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {isSavingStory && (
                        <span className="material-symbols-outlined text-[13px] animate-spin">progress_activity</span>
                      )}
                      Guardar
                    </button>
                    <button
                      onClick={() => { setShowSaveDialog(false); setSaveTitle(''); }}
                      className="px-3 py-2 rounded-lg border border-[#e2d5cf]/50 text-[#54433e]/50 text-[11px] hover:text-[#54433e] transition-colors shrink-0"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Story picker */}
              {showPicker && (
                <div
                  className="mt-3 rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(226,213,207,0.4)', background: 'rgba(247,244,239,0.6)' }}
                >
                  {loadingStories ? (
                    <div className="flex items-center gap-2 p-4 text-[12px] text-[#54433e]/40">
                      <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                      Cargando historias...
                    </div>
                  ) : stories.length === 0 ? (
                    <div className="p-4 text-center">
                      <span className="material-symbols-outlined text-[28px] text-[#54433e]/20 block mb-1">menu_book</span>
                      <p className="text-[12px] text-[#54433e]/40">
                        Aún no tienes historias guardadas.
                      </p>
                      <p className="text-[11px] text-[#54433e]/30 mt-0.5">
                        Escribe una y usa "Guardar para futuros productos".
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e2d5cf]/30 max-h-[280px] overflow-y-auto">
                      {stories.map(story => (
                        <button
                          key={story.id}
                          type="button"
                          onClick={() => handleSelectStory(story)}
                          className="w-full text-left px-4 py-3 hover:bg-[#ec6d13]/5 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[12px] font-[700] text-[#151b2d] group-hover:text-[#ec6d13] transition-colors truncate">
                                {story.title}
                              </p>
                              <p className="text-[11px] text-[#54433e]/50 mt-0.5 leading-snug line-clamp-2">
                                {story.content}
                              </p>
                            </div>
                            <span className="material-symbols-outlined text-[16px] text-[#54433e]/25 group-hover:text-[#ec6d13] transition-colors shrink-0 mt-0.5">
                              arrow_forward
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </section>
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
        leftOffset={80}
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
