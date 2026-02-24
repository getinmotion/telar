import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuario no autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin or moderator
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const { data: adminUsers } = await supabaseClient
      .from('admin_users')
      .select('email')
      .eq('email', user.email)
      .eq('is_active', true);

    const isModerator = userRoles?.some(r => r.role === 'moderator' || r.role === 'admin');
    const isAdmin = adminUsers && adminUsers.length > 0;

    if (!isModerator && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'No tienes permisos para esta acción' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { shopId, newLogoUrl } = await req.json();

    if (!shopId || !newLogoUrl) {
      return new Response(
        JSON.stringify({ error: 'shopId y newLogoUrl son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current shop data
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: shop, error: shopError } = await serviceClient
      .from('artisan_shops')
      .select('logo_url, user_id, shop_name')
      .eq('id', shopId)
      .single();

    if (shopError || !shop) {
      return new Response(
        JSON.stringify({ error: 'Tienda no encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const previousLogoUrl = shop.logo_url;

    // Update shop logo
    const { error: updateError } = await serviceClient
      .from('artisan_shops')
      .update({ 
        logo_url: newLogoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', shopId);

    if (updateError) {
      console.error('Error updating shop logo:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error al actualizar el logo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user_master_context if exists
    const { data: masterContext } = await serviceClient
      .from('user_master_context')
      .select('conversation_insights')
      .eq('user_id', shop.user_id)
      .single();

    if (masterContext?.conversation_insights) {
      const insights = masterContext.conversation_insights as any;
      if (insights.brand_evaluation) {
        insights.brand_evaluation.logo_url = newLogoUrl;
        insights.brand_evaluation.hasLogo = true;
        
        await serviceClient
          .from('user_master_context')
          .update({ 
            conversation_insights: insights,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', shop.user_id);
      }
    }

    // Log in admin_audit_log
    await serviceClient
      .from('admin_audit_log')
      .insert({
        admin_user_id: user.id,
        action: 'update_shop_logo',
        resource_type: 'shop',
        resource_id: shopId,
        details: {
          shop_name: shop.shop_name,
          previous_logo_url: previousLogoUrl,
          new_logo_url: newLogoUrl,
          updated_by: user.email
        }
      });

    // Create notification for artisan
    await serviceClient
      .from('notifications')
      .insert({
        user_id: shop.user_id,
        type: 'shop_logo_updated',
        title: 'Logo actualizado',
        message: `El logo de tu tienda "${shop.shop_name}" ha sido actualizado por el equipo de moderación.`,
        metadata: { shop_id: shopId }
      });

    console.log(`Logo updated for shop ${shopId} by ${user.email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Logo actualizado exitosamente',
        newLogoUrl 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-shop-logo-admin:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
