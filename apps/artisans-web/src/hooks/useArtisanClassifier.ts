/**
 * Hook para clasificar artesanos usando el catálogo oficial
 * con el sistema RAG implementado en la edge function
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClasificacionOficial, ResultadoClasificacionAI } from '@/types/artisan';
import { useToast } from '@/hooks/use-toast';

export const useArtisanClassifier = () => {
  const [isClassifying, setIsClassifying] = useState(false);
  const { toast } = useToast();

  const classifyArtisan = async (
    businessDescription: string,
    userId?: string
  ): Promise<ClasificacionOficial | null> => {
    setIsClassifying(true);

    try {
      console.log('🔍 [CLASSIFIER] Iniciando clasificación...', { descLength: businessDescription.length });

      const { data, error } = await supabase.functions.invoke('classify-artisan-craft', {
        body: { 
          businessDescription,
          userId 
        }
      });

      if (error) {
        console.error('❌ [CLASSIFIER] Error en edge function:', error);
        throw error;
      }

      console.log('📦 [CLASSIFIER] Respuesta recibida:', data);

      if (!data?.success) {
        // Si es un error de "no_match", no es un error técnico, solo no se pudo clasificar
        if (data?.error === 'no_match') {
          console.log('⚠️ [CLASSIFIER] No se encontró coincidencia en el catálogo');
          toast({
            title: "No se pudo clasificar",
            description: data?.message || "La descripción no corresponde a un oficio artesanal del catálogo",
            variant: "default",
          });
          return null; // Retornar null sin error, la extracción continúa
        }
        throw new Error(data?.error || 'Error al clasificar artesano');
      }

      const clasificacion: ClasificacionOficial = {
        ...data.clasificacion,
        fechaClasificacion: new Date(data.clasificacion.fechaClasificacion)
      };

      console.log('✅ [CLASSIFIER] Clasificación exitosa:', {
        oficio: clasificacion.oficio,
        materiaPrima: clasificacion.materiaPrima,
        confianza: clasificacion.confianza
      });

      toast({
        title: "¡Artesano clasificado!",
        description: `${clasificacion.oficio} - ${clasificacion.materiaPrima}`,
      });

      return clasificacion;

    } catch (error) {
      console.error('❌ [CLASSIFIER] Error:', error);
      
      toast({
        title: "Error al clasificar",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });

      return null;
    } finally {
      setIsClassifying(false);
    }
  };

  const saveClassification = async (
    userId: string,
    clasificacion: ClasificacionOficial
  ): Promise<boolean> => {
    try {
      console.log('💾 [CLASSIFIER] Guardando clasificación en DB...', { userId });

      const { error } = await supabase
        .from('artisan_official_classifications')
        .insert({
          user_id: userId,
          materia_prima: clasificacion.materiaPrima,
          codigo_materia_prima_cuoc: clasificacion.codigoMateriaPrimaCUOC,
          codigo_materia_prima_adec: clasificacion.codigoMateriaPrimaAdeC,
          oficio: clasificacion.oficio,
          codigo_oficio_cuoc: clasificacion.codigoOficioCUOC,
          codigo_oficio_adec: clasificacion.codigoOficioAdeC,
          tecnicas: clasificacion.tecnicas as any,
          confianza: clasificacion.confianza,
          justificacion: clasificacion.justificacion,
          clasificado_automaticamente: clasificacion.clasificadoAutomaticamente,
          clasificado_por_usuario: clasificacion.clasificadoPorUsuario
        });

      if (error) {
        console.error('❌ [CLASSIFIER] Error guardando en DB:', error);
        throw error;
      }

      console.log('✅ [CLASSIFIER] Clasificación guardada exitosamente');
      return true;

    } catch (error) {
      console.error('❌ [CLASSIFIER] Error al guardar clasificación:', error);
      
      toast({
        title: "Error al guardar clasificación",
        description: "La clasificación se realizó pero no se pudo guardar",
        variant: "destructive",
      });

      return false;
    }
  };

  const getClassification = async (userId: string): Promise<ClasificacionOficial | null> => {
    try {
      const { data, error } = await supabase
        .from('artisan_official_classifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró clasificación, no es un error
          return null;
        }
        throw error;
      }

      if (!data) return null;

      return {
        materiaPrima: data.materia_prima,
        codigoMateriaPrimaCUOC: data.codigo_materia_prima_cuoc || '',
        codigoMateriaPrimaAdeC: data.codigo_materia_prima_adec || '',
        oficio: data.oficio,
        codigoOficioCUOC: data.codigo_oficio_cuoc || '',
        codigoOficioAdeC: data.codigo_oficio_adec || '',
        tecnicas: (data.tecnicas as any) || [],
        confianza: data.confianza || 0,
        justificacion: data.justificacion || undefined,
        fechaClasificacion: new Date(data.created_at),
        clasificadoAutomaticamente: data.clasificado_automaticamente,
        clasificadoPorUsuario: data.clasificado_por_usuario
      };

    } catch (error) {
      console.error('❌ [CLASSIFIER] Error al obtener clasificación:', error);
      return null;
    }
  };

  return {
    classifyArtisan,
    saveClassification,
    getClassification,
    isClassifying
  };
};
