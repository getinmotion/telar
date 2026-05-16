import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadFolder, uploadImage } from '@/services/fileUpload.actions';
import { isSlugAvailable, updateStoreArtisanalCraft } from '@/services/artisanShops.actions';
import { ArtisanProfileData } from '@/types/artisanProfile';
import { useToast } from '@/components/ui/use-toast';
import { SpeechTextarea } from '@/components/ui/speech-textarea';
import { CraftPicker } from '@/components/shop/new-product-wizard/components/CraftPicker';

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
  shopSlug?: string;
  shopName?: string;
  onShopUpdate?: (updates: { shopName?: string; shopSlug?: string }) => Promise<void>;
  userId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 2px 10px -2px rgba(0,0,0,0.05)',
};

const inputCls =
  "w-full rounded-lg px-4 py-3 font-['Manrope'] text-[14px] text-[#151b2d] border border-[#e2d5cf]/50 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/25 transition-all hover:border-[#e2d5cf]/80";
const inputBg: React.CSSProperties = { background: 'rgba(247,244,239,0.5)' };

const Label: React.FC<{ children: React.ReactNode; required?: boolean; optional?: boolean }> = ({
  children, required, optional,
}) => (
  <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2">
    {children}
    {required && <span className="text-[#ef4444] ml-1">*</span>}
    {optional && <span className="ml-2 text-[#54433e]/30 normal-case tracking-normal font-[500] text-[11px]">— Opcional</span>}
  </label>
);

// ─── Avatar Uploader ──────────────────────────────────────────────────────────

