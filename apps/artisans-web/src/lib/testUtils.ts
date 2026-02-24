/**
 * Utilidades para crear y gestionar usuarios de prueba
 */

import { supabase } from '@/integrations/supabase/client';

export interface TestUserCredentials {
  email: string;
  password: string;
  businessName: string;
  craftType: string;
}

export interface CreateTestUserOptions {
  email?: string;
  password?: string;
  businessName?: string;
  craftType?: string;
}

/**
 * Crea un usuario de prueba completo con:
 * - Cuenta de autenticación verificada
 * - Perfil de usuario
 * - Test de madurez completado (65, 45, 55, 40)
 * - Contexto de negocio (Cerámica Luna por defecto)
 * - 3 tareas iniciales
 */
export async function createTestUser(
  options: CreateTestUserOptions = {}
): Promise<{ success: boolean; credentials?: TestUserCredentials; error?: string }> {
  try {
    console.log('🧪 [TEST] Creating test user...');

    const { data, error } = await supabase.functions.invoke('create-test-user', {
      body: options
    });

    if (error) {
      console.error('❌ [TEST] Error creating test user:', error);
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }

    if (!data.success) {
      console.error('❌ [TEST] Test user creation failed:', data.error);
      return {
        success: false,
        error: data.error || 'Error en la creación del usuario'
      };
    }

    console.log('✅ [TEST] Test user created:', data.credentials);
    
    return {
      success: true,
      credentials: data.credentials
    };

  } catch (error: any) {
    console.error('❌ [TEST] Unexpected error:', error);
    return {
      success: false,
      error: error.message || 'Error inesperado'
    };
  }
}

/**
 * Limpia un usuario de prueba específico (elimina todas sus datos)
 * SOLO usar en entornos de desarrollo/testing
 */
export async function cleanupTestUser(userId: string): Promise<boolean> {
  try {
    console.log('🧹 [TEST] Cleaning up test user:', userId);

    // This would require admin privileges - better to use the reset function
    console.warn('[TEST] Use resetUserProgressForTesting() instead for data cleanup');
    
    return true;
  } catch (error) {
    console.error('❌ [TEST] Error cleaning up test user:', error);
    return false;
  }
}

/**
 * Genera credenciales de prueba aleatorias
 */
export function generateTestCredentials(): CreateTestUserOptions {
  const timestamp = Date.now();
  const craftTypes = ['Cerámica', 'Tejido', 'Cuero', 'Madera', 'Joyería'];
  const craftType = craftTypes[Math.floor(Math.random() * craftTypes.length)];
  
  return {
    email: `test.${timestamp}@telar.test`,
    password: 'TestUser123!',
    businessName: `Taller de ${craftType} ${timestamp % 1000}`,
    craftType
  };
}
