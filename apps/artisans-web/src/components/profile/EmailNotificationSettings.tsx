import React from 'react';
import { Mail } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEmailPreferences } from '@/hooks/useEmailPreferences';
import { Skeleton } from '@/components/ui/skeleton';

const categoryLabels = {
  moderation: 'Moderación',
  shop: 'Tienda',
  products: 'Productos',
  progress: 'Progreso',
  account: 'Cuenta',
  system: 'Sistema',
};

const categoryDescriptions = {
  moderation: 'Productos aprobados, rechazados o cambios solicitados',
  shop: 'Tienda creada, publicada o primera venta',
  products: 'Stock bajo, productos agotados',
  progress: 'Milestones completados, logros desbloqueados',
  account: 'Bienvenida, perfil completado, datos bancarios',
  system: 'Anuncios importantes y actualizaciones del sistema',
};

export const EmailNotificationSettings: React.FC = () => {
  const { preferences, loading, updateCategory } = useEmailPreferences();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Notificaciones por Email</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Notificaciones por Email</p>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Configura qué notificaciones quieres recibir por correo electrónico
      </p>
      <div className="space-y-4">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor={`email-${key}`} className="text-sm font-medium cursor-pointer">
                {label}
              </Label>
              <p className="text-xs text-muted-foreground">
                {categoryDescriptions[key as keyof typeof categoryDescriptions]}
              </p>
            </div>
            <Switch
              id={`email-${key}`}
              checked={preferences[key as keyof typeof preferences]}
              onCheckedChange={(checked) => updateCategory(key as keyof typeof preferences, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};