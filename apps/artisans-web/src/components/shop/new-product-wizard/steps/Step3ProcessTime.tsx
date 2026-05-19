import React, { useRef, useState } from 'react';
import type { NewWizardState } from '../hooks/useNewWizardState';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import { AiBadge } from '../components/AiBadge';
import { ToolPicker } from '../components/TaxonomyPicker';
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
}

const DRYING_TIMES = ['N/A', '24-48 horas', '3 a 5 días', '1 semana'];

const TIME_OPTIONS = [
  { value: '1-3 días',  icon: 'filter_3',            label: '1–3 días' },
  { value: '1 semana',  icon: 'date_range',           label: '1 semana' },
  { value: '15 días',   icon: 'calendar_view_week',   label: '15 días' },
  { value: '1 mes',     icon: 'calendar_month',       label: '1 mes' },
  { value: '__custom',  icon: 'edit_calendar',        label: 'Más...' },
] as const;

const PROCESS_SLOTS = [
  { index: 0, icon: 'photo_camera',  label: 'Vista general', hint: 'Proceso completo o pieza en trabajo' },
  { index: 1, icon: 'build',         label: 'Herramientas',  hint: 'Materiales y herramientas en uso' },
  { index: 2, icon: 'layers',        label: 'Fase inicial',  hint: 'Comienzo del proceso' },
  { index: 3, icon: 'autorenew',     label: 'En proceso',    hint: 'Paso intermedio o transformación' },
  { index: 4, icon: 'check_circle',  label: 'Acabado',       hint: 'Detalle o etapa final' },
] as const;

const cardStyle = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
};

const inputClass =
  'w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2.5 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all';

// ── ProcessSlot ────────────────────────────────────────────────────────────────

interface ProcessSlotProps {
  slot: typeof PROCESS_SLOTS[number];
  preview: string | null;
  isVideo: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (e: React.MouseEvent) => void;
  height: string;
  small?: boolean;
}

