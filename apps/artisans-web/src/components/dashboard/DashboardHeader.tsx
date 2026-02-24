
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Grid3X3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { MotionLogo } from '@/components/MotionLogo';

interface DashboardHeaderProps {
  language: 'en' | 'es';
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ language }) => {
  const { signOut } = useAuth();

  const translations = {
    es: {
      dashboard: "Mi Taller Digital",
      viewAgents: "Ver Asistentes",
      logout: "Salir"
    }
  };

  const t = translations['es']; // Solo español para plataforma artesanal

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <MotionLogo size="md" />
          <h1 className="text-2xl font-bold text-gray-900">{t.dashboard}</h1>
        </div>
        
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="w-4 h-4" />
          {t.logout}
        </Button>
      </div>
    </header>
  );
};
