import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserBusinessProfile, BusinessModel, BusinessStage } from '@/types/profile';
import { useTaskTitleCleanup } from '../task/useTaskTitleCleanup';
import { useUserLocalStorage } from './useUserLocalStorage';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';

/**
 * @deprecated This implementation is being phased out in favor of useUnifiedUserData
 * 
 * For now, this provides the original implementation to maintain backward compatibility.
 * New code should use useUnifiedUserData from './useUnifiedUserData'
 * 
 * To enable the new unified system, import from './useUserBusinessProfile.deprecated'
 */

export const useUserBusinessProfile = () => {
  const { user } = useAuth();
  const userLocalStorage = useUserLocalStorage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserBusinessProfile | null>(null);
  
  // Auto-cleanup task titles when profile is available
  useTaskTitleCleanup();

  // Derive business profile from various sources with enhanced field mapping
  const businessProfile = useMemo((): UserBusinessProfile | null => {
    if (!user) return null;

    // Get from user-namespaced localStorage - prioritize maturity calculator data
    const maturityScoresData = userLocalStorage.getItem('maturityScores');
    const calculatorProfileData = userLocalStorage.getItem('profileData');
    const fusedMaturityData = userLocalStorage.getItem('fused_maturity_calculator_progress');
    const conversationalData = userLocalStorage.getItem('enhanced_conversational_agent_progress');
    const oldConversationalData = userLocalStorage.getItem('conversational-agent-progress');
    const onboardingData = userLocalStorage.getItem('onboarding-answers');
    const maturityData = userLocalStorage.getItem('maturity-assessment');
    
    let parsedCalculatorProfile = {};
    let parsedMaturityScores = {};
    let parsedConversational = {};
    let parsedOnboarding = {};
    let parsedMaturity = {};
    
    try {
      // Priority: fused maturity > calculator > enhanced conversational > old conversational > onboarding
      if (fusedMaturityData) {
        const fusedData = JSON.parse(fusedMaturityData);
        parsedCalculatorProfile = fusedData.profileData || {};
      } else if (calculatorProfileData) {
        parsedCalculatorProfile = JSON.parse(calculatorProfileData);
      }
      
      if (maturityScoresData) {
        parsedMaturityScores = JSON.parse(maturityScoresData);
      }
      
      if (conversationalData) {
        const data = JSON.parse(conversationalData);
        parsedConversational = data.profileData || {};
      } else if (oldConversationalData) {
        const data = JSON.parse(oldConversationalData);
        parsedConversational = data.profileData || {};
      }
      
      if (onboardingData) parsedOnboarding = JSON.parse(onboardingData);
      if (maturityData) parsedMaturity = JSON.parse(maturityData);
    } catch (e) {
      console.warn('❌ Failed to parse stored data:', e);
    }

    // Merge data with maturity calculator taking highest priority
    const mergedData = { 
      ...parsedOnboarding, 
      ...parsedConversational, 
      ...parsedCalculatorProfile 
    };

    // Detect business model from answers using merged data
    const businessModel = detectBusinessModel(mergedData);
    const businessStage = detectBusinessStage(mergedData, parsedMaturity, parsedMaturityScores);

    return {
      userId: user.id,
      fullName: (profile as any)?.full_name || user.email?.split('@')[0] || 'Usuario',
      businessModel,
      businessStage,
      currentChannels: extractCurrentChannels(mergedData),
      desiredChannels: extractDesiredChannels(mergedData),
      timeAvailability: extractTimeAvailability(mergedData),
      financialResources: extractFinancialResources(mergedData),
      teamSize: extractTeamSize(mergedData),
      primaryGoals: extractPrimaryGoals(mergedData),
      urgentNeeds: extractUrgentNeeds(mergedData),
      monthlyRevenueGoal: extractRevenueGoal(mergedData),
      specificAnswers: mergedData,
      skillsAndExpertise: extractSkills(mergedData),
      currentChallenges: extractChallenges(mergedData),
      maturityLevel: calculateMaturityLevel(parsedMaturity, parsedMaturityScores),
      lastAssessmentDate: new Date().toISOString(),
      language: (mergedData as any).language || 'es',
      // Enhanced fields from database profile
      businessDescription: sanitizeText((profile as any)?.business_description) || sanitizeText((mergedData as any).businessDescription) || '',
      brandName: sanitizeText((profile as any)?.brand_name) || sanitizeText((mergedData as any).brandName) || '',
      businessLocation: (profile as any)?.business_location || (mergedData as any).businessLocation || '',
      yearsInBusiness: (profile as any)?.years_in_business || (mergedData as any).yearsInBusiness || null,
      socialMediaPresence: (profile as any)?.social_media_presence || {},
      initialInvestmentRange: (profile as any)?.initial_investment_range || (mergedData as any).initialInvestmentRange || ''
    };
  }, [user, profile]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        // ✅ Usar servicio NestJS para obtener perfil
        const data = await getUserProfileByUserId(user.id);
        setProfile(data as any);
      } catch (err: any) {
        console.error('[useUserBusinessProfile] Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return {
    businessProfile,
    loading,
    error,
    refreshProfile: () => {
      if (user) {
        setLoading(true);
        // Refresh logic would go here
        setLoading(false);
      }
    }
  };
};

// Utilities
function sanitizeText(val: any): string {
  if (typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  // Ignore JSON-like arrays accidentally stored as text
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) return '';
  return trimmed.replace(/^"+|"+$/g, '');
}

// Helper functions to extract data from onboarding and conversational agent
function detectBusinessModel(answers: any): BusinessModel {
  // Check maturity calculator format first (UserProfileData)
  if (answers.profileType) {
    switch (answers.profileType) {
      case 'idea': return 'other';
      case 'solo': return 'services';
      case 'team': return 'consulting';
    }
  }

  // Check business type from calculator
  if (answers.businessType) {
    const businessType = answers.businessType.toLowerCase();
    if (businessType.includes('artisan') || businessType.includes('craft') ||
        businessType.includes('handmade') || businessType.includes('artesanal')) {
      return 'artisan';
    }
    if (businessType.includes('service') || businessType.includes('freelance')) {
      return 'services';
    }
    if (businessType.includes('product') || businessType.includes('ecommerce')) {
      return 'ecommerce';
    }
    if (businessType.includes('content') || businessType.includes('creator')) {
      return 'content';
    }
    if (businessType.includes('consulting') || businessType.includes('coach')) {
      return 'consulting';
    }
  }

  // Check industry from calculator
  if (answers.industry) {
    const industry = answers.industry.toLowerCase();
    if (industry.includes('ceramic') || industry.includes('craft') || 
        industry.includes('artisan') || industry.includes('artesanal') ||
        industry.includes('handmade') || industry.includes('artesanía')) {
      return 'artisan';
    }
    if (industry.includes('tech') || industry.includes('software') || 
        industry.includes('app') || industry.includes('saas')) {
      return 'saas';
    }
    if (industry.includes('consult') || industry.includes('service') ||
        industry.includes('coaching') || industry.includes('freelance')) {
      return 'consulting';
    }
    if (industry.includes('content') || industry.includes('media') ||
        industry.includes('blog') || industry.includes('youtube')) {
      return 'content';
    }
    if (industry.includes('retail') || industry.includes('tienda') ||
        industry.includes('productos')) {
      return 'retail';
    }
  }

  // Check business description from conversational agent or calculator
  const description = (answers.businessDescription || answers.description || '').toLowerCase();
  
  // Artisan keywords
  if (description.includes('hago') || description.includes('tejo') || 
      description.includes('crafts') || description.includes('artesanal') ||
      description.includes('handmade') || description.includes('artesanía') ||
      description.includes('ceramic') || description.includes('pottery')) {
    return 'artisan';
  }
  
  // Service keywords
  if (description.includes('servicio') || description.includes('service') ||
      description.includes('consultoría') || description.includes('consulting') ||
      description.includes('coach') || description.includes('freelance')) {
    return 'services';
  }
  
  // E-commerce keywords
  if (description.includes('vendo') || description.includes('tienda') ||
      description.includes('productos') || description.includes('sell') ||
      description.includes('ecommerce') || description.includes('online store')) {
    return 'ecommerce';
  }

  // Content creator keywords
  if (description.includes('content') || description.includes('blog') ||
      description.includes('youtube') || description.includes('influencer') ||
      description.includes('creator') || description.includes('media')) {
    return 'content';
  }
  
  return 'other';
}

function detectBusinessStage(answers: any, maturity: any, calculatorScores?: any): BusinessStage {
  // Check maturity calculator format first (UserProfileData)
  if (answers.hasSold !== undefined) {
    if (!answers.hasSold) return 'idea';
    
    // If they have sold, check sales consistency
    const consistency = answers.salesConsistency;
    if (consistency === 'never' || consistency === 'rarely') return 'mvp';
    if (consistency === 'sometimes') return 'early';
    if (consistency === 'regularly') return 'growth';
    
    // Check if they have consistent revenue and operations
    if (consistency === 'consistently' || consistency === 'always') return 'established';
  }

  // Use calculator scores if available
  if (calculatorScores) {
    const avgScore = (
      (calculatorScores.ideaValidation || 0) +
      (calculatorScores.userExperience || 0) +
      (calculatorScores.marketFit || 0) +
      (calculatorScores.monetization || 0)
    ) / 4;

    if (avgScore >= 80) return 'established';
    if (avgScore >= 60) return 'growth';
    if (avgScore >= 40) return 'early';
    if (avgScore >= 20) return 'mvp';
    return 'idea';
  }

  // Fallback to old format
  const hasRevenue = answers.hasRevenue === 'yes';
  const isOperating = answers.isOperating === 'yes';
  
  if (!hasRevenue && !isOperating) return 'idea';
  if (hasRevenue && !isOperating) return 'mvp';
  if (hasRevenue && isOperating) return 'early';
  
  return 'growth';
}

function extractCurrentChannels(answers: any): any[] {
  const channels = [];
  
  // Check conversational agent format
  if (answers.promotionChannels && Array.isArray(answers.promotionChannels)) {
    return answers.promotionChannels;
  }
  
  // Fallback to old format
  if (answers.instagram) channels.push('instagram');
  if (answers.facebook) channels.push('facebook');
  if (answers.whatsapp) channels.push('whatsapp');
  if (answers.website) channels.push('website');
  return channels;
}

function extractDesiredChannels(answers: any): any[] {
  return extractCurrentChannels(answers); // For now, same as current
}

function extractTimeAvailability(answers: any): any {
  return answers.timeAvailability || 'part_time';
}

function extractFinancialResources(answers: any): any {
  return answers.financialResources || 'minimal';
}

function extractTeamSize(answers: any): any {
  return answers.teamSize || 'solo';
}

function extractPrimaryGoals(answers: any): any[] {
  // Check maturity calculator format (UserProfileData)
  if (answers.businessGoals && typeof answers.businessGoals === 'string') {
    const goals = answers.businessGoals.toLowerCase();
    const goalArray = [];
    
    if (goals.includes('revenue') || goals.includes('sales') || goals.includes('income') || goals.includes('money')) {
      goalArray.push('increase_revenue');
    }
    if (goals.includes('scale') || goals.includes('grow') || goals.includes('expand') || goals.includes('crecer')) {
      goalArray.push('scale_operations');
    }
    if (goals.includes('automat') || goals.includes('efficiency') || goals.includes('optimize')) {
      goalArray.push('automate_processes');
    }
    if (goals.includes('brand') || goals.includes('recognition') || goals.includes('marketing')) {
      goalArray.push('build_brand');
    }
    if (goals.includes('market') || goals.includes('expand') || goals.includes('reach')) {
      goalArray.push('expand_market');
    }
    if (goals.includes('cost') || goals.includes('reduce') || goals.includes('save')) {
      goalArray.push('reduce_costs');
    }
    
    return goalArray.length > 0 ? goalArray : ['increase_revenue'];
  }
  
  // Check if urgencyLevel indicates specific goals
  if (answers.urgencyLevel && answers.urgencyLevel >= 8) {
    return ['increase_revenue', 'automate_processes'];
  }
  
  return answers.goals || ['increase_revenue'];
}

function extractUrgentNeeds(answers: any): string[] {
  // Check maturity calculator format (UserProfileData)
  if (answers.mainObstacles && Array.isArray(answers.mainObstacles)) {
    return answers.mainObstacles;
  }
  
  // Infer urgent needs from calculator data
  const needs = [];
  
  if (answers.customerClarity && answers.customerClarity < 5) {
    needs.push('Define target audience clearly');
  }
  
  if (answers.profitClarity && answers.profitClarity < 5) {
    needs.push('Clarify monetization strategy');
  }
  
  if (answers.marketingConfidence && answers.marketingConfidence < 5) {
    needs.push('Improve marketing strategy');
  }
  
  if (answers.delegationComfort && answers.delegationComfort < 5) {
    needs.push('Learn delegation and team management');
  }
  
  if (answers.urgencyLevel && answers.urgencyLevel >= 8) {
    needs.push('Generate immediate revenue');
  }
  
  return needs.length > 0 ? needs : (answers.urgentNeeds || []);
}

function extractRevenueGoal(answers: any): number | undefined {
  return answers.revenueGoal ? parseInt(answers.revenueGoal) : undefined;
}

function extractSkills(answers: any): string[] {
  // Check maturity calculator format (UserProfileData)
  if (answers.experience) {
    const exp = answers.experience.toLowerCase();
    const skills = [];
    
    if (exp.includes('marketing') || exp.includes('promotion') || exp.includes('advertising')) skills.push('marketing');
    if (exp.includes('sales') || exp.includes('selling') || exp.includes('business development')) skills.push('sales');
    if (exp.includes('design') || exp.includes('creative') || exp.includes('graphic')) skills.push('design');
    if (exp.includes('tech') || exp.includes('technical') || exp.includes('programming')) skills.push('technical');
    if (exp.includes('manage') || exp.includes('leadership') || exp.includes('team')) skills.push('management');
    if (exp.includes('finance') || exp.includes('accounting') || exp.includes('financial')) skills.push('finance');
    
    return skills;
  }
  
  // Infer skills from calculator confidence levels
  const skills = [];
  
  if (answers.marketingConfidence && answers.marketingConfidence >= 7) {
    skills.push('marketing');
  }
  
  if (answers.delegationComfort && answers.delegationComfort >= 7) {
    skills.push('management');
  }
  
  // Check activities for skill inference
  if (answers.activities && Array.isArray(answers.activities)) {
    answers.activities.forEach((activity: string) => {
      const act = activity.toLowerCase();
      if (act.includes('design') || act.includes('creative')) skills.push('design');
      if (act.includes('marketing') || act.includes('promotion')) skills.push('marketing');
      if (act.includes('sales') || act.includes('selling')) skills.push('sales');
    });
  }
  
  return [...new Set(skills)]; // Remove duplicates
}

function extractChallenges(answers: any): string[] {
  // Check maturity calculator format (UserProfileData)
  if (answers.mainObstacles && Array.isArray(answers.mainObstacles)) {
    return answers.mainObstacles;
  }
  
  // Infer challenges from calculator data
  const challenges = [];
  
  if (answers.customerClarity && answers.customerClarity < 5) {
    challenges.push('Unclear target audience');
  }
  
  if (answers.profitClarity && answers.profitClarity < 5) {
    challenges.push('Unclear monetization model');
  }
  
  if (answers.marketingConfidence && answers.marketingConfidence < 5) {
    challenges.push('Marketing and promotion difficulties');
  }
  
  if (answers.delegationComfort && answers.delegationComfort < 5) {
    challenges.push('Difficulty delegating tasks');
  }
  
  if (!answers.hasSold || answers.salesConsistency === 'never') {
    challenges.push('No sales or inconsistent revenue');
  }
  
  return challenges.length > 0 ? challenges : (answers.challenges || []);
}

function calculateMaturityLevel(maturity: any, calculatorScores?: any): number {
  // Prioritize calculator scores if available
  if (calculatorScores) {
    const scores = [
      calculatorScores.ideaValidation || 1,
      calculatorScores.userExperience || 1,
      calculatorScores.marketFit || 1,
      calculatorScores.monetization || 1
    ];
    
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
  
  // Fallback to old maturity format
  if (!maturity) return 1;
  
  const scores = [
    maturity.ideaValidation || 1,
    maturity.userExperience || 1,
    maturity.marketFit || 1,
    maturity.monetization || 1
  ];
  
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}