import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, questions, profileData, language } = await req.json();
    
    console.log('🧠 Processing deep insights for user...');
    console.log('Answers received:', Object.keys(answers).length);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    console.log('Processing insights for user:', user.id);

    // Prepare context for AI
    const conversationContext = questions.map((q: any, index: number) => {
      return {
        question: q.question,
        answer: answers[q.id] || '',
        context: q.context || ''
      };
    }).filter((item: any) => item.answer.trim() !== '');

    console.log('Conversation context items:', conversationContext.length);

    // Call Lovable AI to extract structured insights
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.warn('⚠️ LOVABLE_API_KEY not configured, skipping AI processing');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'AI processing not available' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = language === 'es' 
      ? `Eres un analista experto en negocios artesanales y creativos. Tu tarea es extraer insights clave de las respuestas profundas del artesano para ayudar a crear un perfil detallado.

Analiza las respuestas y extrae información estructurada sobre:
1. Motivaciones principales y objetivos de negocio
2. Desafíos específicos que enfrenta
3. Recursos disponibles (tiempo, capital, equipo)
4. Experiencia y habilidades clave
5. Visión a largo plazo
6. Mercado objetivo y clientes ideales
7. Propuesta de valor única
8. Necesidades inmediatas de apoyo

Responde SOLO con un objeto JSON válido sin texto adicional.`
      : `You are an expert analyst in artisan and creative businesses. Your task is to extract key insights from the artisan's deep responses to help create a detailed profile.

Analyze the responses and extract structured information about:
1. Main motivations and business goals
2. Specific challenges faced
3. Available resources (time, capital, team)
4. Key experience and skills
5. Long-term vision
6. Target market and ideal customers
7. Unique value proposition
8. Immediate support needs

Respond ONLY with a valid JSON object without additional text.`;

    const userPrompt = conversationContext.map((item: any) => 
      `Pregunta: ${item.question}\nRespuesta: ${item.answer}`
    ).join('\n\n');

    console.log('🤖 Calling Lovable AI for insight extraction...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_artisan_insights",
              description: "Extract structured insights from artisan's responses",
              parameters: {
                type: "object",
                properties: {
                  motivations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Main motivations and goals"
                  },
                  challenges: {
                    type: "array",
                    items: { type: "string" },
                    description: "Current challenges and obstacles"
                  },
                  resources: {
                    type: "object",
                    properties: {
                      timeAvailable: { type: "string" },
                      financialCapacity: { type: "string" },
                      teamSize: { type: "string" }
                    }
                  },
                  skills: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key skills and expertise"
                  },
                  vision: { type: "string", description: "Long-term vision" },
                  targetMarket: { type: "string", description: "Target market description" },
                  valueProposition: { type: "string", description: "Unique value proposition" },
                  immediateNeeds: {
                    type: "array",
                    items: { type: "string" },
                    description: "Immediate support needs"
                  },
                  businessType: { type: "string", description: "Type of artisan business" },
                  experienceLevel: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                  growthPotential: { type: "string", enum: ["low", "medium", "high"] }
                },
                required: ["motivations", "challenges", "skills", "immediateNeeds"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_artisan_insights" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('✅ AI response received');

    // Extract insights from tool call
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    let insights = {};
    
    if (toolCall && toolCall.function.name === 'extract_artisan_insights') {
      insights = JSON.parse(toolCall.function.arguments);
      console.log('📊 Extracted insights:', insights);
    } else {
      console.warn('⚠️ No tool call in AI response, using fallback');
      insights = {
        motivations: ["Information not extracted"],
        challenges: ["Information not extracted"],
        skills: ["Information not extracted"],
        immediateNeeds: ["Information not extracted"]
      };
    }

    // Save insights to conversation_insights table
    const { error: saveError } = await supabase
      .from('conversation_insights')
      .upsert({
        user_id: user.id,
        insight_type: 'deep_analysis',
        insight_data: {
          raw_answers: conversationContext,
          extracted_insights: insights,
          profile_context: {
            craftType: profileData.productType || profileData.industry,
            businessStage: profileData.yearsInBusiness || 'unknown'
          }
        },
        created_at: new Date().toISOString()
      });

    if (saveError) {
      console.error('Error saving insights:', saveError);
      throw saveError;
    }

    console.log('✅ Insights saved to database');

    // Also update user_master_context with condensed insights
    const { error: contextError } = await supabase
      .from('user_master_context')
      .upsert({
        user_id: user.id,
        business_context: {
          deep_insights: {
            motivations: insights.motivations || [],
            challenges: insights.challenges || [],
            skills: insights.skills || [],
            vision: insights.vision || '',
            targetMarket: insights.targetMarket || '',
            immediateNeeds: insights.immediateNeeds || [],
            experienceLevel: insights.experienceLevel || 'intermediate',
            growthPotential: insights.growthPotential || 'medium',
            lastUpdated: new Date().toISOString()
          }
        },
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (contextError) {
      console.error('Error updating master context:', contextError);
    } else {
      console.log('✅ Master context updated');
    }

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        message: 'Insights processed and saved successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing deep insights:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
