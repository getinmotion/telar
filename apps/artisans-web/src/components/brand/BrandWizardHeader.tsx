import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Store } from 'lucide-react';
import { MotionLogo } from '@/components/MotionLogo';
import { useShopNavigation } from '@/hooks/useShopNavigation';
import { useMasterAgent } from '@/context/MasterAgentContext';

interface BrandWizardHeaderProps {
  subtitle?: string;
}

export const BrandWizardHeader: React.FC<BrandWizardHeaderProps> = ({ subtitle }) => {
  const navigate = useNavigate();
  const { hasShop, navigateToShop } = useShopNavigation();
  const { masterState } = useMasterAgent();

  // Determinar subtítulo basado en estado si no se provee uno
  const getContextualSubtitle = () => {
    if (subtitle) return subtitle;
    
    const { marca } = masterState;
    const hasDiagnosis = marca.score > 0;
    const hasCompleteBrand = marca.logo && marca.claim && marca.colores.length > 0;

    if (hasDiagnosis) return 'Gestiona tu identidad de marca';
    if (hasCompleteBrand) return 'Edita o diagnostica tu marca';
    return 'Crea tu identidad visual';
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border shadow-sm">
      <div className="container mx-auto py-3 px-4">
        <div className="flex justify-between items-center">
          {/* Logo y Título */}
          <div className="flex items-center gap-4">
            <MotionLogo size="md" />
            <div>
              <div className="bg-primary/10 px-3 py-1 rounded-full inline-block">
                <span className="text-primary font-semibold text-sm">MI MARCA</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {getContextualSubtitle()}
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2">
            {hasShop && (
              <Button
                variant="ghost"
                size="sm"
                onClick={navigateToShop}
                className="hidden sm:flex"
              >
                <Store className="w-4 h-4 mr-2" />
                Mi Tienda
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Volver al Taller Digital</span>
              <span className="sm:hidden">Volver</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
