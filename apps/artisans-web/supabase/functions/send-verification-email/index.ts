import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, token } = await req.json();
    
    const baseUrl = (Deno.env.get('PUBLIC_APP_URL') || 'https://app.telar.co').replace(/\/$/, '');
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

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
              <div class="greeting">¡Hola, ${firstName}! 👋</div>
              <p class="message">
                Qué alegría que te unas a <strong>Telar</strong>, tu taller digital pensado para artesanos como tú.
              </p>
              <p class="message">
                Solo falta un paso: activa tu cuenta haciendo clic en el botón de abajo para empezar a usar tus herramientas.
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
                Este enlace expirará en 24 horas. Si no fuiste tú quien creó esta cuenta, puedes ignorar este mensaje.
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

    console.log(`Sending verification email to ${email} with URL: ${verificationUrl}`);

    // Enviar email real usando Resend
    const { data, error: emailError } = await resend.emails.send({
      from: "Telar <hola@updates.telar.co>",
      to: [email],
      subject: "✨ Activa tu cuenta en Telar",
      html: emailHtml
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email de verificación enviado exitosamente',
      verificationUrl,
      emailId: data?.id
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
