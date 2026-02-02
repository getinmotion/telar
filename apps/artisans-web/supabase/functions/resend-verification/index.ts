import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting simple (en memoria)
const rateLimitMap = new Map<string, number>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting (60 segundos)
    const lastRequest = rateLimitMap.get(email);
    const now = Date.now();
    if (lastRequest && (now - lastRequest) < 60000) {
      const remainingSeconds = Math.ceil((60000 - (now - lastRequest)) / 1000);
      return new Response(JSON.stringify({ 
        error: `Por favor espera ${remainingSeconds} segundos antes de solicitar otro código`,
        code: 'RATE_LIMITED'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    rateLimitMap.set(email, now);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar usuario
    const { data: userData } = await supabase.auth.admin.listUsers();
    const user = userData?.users.find(u => u.email === email.toLowerCase().trim());

    if (!user) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Si existe una cuenta con este correo, recibirás un nuevo enlace de verificación'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Si ya está verificado
    if (user.email_confirmed_at) {
      return new Response(JSON.stringify({ 
        error: 'Esta cuenta ya está verificada',
        code: 'ALREADY_VERIFIED'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Invalidar tokens anteriores
    await supabase
      .from('email_verifications')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('used_at', null);

    // Generar nuevo token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await supabase
      .from('email_verifications')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

    // Enviar email usando Resend
    const baseUrl = (Deno.env.get('PUBLIC_APP_URL') || 'https://app.telar.co').replace(/\/$/, '');
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    const firstName = user.user_metadata?.first_name || 'Artesano';

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
            .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
            .content { background: #ffffff; padding: 40px 30px; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; }
            .greeting { font-size: 24px; color: #2B2B2B; margin-bottom: 20px; font-weight: 500; }
            .message { font-size: 16px; color: #555; margin-bottom: 15px; line-height: 1.8; }
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
            .help-text { color: #888; font-size: 14px; margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; }
            .help-text a { color: #2B2B2B; word-break: break-all; }
            .expiry-notice { color: #999; font-size: 13px; margin-top: 25px; font-style: italic; }
            .footer { background: #f5f5f5; text-align: center; padding: 25px 20px; color: #888; font-size: 13px; border-radius: 0 0 12px 12px; border-top: 1px solid #e0e0e0; }
            .footer-emoji { font-size: 18px; margin: 0 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://telar.co/logo-horizontal.svg" alt="Telar" class="logo">
              <h1>Telar</h1>
            </div>
            <div class="content">
              <div class="greeting">¡Hola de nuevo, ${firstName}! 👋</div>
              <p class="message">
                Solicitaste un nuevo enlace de verificación para tu cuenta en <strong>Telar</strong>.
              </p>
              <p class="message">
                No hay problema, haz clic en el botón de abajo para activar tu cuenta:
              </p>
              <div class="button-container">
                <a href="${verificationUrl}" class="button">✨ Activar mi cuenta</a>
              </div>
              <div class="help-text">
                <strong>¿El botón no funciona?</strong><br>
                Copia y pega este enlace en tu navegador:<br>
                <a href="${verificationUrl}">${verificationUrl}</a>
              </div>
              <p class="expiry-notice">
                Este enlace expirará en 24 horas. Si no fuiste tú quien solicitó esto, puedes ignorar este mensaje.
              </p>
            </div>
            <div class="footer">
              <p>Con cariño desde Bogotá, Colombia <span class="footer-emoji">🇨🇴</span></p>
              <p style="margin-top: 10px;">Telar © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Telar <hola@updates.telar.co>",
      to: [user.email!],
      subject: "✨ Nuevo enlace de verificación - Telar",
      html: emailHtml
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log("Verification email resent successfully:", emailData);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Se ha enviado un nuevo código de verificación a tu correo'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Resend error:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
