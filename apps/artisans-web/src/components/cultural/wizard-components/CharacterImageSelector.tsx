
import { WizardStepId } from '../hooks/useMaturityWizard';
import { CategoryScore } from '@/components/maturity/types';

export const getStepImage = (stepId: WizardStepId, calculateMaturityScores?: () => CategoryScore): string => {
  // Base images for different steps - all confirmed to exist in public folder
  const stepImages = {
    culturalProfile: '/lovable-uploads/4d2abc22-b792-462b-8247-6cc413c71b23.png',
    businessMaturity: '/lovable-uploads/9a2715d7-552b-4658-9c27-78866aaea8b4.png',
    managementStyle: '/lovable-uploads/aad610ec-9f67-4ed0-93dc-8c2b3e8f98d3.png',
    bifurcation: '/lovable-uploads/c131a30d-0ce5-4b65-ae3c-5715f73e4f4c.png',
    extendedQuestions: '/lovable-uploads/d9c1ecec-d8c1-4917-ac32-9dd8e20d33b0.png',
    dynamicQuestions: '/lovable-uploads/e2faf820-4987-4cf2-a69b-0b534fbbecbd.png',
    results: '/lovable-uploads/f8038b45-1f3e-4034-9af0-f7c1fd90dcab.png'
  };

  console.log('🎯 IMAGE SELECTOR: Getting image for step:', stepId);

  // Return the appropriate image for the current step
  if (stepId === 'results' && calculateMaturityScores) {
    const scores = calculateMaturityScores();
    const overallScore = Math.round(
      (scores.ideaValidation + scores.userExperience + scores.marketFit + scores.monetization) / 4
    );
    
    console.log('📊 RESULTS STEP: Calculated overall score:', overallScore);
    
    if (overallScore >= 80) {
      const highScoreImage = '/lovable-uploads/e5849e7b-cac1-4c76-9858-c7d5222cce96.png';
      console.log('🏆 HIGH SCORE: Using high score image:', highScoreImage);
      return highScoreImage;
    } else if (overallScore >= 60) {
      const mediumScoreImage = '/lovable-uploads/390caed4-1006-489e-9da8-b17d9f8fb814.png';
      console.log('📈 MEDIUM SCORE: Using medium score image:', mediumScoreImage);
      return mediumScoreImage;
    } else {
      const lowScoreImage = '/lovable-uploads/4da82626-7a63-45bd-a402-64023f2f2d44.png';
      console.log('📉 LOW SCORE: Using low score image:', lowScoreImage);
      return lowScoreImage;
    }
  }

  const selectedImage = stepImages[stepId] || stepImages.culturalProfile;
  console.log('🎨 STEP IMAGE: Selected image for', stepId, '->', selectedImage);
  
  return selectedImage;
};
