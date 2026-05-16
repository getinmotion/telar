import React, { useState } from 'react';
import { Video, Link, Upload, Radio, Save, X, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { telarApi } from '@/integrations/api/telarApi';
import { cn } from '@/lib/utils';

export interface PresentationVideoData {
  type: 'youtube' | 'vimeo' | 'upload' | 'social';
  url: string;
  platform?: string;
}

interface PresentationVideoSectionProps {
  shopId: string;
  initialValue?: PresentationVideoData | null;
  onSaved?: (data: PresentationVideoData) => void;
  onRecord?: () => void;
}

type TabId = 'youtube_vimeo' | 'upload' | 'social' | 'record';

const TABS: { id: TabId; label: string; icon: React.ElementType; disabled?: boolean }[] = [
  { id: 'youtube_vimeo', label: 'YouTube / Vimeo', icon: Play },
  { id: 'upload', label: 'Subir video', icon: Upload },
  { id: 'social', label: 'Red social', icon: Link },
  { id: 'record', label: 'Grabar', icon: Radio, disabled: true },
];

function extractVideoEmbed(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

export const PresentationVideoSection: React.FC<PresentationVideoSectionProps> = ({
  shopId,
  initialValue,
  onSaved,
  onRecord,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>(
    initialValue?.type === 'upload' ? 'upload'
    : initialValue?.type === 'social' ? 'social'
    : 'youtube_vimeo',
  );
  const [draftUrl, setDraftUrl] = useState(initialValue?.url ?? '');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const embedUrl = activeTab === 'youtube_vimeo' ? extractVideoEmbed(draftUrl) : null;

  const handleSave = async () => {
    if (activeTab === 'record') return;

    let finalUrl = draftUrl.trim();

    if (activeTab === 'upload') {
      if (!uploadFile) { toast.warning('Selecciona un archivo de video'); return; }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('folder', 'presentation_videos');
        const resp = await telarApi.post<{ url: string }>('/file-upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalUrl = resp.data.url;
      } catch {
        toast.error('Error al subir el video');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    if (!finalUrl) { toast.warning('Ingresa una URL o selecciona un archivo'); return; }

    const payload: PresentationVideoData = {
      type: activeTab === 'youtube_vimeo'
        ? (draftUrl.includes('vimeo') ? 'vimeo' : 'youtube')
        : activeTab === 'upload' ? 'upload' : 'social',
      url: finalUrl,
    };

    setSaving(true);
    try {
      await telarApi.patch(`/artisan-shops/${shopId}`, { presentationVideo: payload });
      onSaved?.(payload);
      toast.success('Video de presentación guardado');
    } catch {
      toast.error('Error al guardar el video');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#151b2d]/8 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-[#151b2d]" />
        <h3 className="text-sm font-semibold text-[#151b2d]">Video de presentación</h3>
        {initialValue?.url && (
          <span className="text-xs text-green-600 ml-auto">✓ Configurado</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => {
              if (tab.disabled) {
                if (tab.id === 'record') onRecord?.();
                return;
              }
              setActiveTab(tab.id);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all',
              tab.disabled
                ? 'text-gray-300 cursor-not-allowed'
                : activeTab === tab.id
                  ? 'bg-white text-[#151b2d] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
            )}
            title={tab.disabled ? 'Próximamente' : undefined}
          >
            <tab.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.disabled && (
              <span className="text-[9px] uppercase tracking-wide text-gray-300">soon</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-3">
        {activeTab === 'youtube_vimeo' && (
          <>
            <Input
              placeholder="https://www.youtube.com/watch?v=... o https://vimeo.com/..."
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              className="text-sm"
            />
            {embedUrl && (
              <div className="rounded-lg overflow-hidden aspect-video bg-black">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title="Vista previa del video"
                />
              </div>
            )}
          </>
        )}

        {activeTab === 'upload' && (
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
              uploadFile ? 'border-[#151b2d]/30 bg-[#151b2d]/5' : 'border-gray-200 hover:border-gray-300',
            )}
            onClick={() => document.getElementById('video-upload-input')?.click()}
          >
            <input
              id="video-upload-input"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
            {uploadFile ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#151b2d]">{uploadFile.name}</p>
                <p className="text-xs text-gray-400">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                  className="text-xs text-red-400 hover:text-red-600 mt-1"
                >
                  Quitar archivo
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Arrastra tu video aquí o haz clic para seleccionar</p>
                <p className="text-xs text-gray-400 mt-1">MP4, WebM o MOV · Máximo 100 MB</p>
              </>
            )}
          </div>
        )}

        {activeTab === 'social' && (
          <Input
            placeholder="URL de tu video en Instagram, TikTok, Facebook..."
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            className="text-sm"
          />
        )}
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end gap-2">
        {initialValue?.url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400"
            onClick={() => {
              setDraftUrl('');
              setUploadFile(null);
            }}
          >
            <X className="w-3 h-3 mr-1" />
            Limpiar
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={saving || uploading || activeTab === 'record'}
          className="text-xs gap-1"
        >
          {saving || uploading
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Save className="w-3 h-3" />
          }
          {uploading ? 'Subiendo...' : saving ? 'Guardando...' : 'Guardar video'}
        </Button>
      </div>
    </div>
  );
};
