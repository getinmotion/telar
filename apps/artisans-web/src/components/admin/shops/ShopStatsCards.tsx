import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Store, Eye, Clock, Sparkles, CreditCard, TrendingUp } from 'lucide-react';
import { ShopStats } from '@/hooks/useAdminShops';

interface ShopStatsCardsProps {
  stats: ShopStats;
  loading?: boolean;
}

export const ShopStatsCards: React.FC<ShopStatsCardsProps> = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Tiendas',
      value: stats.total,
      icon: Store,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'En Marketplace',
      value: stats.marketplace_visible,
      icon: Eye,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      subtitle: `${((stats.marketplace_visible / stats.total) * 100 || 0).toFixed(0)}% del total`,
    },
    {
      title: 'Pendientes Aprobación',
      value: stats.pending_approval,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Nuevas (7 días)',
      value: stats.new_this_week,
      icon: Sparkles,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Con Cobre',
      value: stats.with_cobre,
      icon: CreditCard,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
      subtitle: `${stats.without_cobre} sin configurar`,
    },
    {
      title: 'Activas',
      value: stats.active,
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      subtitle: `${stats.inactive} inactivas`,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-12 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
                )}
              </div>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
