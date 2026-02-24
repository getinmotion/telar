import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useArtisanTaskGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateArtisanTasks = async (profileData: any) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes estar autenticado para generar tareas',
        variant: 'destructive',
      });
      return false;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('intelligent-functions', {
        body: {
          action: 'generate_artisan_tasks',
          userId: user.id,
          profileData,
          language: 'es' // Solo español
        }
      });

      if (error) {
        console.error('Error generando tareas artesanales:', error);
        toast({
          title: 'Error',
          description: 'No pudimos crear tus tareas, intenta de nuevo',
          variant: 'destructive',
        });
        return false;
      }

      const tasksCreated = data?.tasksCreated || 0;
      
      toast({
        title: '¡Tareas creadas!',
        description: `Creamos ${tasksCreated} pasos personalizados para tu negocio de ${profileData.productType}`,
        variant: 'default',
      });

      console.log('Tareas artesanales generadas:', {
        tasksCreated,
        profileAnalysis: data?.profileAnalysis
      });

      return true;
    } catch (error) {
      console.error('Fallo al generar tareas artesanales:', error);
      toast({
        title: 'Error',
        description: 'Algo salió mal al crear las tareas',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateArtisanTasks,
    isGenerating
  };
};