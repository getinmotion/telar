import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗑️ [DELETE-DUMMY-USERS] Starting deletion process...');

    // Create Supabase admin client
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

    // Step 1: Get all dummy user IDs from auth.users
    const { data: dummyAuthUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listing users:', authError);
      throw new Error(`Failed to list users: ${authError.message}`);
    }

    const dummyUsers = dummyAuthUsers.users.filter(user => 
      user.email?.includes('dummy') && user.email?.includes('@telar.app')
    );

    console.log(`📋 Found ${dummyUsers.length} dummy users to delete`);

    if (dummyUsers.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No dummy users found',
          deleted: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dummyUserIds = dummyUsers.map(u => u.id);
    const deletedUsers: string[] = [];
    const errors: any[] = [];

    // Step 2: Delete data from public schema tables (cascading will handle related data)
    for (const userId of dummyUserIds) {
      const userEmail = dummyUsers.find(u => u.id === userId)?.email || 'unknown';
      console.log(`🗑️ Deleting data for user: ${userEmail} (${userId})`);

      try {
        // Delete user profile (will cascade to related data)
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('user_id', userId);

        if (profileError) {
          console.error(`❌ Error deleting profile for ${userEmail}:`, profileError);
          errors.push({ userId, email: userEmail, error: profileError.message });
          continue;
        }

        // Delete user shops (will cascade to products, analytics, etc.)
        const { error: shopsError } = await supabaseAdmin
          .from('artisan_shops')
          .delete()
          .eq('user_id', userId);

        if (shopsError) {
          console.error(`❌ Error deleting shops for ${userEmail}:`, shopsError);
          errors.push({ userId, email: userEmail, error: shopsError.message });
          continue;
        }

        // Delete agent tasks
        const { error: tasksError } = await supabaseAdmin
          .from('agent_tasks')
          .delete()
          .eq('user_id', userId);

        if (tasksError) {
          console.error(`❌ Error deleting tasks for ${userEmail}:`, tasksError);
          errors.push({ userId, email: userEmail, error: tasksError.message });
          continue;
        }

        // Delete agent conversations
        const { error: conversationsError } = await supabaseAdmin
          .from('agent_conversations')
          .delete()
          .eq('user_id', userId);

        if (conversationsError) {
          console.error(`❌ Error deleting conversations for ${userEmail}:`, conversationsError);
          errors.push({ userId, email: userEmail, error: conversationsError.message });
          continue;
        }

        // Delete user from auth.users
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteAuthError) {
          console.error(`❌ Error deleting auth user ${userEmail}:`, deleteAuthError);
          errors.push({ userId, email: userEmail, error: deleteAuthError.message });
          continue;
        }

        console.log(`✅ Successfully deleted user: ${userEmail}`);
        deletedUsers.push(userEmail);

      } catch (error: any) {
        console.error(`❌ Unexpected error deleting user ${userEmail}:`, error);
        errors.push({ userId, email: userEmail, error: error.message });
      }
    }

    // Step 3: Verify cleanup
    const { count: remainingShops } = await supabaseAdmin
      .from('artisan_shops')
      .select('*', { count: 'exact', head: true })
      .in('user_id', dummyUserIds);

    const { count: remainingProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .in('shop_id', await supabaseAdmin
        .from('artisan_shops')
        .select('id')
        .in('user_id', dummyUserIds)
        .then(r => r.data?.map(s => s.id) || [])
      );

    console.log('📊 Final verification:');
    console.log(`  - Deleted users: ${deletedUsers.length}`);
    console.log(`  - Failed deletions: ${errors.length}`);
    console.log(`  - Remaining dummy shops: ${remainingShops || 0}`);
    console.log(`  - Remaining dummy products: ${remainingProducts || 0}`);

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        message: `Deleted ${deletedUsers.length} dummy users`,
        deleted: deletedUsers.length,
        deletedUsers,
        errors,
        verification: {
          remainingShops: remainingShops || 0,
          remainingProducts: remainingProducts || 0
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: errors.length === 0 ? 200 : 207 // 207 Multi-Status if partial success
      }
    );

  } catch (error: any) {
    console.error('❌ [DELETE-DUMMY-USERS] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
