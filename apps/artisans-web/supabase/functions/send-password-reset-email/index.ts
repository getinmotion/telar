import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const sendEmailWithResend = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Telar <no-reply@telar.co>",
      to: [to],
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }
  
  return response.json();
};



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const generateEmailTemplate = (resetUrl: string, userName: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Telar</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fcf7ec;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(20, 34, 57, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #142239 0%, #1e3a5f 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffc716; font-size: 28px; font-weight: 700; letter-spacing: 2px;">TELAR</h1>
              <p style="margin: 8px 0 0 0; color: #fcf7ec; font-size: 14px; opacity: 0.9;">Artesanía Colombiana</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              <h2 style="margin: 0 0 16px 0; color: #142239; font-size: 24px; font-weight: 600;">
                ¡Hola${userName ? `, ${userName}` : ''}! 👋
              </h2>
              
              <p style="margin: 0 0 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en Telar. 
                Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 16px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #f48c5f 0%, #ffc716 100%); color: #142239; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(244, 140, 95, 0.3);">
                      🔐 Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                <strong>⏰ Este enlace expira en 1 hora.</strong>
              </p>
              
              <p style="margin: 16px 0 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura. 
                Tu contraseña permanecerá sin cambios.
              </p>
              
              <!-- Divider -->
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;">
              
              <p style="margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.6;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 8px 0 0 0; color: #f48c5f; font-size: 12px; word-break: break-all;">
                ${resetUrl}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px 0; color: #142239; font-size: 14px; font-weight: 500;">
                Con cariño desde Bogotá 🇨🇴
              </p>
              <p style="margin: 0; color: #718096; font-size: 12px;">
                © 2025 Telar. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Password reset requested for: ${email}`);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists in user_profiles
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, full_name, email")
      .eq("email", email.toLowerCase())
      .single();

    if (profileError || !profile) {
      // Don't reveal if email exists or not for security
      console.log(`No profile found for email: ${email}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Si el email existe, recibirás un enlace de recuperación" 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Invalidate any existing tokens for this email
    await supabase
      .from("password_reset_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("email", email.toLowerCase())
      .is("used_at", null);

    // Generate new token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token
    const { error: insertError } = await supabase
      .from("password_reset_tokens")
      .insert({
        user_id: profile.id,
        email: email.toLowerCase(),
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error saving token:", insertError);
      throw new Error("Error al generar token de recuperación");
    }

    // Build reset URL
    const appUrl = Deno.env.get("PUBLIC_APP_URL") || "https://app.telar.co";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Send branded email
    const emailResponse = await sendEmailWithResend(
      email,
      "🔐 Restablecer contraseña - Telar",
      generateEmailTemplate(resetUrl, profile.full_name || "")
    );

    console.log("Password reset email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Si el email existe, recibirás un enlace de recuperación" 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-password-reset-email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});