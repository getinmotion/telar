import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Copy, Check, User, Sparkles, Mail, Lock, Briefcase, Palette } from 'lucide-react';
import { createTestUser, generateTestCredentials, type TestUserCredentials } from '@/lib/testUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export const TestUserManager: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [lastCreatedUser, setLastCreatedUser] = useState<TestUserCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  // Custom options
  const [customEmail, setCustomEmail] = useState('');
  const [customBusinessName, setCustomBusinessName] = useState('');
  const [customCraftType, setCustomCraftType] = useState('');

  const craftTypes = [
    'Cerámica',
    'Tejido',
    'Cuero',
    'Madera',
    'Joyería',
    'Cestería',
    'Vidrio',
    'Metal',
    'Textil',
    'Pintura'
  ];

  const handleCreateTestUser = async (useCustom: boolean = false) => {
    setIsCreating(true);
    setLastCreatedUser(null);

    try {
      let options = {};

      if (useCustom) {
        if (customEmail || customBusinessName || customCraftType) {
          options = {
            email: customEmail || undefined,
            businessName: customBusinessName || undefined,
            craftType: customCraftType || undefined,
            password: 'TestUser123!'
          };
        }
      }

      const result = await createTestUser(options);

      if (!result.success || !result.credentials) {
        throw new Error(result.error || 'Error creando usuario de prueba');
      }

      setLastCreatedUser(result.credentials);

      toast({
        title: '✅ Usuario de prueba creado',
        description: `Credenciales listas para copiar. Email: ${result.credentials.email}`,
        duration: 5000,
      });

      // Clear custom fields
      setCustomEmail('');
      setCustomBusinessName('');
      setCustomCraftType('');

    } catch (error: any) {
      console.error('Error creating test user:', error);
      toast({
        title: '❌ Error',
        description: error.message || 'No se pudo crear el usuario de prueba',
        variant: 'destructive',
        duration: 7000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);

      toast({
        title: 'Copiado',
        description: `${field} copiado al portapapeles`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar al portapapeles',
        variant: 'destructive',
      });
    }
  };

  const CopyButton: React.FC<{ text: string; field: string }> = ({ text, field }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => copyToClipboard(text, field)}
      className="h-8 w-8"
    >
      {copiedField === field ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Quick Create Section */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Crear Usuario de Prueba Rápido
          </CardTitle>
          <CardDescription>
            Genera un usuario completo con test de madurez, contexto de negocio y tareas iniciales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              El usuario incluirá:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Cuenta verificada automáticamente</li>
                <li>Test de madurez completado (65, 45, 55, 40)</li>
                <li>Contexto de negocio artesanal</li>
                <li>3 tareas iniciales personalizadas</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => handleCreateTestUser(false)}
            disabled={isCreating}
            size="lg"
            className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creando usuario...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Crear Usuario Aleatorio
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Custom Create Section */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            Crear Usuario Personalizado
          </CardTitle>
          <CardDescription>
            Define características específicas del usuario de prueba
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email (opcional)
              </Label>
              <Input
                id="custom-email"
                type="email"
                placeholder="test@example.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-craft" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Tipo de Artesanía
              </Label>
              <Select
                value={customCraftType}
                onValueChange={setCustomCraftType}
                disabled={isCreating}
              >
                <SelectTrigger id="custom-craft">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {craftTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="custom-business" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Nombre del Negocio (opcional)
              </Label>
              <Input
                id="custom-business"
                placeholder="Cerámica Luna"
                value={customBusinessName}
                onChange={(e) => setCustomBusinessName(e.target.value)}
                disabled={isCreating}
              />
            </div>
          </div>

          <Button
            onClick={() => handleCreateTestUser(true)}
            disabled={isCreating}
            variant="outline"
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Crear Usuario Personalizado
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Credentials Display */}
      {lastCreatedUser && (
        <Card className="border-success/50 bg-success/5">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              <Check className="h-5 w-5" />
              Usuario Creado Exitosamente
            </CardTitle>
            <CardDescription>
              Usa estas credenciales para iniciar sesión
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border">
                <div className="space-y-1 flex-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    Email
                  </div>
                  <div className="font-mono text-sm">{lastCreatedUser.email}</div>
                </div>
                <CopyButton text={lastCreatedUser.email} field="Email" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border">
                <div className="space-y-1 flex-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    Contraseña
                  </div>
                  <div className="font-mono text-sm">{lastCreatedUser.password}</div>
                </div>
                <CopyButton text={lastCreatedUser.password} field="Contraseña" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border">
                <div className="space-y-1 flex-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-3 w-3" />
                    Nombre del Negocio
                  </div>
                  <div className="font-medium text-sm">{lastCreatedUser.businessName}</div>
                </div>
                <CopyButton text={lastCreatedUser.businessName} field="Negocio" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border">
                <div className="space-y-1 flex-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Palette className="h-3 w-3" />
                    Tipo de Artesanía
                  </div>
                  <div className="font-medium text-sm">{lastCreatedUser.craftType}</div>
                </div>
                <CopyButton text={lastCreatedUser.craftType} field="Artesanía" />
              </div>
            </div>

            <Alert className="bg-accent/10 border-accent/50">
              <Sparkles className="h-4 w-4 text-accent" />
              <AlertDescription>
                El usuario ya tiene el test de madurez completado y 3 tareas iniciales.
                Puedes iniciar sesión directamente sin completar onboarding.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
