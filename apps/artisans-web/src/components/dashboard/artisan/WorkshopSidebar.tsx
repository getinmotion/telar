import React, { useMemo } from 'react';
import { Package, DollarSign, TrendingUp, Eye, FileCheck, ChevronRight, Wrench, Star, ThumbsUp, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';

interface WorkshopMetric {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  status?: 'good' | 'warning' | 'critical';
  route?: string;
}

interface KeyAgent {
  id: string;
  name: string;
  icon: React.ReactNode;
  route: string;
}

interface WorkshopSidebarProps {
  metrics?: WorkshopMetric[];
  keyAgents?: KeyAgent[];
}

const defaultMetrics: WorkshopMetric[] = [
  {
    id: 'inventory',
    label: 'Inventario activo',
    value: '12 productos',
    icon: <Package className="w-4 h-4" />,
    status: 'good',
    route: '/dashboard/inventory'
  },
  {
    id: 'margin',
    label: 'Margen promedio',
    value: '27%',
    icon: <DollarSign className="w-4 h-4" />,
    status: 'good'
  },
  {
    id: 'sales',
    label: 'Ventas proyectadas',
    value: '$1.2M COP',
    icon: <TrendingUp className="w-4 h-4" />,
    status: 'good'
  },
  {
    id: 'presence',
    label: 'Presencia digital',
    value: '82/100',
    icon: <Eye className="w-4 h-4" />,
    status: 'good'
  },
  {
    id: 'formalization',
    label: 'Formalización',
    value: 'NIT completo ✅',
    icon: <FileCheck className="w-4 h-4" />,
    status: 'good'
  }
];

export const WorkshopSidebar: React.FC<WorkshopSidebarProps> = ({
  metrics: providedMetrics,
  keyAgents = []
}) => {
  const navigate = useNavigate();
  const { masterState } = useMasterAgent();
  const { profile, context } = useUnifiedUserData();

  // ✅ FASE 2: Obtener brandName real desde useUnifiedUserData
  const brandName = useMemo(() => {
    // Priorizar conversation_insights > business_profile > profile
    const insightsBrand = context?.conversationInsights?.nombre_marca;
    const contextBrand = context?.businessProfile?.brandName || context?.businessProfile?.brand_name;
    const profileBrand = profile?.brandName;
    
    return insightsBrand || contextBrand || profileBrand || 'Tu Taller';
  }, [context, profile]);

  // ✅ FASE 2: Estados diferenciados para brand_diagnosis vs brand_evaluation
  const brandIdentity = useMemo(() => {
    const diagnosis = (context?.conversationInsights as any)?.brand_diagnosis;
    const evaluation = (context?.conversationInsights as any)?.brand_evaluation;
    
    // Caso 1: Tiene diagnóstico profundo
    if (diagnosis?.average_score) {
      const score = diagnosis.average_score;
      const status = score >= 4 ? 'excellent' : score >= 3 ? 'good' : 'needs-work';
      const StatusIcon = score >= 4 ? Star : score >= 3 ? ThumbsUp : Wrench;
      
      return { 
        status,
        label: `Diagnosticada: ${score.toFixed(1)}/5`,
        icon: StatusIcon,
        action: 'Ver Diagnóstico',
        route: '/dashboard/brand-wizard'
      };
    }
    
    // Caso 2: Tiene evaluación básica pero NO diagnóstico profundo
    const hasLogo = evaluation?.logo_url || evaluation?.has_logo;
    const hasClaim = evaluation?.claim || evaluation?.has_claim;
    const hasColors = evaluation?.has_colors || (evaluation?.primary_colors && evaluation.primary_colors.length > 0) || (evaluation?.colors && evaluation.colors.length > 0);
    
    if (hasLogo && hasClaim && hasColors) {
      return { 
        status: 'pending-diagnosis', 
        label: 'Sin diagnóstico profundo',
        icon: Eye,
        action: 'Evaluar con IA',
        route: '/dashboard/brand-wizard'
      };
    }
    
    // Caso 3: Marca incompleta
    if (hasLogo || hasClaim || hasColors) {
      return { 
        status: 'incomplete', 
        label: 'Incompleta',
        icon: Wrench,
        action: 'Completar Identidad',
        route: '/dashboard/brand-wizard'
      };
    }
    
    // Caso 4: Sin marca
    return { 
      status: 'pending', 
      label: 'Pendiente',
      icon: Wrench,
      action: 'Crear Identidad',
      route: '/dashboard/brand-wizard'
    };
  }, [context]);

  // Generate real metrics from MasterAgentContext
  const metrics = useMemo(() => {
    const productCount = masterState.inventario.productos?.length || 0;
    const activeProducts = masterState.inventario.productos?.filter((p: any) => p.active).length || 0;
    const totalInventory = masterState.inventario.productos?.reduce(
      (sum: number, p: any) => sum + (p.inventory || 0), 0
    ) || 0;
    const brandScore = masterState.marca.score || 0;
    const hasShop = masterState.tienda.has_shop;

    console.log('[WorkshopSidebar] Métricas reales:', { 
      brandName,
      productCount, 
      activeProducts, 
      totalInventory, 
      brandScore, 
      hasShop,
      brandIdentityStatus: brandIdentity.status
    });

    if (providedMetrics) return providedMetrics;

    return [
      {
        id: 'inventory',
        label: 'Inventario activo',
        value: productCount > 0 ? `${activeProducts} productos` : 'Sin productos',
        icon: <Package className="w-4 h-4" />,
        status: productCount > 0 ? 'good' : 'warning',
        route: '/dashboard/inventory'
      },
      {
        id: 'units',
        label: 'Unidades disponibles',
        value: totalInventory > 0 ? `${totalInventory} unidades` : '0 unidades',
        icon: <Package className="w-4 h-4" />,
        status: totalInventory > 10 ? 'good' : 'warning'
      },
      {
        id: 'shop',
        label: 'Estado de tienda',
        value: hasShop ? 'Activa ✅' : 'Inactiva',
        icon: <Eye className="w-4 h-4" />,
        status: hasShop ? 'good' : 'warning',
        route: '/mi-tienda'
      },
      {
        id: 'brand',
        label: 'Identidad de marca',
        value: brandIdentity.label,
        icon: <TrendingUp className="w-4 h-4" />,
        status: brandIdentity.status === 'excellent' || brandIdentity.status === 'good' 
          ? 'good' 
          : brandIdentity.status === 'needs-work' 
          ? 'warning' 
          : 'critical',
        route: '/brand-wizard'
      },
      {
        id: 'formalization',
        label: 'Formalización',
        value: 'En progreso',
        icon: <FileCheck className="w-4 h-4" />,
        status: 'warning'
      }
    ];
  }, [masterState, providedMetrics, brandIdentity]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'good':
        return 'text-neon-green-700 bg-neon-green-50';
      case 'warning':
        return 'text-amber-700 bg-amber-50';
      case 'critical':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4 sticky top-6">
      {/* Workshop Metrics */}
      <Card className="bg-white rounded-2xl shadow-float hover:shadow-hover transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-charcoal flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            {brandName} en Movimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div 
            onClick={() => navigate(brandIdentity.route)}
            className={`flex items-center justify-between p-3 rounded-lg hover:bg-secondary/20 transition-all cursor-pointer group ${
              brandIdentity.status === 'excellent' ? 'bg-success/10 border border-success/20' :
              brandIdentity.status === 'good' ? 'bg-primary/10 border border-primary/20' :
              brandIdentity.status === 'needs-work' ? 'bg-warning/10 border border-warning/20' :
              brandIdentity.status === 'pending-diagnosis' ? 'bg-blue-50 border border-blue-200' :
              'bg-secondary/10'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Package className={`w-4 h-4 ${
                  brandIdentity.status === 'excellent' || brandIdentity.status === 'good' ? 'text-success' :
                  brandIdentity.status === 'pending-diagnosis' ? 'text-blue-600' :
                  'text-primary'
                }`} />
                <span className="text-xs font-semibold">Identidad de Marca</span>
              </div>
              <span className="text-xs text-muted-foreground">{brandIdentity.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>

      {/* Key Agents */}
      {keyAgents.length > 0 && (
        <Card className="bg-white rounded-2xl shadow-float hover:shadow-hover transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-charcoal flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Áreas Clave
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {keyAgents.map((mission) => (
              <Button
                key={mission.id}
                variant="ghost"
                onClick={() => navigate(mission.route)}
                className="w-full justify-start hover:bg-neon-green-50 text-charcoal hover:text-neon-green-700"
              >
                <div className="mr-2">{mission.icon}</div>
                <span className="text-sm font-medium">{mission.name}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Tip */}
      <div className="bg-white rounded-xl p-4 shadow-float hover:shadow-hover transition-all duration-300 border-2 border-neon-green-100">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-warning flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-charcoal mb-1">
              Consejo del Día
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              La consistencia es más importante que la perfección. Cada pequeño avance cuenta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
