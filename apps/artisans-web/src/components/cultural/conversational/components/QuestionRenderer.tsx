import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { VoiceInput } from '@/components/ui/voice-input';
import { Check, X, Edit3, CheckCircle2, Circle, Star, Heart, Zap, Target, Lightbulb, Rocket, Mic } from 'lucide-react';
import { ConversationQuestion } from '../types/conversationalTypes';

interface QuestionRendererProps {
  question: ConversationQuestion;
  value?: any;
  onChange?: (value: any) => void;
  onAnswer?: (answer: any) => void;
  language: 'en' | 'es';
  onComplete?: () => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = memo(({
  question,
  value,
  onChange,
  onAnswer,
  language,
  onComplete
}) => {
  // ✅ PASO 1: ALL HOOKS AT THE TOP - NO CONDITIONAL EXECUTION
  // This fixes React Hook Error #310
  
  // 1. State hooks
  const [multiChoiceInitialized, setMultiChoiceInitialized] = useState(false);
  const [textInputValue, setTextInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 2. Callback hooks
  const handleAnswer = useCallback(onAnswer || onChange || (() => {}), [onAnswer, onChange]);
  
  // 3. Memoized values
  const memoizedOptions = React.useMemo(() => question.options || [], [question.options]);
  
  // 4. Effect hooks (all at the top, using flags instead of conditional execution)
  
  // Multiple-choice initialization
  useEffect(() => {
    if (question.type === 'multiple-choice' && !multiChoiceInitialized && (!value || !Array.isArray(value))) {
      console.log('✅ QuestionRenderer: Initializing empty array for multiple choice', { questionId: question.id });
      handleAnswer([]);
      setMultiChoiceInitialized(true);
    }
    if (question.type !== 'multiple-choice' && multiChoiceInitialized) {
      setMultiChoiceInitialized(false);
    }
  }, [question.type, question.id, multiChoiceInitialized, value, handleAnswer]);

  // Text input sync
  useEffect(() => {
    if (question.type === 'text-input' || question.type === 'textarea') {
      setTextInputValue(value || '');
    }
  }, [question.type, value]);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Slider default value
  useEffect(() => {
    if (question.type === 'slider' && (value === undefined || value === null)) {
      const minValue = question.min || 1;
      const maxValue = question.max || 5;
      const defaultValue = Math.ceil((minValue + maxValue) / 2);
      console.log('✅ QuestionRenderer: Setting default slider value', { defaultValue, questionId: question.id });
      handleAnswer(defaultValue);
    }
  }, [question.type, value, question.min, question.max, handleAnswer, question.id]);
  
  // 5. Translations and validation (after all hooks)
  const translations = {
    en: {
      yes: "Yes",
      no: "No",
      selectOption: "Select an option",
      typing: "Typing...",
      willSaveAfter: "Will save after you finish typing"
    },
    es: {
      yes: "Sí",
      no: "No",
      selectOption: "Selecciona una opción",
      typing: "Escribiendo...",
      willSaveAfter: "Se guardará cuando termines de escribir"
    }
  };

  const t = translations[language];

  // ✅ FIX: Validate and normalize question type BEFORE rendering (no hooks after this point)
  let effectiveQuestionType = question.type;
  
  // Validate single-choice and multiple-choice questions
  if (question.type === 'single-choice' || question.type === 'multiple-choice') {
    const hasNoOptions = !question.options || question.options.length === 0;
    
    let hasInvalidOptions = false;
    if (!hasNoOptions) {
      const optionLabels = question.options!.map(opt => opt.label);
      const uniqueLabels = new Set(optionLabels);
      const hasDuplicates = uniqueLabels.size !== optionLabels.length;
      
      const hasInsightText = optionLabels.some(label => 
        typeof label === 'string' && (
          label.toLowerCase().includes('veo que') ||
          label.toLowerCase().includes('i can see') ||
          label.toLowerCase().includes('este nivel') ||
          label.toLowerCase().includes('me parece') ||
          label.toLowerCase().includes('observo que') ||
          label.toLowerCase().includes('basándome en')
        )
      );
      
      hasInvalidOptions = hasDuplicates || hasInsightText;
      
      if (hasInvalidOptions || hasNoOptions) {
        console.warn(`${question.type} question has invalid options, converting to text input:`, question.id);
      }
    }
    
    // Convert to text-input if options are invalid
    if (hasNoOptions || hasInvalidOptions) {
      effectiveQuestionType = 'text-input';
    }
  }

  const getOptionIcon = (index: number) => {
    const icons = [Circle, CheckCircle2, Star, Heart, Zap, Target, Lightbulb, Rocket];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-5 h-5" />;
  };

  // ✨ NUEVO: Renderizar pregunta con IA
  const renderLongTextWithAI = () => {
    // Importar AIQuestionRenderer dinámicamente
    const AIQuestionRenderer = React.lazy(() => 
      import('./AIQuestionRenderer').then(m => ({ default: m.AIQuestionRenderer }))
    );
    
    return (
      <React.Suspense fallback={<div>Cargando...</div>}>
        <AIQuestionRenderer
          question={question.question}
          placeholder={question.placeholder || ''}
          enableDictation={question.enableDictation || false}
          fieldsToExtract={question.aiExtraction?.fields || []}
          onExtractedData={(data) => {
            handleAnswer(data);
          }}
          onComplete={onComplete}
          language={language}
          value={typeof value === 'string' ? value : ''}
          onChange={handleAnswer}
        />
      </React.Suspense>
    );
  };

  const renderSingleChoice = () => {
    // Options are already validated before this point
    return (
      <RadioGroup value={String(value)} onValueChange={(val) => {
        const option = question.options?.find(opt => String(opt.value) === val);
        if (option) handleAnswer(option.value);
      }}>
        <div className="space-y-3">
          {question.options?.map((option, index) => {
            const isSelected = String(value) === String(option.value);
            return (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.1 }}
              >
                <div className={`
                  flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[64px] relative
                  ${isSelected
                    ? 'border-primary bg-primary/10 shadow-md scale-[1.02]' 
                    : 'border-primary/20 hover:border-primary hover:bg-primary/5 hover:shadow-sm bg-white'
                  }
                `} onClick={() => handleAnswer(option.value)}>
                  
                  <RadioGroupItem
                    value={String(option.value)}
                    className="w-5 h-5 mr-4 flex-shrink-0 border-2 border-primary/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                  />
                  
                  <div className={`mr-3 flex-shrink-0 transition-colors ${
                    isSelected ? 'text-primary' : 'text-primary/40'
                  }`}>
                    {getOptionIcon(index)}
                  </div>
                  
                  <div className="flex-1">
                    <div className={`font-medium leading-relaxed ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}>
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                    )}
                  </div>
                  
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-2"
                    >
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </RadioGroup>
    );
  };

  const renderMultipleChoice = () => {
    // Options are already validated before this point
    const currentValue = Array.isArray(value) ? value : [];
    const selectedCount = currentValue.length;
    
    return (
      <div className="space-y-3">
        <div className="text-sm text-primary mb-3 font-medium">
          {language === 'es' 
            ? `Puedes seleccionar múltiples opciones (${selectedCount} seleccionadas)`
            : `You can select multiple options (${selectedCount} selected)`
          }
        </div>
        {question.options?.map((option, index) => {
          const isSelected = currentValue && Array.isArray(currentValue) && currentValue.includes(option.value);
          return (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.1 }}
            >
              <div className={`
                flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[64px] relative
                ${isSelected
                  ? 'border-primary bg-primary/10 shadow-md scale-[1.02]' 
                  : 'border-primary/20 hover:border-primary hover:bg-primary/5 hover:shadow-sm bg-white'
                }
              `} onClick={() => {
                const newValues = isSelected
                  ? currentValue.filter(v => v !== option.value)
                  : [...currentValue, option.value];
                console.log('QuestionRenderer: Multiple choice updated', { 
                  questionId: question.id, 
                  option: option.value, 
                  isSelected, 
                  newValues 
                });
                handleAnswer(newValues);
              }}>
                
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-primary border-primary' : 'border-primary/30 hover:border-primary/40'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                
                <div className={`mr-3 flex-shrink-0 transition-colors ${
                  isSelected ? 'text-primary' : 'text-primary/40'
                }`}>
                  {getOptionIcon(index)}
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium leading-relaxed ${
                    isSelected ? 'text-primary' : 'text-foreground'
                  }`}>
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderTextInput = useCallback(() => {
    const isFirstQuestion = question.id === 'business_description';

    const saveValue = useCallback((inputValue: string) => {
      if (inputValue.trim()) {
        console.log('QuestionRenderer: Saving value', { inputValue, questionId: question.id });
        handleAnswer(inputValue);
      }
    }, [handleAnswer, question.id]);

    const handleInputChange = useCallback((inputValue: string) => {
      setTextInputValue(inputValue);
      setIsTyping(true);
      
      // For first question, update profileData with debounce but DON'T trigger extraction
      if (isFirstQuestion) {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
          console.log('📝 [Q1] Updating profileData (no extraction)', { length: inputValue.length });
          saveValue(inputValue); // This only updates profileData
          setIsTyping(false);
        }, 500); // Short debounce for first question
        return;
      }
      
      // For other questions, use normal debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      debounceTimeoutRef.current = setTimeout(() => {
        saveValue(inputValue);
        setIsTyping(false);
      }, 800);
    }, [saveValue, isFirstQuestion]);

    const handleBlur = useCallback(() => {
      // Clean up typing state
      setIsTyping(false);
      
      // For first question, value is already saved immediately on change
      if (isFirstQuestion) {
        return;
      }
      
      // For other questions, save on blur
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      saveValue(textInputValue);
    }, [textInputValue, saveValue, isFirstQuestion]);


    const handleVoiceTranscript = useCallback((transcript: string) => {
      const newValue = textInputValue + (textInputValue ? ' ' : '') + transcript;
      setTextInputValue(newValue);
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        saveValue(newValue);
        setIsTyping(false);
      }, 500);
    }, [textInputValue, saveValue]);

    return (
      <div className="space-y-4">
        {isFirstQuestion && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-3 p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3"
          >
            <Mic className="w-5 h-5 text-accent flex-shrink-0" />
            <p className="text-sm text-accent font-medium">
              💬 {language === 'es' 
                ? '¡Prueba dictando! Es más rápido - presiona el micrófono →' 
                : 'Try dictating! It\'s faster - press the microphone →'}
            </p>
          </motion.div>
        )}
        
        <div className="relative flex items-center gap-2">
          {isFirstQuestion ? (
            <div className="relative w-full">
              <textarea
                placeholder={question.placeholder}
          value={textInputValue}
          onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleBlur}
                className="w-full p-4 pr-16 text-base min-h-[200px] rounded-xl border-2 border-border bg-white 
                         hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 
                         transition-all duration-300 resize-none"
                rows={8}
              />
              {/* Voice input button positioned at bottom-right of textarea */}
              <div className="absolute bottom-3 right-3">
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  language={language}
                  className="shadow-lg"
                />
              </div>
            </div>
          ) : (
            <>
              <Input
                type="text"
                placeholder={question.placeholder}
                value={textInputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleBlur}
                className="w-full p-4 text-base pr-12 flex-1"
              />
              
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                language={language}
                className="flex-shrink-0"
              />
            </>
          )}
          
          {isTyping && !isFirstQuestion && (
            <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
              <Edit3 className="w-4 h-4 text-primary animate-pulse" />
            </div>
          )}
        </div>
        
        {/* Character count for first question */}
        {isFirstQuestion && (
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${textInputValue.length >= 20 ? 'text-success' : 'text-secondary'}`}>
              {textInputValue.length >= 50 
                ? `✅ ${textInputValue.length} caracteres - ¡Excelente detalle!` 
                : textInputValue.length >= 20 
                  ? `✨ ${textInputValue.length} caracteres - Suficiente, puedes agregar más si quieres`
                  : `📝 ${textInputValue.length}/20 caracteres mínimos`}
            </span>
          </div>
        )}
        
        
        {isTyping && !isFirstQuestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            {t.typing}
          </motion.div>
        )}
      </div>
    );
  }, [value, question.placeholder, handleAnswer, language, t]);

  const renderSlider = () => {
    const minValue = question.min || 1;
    const maxValue = question.max || 5;
    const defaultValue = Math.ceil((minValue + maxValue) / 2);
    const currentValue = value !== undefined && value !== null ? Number(value) : defaultValue;

    return (
      <div className="space-y-6 relative transform-gpu">
        <div className="p-8 rounded-xl bg-gradient-to-br from-background/95 to-accent/5 border-2 border-accent/20 shadow-lg transform-gpu">
          <div 
            className="w-full relative isolate"
            style={{ 
              touchAction: 'manipulation',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              transform: 'translateZ(0)'
            }}
          >
            <Slider
              value={[currentValue]}
              onValueChange={(newValue) => {
                console.log('QuestionRenderer: Slider changed', { 
                  questionId: question.id, 
                  oldValue: currentValue, 
                  newValue: newValue[0] 
                });
                handleAnswer(newValue[0]);
              }}
              min={minValue}
              max={maxValue}
              step={question.step || 1}
              className="w-full !touch-manipulation !cursor-pointer [&>*]:!touch-manipulation [&>*]:!pointer-events-auto [&_*]:!touch-manipulation [&_*]:!cursor-pointer override-touch-none"
              style={{ 
                touchAction: 'manipulation !important',
                cursor: 'pointer !important'
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground px-2">
          <span>{minValue}</span>
          <span className="font-medium text-foreground">
            {currentValue} / {maxValue}
          </span>
          <span>{maxValue}</span>
        </div>
        <div className="text-center text-xs text-muted-foreground">
          {currentValue === minValue && (language === 'es' ? 'Muy bajo' : 'Very low')}
          {currentValue === defaultValue && (language === 'es' ? 'Moderado' : 'Moderate')}
          {currentValue === maxValue && (language === 'es' ? 'Muy alto' : 'Very high')}
        </div>
      </div>
    );
  };

  const renderYesNo = () => (
    <div className="flex gap-4">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
        <Button
          variant={value === true ? "default" : "outline"}
          className={`w-full h-16 text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
            value === true ? 'ring-2 ring-primary bg-primary text-primary-foreground shadow-lg scale-[1.02]' : 'hover:bg-accent/50 border-2 border-transparent hover:border-accent/30'
          }`}
          onClick={() => handleAnswer(true)}
        >
          <Check className="w-6 h-6 mr-2" />
          {t.yes}
        </Button>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
        <Button
          variant={value === false ? "default" : "outline"}
          className={`w-full h-16 text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
            value === false ? 'ring-2 ring-primary bg-primary text-primary-foreground shadow-lg scale-[1.02]' : 'hover:bg-accent/50 border-2 border-transparent hover:border-accent/30'
          }`}
          onClick={() => handleAnswer(false)}
        >
          <X className="w-6 h-6 mr-2" />
          {t.no}
        </Button>
      </motion.div>
    </div>
  );

  const renderButtonGroup = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {question.options?.map((option) => (
        <motion.div
          key={option.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant={value === option.value ? "default" : "outline"}
            className={`w-full p-4 h-auto text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
              value === option.value ? 'ring-2 ring-primary bg-primary text-primary-foreground shadow-lg scale-[1.02]' : 'hover:bg-accent/50 border-2 border-transparent hover:border-accent/30'
            }`}
            onClick={() => handleAnswer(option.value)}
          >
            {option.label}
          </Button>
        </motion.div>
      ))}
    </div>
  );

  // Use effectiveQuestionType which has been validated and normalized
  switch (effectiveQuestionType) {
    case 'long_text_with_ai':
      return renderTextInput();
    case 'single-choice':
      return renderSingleChoice();
    case 'multiple-choice':
      return renderMultipleChoice();
    case 'text-input':
    case 'textarea':
      return renderTextInput();
    case 'slider':
      return renderSlider();
    case 'yes-no':
      return renderYesNo();
    case 'button-group':
      return renderButtonGroup();
    default:
      return <div>Unsupported question type</div>;
  }
});

QuestionRenderer.displayName = 'QuestionRenderer';

export { QuestionRenderer };