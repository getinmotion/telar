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
import { VoiceInput } from '@/components/ui/voice-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Target, Users, Lightbulb, TrendingUp, Save, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface BusinessPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface BusinessPlanData {
  objectives: string;
  targetMarket: string;
  valueProposition: string;
  actionPlan: string;
}

export const BusinessPlanModal: React.FC<BusinessPlanModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('objectives');
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<BusinessPlanData>({
    objectives: '',
    targetMarket: '',
    valueProposition: '',
    actionPlan: ''
  });

  // Auto-save cada 30 segundos
  useEffect(() => {
    if (!isOpen || !user) return;

    const interval = setInterval(() => {
      handleAutoSave();
    }, 30000);

    return () => clearInterval(interval);
  }, [data, isOpen, user]);

  const handleAutoSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_master_context')
        .update({
          conversation_insights: {
            business_plan: data
          } as any
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      console.log('✅ Business plan auto-saved');
    } catch (error) {
      console.error('Error auto-saving business plan:', error);
    }
  };

  const handleVoiceTranscription = (field: keyof BusinessPlanData, transcription: string) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field] + (prev[field] ? ' ' : '') + transcription
    }));
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_master_context')
        .update({
          conversation_insights: {
            business_plan: data
          } as any
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: '¡Plan de Negocio Guardado! 🎉',
        description: 'Tu estrategia ha sido registrada exitosamente.',
      });

      onComplete?.();
      onClose();
    } catch (error) {
      console.error('Error saving business plan:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el plan de negocio',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isComplete = Object.values(data).every(value => value.trim().length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Target className="w-6 h-6 text-primary" />
            Plan Estratégico de Negocio
          </DialogTitle>
          <DialogDescription>
            Define tu estrategia de negocio en 4 pasos clave. Usa el dictado por voz para responder más rápido.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="objectives" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Objetivos</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Mercado</span>
            </TabsTrigger>
            <TabsTrigger value="value" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Propuesta</span>
            </TabsTrigger>
            <TabsTrigger value="action" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Acción</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="objectives" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="objectives" className="text-lg font-semibold">
                ¿Cuáles son tus objetivos principales de negocio?
              </Label>
              <p className="text-sm text-muted-foreground">
                Define qué quieres lograr en los próximos 3-6 meses. Sé específico y realista.
              </p>
              <Textarea
                id="objectives"
                value={data.objectives}
                onChange={(e) => setData(prev => ({ ...prev, objectives: e.target.value }))}
                placeholder="Ej: Aumentar ventas en un 30%, lanzar 5 nuevos productos, establecer presencia en redes sociales..."
                className="min-h-[150px]"
              />
              {/* <VoiceInput onTranscriptionComplete={(text) => handleVoiceTranscription('objectives', text)} buttonText="Dictar objetivos" variant="outline" size="sm" /> */}
            </div>
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetMarket" className="text-lg font-semibold">
                ¿Quién es tu mercado objetivo?
              </Label>
              <p className="text-sm text-muted-foreground">
                Define a quién le vendes: edad, género, ubicación, intereses, poder adquisitivo.
              </p>
              <Textarea
                id="targetMarket"
                value={data.targetMarket}
                onChange={(e) => setData(prev => ({ ...prev, targetMarket: e.target.value }))}
                placeholder="Ej: Mujeres 25-45 años, interesadas en artesanía única, de Santiago y Viña del Mar, con ingresos medios-altos..."
                className="min-h-[150px]"
              />
              <VoiceInput
                onTranscript={(text) => handleVoiceTranscription('targetMarket', text)}
                language="es"
                className="mt-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="value" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="valueProposition" className="text-lg font-semibold">
                ¿Cuál es tu propuesta de valor única?
              </Label>
              <p className="text-sm text-muted-foreground">
                ¿Qué te hace diferente? ¿Por qué los clientes deberían elegirte a ti?
              </p>
              <Textarea
                id="valueProposition"
                value={data.valueProposition}
                onChange={(e) => setData(prev => ({ ...prev, valueProposition: e.target.value }))}
                placeholder="Ej: Cerámica 100% hecha a mano con técnicas ancestrales, diseños exclusivos, piezas únicas que cuentan historias..."
                className="min-h-[150px]"
              />
              <VoiceInput
                onTranscript={(text) => handleVoiceTranscription('valueProposition', text)}
                language="es"
                className="mt-2"
              />
            </div>
          </TabsContent>

          <TabsContent value="action" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="actionPlan" className="text-lg font-semibold">
                ¿Cuál es tu plan de acción concreto?
              </Label>
              <p className="text-sm text-muted-foreground">
                Define las acciones específicas que tomarás para alcanzar tus objetivos.
              </p>
              <Textarea
                id="actionPlan"
                value={data.actionPlan}
                onChange={(e) => setData(prev => ({ ...prev, actionPlan: e.target.value }))}
                placeholder="Ej: 1) Crear tienda online, 2) Publicar 3 veces por semana en Instagram, 3) Participar en 2 ferias artesanales..."
                className="min-h-[150px]"
              />
              <VoiceInput
                onTranscript={(text) => handleVoiceTranscription('actionPlan', text)}
                language="es"
                className="mt-2"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleAutoSave}
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Borrador
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!isComplete || isSaving}
              className="bg-accent text-white hover:bg-accent/90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Completar Plan
            </Button>
          </div>
        </div>

        {!isComplete && (
          <p className="text-sm text-muted-foreground text-center">
            Completa las 4 secciones para finalizar tu plan estratégico
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
