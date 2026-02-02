import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { MotionLogo } from '@/components/MotionLogo';
import { Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client'; // Ya no usamos Supabase
import { useColombiaLocations } from '@/hooks/useColombiaLocations';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  RegisterFormData,
  RegisterPayload,
  RegisterSuccessResponse,
  REGISTER_FORM_INITIAL_VALUES,
} from './types';
import { register } from './actions/register.actions';

export const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Hook para obtener departamentos y municipios de datos.gov.co
  const { departments, getMunicipalities, isLoading: isLoadingLocations } = useColombiaLocations();

  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Configuración de useForm con validaciones
  const form = useForm<RegisterFormData>({
    defaultValues: REGISTER_FORM_INITIAL_VALUES,
    mode: 'onChange', // Validar en tiempo real
  });

  // Obtener ciudades disponibles según el departamento seleccionado
  const department = form.watch('department');
  const availableCities = useMemo(() => {
    if (!department) return [];
    return getMunicipalities(department);
  }, [department, getMunicipalities]);

  // Watch password para mostrar indicador de fuerza
  const password = form.watch('password');
  const hasRUT = form.watch('hasRUT');

  // Función para calcular la fuerza de la contraseña
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password || '');

  // Handler del submit con react-hook-form
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      // ⚠️ NO eliminar passwordConfirmation - el backend NestJS lo requiere para validación
      // RegisterFormData y RegisterPayload tienen la misma estructura
      const response: RegisterSuccessResponse = await register(data);


      // Mostrar mensaje de éxito
      toast({
        title: "¡Cuenta creada exitosamente!",
        description: response.message || "Revisa tu correo para verificar tu cuenta.",
        duration: 5000,
      });

      // Navegar a la página de verificación pendiente
      navigate('/auth/verify-pending', {
        state: {
          email: response.user.email,
          userId: response.userId,
          firstName: data.firstName
        }
      });

    } catch (error: any) {

      // Manejo de errores del backend
      const errorResponse = error?.response?.data;

      // Error de email ya registrado
      if (errorResponse?.errorCode === 'EMAIL_EXISTS' || errorResponse?.message?.includes('already exists')) {
        form.setError('email', {
          type: 'manual',
          message: 'Este correo ya está registrado'
        });

        toast({
          title: 'Este correo ya está registrado',
          description: (
            <div className="space-y-2">
              <p>Ya existe una cuenta con este correo.</p>
              <button
                onClick={() => navigate('/login')}
                className="text-sm underline hover:no-underline"
              >
                Ir a iniciar sesión
              </button>
            </div>
          ),
          variant: 'destructive',
          duration: 8000,
        });
        return;
      }

      // Otros errores
      const errorMessage = errorResponse?.message || error?.message || 'No pudimos procesar tu registro';

      toast({
        title: 'Error al crear la cuenta',
        description: errorMessage + '. Por favor intenta nuevamente.',
        variant: 'destructive',
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones de validación personalizadas
  const validateEmail = (value: string) => {
    if (!value.trim()) return 'Por favor escribe tu correo electrónico';
    if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return 'El correo no es válido';
    }
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Por favor crea una contraseña';
    const strength = getPasswordStrength(value);
    if (strength < 5) {
      return 'Tu contraseña debe cumplir todos los requisitos';
    }
    return true;
  };

  const validatePasswordConfirmation = (value: string) => {
    if (!value) return 'Por favor confirma tu contraseña';
    if (value !== form.getValues('password')) {
      return 'Las contraseñas no son iguales';
    }
    return true;
  };

  const validateWhatsApp = (value: string) => {
    if (!value || value === '+57') {
      return 'Por favor escribe tu número de WhatsApp';
    }
    if (!value.match(/^\+57\d{10}$/)) {
      return 'El número debe tener +57 seguido de 10 dígitos';
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="absolute top-0 left-0 right-0 z-20 p-4 lg:p-6">
        <MotionLogo variant="dark" size="lg" />
      </header>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">
                Crea tu cuenta
              </CardTitle>
              <CardDescription>
                Únete a TELAR y lleva tu oficio artesanal al siguiente nivel
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      rules={{
                        required: 'Por favor escribe tu nombre',
                        validate: (value) => value.trim() !== '' || 'Por favor escribe tu nombre'
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nombre <span className="text-destructive">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input placeholder="Juan" {...field} />
                            </FormControl>
                            {!form.formState.errors.firstName && field.value && (
                              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      rules={{
                        required: 'Por favor escribe tu apellido',
                        validate: (value) => value.trim() !== '' || 'Por favor escribe tu apellido'
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Apellido <span className="text-destructive">*</span>
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input placeholder="Pérez" {...field} />
                            </FormControl>
                            {!form.formState.errors.lastName && field.value && (
                              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{
                      required: 'Por favor escribe tu correo electrónico',
                      validate: validateEmail
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Correo electrónico <span className="text-destructive">*</span>
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input type="email" placeholder="tu@correo.com" {...field} />
                          </FormControl>
                          {!form.formState.errors.email && field.value && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    rules={{
                      required: 'Por favor crea una contraseña',
                      validate: validatePassword
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Contraseña <span className="text-destructive">*</span>
                        </FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1"
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            tabIndex={0}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {field.value && (
                          <div className="space-y-2">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full ${i < passwordStrength ? 'bg-success' : 'bg-muted'
                                    }`}
                                />
                              ))}
                            </div>
                            <ul className="text-xs space-y-1">
                              <li className={field.value.length >= 8 ? 'text-success' : 'text-muted-foreground'}>
                                {field.value.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                              </li>
                              <li className={/[A-Z]/.test(field.value) ? 'text-success' : 'text-muted-foreground'}>
                                {/[A-Z]/.test(field.value) ? '✓' : '○'} Al menos una mayúscula
                              </li>
                              <li className={/[a-z]/.test(field.value) ? 'text-success' : 'text-muted-foreground'}>
                                {/[a-z]/.test(field.value) ? '✓' : '○'} Al menos una minúscula
                              </li>
                              <li className={/[0-9]/.test(field.value) ? 'text-success' : 'text-muted-foreground'}>
                                {/[0-9]/.test(field.value) ? '✓' : '○'} Al menos un número
                              </li>
                              <li className={/[^A-Za-z0-9]/.test(field.value) ? 'text-success' : 'text-muted-foreground'}>
                                {/[^A-Za-z0-9]/.test(field.value) ? '✓' : '○'} Al menos un carácter especial
                              </li>
                            </ul>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Confirmation */}
                  <FormField
                    control={form.control}
                    name="passwordConfirmation"
                    rules={{
                      required: 'Por favor confirma tu contraseña',
                      validate: validatePasswordConfirmation
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar contraseña *</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPasswordConfirmation ? 'text' : 'password'}
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1"
                            aria-label={showPasswordConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            tabIndex={0}
                          >
                            {showPasswordConfirmation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* RUT */}
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <FormField
                      control={form.control}
                      name="hasRUT"
                      render={({ field }) => (
                        <div className="flex items-center justify-between">
                          <FormLabel className="font-medium">¿Tienes RUT?</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (!checked) {
                                  form.setValue('rut', '');
                                }
                              }}
                            />
                          </FormControl>
                        </div>
                      )}
                    />

                    {hasRUT ? (
                      <FormField
                        control={form.control}
                        name="rut"
                        rules={{
                          required: hasRUT ? 'Por favor escribe tu número de RUT' : false
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <div className="relative">
                              <FormControl>
                                <Input placeholder="123456789-0" {...field} />
                              </FormControl>
                              {!form.formState.errors.rut && field.value && (
                                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                              )}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No te preocupes, te ayudaremos a tramitarlo desde tu panel
                      </p>
                    )}
                  </div>

                  {/* Departamento y Ciudad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="department"
                      rules={{ required: 'Por favor selecciona tu departamento' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue('city', ''); // Limpiar ciudad al cambiar departamento
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tu departamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {isLoadingLocations ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  <span className="text-sm text-muted-foreground">Cargando...</span>
                                </div>
                              ) : (
                                departments.map((dept) => (
                                  <SelectItem key={dept} value={dept}>
                                    {dept}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      rules={{ required: 'Por favor selecciona tu ciudad' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad/Municipio *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!department || availableCities.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    !department
                                      ? "Primero selecciona tu departamento"
                                      : "Selecciona tu ciudad o municipio"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {availableCities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* WhatsApp */}
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    rules={{
                      required: 'Por favor escribe tu número de WhatsApp',
                      validate: validateWhatsApp
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp *</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              placeholder="+57 3xx xxx xxxx"
                              {...field}
                              onChange={(e) => {
                                let value = e.target.value;
                                if (!value.startsWith('+57')) value = '+57';
                                if (value.length > 13) value = value.slice(0, 13);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          {!form.formState.errors.whatsapp && field.value && field.value !== '+57' && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <FormDescription>
                          Escribe tu número con +57 al inicio
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Términos */}
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      rules={{ required: 'Debes aceptar los términos para continuar' }}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm leading-tight cursor-pointer">
                              Acepto los{' '}
                              <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Términos y Condiciones
                              </a>
                              {' '}y la{' '}
                              <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Política de Privacidad
                              </a>
                              {' '}*
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="newsletterOptIn"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm leading-tight cursor-pointer">
                              Quiero recibir novedades y consejos para artesanos (opcional)
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-6 text-lg font-semibold"
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-primary hover:underline font-medium"
                    >
                      Inicia sesión
                    </button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;

