import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting in-memory store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(ip: string): string {
  return `rate_limit:${ip}`;
}

function isRateLimited(ip: string): boolean {
  const key = getRateLimitKey(ip);
  const now = Date.now();
  const limit = rateLimitStore.get(key);
  
  if (!limit || now > limit.resetTime) {
    // Reset or initialize rate limit
    rateLimitStore.set(key, { count: 1, resetTime: now + (15 * 60 * 1000) }); // 15 minutes
    return false;
  }
  
  if (limit.count >= 10) { // 10 attempts per 15 minutes
    return true;
  }
  
  limit.count++;
  return false;
}

function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters and limit length
  return input.trim()
    .replace(/[<>"\\'&]/g, '') // Remove HTML/SQL injection chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 50); // Limit length
}

function validateCodeFormat(code: string): boolean {
  // Validate code format - alphanumeric, dashes, underscores only
  return /^[a-zA-Z0-9_-]+$/.test(code) && code.length >= 3 && code.length <= 50;
}

serve(async (req) => {
  console.log('validate-access-code function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ valid: false, message: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Rate limiting based on IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    if (isRateLimited(clientIP)) {
      console.log(`Rate limited request from IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Too many attempts. Please try again later.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate request size (prevent large payloads)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024) { // 1KB limit
      return new Response(
        JSON.stringify({ valid: false, message: 'Request too large' }),
        { 
          status: 413, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const body = await req.json();
    const rawCode = body?.code;

    // Input validation
    if (!rawCode) {
      console.log('No access code provided');
      return new Response(
        JSON.stringify({ valid: false, message: 'Access code is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Sanitize and validate input
    const code = sanitizeInput(rawCode);
    
    if (!code || !validateCodeFormat(code)) {
      console.log('Invalid code format:', rawCode);
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid code format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('Validating access code:', code);

    // Query the access_codes table
    const { data: accessCode, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid access code' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!accessCode) {
      console.log('Access code not found or inactive');
      return new Response(
        JSON.stringify({ valid: false, message: 'Invalid access code' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if code has expired
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      console.log('Access code has expired');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Access code has expired' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check usage limits
    if (accessCode.max_uses && accessCode.current_uses >= accessCode.max_uses) {
      console.log('Access code usage limit exceeded');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          message: 'Access code usage limit exceeded' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update usage count if there's a limit
    if (accessCode.max_uses) {
      const { error: updateError } = await supabase
        .from('access_codes')
        .update({ 
          current_uses: accessCode.current_uses + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', accessCode.id);

      if (updateError) {
        console.error('Error updating usage count:', updateError);
        // Continue anyway - don't fail validation for this
      }
    }

    console.log('Access code validated successfully');

    // Return success with safe data only
    return new Response(
      JSON.stringify({ 
        valid: true, 
        message: 'Access code is valid',
        codeInfo: {
          description: accessCode.description || 'Valid access code'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error in validate-access-code:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        message: 'Server error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});