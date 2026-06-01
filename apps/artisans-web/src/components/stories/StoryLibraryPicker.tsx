import React, { useState, useEffect } from 'react';
import { Plus, Copy, BookOpen, Sparkles, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getStoriesByArtisan,
  createStory,
  cloneStory,
  type Story,
} from '@/services/story-library.actions';
import { cn } from '@/lib/utils';

const STORY_TYPE_LABELS: Record<string, string> = {
  process: 'Proceso',
  origin_story: 'Historia de origen',
  technique: 'Técnica',
  inspiration: 'Inspiración',
};

interface StoryLibraryPickerProps {
  artisanId: string;
  selectedStoryIds: string[];
  onSelect: (storyId: string) => void;
  onDeselect: (storyId: string) => void;
  className?: string;
}

interface NewStoryForm {
  title: string;
  type: string;
  content: string;
  isPublic: boolean;
}

const EMPTY_FORM: NewStoryForm = { title: '', type: 'process', content: '', isPublic: false };

export const StoryLibraryPicker: React.FC<StoryLibraryPickerProps> = ({
  artisanId,
  selectedStoryIds,
  onSelect,
  onDeselect,
  className,
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [cloning, setCloning] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState<NewStoryForm>(EMPTY_FORM);

  useEffect(() => {
    if (!artisanId) return;
    setLoading(true);
    getStoriesByArtisan(artisanId)
      .then(setStories)
      .catch(() => toast.error('Error al cargar las historias'))
      .finally(() => setLoading(false));
  }, [artisanId]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.warning('El título y contenido son requeridos');
      return;
    }
    setCreating(true);
    try {
      const story = await createStory({ artisanId, ...form });
      setStories((prev) => [story, ...prev]);
      setForm(EMPTY_FORM);
      setShowCreate(false);
      toast.success('Historia creada');
    } catch {
      toast.error('Error al crear la historia');
    } finally {
      setCreating(false);
    }
  };

  const handleClone = async (story: Story) => {
    setCloning(story.id);
    try {
      const copy = await cloneStory(story.id, artisanId);
      setStories((prev) => [copy, ...prev]);
      toast.success(`Historia clonada: "${copy.title}"`);
    } catch {
      toast.error('Error al clonar la historia');
    } finally {
      setCloning(null);
    }
  };

  const toggleSelect = (storyId: string) => {
    if (selectedStoryIds.includes(storyId)) {
      onDeselect(storyId);
    } else {
      onSelect(storyId);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#151b2d]" />
          <span className="text-sm font-medium text-[#151b2d]">Librería de historias</span>
          {selectedStoryIds.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedStoryIds.length} vinculada{selectedStoryIds.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* AI placeholder */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-gray-300 cursor-not-allowed gap-1"
            disabled
            title="Próximamente"
          >
            <Sparkles className="w-3 h-3" />
            IA redacta
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => setShowCreate((v) => !v)}
          >
            <Plus className="w-3 h-3" />
            Nueva historia
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-[#151b2d]/10 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#151b2d] uppercase tracking-wide">
              Nueva historia
            </span>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Input
            placeholder="Título..."
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="text-sm"
          />

          <div className="flex gap-2 flex-wrap">
            {Object.entries(STORY_TYPE_LABELS).map(([key, lbl]) => (
              <button
                key={key}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: key }))}
                className={cn(
                  'px-2 py-1 rounded-full text-xs border transition-all',
                  form.type === key
                    ? 'bg-[#151b2d] text-white border-[#151b2d]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400',
                )}
              >
                {lbl}
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Escribe tu historia, proceso o técnica..."
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={4}
            className="text-sm resize-none"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))}
                className="rounded"
              />
              Visible en mi tienda
            </label>
            <Button
              type="button"
              size="sm"
              onClick={handleCreate}
              disabled={creating}
              className="text-xs h-7"
            >
              {creating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Crear historia
            </Button>
          </div>
        </div>
      )}

      {/* Story list */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : stories.length === 0 ? (
        <p className="text-xs text-gray-400 py-3 text-center">
          Aún no tienes historias. Crea tu primera historia arriba.
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {stories.map((story) => {
            const isSelected = selectedStoryIds.includes(story.id);
            const isExpanded = expanded === story.id;
            return (
              <div
                key={story.id}
                className={cn(
                  'rounded-lg border p-3 transition-all cursor-pointer',
                  isSelected
                    ? 'border-[#151b2d] bg-[#151b2d]/5'
                    : 'border-gray-100 bg-white hover:border-gray-200',
                )}
                onClick={() => toggleSelect(story.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-[#151b2d] truncate">
                        {story.title}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0">
                        {STORY_TYPE_LABELS[story.type] ?? story.type}
                      </Badge>
                      {story.isPublic && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 shrink-0">
                          Pública
                        </Badge>
                      )}
                    </div>
                    {isExpanded && (
                      <p className="text-xs text-gray-500 mt-1.5 whitespace-pre-wrap leading-relaxed">
                        {story.content}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : story.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Ver contenido"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClone(story)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Clonar historia"
                      disabled={cloning === story.id}
                    >
                      {cloning === story.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Copy className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
