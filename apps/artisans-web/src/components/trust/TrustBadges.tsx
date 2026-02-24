import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrustBadges } from '@/hooks/useTrustBadges';
import { 
  Shield, 
  Truck, 
  Award, 
  RotateCcw,
  CheckCircle
} from 'lucide-react';

const badgeIcons = {
  security: Shield,
  shipping: Truck,
  quality: Award,
  guarantee: RotateCcw
};

export const TrustBadges: React.FC = () => {
  const { badges, loading } = useTrustBadges();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (badges.length === 0) return null;

  return (
    <Card className="glass-panel">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Garantías de Confianza</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {badges.map((badge) => {
              const IconComponent = badgeIcons[badge.badge_type];
              
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{badge.name}</h4>
                    {badge.description && (
                      <p className="text-xs text-muted-foreground">
                        {badge.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};