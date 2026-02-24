import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VoiceInput } from '@/components/ui/voice-input';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Instagram, Facebook, Lightbulb, Save, Sparkles, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface SocialMediaPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface ContentIdea {
  id: string;
  text: string;
  platform: 'instagram' | 'facebook' | 'both';
  time: string;
}

export const SocialMediaPlannerModal: React.FC<SocialMediaPlanModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [newIdea, setNewIdea] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'facebook' | 'both'>('instagram');
  const [selectedTime, setSelectedTime] = useState('09:00');

  // Sugerencias inteligentes
  const suggestions = [
    '📸 Foto del proceso de creación',
    '✨ Historia detrás de un producto',
    '🎨 Tips de cuidado de productos',
    '💬 Testimonios de clientes',
    '🌟 Detrás de cámaras del taller',
    '🎁 Promoción especial del día',
    '📦 Nuevo producto en catálogo',
    '🔥 Producto más vendido',
  ];

  const bestTimes = [
    { time: '09:00', label: '9 AM - Buenos días' },
    { time: '12:00', label: '12 PM - Almuerzo' },
    { time: '18:00', label: '6 PM - Fin del día' },
    { time: '20:00', label: '8 PM - Noche' },
  ];

  const handleAddIdea = () => {
    if (!newIdea.trim()) return;

    const idea: ContentIdea = {
      id: Date.now().toString(),
      text: newIdea,
      platform: selectedPlatform,
      time: selectedTime
    };

    setContentIdeas(prev => [...prev, idea]);
    setNewIdea('');
  };

  const handleRemoveIdea = (id: string) => {
    setContentIdeas(prev => prev.filter(idea => idea.id !== id));
  };

  const handleVoiceTranscription = (transcription: string) => {
    setNewIdea(prev => prev + (prev ? ' ' : '') + transcription);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setNewIdea(suggestion);
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_master_context')
        .update({
          conversation_insights: {
            social_media_plan: {
              content_ideas: contentIdeas,
              created_at: new Date().toISOString()
            }
          } as any
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: '¡Plan de Redes Sociales Guardado! 📱',
        description: `Has planificado ${contentIdeas.length} ideas de contenido.`,
      });

      onComplete?.();
      onClose();
    } catch (error) {
      console.error('Error saving social media plan:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el plan de redes sociales',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'both': return <span className="text-xs">📱</span>;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="w-6 h-6 text-primary" />
            Planificador de Redes Sociales
          </DialogTitle>
          <DialogDescription>
            Crea un calendario de contenido para Instagram y Facebook. Usa las sugerencias o dicta tus propias ideas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sugerencias rápidas */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-secondary" />
              Sugerencias rápidas
            </Label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseSuggestion(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Nueva idea de contenido */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/5">
            <Label htmlFor="newIdea" className="text-lg font-semibold">
              Nueva idea de contenido
            </Label>
            
            <Textarea
              id="newIdea"
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="Ej: Foto mostrando el proceso de esmaltado de las piezas con una historia personal..."
              className="min-h-[100px]"
            />

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="platform">Plataforma</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={selectedPlatform === 'instagram' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPlatform('instagram')}
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </Button>
                  <Button
                    variant={selectedPlatform === 'facebook' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPlatform('facebook')}
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant={selectedPlatform === 'both' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPlatform('both')}
                  >
                    📱 Ambas
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="time">Mejor horario</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {bestTimes.map(({ time, label }) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <VoiceInput
                onTranscript={handleVoiceTranscription}
                language="es"
                className="mt-2"
              />
              <Button
                onClick={handleAddIdea}
                disabled={!newIdea.trim()}
                className="bg-accent text-white hover:bg-accent/90"
              >
                Agregar Idea
              </Button>
            </div>
          </div>

          {/* Lista de ideas guardadas */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">
              Ideas planificadas ({contentIdeas.length})
            </Label>
            
            {contentIdeas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aún no has agregado ideas de contenido. ¡Comienza planificando tu primera publicación!
              </p>
            ) : (
              <div className="space-y-3">
                {contentIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 space-y-2">
                      <p className="text-sm">{idea.text}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getPlatformIcon(idea.platform)}
                          <span className="ml-1">
                            {idea.platform === 'both' ? 'Ambas' : idea.platform === 'instagram' ? 'Instagram' : 'Facebook'}
                          </span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {idea.time}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveIdea(idea.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleComplete}
            disabled={contentIdeas.length === 0 || isSaving}
            className="bg-accent text-white hover:bg-accent/90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Guardar Plan ({contentIdeas.length} ideas)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
