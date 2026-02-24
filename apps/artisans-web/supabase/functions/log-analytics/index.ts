import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role to bypass RLS for analytics logging
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try to get authenticated user from auth header if present
    let userId = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      // Create a temporary client with auth header to verify user
      const authClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );
      
      const { data: { user }, error: authError } = await authClient.auth.getUser();
      
      if (!authError && user) {
        userId = user.id;
      }
    }

    const { event_type, event_data, session_id, success, duration_ms } = await req.json();

    if (!event_type) {
      return new Response(
        JSON.stringify({ error: 'event_type is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insertar evento de analytics (con o sin user_id)
    const insertData: any = {
      event_type,
      event_data: event_data || {},
      session_id,
      success: success ?? true,
      duration_ms,
    };

    // Solo agregar user_id si está autenticado
    if (userId) {
      insertData.user_id = userId;
    }

    const { data, error } = await supabaseClient
      .from('analytics_events')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting analytics event:', error);
      throw error;
    }

    console.log(`Analytics event logged: ${event_type}${userId ? ` for user ${userId}` : ' (anonymous)'}`);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in log-analytics function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});