import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Regex-based validation
const validateEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
};

const validateWhatsApp = (whatsapp: string): boolean => {
  return /^\+57\d{10}$/.test(whatsapp);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      password,
      passwordConfirmation,
      hasRUT,
      rut,
      department,
      city,
      whatsapp,
      acceptTerms,
      newsletterOptIn
    } = body;

    // Validaciones
    if (!firstName || firstName.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'El nombre es requerido (mínimo 2 caracteres)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!lastName || lastName.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'El apellido es requerido (mínimo 2 caracteres)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!validateEmail(email)) {
      return new Response(JSON.stringify({ error: 'Formato de email inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!validatePassword(password)) {
      return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (password !== passwordConfirmation) {
      return new Response(JSON.stringify({ error: 'Las contraseñas no coinciden' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (hasRUT && (!rut || rut.trim().length === 0)) {
      return new Response(JSON.stringify({ error: 'El RUT es requerido si indicaste que lo tienes' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!department || department.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'El departamento es requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!city || city.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'La ciudad es requerida' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!validateWhatsApp(whatsapp)) {
      return new Response(JSON.stringify({ error: 'WhatsApp debe tener formato +57 seguido de 10 dígitos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!acceptTerms) {
      return new Response(JSON.stringify({ error: 'Debes aceptar los términos y condiciones' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const normalizedEmail = email.toLowerCase().trim();

    // Preparar metadata
    const userMetadata = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      whatsapp_e164: whatsapp,
      department: department.trim(),
      city: city.trim(),
      rut: hasRUT ? rut.trim() : null,
      rut_pendiente: !hasRUT,
      newsletter_opt_in: newsletterOptIn || false,
    };

    // Crear usuario - Supabase manejará el error si ya existe
    const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: userMetadata,
    });

    if (signUpError) {
      // Server-side error logging only (not exposed to client)
      console.error('[AUTH_ERROR]', {
        context: 'user_creation',
        code: signUpError.code,
        email: normalizedEmail.substring(0, 3) + '***' // Partially redacted for security
      });
      
      // Verificar si es error de email duplicado
      if (signUpError.message.includes('already registered') || 
          signUpError.message.includes('already exists') ||
          signUpError.message.includes('User already registered')) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Este correo electrónico ya está registrado',
          errorCode: 'EMAIL_EXISTS',
          errorDetails: signUpError.message
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Error al crear la cuenta',
        errorCode: signUpError.code || 'AUTH_ERROR',
        errorDetails: signUpError.message,
        technicalError: JSON.stringify(signUpError)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Crear el perfil de usuario usando upsert para evitar conflictos con trigger
    const businessLocation = city && department 
      ? `${city.trim()}, ${department.trim()}, Colombia`
      : null;
    
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: newUser.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        whatsapp_e164: whatsapp,
        department: department.trim(),
        city: city.trim(),
        business_location: businessLocation,
        rut: hasRUT ? rut.trim() : null,
        rut_pendiente: !hasRUT,
        newsletter_opt_in: newsletterOptIn || false,
      }, {
        onConflict: 'user_id'
      })
      .select()
      .maybeSingle();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      console.error('Profile error details:', {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      });
      
      // Si falla la creación del perfil, eliminar el usuario creado
      await supabase.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Error al crear el perfil de usuario',
        errorCode: profileError.code || 'PROFILE_ERROR',
        errorDetails: profileError.message,
        errorHint: profileError.hint || 'No hay sugerencia adicional',
        technicalError: JSON.stringify(profileError)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!profileData) {
      console.error('Profile was not created - no data returned');
      await supabase.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Error: El perfil no devolvió datos después de crear',
        errorCode: 'PROFILE_NO_DATA',
        errorDetails: 'Profile insert succeeded but returned no data'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User profile created successfully:', profileData);

    // Crear el progreso inicial del usuario
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: newUser.user.id,
        level: 1,
        experience_points: 0,
        next_level_xp: 100,
      }, {
        onConflict: 'user_id'
      })
      .select()
      .maybeSingle();

    if (progressError) {
      console.error('Error creating user progress:', progressError);
      console.error('Progress error details:', {
        code: progressError.code,
        message: progressError.message,
        hint: progressError.hint,
        details: progressError.details
      });
      
      // Si falla el progreso, eliminar el usuario y perfil
      await supabase.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Error al inicializar el progreso del usuario',
        errorCode: progressError.code || 'PROGRESS_ERROR',
        errorDetails: progressError.message,
        errorHint: progressError.hint || 'No hay sugerencia adicional',
        technicalError: JSON.stringify(progressError)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User progress initialized');

    // Generar token de verificación
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { error: tokenError } = await supabase
      .from('email_verifications')
      .insert({
        user_id: newUser.user.id,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Error creating verification token:', tokenError);
    }

    // Enviar email de verificación
    console.log('Invoking send-verification-email...');
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-verification-email', {
      body: {
        email: normalizedEmail,
        firstName: firstName.trim(),
        token,
      }
    });

    if (emailError) {
      console.error('Error invoking send-verification-email:', emailError);
    } else {
      console.log('Verification email invoked successfully:', emailData);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Cuenta creada exitosamente. Revisa tu correo para verificar tu cuenta.',
      userId: newUser.user.id
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Error interno del servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
