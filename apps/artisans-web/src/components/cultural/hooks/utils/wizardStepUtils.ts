
import { UserProfileData } from '../../types/wizardTypes';
import { WizardStepId } from '../useMaturityWizard';

export const getCurrentStepInfo = (stepId: WizardStepId, language: 'en' | 'es') => {
  const translations = {
    en: {
      culturalProfile: 'Cultural Profile',
      businessMaturity: 'Business Maturity', 
      managementStyle: 'Management Style',
      bifurcation: 'Analysis Choice',
      extendedQuestions: 'Extended Questions',
      results: 'Results'
    },
    es: {
      culturalProfile: 'Perfil Cultural',
      businessMaturity: 'Madurez del Negocio',
      managementStyle: 'Estilo de Gestión', 
      bifurcation: 'Elección de Análisis',
      extendedQuestions: 'Preguntas Extendidas',
      results: 'Resultados'
    }
  };

  return {
    title: translations[language][stepId],
    stepId
  };
};

export const isStepValid = (stepId: WizardStepId, profileData: UserProfileData): boolean => {
  switch (stepId) {
    case 'culturalProfile':
      return !!(
        profileData.industry && 
        profileData.activities && 
        profileData.activities.length > 0 && 
        profileData.experience
      );
    
    case 'businessMaturity':
      // For paymentMethods, check if it's a non-empty array or a non-empty string
      const hasPaymentMethods = Array.isArray(profileData.paymentMethods) 
        ? profileData.paymentMethods.length > 0
        : !!profileData.paymentMethods;
      
      return !!(
        hasPaymentMethods &&
        profileData.brandIdentity && 
        profileData.financialControl
      );
    
    case 'managementStyle':
      // For taskOrganization, check if it's a non-empty array or a non-empty string
      const hasTaskOrganization = Array.isArray(profileData.taskOrganization)
        ? profileData.taskOrganization.length > 0
        : !!profileData.taskOrganization;
      
      return !!(
        profileData.teamStructure && 
        hasTaskOrganization &&
        profileData.decisionMaking
      );
    
    case 'extendedQuestions':
      // For collaboration, check if it's a non-empty array or a non-empty string
      const hasCollaboration = Array.isArray(profileData.collaboration)
        ? profileData.collaboration.length > 0
        : !!profileData.collaboration;
      
      return !!(
        profileData.pricingMethod && 
        profileData.internationalSales && 
        profileData.formalizedBusiness && 
        hasCollaboration &&
        profileData.economicSustainability
      );
    
    case 'bifurcation':
    case 'results':
      return true;
    
    default:
      return false;
  }
};
