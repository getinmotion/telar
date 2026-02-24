
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wrench, Home, RefreshCw } from 'lucide-react';

interface EmergencyDashboardProps {
  onNavigateToCalculator: () => void;
  onEmergencyRepair: () => void;
  onForceAccess: () => void;
  onCompleteReset: () => void;
}

export const EmergencyDashboard: React.FC<EmergencyDashboardProps> = ({
  onNavigateToCalculator,
  onEmergencyRepair,
  onForceAccess,
  onCompleteReset
}) => {
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Digital Workshop Recovery Mode',
      subtitle: 'Your digital workshop needs attention. Choose a recovery option:',
      completeAssessment: 'Complete Full Assessment',
      completeAssessmentDesc: 'Recommended: Take the maturity assessment to get personalized recommendations',
      quickSetup: 'Quick Emergency Setup',
      quickSetupDesc: 'Get basic functionality with default agents and scores',
      skipSetup: 'Skip Setup (Limited Features)',
      skipSetupDesc: 'Access digital workshop with minimal functionality',
      completeReset: 'Complete Reset',
      completeResetDesc: 'Clear all data and start fresh',
      problems: 'Common Problems We Can Fix:',
      problemsList: [
        'Missing or corrupted user data',
        'No enabled AI agents',
        'Broken maturity scores',
        'System configuration errors'
      ]
    },
    es: {
      title: 'Modo de Recuperación del Taller Digital',
      subtitle: 'Tu taller digital necesita atención. Elige una opción de recuperación:',
      completeAssessment: 'Completar Evaluación Completa',
      completeAssessmentDesc: 'Recomendado: Toma la evaluación de madurez para obtener recomendaciones personalizadas',
      quickSetup: 'Configuración Rápida de Emergencia',
      quickSetupDesc: 'Obtén funcionalidad básica con agentes y puntuaciones por defecto',
      skipSetup: 'Saltar Configuración (Funciones Limitadas)',
      skipSetupDesc: 'Accede al taller digital con funcionalidad mínima',
      completeReset: 'Reset Completo',
      completeResetDesc: 'Borra todos los datos y comienza desde cero',
      problems: 'Problemas Comunes que Podemos Arreglar:',
      problemsList: [
        'Datos de usuario faltantes o corruptos',
        'No hay agentes IA habilitados',
        'Puntuaciones de madurez rotas',
        'Errores de configuración del sistema'
      ]
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Complete Assessment Option */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-4">
              <Home className="w-6 h-6 text-green-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t.completeAssessment}</h3>
                <p className="text-sm text-gray-600 mb-3">{t.completeAssessmentDesc}</p>
                <Button onClick={onNavigateToCalculator} className="w-full">
                  {t.completeAssessment}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Setup Option */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-4">
              <Wrench className="w-6 h-6 text-blue-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t.quickSetup}</h3>
                <p className="text-sm text-gray-600 mb-3">{t.quickSetupDesc}</p>
                <Button onClick={onEmergencyRepair} variant="outline" className="w-full">
                  {t.quickSetup}
                </Button>
              </div>
            </div>
          </div>

          {/* Skip Setup Option */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-4">
              <Home className="w-6 h-6 text-gray-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t.skipSetup}</h3>
                <p className="text-sm text-gray-600 mb-3">{t.skipSetupDesc}</p>
                <Button onClick={onForceAccess} variant="ghost" className="w-full">
                  {t.skipSetup}
                </Button>
              </div>
            </div>
          </div>

          {/* Complete Reset Option */}
          <div className="border border-red-200 rounded-lg p-4 hover:bg-red-50 transition-colors">
            <div className="flex items-start space-x-4">
              <RefreshCw className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t.completeReset}</h3>
                <p className="text-sm text-gray-600 mb-3">{t.completeResetDesc}</p>
                <Button onClick={onCompleteReset} variant="destructive" className="w-full">
                  {t.completeReset}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">{t.problems}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {t.problemsList.map((problem, index) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                {problem}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
