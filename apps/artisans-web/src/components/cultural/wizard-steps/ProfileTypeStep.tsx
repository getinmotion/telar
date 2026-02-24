
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { UserProfileData } from '../types/wizardTypes';
import { StepContainer } from '../wizard-components/StepContainer';
import { StepProgress } from '../wizard-components/StepProgress';
import { WizardNavigation } from '../wizard-components/WizardNavigation';

interface ProfileTypeStepProps {
  profileData: UserProfileData;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  language: 'en' | 'es';
  currentStepNumber: number;
  totalSteps: number;
  onNext: () => void;
  isStepValid: boolean;
}

export const ProfileTypeStep: React.FC<ProfileTypeStepProps> = ({
  profileData,
  updateProfileData,
  language,
  currentStepNumber,
  totalSteps,
  onNext,
  isStepValid,
}) => {
  const translations = {
    en: {
      title: "Select Your Profile Type",
      subtitle: "Choose the option that best describes your current situation",
      idea: {
        title: "I have an idea",
        description: "I'm in the early stages with a creative concept or business idea I want to develop"
      },
      solo: {
        title: "I work solo",
        description: "I'm an individual creator, freelancer, or solo entrepreneur managing my creative business"
      },
      team: {
        title: "I lead a team",
        description: "I manage a team or organization in the creative or cultural sector"
      }
    },
    es: {
      title: "Selecciona Tu Tipo de Perfil",
      subtitle: "Elige la opción que mejor describe tu situación actual",
      idea: {
        title: "Tengo una idea",
        description: "Estoy en las primeras etapas con un concepto creativo o idea de negocio que quiero desarrollar"
      },
      solo: {
        title: "Trabajo solo",
        description: "Soy un creador individual, freelancer o emprendedor solitario que gestiona mi negocio creativo"
      },
      team: {
        title: "Lidero un equipo",
        description: "Gestiono un equipo u organización en el sector creativo o cultural"
      }
    }
  };

  const t = translations[language];

  const handleSelectProfile = (type: 'idea' | 'solo' | 'team') => {
    updateProfileData({ profileType: type });
  };

  return (
    <StepContainer title={t.title} subtitle={t.subtitle}>
      <div className="flex flex-col space-y-8 w-full max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <StepProgress 
            currentStep={currentStepNumber} 
            totalSteps={totalSteps}
            language={language}
          />
          <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 mt-6">{t.title}</h2>
          <p className="text-lg text-gray-600 mt-2">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Idea Profile */}
          <ProfileCard 
            title={t.idea.title}
            description={t.idea.description}
            isSelected={profileData.profileType === 'idea'}
            onClick={() => handleSelectProfile('idea')}
            image="/lovable-uploads/4d2abc22-b792-462b-8247-6cc413c71b23.png"
          />

          {/* Solo Profile */}
          <ProfileCard 
            title={t.solo.title}
            description={t.solo.description}
            isSelected={profileData.profileType === 'solo'}
            onClick={() => handleSelectProfile('solo')}
            image="/lovable-uploads/f8038b45-1f3e-4034-9af0-f7c1fd90dcab.png"
          />

          {/* Team Profile */}
          <ProfileCard 
            title={t.team.title}
            description={t.team.description}
            isSelected={profileData.profileType === 'team'}
            onClick={() => handleSelectProfile('team')}
            image="/lovable-uploads/e2faf820-4987-4cf2-a69b-0b534fbbecbd.png"
          />
        </div>

        <WizardNavigation
          onNext={onNext}
          onPrevious={() => {}} // Empty function since this is the first step
          isFirstStep={true}
          isLastStep={false}
          language={language}
          currentStepId="profileType"
          profileData={profileData}
          isValid={isStepValid}
        />
      </div>
    </StepContainer>
  );
};

interface ProfileCardProps {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  image: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  title,
  description,
  isSelected,
  onClick,
  image
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'ring-4 ring-purple-500 bg-white shadow-purple-300'
          : 'bg-white hover:shadow-xl'
      }`}
      onClick={onClick}
    >
      <div className="h-32 sm:h-40 overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <img
          src={image}
          alt={title}
          className="w-28 h-28 object-contain transform transition-transform duration-300 hover:scale-110"
        />
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-bold text-purple-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
        
        {isSelected && (
          <div className="absolute top-3 right-3 bg-purple-600 text-white p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
};
