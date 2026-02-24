import React from 'react';
import { LanguageSettings } from '@/components/language/LanguageSettings';

export const LanguageProfileSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold">Configuración de Idioma</h2>
        <p className="text-muted-foreground">
          Personaliza la experiencia de idioma de tu plataforma y Coordinador Maestro
        </p>
      </div>
      <LanguageSettings />
    </div>
  );
};