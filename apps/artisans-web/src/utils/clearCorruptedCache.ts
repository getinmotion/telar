/**
 * Utilidad para limpiar datos corruptos del localStorage
 * Útil cuando hay inconsistencias entre el perfil y los datos cached
 */

export const clearCorruptedUserCache = (userId: string): number => {
  const prefix = `user_${userId}_`;
  const keysToRemove: string[] = [];
  
  console.log(`🔍 Verificando cache para usuario: ${userId}`);
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      // Verificar si el dato está corrupto
      try {
        const value = localStorage.getItem(key);
        if (value) {
          JSON.parse(value);
        }
      } catch (error) {
        console.warn(`❌ Cache corrupto detectado: ${key}`);
        keysToRemove.push(key);
      }
    }
  }
  
  // Remover claves corruptas
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🧹 Limpiado cache corrupto: ${key}`);
  });
  
  if (keysToRemove.length > 0) {
    console.log(`✅ Se limpiaron ${keysToRemove.length} entradas corruptas del cache`);
  }
  
  return keysToRemove.length;
};

/**
 * Limpia todo el localStorage del usuario
 * Útil en casos extremos donde se necesita un reset completo
 */
export const clearAllUserCache = (userId: string): number => {
  const prefix = `user_${userId}_`;
  const keysToRemove: string[] = [];
  
  console.log(`🧹 Limpiando todo el cache para usuario: ${userId}`);
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`✅ Se limpiaron ${keysToRemove.length} entradas del cache`);
  return keysToRemove.length;
};

/**
 * Verifica la integridad del cache sin eliminarlo
 */
export const validateUserCache = (userId: string): { valid: number; corrupted: string[] } => {
  const prefix = `user_${userId}_`;
  const corrupted: string[] = [];
  let valid = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          JSON.parse(value);
          valid++;
        }
      } catch {
        corrupted.push(key);
      }
    }
  }
  
  return { valid, corrupted };
};
