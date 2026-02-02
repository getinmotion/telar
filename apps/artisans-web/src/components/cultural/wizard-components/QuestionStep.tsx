import React from 'react';
import { motion } from 'framer-motion';
import { UserProfileData } from '../types/wizardTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileWizardLayout } from '../components/MobileWizardLayout';
import { MobileRadioCards } from './MobileRadioCards';
import { MobileCheckboxCards } from './MobileCheckboxCards';
import { MobileWizardNavigation } from './MobileWizardNavigation';
import { IconOption } from './IconOption';
import { RadioCards } from './RadioCards';
import { CheckboxCards } from './CheckboxCards';

export interface QuestionConfig {
  id: string;
  type: 'radio' | 'checkbox' | 'icon-select';
  title: string;
  subtitle?: string;
  fieldName: keyof UserProfileData | string;
  options: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    value?: string;
  }>;
}

interface QuestionStepProps {
  question: QuestionConfig;
  profileData: UserProfileData;
  updateProfileData: (data: Partial<UserProfileData>) => void;
  language: 'en' | 'es';
  industry?: string;
  illustration?: string;
  currentStepNumber?: number;
  totalSteps?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  currentStepId?: string;
  isStepValid?: boolean;
}

export const QuestionStep: React.FC<QuestionStepProps> = ({
  question,
  profileData,
  updateProfileData,
  language,
  industry,
  illustration,
  currentStepNumber,
  totalSteps,
  onNext,
  onPrevious,
  isFirstStep,
  currentStepId,
  isStepValid = true
}) => {
  const isMobile = useIsMobile();

  const handleSingleSelect = (value: string) => {
    updateProfileData({ [question.fieldName]: value } as any);
  };

  const handleMultiSelect = (value: string, isChecked: boolean) => {
    const currentValues = [...(profileData[question.fieldName as keyof UserProfileData] as string[] || [])];
    
    if (isChecked && !currentValues.includes(value)) {
      updateProfileData({ 
        [question.fieldName]: [...currentValues, value] 
      } as any);
    } else if (!isChecked && currentValues.includes(value)) {
      updateProfileData({ 
        [question.fieldName]: currentValues.filter(item => item !== value) 
      } as any);
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'radio':
        return isMobile ? (
          <MobileRadioCards
            options={question.options}
            selectedValue={profileData[question.fieldName as keyof UserProfileData] as string}
            onChange={handleSingleSelect}
            withIcons
          />
        ) : (
          <RadioCards
            name={question.id}
            options={question.options}
            selectedValue={profileData[question.fieldName as keyof UserProfileData] as string}
            onChange={handleSingleSelect}
            withIcons
          />
        );
      
      case 'checkbox':
        return isMobile ? (
          <MobileCheckboxCards
            options={question.options}
            selectedValues={profileData[question.fieldName as keyof UserProfileData] as string[] || []}
            onChange={handleMultiSelect}
            withIcons
          />
        ) : (
          <CheckboxCards
            options={question.options}
            selectedValues={profileData[question.fieldName as keyof UserProfileData] as string[] || []}
            onChange={handleMultiSelect}
            withIcons
          />
        );
      
      case 'icon-select':
        return (
          <div className={`grid ${
            isMobile 
              ? 'grid-cols-1 gap-4' 
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
          }`}>
            {question.options.map(option => (
              <IconOption
                key={option.id}
                id={option.id}
                label={option.label}
                icon={option.icon}
                selected={profileData[question.fieldName as keyof UserProfileData] === option.id}
                onClick={handleSingleSelect}
                isMobile={isMobile}
              />
            ))}
          </div>
        );
      
      default:
        return <p>Question type not supported</p>;
    }
  };

  // Mobile Layout - NO CHARACTER IMAGE
  if (isMobile) {
    const navigationSlot = onNext && onPrevious ? (
      <MobileWizardNavigation
        onNext={onNext}
        onPrevious={onPrevious}
        isFirstStep={isFirstStep || false}
        isLastStep={false}
        isValid={isStepValid}
      />
    ) : null;

    return (
      <MobileWizardLayout
        currentStep={currentStepNumber || 1}
        totalSteps={totalSteps || 1}
        title={question.title}
        subtitle={question.subtitle}
        language={language}
        navigationSlot={navigationSlot}
      >
        {renderQuestionInput()}
      </MobileWizardLayout>
    );
  }

  // Desktop Layout - keep existing with image
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full flex flex-col"
    >
      <div className="flex-1 flex flex-col md:flex-row gap-6 p-4">
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-left mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-purple-800 mb-2">
                {question.title}
              </h2>
              {question.subtitle && (
                <p className="text-gray-600 text-base">
                  {question.subtitle}
                </p>
              )}
            </div>
            
            <div className="flex-1">
              {renderQuestionInput()}
            </div>
          </div>
        </div>
        
        {illustration && (
          <div className="w-full md:w-1/2 lg:w-2/5 h-auto md:min-h-[400px] flex justify-center items-center">
            <motion.div 
              className="relative w-full h-full min-h-[300px] md:min-h-[400px]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.5,
                delay: 0.2,
                type: "spring",
                stiffness: 100
              }}
            >
              <img 
                src={illustration} 
                alt="Step illustration"
                className="w-full h-full object-cover object-center rounded-xl" 
              />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
