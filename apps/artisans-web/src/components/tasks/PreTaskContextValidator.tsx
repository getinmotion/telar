/**
 * Pre-Task Context Validator - FASE 3
 * 
 * Valida que el artesano tenga información crítica completa ANTES de comenzar una misión.
 * Si falta información, muestra un modal con 2-3 preguntas complementarias rápidas.
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VoiceInput } from '@/components/ui/voice-input';
import { AgentTask } from '@/hooks/types/agentTaskTypes';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, Mic } from 'lucide-react';

interface MissingInfoQuestion {
  field: string;
  question: string;
  placeholder: string;
}

interface PreTaskContextValidatorProps {
  task: AgentTask;
  missingInfo: MissingInfoQuestion[];
  onComplete: () => void;
}

export const PreTaskContextValidator: React.FC<PreTaskContextValidatorProps> = ({
  task,
  missingInfo,
  onComplete
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const translations = {
    en: {
      title: 'Before we start...',
      description: 'To give you the best mission experience, I need a bit more information about your business:',
      save: 'Continue with Mission',
      cancel: 'Skip for now',
      saving: 'Saving...',
      required: 'All fields are required',
      success: 'Information saved successfully!'
    },
    es: {
      title: 'Antes de comenzar...',
      description: 'Para darte la mejor experiencia en esta misión, necesito conocer un poco más sobre tu negocio:',
      save: 'Continuar con la Misión',
      cancel: 'Omitir por ahora',
      saving: 'Guardando...',
      required: 'Todos los campos son requeridos',
      success: '¡Información guardada exitosamente!'
    }
  };

  const t = translations[language];

  const handleSaveAndContinue = async () => {
    // Validar que todas las preguntas tengan respuesta
    const allAnswered = missingInfo.every(q => answers[q.field]?.trim());
    
    if (!allAnswered) {
      toast({
        title: 'Error',
        description: t.required,
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      // Guardar respuestas en user_master_context
      const { data: currentContext } = await supabase
        .from('user_master_context')
        .select('conversation_insights, business_profile')
        .eq('user_id', user?.id)
        .single();

      const existingInsights = (currentContext?.conversation_insights || {}) as any;
      
      const updatedInsights = {
        ...existingInsights,
        // Mapear respuestas a campos del contexto
        nombre_marca: answers.businessName || existingInsights.nombre_marca,
        descripcion: answers.description || existingInsights.descripcion,
        cliente_ideal: answers.customer || existingInsights.cliente_ideal,
        canales_actuales: answers.channels ? answers.channels.split(',').map((c: string) => c.trim()) : existingInsights.canales_actuales,
        mercado_objetivo: answers.targetMarket || existingInsights.mercado_objetivo
      };

      const { error } = await supabase
        .from('user_master_context')
        .update({
          conversation_insights: updatedInsights,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: '✅ ' + t.success,
        description: language === 'es' 
          ? 'Ahora puedo darte una experiencia mucho más personalizada'
          : 'Now I can give you a much more personalized experience'
      });

      onComplete();
    } catch (error) {
      console.error('Error saving context:', error);
      toast({
        title: 'Error',
        description: language === 'es' ? 'Error al guardar la información' : 'Error saving information',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto py-2">
          {missingInfo.map((question) => (
            <div key={question.field} className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {question.question}
              </label>
              <div className="relative">
                <Textarea
                  value={answers[question.field] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [question.field]: e.target.value }))}
                  placeholder={question.placeholder}
                  rows={3}
                  className="resize-none pr-12"
                />
                <div className="absolute right-2 top-2">
                  <VoiceInput
                    onTranscript={(transcript) => {
                      const current = answers[question.field] || '';
                      const newAnswer = current ? `${current} ${transcript}` : transcript;
                      setAnswers(prev => ({ ...prev, [question.field]: newAnswer }));
                    }}
                    language={language === 'es' || language === 'en' ? language : 'es'}
                    className="h-8 w-8 p-0"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Mic className="w-3 h-3" />
                {language === 'es' 
                  ? 'Usa el micrófono para dictar tu respuesta' 
                  : 'Use the microphone to dictate your answer'}
              </p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onComplete}
            disabled={isSaving}
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleSaveAndContinue}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t.saving}
              </>
            ) : (
              t.save
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};