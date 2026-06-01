import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { MotionLogo } from '@/components/MotionLogo';
import { LoginOnboardingSlider } from '@/components/auth/LoginOnboardingSlider';
import { Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  RegisterFormData,
  RegisterPayload,
  RegisterSuccessResponse,
  REGISTER_FORM_INITIAL_VALUES,
} from './types';
import { register } from './actions/register.actions';
import { getAllIdTypes, type IdTypeUser } from '@/services/idTypeUser.actions';
import { getAllCountries, type Country } from '@/services/countries.actions';
import { getAllAgreements, type Agreement } from '@/services/agreements.actions';

interface Municipio {
  municipio: string;
  codigo: string;
}

interface CiudadesDane {
  [departamento: string]: Municipio[];
}

const labelClass = 'text-[10px] uppercase tracking-widest font-extrabold text-muted-foreground block mb-1';
const inputClass = 'h-[52px] rounded-[12px] border-border px-[18px] text-foreground placeholder:text-muted-foreground';
const selectTriggerClass = 'h-[52px] rounded-[12px] border-border px-[18px] text-foreground';

export const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [idTypes, setIdTypes] = useState<IdTypeUser[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loadingSelects, setLoadingSelects] = useState(true);

  const [ciudadesDane, setCiudadesDane] = useState<CiudadesDane>({});
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  const form = useForm<RegisterFormData>({
    defaultValues: REGISTER_FORM_INITIAL_VALUES,
    mode: 'onChange',
  });

  useEffect(() => {
    const loadSelectData = async () => {
      try {
        setLoadingSelects(true);
        const [idTypesData, countriesData, agreementsData] = await Promise.all([
          getAllIdTypes(),
          getAllCountries(),
          getAllAgreements(),
        ]);
        setIdTypes(idTypesData);
        setCountries(countriesData);
        setAgreements(agreementsData);
      } catch (error) {
        console.error('Error loading select data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos del formulario',
          variant: 'destructive',
        });
      } finally {
        setLoadingSelects(false);
      }
    };
    loadSelectData();
  }, [toast]);

  useEffect(() => {
    fetch('/ciudades_dane.json')
      .then(res => res.json())
      .then((data: CiudadesDane) => {
        setCiudadesDane(data);
        setDepartamentos(Object.keys(data).sort());
      })
      .catch(err => console.error('Error loading ciudades_dane.json:', err));
  }, []);

  const department = form.watch('department');
  useEffect(() => {
    if (department && ciudadesDane[department]) {
      setMunicipios(ciudadesDane[department].sort((a, b) =>
        a.municipio.localeCompare(b.municipio)
      ));
    } else {
      setMunicipios([]);
    }
  }, [department, ciudadesDane]);

  const password = form.watch('password');
  const hasRUT = form.watch('hasRUT');

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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // ⚠️ NO eliminar passwordConfirmation - el backend NestJS lo requiere para validación
      // daneCity se almacena como string en el form pero el backend requiere number
      const payload: RegisterPayload = {
        ...data,
        daneCity: parseInt(data.daneCity, 10),
      };
      const response: RegisterSuccessResponse = await register(payload);

      toast({
        title: "¡Cuenta creada exitosamente!",
        description: response.message || "Revisa tu correo para verificar tu cuenta.",
        duration: 5000,
      });

      navigate('/auth/verify-pending', {
        state: {
          email: response.user.email,
          userId: response.userId,
          firstName: data.firstName
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) return 'Por favor escribe tu correo electrónico';
    if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'El correo no es válido';
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Por favor crea una contraseña';
    if (getPasswordStrength(value) < 5) return 'Tu contraseña debe cumplir todos los requisitos';
    return true;
  };

  const validatePasswordConfirmation = (value: string) => {
    if (!value) return 'Por favor confirma tu contraseña';
    if (value !== form.getValues('password')) return 'Las contraseñas no son iguales';
    return true;
  };

  const validateWhatsApp = (value: string) => {
    if (!value || value === '+57') return 'Por favor escribe tu número de WhatsApp';
    if (!value.match(/^\+57\d{10}$/)) return 'El número debe tener +57 seguido de 10 dígitos';
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Creando cuenta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-4 md:p-6 lg:p-8">
      <div className="min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)] lg:h-[calc(100vh-64px)] bg-white rounded-[24px] flex flex-col lg:flex-row overflow-hidden lg:overflow-visible">

        {/* Panel izquierdo — formulario scrollable */}
        <div className="w-full lg:w-1/2 flex items-start justify-center overflow-y-auto lg:max-h-[calc(100vh-64px)]">
          <div className="w-full max-w-md px-8 py-8">

            {/* Logo */}
            <div className="mb-6 flex justify-start">
              <MotionLogo size="md" />
            </div>

            {/* Título */}
            <div className="mb-9 text-left">
              <h1 className="text-4xl font-bold text-foreground leading-tight">
                Crea tu cuenta
              </h1>
              <p className="text-[15px] text-muted-foreground mt-3">
                Únete a TELAR y lleva tu oficio al siguiente nivel
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                {/* Tipo de Identificación y Número */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="idTypeId"
                    rules={{ required: 'Por favor selecciona tu tipo de identificación' }}
                    render={({ field }) => (
                      <FormItem>
                        <label className={labelClass}>Tipo de ID</label>
                        <Select onValueChange={field.onChange} value={field.value} disabled={loadingSelects}>
                          <FormControl>
                            <SelectTrigger className={selectTriggerClass}>
                              <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingSelects ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-sm text-muted-foreground">Cargando...</span>
                              </div>
                            ) : (
                              idTypes.map((idType) => (
                                <SelectItem key={idType.id} value={idType.id}>
                                  {idType.typeName} ({idType.idTypeValue})
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
                    name="idNumber"
                    rules={{
                      required: 'Por favor escribe tu número de identificación',
                      validate: (value) => value.trim() !== '' || 'Por favor escribe tu número de identificación'
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <label className={labelClass}>Número de ID</label>
                        <div className="relative">
                          <FormControl>
                            <Input className={inputClass} placeholder="1234567890" {...field} />
                          </FormControl>
                          {!form.formState.errors.idNumber && field.value && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-green" />
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Convenio */}
                <FormField
                  control={form.control}
                  name="agreementId"
                  rules={{ required: 'Por favor selecciona un convenio' }}
                  render={({ field }) => (
                    <FormItem>
                      <label className={labelClass}>Convenio</label>
                      <Select onValueChange={field.onChange} value={field.value} disabled={loadingSelects}>
                        <FormControl>
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Selecciona un convenio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingSelects ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              <span className="text-sm text-muted-foreground">Cargando...</span>
                            </div>
                          ) : (
                            agreements.map((agreement) => (
                              <SelectItem key={agreement.id} value={agreement.id}>
                                {agreement.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        <label className={labelClass}>Nombre</label>
                        <div className="relative">
                          <FormControl>
                            <Input className={inputClass} placeholder="Juan" {...field} />
                          </FormControl>
                          {!form.formState.errors.firstName && field.value && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-green" />
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
                        <label className={labelClass}>Apellido</label>
                        <div className="relative">
                          <FormControl>
                            <Input className={inputClass} placeholder="Pérez" {...field} />
                          </FormControl>
                          {!form.formState.errors.lastName && field.value && (
                            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-green" />
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
                      <label className={labelClass}>Correo electrónico</label>
                      <div className="relative">
                        <FormControl>
                          <Input className={inputClass} type="email" placeholder="tu@correo.com" {...field} />
                        </FormControl>
                        {!form.formState.errors.email && field.value && (
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-green" />
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
                      <label className={labelClass}>Contraseña</label>
                      <div className="relative">
                        <FormControl>
                          <Input
                            className={`${inputClass} pr-12`}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {field.value && (
                        <div className="space-y-2 mt-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${i < passwordStrength ? 'bg-accent' : 'bg-muted'}`}
                              />
                            ))}
                          </div>
                          <ul className="text-xs space-y-1">
                            <li className={field.value.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}>
                              {field.value.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                            </li>
                            <li className={/[A-Z]/.test(field.value) ? 'text-green-600' : 'text-muted-foreground'}>
                              {/[A-Z]/.test(field.value) ? '✓' : '○'} Al menos una mayúscula
                            </li>
                            <li className={/[a-z]/.test(field.value) ? 'text-green-600' : 'text-muted-foreground'}>
                              {/[a-z]/.test(field.value) ? '✓' : '○'} Al menos una minúscula
                            </li>
                            <li className={/[0-9]/.test(field.value) ? 'text-green-600' : 'text-muted-foreground'}>
                              {/[0-9]/.test(field.value) ? '✓' : '○'} Al menos un número
                            </li>
                            <li className={/[^A-Za-z0-9]/.test(field.value) ? 'text-green-600' : 'text-muted-foreground'}>
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
                      <label className={labelClass}>Confirmar contraseña</label>
                      <div className="relative">
                        <FormControl>
                          <Input
                            className={`${inputClass} pr-12`}
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPasswordConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* RUT */}
                <div className="space-y-3 p-4 rounded-[12px] bg-black/[0.02] border border-black/[0.04]">
                  <FormField
                    control={form.control}
                    name="hasRUT"
                    render={({ field }) => (
                      <div className="flex items-center justify-between">
                        <label className={labelClass + ' mb-0'}>¿Tienes RUT?</label>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (!checked) form.setValue('rut', '');
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
                      rules={{ required: hasRUT ? 'Por favor escribe tu número de RUT' : false }}
                      render={({ field }) => (
                        <FormItem>
                          <div className="relative">
                            <FormControl>
                              <Input className={inputClass} placeholder="123456789-0" {...field} />
                            </FormControl>
                            {!form.formState.errors.rut && field.value && (
                              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-green" />
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

                {/* País */}
                <FormField
                  control={form.control}
                  name="countryId"
                  rules={{ required: 'Por favor selecciona tu país' }}
                  render={({ field }) => (
                    <FormItem>
                      <label className={labelClass}>País</label>
                      <Select onValueChange={field.onChange} value={field.value} disabled={loadingSelects}>
                        <FormControl>
                          <SelectTrigger className={selectTriggerClass}>
                            <SelectValue placeholder="Selecciona tu país" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingSelects ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              <span className="text-sm text-muted-foreground">Cargando...</span>
                            </div>
                          ) : (
                            countries.map((country) => (
                              <SelectItem key={country.id} value={country.id}>
                                {country.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Departamento y Ciudad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department"
                    rules={{ required: 'Por favor selecciona tu departamento' }}
                    render={({ field }) => (
                      <FormItem>
                        <label className={labelClass}>Departamento</label>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('city', '');
                            form.setValue('daneCity', '');
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={selectTriggerClass}>
                              <SelectValue placeholder="Selecciona tu departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {departamentos.length === 0 ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-sm text-muted-foreground">Cargando...</span>
                              </div>
                            ) : (
                              departamentos.map((dept) => (
                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
                    name="daneCity"
                    rules={{ required: 'Por favor selecciona tu ciudad' }}
                    render={({ field }) => (
                      <FormItem>
                        <label className={labelClass}>Ciudad / Municipio</label>
                        <Select
                          onValueChange={(codigo) => {
                            const mun = municipios.find(m => m.codigo === codigo);
                            if (mun) {
                              field.onChange(codigo);
                              form.setValue('city', mun.municipio, { shouldValidate: true });
                            }
                          }}
                          value={field.value}
                          disabled={!department || municipios.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className={selectTriggerClass}>
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
                            {municipios.map((mun) => (
                              <SelectItem key={mun.codigo} value={mun.codigo}>
                                {mun.municipio}
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
                      <label className={labelClass}>WhatsApp</label>
                      <div className="relative">
                        <FormControl>
                          <Input
                            className={inputClass}
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
                          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-green" />
                        )}
                      </div>
                      <FormDescription className="text-xs text-muted-foreground">
                        Escribe tu número con +57 al inicio
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Términos */}
                <div className="space-y-3 p-4 rounded-[12px] bg-black/[0.02] border border-black/[0.04]">
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    rules={{ required: 'Debes aceptar los términos para continuar' }}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <label className="text-sm leading-tight cursor-pointer text-foreground">
                            Acepto los{' '}
                            <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              Términos y Condiciones
                            </a>
                            {' '}y la{' '}
                            <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                              Política de Privacidad
                            </a>
                          </label>
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
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <label className="text-sm leading-tight cursor-pointer text-foreground">
                            Quiero recibir novedades y consejos para artesanos (opcional)
                          </label>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Botón CTA */}
                <div className="flex justify-start pt-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-[220px] h-12 rounded-[12px] bg-accent hover:bg-accent/90 text-white text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>
                </div>

                {/* Link a login */}
                <div className="text-left pb-2">
                  <span className="text-muted-foreground text-sm">¿Ya tienes cuenta? </span>
                  <Link to="/login" className="text-accent text-sm font-semibold hover:underline">
                    Inicia sesión
                  </Link>
                </div>

              </form>
            </Form>
          </div>
        </div>

        {/* Panel derecho — slider */}
        <div className="hidden lg:flex lg:w-1/2 p-3">
          <LoginOnboardingSlider />
        </div>

      </div>
    </div>
  );
};

export default Register;
