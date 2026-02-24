import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VoiceInput } from '@/components/ui/voice-input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Palette, Sparkles, Heart, Target, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface BrandIdentityModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  stepTitle: string;
}

const BRAND_VALUES = [
  'Sostenible', 'Auténtico', 'Local', 'Tradicional', 'Innovador',
  'Artesanal', 'Premium', 'Accesible', 'Único', 'Familiar',
  'Moderno', 'Ecológico', 'Cultural', 'Personalizado', 'Calidad'
];

const COLOR_PALETTE = [
  { name: 'Tierra', colors: ['#8B4513', '#D2691E', '#CD853F'] },
  { name: 'Natural', colors: ['#228B22', '#90EE90', '#F5F5DC'] },
  { name: 'Océano', colors: ['#4682B4', '#87CEEB', '#E0F6FF'] },
  { name: 'Cálido', colors: ['#FF6347', '#FFD700', '#FFA500'] },
  { name: 'Elegante', colors: ['#2C3E50', '#ECF0F1', '#C0C0C0'] }
];

export const BrandIdentityModal: React.FC<BrandIdentityModalProps> = ({
  open,
  onClose,
  onComplete,
  stepTitle
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [story, setStory] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedPalette, setSelectedPalette] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadExistingBrand();
    }
  }, [open, user]);

  useEffect(() => {
    const completedFields = [
      brandName.trim(),
      tagline.trim(),
      story.length > 50,
      selectedValues.length > 0,
      selectedPalette
    ].filter(Boolean).length;
    setProgress((completedFields / 5) * 100);
  }, [brandName, tagline, story, selectedValues, selectedPalette]);

  const loadExistingBrand = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_master_context')
      .select('conversation_insights, business_context')
      .eq('user_id', user.id)
      .single();

    if (data?.conversation_insights) {
      const insights = data.conversation_insights as any;
      setBrandName(insights.nombre_marca || '');
      setStory(insights.historia_marca || insights.descripcion || '');
    }
  };

  const generateTaglines = async () => {
    if (!brandName.trim() || !story.trim()) {
      toast({
        title: 'Información incompleta',
        description: 'Primero completa el nombre y la historia de tu marca',
        variant: 'destructive'
      });
      return;
    }

    setLoadingSuggestions(true);

    try {
      const { data, error } = await supabase.functions.invoke('master-agent-coordinator', {
        body: {
          action: 'generate_brand_taglines',
          brandName,
          story,
          values: selectedValues
        }
      });

      if (error) throw error;

      if (data?.taglines) {
        setAiSuggestions(data.taglines);
        toast({
          title: '✨ Claims generados',
          description: 'Elige el que más te guste'
        });
      }
    } catch (error) {
      console.error('Error generating taglines:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron generar claims',
        variant: 'destructive'
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const toggleValue = (value: string) => {
    setSelectedValues(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleComplete = () => {
    if (!brandName.trim() || !tagline.trim() || selectedValues.length === 0) {
      toast({
        title: 'Completa tu identidad',
        description: 'Asegúrate de llenar todos los campos esenciales',
        variant: 'destructive'
      });
      return;
    }

    const brandIdentity = {
      brandName,
      tagline,
      story,
      values: selectedValues,
      colorPalette: selectedPalette,
      completedAt: new Date().toISOString()
    };

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }
    });

    toast({
      title: '🎨 ¡Identidad definida!',
      description: `${brandName} tiene ahora una identidad única`
    });

    onComplete(brandIdentity);
    onClose();
  };

  const exportBrandGuide = () => {
    const guide = `
GUÍA DE IDENTIDAD DE MARCA
${brandName.toUpperCase()}

CLAIM/TAGLINE
${tagline}

HISTORIA
${story}

VALORES
${selectedValues.join(', ')}

PALETA DE COLORES
${selectedPalette}

---
Generado el ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([guide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brandName.replace(/\s+/g, '-')}-brand-guide.txt`;
    a.click();

    toast({
      title: '📥 Guía exportada',
      description: 'Brand Guide descargada exitosamente'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-5 h-5 text-primary" />
            Constructor de Identidad de Marca
          </DialogTitle>
          <DialogDescription>
            Define los elementos clave que hacen única a tu marca
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2 mb-4" />

        <div className="space-y-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Nombre de tu Marca
            </label>
            <Input
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ej: Artesanías del Valle"
              className="text-lg font-semibold"
            />
          </div>

          {/* Tagline/Claim */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Claim o Frase Distintiva
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={generateTaglines}
                disabled={loadingSuggestions || !brandName.trim()}
              >
                {loadingSuggestions ? 'Generando...' : 'Generar con IA'}
              </Button>
            </div>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ej: Tradición hecha arte"
            />

            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Sugerencias de IA:</p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((suggestion, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => setTagline(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Brand Story */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Historia de tu Marca</label>
            <div className="relative">
              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Cuenta cómo nació tu marca, qué te inspira, cuál es tu propósito..."
                rows={4}
                className="pr-12"
              />
              <div className="absolute right-2 top-2">
                <VoiceInput
                  onTranscript={(transcript) => {
                    const newStory = story ? `${story} ${transcript}` : transcript;
                    setStory(newStory);
                  }}
                  language="es"
                  className="h-8 w-8 p-0"
                />
              </div>
            </div>
          </div>

          {/* Brand Values */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Valores de Marca (selecciona 3-5)
            </label>
            <div className="flex flex-wrap gap-2">
              {BRAND_VALUES.map(value => (
                <Badge
                  key={value}
                  variant={selectedValues.includes(value) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => toggleValue(value)}
                >
                  {value}
                </Badge>
              ))}
            </div>
            {selectedValues.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Seleccionados: {selectedValues.join(', ')}
              </p>
            )}
          </div>

          {/* Color Palette */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Paleta de Colores</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {COLOR_PALETTE.map(palette => (
                <div
                  key={palette.name}
                  onClick={() => setSelectedPalette(palette.name)}
                  className={`
                    cursor-pointer rounded-lg p-3 space-y-2 border-2 transition-all
                    ${selectedPalette === palette.name ? 'border-primary shadow-lg' : 'border-transparent hover:border-border'}
                  `}
                >
                  <div className="flex gap-1">
                    {palette.colors.map(color => (
                      <div
                        key={color}
                        className="flex-1 h-12 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-center">{palette.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-between pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={exportBrandGuide}
            disabled={!brandName.trim() || !tagline.trim()}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Guía
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleComplete}>Completar Identidad</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
