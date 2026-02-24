
import React from 'react';
import { DashboardBackground } from './DashboardBackground';

export const DashboardLoadingState: React.FC = () => {
  return (
    <DashboardBackground>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-300 mx-auto mb-4"></div>
          <p className="text-white text-lg mb-2">Cargando dashboard...</p>
          <p className="text-white/70 text-sm">Configurando tu espacio de trabajo</p>
        </div>
      </div>
    </DashboardBackground>
  );
};
