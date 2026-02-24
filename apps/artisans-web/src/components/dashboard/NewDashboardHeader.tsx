
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, LogOut, MessageCircle, Store, Palette } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';
import { MotionLogo } from '@/components/MotionLogo';

import { useLanguage } from '@/context/LanguageContext';

interface NewDashboardHeaderProps {
  onMaturityCalculatorClick: () => void;
}

export const NewDashboardHeader: React.FC<NewDashboardHeaderProps> = ({ 
  onMaturityCalculatorClick
}) => {
  const { signOut } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  

  // Detectar si estamos en el wizard de perfil
  const isInMaturityCalculator = location.pathname === '/maturity-calculator';

  return (
    <header className="fixed top-4 left-4 right-4 z-50 mx-2 sm:mx-4 lg:mx-6">
      <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <MotionLogo variant="dark" size="lg" />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mostrar botones normales si NO está en maturity calculator */}
          {!isInMaturityCalculator && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/dashboard/milestone-progress'}
                className="group flex items-center gap-2 text-primary hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Taller</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/mi-tienda'}
                className="group flex items-center gap-2 text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Tienda</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={onMaturityCalculatorClick}
                className="group flex items-center gap-2 border-accent text-accent-foreground hover:bg-accent/10 transition-colors"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Completar Perfil</span>
              </Button>
            </>
          )}

          {/* Botón "Volver al Dashboard" si está en maturity calculator */}
          {isInMaturityCalculator && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
              className="group flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10 transition-colors"
            >
              <span className="font-medium">← Volver al Taller Digital</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="group flex items-center gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Salir</span>
          </Button>
        </div>
      </div>

    </header>
  );
};
