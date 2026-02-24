import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  X, 
  Clock, 
  Percent, 
  Gift, 
  Truck, 
  Shield, 
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface PromotionBanner {
  id: string;
  type: 'discount' | 'shipping' | 'payment' | 'seasonal' | 'announcement';
  message: string;
  details?: string;
  ctaText?: string;
  ctaAction?: () => void;
  variant: 'default' | 'success' | 'warning' | 'destructive';
  dismissible?: boolean;
  countdown?: {
    endDate: Date;
    text: string;
  };
}

interface PromotionBannerProps {
  banners?: PromotionBanner[];
  className?: string;
}

// Default banners for demo
const defaultBanners: PromotionBanner[] = [
  {
    id: 'free-shipping',
    type: 'shipping',
    message: '🚚 Envío GRATIS en compras superiores a $150.000',
    details: 'Válido para todo Colombia',
    variant: 'success',
    dismissible: true,
  },
  {
    id: 'weekend-sale',
    type: 'discount',
    message: '🎉 ¡30% OFF en productos seleccionados!',
    details: 'Fin de semana especial',
    ctaText: 'Ver ofertas',
    variant: 'destructive',
    countdown: {
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      text: 'Termina en'
    }
  },
  {
    id: 'payment-methods',
    type: 'payment',
    message: '💳 Paga contra entrega - Sin costos adicionales',
    variant: 'default',
    dismissible: true,
  }
];

export const PromotionBanner: React.FC<PromotionBannerProps> = ({ 
  banners = defaultBanners,
  className = '' 
}) => {
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const activeBanners = banners.filter(banner => !dismissedBanners.includes(banner.id));

  const dismissBanner = (bannerId: string) => {
    setDismissedBanners(prev => [...prev, bannerId]);
  };

  const getIconForType = (type: PromotionBanner['type']) => {
    switch (type) {
      case 'discount':
        return <Percent className="h-4 w-4" />;
      case 'shipping':
        return <Truck className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'seasonal':
        return <Gift className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariantClasses = (variant: PromotionBanner['variant']) => {
    switch (variant) {
      case 'success':
        return 'bg-neon-green-50 border-neon-green-200 text-deep-green';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'destructive':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-neon-green-50/50 border-neon-green-200 text-deep-green';
    }
  };

  if (activeBanners.length === 0) {
    return null;
  }

  // Cycle through banners if multiple
  const currentBanner = activeBanners[currentBannerIndex % activeBanners.length];

  // Auto-rotate banners
  React.useEffect(() => {
    if (activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [activeBanners.length]);

  // Countdown timer
  const [timeLeft, setTimeLeft] = React.useState<string>('');

  React.useEffect(() => {
    if (currentBanner.countdown) {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = currentBanner.countdown!.endDate.getTime() - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m`);
          } else {
            setTimeLeft(`${hours}h ${minutes}m`);
          }
        } else {
          setTimeLeft('¡Expirado!');
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [currentBanner]);

  return (
    <div className={`w-full ${className}`}>
      <Card className={`border-2 rounded-xl overflow-hidden shadow-float hover:shadow-hover transition-all duration-300 ${getVariantClasses(currentBanner.variant)}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-deep-green">
                {getIconForType(currentBanner.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {currentBanner.message}
                  </span>
                  
                  {currentBanner.details && (
                    <span className="text-xs opacity-80">
                      {currentBanner.details}
                    </span>
                  )}
                  
                  {currentBanner.countdown && timeLeft && (
                    <Badge variant="outline" className="text-xs border-neon-green-200 text-deep-green">
                      <Clock className="h-3 w-3 mr-1" />
                      {currentBanner.countdown.text}: {timeLeft}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentBanner.ctaText && currentBanner.ctaAction && (
                <Button
                  size="sm"
                  className="text-xs h-7 bg-gradient-to-r from-neon-green-400 to-neon-green-700 text-white hover:shadow-neon"
                  onClick={currentBanner.ctaAction}
                >
                  {currentBanner.ctaText}
                </Button>
              )}

              {/* Banner indicators for multiple banners */}
              {activeBanners.length > 1 && (
                <div className="flex gap-1">
                  {activeBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentBannerIndex ? 'bg-deep-green' : 'bg-deep-green/30'
                      }`}
                    />
                  ))}
                </div>
              )}

              {currentBanner.dismissible && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dismissBanner(currentBanner.id)}
                  className="h-7 w-7 opacity-70 hover:opacity-100 hover:bg-neon-green-100 hover:text-deep-green"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Trust indicators component
export const TrustIndicators: React.FC<{ className?: string }> = ({ className = '' }) => {
  const indicators = [
    {
      icon: <Shield className="h-4 w-4" />,
      text: 'Compra 100% Segura',
      subtext: 'SSL Certificado'
    },
    {
      icon: <Truck className="h-4 w-4" />,
      text: 'Envío Gratis',
      subtext: 'Compras +$150k'
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      text: 'Pago Contra Entrega',
      subtext: 'Sin recargos'
    },
    {
      icon: <Gift className="h-4 w-4" />,
      text: 'Productos Únicos',
      subtext: 'Hechos a mano'
    }
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {indicators.map((indicator, index) => (
        <div
          key={index}
          className="group flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-float hover:border-neon-green-200 transition-all duration-300"
        >
          <div className="text-deep-green group-hover:text-neon-green-500 transition-colors">
            {indicator.icon}
          </div>
          <div>
            <div className="text-sm font-semibold text-charcoal">{indicator.text}</div>
            <div className="text-xs text-muted-foreground">{indicator.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  );
};