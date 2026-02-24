
import { AgentTask, TaskSubtask, TaskResource } from '../types/agentTaskTypes';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';

// Helper function to safely parse JSON data from database
export const parseJsonField = <T>(field: any, defaultValue: T): T => {
  if (field === null || field === undefined) return defaultValue;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return defaultValue;
    }
  }
  if (Array.isArray(field) || typeof field === 'object') {
    return field as T;
  }
  return defaultValue;
};

// Goal labels and sanitization helpers
const GOAL_LABELS: Record<string, string> = {
  scale_operations: 'Scale operations',
  automate_processes: 'Automate processes',
  expand_market: 'Expand market',
  improve_efficiency: 'Improve efficiency',
  build_brand: 'Build brand',
  increase_revenue: 'Increase revenue',
  reduce_costs: 'Reduce costs',
  improve_ux: 'Improve UX',
  launch_mvp: 'Launch MVP'
};

const toTitleCase = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());

export const replaceGoalArrayInText = (text: any): string => {
  if (text === null || text === undefined) return '';
  const str = String(text);
  
// Ultra-robust regex to match ANY array format - JSON arrays, goal arrays, etc.
  const pattern = /\[[^\]]*\]/g;
  
  return str.replace(pattern, (match) => {
    try {
      // Try to parse as JSON first
      const arr = JSON.parse(match) as string[];
      if (Array.isArray(arr)) {
        return arr
          .map(key => GOAL_LABELS[key] || toTitleCase(key.replace(/_/g, ' ')))
          .join(', ');
      }
      return match;
    } catch {
      // Enhanced fallback: extract any words/keys from the array
      const values = match.match(/[\w_]+/g);
      if (values && values.length > 0) {
        return values
          .map(key => GOAL_LABELS[key] || toTitleCase(key.replace(/_/g, ' ')))
          .join(', ');
      }
      
      // Last resort: remove the brackets and clean up
      return match.replace(/[\[\]'",]/g, '').replace(/_/g, ' ').trim();
    }
  });
};

// Generate intelligent brand name from business description
const generateIntelligentBrandName = (businessDescription?: string): string => {
  if (!businessDescription) return 'tu emprendimiento';
  
  const desc = businessDescription.toLowerCase();
  
  // Music industry patterns
  if (desc.includes('música') || desc.includes('musical') || desc.includes('artista') || desc.includes('canciones') || desc.includes('album')) {
    return 'tu sello musical';
  }
  if (desc.includes('producción musical') || desc.includes('productor') || desc.includes('producir música')) {
    return 'tu productora musical';
  }
  if (desc.includes('estudio') && desc.includes('música')) {
    return 'tu estudio musical';
  }
  
  // Creative industries
  if (desc.includes('artesanía') || desc.includes('artesanal') || desc.includes('hecho a mano')) {
    return 'tu taller artesanal';
  }
  if (desc.includes('diseño') || desc.includes('creativo') || desc.includes('arte')) {
    return 'tu estudio creativo';
  }
  
  // Services
  if (desc.includes('consultoría') || desc.includes('consultor') || desc.includes('asesoría')) {
    return 'tu consultoría';
  }
  if (desc.includes('agencia') || desc.includes('marketing') || desc.includes('publicidad')) {
    return 'tu agencia';
  }
  
  // Tech/digital
  if (desc.includes('app') || desc.includes('software') || desc.includes('tecnología') || desc.includes('digital')) {
    return 'tu startup';
  }
  
  // E-commerce/retail
  if (desc.includes('tienda') || desc.includes('venta') || desc.includes('productos') || desc.includes('comercio')) {
    return 'tu marca';
  }
  
  // Default contextual fallbacks
  if (desc.includes('servicio')) return 'tu servicio';
  if (desc.includes('negocio')) return 'tu negocio';
  if (desc.includes('empresa')) return 'tu empresa';
  if (desc.includes('proyecto')) return 'tu proyecto';
  
  return 'tu emprendimiento';
};

// Get localStorage business data for context (keeping sync for compatibility)
const getBusinessContext = (): { businessDescription?: string; brandName?: string } => {
  try {
    // Try multiple localStorage keys for different data sources
    const sources = [
      'fused_maturity_calculator_progress',
      'enhanced_conversational_agent_progress',
      'master_coordinator_progress'
    ];
    
    for (const key of sources) {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        const profileData = parsed.profileData || parsed.answers || parsed;
        
        const businessDescription = 
          profileData?.businessDescription ||
          profileData?.description ||
          profileData?.whatDoes ||
          profileData?.businessIdea ||
          null;
          
        const brandName = 
          profileData?.brandName ||
          profileData?.businessName ||
          profileData?.companyName ||
          profileData?.projectName ||
          null;
          
        if (businessDescription || brandName) {
          return { businessDescription, brandName };
        }
      }
    }
  } catch (error) {
    console.warn('Error getting business context from localStorage:', error);
  }
  
  return {};
};

// Async version for enhanced context with NestJS backend
const getBusinessContextEnhanced = async (): Promise<{ businessDescription?: string; brandName?: string }> => {
  try {
    // Get authenticated user from auth context
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {};
    }
    
    // ✅ Get profile from NestJS backend
    const profile = await getUserProfileByUserId(user.id);
      
    if (profile) {
      if (profile.businessDescription || profile.brandName) {
        return {
          businessDescription: profile.businessDescription || undefined,
          brandName: profile.brandName || undefined
        };
      }
    }

    // Fallback to localStorage
    return getBusinessContext();
  } catch (error) {
    console.warn('Error getting enhanced business context:', error);
    return getBusinessContext();
  }
};

