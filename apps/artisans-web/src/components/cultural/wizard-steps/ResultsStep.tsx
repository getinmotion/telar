
import React, { useEffect, useState } from 'react';
import { UserProfileData } from '../types/wizardTypes';
import { StepContainer } from '../wizard-components/StepContainer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, Stars, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { CategoryScore } from '@/components/maturity/types';
import { RecommendedAgents } from '@/types/dashboard';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { calculateMaturityScores, ScoreBreakdown } from '../hooks/utils/scoreCalculation';
import { ScoreBreakdownDisplay } from '../components/ScoreBreakdownDisplay';
import { MaturityVisualization } from '../MaturityVisualization';

interface ResultsStepProps {
  profileData: UserProfileData;
  scores: CategoryScore;
  recommendedAgents: RecommendedAgents;
  language: 'en' | 'es';
  onComplete: () => void;
  illustration: string;
}

export const ResultsStep: React.FC<ResultsStepProps> = ({ 
  profileData,
  recommendedAgents, 
  language,
  onComplete,
  illustration
}) => {
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [tasksCreated, setTasksCreated] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Recalculate scores and get breakdown for detailed view
  const { scores, breakdown } = calculateMaturityScores(profileData, language);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isGeneratingTasks && !isCompleted) {
        console.log('Safety timeout triggered - allowing navigation');
        setIsGeneratingTasks(false);
        setIsCompleted(true);
        setHasError(true);
        toast({
          title: language === 'es' ? 'Continuando...' : 'Continuing...',
          description: language === 'es' 
            ? 'Podés continuar al dashboard. Las tareas se crearán en segundo plano.'
            : 'You can continue to the dashboard. Tasks will be created in the background.',
        });
      }
    }, 30000); // 30 seconds timeout

    return () => clearTimeout(safetyTimeout);
  }, [isGeneratingTasks, isCompleted, language, toast]);

  // Auto-navigate after showing success for 3 seconds
  useEffect(() => {
    if (isCompleted && !hasError) {
      const autoNavigateTimeout = setTimeout(() => {
        console.log('Auto-navigating to dashboard after success');
        handleGoToDashboard();
      }, 3000);

      return () => clearTimeout(autoNavigateTimeout);
    }
  }, [isCompleted, hasError]);

  // Generate personalized insights based on user responses
  const getPersonalizedInsight = () => {
    const { experience, industry, activities } = profileData;
    const overallScore = Math.round(
      (scores.ideaValidation + scores.userExperience + scores.marketFit + scores.monetization) / 4
    );

    if (language === 'es') {
      if (overallScore < 40) {
        return `¡Perfecto! Como me dijiste que ${experience === 'beginner' ? 'recién estás empezando' : 'tienes algo de experiencia'} en ${industry}, veo que estás en el momento ideal para construir bases sólidas. Vamos a empezar validando tu idea y creando los primeros pasos.`;
      } else if (overallScore < 70) {
        return `¡Qué bueno! Ya tienes una base interesante en ${industry}. Con lo que me contaste sobre ${activities?.[0] || 'tu proyecto'}, creo que es momento de potenciar lo que ya tienes y llevar tu proyecto al siguiente nivel.`;
      } else {
        return `¡Wow! Se nota que ya tienes experiencia en ${industry}. Tu proyecto está bastante avanzado, así que vamos a enfocarnos en optimizar y escalar lo que ya construiste.`;
      }
    } else {
      if (overallScore < 40) {
        return `Perfect! Since you told me you're ${experience === 'beginner' ? 'just getting started' : 'have some experience'} in ${industry}, I can see you're at the ideal moment to build solid foundations. Let's start by validating your idea and creating the first steps.`;
      } else if (overallScore < 70) {
        return `Great! You already have an interesting foundation in ${industry}. With what you told me about ${activities?.[0] || 'your project'}, I think it's time to boost what you already have and take your project to the next level.`;
      } else {
        return `Wow! I can tell you already have experience in ${industry}. Your project is quite advanced, so let's focus on optimizing and scaling what you've already built.`;
      }
    }
  };

  const getNextStepsRecommendation = () => {
    const overallScore = Math.round(
      (scores.ideaValidation + scores.userExperience + scores.marketFit + scores.monetization) / 4
    );

    if (language === 'es') {
      if (scores.ideaValidation < 50) {
        return "empezar validando tu idea con potenciales usuarios";
      } else if (scores.userExperience < 50) {
        return "mejorar la experiencia que le das a tus usuarios";
      } else if (scores.marketFit < 50) {
        return "entender mejor a tu mercado y competencia";
      } else {
        return "trabajar en tu modelo de monetización";
      }
    } else {
      if (scores.ideaValidation < 50) {
        return "start by validating your idea with potential users";
      } else if (scores.userExperience < 50) {
        return "improve the experience you give to your users";
      } else if (scores.marketFit < 50) {
        return "better understand your market and competition";
      } else {
        return "work on your monetization model";
      }
    }
  };

  const t = {
    en: {
      title: "Awesome! We've got your answers 🎉",
      subtitle: "Now that we know how your project is doing, we can create super specific tasks for you",
      personalInsight: "Here's what I think:",
      nextStepsTitle: "Your next steps should be:",
      overallMaturity: "Your Project Status",
      categoriesTitle: "Let's break it down:",
      recommendedAgents: "I'm assigning these AI assistants to help you:",
      generatingTasks: "Creating your personalized action plan...",
      generatingTasksDesc: "Hold on, I'm creating tasks based on everything you told me 🚀",
      tasksCreated: "Done! Your tasks are ready 🎯",
      tasksCreatedDesc: "I created {count} specific tasks for you to start working on",
      tasksError: "Let's get started anyway! 🚀",
      tasksErrorDesc: "I'll create your personalized tasks once you're in the dashboard",
      levels: {
        beginner: "Just getting started (and that's perfect!)",
        developing: "Building momentum", 
        growing: "Growing strong",
        advanced: "Advanced level (you're crushing it!)"
      },
      categoryLabels: {
        ideaValidation: "Idea Validation",
        userExperience: "User Experience", 
        marketFit: "Market Fit",
        monetization: "Monetization"
      },
      agentNames: {
        admin: "Administrative Assistant",
        accounting: "Financial Advisor",
        legal: "Legal Consultant",
        operations: "Operations Manager",
        cultural: "Creative Specialist"
      },
      primaryButtonText: "Let's start working! 🚀",
      secondaryButtonText: "Show me my tasks",
      continueAnyway: "Continue to Dashboard"
    },
    es: {
      title: "¡Genial! Ya tenemos tus respuestas 🎉",
      subtitle: "Ahora que sabemos cómo está tu proyecto, podemos crear tareas súper específicas para vos",
      personalInsight: "Acá va lo que pienso:",
      nextStepsTitle: "Tus próximos pasos deberían ser:",
      overallMaturity: "Estado de tu Proyecto",
      categoriesTitle: "Te lo explico por partes:",
      recommendedAgents: "Te voy a asignar estos asistentes IA para que te ayuden:",
      generatingTasks: "Creando tu plan de acción personalizado...",
      generatingTasksDesc: "Esperá un toque, estoy creando tareas basándome en todo lo que me contaste 🚀",
      tasksCreated: "¡Listo! Tus tareas están preparadas 🎯",
      tasksCreatedDesc: "Te creé {count} tareas específicas para que empieces a trabajar",
      tasksError: "¡Arranquemos igual! 🚀",
      tasksErrorDesc: "Te voy a crear las tareas personalizadas una vez que estés en el dashboard",
      levels: {
        beginner: "Recién empezando (¡y está perfecto!)",
        developing: "Agarrando ritmo",
        growing: "Creciendo fuerte", 
        advanced: "Nivel avanzado (¡la estás rompiendo!)"
      },
      categoryLabels: {
        ideaValidation: "Validación de Idea",
        userExperience: "Experiencia de Usuario",
        marketFit: "Ajuste al Mercado",
        monetization: "Monetización"
      },
      agentNames: {
        admin: "Asistente Administrativo",
        accounting: "Asesor Financiero",
        legal: "Consultor Legal",
        operations: "Gerente de Operaciones",
        cultural: "Especialista Creativo"
      },
      primaryButtonText: "¡Vamos a trabajar! 🚀",
      secondaryButtonText: "Mostrame mis tareas",
      continueAnyway: "Ir al Dashboard"
    }
  };
  
  // Calculate overall score
  const overallScore = Math.round(
    (scores.ideaValidation + scores.userExperience + scores.marketFit + scores.monetization) / 4
  );
  
  // Determine maturity level
  const getMaturityLevel = () => {
    if (overallScore >= 80) return t[language].levels.advanced;
    if (overallScore >= 60) return t[language].levels.growing;
    if (overallScore >= 40) return t[language].levels.developing;
    return t[language].levels.beginner;
  };
  
  // Get category color
  const getCategoryColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getRecommendedAgents = () => {
    const agents = [];
    
    if (recommendedAgents.admin) {
      agents.push({ id: 'admin', name: t[language].agentNames.admin });
    }
    if (recommendedAgents.cultural) {
      agents.push({ id: 'cultural', name: t[language].agentNames.cultural });
    }
    if (recommendedAgents.accounting) {
      agents.push({ id: 'accounting', name: t[language].agentNames.accounting });
    }
    if (recommendedAgents.legal) {
      agents.push({ id: 'legal', name: t[language].agentNames.legal });
    }
    if (recommendedAgents.operations) {
      agents.push({ id: 'operations', name: t[language].agentNames.operations });
    }

    return agents;
  };

  // Generate task recommendations when component mounts
  useEffect(() => {
    const generateTaskRecommendations = async () => {
      try {
        setIsGeneratingTasks(true);
        setHasError(false);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No user found');
          setIsGeneratingTasks(false);
          setIsCompleted(true);
          setHasError(true);
          return;
        }

        console.log('Generating task recommendations for user:', user.id);
        console.log('Profile data:', profileData);
        console.log('Maturity scores:', scores);

        // Show warning about task replacement
        const shouldProceed = window.confirm(
          language === 'es' 
            ? '¡Atención! Se van a reemplazar todas tus tareas anteriores generadas por la calculadora de madurez. ¿Deseas continuar?'
            : 'Warning! All your previous tasks generated by the maturity calculator will be replaced. Do you want to continue?'
        );

        if (!shouldProceed) {
          setIsGeneratingTasks(false);
          setIsCompleted(true);
          return;
        }

        const { data, error } = await supabase.functions.invoke('generate-task-recommendations', {
          body: {
            userId: user.id,
            profileData,
            maturityScores: scores,
            language,
            replaceExisting: true
          }
        });

        if (error) {
          console.error('Error generating task recommendations:', error);
          setHasError(true);
          
          // Check if it's the task limit error
          if (error.message?.includes('15 tareas activas') || error.message?.includes('15 active tasks')) {
            toast({
              title: language === 'es' ? 'Límite de tareas alcanzado' : 'Task limit reached',
              description: language === 'es' 
                ? 'Tienes demasiadas tareas activas. Las nuevas tareas se crearán después de completar algunas pendientes.'
                : 'You have too many active tasks. New tasks will be created after completing some pending ones.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: language === 'es' ? 'Continuemos igual' : 'Let\'s continue anyway',
              description: language === 'es' 
                ? 'Te voy a crear las tareas una vez que estés en el dashboard' 
                : 'I\'ll create your tasks once you\'re in the dashboard',
            });
          }
        } else {
          console.log('Task recommendations generated:', data);
          setTasksCreated(data?.tasksCreated || 0);
          
          toast({
            title: language === 'es' ? '¡Tareas creadas!' : 'Tasks created!',
            description: language === 'es' 
              ? `Se han creado ${data?.tasksCreated || 0} tareas personalizadas para ti`
              : `${data?.tasksCreated || 0} personalized tasks have been created for you`
          });
        }
      } catch (error) {
        console.error('Error generating task recommendations:', error);
        setHasError(true);
        toast({
          title: language === 'es' ? 'Continuemos igual' : 'Let\'s continue anyway',
          description: language === 'es' 
            ? 'Te voy a crear las tareas una vez que estés en el dashboard' 
            : 'I\'ll create your tasks once you\'re in the dashboard',
        });
      } finally {
        setIsGeneratingTasks(false);
        setIsCompleted(true);
      }
    };

    generateTaskRecommendations();
  }, [profileData, scores, language, toast]);

  // Handle navigation to dashboard
  const handleGoToDashboard = () => {
    console.log('🚀 Navigating to dashboard home');
    onComplete();
    navigate('/dashboard/home');
  };
  
  return (
    <StepContainer
      title={t[language].title}
      subtitle={t[language].subtitle}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Character and Overall Score */}
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shadow-lg mx-auto">
            <img 
              src={illustration} 
              alt="Character illustration" 
              className="w-16 h-16 object-contain"
            />
          </div>
          
          <div>
            <div className="text-4xl font-bold text-purple-900 mb-2">
              {overallScore}%
            </div>
            <div className="text-xl text-gray-600">
              {getMaturityLevel()}
            </div>
          </div>
        </motion.div>

        {/* Personalized Insight */}
        <motion.div 
          className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            {t[language].personalInsight}
          </h3>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            {getPersonalizedInsight()}
          </p>
          
          <div className="bg-white/60 rounded-xl p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">
              {t[language].nextStepsTitle}
            </h4>
            <p className="text-gray-700 capitalize">
              {getNextStepsRecommendation()}
            </p>
          </div>
        </motion.div>

        {/* Maturity Visualization Charts */}
        <MaturityVisualization scores={scores} language={language} />

        {/* Categories Grid */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {t[language].categoriesTitle}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(scores).map(([key, score], index) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700">
                    {t[language].categoryLabels[key as keyof typeof t[typeof language]['categoryLabels']]}
                  </span>
                  <span className="font-bold text-gray-900">
                    {score}%
                  </span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div 
                    className={`h-full rounded-full ${getCategoryColor(score)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ delay: 0.5 + (index * 0.2), duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Task Generation Status */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {isGeneratingTasks && !isCompleted && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {t[language].generatingTasks}
              </h3>
              <p className="text-gray-600">
                {t[language].generatingTasksDesc}
              </p>
            </div>
          )}

          {isCompleted && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  hasError 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-br from-green-500 to-emerald-600'
                }`}>
                  {hasError ? (
                    <ChevronRight className="w-8 h-8 text-white" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  )}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {hasError ? t[language].tasksError : t[language].tasksCreated}
              </h3>
              <p className="text-gray-600">
                {hasError 
                  ? t[language].tasksErrorDesc 
                  : t[language].tasksCreatedDesc.replace('{count}', tasksCreated.toString())
                }
              </p>
            </div>
          )}
        </motion.div>

        {/* Recommended Agents */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-lg p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {t[language].recommendedAgents}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {getRecommendedAgents().map((agent, index) => (
              <motion.div 
                key={agent.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + (index * 0.1) }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-800">{agent.name}</span>
              </motion.div>
            ))}
          </div>
          
          <Button 
            onClick={handleGoToDashboard}
            className="w-full gap-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 font-semibold py-4 text-lg shadow-lg"
            size="lg"
            disabled={false} // Always enable the button
          >
            <span>{t[language].primaryButtonText}</span>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </StepContainer>
  );
};
