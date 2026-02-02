// Validation functions for wizard steps

export interface ValidationRule {
  type: 'required' | 'min-length' | 'max-length' | 'email' | 'url' | 'number' | 'nit-format' | 'file-type' | 'file-size';
  value?: any;
  message?: string;
}

export const validateStep = (inputValue: any, rules: ValidationRule[]): { isValid: boolean; error?: string } => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!inputValue || (typeof inputValue === 'string' && inputValue.trim() === '')) {
          return { isValid: false, error: rule.message || 'Este campo es obligatorio' };
        }
        break;

      case 'min-length':
        if (typeof inputValue === 'string' && inputValue.length < (rule.value || 0)) {
          return { isValid: false, error: rule.message || `Debe tener al menos ${rule.value} caracteres` };
        }
        break;

      case 'max-length':
        if (typeof inputValue === 'string' && inputValue.length > (rule.value || 0)) {
          return { isValid: false, error: rule.message || `No puede exceder ${rule.value} caracteres` };
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputValue)) {
          return { isValid: false, error: rule.message || 'Email inválido' };
        }
        break;

      case 'url':
        try {
          new URL(inputValue);
        } catch {
          return { isValid: false, error: rule.message || 'URL inválida' };
        }
        break;

      case 'number':
        if (isNaN(Number(inputValue))) {
          return { isValid: false, error: rule.message || 'Debe ser un número' };
        }
        break;

      case 'nit-format':
        // Colombian NIT format: 123456789-0
        const nitRegex = /^\d{6,10}-\d$/;
        if (!nitRegex.test(inputValue)) {
          return { isValid: false, error: rule.message || 'Formato NIT inválido (123456789-0)' };
        }
        break;

      case 'file-type':
        if (inputValue && inputValue.type && rule.value) {
          const allowedTypes = rule.value.split(',').map((t: string) => t.trim());
          if (!allowedTypes.some((type: string) => inputValue.type.includes(type))) {
            return { isValid: false, error: rule.message || `Tipo de archivo no permitido. Permitidos: ${rule.value}` };
          }
        }
        break;

      case 'file-size':
        if (inputValue && inputValue.size && rule.value) {
          const maxSize = rule.value * 1024 * 1024; // Convert MB to bytes
          if (inputValue.size > maxSize) {
            return { isValid: false, error: rule.message || `El archivo debe ser menor a ${rule.value}MB` };
          }
        }
        break;
    }
  }

  return { isValid: true };
};
