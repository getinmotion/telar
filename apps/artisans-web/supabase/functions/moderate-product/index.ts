import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ModerationRequest {
  productId: string;
  action: 'approve' | 'approve_with_edits' | 'request_changes' | 'reject';
  comment?: string;
  edits?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is moderator or admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'moderator']);

    let isAuthorized = roles && roles.length > 0;

    if (!isAuthorized) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', user.email)
        .eq('is_active', true)
        .maybeSingle();
      
      isAuthorized = !!adminUser;
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized - not a moderator" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ModerationRequest = await req.json();
    const { productId, action, comment, edits } = body;

    console.log(`[moderate-product] Action: ${action} for product: ${productId}`);
    if (edits) {
      console.log(`[moderate-product] Edits:`, JSON.stringify(edits));
    }

    // Get current product info
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*, artisan_shops!inner(user_id, shop_name)')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const previousStatus = product.moderation_status;
    let newStatus: string;
    let shouldPublish = false;

    // Determine new status based on action
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        shouldPublish = true;
        break;
      case 'approve_with_edits':
        newStatus = 'approved_with_edits';
        shouldPublish = true;
        break;
      case 'request_changes':
        newStatus = 'changes_requested';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Build update data with all editable fields
    const updateData: Record<string, any> = {
      moderation_status: newStatus,
      active: shouldPublish,
      updated_at: new Date().toISOString(),
    };

    // Apply edits if provided
    if (edits && (action === 'approve_with_edits' || action === 'approve')) {
      // Map of allowed editable fields
      const allowedFields = [
        'name',
        'description',
        'short_description',
        'price',
        'compare_price',
        'category',
        'subcategory',
        'images',
        'tags',
        'materials',
        'techniques',
        'inventory',
        'sku',
        'active',
        'featured',
        'weight',
        'dimensions',
      ];

      for (const field of allowedFields) {
        if (edits[field] !== undefined) {
          updateData[field] = edits[field];
        }
      }

      // Auto-calculate shipping_data_complete
      const weight = edits.weight ?? product.weight;
      const dimensions = edits.dimensions ?? product.dimensions;
      
      const shippingComplete = (
        weight != null && weight > 0 &&
        dimensions != null &&
        dimensions.length > 0 &&
        dimensions.width > 0 &&
        dimensions.height > 0
      );
      
      updateData.shipping_data_complete = shippingComplete;
    }

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId);

    if (updateError) {
      console.error('[moderate-product] Update error:', updateError);
      return new Response(JSON.stringify({ error: "Failed to update product" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create moderation history entry
    const { error: historyError } = await supabase
      .from('product_moderation_history')
      .insert({
        product_id: productId,
        previous_status: previousStatus,
        new_status: newStatus,
        moderator_id: user.id,
        artisan_id: product.artisan_shops.user_id,
        comment: comment || null,
        edits_made: edits || {},
      });

    if (historyError) {
      console.error('[moderate-product] History error:', historyError);
    }

    // Create notification for artisan
    const notificationTitles: Record<string, string> = {
      'approved': '¡Producto aprobado!',
      'approved_with_edits': 'Producto aprobado con ajustes',
      'changes_requested': 'Cambios solicitados',
      'rejected': 'Producto rechazado',
    };

    const notificationMessages: Record<string, string> = {
      'approved': `Tu producto "${product.name}" ha sido aprobado y ya está publicado.`,
      'approved_with_edits': `Tu producto "${product.name}" fue aprobado con algunos ajustes realizados por el moderador.`,
      'changes_requested': `Se han solicitado cambios para tu producto "${product.name}". ${comment || ''}`,
      'rejected': `Tu producto "${product.name}" fue rechazado. ${comment || ''}`,
    };

    await supabase.from('notifications').insert({
      user_id: product.artisan_shops.user_id,
      type: `moderation_${action}`,
      title: notificationTitles[newStatus],
      message: notificationMessages[newStatus],
      metadata: {
        product_id: productId,
        product_name: product.name,
        action,
        comment,
        edits_applied: edits ? Object.keys(edits) : [],
      },
    });

    // Send email notification based on user preferences
    try {
      const emailResponse = await fetch(
        `${supabaseUrl}/functions/v1/send-notification-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            userId: product.artisan_shops.user_id,
            type: `moderation_${action}`,
            title: notificationTitles[newStatus],
            message: notificationMessages[newStatus],
            actionUrl: '/mi-tienda'
          })
        }
      );
      const emailResult = await emailResponse.json();
      console.log('[moderate-product] Email notification result:', emailResult);
    } catch (emailError) {
      console.error('[moderate-product] Error sending email notification:', emailError);
      // Don't throw - email failure shouldn't block the moderation action
    }

    console.log(`[moderate-product] Successfully moderated product ${productId} to ${newStatus}`);

    return new Response(JSON.stringify({ 
      success: true, 
      newStatus,
      message: `Producto ${action === 'approve' ? 'aprobado' : action === 'approve_with_edits' ? 'aprobado con ediciones' : action === 'request_changes' ? 'devuelto para cambios' : 'rechazado'}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('[moderate-product] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
