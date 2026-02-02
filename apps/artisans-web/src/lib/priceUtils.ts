/**
 * Parsea un precio desde string con diferentes formatos
 * Soporta: 50.000 | 50,000 | 50000 | 1.500.000 | 1,500,000
 */
export const parsePrice = (input: string): number | null => {
  const cleaned = input.trim();
  if (!cleaned) return null;
  
  // Remover símbolos de moneda y espacios
  const normalized = cleaned.replace(/[$\s]/g, '');
  
  // Si tiene punto Y coma, determinar cuál es el decimal
  if (normalized.includes('.') && normalized.includes(',')) {
    const lastDot = normalized.lastIndexOf('.');
    const lastComma = normalized.lastIndexOf(',');
    
    if (lastComma > lastDot) {
      // Formato europeo/colombiano: 1.000,50 → 1000.50
      return parseFloat(normalized.replace(/\./g, '').replace(',', '.'));
    } else {
      // Formato americano: 1,000.50 → 1000.50
      return parseFloat(normalized.replace(/,/g, ''));
    }
  }
  
  // Solo coma: determinar si es miles o decimal
  if (normalized.includes(',')) {
    const parts = normalized.split(',');
    const lastPart = parts[parts.length - 1];
    
    if (lastPart.length === 2 && parts.length === 2) {
      // Probablemente decimal: 50,50 → 50.50
      return parseFloat(normalized.replace(',', '.'));
    } else {
      // Probablemente miles: 50,000 → 50000
      return parseFloat(normalized.replace(/,/g, ''));
    }
  }
  
  // Solo punto: determinar si es miles o decimal
  if (normalized.includes('.')) {
    const parts = normalized.split('.');
    const lastPart = parts[parts.length - 1];
    
    if (lastPart.length === 3 && parts.length <= 3) {
      // Probablemente miles: 50.000 → 50000
      return parseFloat(normalized.replace(/\./g, ''));
    } else if (lastPart.length <= 2 && parts.length === 2) {
      // Probablemente decimal: 50.50 → 50.50
      return parseFloat(normalized);
    } else {
      // Múltiples puntos, asumir miles: 1.500.000 → 1500000
      return parseFloat(normalized.replace(/\./g, ''));
    }
  }
  
  // Sin separadores
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Formatea un precio para mostrar en formato colombiano
 */
export const formatPrice = (amount: number, includeDecimals: boolean = false): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
};

/**
 * Valida si un precio está en un rango razonable
 */
export const validatePrice = (price: number | null): { 
  valid: boolean; 
  warning?: string; 
  level?: 'low' | 'high' 
} => {
  if (price === null || price <= 0) {
    return { valid: false };
  }
  
  if (price < 1000) {
    return { 
      valid: true, 
      warning: '¿Estás seguro? Este precio es muy bajo',
      level: 'low'
    };
  }
  
  if (price > 50000000) {
    return { 
      valid: true, 
      warning: 'Este precio es muy alto. Verifica que sea correcto',
      level: 'high'
    };
  }
  
  return { valid: true };
};
