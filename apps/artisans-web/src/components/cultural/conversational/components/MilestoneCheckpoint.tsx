import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Palette, Target, TrendingUp, Users, ArrowRight, Trophy, Sparkles, Brain, Star } from 'lucide-react';
import { getRemainingQuestions, MATURITY_TEST_CONFIG } from '@/config/maturityTest';
import { supabase } from '@/integrations/supabase/client';
import { EventBus } from '@/utils/eventBus';
import { getLatestMaturityScore } from '@/services/userMaturityScores.actions';

interface MilestoneCheckpointProps {
  checkpointNumber: number;
  totalAnswered: number;
  totalQuestions: number;
  percentComplete: number;
  language: 'en' | 'es';
  profileData?: any;
  answeredQuestionIds?: Set<string>;
  allBlocks?: any[]; // ✅ All blocks to search for questions
  onContinue: () => void;
  onGoToDashboard: () => void;
  isOnboarding?: boolean;
}

export const MilestoneCheckpoint: React.FC<MilestoneCheckpointProps> = ({
  checkpointNumber,
  totalAnswered,
  totalQuestions,
  percentComplete,
  language,
  profileData,
  answeredQuestionIds,
  allBlocks, // ✅ Receive all blocks
  onContinue,
  onGoToDashboard,
  isOnboarding = false
}) => {
  const navigate = useNavigate();
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [caminoProgress, setCaminoProgress] = useState(0);

  // ✅ Detectar si es el checkpoint especial de onboarding (3 preguntas)
  const isOnboardingCheckpoint = isOnboarding && totalAnswered === 3;

  // Publicar evento cuando se complete onboarding
  useEffect(() => {
    if (isOnboardingCheckpoint && profileData?.userId) {
      EventBus.publish('onboarding.completed', { userId: profileData.userId });
      setCaminoProgress(5); // 5% initial progress
    }
  }, [isOnboardingCheckpoint, profileData]);

  // ✅ Calculate and fetch camino artesanal progress
  useEffect(() => {
    const calculateProgress = async () => {
      if (!profileData?.userId) return;

      try {
        // Obtener tareas del usuario
        const { data: userTasks } = await supabase
          .from('agent_tasks')
          .select('status')
          .eq('user_id', profileData.userId);

        // Obtener maturity scores
        // ✅ Migrado a endpoint NestJS (GET /telar/server/user-maturity-scores/user/{user_id})
        const maturityData = await getLatestMaturityScore(profileData.userId);

        // Construir contexto
        const masterContext = {
          tasks: userTasks || [],
          maturity: maturityData ? {
            ideaValidation: maturityData.ideaValidation || 0,
            userExperience: maturityData.userExperience || 0,
            marketFit: maturityData.marketFit || 0,
            monetization: maturityData.monetization || 0
          } : {
            ideaValidation: 0,
            userExperience: 0,
            marketFit: 0,
            monetization: 0
          }
        } as any;

        // Calcular progreso
        const { calculateCaminoArtesanalProgress } = await import('@/utils/caminoArtesanalProgress');
        const progress = calculateCaminoArtesanalProgress(masterContext);
        setCaminoProgress(progress);
      } catch (error) {
        console.error('Error calculating progress:', error);
      }
    };

    calculateProgress();

    // Subscribe to progress updates
    const unsubscribe = EventBus.subscribe('master.context.updated', (data: any) => {
      if (data.progress !== undefined) {
        setCaminoProgress(data.progress);
      }
    });

    return () => unsubscribe();
  }, [checkpointNumber, profileData]);

  // ✅ Generate AI summary with REAL questions and responses from ALL answered questions
  useEffect(() => {
    const generateSummary = async () => {
      if (checkpointNumber === 0) return;

      setIsLoadingSummary(true);

      try {
        // ✅ Recolectar TODAS las preguntas y respuestas respondidas hasta ahora
        const questionsAnswered: any[] = [];
        const userResponses: any[] = [];

        if (answeredQuestionIds && profileData && allBlocks) {
          const idsArray = Array.from(answeredQuestionIds);

          // Iterar sobre TODOS los IDs respondidos
          idsArray.forEach((questionId: string) => {

            // Buscar la pregunta en TODOS los bloques
            let question = null;
            for (const block of allBlocks) {
              question = block.questions?.find((q: any) => q.id === questionId);
              if (question) {
                break;
              }
            }

            if (question) {
              questionsAnswered.push({
                id: question.id,
                question: question.question,
                category: question.category || 'general'
              });

              // ✅ Búsqueda EXHAUSTIVA de la respuesta en profileData
              const fieldName = question.fieldName || question.id;
              const fieldNameCamel = fieldName.replace(/_([a-z])/g, (g: string) => g[1].toUpperCase());
              const fieldNameSnake = fieldName.replace(/([A-Z])/g, '_$1').toLowerCase();


              // Búsqueda exhaustiva en múltiples variaciones
              let answer =
                profileData[fieldNameSnake] ||
                profileData[fieldNameCamel] ||
                profileData[fieldName] ||
                profileData[question.id] ||
                // Buscar también en business_profile si existe
                (profileData.business_profile && (
                  profileData.business_profile[fieldNameSnake] ||
                  profileData.business_profile[fieldNameCamel] ||
                  profileData.business_profile[fieldName]
                )) ||
                'Sin respuesta';

              // Si es un objeto o array, convertir a string
              if (typeof answer === 'object' && answer !== null) {
                answer = JSON.stringify(answer);
              }

              userResponses.push(answer);
            } else {
              console.error(`❌ [CHECKPOINT-DEBUG] Question NOT found for ID: ${questionId}`);
            }
          });
        } else {
          console.error('❌ [CHECKPOINT-DEBUG] Missing required data:', {
            hasAnsweredIds: !!answeredQuestionIds,
            hasProfileData: !!profileData,
            hasAllBlocks: !!allBlocks
          });
        }


        const { data, error } = await supabase.functions.invoke('generate-checkpoint-summary', {
          body: {
            checkpointNumber,
            questionsAnswered, // ✅ AHORA con datos reales
            userResponses, // ✅ AHORA con datos reales
            language
          }
        });

        if (error) {
          console.error('❌ [CHECKPOINT] Error generating summary:', error);
          throw error;
        }

        if (data?.summary) {
          setAiSummary(data.summary);
        }
      } catch (error) {
        console.error('❌ [CHECKPOINT] Failed to generate summary:', error);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    generateSummary();
  }, [checkpointNumber, language, profileData, answeredQuestionIds, allBlocks]);

  // Generate dynamic checkpoint data based on TOTAL_BLOCKS
  const generateCheckpointData = (checkpointNum: number, lang: 'en' | 'es') => {
    const icons = [Palette, Target, TrendingUp, Users, CheckCircle, Trophy, Sparkles, Brain, Star];
    const iconIndex = checkpointNum % icons.length;

    const progress = Math.round((checkpointNum / MATURITY_TEST_CONFIG.TOTAL_BLOCKS) * 100);

    if (lang === 'es') {
      const titles = [
        "¡Excelente inicio! ✨", "¡Gran progreso! 🎯", "¡Avance sólido! 💪", "¡Casi terminamos! 🚀",
        "¡Muy bien! 🌟", "¡Impresionante! 💎", "¡Fantástico! 🎨", "¡Increíble! 🔥",
        "¡Sobresaliente! 🏆", "¡Magnífico! ✨", "¡Brillante! 🌠", "¡Perfecto! 🎉"
      ];
      return {
        title: titles[checkpointNum] || `¡Checkpoint ${checkpointNum + 1}! 🎯`,
        description: `Has completado el ${progress}% de tu evaluación`,
        benefitText: checkpointNum === MATURITY_TEST_CONFIG.TOTAL_BLOCKS - 1
          ? "✅ Evaluación completa: Análisis de madurez, recomendaciones personalizadas y acceso a todas las herramientas."
          : `🎁 Continúa para desbloquear: Análisis más profundo y recomendaciones específicas para tu negocio.`,
        icon: icons[iconIndex]
      };
    } else {
      const titles = [
        "Excellent Start! ✨", "Great Progress! 🎯", "Solid Progress! 💪", "Almost There! 🚀",
        "Doing Great! 🌟", "Impressive! 💎", "Fantastic! 🎨", "Amazing! 🔥",
        "Outstanding! 🏆", "Magnificent! ✨", "Brilliant! 🌠", "Perfect! 🎉"
      ];
      return {
        title: titles[checkpointNum] || `Checkpoint ${checkpointNum + 1}! 🎯`,
        description: `You've completed ${progress}% of your assessment`,
        benefitText: checkpointNum === MATURITY_TEST_CONFIG.TOTAL_BLOCKS - 1
          ? "✅ Complete assessment: Maturity analysis, personalized recommendations, and access to all tools."
          : `🎁 Continue to unlock: Deeper analysis and specific recommendations for your business.`,
        icon: icons[iconIndex]
      };
    }
  };

  const translations = {
    en: {
      checkpoints: Array.from({ length: MATURITY_TEST_CONFIG.TOTAL_BLOCKS }, (_, i) =>
        generateCheckpointData(i, 'en')
      ),
      progress: `${totalAnswered}/${totalQuestions} questions answered`,
      completion: `${percentComplete}% completed`,
      recommendation: "💡 The more you complete, the more accurate your growth roadmap will be. Each answer helps the platform understand you better and give you more useful advice.",
      questionsLeft: `Only ${totalQuestions - totalAnswered} questions left to unlock the complete analysis`,
      continue: "Continue Assessment",
      viewDashboard: "View Your Tasks",
      canReturn: "You can continue anytime from your workshop"
    },
    es: {
      checkpoints: Array.from({ length: MATURITY_TEST_CONFIG.TOTAL_BLOCKS }, (_, i) =>
        generateCheckpointData(i, 'es')
      ),
      progress: `${totalAnswered}/${totalQuestions} preguntas respondidas`,
      completion: `${percentComplete}% completado`,
      recommendation: "💡 Cuanto más completes, más precisa será tu hoja de ruta de crecimiento. Cada respuesta ayuda a la plataforma a entenderte mejor y darte consejos más útiles para tu negocio.",
      questionsLeft: `Solo ${getRemainingQuestions(totalAnswered)} preguntas más para desbloquear el análisis completo`,
      continue: "Continuar Evaluación",
      viewDashboard: "Ver Mis Tareas",
      canReturn: "Puedes continuar en cualquier momento desde tu taller"
    }
  };

  const t = translations[language];
  // ✅ Manejar caso especial del onboarding (checkpointNumber = 0)
  const checkpointIndex = Math.max(0, Math.min(
    isOnboarding ? 0 : checkpointNumber - 1,
    t.checkpoints.length - 1
  ));
  const checkpoint = t.checkpoints[checkpointIndex];
  const CheckpointIcon = checkpoint.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto p-6 sm:p-8"
    >
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-block mb-6"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-float">
              <CheckpointIcon className="w-12 h-12 text-white" />
            </div>
            {/* Sparkles around icon */}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
                className="absolute w-2 h-2 bg-accent rounded-full"
                style={{
                  top: `${20 + 30 * Math.cos((i / 6) * 2 * Math.PI)}%`,
                  left: `${50 + 30 * Math.sin((i / 6) * 2 * Math.PI)}%`,
                }}
              />
            ))}
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl font-bold text-charcoal mb-3"
        >
          {isOnboardingCheckpoint
            ? (language === 'es' ? '¡Bienvenido a tu Taller Digital! 🎉' : 'Welcome to Your Digital Workshop! 🎉')
            : `${checkpoint.title} 🎨`
          }
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-charcoal/70 mb-2"
        >
          {isOnboardingCheckpoint
            ? (language === 'es'
              ? 'Has completado las 3 preguntas iniciales. Tus primeras misiones te esperan.'
              : 'You\'ve completed the initial 3 questions. Your first missions await.')
            : checkpoint.description
          }
        </motion.p>

        {!isOnboardingCheckpoint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-charcoal/60 font-medium"
          >
            {t.questionsLeft}
          </motion.p>
        )}
      </div>

      {/* AI Summary */}
      {isLoadingSummary ? (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-2 border-primary/20 mb-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'es' ? 'Generando tu resumen...' : 'Generating your summary...'}
            </p>
          </div>
        </Card>
      ) : aiSummary ? (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-2 border-primary/20 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                🤖 {language === 'es' ? 'Resumen de tu Progreso' : 'Your Progress Summary'}
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {aiSummary}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Camino Artesanal Progress */}
      {caminoProgress > 0 && (
        <Card className="p-6 bg-gradient-to-br from-accent/10 to-background border-2 border-accent/30 mb-6">
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-3">
                {language === 'es' ? '🛤️ Progreso de tu Camino Artesanal' : '🛤️ Your Artisan Journey Progress'}
              </h4>
              <Progress value={caminoProgress} className="h-3 mb-2" />
              <p className="text-xs text-muted-foreground">
                {caminoProgress}% {language === 'es' ? 'completado' : 'completed'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg border border-primary/20 p-6 mb-6"
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-charcoal/70 mb-2">
            <span>{t.progress}</span>
            <span className="font-semibold text-primary">{t.completion}</span>
          </div>
          <div className="w-full bg-primary-subtle rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full shadow-sm relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>

        {/* ✅ FIX 2: Checkpoints Progress - Responsivo con scroll horizontal */}
        <div className="mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-2">
            {t.checkpoints.map((cp, index) => {
              const Icon = cp.icon;
              const isCompleted = index < checkpointNumber;
              const isCurrent = index === checkpointNumber - 1;

              return (
                <div key={index} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isCompleted
                        ? 'bg-primary text-white shadow-md'
                        : isCurrent
                          ? 'bg-primary-glow text-white shadow-lg scale-110'
                          : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </motion.div>
                  {index < t.checkpoints.length - 1 && (
                    <div className={`w-8 h-0.5 flex-shrink-0 ${isCompleted ? 'bg-primary' : 'bg-muted'
                      }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendation Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-primary-subtle rounded-xl p-4 text-center"
        >
          <p className="text-sm text-charcoal leading-relaxed">
            💚 {t.recommendation}
          </p>
        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {isOnboardingCheckpoint ? (
          <>
            {/* ✅ Onboarding checkpoint - Go to Dashboard */}
            <Button
              onClick={() => navigate('/dashboard/tasks')}
              size="lg"
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 shadow-lg"
            >
              <Trophy className="w-5 h-5 mr-2" />
              {language === 'es' ? 'Ver Mis Tareas' : 'View Your Tasks'}
            </Button>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-sm text-charcoal/60 mt-2 w-full"
            >
              {language === 'es'
                ? '💡 Podrás continuar el test completo (36 preguntas) desde el banner en tu dashboard'
                : '💡 You can continue the full test (36 questions) from the banner in your dashboard'
              }
            </motion.p>
          </>
        ) : (
          <>
            {/* Normal checkpoints - Continue or Go to Dashboard */}
            <Button
              onClick={onContinue}
              size="lg"
              className="flex-1 bg-charcoal hover:bg-charcoal/90 text-white shadow-lg hover:shadow-xl transition-all group"
            >
              {t.continue}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              onClick={onGoToDashboard}
              size="lg"
              variant="outline"
              className="flex-1 border-primary/30 text-charcoal hover:bg-primary-subtle hover:border-primary/50 transition-all"
            >
              {t.viewDashboard}
            </Button>
          </>
        )}
      </motion.div>

      {!isOnboardingCheckpoint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-sm text-charcoal/60 mt-4"
        >
          {t.canReturn}
        </motion.p>
      )}
    </motion.div>
  );
};
