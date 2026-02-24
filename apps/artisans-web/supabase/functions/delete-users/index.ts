import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Delete users function called, method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if Authorization header exists
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('Verifying user authentication...');
    
    // Verify user is authenticated and is admin - pass token directly
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    console.log('User check result:', { userId: user?.id, email: user?.email, hasError: !!userError });
    
    if (userError) {
      console.error('User authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: userError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!user || !user.email) {
      console.error('No user found or email missing');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - no user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking admin status for user:', user.id, user.email);
    
    // Create admin client to check admin status
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user is admin by querying admin_users table directly
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('is_active')
      .eq('email', user.email)
      .maybeSingle();
    
    console.log('Admin check result:', { adminData, hasError: !!adminError });
    
    if (adminError) {
      console.error('Admin check error:', adminError);
      return new Response(
        JSON.stringify({ error: 'Admin verification failed', details: adminError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!adminData || !adminData.is_active) {
      console.error('User is not admin or not active:', { adminData });
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin verified, parsing request body...');
    
    // Parse request body
    const { emails } = await req.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      console.error('Invalid emails array:', emails);
      return new Response(
        JSON.stringify({ error: 'emails array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Deleting users:', emails);

    // supabaseAdmin already created above for admin verification
    const deletedUsers = [];
    const errors = [];

    // Delete each user
    for (const email of emails) {
      try {
        console.log('Processing email:', email);
        
        // Get user by email
        const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (getUserError) {
          console.error('Error listing users:', getUserError);
          errors.push({ email, error: getUserError.message });
          continue;
        }

        const userToDelete = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        
        if (!userToDelete) {
          console.log('User not found:', email);
          errors.push({ email, error: 'User not found' });
          continue;
        }

        console.log('Cleaning up related data for user:', userToDelete.id);
        
        // Step 1: Deactivate user's shop (preserve data but hide from marketplace)
        const { error: shopError } = await supabaseAdmin
          .from('artisan_shops')
          .update({ active: false, updated_at: new Date().toISOString() })
          .eq('user_id', userToDelete.id);

        if (shopError) {
          console.warn('Error deactivating shop:', shopError);
        } else {
          console.log('Shop deactivated successfully');
        }

        // Step 2: Delete related user data from other tables
        const relatedTables = [
          'user_profiles',
          'user_master_context',
          'agent_tasks',
          'agent_conversations',
          'agent_chat_conversations',
          'agent_deliverables',
          'brand_diagnosis_history',
          'artisan_official_classifications',
          'conversation_insights',
          'task_generation_history',
          'user_achievements',
          'user_agents'
        ];

        let cleanedTables = 0;
        for (const table of relatedTables) {
          const { error, count } = await supabaseAdmin
            .from(table)
            .delete()
            .eq('user_id', userToDelete.id);
          
          if (error) {
            console.warn(`Error cleaning ${table}:`, error.message);
          } else {
            cleanedTables++;
            console.log(`Cleaned ${table} (${count || 0} records)`);
          }
        }

        console.log(`Cleaned ${cleanedTables}/${relatedTables.length} related tables`);
        
        // Step 3: Now delete the user from auth
        console.log('Deleting user from auth.users:', userToDelete.id);
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);
        
        if (deleteError) {
          console.error('Error deleting user:', deleteError);
          errors.push({ email, error: deleteError.message });
        } else {
          console.log('Successfully deleted user:', email);
          deletedUsers.push({ email, id: userToDelete.id });
        }
      } catch (error) {
        console.error('Exception deleting user:', email, error);
        errors.push({ email, error: error.message });
      }
    }

    console.log('Deletion complete. Deleted:', deletedUsers.length, 'Errors:', errors.length);

    return new Response(
      JSON.stringify({ 
        success: true,
        deletedUsers,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully deleted ${deletedUsers.length} user(s)${errors.length > 0 ? `, ${errors.length} error(s)` : ''}`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in delete-users function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});