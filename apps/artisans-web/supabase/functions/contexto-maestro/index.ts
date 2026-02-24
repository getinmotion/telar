import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  console.log('=== Contexto Maestro Function Started ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, agentId, newInsight } = await req.json();
    console.log('Request data:', { action, userId, agentId, hasNewInsight: !!newInsight });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'get') {
      // Get unified context for user
      console.log('Getting master context for user:', userId);
      
      // Get existing master context
      const { data: masterContext } = await supabase
        .from('user_master_context')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get latest maturity scores
      const { data: maturityScores } = await supabase
        .from('user_maturity_scores')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get recent conversations for insights
      const { data: recentChats } = await supabase
        .from('user_chat_context')
        .select('message, role, session_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get user projects
      const { data: projects } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', userId);

      // Get active tasks for context
      const { data: activeTasks } = await supabase
        .from('agent_tasks')
        .select('title, description, agent_id, status, relevance')
        .eq('user_id', userId)
        .in('status', ['pending', 'in_progress'])
        .limit(10);

      // Compile unified context
      const unifiedContext = {
        id: masterContext?.id || null,
        user_id: userId,
        business_context: {
          ...masterContext?.business_context || {},
          profile: profile || {},
          maturity_scores: maturityScores || {},
          projects: projects || [],
          active_tasks: activeTasks || []
        },
        preferences: masterContext?.preferences || {},
        conversation_insights: masterContext?.conversation_insights || {},
        technical_details: masterContext?.technical_details || {},
        goals_and_objectives: masterContext?.goals_and_objectives || {},
        context_version: masterContext?.context_version || 1,
        last_updated: masterContext?.last_updated || new Date().toISOString()
      };

      console.log('Returning unified context for agent:', agentId);
      return new Response(JSON.stringify({ 
        success: true, 
        context: unifiedContext,
        agent_specific_notes: getAgentSpecificContext(unifiedContext, agentId)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update') {
      // Update master context with new insights
      console.log('Updating master context with new insight');
      
      const { data: existingContext } = await supabase
        .from('user_master_context')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingContext) {
        // Update existing context
        const updatedInsights = {
          ...existingContext.conversation_insights,
          [Date.now()]: {
            agent_id: agentId,
            insight: newInsight,
            timestamp: new Date().toISOString()
          }
        };

        const { error } = await supabase
          .from('user_master_context')
          .update({
            conversation_insights: updatedInsights
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Create new context
        const { error } = await supabase
          .from('user_master_context')
          .insert({
            user_id: userId,
            conversation_insights: {
              [Date.now()]: {
                agent_id: agentId,
                insight: newInsight,
                timestamp: new Date().toISOString()
              }
            }
          });

        if (error) throw error;
      }

      console.log('Master context updated successfully');
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error: unknown) {
    console.error('Error in contexto-maestro function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getAgentSpecificContext(context: any, agentId: string): string {
  const businessContext = context.business_context;
  const insights = context.conversation_insights;
  
  // Build agent-specific context notes
  let agentNotes = "";
  
  // Add business context
  if (businessContext.profile?.full_name) {
    agentNotes += `Usuario: ${businessContext.profile.full_name}\n`;
  }
  
  // Add maturity context
  if (businessContext.maturity_scores) {
    const scores = businessContext.maturity_scores;
    agentNotes += `Madurez del negocio: Validación de idea (${scores.idea_validation}/10), UX (${scores.user_experience}/10), Market Fit (${scores.market_fit}/10), Monetización (${scores.monetization}/10)\n`;
  }
  
  // Add project context
  if (businessContext.projects?.length > 0) {
    agentNotes += `Proyectos activos: ${businessContext.projects.map((p: any) => p.title).join(', ')}\n`;
  }
  
  // Add task context
  if (businessContext.active_tasks?.length > 0) {
    const agentTasks = businessContext.active_tasks.filter((t: any) => t.agent_id === agentId);
    if (agentTasks.length > 0) {
      agentNotes += `Tareas activas en este agente: ${agentTasks.map((t: any) => t.title).join(', ')}\n`;
    }
  }
  
  // Add conversation insights relevant to this agent
  const agentInsights = Object.values(insights || {}).filter((insight: any) => 
    insight.agent_id === agentId || insight.agent_id === 'general'
  );
  
  if (agentInsights.length > 0) {
    agentNotes += `Insights previos: ${agentInsights.map((i: any) => i.insight).join('; ')}\n`;
  }
  
  return agentNotes;
}