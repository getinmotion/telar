import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

/**
 * Server-side security monitoring hook
 * Provides rate limiting and audit logging for authentication
 * 
 * SECURITY: All rate limiting happens server-side to prevent bypass
 */
export const useSecurityMonitoring = () => {
  const logAdminAction = useCallback(async (action: string, resourceType: string, resourceId?: string, details?: Json) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_admin_action', {
          action_type: action,
          resource_type: resourceType,
          resource_id: resourceId,
          details: details || {}
        });
      }
    } catch {
      // Silent failure - don't expose logging errors
    }
  }, []);

  /**
   * Check if an email is rate limited (server-side)
   */
  const checkRateLimit = useCallback(async (email: string): Promise<{
    isRateLimited: boolean;
    attemptsRemaining: number;
    message?: string;
    blockedMinutes?: number;
  }> => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-rate-limit-check', {
        body: { email, action: 'check' }
      });

      if (error) {
        // Fail open - allow attempt if service is down
        return { isRateLimited: false, attemptsRemaining: 5 };
      }

      return data;
    } catch {
      return { isRateLimited: false, attemptsRemaining: 5 };
    }
  }, []);

  /**
   * Record a failed login attempt (server-side)
   */
  const recordFailedAttempt = useCallback(async (email: string, _ip?: string) => {
    try {
      await supabase.functions.invoke('auth-rate-limit-check', {
        body: { email, action: 'record_failure' }
      });
      
      // Log to admin audit trail
      await logAdminAction('FAILED_LOGIN_ATTEMPT', 'auth', email);
    } catch {
      // Silent failure
    }
  }, [logAdminAction]);

  /**
   * Record a successful login and clear rate limits
   */
  const recordSuccessfulLogin = useCallback(async (email: string, _ip?: string) => {
    try {
      await supabase.functions.invoke('auth-rate-limit-check', {
        body: { email, action: 'clear' }
      });
      
      await logAdminAction('LOGIN_SUCCESS', 'auth', email);
    } catch {
      // Silent failure
    }
  }, [logAdminAction]);

  /**
   * @deprecated Use checkRateLimit() instead
   */
  const isRateLimited = useCallback(async (email: string): Promise<boolean> => {
    const result = await checkRateLimit(email);
    return result.isRateLimited;
  }, [checkRateLimit]);

  return {
    recordFailedAttempt,
    recordSuccessfulLogin,
    checkRateLimit,
    isRateLimited,
    logAdminAction,
  };
};
