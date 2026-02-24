import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCraftLabel } from '@/components/cultural/artisanTranslations';

interface ArtisanProfileCardsProps {
  craftType: string;
  officialClassification?: string;
  language: 'en' | 'es';
  onAddClassification?: () => void;
}

export const ArtisanProfileCards = ({ 
  craftType, 
  officialClassification, 
  language,
  onAddClassification 
}: ArtisanProfileCardsProps) => {
  const t = {
    es: {
      officialTitle: 'Clasificación Oficial',
      officialSubtitle: 'Según catálogo de oficios artesanales',
      craftTitle: 'Tipo de Artesanía',
      craftSubtitle: 'Categoría principal de tu trabajo',
      detected: 'Detectado',
      noClassification: 'Sin clasificación oficial',
      addClassification: 'Agregar Clasificación',
      benefits: 'Esta clasificación ayuda a:',
      benefit1: 'Personalizar tus misiones y herramientas',
      benefit2: 'Conectarte con artesanos similares',
      benefit3: 'Recibir recomendaciones específicas'
    },
    en: {
      officialTitle: 'Official Classification',
      officialSubtitle: 'According to artisan trade catalog',
      craftTitle: 'Craft Type',
      craftSubtitle: 'Main category of your work',
      detected: 'Detected',
      noClassification: 'No official classification',
      addClassification: 'Add Classification',
      benefits: 'This classification helps to:',
      benefit1: 'Personalize your missions and tools',
      benefit2: 'Connect you with similar artisans',
      benefit3: 'Receive specific recommendations'
    }
  };

  const labels = t[language];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Clasificación Oficial Card */}
      <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-2 border-border hover:border-primary/30 transition-all">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{labels.officialTitle}</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{labels.officialSubtitle}</p>
            
            {officialClassification ? (
              <div className="text-sm text-foreground font-medium">
                {officialClassification}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-3">{labels.noClassification}</p>
                {onAddClassification && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onAddClassification}
                    className="text-xs"
                  >
                    {labels.addClassification}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Tipo de Artesanía Card - con más info */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-2 border-primary/20 hover:border-primary/40 transition-all">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{labels.craftTitle}</h3>
              <Badge className="bg-primary text-primary-foreground text-xs">
                {labels.detected}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{labels.craftSubtitle}</p>
            
            {/* Mostrar craft type siempre */}
            <div className="text-base font-bold text-foreground mb-3">
              {getCraftLabel(craftType)}
            </div>
            
            {/* Mostrar clasificación oficial si existe */}
            {officialClassification && (
              <div className="mt-2 pt-2 border-t border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'es' ? 'Oficio oficial:' : 'Official trade:'}
                </p>
                <p className="text-sm font-medium text-primary">
                  {officialClassification}
                </p>
              </div>
            )}
            
            {/* Benefits list - más compacto */}
            <div className="mt-4 space-y-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">{labels.benefits}</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{labels.benefit1}</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{labels.benefit2}</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{labels.benefit3}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
