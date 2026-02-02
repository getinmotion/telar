import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest {
  waitlistId: string;
  action: 'approve' | 'reject';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated and is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: isAdminData, error: adminError } = await supabaseClient.rpc('is_admin');
    if (adminError || !isAdminData) {
      console.error('Admin check error:', adminError);
      return new Response(
        JSON.stringify({ error: 'Permisos insuficientes' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { waitlistId, action }: ApprovalRequest = await req.json();

    if (!waitlistId || !action) {
      return new Response(
        JSON.stringify({ error: 'waitlistId y action son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get waitlist entry
    const { data: waitlistEntry, error: fetchError } = await supabaseClient
      .from('waitlist')
      .select('*')
      .eq('id', waitlistId)
      .single();

    if (fetchError || !waitlistEntry) {
      console.error('Error fetching waitlist entry:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Entrada de lista de espera no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (waitlistEntry.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Esta entrada ya ha sido procesada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'approve') {
      // Create user account using service role key
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Generate temporary password
      const tempPassword = crypto.randomUUID().substring(0, 12) + 'Temp!';

      // Create auth user
      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: waitlistEntry.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: waitlistEntry.full_name,
          role: waitlistEntry.role || 'user',
          city: waitlistEntry.city,
          country: waitlistEntry.country,
          sector: waitlistEntry.sector
        }
      });

      if (createUserError || !newUser.user) {
        console.error('Error creating user:', createUserError);
        return new Response(
          JSON.stringify({ error: 'Error al crear la cuenta de usuario' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create user profile
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: newUser.user.id,
          full_name: waitlistEntry.full_name,
          business_location: waitlistEntry.city,
          language_preference: waitlistEntry.language || 'es',
          user_type: 'regular'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Clean up auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return new Response(
          JSON.stringify({ error: 'Error al crear el perfil de usuario' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`User approved and created: ${waitlistEntry.email}`);
    }

    // Update waitlist status
    const { error: updateError } = await supabaseClient
      .from('waitlist')
      .update({ 
        status: action === 'approve' ? 'approved' : 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', waitlistId);

    if (updateError) {
      console.error('Error updating waitlist status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error al actualizar el estado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: action === 'approve' 
          ? 'Usuario aprobado y cuenta creada exitosamente' 
          : 'Usuario rechazado'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in approve-waitlist-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});