import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useProducts } from '@/hooks/useProducts';
import { ArtisanOnboarding } from './ArtisanOnboarding';
import { AIProductUpload } from '@/components/shop/AIProductUpload';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Plus, 
  Eye,
  AlertCircle,
  Target,
  Sparkles
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ArtisanDashboard: React.FC = () => {
  const { shop, loading } = useArtisanShop();
  const { products } = useProducts(shop?.id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if AI product upload flow is requested
  const flowMode = searchParams.get('flow');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!shop) {
    return <ArtisanOnboarding />;
  }

  // Show AI Product Upload flow if requested
  if (flowMode === 'ai-product-upload') {
    return <AIProductUpload />;
  }

  const stats = [
    {
      title: 'Mis Creaciones',
      value: products.length,
      icon: Package,
      description: 'piezas en tu catálogo',
    },
    {
      title: 'Pedidos',
      value: 0,
      icon: ShoppingCart,
      description: 'pedidos activos',
    },
    {
      title: 'Visibilidad',
      value: 0,
      icon: Eye,
      description: 'personas que vieron tu trabajo',
    },
    {
      title: 'Ingresos',
      value: '$0',
      icon: TrendingUp,
      description: 'de este mes',
    },
  ];

  const quickActions = [
    {
      title: "Mi Espacio",
      description: "Administra tu tienda digital y perfil",
      icon: Store,
      action: () => navigate('/mi-tienda'),
    },
    {
      title: 'Subir Productos',
      description: 'Comparte tus nuevas creaciones',
      icon: Sparkles,
      action: () => navigate('/productos/subir'),
    },
    {
      title: 'Ver mi Vitrina',
      description: 'Mira cómo te ven tus clientes',
      icon: Eye,
      action: () => window.open(`/tienda/${shop.shop_slug}`, '_blank'),
    },
    {
      title: 'Mis Tareas',
      description: 'Revisa pasos para crecer tu negocio',
      icon: Target,
      action: () => navigate('/dashboard/tasks'),
    },
  ];

  const suggestions = [
    {
      title: 'Cuenta tu historia',
      description: 'A la gente le gusta saber quién hace lo que compra',
      completed: !!(shop.story && shop.certifications?.length),
    },
    {
      title: 'Ponle cara a tu marca',
      description: 'Sube una foto tuya o de tu logo',
      completed: !!shop.logo_url,
    },
    {
      title: 'Muestra tu trabajo',
      description: 'Sube al menos 5 productos para que la gente vea lo que haces',
      completed: products.length >= 5,
    },
    {
      title: 'Conecta tus redes',
      description: 'Si tienes Instagram o Facebook, vincúlalos acá',
      completed: !!(shop.social_links?.instagram || shop.social_links?.facebook),
    },
  ];

  const completedSuggestions = suggestions.filter(s => s.completed).length;
  const progressPercentage = (completedSuggestions / suggestions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header with Avatar and Welcome - Financial App Style */}
      <div className="flex items-center justify-between bg-card rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--gradient-primary)] flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-[var(--shadow-elegant)]">
            {shop.shop_name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              ¡Hola! Bienvenido
            </h1>
            <p className="text-muted-foreground">
              {shop.shop_name}
            </p>
          </div>
        </div>
        <Badge variant="default" className="text-sm font-semibold px-4 py-2">
          {shop.craft_type?.charAt(0).toUpperCase() + shop.craft_type?.slice(1)}
        </Badge>
      </div>

      {/* Metrics Grid - Financial App Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div key={stat.title} className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:scale-[1.02] animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Progress Ring - Apple Fitness Style */}
      <div className="bg-card rounded-2xl p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <div className="relative">
              <svg width="160" height="160" className="transform -rotate-90">
                {/* Background ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#EAEAEA"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#B8FF5C"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - progressPercentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(184, 255, 92, 0.5))' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{Math.round(progressPercentage)}%</p>
                  <p className="text-xs text-muted-foreground">Completado</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-foreground mb-2">Tu Progreso Artesanal</h3>
            <p className="text-muted-foreground mb-4">
              {completedSuggestions} de {suggestions.length} pasos completados
            </p>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${suggestion.completed ? 'bg-primary' : 'bg-muted'}`} />
                  <span className={`text-sm ${suggestion.completed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}`}>
                    {suggestion.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Services Style */}
      <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-xl font-bold text-foreground mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <div
              key={action.title}
              onClick={action.action}
              className="group cursor-pointer bg-[var(--gradient-subtle)] border border-primary/20 rounded-xl p-5 hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:scale-[1.02] animate-fade-in"
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className="w-12 h-12 rounded-full bg-[var(--gradient-primary)] flex items-center justify-center mb-3 shadow-[var(--shadow-card)] group-hover:scale-110 transition-transform">
                <action.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions - Task Cards */}
      <div className="bg-card rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Pasos Recomendados
          </h2>
          <span className="text-sm text-muted-foreground">{suggestions.length - completedSuggestions} pendientes</span>
        </div>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                suggestion.completed
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    suggestion.completed
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {suggestion.completed ? '✓' : index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
