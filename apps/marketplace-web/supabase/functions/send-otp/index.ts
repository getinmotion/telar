import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
  channel: 'email' | 'whatsapp';
}

// Generar código de 6 dígitos
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, channel = 'email' }: SendOTPRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email es requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generar código
    const code = generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    // Crear cliente Supabase con service role para acceder a otp_codes
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Eliminar códigos anteriores del mismo email
    await supabase
      .from('otp_codes')
      .delete()
      .eq('identifier', email)
      .eq('verified', false);

    // Guardar nuevo código
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({
        identifier: email,
        code,
        channel,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error guardando código OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Error al generar código" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enviar código por email
    if (channel === 'email') {
      const { error: emailError } = await resend.emails.send({
        from: "TELAR Marketplace <noreply@updates.telar.co>",
        to: [email],
        subject: "Tu código de verificación - TELAR",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; padding: 30px 0; border-bottom: 2px solid #f48c5f; }
                .logo { font-size: 32px; font-weight: bold; color: #142239; }
                .content { padding: 40px 20px; text-align: center; }
                .code-box { background: linear-gradient(135deg, #f48c5f 0%, #ff6b4a 100%); color: white; padding: 30px; border-radius: 12px; margin: 30px 0; }
                .code { font-size: 48px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; }
                .expires { font-size: 14px; color: #666; margin-top: 20px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 40px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">TELAR</div>
                </div>
                <div class="content">
                  <h1 style="color: #142239; margin-bottom: 20px;">Tu código de verificación</h1>
                  <p style="font-size: 16px; color: #666;">Ingresa este código para continuar como invitado:</p>
                  <div class="code-box">
                    <div class="code">${code}</div>
                  </div>
                  <p class="expires">⏱️ Este código expira en 10 minutos</p>
                  <p style="font-size: 14px; color: #999; margin-top: 30px;">
                    Si no solicitaste este código, puedes ignorar este mensaje de forma segura.
                  </p>
                </div>
                <div class="footer">
                  <p>TELAR Marketplace - Artesanías Colombianas Auténticas</p>
                  <p>Este es un email automático, por favor no respondas.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      if (emailError) {
        console.error("Error enviando email:", emailError);
        return new Response(
          JSON.stringify({ error: "Error al enviar código por email" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Código OTP enviado a ${email} via ${channel}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Código enviado a ${email}`,
        expiresAt: expiresAt.toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error en send-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
