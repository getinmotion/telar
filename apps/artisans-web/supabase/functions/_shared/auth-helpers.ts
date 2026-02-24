/**
 * Shared authentication helpers for edge functions
 * Provides standardized admin verification and error handling
 * 
 * SECURITY: Centralized auth patterns to ensure consistency across all edge functions
 */

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

export interface AuthResult {
  user: any;
  supabase: SupabaseClient;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Create authenticated Supabase client from auth header
 */
function createAuthClient(authHeader: string): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false }
    }
  );
}

/**
 * Require admin access for the edge function
 * Throws standardized error if not authorized
 */
export async function requireAdmin(authHeader: string | null): Promise<AuthResult> {
  if (!authHeader) {
    throw new AuthError('Missing authorization header', 401);
  }

  const supabase = createAuthClient(authHeader);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new AuthError('Invalid or expired token', 401);
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc('check_admin_access');
  
  if (adminError || !isAdmin) {
    throw new AuthError('Admin access required', 403);
  }

  return { user, supabase };
}

/**
 * Require moderator access for the edge function
 * Moderators can access moderation features but not admin functions
 */
export async function requireModerator(authHeader: string | null): Promise<AuthResult> {
  if (!authHeader) {
    throw new AuthError('Missing authorization header', 401);
  }

  const supabase = createAuthClient(authHeader);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new AuthError('Invalid or expired token', 401);
  }

  const { data: isModerator, error: modError } = await supabase.rpc('is_moderator');
  
  if (modError || !isModerator) {
    throw new AuthError('Moderator access required', 403);
  }

  return { user, supabase };
}

/**
 * Require authenticated user (not necessarily admin)
 */
export async function requireAuth(authHeader: string | null): Promise<AuthResult> {
  if (!authHeader) {
    throw new AuthError('Missing authorization header', 401);
  }

  const supabase = createAuthClient(authHeader);

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new AuthError('Invalid or expired token', 401);
  }

  return { user, supabase };
}

/**
 * Custom authentication error with status code
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Safe error message mapper - prevents internal details from leaking
 */
export function getSafeErrorMessage(error: any, language: 'en' | 'es' = 'es'): string {
  // Map database error codes to safe messages
  const errorCodeMap: Record<string, { es: string; en: string }> = {
    '23505': { es: 'Este registro ya existe', en: 'This record already exists' },
    '23503': { es: 'Referencia inválida', en: 'Invalid reference' },
    '23502': { es: 'Campo requerido faltante', en: 'Required field missing' },
    'PGRST116': { es: 'No se encontró el recurso', en: 'Resource not found' },
    '42501': { es: 'No tienes permisos para realizar esta acción', en: 'Permission denied' },
    '23514': { es: 'Datos inválidos', en: 'Invalid data' },
    '22001': { es: 'El texto es demasiado largo', en: 'Text too long' },
    '22P02': { es: 'Formato de datos inválido', en: 'Invalid data format' }
  };

  // Check if it's a Postgres error with code
  if (error?.code && errorCodeMap[error.code]) {
    return errorCodeMap[error.code][language];
  }

  // Check if it's an auth error
  if (error instanceof AuthError) {
    return error.message;
  }

  // Default safe messages
  return language === 'es' 
    ? 'Ocurrió un error. Por favor intenta nuevamente.'
    : 'An error occurred. Please try again.';
}

/**
 * Create standardized error response
 */
export function errorResponse(error: any, language: 'en' | 'es' = 'es'): Response {
  const statusCode = error instanceof AuthError ? error.statusCode : 500;
  const message = getSafeErrorMessage(error, language);
  
  logError('edge_function_error', error);
  
  return new Response(
    JSON.stringify({ error: message, success: false }),
    { 
      status: statusCode, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Create standardized success response
 */
export function successResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify({ ...data, success: true }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

/**
 * Log error server-side without exposing to client
 */
export function logError(context: string, error: any, metadata?: Record<string, any>) {
  const isProduction = Deno.env.get('ENVIRONMENT') === 'production';
  
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    error: error?.message || String(error),
    code: error?.code,
    ...metadata
  };

  if (isProduction) {
    // In production, log without exposing stack traces
    console.error(JSON.stringify(logData));
  } else {
    console.error('[ERROR]', { ...logData, stack: error?.stack });
  }
}

export { corsHeaders };
