/**
 * Utility for resetting user progress for testing purposes
 * ⚠️ ONLY FOR DEVELOPMENT - Will delete all maturity data
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EventBus } from '@/utils/eventBus';
import { createUserLocalStorage } from '@/utils/userLocalStorageUtils';

export interface ResetResult {
  success: boolean;
  message: string;
  deletedRecords: {
    scores: number;
    actions: number;
    agents: number;
    tasks: number;
    conversations: number;
    messages: number;
    deliverables: number;
    updatedProfiles: number;
    updatedContexts: number;
    contextReset: boolean;
  };
}

interface ResetDBResponse {
  success: boolean;
  error?: string;
  deleted_scores?: number;
  deleted_actions?: number;
  deleted_agents?: number;
  deleted_tasks?: number;
  deleted_conversations?: number;
  deleted_messages?: number;
  deleted_deliverables?: number;
  updated_profiles?: number;
  updated_contexts?: number;
  user_id?: string;
}

/**
 * Resets all user progress data for testing
 * Uses the secure database function that handles all deletions with proper RLS
 */
export async function resetUserProgressForTesting(userId: string): Promise<ResetResult> {
  try {
    console.log('🧹 [RESET] Starting full user progress reset for:', userId);

    // Call the secure database function that handles everything
    const { data, error } = await supabase.rpc('reset_user_maturity_progress', { p_user_id: userId });

    if (error) {
      console.error('❌ [RESET] Database error:', error);
      throw new Error(`Error en base de datos: ${error.message}`);
    }

    // Cast data to proper type (double cast through unknown for type safety)
    const response = data as unknown as ResetDBResponse;

    if (!response?.success) {
      console.error('❌ [RESET] Function returned error:', response?.error);
      throw new Error(response?.error || 'Error desconocido en la función');
    }

    console.log('✅ [RESET] Database cleanup complete:', response);

    // Clear ALL user-namespaced localStorage (this removes EVERYTHING for this user)
    const userLocalStorage = createUserLocalStorage(userId);
    
    // Count items before clearing
    let itemsCleared = 0;
    const prefix = `user_${userId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        itemsCleared++;
        console.log(`🗑️ [RESET] Found user cache key: ${key}`);
      }
    }
    
    // Clear all user-specific data (including cache)
    userLocalStorage.clear();
    console.log(`🗑️ [RESET] Cleared ${itemsCleared} items from localStorage for user ${userId}`);

    const result: ResetResult = {
      success: true,
      message: 'Progreso reseteado exitosamente',
      deletedRecords: {
        scores: response.deleted_scores || 0,
        actions: response.deleted_actions || 0,
        agents: response.deleted_agents || 0,
        tasks: response.deleted_tasks || 0,
        conversations: response.deleted_conversations || 0,
        messages: response.deleted_messages || 0,
        deliverables: response.deleted_deliverables || 0,
        updatedProfiles: response.updated_profiles || 0,
        updatedContexts: response.updated_contexts || 0,
        contextReset: true
      }
    };

    console.log('✅ [RESET] Complete:', result);

    // Emit event for dashboard to refresh
    EventBus.publish('debug.data.cleared', { userId });

    toast.success('🧹 Progreso reseteado completamente', {
      description: `✓ ${result.deletedRecords.scores} evaluaciones
✓ ${result.deletedRecords.agents} agentes
✓ ${result.deletedRecords.tasks} tareas
✓ ${result.deletedRecords.conversations} conversaciones
✓ ${result.deletedRecords.deliverables} entregables
✓ ${result.deletedRecords.actions} acciones
✓ Perfil de negocio limpiado
✓ Contexto maestro limpiado
✓ LocalStorage limpiado`,
      duration: 6000
    });

    return result;

  } catch (error: any) {
    console.error('❌ [RESET] Fatal error:', error);
    
    toast.error('Error al resetear progreso', {
      description: error.message || 'Error desconocido',
      duration: 7000
    });

    return {
      success: false,
      message: error.message || 'Error desconocido',
      deletedRecords: {
        scores: 0,
        actions: 0,
        agents: 0,
        tasks: 0,
        conversations: 0,
        messages: 0,
        deliverables: 0,
        updatedProfiles: 0,
        updatedContexts: 0,
        contextReset: false
      }
    };
  }
}

/**
 * Confirms with user before resetting (use in UI)
 * Note: This function no longer shows a confirmation dialog.
 * Use AlertDialog in the UI component for confirmation.
 */
export async function confirmAndReset(userId: string): Promise<ResetResult | null> {
  console.log('✅ [RESET] Starting reset process for user:', userId);
  return await resetUserProgressForTesting(userId);
}
