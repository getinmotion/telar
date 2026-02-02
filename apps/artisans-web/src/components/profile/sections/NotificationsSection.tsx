import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, ShoppingBag, Package, TrendingUp, UserCog, Settings, Loader2 } from 'lucide-react';

interface NotificationCategory {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

interface NotificationsSectionProps {
  preferences: {
    moderation: boolean;
    shop: boolean;
    products: boolean;
    progress: boolean;
    account: boolean;
    system: boolean;
  };
  loading?: boolean;
  saving?: boolean;
  onToggle: (category: string, value: boolean) => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  preferences,
  loading,
  saving,
  onToggle,
}) => {
  const categories: NotificationCategory[] = [
    {
      key: 'moderation',
      label: 'Moderación',
      description: 'Actualizaciones sobre el estado de tus productos',
      icon: Package,
      enabled: preferences.moderation,
    },
    {
      key: 'shop',
      label: 'Tienda',
      description: 'Nuevos pedidos y actividad de tu tienda',
      icon: ShoppingBag,
      enabled: preferences.shop,
    },
    {
      key: 'products',
      label: 'Productos',
      description: 'Alertas de inventario y productos',
      icon: Package,
      enabled: preferences.products,
    },
    {
      key: 'progress',
      label: 'Progreso',
      description: 'Logros y avances en tu camino artesanal',
      icon: TrendingUp,
      enabled: preferences.progress,
    },
    {
      key: 'account',
      label: 'Cuenta',
      description: 'Cambios importantes en tu cuenta',
      icon: UserCog,
      enabled: preferences.account,
    },
    {
      key: 'system',
      label: 'Sistema',
      description: 'Actualizaciones y novedades de la plataforma',
      icon: Settings,
      enabled: preferences.system,
    },
  ];

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notificaciones
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Configura qué notificaciones deseas recibir por correo electrónico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div 
              key={category.key}
              className="flex items-center justify-between py-4 border-b border-border last:border-0"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor={category.key} className="text-base font-medium cursor-pointer">
                    {category.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
              <Switch
                id={category.key}
                checked={category.enabled}
                onCheckedChange={(checked) => onToggle(category.key, checked)}
                disabled={saving}
              />
            </div>
          );
        })}

        <div className="pt-4 text-xs text-muted-foreground">
          Los cambios se guardan automáticamente
        </div>
      </CardContent>
    </Card>
  );
};
