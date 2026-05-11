import React, { useRef, useState } from 'react';
import type { NewWizardState } from '../hooks/useNewWizardState';
import { WizardFooter } from '../components/WizardFooter';
import { WizardHeader } from '../components/WizardHeader';
import { AiBadge } from '../components/AiBadge';

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

const ELABORATION_TIMES = ['Menos de 1 día', '1 a 3 días', '1 semana', '2 semanas', '1 mes', 'Más de 1 mes'];
const DRYING_TIMES = ['N/A', '24-48 horas', '3 a 5 días', '1 semana'];

const cardStyle = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
};

const inputClass =
  'w-full rounded-lg border border-[#e2d5cf]/40 px-3 py-2.5 text-[13px] font-[500] text-[#151b2d] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 hover:border-[#e2d5cf]/70 transition-all';

export const Step3ProcessTime: React.FC<Props> = ({ state, update, onNext, onBack, onSaveDraft, isSavingDraft, step, totalSteps }) => {
  const [newTool, setNewTool] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const evidenceRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const addTool = () => {
    const t = newTool.trim();
    if (!t) return;
    update({ tools: [...(state.tools ?? []), t] });
    setNewTool('');
  };

  const removeTool = (t: string) =>
    update({ tools: (state.tools ?? []).filter(x => x !== t) });

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const urls = state.processEvidenceUrls ?? [];
    const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
    update({ processEvidenceUrls: [...urls, ...newUrls] });
    e.target.value = '';
  };

  const removeEvidence = (url: string) => {
    update({ processEvidenceUrls: (state.processEvidenceUrls ?? []).filter(u => u !== url) });
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

  const evidenceCount = state.processEvidenceUrls?.length ?? 0;

  return (
    <div className="min-h-screen" style={{ background: 'transparent' }}>
      <main className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
        <WizardHeader
          step={step}
          totalSteps={totalSteps}
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

              {/* Evidence thumbnails */}
              {evidenceCount > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {state.processEvidenceUrls!.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group border border-[#e2d5cf]/40">
                      <img src={url} alt={`Evidencia ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeEvidence(url)}
                        className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ef4444] hover:text-white text-[#54433e]"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => evidenceRef.current?.click()}
                className="flex items-center gap-2 px-5 py-3 rounded-lg border border-dashed border-[#ec6d13]/30 text-[#ec6d13] text-[11px] font-[700] uppercase tracking-widest hover:bg-[#ec6d13]/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                {evidenceCount > 0 ? 'Añadir más evidencia' : 'Subir fotos o videos del proceso'}
              </button>
              <input
                ref={evidenceRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleEvidenceUpload}
              />
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
                    <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-1.5">
                      Tiempo total estimado
                    </label>
                    <select
                      value={state.elaborationTime ?? ''}
                      onChange={e => update({ elaborationTime: e.target.value })}
                      className={`${inputClass} cursor-pointer appearance-none`}
                      style={{ background: 'rgba(247,244,239,0.4)' }}
                    >
                      <option value="">Seleccionar...</option>
                      {ELABORATION_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-1.5">
                      ¿Requiere secado o curado?
                    </label>
                    <div className="flex p-1 w-fit rounded-lg border border-[#e2d5cf]/40" style={{ background: 'rgba(247,244,239,0.3)' }}>
                      {['Sí', 'No'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => update({ requiresDrying: opt === 'Sí' })}
                          className="px-5 py-1.5 text-[10px] font-[800] uppercase tracking-widest rounded-md transition-all"
                          style={{
                            background: (state.requiresDrying === true && opt === 'Sí') || (state.requiresDrying === false && opt === 'No') ? '#ec6d13' : 'transparent',
                            color: (state.requiresDrying === true && opt === 'Sí') || (state.requiresDrying === false && opt === 'No') ? 'white' : '#54433e80',
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {state.requiresDrying && (
                    <div>
                      <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-1.5">
                        Tiempo adicional
                      </label>
                      <select
                        value={state.additionalDryingTime ?? ''}
                        onChange={e => update({ additionalDryingTime: e.target.value })}
                        className={`${inputClass} cursor-pointer appearance-none`}
                        style={{ background: 'rgba(247,244,239,0.4)' }}
                      >
                        {DRYING_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="font-['Manrope'] text-[9px] font-[700] text-[#54433e]/50 uppercase tracking-wider block mb-1.5">
                      Capacidad mensual
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={state.monthlyCapacity ?? ''}
                        onChange={e => update({ monthlyCapacity: Number(e.target.value) })}
                        placeholder="4"
                        className={inputClass}
                        style={{ background: 'rgba(247,244,239,0.4)' }}
                      />
                      <span className="text-[10px] font-[700] text-[#54433e]/40 uppercase tracking-widest whitespace-nowrap">
                        piezas/mes
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. Tools — optional, less dominant */}
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
                  Lista las herramientas que usas. También puedes subir fotos de ellas en el registro del proceso.
                </p>

                <div className="space-y-2">
                  {(state.tools ?? []).map(t => (
                    <div
                      key={t}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border border-[#e2d5cf]/30 group"
                      style={{ background: 'rgba(247,244,239,0.3)' }}
                    >
                      <span className="text-[12px] font-[600] text-[#151b2d]/80">{t}</span>
                      <button
                        onClick={() => removeTool(t)}
                        className="text-[#54433e]/20 hover:text-[#ef4444] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTool}
                      onChange={e => setNewTool(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTool(); } }}
                      placeholder="Ej: Torno, gubia, aguja..."
                      className={`flex-1 ${inputClass}`}
                      style={{ background: 'rgba(247,244,239,0.4)' }}
                    />
                    <button
                      onClick={addTool}
                      className="px-4 py-2 rounded-lg border border-dashed border-[#ec6d13]/30 text-[#ec6d13] text-[10px] font-[800] uppercase tracking-widest hover:bg-[#ec6d13]/5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                </div>
              </section>
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
      />
    </div>
  );
};
