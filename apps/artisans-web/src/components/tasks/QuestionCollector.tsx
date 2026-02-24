import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AgentTask } from '@/hooks/types/agentTaskTypes';
import { MessageCircle, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { EnhancedQuestionInput, IntelligentQuestion } from './question-inputs/EnhancedQuestionInput';
import { QuestionHelpTooltip } from './question-inputs/QuestionHelpTooltip';
import { Progress } from '@/components/ui/progress';

interface QuestionCollectorProps {
  task: AgentTask;
  onComplete: (answers: Array<{question: string, answer: string | string[]}>) => void;
  onBack: () => void;
}

export const QuestionCollector: React.FC<QuestionCollectorProps> = ({
  task,
  onComplete,
  onBack
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<IntelligentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[] | number>('');
  const [answers, setAnswers] = useState<Array<{question: string, answer: string | string[]}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);

  const translations = {
    en: {
      loading: 'Generating intelligent questions...',
      yourAnswer: 'Your answer',
      next: 'Next Question',
      previous: 'Previous',
      complete: 'Complete Collection',
      questionOf: 'Question {current} of {total}',
      answerRequired: 'Please provide an answer to continue',
      generatingNext: 'Analyzing your answer...',
      finalStep: 'Final question - we have enough information!'
    },
    es: {
      loading: 'Generando preguntas inteligentes...',
      yourAnswer: 'Tu respuesta',
      next: 'Siguiente Pregunta',
      previous: 'Anterior',
      complete: 'Completar Recolección',
      questionOf: 'Pregunta {current} de {total}',
      answerRequired: 'Por favor proporciona una respuesta para continuar',
      generatingNext: 'Analizando tu respuesta...',
      finalStep: '¡Última pregunta - tenemos suficiente información!'
    }
  };

  const t = translations[language];

  useEffect(() => {
    generateInitialQuestions();
  }, []);

  const generateInitialQuestions = async () => {
    setIsLoading(true);
    try {
      // ✅ FASE 1: Cargar contexto completo del artesano
      const { data: masterContext } = await supabase
        .from('user_master_context')
        .select('conversation_insights, business_context, business_profile, task_generation_context')
        .eq('user_id', user?.id)
        .single();

      const insights = (masterContext?.conversation_insights || {}) as any;
      const businessProfile = (masterContext?.business_profile || {}) as any;
      const taskContext = (masterContext?.task_generation_context || {}) as any;

      const { data, error } = await supabase.functions.invoke('master-agent-coordinator', {
        body: {
          action: 'generate_intelligent_questions',
          userId: user?.id,
          userProfile: {
            taskId: task.id,
            agentId: task.agent_id,
            taskTitle: task.title,
            taskDescription: task.description,
            // ✅ Pasar contexto completo del artesano
            businessName: insights?.nombre_marca || businessProfile?.brand_name,
            businessDescription: insights?.descripcion || businessProfile?.business_description,
            craftType: insights?.tipo_artesania || businessProfile?.craft_type,
            currentChannels: insights?.canales_actuales || [],
            idealCustomer: insights?.cliente_ideal,
            targetMarket: insights?.mercado_objetivo || businessProfile?.target_market,
            maturityScores: taskContext?.maturityScores,
            conversationInsights: insights,
            businessContext: masterContext?.business_context
          }
        }
      });

      if (error) throw error;

      const intelligentQuestions: IntelligentQuestion[] = data.questions.map((q: any) => ({
        question: q.question,
        context: q.context,
        category: q.category || 'general',
        type: q.type || 'text',
        options: q.options,
        suggestedAnswers: q.suggestedAnswers,
        min: q.min,
        max: q.max,
        unit: q.unit,
        placeholder: q.placeholder,
        helpText: q.helpText,
        marketData: q.marketData
      }));

      setQuestions(intelligentQuestions);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: 'Error',
        description: language === 'en' ? 'Error generating questions' : 'Error al generar preguntas',
        variant: 'destructive',
      });
      
      // Fallback questions
      setQuestions([
        {
          question: language === 'en' 
            ? `Tell me more details about ${task.title}` 
            : `Cuéntame más detalles sobre ${task.title}`,
          context: 'General information gathering',
          category: 'overview',
          type: 'text'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNextQuestion = async (previousAnswers: Array<{question: string, answer: string | string[]}>) => {
    setIsGeneratingNext(true);
    try {
      // Serialize answers for API call
      const serializedAnswers = previousAnswers.map(qa => ({
        question: qa.question,
        answer: Array.isArray(qa.answer) ? qa.answer.join(', ') : qa.answer
      }));

      const { data, error } = await supabase.functions.invoke('master-agent-coordinator', {
        body: {
          action: 'generate_intelligent_questions',
          userId: user?.id,
          userProfile: {
            taskId: task.id,
            agentId: task.agent_id,
            taskTitle: task.title,
            taskDescription: task.description,
            previousAnswers: serializedAnswers
          }
        }
      });

      if (error) throw error;

      if (data.questions && data.questions.length > 0) {
        const newQuestion: IntelligentQuestion = {
          question: data.questions[0].question,
          context: data.questions[0].context,
          category: data.questions[0].category || 'followup',
          type: data.questions[0].type || 'text',
          options: data.questions[0].options,
          suggestedAnswers: data.questions[0].suggestedAnswers,
          min: data.questions[0].min,
          max: data.questions[0].max,
          unit: data.questions[0].unit,
          placeholder: data.questions[0].placeholder,
          helpText: data.questions[0].helpText,
          marketData: data.questions[0].marketData
        };
        
        setQuestions(prev => [...prev, newQuestion]);
      }
    } catch (error) {
      console.error('Error generating next question:', error);
    } finally {
      setIsGeneratingNext(false);
    }
  };

  const handleNext = async () => {
    const isEmpty = Array.isArray(currentAnswer) 
      ? currentAnswer.length === 0 
      : !String(currentAnswer).trim();
    
    if (isEmpty) {
      toast({
        title: 'Error',
        description: t.answerRequired,
        variant: 'destructive',
      });
      return;
    }

    // Convert answer to appropriate format
    const formattedAnswer = typeof currentAnswer === 'number' 
      ? String(currentAnswer) 
      : currentAnswer;

    const newAnswer = {
      question: questions[currentQuestionIndex].question,
      answer: formattedAnswer
    };

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = newAnswer;
    setAnswers(updatedAnswers);

    // If we're at the last question and have enough answers (3+), allow completion
    if (currentQuestionIndex === questions.length - 1 && updatedAnswers.length >= 3) {
      onComplete(updatedAnswers);
      return;
    }

    // If we need more questions, generate the next one
    if (currentQuestionIndex === questions.length - 1) {
      await generateNextQuestion(updatedAnswers);
    }

    setCurrentQuestionIndex(prev => prev + 1);
    const nextAnswer = updatedAnswers[currentQuestionIndex + 1]?.answer;
    setCurrentAnswer(nextAnswer !== undefined ? nextAnswer : (questions[currentQuestionIndex + 1]?.type === 'slider' ? questions[currentQuestionIndex + 1]?.min || 0 : ''));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      const prevAnswer = answers[currentQuestionIndex - 1]?.answer;
      setCurrentAnswer(prevAnswer !== undefined ? prevAnswer : (questions[currentQuestionIndex - 1]?.type === 'slider' ? questions[currentQuestionIndex - 1]?.min || 0 : ''));
    }
  };

  const handleComplete = () => {
    const isEmpty = Array.isArray(currentAnswer) 
      ? currentAnswer.length === 0 
      : !String(currentAnswer).trim();
    
    if (isEmpty) {
      toast({
        title: 'Error',
        description: t.answerRequired,
        variant: 'destructive',
      });
      return;
    }

    // Convert answer to appropriate format
    const formattedAnswer = typeof currentAnswer === 'number' 
      ? String(currentAnswer) 
      : currentAnswer;

    const finalAnswers = [...answers];
    finalAnswers[currentQuestionIndex] = {
      question: questions[currentQuestionIndex].question,
      answer: formattedAnswer
    };

    onComplete(finalAnswers);
  };

  if (isLoading) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <p className="text-muted-foreground">{t.loading}</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1 && answers.length >= 2;
  const canComplete = answers.length >= 3 || (answers.length >= 2 && isLastQuestion);

  const progressPercentage = ((currentQuestionIndex + 1) / Math.max(questions.length, 3)) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t.questionOf
              .replace('{current}', (currentQuestionIndex + 1).toString())
              .replace('{total}', Math.max(questions.length, currentQuestionIndex + 1).toString())
            }
          </span>
          {isLastQuestion && (
            <span className="text-sm text-primary font-medium">{t.finalStep}</span>
          )}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <Card className="p-6 border-border bg-card">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-foreground">{currentQuestion?.question}</h3>
                {(currentQuestion?.helpText || currentQuestion?.marketData) && (
                  <QuestionHelpTooltip 
                    helpText={currentQuestion.helpText || currentQuestion.context}
                    marketData={currentQuestion.marketData}
                  />
                )}
              </div>
              {currentQuestion?.context && (
                <p className="text-sm text-muted-foreground mb-4">{currentQuestion.context}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t.yourAnswer}</label>
            <EnhancedQuestionInput
              question={currentQuestion}
              value={currentAnswer}
              onChange={setCurrentAnswer}
              language={language === 'es' || language === 'en' ? language : 'es'}
            />
          </div>
        </div>
      </Card>

      {isGeneratingNext && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t.generatingNext}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-between">
        <Button 
          variant="outline" 
          onClick={currentQuestionIndex === 0 ? onBack : handlePrevious}
          disabled={isGeneratingNext}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentQuestionIndex === 0 ? (language === 'en' ? 'Back' : 'Volver') : t.previous}
        </Button>

        <div className="flex gap-3">
          {canComplete && (
            <Button 
              onClick={handleComplete}
              disabled={
                (Array.isArray(currentAnswer) ? currentAnswer.length === 0 : !String(currentAnswer).trim()) || 
                isGeneratingNext
              }
              className="bg-primary hover:bg-primary/90"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {t.complete}
            </Button>
          )}
          
          {!isLastQuestion && (
            <Button 
              onClick={handleNext}
              disabled={
                (Array.isArray(currentAnswer) ? currentAnswer.length === 0 : !String(currentAnswer).trim()) || 
                isGeneratingNext
              }
              variant={canComplete ? "outline" : "default"}
            >
              {t.next}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};