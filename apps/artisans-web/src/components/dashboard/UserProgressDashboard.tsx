import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { mapToLegacyLanguage } from '@/utils/languageMapper';

/**
 * UserProgressDashboard - Simplified version without maturity calculator
 * Redirects users to main dashboard
 */
export const UserProgressDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const compatibleLanguage = mapToLegacyLanguage(language);

  const translations = {
    en: {
      title: 'Progress Dashboard',
      subtitle: 'Track your business progress',
      backToDashboard: 'Back to Dashboard',
      message: 'Your progress tracking is now integrated into the main dashboard.',
      goToDashboard: 'Go to Dashboard'
    },
    es: {
      title: 'Dashboard de Progreso',
      subtitle: 'Sigue el progreso de tu negocio',
      backToDashboard: 'Volver al Dashboard',
      message: 'El seguimiento de tu progreso ahora está integrado en el dashboard principal.',
      goToDashboard: 'Ir al Dashboard'
    }
  };

  const t = translations[compatibleLanguage];

  // Auto-redirect to main dashboard after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-12">
            <BarChart3 className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">{t.title}</h2>
            <p className="text-muted-foreground mb-8">{t.message}</p>
            <Button onClick={() => navigate('/dashboard')} size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t.goToDashboard}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
