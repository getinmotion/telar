
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const ProjectStatusCards = () => {
  const { language } = useLanguage();
  
  const translations = {
    en: {
      projectStatus: "Project Status",
      projectStatusText: "This is a preliminary version of the Motion MVP. In the coming weeks we'll implement more advanced AI copilots with specialized assistants for different verticals.",
      note: "Note",
      noteText: "We're testing the dashboard with a select group of users. Thanks for being part of this stage!",
      nextSteps: "Next Steps",
      landingCreation: "Creation of landing page with waitlist",
      chatImplementation: "Implementation of chat with AI copilots",
      connectivityPlatforms: "Connectivity with WhatsApp and other platforms",
      dashboardMetrics: "Dashboard with metrics and analytics"
    },
    es: {
      projectStatus: "Estado del Proyecto",
      projectStatusText: "Esta es una versión preliminar del MVP de Motion. En las próximas semanas implementaremos copilots de IA más avanzados con asistentes especializados para diferentes verticales.",
      note: "Nota",
      noteText: "Estamos probando el dashboard con un grupo selecto de usuarios. ¡Gracias por ser parte de esta etapa!",
      nextSteps: "Próximos Pasos",
      landingCreation: "Creación de la landing con lista de espera",
      chatImplementation: "Implementación de chat con AI copilots",
      connectivityPlatforms: "Conectividad con WhatsApp y otras plataformas",
      dashboardMetrics: "Dashboard con métricas y analíticas"
    }
  };
  
  const t = translations[language];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t.projectStatus}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            {t.projectStatusText}
          </p>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md text-amber-700 text-sm">
            <strong>{t.note}:</strong> {t.noteText}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t.nextSteps}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="mr-2 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span>{t.landingCreation}</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span>{t.chatImplementation}</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span>{t.connectivityPlatforms}</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span>{t.dashboardMetrics}</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
