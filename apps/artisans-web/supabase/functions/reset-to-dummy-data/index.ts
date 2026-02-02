import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔥 INICIANDO RESET TOTAL A DUMMY DATA');

    // Authenticate admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Client for checking admin status
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'No authenticated user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin status
    const { data: adminCheck } = await supabaseAdmin
      .from('admin_users')
      .select('email')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Admin verified:', user.email);

    // ========== PHASE 1: DELETE ALL DATA ==========
    console.log('\n🗑️ PHASE 1: Deleting all data...');

    // Delete in correct order (children first, then parents)
    const tablesToClean = [
      'cart_items',
      'artisan_analytics', 
      'store_embeddings',
      'bom',
      'inventory_movements',
      'product_reviews',
      'product_variants',
      'products',
      'artisan_shops'
    ];

    const deletionResults: Record<string, number> = {};

    for (const table of tablesToClean) {
      console.log(`  Deleting from ${table}...`);
      const { error, count } = await supabaseAdmin
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (error) {
        console.error(`  ❌ Error deleting from ${table}:`, error);
      } else {
        deletionResults[table] = count || 0;
        console.log(`  ✅ Deleted ${count || 0} rows from ${table}`);
      }
    }

    // Verify shops and products are empty
    const { count: shopsCount } = await supabaseAdmin
      .from('artisan_shops')
      .select('*', { count: 'exact', head: true });
    
    const { count: productsCount } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log(`  📊 Verification: ${shopsCount || 0} shops, ${productsCount || 0} products remaining`);

    // ========== PHASE 2: DELETE ALL USERS EXCEPT ADMIN ==========
    console.log('\n👤 PHASE 2: Deleting all users except admin...');

    const adminEmails = ['manuel@getinmotion.io'];
    
    // List all users
    const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      throw listError;
    }

    console.log(`  Found ${allUsers.users.length} total users`);

    let deletedUsersCount = 0;
    const userRelatedTables = [
      'user_profiles',
      'user_master_context',
      'master_coordinator_context',
      'agent_tasks',
      'agent_conversations',
      'agent_chat_conversations',
      'agent_deliverables',
      'brand_diagnosis_history',
      'brand_themes',
      'artisan_official_classifications',
      'conversation_insights',
      'task_generation_history',
      'user_achievements',
      'user_agents',
      'user_behavior_analytics',
      'user_chat_context',
      'user_learning_patterns',
      'milestone_progress_history',
      'task_routing_analytics',
      'agent_usage_metrics',
      'artisan_global_profiles'
    ];

    for (const user of allUsers.users) {
      if (adminEmails.includes(user.email || '')) {
        console.log(`  ⏭️  Skipping admin user: ${user.email}`);
        continue;
      }

      console.log(`  🗑️  Deleting user: ${user.email}`);

      // Delete from all user-related tables
      for (const table of userRelatedTables) {
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', user.id);
        
        if (error && !error.message.includes('does not exist')) {
          console.error(`    ⚠️  Error deleting from ${table}:`, error.message);
        }
      }

      // Delete the auth user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error(`    ❌ Error deleting user ${user.email}:`, deleteError);
      } else {
        deletedUsersCount++;
        console.log(`    ✅ Deleted user ${user.email}`);
      }
    }

    console.log(`  📊 Deleted ${deletedUsersCount} users`);

    // Verify only admin remains
    const { data: remainingUsers } = await supabaseAdmin.auth.admin.listUsers();
    console.log(`  📊 Verification: ${remainingUsers?.users.length || 0} users remaining`);

    // ========== PHASE 3: CREATE DUMMY USERS ==========
    console.log('\n🎭 PHASE 3: Creating 10 dummy users...');

    const dummyPassword = 'Dummy123!';
    const craftTypes = [
      'Cerámica', 'Tejido', 'Joyería', 'Madera', 'Cuero',
      'Vidrio', 'Metal', 'Textiles', 'Papel', 'Piedra'
    ];

    const createdDummies = [];

    for (let i = 1; i <= 10; i++) {
      const email = `dummy${i}@telar.app`;
      const craftType = craftTypes[i - 1];
      const shopName = `Taller ${craftType} ${i}`;

      console.log(`  Creating dummy ${i}: ${email}...`);

      try {
        // Create auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: dummyPassword,
          email_confirm: true,
        });

        if (authError) {
          console.error(`    ❌ Error creating auth user:`, authError);
          continue;
        }

        console.log(`    ✅ Auth user created: ${authUser.user.id}`);

        // Create user profile
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            user_id: authUser.user.id,
            full_name: `Artesano ${i}`,
            user_type: 'artisan',
            phone: `+569${String(i).padStart(8, '0')}`,
          });

        if (profileError) {
          console.error(`    ❌ Error creating profile:`, profileError);
        }

        // Create shop
        const { data: shop, error: shopError } = await supabaseAdmin
          .from('artisan_shops')
          .insert({
            user_id: authUser.user.id,
            shop_name: shopName,
            shop_slug: `taller-${craftType.toLowerCase()}-${i}`,
            craft_type: craftType,
            description: `Taller artesanal de ${craftType} con más de ${i * 5} años de experiencia. Productos únicos y hechos a mano.`,
            active: true,
            banner_url: `https://picsum.photos/seed/${i}/1200/400`,
            logo_url: `https://picsum.photos/seed/logo${i}/200/200`,
            region: i % 2 === 0 ? 'Región Metropolitana' : 'Valparaíso',
            hero_config: {
              slides: [{
                title: `Bienvenido a ${shopName}`,
                subtitle: `Artesanía en ${craftType}`,
                imageUrl: `https://picsum.photos/seed/hero${i}/1200/600`,
                ctaText: 'Ver Productos',
                ctaLink: '/productos'
              }],
              autoplay: true,
              duration: 5000
            },
            contact_config: {
              email: email,
              phone: `+569${String(i).padStart(8, '0')}`,
              whatsapp: `+569${String(i).padStart(8, '0')}`
            },
            seo_data: {
              title: shopName,
              description: `Taller artesanal de ${craftType}`,
              keywords: [craftType, 'artesanía', 'hecho a mano']
            }
          })
          .select()
          .single();

        if (shopError) {
          console.error(`    ❌ Error creating shop:`, shopError);
          continue;
        }

        console.log(`    ✅ Shop created: ${shop.id}`);

        // Create 10 products per shop
        const products = [];
        for (let p = 1; p <= 10; p++) {
          products.push({
            shop_id: shop.id,
            name: `${craftType} Artesanal ${p}`,
            description: `Producto ${p} de ${craftType} hecho completamente a mano con técnicas tradicionales. Pieza única e irrepetible.`,
            short_description: `${craftType} hecho a mano, pieza única`,
            price: Math.floor(Math.random() * 50000) + 10000,
            compare_price: Math.floor(Math.random() * 70000) + 20000,
            inventory: Math.floor(Math.random() * 20) + 5,
            active: true,
            featured: p <= 3,
            category: craftType,
            images: [
              `https://picsum.photos/seed/prod${i}${p}/800/800`,
              `https://picsum.photos/seed/prod${i}${p}b/800/800`
            ],
            tags: [craftType, 'hecho a mano', 'artesanía'],
            materials: [`Material ${p}`],
            techniques: [`Técnica ${p}`],
            lead_time_days: Math.floor(Math.random() * 7) + 1,
            seo_data: {
              title: `${craftType} Artesanal ${p}`,
              description: `Producto de ${craftType} hecho a mano`,
              keywords: [craftType, 'artesanía']
            }
          });
        }

        const { error: productsError } = await supabaseAdmin
          .from('products')
          .insert(products);

        if (productsError) {
          console.error(`    ❌ Error creating products:`, productsError);
        } else {
          console.log(`    ✅ Created 10 products for shop ${i}`);
        }

        // Create initial tasks
        const tasks = [
          {
            user_id: authUser.user.id,
            agent_id: 'growth',
            title: 'Completa tu Análisis Profundo',
            description: 'Responde el cuestionario completo para obtener recomendaciones personalizadas',
            status: 'pending',
            priority: 5,
            relevance: 'high',
            milestone_category: 'milestone_formalization',
            environment: 'production'
          },
          {
            user_id: authUser.user.id,
            agent_id: 'digital-presence',
            title: 'Configura tu Hero Slider',
            description: 'Crea slides atractivas para la página principal de tu tienda',
            status: 'pending',
            priority: 4,
            relevance: 'medium',
            milestone_category: 'milestone_shop',
            environment: 'production'
          },
          {
            user_id: authUser.user.id,
            agent_id: 'brand',
            title: 'Evalúa tu Identidad de Marca',
            description: 'Revisa tu logo, colores y mensaje de marca',
            status: 'pending',
            priority: 3,
            relevance: 'medium',
            milestone_category: 'milestone_brand',
            environment: 'production'
          }
        ];

        const { error: tasksError } = await supabaseAdmin
          .from('agent_tasks')
          .insert(tasks);

        if (tasksError) {
          console.error(`    ❌ Error creating tasks:`, tasksError);
        } else {
          console.log(`    ✅ Created 3 initial tasks`);
        }

        createdDummies.push({
          email,
          userId: authUser.user.id,
          shopId: shop.id,
          shopName,
          craftType
        });

        console.log(`  ✅ Dummy ${i} created successfully\n`);

      } catch (error) {
        console.error(`  ❌ Error creating dummy ${i}:`, error);
      }
    }

    // ========== PHASE 4: FINAL VERIFICATION ==========
    console.log('\n📊 PHASE 4: Final verification...');

    const { data: finalUsers } = await supabaseAdmin.auth.admin.listUsers();
    const { count: finalShops } = await supabaseAdmin
      .from('artisan_shops')
      .select('*', { count: 'exact', head: true });
    const { count: finalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    const summary = {
      success: true,
      phase1_deletion: deletionResults,
      phase2_users_deleted: deletedUsersCount,
      phase3_dummies_created: createdDummies.length,
      final_verification: {
        total_users: finalUsers?.users.length || 0,
        user_emails: finalUsers?.users.map(u => u.email) || [],
        total_shops: finalShops || 0,
        total_products: finalProducts || 0
      },
      created_dummies: createdDummies,
      password: dummyPassword
    };

    console.log('\n✅ RESET COMPLETED SUCCESSFULLY');
    console.log('📊 Final state:', JSON.stringify(summary.final_verification, null, 2));

    return new Response(
      JSON.stringify(summary),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
