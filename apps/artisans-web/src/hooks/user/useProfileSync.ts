import { useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocalStorage } from './useUserLocalStorage';
import { getUserProfileByUserId, createUserProfile, updateUserProfile } from '@/services/userProfiles.actions';

// Generate intelligent brand name from business description
// Returns null for generic/unclear cases to force user input
const generateIntelligentBrandName = (businessDescription?: string): string | null => {
  if (!businessDescription) return null;
  
  const desc = businessDescription.toLowerCase();
  
  // Only suggest names for VERY specific patterns
  // Music industry patterns
  if (desc.includes('música') || desc.includes('musical') || desc.includes('artista') || desc.includes('canciones')) {
    return 'Tu Sello Musical';
  }
  if (desc.includes('producción musical') || desc.includes('productor')) {
    return 'Tu Productora Musical';
  }
  
  // Creative industries
  if (desc.includes('artesanía') || desc.includes('artesanal')) {
    return 'Tu Taller Artesanal';
  }
  if (desc.includes('diseño') || desc.includes('creativo')) {
    return 'Tu Estudio Creativo';
  }
  
  // Services
  if (desc.includes('consultoría') || desc.includes('consultor')) {
    return 'Tu Consultoría';
  }
  if (desc.includes('agencia') || desc.includes('marketing')) {
    return 'Tu Agencia';
  }
  
  // Tech/digital
  if (desc.includes('app') || desc.includes('software') || desc.includes('tecnología')) {
    return 'Tu Startup';
  }
  
  // ❌ REMOVED generic fallbacks - return null to force user input
  // No more "Tu Negocio", "Tu Empresa", "Tu Proyecto", etc.
  return null;
};

export const useProfileSync = () => {
  const { user } = useAuth();
  const userLocalStorage = useUserLocalStorage();

  const syncProfileData = useCallback(async () => {
    if (!user) return;

    try {
      // ✅ Obtener perfil existente desde NestJS backend
      let existingProfile: any = null;
      try {
        existingProfile = await getUserProfileByUserId(user.id);
      } catch (error) {
        // Perfil no existe aún, se creará con el upsert
      }

      // Get rich data from user-namespaced localStorage
      const fusedMaturityData = userLocalStorage.getItem('fused_maturity_calculator_progress');
      const conversationalData = userLocalStorage.getItem('enhanced_conversational_agent_progress');
      const calculatorData = userLocalStorage.getItem('profileData');
      
      let profileData: any = {};
      let brandName = existingProfile?.brandName || '';
      let businessDescription = existingProfile?.businessDescription || '';
      
      // Extract comprehensive data from localStorage
      if (fusedMaturityData) {
        const data = JSON.parse(fusedMaturityData);
        profileData = data.profileData || {};
        brandName = brandName || profileData.brandName || '';
        businessDescription = businessDescription || profileData.businessDescription || '';
      } else if (conversationalData) {
        const data = JSON.parse(conversationalData);
        profileData = data.profileData || {};
        brandName = brandName || profileData.brandName || '';
        businessDescription = businessDescription || profileData.businessDescription || '';
      } else if (calculatorData) {
        profileData = JSON.parse(calculatorData);
        brandName = brandName || profileData.brandName || '';
        businessDescription = businessDescription || profileData.businessDescription || '';
      }

      // Auto-generate intelligent brand name if missing and we have business description
      if (!brandName && businessDescription) {
        brandName = generateIntelligentBrandName(businessDescription);
      }

      // Extract additional profile fields
      const profilePayload = {
        userId: user.id,
        brandName,
        businessDescription,
        businessType: profileData.businessType || existingProfile?.businessType || undefined,
        targetMarket: profileData.targetMarket || existingProfile?.targetMarket || undefined,
        currentStage: profileData.currentStage || existingProfile?.currentStage || undefined,
        businessGoals: profileData.businessGoals ? [profileData.businessGoals] : existingProfile?.businessGoals || undefined,
        businessLocation: profileData.businessLocation || existingProfile?.businessLocation || undefined,
        yearsInBusiness: profileData.yearsInBusiness || existingProfile?.yearsInBusiness || undefined,
        monthlyRevenueGoal: profileData.revenueGoal ? parseInt(profileData.revenueGoal) : existingProfile?.monthlyRevenueGoal || undefined
      };

      // ✅ Migrado a endpoint NestJS (UPSERT: POST o PATCH según existencia)
      if (existingProfile) {
        // Si existe, actualizar (PATCH)
        await updateUserProfile(user.id, profilePayload);
      } else {
        // Si no existe, crear (POST)
        await createUserProfile(profilePayload);
      }

      // Publish brand.updated event for bidirectional sync
      const { EventBus } = await import('@/utils/eventBus');
      EventBus.publish('brand.updated', {
        userId: user.id,
        brandName,
        businessDescription,
        timestamp: new Date().toISOString()
      });

      // Clean up task titles if brand name was just generated
      if (brandName && !existingProfile?.brandName) {
        await cleanupTaskTitles(user.id, brandName);
      }
    } catch (error) {
      console.error('❌ Error syncing profile:', error);
    }
  }, [user, userLocalStorage]);

  // Function to clean up existing task titles
  const cleanupTaskTitles = async (userId: string, brandName: string) => {
    try {
      // Get all tasks with array-like titles
      const { data: tasks } = await supabase
        .from('agent_tasks')
        .select('id, title, description')
        .eq('user_id', userId);

      if (!tasks) return;

      const tasksToUpdate = tasks.filter(task => 
        task.title && (
          task.title.includes('[') || 
          task.title.includes('"') ||
          task.title.includes('goal') ||
          task.title.length > 100
        )
      );

      for (const task of tasksToUpdate) {
        const { formatTaskTitleForDisplay } = await import('../utils/agentTaskUtils');
        const cleanTitle = formatTaskTitleForDisplay(task.title, brandName);
        
        if (cleanTitle !== task.title) {
          const { error } = await supabase
            .from('agent_tasks')
            .update({ 
              title: cleanTitle,
              updated_at: new Date().toISOString()
            })
            .eq('id', task.id);

          if (error) {
            console.error('[useProfileSync] Error updating task title:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error cleaning up task titles:', error);
    }
  };

  // Auto-sync when component mounts or data changes
  useEffect(() => {
    syncProfileData();
  }, [syncProfileData]);

  return { syncProfileData };
};