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
  console.log('=== Master Prompt Generator Function Started ===');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, userId, language = 'es' } = await req.json();
    
    console.log(`🌐 Language parameter received: ${language}`);
    console.log('Generating master prompt for:', { agentId, userId, language });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call contexto-maestro function to get unified context
    const { data: contextResponse, error: contextError } = await supabase.functions.invoke('contexto-maestro', {
      body: { action: 'get', userId, agentId }
    });

    if (contextError) {
      console.error('Error getting master context:', contextError);
      throw contextError;
    }

    const masterContext = contextResponse.context;
    const agentNotes = contextResponse.agent_specific_notes;

    // Generate ultra-specific system prompt
    const systemPrompt = generateAgentSystemPrompt(agentId, masterContext, agentNotes, language);

    console.log('Generated master prompt for agent:', agentId);
    return new Response(JSON.stringify({ 
      success: true, 
      systemPrompt,
      contextVersion: masterContext.context_version,
      lastUpdated: masterContext.last_updated
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in master-prompt-generator function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateAgentSystemPrompt(agentId: string, context: any, agentNotes: string, language: string): string {
  const basePrompts: Record<string, any> = {
    'admin': {
      es: `Eres un asistente administrativo especializado que ayuda con la gestión y organización del negocio. Tu objetivo es optimizar procesos administrativos y proporcionar soporte en la gestión del sistema.`,
      en: `You are a specialized administrative assistant that helps with business management and organization. Your goal is to optimize administrative processes and provide system management support.`
    },
    'legal': {
      es: `Eres un asesor legal especializado en emprendimiento y negocios culturales. Proporcionas guidance legal práctica y accesible, siempre recomendando consultar con un abogado para casos específicos.`,
      en: `You are a legal advisor specialized in entrepreneurship and cultural businesses. You provide practical and accessible legal guidance, always recommending consultation with a lawyer for specific cases.`
    },
    'accounting': {
      es: `Eres un contador especializado en pequeñas empresas y emprendimientos culturales. Ayudas con finanzas, contabilidad básica, y planificación financiera de manera clara y práctica.`,
      en: `You are an accountant specialized in small businesses and cultural ventures. You help with finances, basic accounting, and financial planning in a clear and practical way.`
    },
    'operations': {
      es: `Eres un especialista en operaciones que ayuda a optimizar procesos de negocio, gestión de proyectos, y eficiencia operacional en emprendimientos culturales.`,
      en: `You are an operations specialist who helps optimize business processes, project management, and operational efficiency in cultural ventures.`
    },
    'cultural': {
      es: `Eres un experto en industrias culturales y creativas. Entiendes las particularidades del sector cultural, desde arte y artesanías hasta productos culturales innovadores.`,
      en: `You are an expert in cultural and creative industries. You understand the particularities of the cultural sector, from art and crafts to innovative cultural products.`
    }
  };

  const basePrompt = basePrompts[agentId]?.[language] || basePrompts['admin'][language];
  
  // Build comprehensive context section
  let contextSection = '';
  
  if (language === 'es') {
    contextSection = `

CONTEXTO ESPECÍFICO DEL USUARIO:
${agentNotes}

INFORMACIÓN ADICIONAL DEL NEGOCIO:
`;
  } else {
    contextSection = `

USER-SPECIFIC CONTEXT:
${agentNotes}

ADDITIONAL BUSINESS INFORMATION:
`;
  }

  // Add detailed business context
  const businessContext = context.business_context;
  
  if (businessContext.profile?.full_name) {
    contextSection += `- Usuario: ${businessContext.profile.full_name}\n`;
  }
  
  if (businessContext.projects?.length > 0) {
    const projectTitles = businessContext.projects.map((p: any) => p.title).join(', ');
    contextSection += language === 'es' ? 
      `- Proyectos: ${projectTitles}\n` :
      `- Projects: ${projectTitles}\n`;
  }
  
  if (businessContext.maturity_scores) {
    const scores = businessContext.maturity_scores;
    contextSection += language === 'es' ?
      `- Nivel de madurez: Idea (${scores.idea_validation}/10), UX (${scores.user_experience}/10), Market Fit (${scores.market_fit}/10), Monetización (${scores.monetization}/10)\n` :
      `- Maturity level: Idea (${scores.idea_validation}/10), UX (${scores.user_experience}/10), Market Fit (${scores.market_fit}/10), Monetization (${scores.monetization}/10)\n`;
  }

  // Add conversation insights
  const insights = context.conversation_insights;
  if (insights && Object.keys(insights).length > 0) {
    const recentInsights = Object.values(insights)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
      .map((insight: any) => insight.insight)
      .join('; ');
    
    contextSection += language === 'es' ?
      `- Insights de conversaciones previas: ${recentInsights}\n` :
      `- Previous conversation insights: ${recentInsights}\n`;
  }

  // Add behavioral instructions
  const behaviorSection = language === 'es' ? `

INSTRUCCIONES DE COMPORTAMIENTO:
- Utiliza TODA la información específica del usuario en tus respuestas
- Sé específico y personalizado, no genérico
- Referencia elementos concretos del negocio del usuario cuando sea relevante
- Mantén coherencia con información de conversaciones previas
- Si no tienes información suficiente sobre algo específico, pregunta para completar el contexto
- Adapta tus recomendaciones al nivel de madurez del negocio del usuario

ESTILO DE RESPUESTA:
- Profesional pero accesible
- Práctico y accionable
- Específico al contexto del usuario
- Coherente con el historial de interacciones
` : `

BEHAVIORAL INSTRUCTIONS:
- Use ALL user-specific information in your responses
- Be specific and personalized, not generic
- Reference concrete elements of the user's business when relevant
- Maintain coherence with information from previous conversations
- If you don't have enough information about something specific, ask to complete the context
- Adapt your recommendations to the user's business maturity level

RESPONSE STYLE:
- Professional but accessible
- Practical and actionable
- Specific to user context
- Coherent with interaction history
`;

  return basePrompt + contextSection + behaviorSection;
}