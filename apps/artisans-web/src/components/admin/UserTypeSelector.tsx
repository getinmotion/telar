import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Store, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type UserType = 'admin' | 'shop_owner' | 'regular';

interface UserTypeOption {
  value: UserType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions: string[];
}

const userTypeOptions: UserTypeOption[] = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Acceso completo al sistema y gestión de usuarios',
    icon: Shield,
    permissions: [
      'Gestión completa de usuarios',
      'Acceso al panel administrativo',
      'Configuración del sistema',
      'Gestión de contenido global'
    ]
  },
  {
    value: 'shop_owner',
    label: 'Propietario de Tienda',
    description: 'Puede crear y gestionar su tienda artesanal',
    icon: Store,
    permissions: [
      'Crear y gestionar tienda',
      'Subir productos',
      'Gestionar pedidos',
      'Ver estadísticas de ventas'
    ]
  },
  {
    value: 'regular',
    label: 'Usuario Regular',
    description: 'Acceso básico al sistema',
    icon: User,
    permissions: [
      'Navegar por el catálogo',
      'Realizar pedidos',
      'Gestionar perfil personal'
    ]
  }
];

interface UserTypeSelectorProps {
  value: UserType;
  onValueChange: (value: UserType) => void;
  className?: string;
}

export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  value,
  onValueChange,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <Label className="text-base font-medium">Tipo de Usuario</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Selecciona el tipo de acceso que tendrá el usuario
        </p>
      </div>
      
      <RadioGroup value={value} onValueChange={onValueChange} className="space-y-3">
        {userTypeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          
          return (
            <Card 
              key={option.value} 
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                isSelected && 'ring-2 ring-primary bg-primary/5'
              )}
              onClick={() => onValueChange(option.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      <Icon className={cn(
                        'h-5 w-5',
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      )} />
                      <div>
                        <Label 
                          htmlFor={option.value}
                          className={cn(
                            'text-base font-semibold cursor-pointer',
                            isSelected && 'text-primary'
                          )}
                        >
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        Permisos incluidos:
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {option.permissions.map((permission, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                            <span>{permission}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>
    </div>
  );
};