const ProcessSlot: React.FC<ProcessSlotProps> = ({
  slot,
  preview,
  isVideo,
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
          {isVideo ? (
            <video
              src={preview}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img src={preview} className="w-full h-full object-cover" alt={slot.label} />
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={onDelete}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-[#ef4444] hover:text-white text-[#54433e] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
            <span className="text-white text-[10px] font-[700] uppercase tracking-widest">
              {isVideo ? 'Cambiar video' : 'Cambiar foto'}
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
        </>
      )}
      <input
        ref={el => {
          inputEl.current = el;
          inputRef(el);
        }}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
};

export const Step3ProcessTime: React.FC<Props> = ({ state, update, onNext, onBack, onSaveDraft, isSavingDraft, step, totalSteps, artisanId = '' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(
    () => !!state.elaborationTime && !TIME_OPTIONS.some(o => o.value !== '__custom' && o.value === state.elaborationTime),
  );
  const [videoIndices, setVideoIndices] = useState<Set<number>>(new Set());
  const evidenceRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recognitionRef = useRef<any>(null);

  // Process library state
  const [processes, setProcesses] = useState<Story[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSavingProcess, setIsSavingProcess] = useState(false);

  const loadProcesses = () => {
    if (!artisanId || loadingProcesses) return;
    setLoadingProcesses(true);
    getStoriesByArtisan(artisanId)
      .then(all => setProcesses(all.filter(s => s.type === 'process')))
      .catch(() => {})
      .finally(() => setLoadingProcesses(false));
  };

  const handleOpenPicker = () => {
    setShowPicker(v => !v);
    if (!showPicker && processes.length === 0) loadProcesses();
  };

  const handleSelectProcess = (story: Story) => {
    update({ processDescription: story.content });
    setShowPicker(false);
  };

  const handleSaveProcess = async () => {
    const content = (state.processDescription ?? '').trim();
    if (!content || !saveTitle.trim() || !artisanId) return;
    setIsSavingProcess(true);
    try {
      const saved = await createStory({
        artisanId,
        title: saveTitle.trim(),
        type: 'process',
        content,
        isPublic: false,
      });
      setProcesses(prev => [saved, ...prev]);
      setSaveTitle('');
      setShowSaveDialog(false);
    } catch {
      // toast de error por interceptor
    } finally {
      setIsSavingProcess(false);
    }
  };

  const handleSlotChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const urls = [...(state.processEvidenceUrls ?? [])];
    urls[index] = URL.createObjectURL(file);
    update({ processEvidenceUrls: urls });
    setVideoIndices(prev => {
      const s = new Set(prev);
      file.type.startsWith('video/') ? s.add(index) : s.delete(index);
      return s;
    });
    e.target.value = '';
  };

  const removeEvidence = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const urls = [...(state.processEvidenceUrls ?? [])];
    urls.splice(index, 1, undefined as unknown as string);
    while (urls.length > 0 && !urls[urls.length - 1]) urls.pop();
    update({ processEvidenceUrls: urls });
    setVideoIndices(prev => { const s = new Set(prev); s.delete(index); return s; });
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = 'es-CO';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join('');
      update({ processDescription: transcript });
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const hasSpeechSupport = typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        <WizardHeader
          step={step}
          totalSteps={totalSteps}
          onBack={onBack}
          icon="history_edu"
          title="Proceso y tiempo"
          subtitle="Evidencia y descripción para la trazabilidad TELAR"
        />

        <div className="grid grid-cols-12 gap-6 items-start">
          {/* AI Sidebar */}
          <aside className="col-span-12 lg:col-span-3 sticky top-8">
            <div className="p-5 text-white rounded-2xl" style={{ background: '#151b2d' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#ec6d13] text-lg">auto_awesome</span>
                <h3 className="font-['Manrope'] text-[10px] font-[800] tracking-widest uppercase">
                  Sugerido por IA
                </h3>
              </div>
              <p className="text-[11px] text-white/50 mb-5">
                Basado en las fotos, descripción y técnica seleccionada.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Tiempo estimado', value: state.elaborationTime ?? '1 semana' },
                  { label: 'Capacidad sugerida', value: `${state.monthlyCapacity ?? 4} piezas / mes` },
                  { label: 'Método detectado', value: state.processMethod ?? 'Hecho a mano' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[9px] font-[800] text-white/40 uppercase tracking-widest">{label}</p>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-[800] uppercase tracking-widest bg-[#ec6d13]/20 text-[#ec6d13]">
                        IA
                      </span>
                    </div>
                    <p className="text-[13px] text-white/80 font-[500] mb-2">{value}</p>
                    <div className="flex gap-1.5">
                      <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[9px] py-1.5 rounded-md transition-colors font-[800] uppercase">
                        Confirmar
                      </button>
                      <button className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 text-[9px] py-1.5 rounded-md transition-colors font-[800] uppercase">
                        Cambiar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="col-span-12 lg:col-span-9 space-y-5 pb-32">

            {/* 1. Evidence upload — FIRST */}
            <section className="p-6 rounded-2xl" style={cardStyle}>
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[#ec6d13] text-xl">photo_library</span>
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                  Registro del proceso
                </label>
              </div>
              <p className="text-[11px] text-[#54433e]/60 mb-4">
                Sube fotos o videos del proceso. Esto fortalece la trazabilidad de la pieza y permite que la IA detecte fases, herramientas y tiempos.
              </p>

              {/* Evidence gallery: 1 large + 4 small */}
              <div className="flex gap-3">
                <div className="flex-1 min-w-0">
                  <ProcessSlot
                    slot={PROCESS_SLOTS[0]}
                    preview={state.processEvidenceUrls?.[0] ?? null}
                    isVideo={videoIndices.has(0)}
                    inputRef={el => { evidenceRefs.current[0] = el; }}
                    onFileChange={e => handleSlotChange(e, 0)}
                    onDelete={e => removeEvidence(0, e)}
                    height="h-full min-h-[270px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 w-[45%] shrink-0">
                  {PROCESS_SLOTS.slice(1).map(slot => (
                    <ProcessSlot
                      key={slot.index}
                      slot={slot}
                      preview={state.processEvidenceUrls?.[slot.index] ?? null}
                      isVideo={videoIndices.has(slot.index)}
                      inputRef={el => { evidenceRefs.current[slot.index] = el; }}
                      onFileChange={e => handleSlotChange(e, slot.index)}
                      onDelete={e => removeEvidence(slot.index, e)}
                      height="h-[130px]"
                      small
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Process description + voice dictation */}
            <section className="p-6 rounded-2xl" style={cardStyle}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#54433e]/40 text-xl">description</span>
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                    Descripción del proceso
                  </label>
                  <AiBadge />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-[700] text-[#ec6d13] cursor-pointer hover:opacity-80 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Ayuda IA
                </div>
              </div>
              <p className="text-[11px] text-[#54433e]/60 mb-3">
                Describe cómo elaboras la pieza paso a paso. La IA usará esta descripción junto con las fotos para sugerir fases, herramientas y tiempos.
              </p>
              <div className="relative">
                <textarea
                  value={state.processDescription ?? ''}
                  onChange={e => update({ processDescription: e.target.value })}
                  placeholder="Primero selecciono el barro de la cantera, lo amaso durante una hora hasta lograr la textura adecuada, luego..."
                  rows={5}
                  className="w-full rounded-lg border border-[#151b2d]/30 px-3 py-2.5 pr-14 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#151b2d] focus:ring-2 focus:ring-[#151b2d]/8 hover:border-[#151b2d]/50 transition-all placeholder:text-[#54433e]/40 resize-none leading-relaxed"
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

              {/* ── Process library actions ─────────────────────────────── */}
              <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOpenPicker}
                  className="flex items-center gap-1.5 text-[11px] font-[700] text-[#54433e]/50 hover:text-[#ec6d13] transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {showPicker ? 'expand_less' : 'menu_book'}
                  </span>
                  {showPicker ? 'Cerrar biblioteca' : 'Usar proceso guardado'}
                </button>

                {(state.processDescription ?? '').trim().length > 10 && !showSaveDialog && (
                  <button
                    type="button"
                    onClick={() => { setShowSaveDialog(true); setSaveTitle(state.name ? `Proceso: ${state.name}` : ''); }}
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
                    Guardar en tu biblioteca de procesos
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={saveTitle}
                      onChange={e => setSaveTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !isSavingProcess && handleSaveProcess()}
                      placeholder="Dale un nombre a este proceso..."
                      autoFocus
                      className="flex-1 border border-[#ec6d13]/20 rounded-lg px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#ec6d13]/50 transition-all"
                    />
                    <button
                      onClick={handleSaveProcess}
                      disabled={!saveTitle.trim() || isSavingProcess}
                      className="px-4 py-2 rounded-lg bg-[#ec6d13] text-white text-[10px] font-[800] uppercase tracking-widest hover:bg-[#d4600f] disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {isSavingProcess && (
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

              {/* Process picker */}
              {showPicker && (
                <div
                  className="mt-3 rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(226,213,207,0.4)', background: 'rgba(247,244,239,0.6)' }}
                >
                  {loadingProcesses ? (
                    <div className="flex items-center gap-2 p-4 text-[12px] text-[#54433e]/40">
                      <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                      Cargando procesos...
                    </div>
                  ) : processes.length === 0 ? (
                    <div className="p-4 text-center">
                      <span className="material-symbols-outlined text-[28px] text-[#54433e]/20 block mb-1">menu_book</span>
                      <p className="text-[12px] text-[#54433e]/40">Aún no tienes procesos guardados.</p>
                      <p className="text-[11px] text-[#54433e]/30 mt-0.5">
                        Escribe uno y usa "Guardar para futuros productos".
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e2d5cf]/30 max-h-[280px] overflow-y-auto">
                      {processes.map(story => (
                        <button
                          key={story.id}
                          type="button"
                          onClick={() => handleSelectProcess(story)}
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
            </section>

            {/* 3. IA interpretation placeholder */}
            <section
              className="p-5 rounded-2xl border border-[#ec6d13]/15"
              style={{ background: 'rgba(236,109,19,0.03)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[#ec6d13] text-lg">auto_awesome</span>
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#ec6d13] uppercase tracking-widest">
                  Interpretación IA del proceso
                </label>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-[800] uppercase tracking-widest bg-[#ec6d13]/15 text-[#ec6d13]">
                  Próximamente
                </span>
              </div>
              <p className="text-[11px] text-[#54433e]/60">
                Cuando subas evidencia y describas el proceso, el sistema analizará las imágenes para sugerir fases, herramientas y estructura productiva automáticamente.
              </p>
            </section>

            {/* 4. Times + capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <section className="p-6 rounded-2xl" style={cardStyle}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-[#54433e]/40">schedule</span>
                  <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                    Tiempos de elaboración
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-3">
                      Tiempo total estimado
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {TIME_OPTIONS.map(opt => {
                        const isCustom = opt.value === '__custom';
                        const isActive = isCustom
                          ? showCustomTime
                          : state.elaborationTime === opt.value && !showCustomTime;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              if (isCustom) {
                                setShowCustomTime(true);
                                update({ elaborationTime: '' });
                              } else {
                                setShowCustomTime(false);
                                update({ elaborationTime: opt.value });
                              }
                            }}
                            className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                              isActive
                                ? 'border-[#ec6d13] shadow-sm'
                                : 'border-[#e2d5cf]/40 bg-white hover:border-[#ec6d13]/35 hover:shadow-sm'
                            }`}
                            style={isActive ? { background: 'rgba(236,109,19,0.06)' } : { background: '#ffffff' }}
                          >
                            <span
                              className="material-symbols-outlined text-[20px] transition-colors"
                              style={{ color: isActive ? '#ec6d13' : 'rgba(84,67,62,0.38)' }}
                            >
                              {opt.icon}
                            </span>
                            <span
                              className="text-[9px] font-[800] uppercase tracking-wide leading-tight text-center transition-colors"
                              style={{ color: isActive ? '#ec6d13' : 'rgba(84,67,62,0.55)' }}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {showCustomTime && (
                      <input
                        type="text"
                        autoFocus
                        value={state.elaborationTime ?? ''}
                        onChange={e => update({ elaborationTime: e.target.value })}
                        placeholder="Ej: 3 meses, 45 días..."
                        className={`mt-3 ${inputClass}`}
                        style={{ background: 'rgba(247,244,239,0.4)' }}
                      />
                    )}
                  </div>

                  <div>
                    <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-0.5">
                      ¿Cuántas puedes elaborar al mes?
                    </label>
                    <p className="font-['Manrope'] text-[10px] text-[#54433e]/40 mb-1.5">
                      Tu capacidad de producción mensual de este producto
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={state.monthlyCapacity ?? ''}
                        onChange={e => update({ monthlyCapacity: Number(e.target.value) })}
                        placeholder="Ej. 4"
                        className={inputClass}
                        style={{ background: 'rgba(247,244,239,0.4)' }}
                      />
                      <span className="text-[10px] font-[700] text-[#54433e]/40 uppercase tracking-widest whitespace-nowrap">
                        piezas / mes
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Tools — bidireccional */}
              <section className="p-6 rounded-2xl" style={cardStyle}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#54433e]/40">construction</span>
                    <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                      Herramientas
                    </label>
                  </div>
                  <span className="text-[9px] font-[600] text-[#54433e]/40 uppercase tracking-wider">Opcional</span>
                </div>
                <p className="text-[11px] text-[#54433e]/50 mb-4">
                  Selecciona las herramientas que usas para esta pieza. También puedes sugerir nuevas al equipo TELAR.
                </p>
                <ToolPicker
                  selected={state.tools ?? []}
                  onChange={tools => update({ tools })}
                />
              </section>
            </div>
            {/* 6. Cuidados del producto */}
            <section className="p-6 rounded-2xl" style={cardStyle}>
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-[#54433e]/40">spa</span>
                <label className="font-['Manrope'] text-[10px] font-[800] text-[#151b2d] uppercase tracking-widest">
                  Cuidados del producto
                </label>
                <span className="ml-auto text-[9px] font-[600] text-[#54433e]/40 uppercase tracking-wider">Opcional</span>
              </div>
              <p className="text-[11px] text-[#54433e]/50 mb-3">
                Instrucciones para mantener la pieza en buen estado: limpieza, almacenamiento, materiales a evitar.
              </p>
              <textarea
                rows={3}
                value={state.careNotes ?? ''}
                onChange={e => update({ careNotes: e.target.value })}
                placeholder="Ej: Limpiar con paño suave, evitar humedad, no exponer al sol directo..."
                className={`${inputClass} resize-none`}
                style={{ background: 'rgba(247,244,239,0.4)' }}
              />
            </section>
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
        leftOffset={80}
      />
    </div>
  );
};