// Format task titles for display - replace goal arrays with intelligent brand name
export const formatTaskTitleForDisplay = (title: string, brandName?: string): string => {
  // First, clean the title from any remaining JSON arrays or goal lists
  let cleanTitle = replaceGoalArrayInText(title);
  
  // ✅ PRIORIZAR el brandName que se pasa como parámetro
  let finalBrandName: string;
  
  if (brandName && brandName !== 'tu negocio' && brandName !== 'your business') {
    // Usar el brandName proporcionado (viene de useUnifiedUserData con priorización correcta)
    finalBrandName = brandName;
    console.log('🏷️ Using provided brandName:', finalBrandName);
  } else {
    // Fallback: Get business context for intelligent brand name generation
    const { businessDescription, brandName: localBrandName } = getBusinessContext();
    finalBrandName = localBrandName || generateIntelligentBrandName(businessDescription);
    console.log('🏷️ Using fallback brandName:', finalBrandName);
  }
  
  // Replace goal lists and generic terms with intelligent brand name
  const goalPattern = /\b(Scale operations|Automate processes|Expand market|Improve efficiency|Build brand|Increase revenue|Reduce costs|Improve UX|Launch MVP)(?:,\s*[A-Z][a-z\s,]+)*\b/gi;
  
  cleanTitle = cleanTitle.replace(goalPattern, finalBrandName);
  
  // Additional intelligent replacements for context
  cleanTitle = cleanTitle
    .replace(/\b(tu negocio|tu empresa|tu proyecto|tu emprendimiento|tu marca|tu taller)\b/gi, finalBrandName)
    .replace(/\b(your business|your company|your project|your startup|your brand)\b/gi, finalBrandName)
    .replace(/\bnull Business\b/gi, finalBrandName)
    .replace(/\bundefined Business\b/gi, finalBrandName);
  
  return cleanTitle;
};

// Enhanced async version for when Supabase data is available
export const formatTaskTitleForDisplayEnhanced = async (title: string, brandName?: string): Promise<string> => {
  // First, clean the title from any remaining JSON arrays or goal lists
  let cleanTitle = replaceGoalArrayInText(title);
  
  // Get enhanced business context for intelligent brand name generation
  const { businessDescription, brandName: localBrandName } = await getBusinessContextEnhanced();
  const finalBrandName = brandName || localBrandName || generateIntelligentBrandName(businessDescription);
  
  // Replace goal lists and generic terms with intelligent brand name
  const goalPattern = /\b(Scale operations|Automate processes|Expand market|Improve efficiency|Build brand|Increase revenue|Reduce costs|Improve UX|Launch MVP)(?:,\s*[A-Z][a-z\s,]+)*\b/gi;
  
  cleanTitle = cleanTitle.replace(goalPattern, finalBrandName);
  
  // Additional intelligent replacements for context
  cleanTitle = cleanTitle
    .replace(/\b(tu negocio|tu empresa|tu proyecto|tu emprendimiento)\b/gi, finalBrandName)
    .replace(/\b(your business|your company|your project|your startup)\b/gi, finalBrandName)
    .replace(/\bnull Business\b/gi, finalBrandName)
    .replace(/\bundefined Business\b/gi, finalBrandName);
  
  console.log('🔄 Enhanced formatted task title:', { original: title, cleaned: cleanTitle, brandUsed: finalBrandName });
  
  return cleanTitle;
};

// Helper function to convert database row to AgentTask
export const convertToAgentTask = (data: any): AgentTask => ({
  ...data,
  title: formatTaskTitleForDisplay(data.title),
  description: replaceGoalArrayInText(data.description || ''),
  relevance: data.relevance as 'low' | 'medium' | 'high',
  status: data.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
  subtasks: parseJsonField<TaskSubtask[]>(data.subtasks, []),
  notes: data.notes || '',
  steps_completed: parseJsonField<Record<string, boolean>>(data.steps_completed, {}),
  resources: parseJsonField<TaskResource[]>(data.resources, []),
  time_spent: data.time_spent || 0,
  is_archived: data.is_archived || false
});

// Enhanced async version for when Supabase data is available
export const convertToAgentTaskEnhanced = async (data: any): Promise<AgentTask> => ({
  ...data,
  title: await formatTaskTitleForDisplayEnhanced(data.title),
  description: replaceGoalArrayInText(data.description || ''),
  relevance: data.relevance as 'low' | 'medium' | 'high',
  status: data.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
  subtasks: parseJsonField<TaskSubtask[]>(data.subtasks, []),
  notes: data.notes || '',
  steps_completed: parseJsonField<Record<string, boolean>>(data.steps_completed, {}),
  resources: parseJsonField<TaskResource[]>(data.resources, []),
  time_spent: data.time_spent || 0,
  is_archived: data.is_archived || false
});

// Helper function to convert AgentTask fields to database format
export const convertForDatabase = (data: Partial<AgentTask>) => {
  const dbData: any = { ...data };
  
  // Remove fields that are auto-generated or managed by the database
  delete dbData.id;
  delete dbData.created_at;
  delete dbData.updated_at;
  
  return dbData;
};
