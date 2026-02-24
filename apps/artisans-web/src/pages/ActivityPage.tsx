import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUserInsights } from '@/hooks/useUserInsights';
import { useUserActivity } from '@/hooks/useUserActivity';
import { ActivityTimeline } from '@/components/profile/ActivityTimeline';
import { IntelligentInsights } from '@/components/profile/IntelligentInsights';
import { DeliverablesCenter } from '@/components/profile/DeliverablesCenter';
import { MotionLogo } from '@/components/MotionLogo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, TrendingUp, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language: rawLanguage } = useLanguage();
  const { insights, loading: insightsLoading } = useUserInsights();
  const { recentConversations, loading: activityLoading } = useUserActivity();

  // Ensure language is 'en' or 'es' only
  const language: 'en' | 'es' = rawLanguage === 'es' ? 'es' : 'en';

  const t = {
    en: {
      title: 'My Activity',
      subtitle: 'Track your progress, insights, and deliverables',
      back: 'Back to Dashboard',
      activity: 'Recent Activity',
      insights: 'Intelligent Insights',
      deliverables: 'Deliverables',
    },
    es: {
      title: 'Mi Actividad',
      subtitle: 'Seguimiento de tu progreso, análisis y entregables',
      back: 'Volver al Taller',
      activity: 'Actividad Reciente',
      insights: 'Análisis Inteligente',
      deliverables: 'Entregables',
    }
  };

  // Transform conversations to activity items
  const activities = recentConversations.map(conv => ({
    type: 'conversation' as const,
    title: conv.title || 'Conversación',
    agent_id: conv.agent_id,
    created_at: conv.updated_at,
    description: undefined
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <MotionLogo size="sm" />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">
                  {t[language].title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t[language].subtitle}
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t[language].back}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8">
          {/* Intelligent Insights Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {t[language].insights}
              </h2>
            </div>
            
            {insightsLoading ? (
              <div className="rounded-2xl border border-border/40 bg-card p-8 text-center">
                <div className="animate-pulse">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted" />
                  <div className="mt-4 h-4 w-32 mx-auto bg-muted rounded" />
                </div>
              </div>
            ) : insights ? (
              <IntelligentInsights
                insights={insights}
                language={language}
                onActionClick={(action) => {
                  console.log('Action clicked:', action);
                  // Handle action navigation
                }}
              />
            ) : (
              <div className="rounded-2xl border border-border/40 bg-card p-8 text-center text-muted-foreground">
                No hay análisis disponibles
              </div>
            )}
          </motion.section>

          {/* Activity Timeline Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {t[language].activity}
              </h2>
            </div>
            
            <ActivityTimeline
              activities={activities}
              language={language}
            />
          </motion.section>

          {/* Deliverables Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                <FileText className="h-5 w-5 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {t[language].deliverables}
              </h2>
            </div>
            
            <DeliverablesCenter />
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default ActivityPage;
