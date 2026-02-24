import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin (only admins can manage moderators)
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminUser) {
      console.error('User is not an admin:', user.email);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions - admin required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle GET request - list all moderators
    if (req.method === 'GET') {
      console.log('Fetching moderators list...');

      // Get moderators from user_roles
      const { data: moderatorRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .in('role', ['moderator', 'admin']);

      if (rolesError) {
        console.error('Error fetching user_roles:', rolesError);
      }

      // Get all admin users
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, is_active, created_at')
        .eq('is_active', true);

      if (adminError) {
        console.error('Error fetching admin_users:', adminError);
      }

      // Get user details for moderators in user_roles
      const userIds = (moderatorRoles || []).map(r => r.user_id);
      let userDetails: any[] = [];
      
      if (userIds.length > 0) {
        // Use service role to get auth.users data
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
        if (!usersError && users) {
          userDetails = users.filter(u => userIds.includes(u.id));
        }
      }

      // Combine data
      const moderators = [];

      // Add moderators from user_roles
      for (const role of (moderatorRoles || [])) {
        const userDetail = userDetails.find(u => u.id === role.user_id);
        if (userDetail) {
          moderators.push({
            id: role.user_id,
            email: userDetail.email,
            full_name: userDetail.user_metadata?.full_name || null,
            role: role.role,
            source: 'user_roles',
            created_at: role.created_at,
          });
        }
      }

      // Add admin users (avoid duplicates)
      for (const admin of (adminUsers || [])) {
        const existingMod = moderators.find(m => m.email === admin.email);
        if (!existingMod) {
          moderators.push({
            id: admin.id,
            email: admin.email,
            full_name: null,
            role: 'admin',
            source: 'admin_users',
            created_at: admin.created_at,
          });
        }
      }

      console.log(`Found ${moderators.length} moderators/admins`);

      return new Response(
        JSON.stringify({ success: true, moderators }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle POST request - add/remove moderator
    if (req.method === 'POST') {
      const body = await req.json();
      const { action, user_id, email } = body;

      console.log('Moderator action:', action, 'user_id:', user_id, 'email:', email);

      if (action === 'add') {
        // Find user by email if user_id not provided
        let targetUserId = user_id;
        
        if (!targetUserId && email) {
          const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );

          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
          const targetUser = users?.find(u => u.email === email);
          
          if (!targetUser) {
            return new Response(
              JSON.stringify({ error: 'Usuario no encontrado con ese email' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          targetUserId = targetUser.id;
        }

        if (!targetUserId) {
          return new Response(
            JSON.stringify({ error: 'Se requiere user_id o email' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if already has moderator/admin role
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', targetUserId)
          .in('role', ['moderator', 'admin'])
          .maybeSingle();

        if (existingRole) {
          return new Response(
            JSON.stringify({ error: 'El usuario ya tiene rol de moderador o admin' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Use service role to insert (bypass RLS)
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { error: insertError } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: targetUserId, role: 'moderator' });

        if (insertError) {
          console.error('Error inserting moderator role:', insertError);
          return new Response(
            JSON.stringify({ error: 'Error al agregar rol de moderador' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Moderator role added for user:', targetUserId);

        return new Response(
          JSON.stringify({ success: true, message: 'Rol de moderador agregado correctamente' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action === 'remove') {
        if (!user_id) {
          return new Response(
            JSON.stringify({ error: 'Se requiere user_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Use service role to delete (bypass RLS)
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { error: deleteError } = await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', user_id)
          .eq('role', 'moderator');

        if (deleteError) {
          console.error('Error removing moderator role:', deleteError);
          return new Response(
            JSON.stringify({ error: 'Error al revocar rol de moderador' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Moderator role removed for user:', user_id);

        return new Response(
          JSON.stringify({ success: true, message: 'Rol de moderador revocado correctamente' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Acción no válida' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
