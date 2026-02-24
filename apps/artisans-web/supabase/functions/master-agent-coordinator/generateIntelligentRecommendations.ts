import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate intelligent task recommendations using AI
export async function generateIntelligentRecommendations(userId: string, maturityScores: any, language: string = 'en') {
  try {
    // Get user profile and completed tasks from Supabase
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: masterContext } = await supabase
      .from('master_context')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: completedTasks } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed');

    const { data: activeTasks } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'in_progress']);

    // Check if we have enough information to generate recommendations
    const hasMinimalInfo = maturityScores && (userProfile || masterContext?.business_profile);
    
    if (!hasMinimalInfo) {
      return new Response(
        JSON.stringify({ 
          needsMoreInfo: true,
          message: 'We need more information about your business to create personalized recommendations.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context for AI
    const businessContext = masterContext?.business_profile || {};
    const maturityAverage = Object.values(maturityScores).reduce((a: number, b: number) => a + b, 0) / 4;
    
    let maturityLevel = 'explorador';
    if (maturityAverage >= 80) maturityLevel = 'visionario';
    else if (maturityAverage >= 60) maturityLevel = 'estratega';
    else if (maturityAverage >= 40) maturityLevel = 'constructor';

    const prompt = `
You are an expert business consultant. Generate 3 highly personalized task recommendations for this entrepreneur.

USER INFORMATION:
Maturity Level: ${maturityLevel} (average: ${maturityAverage})
Detailed scores: ${JSON.stringify(maturityScores)}
Business profile: ${JSON.stringify(businessContext)}

COMPLETED TASKS (${completedTasks?.length || 0}):
${completedTasks?.map((task: any) => `- ${task.title} (${task.agent_id})`).join('\n') || 'None'}

ACTIVE TASKS (${activeTasks?.length || 0}):
${activeTasks?.map((task: any) => `- ${task.title} (${task.agent_id})`).join('\n') || 'None'}

INSTRUCTIONS:
1. Analyze the complete user context and avoid recommending tasks similar to already completed or active ones
2. Generate recommendations that are the logical next step in their business journey
3. Consider their maturity level to determine appropriate complexity
4. Each task must have a specific available agent
5. Tasks should be actionable and specific to their business context

AVAILABLE AGENTS:
- growth: Diagnóstico inicial, público objetivo, estrategia de crecimiento
- inventory: Gestión de productos, catálogo, creación de tienda
- digital-presence: Presencia online, configuración de tienda pública
- brand: Identidad visual, logo, colores, claim

⚠️ CRÍTICO: USA SOLO ESTOS AGENTES. No uses pricing, legal, marketing-specialist u otros agentes no disponibles.

Respond ONLY with a JSON array with exactly 3 recommendations:
[{
  "title": "Specific and actionable title",
  "description": "Detailed description of why it's important now",
  "agentId": "agent-id",
  "agentName": "Agent Name",
  "priority": "high|medium|low",
  "category": "Relevant category",
  "estimatedTime": "Estimated time",
  "prompt": "Specific prompt for the agent"
}]
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;
    
    // Clean up the response
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const recommendations = JSON.parse(aiResponse);

    // Transform recommendations to include IDs and proper format
    const transformedRecommendations = recommendations.map((rec: any) => ({
      id: `ai_rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: rec.title,
      description: rec.description,
      agentId: rec.agentId,
      agentName: rec.agentName,
      priority: rec.priority,
      category: rec.category,
      estimatedTime: rec.estimatedTime,
      prompt: rec.prompt,
      completed: false,
      isRealAgent: true
    }));

    return new Response(
      JSON.stringify({ recommendations: transformedRecommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating intelligent recommendations:', error);
    
    // Fallback to basic recommendations (SOLO AGENTES PERMITIDOS)
    const fallbackRecs = [{
      id: `fallback_${Date.now()}`,
      title: 'Validate Your Business Concept',
      description: 'Get expert validation on your business idea and market potential',
      agentId: 'growth', // FASE 2: Usar agente permitido
      agentName: 'Growth Agent',
      priority: 'high',
      category: 'Validation',
      estimatedTime: '2-3 hours',
      prompt: 'Help me validate my business concept',
      completed: false,
      isRealAgent: true
    }];

    return new Response(
      JSON.stringify({ recommendations: fallbackRecs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}