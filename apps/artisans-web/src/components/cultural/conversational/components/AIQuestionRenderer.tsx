import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Mic, CheckCircle2, Edit3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DictationButton } from './DictationButton';
import { LocationAutocomplete } from '@/components/ui/location-autocomplete';

interface AIQuestionRendererProps {
  question: string;
  placeholder: string;
  enableDictation?: boolean;
  fieldsToExtract: string[];
  onExtractedData: (data: Record<string, string>) => void;
  language: 'en' | 'es';
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: () => void;
}

const CRITICAL_FIELDS = ['businessName', 'craftType', 'location', 'differentiator'];
const OPTIONAL_FIELDS = ['products', 'targetAudience'];

export const AIQuestionRenderer: React.FC<AIQuestionRendererProps> = ({
  question,
  placeholder,
  enableDictation = true,
  fieldsToExtract,
  onExtractedData,
  language,
  value = '',
  onChange,
  onComplete
}) => {
  // Usar ref para mantener el valor sin resets
  const [userInput, setUserInput] = useState(value);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string> | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const initializedRef = React.useRef(false);

  // Solo inicializar una vez al montar
  React.useEffect(() => {
    if (!initializedRef.current && value) {
      setUserInput(value);
      initializedRef.current = true;
    }
  }, []); // Empty deps - solo al montar

  const translations = {
    en: {
      analyzing: 'Analyzing with AI...',
      continue: 'Continue',
      confirmTitle: 'Is this information correct?',
      yesCorrect: 'Yes, correct',
      edit: 'Edit',
      missingInfo: '⚠️ Critical information missing',
      pleaseProv: 'Please provide the following information to continue',
      dictateHint: 'You can dictate your answer, it\'s easier',
    },
    es: {
      analyzing: 'Analizando con IA...',
      continue: 'Continuar',
      confirmTitle: '¿Es correcta esta información?',
      yesCorrect: 'Sí, correcto',
      edit: 'Editar',
      missingInfo: '⚠️ Información crítica faltante',
      pleaseProv: 'Por favor proporciona la siguiente información para continuar',
      dictateHint: 'Puedes dictar tu respuesta, es más fácil',
    }
  };

  const t = translations[language];

  const handleExtract = async () => {
    if (!userInput.trim()) {
      toast.error(language === 'es' ? 'Por favor escribe algo primero' : 'Please write something first');
      return;
    }

    setIsExtracting(true);

    try {
      const { data, error } = await supabase.functions.invoke('extract-business-info', {
        body: {
          userText: userInput,
          fieldsToExtract,
          language
        }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const extracted = data.data;

        const mappedData: Record<string, string> = {};
        if (extracted.brand_name) mappedData.businessName = extracted.brand_name;
        if (extracted.craft_type) mappedData.craftType = extracted.craft_type;
        if (extracted.business_location) mappedData.location = extracted.business_location;
        if (extracted.unique_value) mappedData.differentiator = extracted.unique_value;

        const missing = fieldsToExtract.filter(field => !mappedData[field] || mappedData[field].trim() === '');

        if (missing.length > 0) {
          setMissingFields(missing);
          setExtractedData(mappedData);
          setShowConfirmation(true);
          toast.warning(
            language === 'es'
              ? 'Faltan algunos campos. Por favor complétalos.'
              : 'Some fields are missing. Please complete them.'
          );
          return;
        }

        setExtractedData(mappedData);
        setMissingFields([]);
        setShowConfirmation(true);
        toast.success(
          language === 'es' ? 'Información extraída correctamente' : 'Information extracted successfully'
        );
      }
    } catch {
      toast.error(
        language === 'es'
          ? 'Error al analizar tu respuesta. Por favor intenta de nuevo.'
          : 'Error analyzing your response. Please try again.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirm = () => {
    if (!extractedData) return;

    // Filtrar solo campos críticos para validación bloqueante
    const criticalMissing = CRITICAL_FIELDS.filter(field =>
      fieldsToExtract.includes(field) && (!extractedData[field] || extractedData[field].trim() === '')
    );

    // Si faltan campos críticos, bloquear con alerta clara
    if (criticalMissing.length > 0) {
      setMissingFields(criticalMissing);
      toast.error(
        language === 'es'
          ? `⚠️ Campos críticos faltantes: ${criticalMissing.map(f => fieldLabels[f]?.[language] || f).join(', ')}. Por favor complétalos para continuar.`
          : `⚠️ Critical fields missing: ${criticalMissing.map(f => fieldLabels[f]?.[language] || f).join(', ')}. Please complete them to continue.`,
        { duration: 5000 }
      );
      return;
    }

    // Si craftType está vacío y no se pudo inferir, usar 'mixed'
    if (!extractedData.craftType || extractedData.craftType.trim() === '') {
      extractedData.craftType = 'mixed';
    }

    const cleanData = {
      ...extractedData,
      businessDescription: typeof userInput === 'string' ? userInput.trim() : String(userInput || '')
    };

    onExtractedData(cleanData);

    // Toast de éxito
    toast.success(
      language === 'es' ? '¡Información guardada correctamente!' : 'Information saved successfully!'
    );

    // Auto-avanzar al siguiente paso
    if (onComplete) {
      setTimeout(() => onComplete(), 500);
    }
  };

  const handleEdit = () => {
    setShowConfirmation(false);
    setExtractedData(null);
  };

  const handleDictation = (text: string) => {
    const newValue = userInput ? `${userInput} ${text}` : text;
    setUserInput(newValue);
    onChange?.(newValue);
  };

  const handleInputChange = (newValue: string) => {
    setUserInput(newValue);
    // No llamar onChange aquí para evitar re-renders del padre
  };

  const fieldLabels: Record<string, { es: string; en: string }> = {
    businessName: { es: 'Nombre del negocio', en: 'Business name' },
    products: { es: 'Productos', en: 'Products' },
    craftType: { es: 'Tipo de artesanía', en: 'Craft type' },
    location: { es: 'Ubicación', en: 'Location' },
    targetAudience: { es: 'Público objetivo', en: 'Target audience' },
    differentiator: { es: 'Diferenciador único', en: 'Unique differentiator' },
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={userInput}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] text-base"
        disabled={isExtracting || showConfirmation}
      />

      {enableDictation && !showConfirmation && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mic className="w-4 h-4" />
          <span>{t.dictateHint}</span>
          <DictationButton
            onTranscript={handleDictation}
            language={language}
          />
        </div>
      )}

      {!showConfirmation && (
        <Button
          onClick={handleExtract}
          disabled={!userInput.trim() || isExtracting}
          className="w-full"
          size="lg"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t.analyzing}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {t.continue}
            </>
          )}
        </Button>
      )}

      {showConfirmation && extractedData && (
        <Card className="p-6 border-2 border-primary/50 bg-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-lg">{t.confirmTitle}</h4>
          </div>

          <div className="space-y-3 mb-4">
            {fieldsToExtract.map((fieldKey) => {
              const label = fieldLabels[fieldKey]?.[language] || fieldKey;
              const value = extractedData[fieldKey] || '';
              const isMissing = missingFields.includes(fieldKey);

              // Usar LocationAutocomplete para el campo de ubicación
              if (fieldKey === 'location') {
                return (
                  <div key={fieldKey} className={`border-l-2 ${isMissing ? 'border-yellow-500' : 'border-primary/30'} pl-3`}>
                    <span className={`text-sm font-medium ${isMissing ? 'text-yellow-700 dark:text-yellow-400' : 'text-muted-foreground'}`}>
                      {label}{isMissing ? ' ⚠️' : ''}:
                    </span>
                    <LocationAutocomplete
                      value={value}
                      onChange={(newValue) => {
                        const newData = { ...extractedData, [fieldKey]: newValue };
                        setExtractedData(newData);
                        const trimmed = newValue.trim();
                        setMissingFields((prev) => {
                          if (!trimmed) {
                            return prev.includes(fieldKey) ? prev : [...prev, fieldKey];
                          }
                          return prev.filter((f) => f !== fieldKey);
                        });
                      }}
                      placeholder={language === 'es' ? 'Ciudad, departamento o país' : 'City, state or country'}
                      className="mt-1"
                    />
                  </div>
                );
              }

              return (
                <div key={fieldKey} className={`border-l-2 ${isMissing ? 'border-yellow-500' : 'border-primary/30'} pl-3`}>
                  <span className={`text-sm font-medium ${isMissing ? 'text-yellow-700 dark:text-yellow-400' : 'text-muted-foreground'}`}>
                    {label}{isMissing ? ' ⚠️' : ''}:
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      const newData = { ...extractedData, [fieldKey]: nextVal };
                      setExtractedData(newData);
                      const trimmed = nextVal.trim();
                      setMissingFields((prev) => {
                        if (!trimmed) {
                          return prev.includes(fieldKey) ? prev : [...prev, fieldKey];
                        }
                        return prev.filter((f) => f !== fieldKey);
                      });
                    }}
                    placeholder={language === 'es' ? 'Completa este campo' : 'Complete this field'}
                    className={`w-full mt-1 px-3 py-2 rounded-md bg-background focus:outline-none focus:ring-2 ${isMissing ? 'border border-yellow-500/50 focus:ring-yellow-500' : 'border border-border focus:ring-primary/40'
                      }`}
                  />
                </div>
              );
            })}
          </div>

          {missingFields.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                {t.missingInfo}
              </p>
              <p className="text-sm text-muted-foreground">
                {t.pleaseProv}: {missingFields.map(f => fieldLabels[f]?.[language] || f).join(', ')}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              className="flex-1"
              size="lg"
              disabled={missingFields.length > 0}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t.yesCorrect}
            </Button>
            <Button
              variant="outline"
              onClick={handleEdit}
              size="lg"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {t.edit}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
