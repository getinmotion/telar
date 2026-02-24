import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, AlertCircle, CheckCircle, Package, Hammer, Sparkles } from 'lucide-react';
import { ClasificacionOficial } from '@/types/artisan';
import { motion } from 'framer-motion';

interface ArtisanClassificationDisplayProps {
  classification: ClasificacionOficial | null;
  craftType: string | null;
  isLoading?: boolean;
  onEditClassification: () => void;
  onEditCraftType: () => void;
}

export const ArtisanClassificationDisplay: React.FC<ArtisanClassificationDisplayProps> = ({
  classification,
  craftType,
  isLoading,
  onEditClassification,
  onEditCraftType
}) => {
  const getCraftTypeLabel = (type: string | null) => {
    const labels: Record<string, string> = {
      ceramic: 'Cerámica',
      textile: 'Textil',
      woodwork: 'Madera',
      leather: 'Cuero',
      jewelry: 'Joyería',
      fiber: 'Fibras Naturales',
      metal: 'Metal',
      stone: 'Piedra',
      mixed: 'Técnicas Mixtas'
    };
    return type ? labels[type] || type : null;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader className="space-y-2">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-20 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader className="space-y-2">
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-20 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Clasificación Oficial */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="h-full border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package className="h-5 w-5 text-primary" />
                  Clasificación Oficial
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Según catálogo de oficios artesanales
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEditClassification}
                className="hover:bg-primary/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {classification ? (
              <>
                {/* Oficio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">
                      Oficio
                    </label>
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Clasificado
                    </Badge>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="font-semibold text-foreground">
                      {classification.oficio}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        CUOC: {classification.codigoOficioCUOC}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        AdeC: {classification.codigoOficioAdeC}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Materia Prima */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Materia Prima
                  </label>
                  <div className="p-3 bg-secondary/30 rounded-lg border">
                    <p className="font-medium text-foreground">
                      {classification.materiaPrima}
                    </p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        CUOC: {classification.codigoMateriaPrimaCUOC}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        AdeC: {classification.codigoMateriaPrimaAdeC}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Técnicas */}
                {classification.tecnicas && classification.tecnicas.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Hammer className="h-4 w-4" />
                      Técnicas ({classification.tecnicas.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {classification.tecnicas.map((tecnica, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tecnica.nombre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confianza y Fecha */}
                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Nivel de confianza:</span>
                    <span className={`font-semibold ${getConfidenceColor(classification.confianza)}`}>
                      {getConfidenceLabel(classification.confianza)} ({Math.round(classification.confianza * 100)}%)
                    </span>
                  </div>
                  {classification.clasificadoAutomaticamente && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      Clasificado automáticamente por IA
                    </div>
                  )}
                </div>

                {/* Justificación */}
                {classification.justificacion && (
                  <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground italic">
                    "{classification.justificacion}"
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    Sin clasificación oficial
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Agrega tu clasificación según el catálogo oficial
                  </p>
                </div>
                <Button
                  onClick={onEditClassification}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Agregar Clasificación
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Tipo de Artesanía */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="h-full border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Hammer className="h-5 w-5 text-primary" />
                  Tipo de Artesanía
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Categoría principal de tu trabajo
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEditCraftType}
                className="hover:bg-primary/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {craftType ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Detectado
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {getCraftTypeLabel(craftType)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Esta categoría define el tipo de productos y técnicas que dominas
                  </p>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>💡 Esta clasificación ayuda a:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Personalizar tus misiones y herramientas</li>
                    <li>Conectarte con artesanos similares</li>
                    <li>Recibir recomendaciones específicas</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    Sin tipo de artesanía
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Selecciona el tipo de artesanía que mejor describe tu trabajo
                  </p>
                </div>
                <Button
                  onClick={onEditCraftType}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Seleccionar Tipo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
