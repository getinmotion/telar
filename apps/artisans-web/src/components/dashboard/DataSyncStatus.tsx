
import React from 'react';
import { useDataRecovery } from '@/hooks/useDataRecovery';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, RefreshCw, Database } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const DataSyncStatus: React.FC = () => {
  const { language } = useLanguage();
  const { needsRecovery, recovering, recovered, error, performEmergencyRecovery } = useDataRecovery();

  const translations = {
    en: {
      needsRecovery: 'Data Sync Required',
      needsRecoveryDesc: 'Your assessment data needs to be synchronized with the database.',
      recovering: 'Synchronizing Data...',
      recoveringDesc: 'Please wait while we sync your assessment results.',
      recovered: 'Data Synchronized',
      recoveredDesc: 'Your assessment data has been successfully synchronized.',
      error: 'Sync Error',
      syncNow: 'Sync Now',
      tryAgain: 'Try Again'
    },
    es: {
      needsRecovery: 'Sincronización Requerida',
      needsRecoveryDesc: 'Tus datos de evaluación necesitan sincronizarse con la base de datos.',
      recovering: 'Sincronizando Datos...',
      recoveringDesc: 'Por favor espera mientras sincronizamos tus resultados de evaluación.',
      recovered: 'Datos Sincronizados',
      recoveredDesc: 'Tus datos de evaluación se han sincronizado exitosamente.',
      error: 'Error de Sincronización',
      syncNow: 'Sincronizar Ahora',
      tryAgain: 'Intentar de Nuevo'
    }
  };

  const t = translations[language];

  // No mostrar nada si no hay problemas
  if (!needsRecovery && !recovering && !recovered && !error) {
    return null;
  }

  const handleSync = async () => {
    const success = await performEmergencyRecovery();
    if (success) {
      // Recargar la página después de un breve delay para mostrar los cambios
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="mb-6 p-4 rounded-lg border">
      {needsRecovery && !recovering && (
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{t.needsRecovery}</h3>
            <p className="text-sm text-gray-600 mt-1">{t.needsRecoveryDesc}</p>
            <Button onClick={handleSync} className="mt-3" size="sm">
              <Database className="w-4 h-4 mr-2" />
              {t.syncNow}
            </Button>
          </div>
        </div>
      )}

      {recovering && (
        <div className="flex items-start space-x-3">
          <RefreshCw className="w-5 h-5 text-primary mt-0.5 animate-spin" />
          <div>
            <h3 className="font-medium text-gray-900">{t.recovering}</h3>
            <p className="text-sm text-gray-600 mt-1">{t.recoveringDesc}</p>
          </div>
        </div>
      )}

      {recovered && (
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-success mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">{t.recovered}</h3>
            <p className="text-sm text-gray-600 mt-1">{t.recoveredDesc}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{t.error}</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <Button onClick={handleSync} variant="outline" className="mt-3" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.tryAgain}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