const AvatarUploader: React.FC<{ value: string; onChange: (url: string) => void }> = ({
  value,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadImage(file, UploadFolder.PROFILES, file.name);
      onChange(result.url);
    } catch {
      toast({ title: 'Error', description: 'No se pudo subir la foto.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div
      className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
      style={{ background: 'rgba(84,67,62,0.07)', border: '2px dashed rgba(84,67,62,0.15)' }}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />

      {value ? (
        <>
          <img src={value} alt="Foto de perfil" className="w-full h-full object-cover" />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(21,27,45,0.55)' }}>
            <span className="material-symbols-outlined text-[22px] text-white">photo_camera</span>
            <span className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-widest text-white/80">Cambiar</span>
          </div>
        </>
      ) : isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#ec6d13]/30 border-t-[#ec6d13] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[28px] text-[#54433e]/30">add_a_photo</span>
          <span className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-widest text-[#54433e]/35">Subir foto</span>
        </div>
      )}
    </div>
  );
};

// ─── Slug Creator ─────────────────────────────────────────────────────────────

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

const SlugCreator: React.FC<{
  artisticName: string;
  currentSlug: string;
  onSave: (slug: string, shopName: string) => Promise<void>;
}> = ({ artisticName, currentSlug, onSave }) => {
  const [slug, setSlug] = useState(currentSlug || toSlug(artisticName));
  const [status, setStatus] = useState<SlugStatus>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const checkRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  const MARKETPLACE_DOMAIN = 'telar.co';
  const STORE_DOMAIN = 'telar.co';

  // Sync initial slug when artisticName changes and no current slug
  useEffect(() => {
    if (!currentSlug && artisticName) {
      setSlug(toSlug(artisticName));
    }
  }, [artisticName, currentSlug]);

  const checkAvailability = useCallback((value: string) => {
    if (!value) { setStatus('idle'); return; }
    if (value === currentSlug) { setStatus('available'); return; }

    setStatus('checking');
    if (checkRef.current) clearTimeout(checkRef.current);
    checkRef.current = setTimeout(async () => {
      try {
        const available = await isSlugAvailable(value);
        setStatus(available ? 'available' : 'taken');
      } catch {
        setStatus('error');
      }
    }, 600);
  }, [currentSlug]);

  const handleSlugChange = (val: string) => {
    const clean = toSlug(val) || val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(clean);
    checkAvailability(clean);
  };

  const handleSave = async () => {
    if (status !== 'available' && slug !== currentSlug) return;
    setIsSaving(true);
    try {
      await onSave(slug, artisticName);
      toast({ title: 'URL guardada', description: `Tu tienda quedó en /${slug}` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar la URL.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const statusIcon = {
    idle:      { icon: 'pending', color: 'text-[#54433e]/30' },
    checking:  { icon: 'progress_activity', color: 'text-[#54433e]/40 animate-spin' },
    available: { icon: 'check_circle', color: 'text-[#166534]' },
    taken:     { icon: 'cancel', color: 'text-[#ef4444]' },
    error:     { icon: 'error', color: 'text-[#f59e0b]' },
  }[status];

  const urls = [
    {
      icon: 'storefront',
      label: 'Marketplace',
      value: `${MARKETPLACE_DOMAIN}/tienda/${slug || '…'}`,
      live: true,
    },
    {
      icon: 'language',
      label: 'Tu tienda online',
      value: `${slug || '…'}.${STORE_DOMAIN}`,
      live: true,
    },
    {
      icon: 'dns',
      label: 'Dominio propio',
      value: null,
      live: false,
      soon: true,
    },
  ];

  return (
    <div
      className="mt-4 rounded-xl overflow-hidden"
      style={{
        background: '#151b2d',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/8">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[14px] text-[#ec6d13]">link</span>
          <p className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-white/60">
            Tu URL en el marketplace
          </p>
        </div>
        <p className="font-['Manrope'] text-[12px] text-white/40 leading-snug">
          Esta URL identifica tu tienda en TELAR. Elígela con cuidado — cambiarla puede afectar links existentes.
        </p>
      </div>

      {/* Slug input */}
      <div className="px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2 rounded-lg px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="font-['Manrope'] text-[13px] text-white/30 shrink-0">telar.co/tienda/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="nombre-de-tu-tienda"
            className="flex-1 bg-transparent font-['Manrope'] text-[14px] font-[600] text-white focus:outline-none placeholder:text-white/20 min-w-0"
          />
          <span className={`material-symbols-outlined text-[18px] shrink-0 ${statusIcon.color}`}>
            {statusIcon.icon}
          </span>
        </div>
        {status === 'taken' && (
          <p className="mt-1.5 font-['Manrope'] text-[11px] text-[#ef4444]/80">
            Esta URL ya está en uso. Prueba con una variación.
          </p>
        )}
        {status === 'available' && slug !== currentSlug && (
          <p className="mt-1.5 font-['Manrope'] text-[11px] text-[#22c55e]/80">
            ¡Disponible! Guarda para confirmar.
          </p>
        )}
      </div>

      {/* URL previews */}
      <div className="px-5 py-4 flex flex-col gap-3 border-b border-white/8">
        {urls.map(({ icon, label, value, soon }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <span className="material-symbols-outlined text-[14px] text-[#ec6d13]/70">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-widest text-white/30 mb-0.5">{label}</p>
              {soon ? (
                <div className="flex items-center gap-2">
                  <span className="font-['Manrope'] text-[12px] text-white/20 italic">Configurable desde tu tienda</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-[800] uppercase tracking-widest" style={{ background: 'rgba(236,109,19,0.15)', color: '#ec6d13' }}>
                    Próximamente
                  </span>
                </div>
              ) : (
                <p className="font-['Manrope'] text-[13px] text-white/60 truncate">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="px-5 py-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || (status !== 'available' && slug !== currentSlug) || !slug}
          className="w-full py-2.5 rounded-lg font-['Manrope'] text-[11px] font-[800] uppercase tracking-widest text-white transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          style={{ background: status === 'available' || slug === currentSlug ? '#ec6d13' : 'rgba(255,255,255,0.08)' }}
        >
          {isSaving ? 'Guardando…' : 'Guardar URL'}
        </button>
      </div>
    </div>
  );
};

// ─── Video Input ─────────────────────────────────────────────────────────────

type VideoMode = 'url' | 'file' | 'record';

const VideoInput: React.FC<{ value: string; onChange: (url: string) => void }> = ({
  value,
  onChange,
}) => {
  const [mode, setMode] = useState<VideoMode>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const liveRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      setRecordedUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setRecordedUrl(null);
    }
  }, [recordedBlob]);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await uploadImage(file, UploadFolder.PROFILES, file.name);
      onChange(result.url);
      toast({ title: 'Video subido' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo subir el video.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (liveRef.current) { liveRef.current.srcObject = stream; liveRef.current.play(); }
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        setRecordedBlob(new Blob(chunksRef.current, { type: mimeType }));
        stopStream();
      };
      recorder.start(100);
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      toast({ title: 'Sin acceso a cámara', description: 'Verifica los permisos del navegador.', variant: 'destructive' });
    }
  };

  const stopRecording = () => { recorderRef.current?.stop(); setIsRecording(false); };

  const uploadRecorded = async () => {
    if (!recordedBlob) return;
    setIsUploading(true);
    try {
      const result = await uploadImage(recordedBlob, UploadFolder.PROFILES, `video_${Date.now()}.webm`);
      onChange(result.url);
      setRecordedBlob(null);
      toast({ title: 'Video guardado' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo subir el video.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const discardRecording = () => { setRecordedBlob(null); stopStream(); setIsRecording(false); };

  if (value) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#e2d5cf]/50" style={inputBg}>
        <span className="material-symbols-outlined text-[18px] text-[#ec6d13]">smart_display</span>
        <span className="flex-1 text-[13px] font-['Manrope'] text-[#151b2d] truncate">{value}</span>
        <button type="button" onClick={() => onChange('')} className="text-[#54433e]/35 hover:text-[#ef4444] transition-colors shrink-0">
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    );
  }

  const tabs: { key: VideoMode; icon: string; label: string }[] = [
    { key: 'url',    icon: 'link',        label: 'Enlace' },
    { key: 'file',   icon: 'upload_file', label: 'Archivo' },
    { key: 'record', icon: 'videocam',    label: 'Grabar' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'rgba(84,67,62,0.07)' }}>
        {tabs.map(({ key, icon, label }) => (
          <button key={key} type="button" onClick={() => { setMode(key); discardRecording(); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-[800] uppercase tracking-widest transition-all ${mode === key ? 'bg-white text-[#151b2d] shadow-sm' : 'text-[#54433e]/45 hover:text-[#54433e]'}`}>
            <span className="material-symbols-outlined text-[14px]">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {mode === 'url' && (
        <input type="url" className={inputCls} style={inputBg}
          placeholder="https://youtube.com/... o https://vimeo.com/..."
          onBlur={(e) => { if (e.target.value.trim()) onChange(e.target.value.trim()); }}
          defaultValue="" />
      )}

      {mode === 'file' && (
        <label className={`flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${isUploading ? 'border-[#ec6d13]/40 opacity-60 pointer-events-none' : 'border-[#e2d5cf]/60 hover:border-[#ec6d13]/40'}`} style={{ background: 'rgba(247,244,239,0.3)' }}>
          <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
          {isUploading
            ? <div className="w-6 h-6 border-2 border-[#ec6d13]/30 border-t-[#ec6d13] rounded-full animate-spin" />
            : <span className="material-symbols-outlined text-[36px] text-[#54433e]/25">upload_file</span>}
          <p className="text-[12px] font-['Manrope'] text-[#54433e]/45 text-center">
            {isUploading ? 'Subiendo video…' : 'Haz clic para seleccionar un video de tu computador'}
          </p>
          {!isUploading && <p className="text-[10px] font-['Manrope'] text-[#54433e]/30">MP4, MOV, WebM</p>}
        </label>
      )}

      {mode === 'record' && (
        <div className="space-y-2">
          {!isRecording && !recordedBlob && (
            <button type="button" onClick={startRecording}
              className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-lg border-2 border-dashed border-[#ec6d13]/25 hover:border-[#ec6d13]/55 hover:bg-[#ec6d13]/4 transition-all">
              <span className="material-symbols-outlined text-[36px] text-[#ec6d13]/70">videocam</span>
              <span className="text-[11px] font-['Manrope'] font-[700] text-[#ec6d13]/80">Iniciar cámara</span>
            </button>
          )}
          {isRecording && (
            <div className="space-y-2">
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                <video ref={liveRef} muted playsInline className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                  <span className="text-[10px] font-[800] uppercase tracking-widest text-white/80">Grabando</span>
                </div>
              </div>
              <button type="button" onClick={stopRecording}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#ef4444] text-white text-[11px] font-[800] uppercase tracking-widest hover:opacity-90 transition-opacity">
                <span className="w-2.5 h-2.5 rounded-sm bg-white" />
                Detener grabación
              </button>
            </div>
          )}
          {recordedBlob && recordedUrl && !isRecording && (
            <div className="space-y-2">
              <video src={recordedUrl} controls playsInline className="w-full rounded-lg aspect-video object-cover bg-black" />
              <div className="flex gap-2">
                <button type="button" onClick={discardRecording}
                  className="flex-1 py-2 rounded-lg border border-[#e2d5cf]/60 text-[11px] font-[800] uppercase tracking-widest text-[#54433e]/55 hover:text-[#54433e] transition-colors">
                  Repetir
                </button>
                <button type="button" onClick={uploadRecorded} disabled={isUploading}
                  className="flex-1 py-2 rounded-lg bg-[#ec6d13] text-white text-[11px] font-[800] uppercase tracking-widest hover:opacity-90 disabled:opacity-50">
                  {isUploading ? 'Subiendo…' : 'Guardar video'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Step 1 Identity ─────────────────────────────────────────────────────────

export const Step1Identity: React.FC<Props> = ({
  data,
  onChange,
  shopSlug = '',
  shopName: _shopName = '',
  onShopUpdate,
  userId,
}) => {
  const [showSlug, setShowSlug] = useState(false);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Módulo 1: Foto + Nombre del artesano ── */}
      <div className="rounded-xl p-5" style={glassCard}>
        <div className="flex items-start gap-5">
          {/* Avatar — ocupa todo el alto del módulo */}
          <div className="w-28 shrink-0 self-stretch" style={{ minHeight: '112px' }}>
            <AvatarUploader
              value={data.artisanPhoto || ''}
              onChange={(url) => onChange({ artisanPhoto: url })}
            />
          </div>
          {/* Name */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            <p className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-widest text-[#54433e]/50">
              Nombre del artesano <span className="text-[#ef4444]">*</span>
            </p>
            <input
              type="text"
              value={data.artisanName}
              onChange={(e) => onChange({ artisanName: e.target.value })}
              placeholder="Tu nombre completo"
              className="w-full rounded-lg px-4 py-3 font-['Noto_Serif'] text-[20px] text-[#151b2d] border border-[#e2d5cf]/50 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/20 transition-all hover:border-[#e2d5cf]/80"
              style={inputBg}
            />
            <p className="font-['Manrope'] text-[10px] text-[#54433e]/35 leading-snug">
              Foto en contexto de trabajo — evita fondos distractores
            </p>
          </div>
        </div>
      </div>

      {/* ── Módulo 2: Nombre del taller + Slug ── */}
      <div className="rounded-xl p-5" style={glassCard}>
        <Label required>Nombre del taller</Label>
        <input
          type="text"
          value={data.artisticName}
          onChange={(e) => onChange({ artisticName: e.target.value })}
          placeholder="Ej. Tejidos Zenú, Taller del Barro…"
          className={inputCls}
          style={inputBg}
        />
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mt-2 leading-snug">
          Este es el nombre que aparecerá en el marketplace de TELAR, en tu tienda online y en todos los canales de venta.
        </p>

        {/* Slug CTA */}
        <button
          type="button"
          onClick={() => setShowSlug(v => !v)}
          className="mt-4 flex items-center gap-2 group"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2d5cf]/60 group-hover:border-[#ec6d13]/40 transition-colors" style={{ background: 'rgba(84,67,62,0.04)' }}>
            <span className="material-symbols-outlined text-[14px] text-[#ec6d13]/70">link</span>
            <span className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/55 group-hover:text-[#ec6d13] transition-colors">
              {showSlug ? 'Cerrar configurador' : 'Configurar tu URL'}
            </span>
            <span className="material-symbols-outlined text-[12px] text-[#54433e]/35 group-hover:text-[#ec6d13] transition-all" style={{ transform: showSlug ? 'rotate(180deg)' : 'none' }}>
              expand_more
            </span>
          </div>
          {shopSlug && !showSlug && (
            <span className="font-['Manrope'] text-[11px] text-[#54433e]/35 truncate max-w-[180px]">
              /{shopSlug}
            </span>
          )}
        </button>

        {showSlug && onShopUpdate && (
          <SlugCreator
            artisticName={data.artisticName}
            currentSlug={shopSlug}
            onSave={async (newSlug, name) => {
              await onShopUpdate({ shopSlug: newSlug, shopName: name });
            }}
          />
        )}
        {showSlug && !onShopUpdate && (
          <div className="mt-4 p-4 rounded-xl text-center" style={{ background: 'rgba(84,67,62,0.05)', border: '1px solid rgba(84,67,62,0.08)' }}>
            <p className="font-['Manrope'] text-[12px] text-[#54433e]/40">Guarda un borrador primero para activar el configurador de URL.</p>
          </div>
        )}
      </div>

      {/* ── Módulo 3: Oficio + Técnica ── */}
      <div className="rounded-xl p-5" style={glassCard}>
        <Label optional>Tu oficio</Label>
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug mb-4">
          El oficio artesanal principal de tu taller. Se sincroniza con tu catálogo de productos.
        </p>
        <CraftPicker
          selectedCraftId={data.craftId}
          onChange={craftId => {
            onChange({ craftId, primaryTechniqueId: undefined });
            if (userId) updateStoreArtisanalCraft(userId, craftId ?? null).catch(() => {});
          }}
        />

      </div>

      {/* ── Módulo 4: Bio ── */}
      <div className="rounded-xl p-5" style={glassCard}>
        <Label optional>Presentación breve</Label>
        <SpeechTextarea
          rows={4}
          value={data.shortBio || ''}
          onChange={(v) => onChange({ shortBio: v })}
          placeholder="Quién eres, qué haces y qué hace especial tu oficio. Máximo 2–3 oraciones."
          className="w-full border border-[#e2d5cf]/50 rounded-lg p-4 text-[14px] font-['Manrope'] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed hover:border-[#e2d5cf]/80"
          style={inputBg}
        />
      </div>

      {/* ── Módulo 5: Video ── */}
      <div className="rounded-xl p-5" style={glassCard}>
        <Label optional>Video de presentación</Label>
        <VideoInput
          value={data.artisanVideo || ''}
          onChange={(url) => onChange({ artisanVideo: url })}
        />
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/35 mt-2 italic">
          Un video corto aumenta significativamente la conexión con compradores.
        </p>
      </div>

    </div>
  );
};
