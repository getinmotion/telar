import { describe, it, expect, vi } from 'vitest';
import { validateGrowthModule, generateValidationReport } from '../growthModuleValidator';
import { MATURITY_TEST_CONFIG } from '@/config/maturityTest';

describe('growthModuleValidator', () => {
  describe('validateGrowthModule', () => {
    it('should return validation result object', () => {
      const result = validateGrowthModule();
      
      expect(result).toHaveProperty('checkpointsWork');
      expect(result).toHaveProperty('bannersCorrect');
      expect(result).toHaveProperty('bannersCompact');
      expect(result).toHaveProperty('noRepeatBannerInDashboard');
      expect(result).toHaveProperty('dictationWorks');
      expect(result).toHaveProperty('aiExtractionWorks');
      expect(result).toHaveProperty('wizardUsable');
      expect(result).toHaveProperty('caminoArtesanalValid');
      expect(result).toHaveProperty('debugArtisanWorks');
      expect(result).toHaveProperty('allPassed');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });

    it('should validate test configuration constants', () => {
      const result = validateGrowthModule();
      
      // Si la configuración es correcta, no debe haber errores sobre constantes
      const hasConfigError = result.errors.some(error => 
        error.includes('TOTAL_QUESTIONS') ||
        error.includes('TOTAL_BLOCKS') ||
        error.includes('QUESTIONS_PER_BLOCK') ||
        error.includes('CHECKPOINT_FREQUENCY')
      );
      
      expect(hasConfigError).toBe(false);
    });

    it('should validate conversation blocks structure', () => {
      const result = validateGrowthModule();
      
      // Los bloques deben cargar sin errores
      const hasBlockError = result.errors.some(error => 
        error.includes('Bloques en') ||
        error.includes('debe tener 3 preguntas')
      );
      
      expect(hasBlockError).toBe(false);
    });

    it('should validate checkpoint logic', () => {
      const result = validateGrowthModule();
      
      // Los checkpoints deben estar configurados correctamente
      expect(result.checkpointsWork).toBe(true);
      
      const hasCheckpointError = result.errors.some(error => 
        error.includes('Checkpoint')
      );
      
      expect(hasCheckpointError).toBe(false);
    });

    it('should validate Camino Artesanal logic', () => {
      const result = validateGrowthModule();
      
      expect(result.caminoArtesanalValid).toBe(true);
      
      const hasCaminoError = result.errors.some(error => 
        error.includes('Camino Artesanal')
      );
      
      expect(hasCaminoError).toBe(false);
    });

    it('should have warnings array', () => {
      const result = validateGrowthModule();
      
      expect(Array.isArray(result.warnings)).toBe(true);
      // Debe tener al menos los warnings de verificación manual
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should have errors array (empty if all passed)', () => {
      const result = validateGrowthModule();
      
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should set allPassed to true when no errors', () => {
      const result = validateGrowthModule();
      
      if (result.errors.length === 0) {
        expect(result.allPassed).toBe(true);
      } else {
        expect(result.allPassed).toBe(false);
      }
    });
  });

  describe('MATURITY_TEST_CONFIG validation', () => {
    it('should have correct TOTAL_QUESTIONS', () => {
      expect(MATURITY_TEST_CONFIG.TOTAL_QUESTIONS).toBe(12);
    });

    it('should have correct TOTAL_BLOCKS', () => {
      expect(MATURITY_TEST_CONFIG.TOTAL_BLOCKS).toBe(4);
    });

    it('should have correct QUESTIONS_PER_BLOCK', () => {
      expect(MATURITY_TEST_CONFIG.QUESTIONS_PER_BLOCK).toBe(3);
    });

    it('should have correct CHECKPOINT_FREQUENCY', () => {
      expect(MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY).toBe(3);
    });

    it('should have correct MIN_REQUIRED_FOR_COMPLETION', () => {
      expect(MATURITY_TEST_CONFIG.MIN_REQUIRED_FOR_COMPLETION).toBe(12);
    });

    it('should have consistent math', () => {
      const expectedTotal = MATURITY_TEST_CONFIG.TOTAL_BLOCKS * MATURITY_TEST_CONFIG.QUESTIONS_PER_BLOCK;
      expect(expectedTotal).toBe(MATURITY_TEST_CONFIG.TOTAL_QUESTIONS);
    });
  });

  describe('generateValidationReport', () => {
    it('should generate a readable report', () => {
      const result = validateGrowthModule();
      const report = generateValidationReport(result);
      
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should include header', () => {
      const result = validateGrowthModule();
      const report = generateValidationReport(result);
      
      expect(report).toContain('GROWTH MODULE VALIDATION REPORT');
    });

    it('should show status', () => {
      const result = validateGrowthModule();
      const report = generateValidationReport(result);
      
      if (result.allPassed) {
        expect(report).toContain('✅ PASSED');
      } else {
        expect(report).toContain('❌ FAILED');
      }
    });

    it('should list individual checks', () => {
      const result = validateGrowthModule();
      const report = generateValidationReport(result);
      
      expect(report).toContain('Individual Checks:');
      expect(report).toContain('Checkpoints');
      expect(report).toContain('Banners');
      expect(report).toContain('Camino Artesanal');
    });

    it('should include errors section when errors exist', () => {
      const mockResult = {
        checkpointsWork: false,
        bannersCorrect: true,
        bannersCompact: true,
        noRepeatBannerInDashboard: true,
        dictationWorks: true,
        aiExtractionWorks: true,
        wizardUsable: true,
        caminoArtesanalValid: true,
        debugArtisanWorks: true,
        allPassed: false,
        errors: ['Test error 1', 'Test error 2'],
        warnings: []
      };
      
      const report = generateValidationReport(mockResult);
      
      expect(report).toContain('❌ ERRORS:');
      expect(report).toContain('Test error 1');
      expect(report).toContain('Test error 2');
    });

    it('should include warnings section when warnings exist', () => {
      const result = validateGrowthModule();
      const report = generateValidationReport(result);
      
      if (result.warnings.length > 0) {
        expect(report).toContain('⚠️  WARNINGS:');
      }
    });

    it('should be properly formatted with separators', () => {
      const result = validateGrowthModule();
      const report = generateValidationReport(result);
      
      expect(report).toContain('═══════════════════════════════════════════════════════');
    });
  });

  describe('Integration: Full validation flow', () => {
    it('should run complete validation without crashing', () => {
      expect(() => {
        const result = validateGrowthModule();
        const report = generateValidationReport(result);
      }).not.toThrow();
    });

    it('should produce consistent results on multiple runs', () => {
      const result1 = validateGrowthModule();
      const result2 = validateGrowthModule();
      
      expect(result1.allPassed).toBe(result2.allPassed);
      expect(result1.checkpointsWork).toBe(result2.checkpointsWork);
      expect(result1.caminoArtesanalValid).toBe(result2.caminoArtesanalValid);
    });

    it('should generate consistent reports', () => {
      const result = validateGrowthModule();
      const report1 = generateValidationReport(result);
      const report2 = generateValidationReport(result);
      
      expect(report1).toBe(report2);
    });
  });
});
