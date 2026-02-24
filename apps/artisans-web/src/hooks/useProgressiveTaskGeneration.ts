import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

import { useToast } from '@/hooks/use-toast';

export const useProgressiveTaskGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const language = 'en'; // Fixed to English only
  const { toast } = useToast();

  const generateProgressiveTasks = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be authenticated to generate tasks',
        variant: 'destructive',
      });
      return false;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating progressive tasks for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('generate-progressive-tasks', {
        body: {
          userId: user.id,
          language: 'en'
        }
      });

      if (error) {
        console.error('Error generating progressive tasks:', error);
        toast({
          title: 'Error',
          description: 'Error generating progressive tasks',
          variant: 'destructive',
        });
        return false;
      }

      const tasksCreated = data?.tasksCreated || 0;
      
      toast({
        title: 'Tasks generated!',
        description: `Generated ${tasksCreated} new tasks based on your current progress`,
        variant: 'default',
      });

      console.log('Progressive tasks generated successfully:', {
        tasksCreated,
        analysisContext: data?.analysisContext
      });

      return true;
    } catch (error) {
      console.error('Failed to generate progressive tasks:', error);
      toast({
        title: 'Error',
        description: 'Unexpected error generating tasks',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateProgressiveTasks,
    isGenerating
  };
};