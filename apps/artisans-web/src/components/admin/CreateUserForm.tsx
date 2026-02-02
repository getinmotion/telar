import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { PasswordRequirements } from './PasswordRequirements';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CreateUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Validaciones en tiempo real
  const validateEmail = (email: string): string | null => {
    if (!email) return 'El email es requerido';
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    if (email.length > 254) return 'Email demasiado largo';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Debe incluir al menos una mayúscula';
    if (!/[a-z]/.test(password)) return 'Debe incluir al menos una minúscula';
    if (!/\d/.test(password)) return 'Debe incluir al menos un número';
    return null;
  };

  const validateConfirmPassword = (confirm: string, original: string): string | null => {
    if (!confirm) return 'Confirma la contraseña';
    if (confirm !== original) return 'Las contraseñas no coinciden';
    return null;
  };

  const generateSecurePassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Garantizar al menos un carácter de cada tipo
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Completar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mezclar los caracteres
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setFormData(prev => ({ 
      ...prev, 
      password, 
      confirmPassword: password 
    }));
    
    toast({
      title: 'Contraseña generada',
      description: 'Se ha generado una contraseña segura. Puedes copiarla al portapapeles.',
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado',
        description: `${label} copiado al portapapeles.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar al portapapeles.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todo el formulario
    const newErrors: Record<string, string> = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmError = validateConfirmPassword(formData.confirmPassword, formData.password);
    if (confirmError) newErrors.confirmPassword = confirmError;
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast({
        title: 'Errores en el formulario',
        description: 'Por favor corrige los errores antes de continuar.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      console.log('Creando usuario admin:', formData.email);
      
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
          fullName: formData.fullName.trim() || undefined
        }
      });
      
      if (error) {
        console.error('Error de función:', error);
        throw new Error(error.message || 'Error al llamar la función');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      toast({
        title: 'Usuario creado exitosamente',
        description: `El usuario ${formData.email} ha sido creado y puede acceder al sistema.`,
      });
      
      // Limpiar formulario
      setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
      setErrors({});
      onSuccess();
      
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      
      let errorMessage = 'Error desconocido al crear el usuario';
      
      if (error.message?.includes('already been registered')) {
        errorMessage = 'Ya existe un usuario con este email';
      } else if (error.message?.includes('password')) {
        errorMessage = 'La contraseña no cumple con los requisitos de seguridad';
      } else if (error.message?.includes('email')) {
        errorMessage = 'El email proporcionado no es válido';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error al crear usuario',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email *
        </Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={cn(
              "bg-background border-input",
              errors.email && "border-destructive focus-visible:ring-destructive"
            )}
            placeholder="usuario@empresa.com"
            maxLength={254}
          />
          {formData.email && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0"
              onClick={() => copyToClipboard(formData.email, 'Email')}
            >
              <Copy className="w-4 h-4" />
            </Button>
          )}
        </div>
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email}</p>
        )}
      </div>

      {/* Nombre completo (opcional) */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Nombre completo (opcional)
        </Label>
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          className="bg-background border-input"
          placeholder="Nombre del administrador"
          maxLength={100}
        />
      </div>

      {/* Contraseña */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Contraseña *
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateSecurePassword}
            className="text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Generar
          </Button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={cn(
              "bg-background border-input pr-20",
              errors.password && "border-destructive focus-visible:ring-destructive"
            )}
            placeholder="Mínimo 8 caracteres"
            maxLength={128}
          />
          <div className="absolute right-1 top-1 flex gap-1">
            {formData.password && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => copyToClipboard(formData.password, 'Contraseña')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password}</p>
        )}
        
        <PasswordStrengthIndicator password={formData.password} />
      </div>

      {/* Confirmar contraseña */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar contraseña *
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={cn(
              "bg-background border-input pr-10",
              errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
            )}
            placeholder="Repite la contraseña"
            maxLength={128}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-destructive text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Requisitos de contraseña */}
      {formData.password && (
        <PasswordRequirements password={formData.password} />
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isCreating}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/90"
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Usuario'
          )}
        </Button>
      </div>
    </form>
  );
};