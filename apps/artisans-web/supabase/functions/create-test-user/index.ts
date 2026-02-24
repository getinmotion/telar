import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestUserRequest {
  email?: string;
  password?: string;
  businessName?: string;
  craftType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await req.json() as TestUserRequest;
    
    // Default test user data
    const email = body.email || `test.${Date.now()}@telar.test`;
    const password = body.password || 'TestUser123!';
    const businessName = body.businessName || 'Cerámica Artesanal Luna';
    const craftType = body.craftType || 'Cerámica';
    
    console.log('Creating test user:', email);

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for testing
      user_metadata: {
        full_name: 'Usuario de Prueba',
      }
    });

    if (authError || !authData.user) {
      throw new Error(`Auth error: ${authError?.message}`);
    }

    const userId = authData.user.id;
    console.log('User created:', userId);

    // 2. Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: userId,
        full_name: 'Usuario de Prueba',
        rut: '12345678-9',
        department: 'Cundinamarca',
        city: 'Bogotá',
        whatsapp: '+573001234567',
        terms_accepted: true,
        user_type: 'artisan'
      });

    if (profileError) throw new Error(`Profile error: ${profileError.message}`);

    // 3. Create maturity scores (completed test)
    const { error: scoresError } = await supabaseAdmin
      .from('user_maturity_scores')
      .insert({
        user_id: userId,
        idea_validation: 65,
        user_experience: 45,
        market_fit: 55,
        monetization: 40,
        profile_data: {
          testCompletedAt: new Date().toISOString(),
          testVersion: 'v2.0'
        }
      });

    if (scoresError) throw new Error(`Scores error: ${scoresError.message}`);

    // 4. Create master context with business data
    const { error: contextError } = await supabaseAdmin
      .from('user_master_context')
      .insert({
        user_id: userId,
        business_profile: {
          business_name: businessName,
          craft_type: craftType,
          city: 'Bogotá',
          description: `Emprendimiento de ${craftType.toLowerCase()} con técnicas tradicionales y diseño contemporáneo.`,
          years_in_business: 2,
          business_stage: 'early'
        },
        task_generation_context: {
          maturityScores: {
            ideaValidation: 65,
            userExperience: 45,
            marketFit: 55,
            monetization: 40
          },
          maturity_test_progress: {
            total_questions: 12,
            total_answered: 12,
            completion_percentage: 100
          },
          lastUpdated: new Date().toISOString()
        },
        conversation_insights: {
          nombre_marca: businessName,
          tipo_artesania: craftType,
          ubicacion: 'Bogotá, Colombia',
          anos_experiencia: '2 años',
          etapa_negocio: 'Crecimiento inicial',
          canales_actuales: ['Instagram', 'WhatsApp'],
          cliente_ideal: 'Personas que valoran lo hecho a mano',
          desafio_principal: 'Aumentar visibilidad online'
        },
        goals_and_objectives: {
          short_term: ['Mejorar presencia digital', 'Organizar inventario'],
          long_term: ['Expandir línea de productos', 'Crear tienda online']
        }
      });

    if (contextError) throw new Error(`Context error: ${contextError.message}`);

    // 5. Create user progress
    const { error: progressError } = await supabaseAdmin
      .from('user_progress')
      .insert({
        user_id: userId,
        level: 1,
        experience_points: 0,
        next_level_xp: 100,
        completed_missions: 0,
        current_streak: 0,
        longest_streak: 0,
        total_time_spent: 0
      });

    if (progressError) throw new Error(`Progress error: ${progressError.message}`);

    // 6. Create initial tasks (3 example tasks)
    const tasks = [
      {
        user_id: userId,
        agent_id: 'digital-presence',
        title: `Define la identidad visual de ${businessName}`,
        description: 'Crea un logo, paleta de colores y claim que representen tu marca artesanal.',
        status: 'pending',
        priority: 5,
        relevance: 'high',
        milestone_category: 'milestone_brand',
        deliverable_type: 'brand_identity',
        environment: 'production'
      },
      {
        user_id: userId,
        agent_id: 'inventory',
        title: 'Organiza tu catálogo de productos',
        description: 'Registra tus productos artesanales con fotos, descripciones y precios.',
        status: 'pending',
        priority: 4,
        relevance: 'high',
        milestone_category: 'milestone_shop',
        deliverable_type: 'product_catalog',
        environment: 'production'
      },
      {
        user_id: userId,
        agent_id: 'pricing',
        title: 'Define tu estrategia de precios',
        description: 'Calcula costos y establece precios competitivos para tus productos artesanales.',
        status: 'pending',
        priority: 3,
        relevance: 'medium',
        milestone_category: 'milestone_sales',
        deliverable_type: 'pricing_strategy',
        environment: 'production'
      }
    ];

    const { error: tasksError } = await supabaseAdmin
      .from('agent_tasks')
      .insert(tasks);

    if (tasksError) throw new Error(`Tasks error: ${tasksError.message}`);

    console.log('Test user created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email,
          password, // Return password for testing purposes only
          businessName,
          craftType
        },
        message: 'Usuario de prueba creado exitosamente',
        credentials: {
          email,
          password
        },
        data: {
          maturityScores: {
            ideaValidation: 65,
            userExperience: 45,
            marketFit: 55,
            monetization: 40
          },
          tasksCreated: tasks.length,
          testCompleted: true
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error creating test user:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error desconocido',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
