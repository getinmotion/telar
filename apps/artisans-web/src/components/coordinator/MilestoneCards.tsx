import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Palette, Package, CheckCircle2, ArrowRight } from 'lucide-react';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';

export const MilestoneCards: React.FC = () => {
  const { masterState } = useMasterAgent();
  const { context } = useUnifiedUserData();
  const navigate = useNavigate();
  
  // ✅ FASE 4: Priorizar brand_diagnosis sobre brand_evaluation
  const brandScore = React.useMemo(() => {
    const diagnosis = (context?.conversationInsights as any)?.brand_diagnosis;
    const evaluation = (context?.conversationInsights as any)?.brand_evaluation;
    
    if (diagnosis?.average_score) {
      // Convertir score 1-5 a 0-100
      return Math.round((diagnosis.average_score / 5) * 100);
    }
    
    if (evaluation?.score) {
      return evaluation.score;
    }
    
    return masterState.marca.score || 0;
  }, [context, masterState.marca.score]);

  const milestones = [
    {
      id: 'tienda',
      title: 'Tienda',
      icon: Store,
      active: masterState.tienda.has_shop,
      activeContent: {
        title: masterState.tienda.shop_name || 'Tienda Activa',
        description: `${masterState.tienda.products_count} productos`,
        badge: 'Activa',
        badgeVariant: 'default' as const,
        action: 'Ver Tienda',
        route: '/mi-tienda'
      },
      inactiveContent: {
        title: 'Crea tu Tienda',
        description: 'Tu tienda digital con IA',
        badge: 'Pendiente',
        badgeVariant: 'secondary' as const,
        action: 'Crear Ahora',
        route: '/dashboard/create-shop'
      }
    },
    {
      id: 'marca',
      title: 'Marca',
      icon: Palette,
      active: masterState.marca.logo && masterState.marca.colores.length > 0,
      activeContent: {
        title: 'Identidad Definida',
        description: `Score: ${brandScore}/100`,
        badge: 'Completa',
        badgeVariant: 'default' as const,
        action: 'Ver Marca',
        route: '/dashboard/brand-wizard'
      },
      inactiveContent: {
        title: 'Define tu Marca',
        description: 'Logo y colores con IA',
        badge: 'Pendiente',
        badgeVariant: 'secondary' as const,
        action: 'Empezar',
        route: '/dashboard/brand-wizard'
      }
    },
    {
      id: 'productos',
      title: 'Productos',
      icon: Package,
      active: masterState.inventario.productos.length > 0,
      activeContent: {
        title: `${masterState.inventario.productos.length} Productos`,
        description: masterState.inventario.stock_total > 0 
          ? `Stock: ${masterState.inventario.stock_total} unidades`
          : 'Catálogo activo',
        badge: 'Activo',
        badgeVariant: 'default' as const,
        action: 'Ver Inventario',
        route: '/dashboard/inventory'
      },
      inactiveContent: {
        title: 'Carga Productos',
        description: 'Sube tu catálogo',
        badge: 'Pendiente',
        badgeVariant: 'secondary' as const,
        action: 'Subir',
        route: '/productos/subir'
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {milestones.map((milestone) => {
        const Icon = milestone.icon;
        const content = milestone.active ? milestone.activeContent : milestone.inactiveContent;
        
        return (
          <Card 
            key={milestone.id}
            className={`cursor-pointer hover:shadow-lg transition-all ${
              milestone.active ? 'border-primary/50 bg-primary/5' : 'border-border'
            }`}
            onClick={() => navigate(content.route)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${milestone.active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <CardTitle className="text-base">{milestone.title}</CardTitle>
                </div>
                {milestone.active && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm mb-1">{content.title}</p>
                <p className="text-xs text-muted-foreground">{content.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={content.badgeVariant} className="text-xs">
                  {content.badge}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(content.route);
                  }}
                >
                  {content.action}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
