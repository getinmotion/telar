import { describe, it, expect } from 'vitest';
import {
  calculateCaminoArtesanalProgress,
  getProgressBreakdown,
  shouldUpdateProgress,
  getProgressMessage,
  validateProgressIntegrity
} from '../caminoArtesanalProgress';
import { MasterContext } from '@/types/masterContext';

describe('caminoArtesanalProgress', () => {
  describe('calculateCaminoArtesanalProgress', () => {
    it('should return 0 when no context provided', () => {
      expect(calculateCaminoArtesanalProgress(null)).toBe(0);
      expect(calculateCaminoArtesanalProgress(undefined)).toBe(0);
    });

    it('should return 0 when context is empty', () => {
      const emptyContext: MasterContext = {
        tasks: [],
        maturity: {
          ideaValidation: 0,
          userExperience: 0,
          marketFit: 0,
          monetization: 0
        }
      } as any;
      expect(calculateCaminoArtesanalProgress(emptyContext)).toBe(0);
    });

    it('should return 5% when maturity test completed but no tasks', () => {
      const contextWithTest: MasterContext = {
        tasks: [],
        maturity: {
          ideaValidation: 3,
          userExperience: 4,
          marketFit: 2,
          monetization: 2
        }
      } as any;
      expect(calculateCaminoArtesanalProgress(contextWithTest)).toBe(5);
    });

    it('should calculate progress correctly with completed tasks', () => {
      const contextWithTasks: MasterContext = {
        tasks: [
          { id: '1', status: 'completed', title: 'Task 1' },
          { id: '2', status: 'in_progress', title: 'Task 2' },
          { id: '3', status: 'completed', title: 'Task 3' },
          { id: '4', status: 'pending', title: 'Task 4' }
        ] as any,
        maturity: {
          ideaValidation: 3,
          userExperience: 3,
          marketFit: 3,
          monetization: 3
        }
      } as any;
      
      // 5% base + (2/4 * 95) = 5 + 47.5 = 52.5 -> rounded to 52 or 53
      const progress = calculateCaminoArtesanalProgress(contextWithTasks);
      expect(progress).toBeGreaterThanOrEqual(52);
      expect(progress).toBeLessThanOrEqual(53);
    });

    it('should return 100% when all tasks completed', () => {
      const fullContext: MasterContext = {
        tasks: [
          { id: '1', status: 'completed', title: 'Task 1' },
          { id: '2', status: 'completed', title: 'Task 2' },
          { id: '3', completion_status: 'completed', title: 'Task 3' },
          { id: '4', progress_percentage: 100, title: 'Task 4' }
        ] as any,
        maturity: {
          ideaValidation: 4,
          userExperience: 4,
          marketFit: 3,
          monetization: 4
        }
      } as any;
      
      expect(calculateCaminoArtesanalProgress(fullContext)).toBe(100);
    });

    it('should handle different task completion status formats', () => {
      const contextMixedStatus: MasterContext = {
        tasks: [
          { id: '1', status: 'completed' },
          { id: '2', completion_status: 'completed' },
          { id: '3', progress_percentage: 100 },
          { id: '4', status: 'pending' }
        ] as any,
        maturity: {
          ideaValidation: 3,
          userExperience: 3,
          marketFit: 3,
          monetization: 3
        }
      } as any;
      
      // 5% base + (3/4 * 95) = 5 + 71.25 = 76
      const progress = calculateCaminoArtesanalProgress(contextMixedStatus);
      expect(progress).toBeGreaterThanOrEqual(76);
      expect(progress).toBeLessThanOrEqual(77);
    });
  });

  describe('getProgressBreakdown', () => {
    it('should provide detailed breakdown', () => {
      const context: MasterContext = {
        tasks: [
          { id: '1', status: 'completed' },
          { id: '2', status: 'pending' }
        ] as any,
        maturity: {
          ideaValidation: 3,
          userExperience: 3,
          marketFit: 3,
          monetization: 3
        }
      } as any;

      const breakdown = getProgressBreakdown(context);
      
      expect(breakdown.baseProgress).toBe(5);
      expect(breakdown.completedTasks).toBe(1);
      expect(breakdown.totalTasks).toBe(2);
      expect(breakdown.completionRate).toBe(0.5);
      expect(breakdown.tasksProgress).toBeCloseTo(47.5, 1);
      expect(breakdown.totalProgress).toBeGreaterThanOrEqual(52);
    });

    it('should handle no tasks', () => {
      const context: MasterContext = {
        tasks: [],
        maturity: {
          ideaValidation: 2,
          userExperience: 2,
          marketFit: 2,
          monetization: 2
        }
      } as any;

      const breakdown = getProgressBreakdown(context);
      
      expect(breakdown.baseProgress).toBe(5);
      expect(breakdown.completedTasks).toBe(0);
      expect(breakdown.totalTasks).toBe(0);
      expect(breakdown.completionRate).toBe(0);
      expect(breakdown.tasksProgress).toBe(0);
      expect(breakdown.totalProgress).toBe(5);
    });
  });

  describe('shouldUpdateProgress', () => {
    it('should return true for significant changes (>= 1%)', () => {
      expect(shouldUpdateProgress(50, 51)).toBe(true);
      expect(shouldUpdateProgress(50, 55)).toBe(true);
      expect(shouldUpdateProgress(30, 25)).toBe(true);
    });

    it('should return false for insignificant changes (< 1%)', () => {
      expect(shouldUpdateProgress(50, 50)).toBe(false);
      expect(shouldUpdateProgress(50.5, 50.2)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(shouldUpdateProgress(0, 1)).toBe(true);
      expect(shouldUpdateProgress(99, 100)).toBe(true);
      expect(shouldUpdateProgress(100, 100)).toBe(false);
    });
  });

  describe('getProgressMessage', () => {
    it('should return correct Spanish messages', () => {
      expect(getProgressMessage(0, 'es')).toContain('Empecemos');
      expect(getProgressMessage(5, 'es')).toContain('Test completado');
      expect(getProgressMessage(25, 'es')).toContain('cuarto');
      expect(getProgressMessage(50, 'es')).toContain('Mitad');
      expect(getProgressMessage(75, 'es')).toContain('Casi');
      expect(getProgressMessage(100, 'es')).toContain('Felicidades');
    });

    it('should return correct English messages', () => {
      expect(getProgressMessage(0, 'en')).toContain('start');
      expect(getProgressMessage(5, 'en')).toContain('Test completed');
      expect(getProgressMessage(50, 'en')).toContain('Halfway');
      expect(getProgressMessage(100, 'en')).toContain('Congratulations');
    });

    it('should find closest range for intermediate values', () => {
      expect(getProgressMessage(23, 'es')).toContain('cuarto');
      expect(getProgressMessage(27, 'es')).toContain('cuarto');
      expect(getProgressMessage(48, 'es')).toContain('Mitad');
      expect(getProgressMessage(88, 'es')).toContain('Casi');
    });

    it('should default to Spanish when no language specified', () => {
      const message = getProgressMessage(50);
      expect(message).toContain('Mitad');
    });
  });

  describe('validateProgressIntegrity', () => {
    it('should validate correct progress', () => {
      const context: MasterContext = {
        tasks: [
          { id: '1', status: 'completed' },
          { id: '2', status: 'completed' }
        ] as any,
        maturity: {
          ideaValidation: 3,
          userExperience: 3,
          marketFit: 3,
          monetization: 3
        }
      } as any;
      
      (context as any).camino_artesanal_progress = 100;

      const validation = validateProgressIntegrity(context);
      
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
      expect(validation.correctedProgress).toBe(100);
    });

    it('should detect inflated progress', () => {
      const context: MasterContext = {
        tasks: [
          { id: '1', status: 'pending' }
        ] as any,
        maturity: {
          ideaValidation: 3,
          userExperience: 3,
          marketFit: 3,
          monetization: 3
        }
      } as any;
      
      (context as any).camino_artesanal_progress = 80;

      const validation = validateProgressIntegrity(context);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.issues[0]).toContain('excede el calculado');
    });

    it('should detect progress without completed tasks', () => {
      const context: MasterContext = {
        tasks: [
          { id: '1', status: 'pending' },
          { id: '2', status: 'in_progress' }
        ] as any,
        maturity: {
          ideaValidation: 3,
          userExperience: 3,
          marketFit: 3,
          monetization: 3
        }
      } as any;
      
      (context as any).camino_artesanal_progress = 50;

      const validation = validateProgressIntegrity(context);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some(issue => issue.includes('sin tareas completadas'))).toBe(true);
    });

    it('should detect progress over 100%', () => {
      const context: MasterContext = {
        tasks: [],
        maturity: {
          ideaValidation: 0,
          userExperience: 0,
          marketFit: 0,
          monetization: 0
        }
      } as any;
      
      (context as any).camino_artesanal_progress = 150;

      const validation = validateProgressIntegrity(context);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some(issue => issue.includes('inválido'))).toBe(true);
      expect(validation.correctedProgress).toBeLessThanOrEqual(100);
    });

    it('should provide corrected progress', () => {
      const context: MasterContext = {
        tasks: [
          { id: '1', status: 'completed' }
        ] as any,
        maturity: { idea_validation: 3 }
      } as any;
      
      (context as any).camino_artesanal_progress = 200;

      const validation = validateProgressIntegrity(context);
      
      expect(validation.correctedProgress).toBeLessThanOrEqual(100);
      expect(validation.correctedProgress).toBeGreaterThan(0);
    });
  });
});
