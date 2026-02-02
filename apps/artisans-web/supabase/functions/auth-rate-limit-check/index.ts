/**
 * Server-side rate limiting for authentication attempts
 * Prevents brute force attacks by tracking failed login attempts in database
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, action } = await req.json();

    if (!email || !action) {
      return new Response(
        JSON.stringify({ error: 'Email and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client IP for additional tracking
    const ip = req.headers.get('x-forwarded-for') || 
                req.headers.get('x-real-ip') || 
                'unknown';

    if (action === 'check') {
      // Check if email is rate limited
      const { data, error } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .eq('identifier', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        return new Response(
          JSON.stringify({ isRateLimited: false, attemptsRemaining: 5 }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const now = new Date();
      const blockedUntil = data.blocked_until ? new Date(data.blocked_until) : null;

      // Check if still blocked
      if (blockedUntil && blockedUntil > now) {
        const minutesRemaining = Math.ceil((blockedUntil.getTime() - now.getTime()) / (1000 * 60));
        return new Response(
          JSON.stringify({
            isRateLimited: true,
            attemptsRemaining: 0,
            blockedMinutes: minutesRemaining,
            message: `Demasiados intentos fallidos. Intenta nuevamente en ${minutesRemaining} minuto${minutesRemaining !== 1 ? 's' : ''}.`
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if we need to reset (15 minutes since first attempt)
      const firstAttempt = new Date(data.first_attempt);
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

      if (firstAttempt < fifteenMinutesAgo) {
        // Reset the counter
        await supabase
          .from('auth_rate_limits')
          .delete()
          .eq('identifier', email);

        return new Response(
          JSON.stringify({ isRateLimited: false, attemptsRemaining: 5 }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const attemptsRemaining = Math.max(0, 5 - data.attempt_count);
      return new Response(
        JSON.stringify({
          isRateLimited: data.attempt_count >= 5,
          attemptsRemaining,
          message: attemptsRemaining > 0 
            ? `${attemptsRemaining} intento${attemptsRemaining !== 1 ? 's' : ''} restante${attemptsRemaining !== 1 ? 's' : ''}` 
            : 'Demasiados intentos fallidos'
        }),
        { 
          status: data.attempt_count >= 5 ? 429 : 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } 
    
    else if (action === 'record_failure') {
      // Record a failed attempt
      const { data: existing } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .eq('identifier', email)
        .single();

      if (existing) {
        const newCount = existing.attempt_count + 1;
        const blockedUntil = newCount >= 5 
          ? new Date(Date.now() + 15 * 60 * 1000) // Block for 15 minutes
          : null;

        await supabase
          .from('auth_rate_limits')
          .update({
            attempt_count: newCount,
            blocked_until: blockedUntil,
            last_ip: ip
          })
          .eq('identifier', email);
      } else {
        await supabase
          .from('auth_rate_limits')
          .insert({
            identifier: email,
            attempt_count: 1,
            first_attempt: new Date().toISOString(),
            last_ip: ip
          });
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    else if (action === 'clear') {
      // Clear rate limit on successful login
      await supabase
        .from('auth_rate_limits')
        .delete()
        .eq('identifier', email);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: check, record_failure, or clear' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rate limit check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
