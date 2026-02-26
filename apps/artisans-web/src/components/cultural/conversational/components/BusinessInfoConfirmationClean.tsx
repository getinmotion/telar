import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Edit3, Sparkles, Brain } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useUserBusinessProfile } from '@/hooks/user/useUserBusinessProfile';
import { toast } from 'sonner';

interface ExtractedInfo {
  brand_name?: string;
  craft_type?: string;
  business_location?: string;
  unique_value?: string;
}

interface Props {
  extractedInfo: ExtractedInfo;
  originalText?: string;
  language: 'en' | 'es';
  onConfirm: (data: ExtractedInfo) => void;
  onEdit?: () => void;
  craftType?: string;
  officialClassification?: string;
  onAddClassification?: () => void;
  totalAnswered?: number;
}

export const BusinessInfoConfirmationClean = ({
  extractedInfo,
  originalText,
  language,
  onConfirm,
  onEdit,
  craftType,
  officialClassification,
  onAddClassification,
  totalAnswered = 0
}: Props) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<ExtractedInfo>(extractedInfo);
  const [showLocationSuggestion, setShowLocationSuggestion] = useState(false);

  const { user } = useAuth();
  const { businessProfile } = useUserBusinessProfile();

  const labels = {
    es: {
      title: '¿Es correcta esta información?',
      subtitle: 'Revisa que entendimos bien tu negocio',
      brandName: 'Nombre de tu marca',
      location: 'Ubicación',
      uniqueValue: 'Tu propuesta de valor',
      required: 'Requerido',
      recommended: 'Recomendado',
      recommendedMessage: 'Es más chévere que lo pongas',
      complete: 'Completo',
      warningMessage: 'Necesitas completar los campos marcados como requeridos antes de continuar.',
      noName: 'Sin nombre definido',
      notSpecified: 'No especificado',
    },
    en: {
      title: 'Is this information correct?',
      subtitle: 'Review that we understood your business correctly',
      brandName: 'Brand Name',
      location: 'Location',
      uniqueValue: 'Your Value Proposition',
      required: 'Required',
      recommended: 'Recommended',
      recommendedMessage: 'We recommend adding this',
      complete: 'Complete',
      warningMessage: 'You need to complete the required fields before continuing.',
      noName: 'No name defined',
      notSpecified: 'Not specified',
    }
  };

  const t = labels[language];

  // Validación de nombre de marca - AHORA ES REQUERIDO
  const isBrandNameValid =
    editedData.brand_name != null &&
    typeof editedData.brand_name === 'string' &&
    editedData.brand_name.trim() !== '' &&
    editedData.brand_name.toLowerCase() !== 'null' &&
    editedData.brand_name !== 'No especificado' &&
    editedData.brand_name !== 'Sin nombre definido' &&
    editedData.brand_name.toLowerCase() !== 'sin nombre definido' &&
    editedData.brand_name !== 'No name defined' &&
    editedData.brand_name.length >= 2;

  const isBrandNameEmpty = !editedData.brand_name ||
    editedData.brand_name === 'null' ||
    editedData.brand_name === 'No especificado';

  // Validación de ubicación
  const isLocationValid =
    editedData.business_location != null &&
    typeof editedData.business_location === 'string' &&
    editedData.business_location.trim() !== '' &&
    editedData.business_location.toLowerCase() !== 'null' &&
    editedData.business_location.toLowerCase() !== 'undefined' &&
    editedData.business_location !== 'No especificado' &&
    editedData.business_location.length >= 3;

  const isUniqueValueValid = editedData.unique_value &&
    editedData.unique_value.trim() !== '' &&
    editedData.unique_value !== 'null';

  const canConfirm = isBrandNameValid && isLocationValid;

  // Comparar y sugerir ubicación del perfil
  useEffect(() => {
    if (
      businessProfile?.businessLocation &&
      editedData.business_location &&
      editedData.business_location !== businessProfile.businessLocation &&
      editedData.business_location !== 'No especificado' &&
      editedData.business_location.length > 3
    ) {
      setShowLocationSuggestion(true);
    }
  }, [editedData.business_location, businessProfile?.businessLocation]);

  const handleUseProfileLocation = () => {
    const profileLocation = businessProfile?.businessLocation;

    if (profileLocation) {
      setEditedData({ ...editedData, business_location: profileLocation });
      setShowLocationSuggestion(false);
      toast.success(
        language === 'es'
          ? '✓ Ubicación actualizada con la de tu perfil'
          : '✓ Location updated with your profile'
      );
    }
  };

  const handleConfirm = () => {
    if (!canConfirm) {
      toast.error(
        language === 'es'
          ? 'Por favor completa todos los campos requeridos'
          : 'Please complete all required fields'
      );
      return;
    }
    onConfirm(editedData);
  };

  interface FieldCardProps {
    icon: React.ReactNode;
    label: string;
    value?: string;
    isValid: boolean;
    isRequired?: boolean;
    isRecommended?: boolean;
    fieldKey: string;
  }

  const FieldCard = ({ icon, label, value, isValid, isRequired, isRecommended, fieldKey }: FieldCardProps) => {
    const isThisFieldEditing = editingField === fieldKey;

    // ✅ FIX 4: Bordes sutiles - ámbar para requeridos (no rojo alarmista)
    const borderColor = isValid
      ? 'border-l-4 border-l-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
      : isRequired
        ? 'border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-950/20'  // Ámbar en lugar de rojo
        : 'border-l-4 border-l-blue-300 bg-blue-50/20 dark:bg-blue-950/10';

    const iconBg = isValid
      ? 'bg-emerald-100 dark:bg-emerald-500/10'
      : isRequired
        ? 'bg-amber-100 dark:bg-amber-500/10'  // Ámbar en lugar de rojo
        : 'bg-blue-100 dark:bg-blue-500/10';

    return (
      <Card className={`p-4 relative transition-all ${borderColor} hover:shadow-md`}>
        {/* ✅ FIX 4: Indicador de estado sutil en lugar de ! rojo alarmista */}
        <div className="absolute top-3 right-3">
          {isValid ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : isRequired ? (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30" />
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-foreground">{label}</span>

              {/* ✅ FIX 4: Badges sutiles - solo mostrar cuando hay problema */}
              {isRequired && !isValid && (
                <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/30 text-xs px-2 py-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {t.required}
                </Badge>
              )}

              {isValid && (
                <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-xs px-2 py-0.5 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {t.complete}
                </Badge>
              )}

              {isRecommended && !isValid && (
                <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/20 text-xs px-2 py-0.5">
                  ⭐ {t.recommended}
                </Badge>
              )}
            </div>

            {isThisFieldEditing ? (
              <div className="space-y-2">
                {fieldKey === 'unique_value' ? (
                  <Textarea
                    value={editedData[fieldKey] || ''}
                    onChange={(e) => setEditedData({ ...editedData, [fieldKey]: e.target.value })}
                    className="min-h-[60px]"
                    placeholder={language === 'es' ? 'Escribe aquí...' : 'Write here...'}
                    autoFocus
                  />
                ) : (
                  <Input
                    value={editedData[fieldKey] || ''}
                    onChange={(e) => setEditedData({ ...editedData, [fieldKey]: e.target.value })}
                    onBlur={() => {
                      // ✅ Auto-format: agregar ", Colombia" si falta y es campo de ubicación
                      if (fieldKey === 'business_location') {
                        const current = editedData[fieldKey] || '';
                        if (current && !current.includes('Colombia')) {
                          setEditedData({
                            ...editedData,
                            [fieldKey]: `${current}, Colombia`
                          });
                        }
                      }
                    }}
                    placeholder={
                      fieldKey === 'brand_name'
                        ? (language === 'es' ? 'Ej: Artesanías Maria' : 'Ex: Maria Crafts')
                        : fieldKey === 'business_location'
                          ? (language === 'es' ? 'Ej: Bogotá, Cundinamarca' : 'Ex: Bogotá, Cundinamarca')
                          : (language === 'es' ? 'Escribe aquí...' : 'Write here...')
                    }
                    autoFocus
                  />
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const newValue = editedData[fieldKey];
                      if (isRequired && (!newValue || newValue.trim() === '')) {
                        toast.error(
                          language === 'es'
                            ? 'Este campo es requerido'
                            : 'This field is required'
                        );
                        return;
                      }
                      setEditingField(null);
                      toast.success(
                        language === 'es' ? '✓ Cambio guardado' : '✓ Change saved'
                      );
                    }}
                  >
                    ✓ {language === 'es' ? 'Guardar' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditedData({ ...editedData, [fieldKey]: extractedInfo[fieldKey] });
                      setEditingField(null);
                    }}
                  >
                    ✕ {language === 'es' ? 'Cancelar' : 'Cancel'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {/* ✅ FIX 4: Respuestas destacadas en grande cuando son válidas */}
                <div className={`flex-1 ${isValid
                    ? 'text-lg font-bold text-foreground bg-primary/5 px-3 py-2 rounded-lg border border-primary/20'
                    : 'text-sm text-muted-foreground italic'
                  }`}>
                  {value || t.notSpecified}
                </div>

                {/* Botón de editar más sutil */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    // Si el campo tiene valor placeholder, limpiarlo
                    if (fieldKey === 'brand_name' &&
                      (editedData.brand_name === 'Sin nombre definido' ||
                        editedData.brand_name === 'No name defined')) {
                      setEditedData({ ...editedData, brand_name: '' });
                    }
                    setEditingField(fieldKey);
                  }}
                  className="h-8 px-3 text-xs ml-2 text-muted-foreground hover:text-foreground"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  {language === 'es' ? 'Editar' : 'Edit'}
                </Button>
              </div>
            )}

            {isRecommended && !isValid && !isThisFieldEditing && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {t.recommendedMessage}
              </p>
            )}
          </div>

          <div className="flex items-center">
            {isValid ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : isRequired ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500" />
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header compacto */}
      <div className="text-center space-y-1">
        <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {t.title}
        </h2>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Warning compacto */}
      {!canConfirm && editingField === null && (
        <Card className="p-3 bg-amber-500/10 border-amber-500/50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900 dark:text-amber-100">{t.warningMessage}</p>
          </div>
        </Card>
      )}

      {/* Categorizaciones movidas al perfil - ya no se muestran aquí */}

      {/* Texto original COMPACTO (collapsible) */}
      {originalText && (
        <Card className="p-3 bg-muted/30">
          <details>
            <summary className="cursor-pointer text-xs text-muted-foreground font-medium flex items-center gap-2">
              <Brain className="w-3 h-3" />
              {language === 'es' ? 'Ver tu respuesta original' : 'View original answer'}
            </summary>
            <p className="text-xs text-muted-foreground mt-2 italic">{originalText}</p>
          </details>
        </Card>
      )}

      {/* Sugerencia de ubicación (si aplica) */}
      {showLocationSuggestion && businessProfile?.businessLocation && (
        <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-primary/10 border-2 border-blue-500/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏠</span>
            <div className="flex-1">
              <p className="font-semibold text-foreground mb-2">
                {language === 'es' ? '¿Es esta tu ubicación?' : 'Is this your location?'}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'es' ? 'Tu ubicación actual:' : 'Current location:'}
                <strong className="text-foreground ml-1">
                  {editedData.business_location || 'No especificada'}
                </strong>
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {language === 'es' ? 'Tu ubicación registrada:' : 'Registered location:'}
                <strong className="text-primary ml-1">
                  {businessProfile.businessLocation}
                </strong>
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUseProfileLocation}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {language === 'es' ? '✓ Usar ubicación registrada' : '✓ Use registered location'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLocationSuggestion(false)}
                >
                  {language === 'es' ? 'Mantener la actual' : 'Keep current'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Campos en grid 2 columnas en desktop */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Brain className="w-4 h-4" />
          {language === 'es' ? 'Información Principal' : 'Main Information'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre de marca */}
          <FieldCard
            icon={<span className="text-xl">📦</span>}
            label={t.brandName}
            value={isBrandNameEmpty ? t.noName : editedData.brand_name}
            isValid={isBrandNameValid}
            isRequired={true}
            fieldKey="brand_name"
          />

          {/* Ubicación */}
          <FieldCard
            icon={<span className="text-xl">📍</span>}
            label={t.location}
            value={editedData.business_location}
            isValid={isLocationValid}
            isRequired={true}
            fieldKey="business_location"
          />
        </div>

        {/* Valor único - full width */}
        <div className="mt-4">
          <FieldCard
            icon={<span className="text-xl">✨</span>}
            label={t.uniqueValue}
            value={editedData.unique_value}
            isValid={isUniqueValueValid}
            isRequired={false}
            isRecommended={true}
            fieldKey="unique_value"
          />
        </div>
      </div>

      {/* Botón de confirmación final */}
      {editingField === null && (
        <div className="sticky bottom-0 pt-4 pb-2 bg-background/95 backdrop-blur">
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full"
            size="lg"
          >
            {canConfirm
              ? (language === 'es' ? '✓ Todo correcto, continuar' : '✓ All correct, continue')
              : (language === 'es' ? '⚠️ Completa los campos requeridos para continuar' : '⚠️ Complete required fields to continue')
            }
          </Button>
        </div>
      )}
    </div>
  );
};
