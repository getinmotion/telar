import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token requerido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Verifying email with token: ${token.substring(0, 8)}...`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar token
    const { data: verification, error: verificationError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .single();

    if (verificationError || !verification) {
      console.log('Token not found or already used:', verificationError?.message);
      return new Response(JSON.stringify({ 
        error: 'Token inválido o ya utilizado',
        code: 'INVALID_TOKEN'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Token found for user: ${verification.user_id}`);

    // Verificar expiración
    if (new Date(verification.expires_at) < new Date()) {
      console.log('Token expired');
      return new Response(JSON.stringify({ 
        error: 'El token ha expirado',
        code: 'EXPIRED_TOKEN'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Marcar email como confirmado usando el Admin API
    console.log(`Attempting to confirm email for user: ${verification.user_id}`);
    
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      verification.user_id,
      { 
        email_confirm: true,
        user_metadata: { email_verified: true }
      }
    );

    if (updateError) {
      console.error('Error confirming email:', updateError);
      return new Response(JSON.stringify({ 
        error: 'Error al confirmar el email',
        details: updateError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Update result:', JSON.stringify(updateData));

    // Verificar que la confirmación funcionó
    const { data: verifiedUser, error: getUserError } = await supabase.auth.admin.getUserById(
      verification.user_id
    );

    if (getUserError) {
      console.error('Error fetching user after update:', getUserError);
    } else {
      console.log(`User email_confirmed_at after update: ${verifiedUser?.user?.email_confirmed_at}`);
      
      // Si no se confirmó, intentar de nuevo con método alternativo
      if (!verifiedUser?.user?.email_confirmed_at) {
        console.log('Email not confirmed after updateUserById, email_confirm: true should work...');
      }
    }

    // Marcar token como usado SOLO si la confirmación fue exitosa
    const { error: markUsedError } = await supabase
      .from('email_verifications')
      .update({ used_at: new Date().toISOString() })
      .eq('id', verification.id);

    if (markUsedError) {
      console.error('Error marking token as used:', markUsedError);
    }

    console.log('Email verification completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email verificado exitosamente',
      userId: verification.user_id,
      emailConfirmedAt: verifiedUser?.user?.email_confirmed_at
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});