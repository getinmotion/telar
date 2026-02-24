import { describe, it, expect } from 'vitest';
import {
  MATURITY_TEST_CONFIG,
  getRemainingQuestions,
  getProgressPercentage,
  isAssessmentComplete,
  getGlobalQuestionNumber
} from '../maturityTest';

describe('maturityTest config', () => {
  describe('MATURITY_TEST_CONFIG constants', () => {
    it('should have correct configuration values', () => {
      expect(MATURITY_TEST_CONFIG.TOTAL_QUESTIONS).toBe(30);
      expect(MATURITY_TEST_CONFIG.QUESTIONS_PER_BLOCK).toBe(5);
      expect(MATURITY_TEST_CONFIG.TOTAL_BLOCKS).toBe(6);
      expect(MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY).toBe(5);
      expect(MATURITY_TEST_CONFIG.MIN_REQUIRED_FOR_COMPLETION).toBe(30);
    });

    it('should have consistent math between blocks and questions', () => {
      const calculatedTotal = MATURITY_TEST_CONFIG.TOTAL_BLOCKS * MATURITY_TEST_CONFIG.QUESTIONS_PER_BLOCK;
      expect(calculatedTotal).toBe(MATURITY_TEST_CONFIG.TOTAL_QUESTIONS);
    });
  });

  describe('getRemainingQuestions', () => {
    it('should calculate remaining questions correctly', () => {
      expect(getRemainingQuestions(0)).toBe(30);
      expect(getRemainingQuestions(5)).toBe(25);
      expect(getRemainingQuestions(10)).toBe(20);
      expect(getRemainingQuestions(15)).toBe(15);
      expect(getRemainingQuestions(20)).toBe(10);
      expect(getRemainingQuestions(25)).toBe(5);
      expect(getRemainingQuestions(30)).toBe(0);
    });

    it('should never return negative values', () => {
      expect(getRemainingQuestions(35)).toBe(0);
      expect(getRemainingQuestions(100)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(getRemainingQuestions(1)).toBe(29);
      expect(getRemainingQuestions(29)).toBe(1);
    });
  });

  describe('getProgressPercentage', () => {
    it('should calculate progress percentage correctly', () => {
      expect(getProgressPercentage(0)).toBe(0);
      expect(getProgressPercentage(5)).toBe(17); // 5/30 = 16.67% -> 17%
      expect(getProgressPercentage(10)).toBe(33); // 10/30 = 33.33% -> 33%
      expect(getProgressPercentage(15)).toBe(50); // 15/30 = 50%
      expect(getProgressPercentage(20)).toBe(67); // 20/30 = 66.67% -> 67%
      expect(getProgressPercentage(25)).toBe(83); // 25/30 = 83.33% -> 83%
      expect(getProgressPercentage(30)).toBe(100); // 30/30 = 100%
    });

    it('should round percentages correctly', () => {
      expect(getProgressPercentage(1)).toBe(3); // 3.33... -> 3
      expect(getProgressPercentage(2)).toBe(7); // 6.66... -> 7
      expect(getProgressPercentage(7)).toBe(23); // 23.33... -> 23
    });

    it('should cap at 100%', () => {
      expect(getProgressPercentage(35)).toBe(100);
      expect(getProgressPercentage(100)).toBe(100);
    });

    it('should handle intermediate values', () => {
      const progress3 = getProgressPercentage(3);
      expect(progress3).toBeGreaterThan(0);
      expect(progress3).toBeLessThan(17);
      
      const progress12 = getProgressPercentage(12);
      expect(progress12).toBeGreaterThan(33);
      expect(progress12).toBeLessThan(50);
    });
  });

  describe('isAssessmentComplete', () => {
    it('should return false for incomplete assessments', () => {
      expect(isAssessmentComplete(0)).toBe(false);
      expect(isAssessmentComplete(15)).toBe(false);
      expect(isAssessmentComplete(29)).toBe(false);
    });

    it('should return true when all questions answered', () => {
      expect(isAssessmentComplete(30)).toBe(true);
    });

    it('should return true for values above minimum', () => {
      expect(isAssessmentComplete(31)).toBe(true);
      expect(isAssessmentComplete(100)).toBe(true);
    });
  });

  describe('getGlobalQuestionNumber', () => {
    it('should return next question number (1-based)', () => {
      expect(getGlobalQuestionNumber(0)).toBe(1);
      expect(getGlobalQuestionNumber(1)).toBe(2);
      expect(getGlobalQuestionNumber(2)).toBe(3);
      expect(getGlobalQuestionNumber(11)).toBe(12);
    });

    it('should cap at total questions', () => {
      expect(getGlobalQuestionNumber(12)).toBe(12);
      expect(getGlobalQuestionNumber(15)).toBe(12);
      expect(getGlobalQuestionNumber(100)).toBe(12);
    });

    it('should work correctly for checkpoint positions', () => {
      // After checkpoint 1 (5 questions answered)
      expect(getGlobalQuestionNumber(5)).toBe(6);
      
      // After checkpoint 2 (10 questions answered)
      expect(getGlobalQuestionNumber(10)).toBe(11);
      
      // After checkpoint 3 (15 questions answered)
      expect(getGlobalQuestionNumber(15)).toBe(16);
      
      // After checkpoint 4 (20 questions answered)
      expect(getGlobalQuestionNumber(20)).toBe(21);
      
      // After checkpoint 5 (25 questions answered)
      expect(getGlobalQuestionNumber(25)).toBe(26);
    });
  });

  describe('Integration: Functions work together', () => {
    it('should maintain consistency across all functions', () => {
      for (let answered = 0; answered <= 30; answered++) {
        const remaining = getRemainingQuestions(answered);
        const progress = getProgressPercentage(answered);
        const isComplete = isAssessmentComplete(answered);
        const questionNum = getGlobalQuestionNumber(answered);
        
        // Total should always be 30
        expect(answered + remaining).toBe(30);
        
        // Progress should increase with answered questions
        expect(progress).toBe(Math.min(100, Math.round((answered / 30) * 100)));
        
        // Completion status should match
        expect(isComplete).toBe(answered >= 30);
        
        // Question number should be valid
        expect(questionNum).toBeGreaterThan(0);
        expect(questionNum).toBeLessThanOrEqual(30);
      }
    });

    it('should handle checkpoint transitions correctly', () => {
      const checkpoints = [5, 10, 15, 20, 25];
      
      checkpoints.forEach(checkpoint => {
        const beforeProgress = getProgressPercentage(checkpoint - 1);
        const atProgress = getProgressPercentage(checkpoint);
        const afterProgress = getProgressPercentage(checkpoint + 1);
        
        expect(atProgress).toBeGreaterThan(beforeProgress);
        expect(afterProgress).toBeGreaterThan(atProgress);
        
        expect(getRemainingQuestions(checkpoint)).toBe(30 - checkpoint);
        expect(isAssessmentComplete(checkpoint)).toBe(false);
      });
    });
  });
});
