import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';

const ONBOARDING_KEY = 'master-agent-onboarding-seen';

export const MasterAgentOnboarding: React.FC<{ onDismiss?: () => void }> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const userLocalStorage = useUserLocalStorage();

  useEffect(() => {
    // Check if user has seen the onboarding
    const hasSeenOnboarding = userLocalStorage.getItem(ONBOARDING_KEY);
    
    if (!hasSeenOnboarding) {
      // Show after a small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [userLocalStorage]);

  const handleDismiss = () => {
    userLocalStorage.setItem(ONBOARDING_KEY, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-28 right-6 z-[10001] animate-scale-in">
      <Card className="w-72 neumorphic">
        <CardContent className="p-4 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="absolute top-1 right-1 h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="space-y-3 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧙‍♂️</span>
              <h3 className="font-display font-bold text-foreground text-lg">
                ¡Hola! Soy tu Maestro
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Haz click aquí abajo para conversar conmigo. Te ayudaré a crecer tu negocio artesanal paso a paso.
            </p>
            
            <div className="flex items-center justify-center pt-2">
              <svg width="40" height="40" viewBox="0 0 40 40" className="text-primary animate-bounce">
                <path
                  d="M20 5 L20 30 M20 30 L15 25 M20 30 L25 25"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Arrow pointing to the button */}
      <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-border" />
    </div>
  );
};
