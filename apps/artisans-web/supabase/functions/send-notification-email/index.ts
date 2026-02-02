import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapeo de tipos de notificación a categorías de preferencias
const notificationCategoryMap: Record<string, string> = {
  // Moderation
  'moderation_approve': 'moderation',
  'moderation_reject': 'moderation',
  'moderation_approve_with_edits': 'moderation',
  'moderation_request_changes': 'moderation',
  'marketplace_approved': 'moderation',
  'marketplace_removed': 'moderation',
  // Shop
  'shop_created': 'shop',
  'shop_published': 'shop',
  'shop_first_sale': 'shop',
  'shop_deleted': 'shop',
  // Products
  'product_created': 'products',
  'product_approved': 'products',
  'product_low_stock': 'products',
  'product_out_of_stock': 'products',
  // Progress
  'milestone_completed': 'progress',
  'task_completed': 'progress',
  'achievement_unlocked': 'progress',
  'level_up': 'progress',
  'artisan_profile_completed': 'progress',
  // Account
  'welcome': 'account',
  'profile_completed': 'account',
  'bank_data_configured': 'account',
  // System
  'system_announcement': 'system',
  'feature_update': 'system',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, type, title, message, actionUrl } = await req.json();

    console.log('[send-notification-email] Processing:', { userId, type });

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Obtener preferencias de email del usuario
    const { data: preferences, error: prefError } = await supabase
      .from('user_preferences')
      .select('email_notification_preferences')
      .eq('user_id', userId)
      .maybeSingle();

    // Only log error if there's a real error (not "no rows returned")
    if (prefError) {
      console.error('[send-notification-email] Error fetching preferences:', prefError);
      // Continue with defaults instead of failing
    }

    // 2. Verificar si el usuario quiere este tipo de notificación
    const category = notificationCategoryMap[type] || 'system';
    // Preferences may be null if no row exists - use defaults
    const emailPrefs = (preferences?.email_notification_preferences as Record<string, boolean>) || {};
    const categoryEnabled = emailPrefs[category] !== false; // Default true si no existe

    if (!categoryEnabled) {
      console.log(`[send-notification-email] Category ${category} disabled for user ${userId}`);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'Category disabled' }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Obtener email desde auth.users (no existe en user_profiles)
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError || !authUser?.user?.email) {
      console.error('[send-notification-email] Error fetching user email:', authError);
      return new Response(JSON.stringify({ success: false, error: 'User email not found' }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userEmail = authUser.user.email;

    // 4. Obtener nombre del usuario para personalización (opcional)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name')
      .eq('user_id', userId)
      .maybeSingle();

    const firstName = profile?.first_name || 'Artesano';

    // 5. Construir URL de acción
    const baseUrl = (Deno.env.get('PUBLIC_APP_URL') || 'https://app.telar.co').replace(/\/$/, '');
    const fullActionUrl = actionUrl ? `${baseUrl}${actionUrl}` : `${baseUrl}/notifications`;

    // 6. Construir email HTML con branding TELAR
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2B2B2B 0%, #1a1a1a 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .logo { height: 50px; margin-bottom: 15px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { background: #ffffff; padding: 40px 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; }
            .notification-title { font-size: 20px; color: #2B2B2B; margin-bottom: 15px; font-weight: 600; }
            .notification-message { font-size: 16px; color: #555; margin-bottom: 25px; line-height: 1.8; }
            .button-container { text-align: center; margin: 35px 0; }
            .button { 
              display: inline-block;
              background: #D4FF00;
              color: #2B2B2B;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 600;
              font-size: 16px;
              transition: transform 0.2s;
              box-shadow: 0 4px 12px rgba(212, 255, 0, 0.3);
            }
            .button:hover { transform: translateY(-2px); }
            .footer { background: #f5f5f5; text-align: center; padding: 25px 20px; color: #888; font-size: 13px; border-radius: 0 0 12px 12px; border-top: 1px solid #e0e0e0; }
            .preferences-link { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 13px; color: #888; }
            .preferences-link a { color: #2B2B2B; text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://telar.co/logo-horizontal.svg" alt="Telar" class="logo">
              <h1>Telar</h1>
            </div>
            <div class="content">
              <div class="notification-title">${title}</div>
              <p class="notification-message">${message}</p>
              <div class="button-container">
                <a href="${fullActionUrl}" class="button">Ver en Telar</a>
              </div>
              <div class="preferences-link">
                <p>
                  Puedes gestionar tus preferencias de notificaciones en 
                  <a href="${baseUrl}/perfil">tu perfil</a>.
                </p>
              </div>
            </div>
            <div class="footer">
              <p>Con cariño desde Bogotá, Colombia 🇨🇴</p>
              <p style="margin-top: 10px;">Telar © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 7. Enviar email usando Resend
    console.log(`[send-notification-email] Sending email to ${userEmail}`);
    
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Telar <hola@updates.telar.co>",
      to: [userEmail],
      subject: title,
      html: emailHtml
    });

    if (emailError) {
      console.error('[send-notification-email] Error sending email:', emailError);
      return new Response(JSON.stringify({ success: false, error: 'Failed to send email', details: emailError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log('[send-notification-email] Email sent successfully:', emailData);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailData?.id,
      recipient: userEmail,
      category
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('[send-notification-email] Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});