import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';

export const WelcomeSection = () => {
  const { t } = useTranslations();
  const { profile, context } = useUnifiedUserData();

  // Lista de nombres genéricos que NO deben mostrarse
  const genericNames = [
    'Tu Negocio',
    'Tu Emprendimiento',
    'Tu Empresa',
    'Tu Proyecto',
    'Tu Startup',
    'Tu Taller Artesanal',
    'Tu Sello Musical',
    'Tu Productora Musical',
    'Tu Estudio Creativo',
    'Tu Consultoría',
    'Tu Agencia',
    'Sin nombre definido'
  ];

  // Determinar el nombre a mostrar con fallback inteligente
  const displayName = 
    (profile?.brandName && !genericNames.some(g => profile.brandName?.toLowerCase() === g.toLowerCase()))
      ? profile.brandName
    : (context?.businessProfile?.brandName && !genericNames.some(g => context.businessProfile.brandName?.toLowerCase() === g.toLowerCase()))
      ? context.businessProfile.brandName
    : 'tu negocio';

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-1">
        {t.dashboard.welcome}, {displayName}! 👋
      </h1>
      <p className="text-gray-600">
        {t.dashboard.welcomeText}
      </p>
    </div>
  );
};
