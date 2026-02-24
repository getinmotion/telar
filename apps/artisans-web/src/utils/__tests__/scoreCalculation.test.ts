import { describe, it, expect } from 'vitest';
import { calculateMaturityScores } from '@/components/cultural/hooks/utils/scoreCalculation';
import { UserProfileData } from '@/components/cultural/types/wizardTypes';

describe('scoreCalculation', () => {
  describe('calculateMaturityScores', () => {
    it('should calculate scores for beginner with no validation', () => {
      const mockProfile: UserProfileData = {
        experience: 'beginner',
        industry: 'technology',
        activities: ['thinking']
      };

      const result = calculateMaturityScores(mockProfile, 'en');

      expect(result.scores.ideaValidation).toBeLessThan(50);
      expect(result.scores.userExperience).toBeLessThan(50);
      expect(result.scores.marketFit).toBeLessThan(50);
      expect(result.scores.monetization).toBeLessThan(50);
    });

    it('should calculate higher scores for experienced users', () => {
      const mockProfile: UserProfileData = {
        experience: 'advanced',
        industry: 'technology',
        activities: ['selling', 'marketing', 'developing'],
        hasSold: true,
        salesConsistency: 'regular'
      };

      const result = calculateMaturityScores(mockProfile, 'en');

      expect(result.scores.ideaValidation).toBeGreaterThan(40);
      expect(result.scores.userExperience).toBeGreaterThan(40);
      expect(result.scores.marketFit).toBeGreaterThan(40);
      expect(result.scores.monetization).toBeGreaterThan(40);
    });

    it('should include breakdown for each category', () => {
      const mockProfile: UserProfileData = {
        experience: 'intermediate',
        industry: 'ecommerce',
        activities: ['selling']
      };

      const result = calculateMaturityScores(mockProfile, 'en');

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.ideaValidation).toBeDefined();
      expect(result.breakdown.userExperience).toBeDefined();
      expect(result.breakdown.marketFit).toBeDefined();
      expect(result.breakdown.monetization).toBeDefined();
    });

    it('should handle edge cases with minimal data', () => {
      const mockProfile: UserProfileData = {
        experience: 'beginner',
        industry: 'other'
      };

      const result = calculateMaturityScores(mockProfile, 'en');

      expect(result.scores.ideaValidation).toBeGreaterThanOrEqual(0);
      expect(result.scores.userExperience).toBeGreaterThanOrEqual(0);
      expect(result.scores.marketFit).toBeGreaterThanOrEqual(0);
      expect(result.scores.monetization).toBeGreaterThanOrEqual(0);
    });

    it('should work with both English and Spanish', () => {
      const mockProfile: UserProfileData = {
        experience: 'intermediate',
        industry: 'technology',
        activities: ['developing']
      };

      const resultEn = calculateMaturityScores(mockProfile, 'en');
      const resultEs = calculateMaturityScores(mockProfile, 'es');

      // Scores should be the same regardless of language
      expect(resultEn.scores).toEqual(resultEs.scores);
    });
  });
});
