/**
 * Shared validation helpers using zod schemas
 * Provides type-safe input validation for edge functions
 */

import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

/**
 * Email validation schema
 */
export const EmailSchema = z
  .string()
  .trim()
  .email({ message: 'Formato de email inválido' })
  .max(255, { message: 'Email demasiado largo (máx 255 caracteres)' })
  .toLowerCase();

/**
 * Password validation schema
 * Requires: 8+ chars, uppercase, lowercase, number, special char
 */
export const PasswordSchema = z
  .string()
  .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  .max(128, { message: 'Contraseña demasiado larga (máx 128 caracteres)' })
  .regex(/[A-Z]/, { message: 'Debe contener al menos una mayúscula' })
  .regex(/[a-z]/, { message: 'Debe contener al menos una minúscula' })
  .regex(/[0-9]/, { message: 'Debe contener al menos un número' })
  .regex(/[^A-Za-z0-9]/, { message: 'Debe contener al menos un carácter especial' });

/**
 * Name validation schema (first name, last name, etc.)
 */
export const NameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Mínimo 2 caracteres' })
  .max(100, { message: 'Máximo 100 caracteres' })
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, { 
    message: 'Solo letras, espacios, guiones y apóstrofes permitidos' 
  });

/**
 * Phone number schema (Colombian format)
 */
export const PhoneSchema = z
  .string()
  .trim()
  .regex(/^\+57\d{10}$/, { 
    message: 'Formato de WhatsApp inválido. Debe ser +57 seguido de 10 dígitos' 
  });

/**
 * Generic text field schema with configurable length
 */
export const TextFieldSchema = (minLength = 1, maxLength = 500) =>
  z
    .string()
    .trim()
    .min(minLength, { message: `Mínimo ${minLength} caracteres` })
    .max(maxLength, { message: `Máximo ${maxLength} caracteres` });

/**
 * User registration schema
 */
export const RegisterUserSchema = z.object({
  firstName: NameSchema,
  lastName: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  passwordConfirmation: z.string(),
  hasRUT: z.boolean(),
  rut: z.string().trim().max(50).optional(),
  department: TextFieldSchema(1, 100),
  city: TextFieldSchema(1, 100),
  whatsapp: PhoneSchema,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los términos y condiciones'
  }),
  newsletterOptIn: z.boolean().optional().default(false)
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirmation']
}).refine(data => !data.hasRUT || (data.rut && data.rut.length > 0), {
  message: 'El RUT es requerido si indicaste que lo tienes',
  path: ['rut']
});

/**
 * Sanitize text input to prevent injection attacks
 */
export function sanitizeText(text: string, maxLength = 1000): string {
  return text
    .trim()
    .slice(0, maxLength)
    // Remove any potential HTML/script tags
    .replace(/<[^>]*>/g, '')
    // Remove any potential SQL injection attempts
    .replace(/['";\\]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ');
}

/**
 * Validate and parse JSON safely
 */
export function safeParseJSON<T>(jsonString: string, schema?: z.ZodType<T>): T | null {
  try {
    const parsed = JSON.parse(jsonString);
    
    if (schema) {
      return schema.parse(parsed);
    }
    
    return parsed;
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}

/**
 * Helper to handle validation errors
 */
export function formatValidationError(error: z.ZodError): string {
  const firstError = error.errors[0];
  return firstError?.message || 'Error de validación';
}
