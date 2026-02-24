import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, User, Shield, Store, RefreshCw, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExistingUserData {
  exists: boolean;
  is_admin: boolean;
  is_shop_owner: boolean;
  user_type: string | null;
  email: string;
}

interface ExistingUserHandlerProps {
  userData: ExistingUserData;
  onCreateNew: () => void;
  onCancel: () => void;
  className?: string;
}

export const ExistingUserHandler: React.FC<ExistingUserHandlerProps> = ({
  userData,
  onCreateNew,
  onCancel,
  className
}) => {
  const getUserTypeDisplay = () => {
    if (userData.is_admin) return { label: 'Administrador', icon: Shield, variant: 'destructive' as const };
    if (userData.is_shop_owner) return { label: 'Propietario de Tienda', icon: Store, variant: 'secondary' as const };
    if (userData.user_type === 'regular') return { label: 'Usuario Regular', icon: User, variant: 'outline' as const };
    return { label: 'Usuario Básico', icon: User, variant: 'outline' as const };
  };

  const typeDisplay = getUserTypeDisplay();
  const TypeIcon = typeDisplay.icon;

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mb-2">
          <AlertCircle className="h-6 w-6 text-warning" />
        </div>
        <CardTitle className="text-lg">Usuario Ya Existe</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            El email <strong>{userData.email}</strong> ya está registrado en el sistema.
          </p>
          
          <div className="flex items-center justify-center space-x-2">
            <TypeIcon className="h-4 w-4" />
            <Badge variant={typeDisplay.variant} className="text-xs">
              {typeDisplay.label}
            </Badge>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">Opciones disponibles:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span>El usuario ya puede acceder al sistema</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span>Puedes crear un usuario adicional con diferente tipo</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-muted-foreground rounded-full" />
              <span>Contacta al usuario para gestión de cuenta</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-2 pt-2">
          <Button 
            onClick={onCreateNew}
            variant="default" 
            size="sm"
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Crear Usuario con Tipo Diferente
          </Button>
          
          <Button 
            onClick={onCancel}
            variant="outline" 
            size="sm"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};