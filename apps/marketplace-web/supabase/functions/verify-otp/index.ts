import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOTPRequest {
  email: string;
  code: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyOTPRequest = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email y código son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Crear cliente Supabase con service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar código válido
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('identifier', email)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error("Error buscando código OTP:", otpError);
      return new Response(
        JSON.stringify({ error: "Error al verificar código" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpData) {
      return new Response(
        JSON.stringify({ error: "Código inválido o expirado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Marcar código como verificado
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpData.id);

    // Crear sesión de invitado usando signUp con un password generado
    const tempPassword = crypto.randomUUID();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        user_type: 'guest',
        full_name: 'Invitado',
      }
    });

    let userId: string;

    if (authError) {
      // Si el usuario ya existe, intentar obtenerlo
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error("Error listando usuarios:", listError);
        return new Response(
          JSON.stringify({ error: "Error al crear sesión" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const existingUser = existingUsers.users.find(u => u.email === email);
      
      if (!existingUser) {
        console.error("Error creando usuario invitado:", authError);
        return new Response(
          JSON.stringify({ error: "Error al crear sesión de invitado" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = existingUser.id;

      // Usuario existe, crear perfil si no existe
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: existingUser.id,
          user_type: 'guest',
          full_name: 'Invitado',
        }, { onConflict: 'id' });

      if (profileError) {
        console.error("Error actualizando perfil:", profileError);
      }

      console.log(`Sesión de invitado verificada para usuario existente: ${email}`);
    } else {
      userId = authData.user.id;

      // Crear perfil de invitado
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          user_type: 'guest',
          full_name: 'Invitado',
        });

      if (profileError) {
        console.error("Error creando perfil de invitado:", profileError);
        // No fallamos por esto, el perfil se puede crear después
      }

      console.log(`Sesión de invitado creada para: ${email}`);
    }

    // Generar magic link y obtener el token_hash para verificarlo desde el frontend
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkError || !linkData.properties?.hashed_token) {
      console.error("Error generando link o faltan propiedades:", linkError, linkData);
      return new Response(
        JSON.stringify({ error: "Error al crear sesión" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token_hash = linkData.properties.hashed_token as string | undefined;

    if (!token_hash) {
      console.error("No se pudo obtener token_hash del magic link");
      return new Response(
        JSON.stringify({ error: "Error al crear sesión" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Devolver el token_hash para que el frontend establezca la sesión con verifyOtp
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Código verificado correctamente",
        userId,
        email,
        token_hash,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
 
  } catch (error: any) {
    console.error("Error en verify-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
