import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSystemIntegrity, generateValidationReport } from '../systemIntegrityValidator';
import { ALLOWED_AGENTS, BLOCKED_AGENTS } from '@/config/allowedAgents';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          in: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}));

describe('systemIntegrityValidator', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ALLOWED_AGENTS configuration', () => {
    it('should have exactly 4 allowed agents', () => {
      expect(ALLOWED_AGENTS).toHaveLength(4);
      expect(ALLOWED_AGENTS).toEqual(['growth', 'inventory', 'digital-presence', 'brand']);
    });

    it('should have blocked agents configured', () => {
      expect(BLOCKED_AGENTS.length).toBeGreaterThan(0);
      expect(BLOCKED_AGENTS).toContain('legal');
      expect(BLOCKED_AGENTS).toContain('pricing');
    });
  });

  describe('validateSystemIntegrity', () => {
    it('should return validation result object with all sections', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(result).toHaveProperty('masterCoordinatorHealth');
      expect(result).toHaveProperty('agentSystemIntegrity');
      expect(result).toHaveProperty('dataSynchronization');
      expect(result).toHaveProperty('missionSystemHealth');
      expect(result).toHaveProperty('uiCoherence');
      expect(result).toHaveProperty('overallPassed');
      expect(result).toHaveProperty('criticalIssues');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('timestamp');
    });

    it('should have boolean overallPassed property', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(typeof result.overallPassed).toBe('boolean');
    });

    it('should have arrays for issues, warnings, and recommendations', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(Array.isArray(result.criticalIssues)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it('should have timestamp as Date object', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Master Coordinator Health', () => {
    it('should validate master context existence', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      const checks = result.masterCoordinatorHealth.checks;
      const contextCheck = checks.find(c => c.id === 'master_context_exists');
      
      expect(contextCheck).toBeDefined();
      expect(contextCheck?.name).toBe('Master Context Exists');
    });

    it('should validate task generation context', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      const checks = result.masterCoordinatorHealth.checks;
      const taskContextCheck = checks.find(c => c.id === 'task_generation_context_present');
      
      expect(taskContextCheck).toBeDefined();
      expect(taskContextCheck?.name).toBe('Task Generation Context');
    });
  });

  describe('Agent System Integrity', () => {
    it('should track allowed agents active', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(Array.isArray(result.agentSystemIntegrity.allowedAgentsActive)).toBe(true);
    });

    it('should track blocked agents with missions', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(Array.isArray(result.agentSystemIntegrity.blockedAgentsWithMissions)).toBe(true);
    });

    it('should validate no blocked agent missions', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      const checks = result.agentSystemIntegrity.checks;
      const blockedCheck = checks.find(c => c.id === 'no_blocked_agent_missions');
      
      expect(blockedCheck).toBeDefined();
      expect(blockedCheck?.name).toBe('Blocked Agents Check');
    });
  });

  describe('Data Synchronization', () => {
    it('should validate business name consistency', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(typeof result.dataSynchronization.businessNameConsistent).toBe('boolean');
      
      const checks = result.dataSynchronization.checks;
      const nameCheck = checks.find(c => c.id === 'business_name_consistent');
      
      expect(nameCheck).toBeDefined();
      expect(nameCheck?.name).toBe('Business Name Consistency');
    });

    it('should validate maturity scores source', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(['master_context', 'legacy_table', 'none']).toContain(result.dataSynchronization.maturityScoresSource);
      
      const checks = result.dataSynchronization.checks;
      const scoresCheck = checks.find(c => c.id === 'maturity_scores_source');
      
      expect(scoresCheck).toBeDefined();
      expect(scoresCheck?.name).toBe('Maturity Scores Source');
    });

    it('should validate localStorage namespacing', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      const checks = result.dataSynchronization.checks;
      const lsCheck = checks.find(c => c.id === 'localstorage_namespaced');
      
      expect(lsCheck).toBeDefined();
      expect(lsCheck?.name).toBe('LocalStorage Namespacing');
    });
  });

  describe('Mission System Health', () => {
    it('should track total missions', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(typeof result.missionSystemHealth.totalMissions).toBe('number');
      expect(result.missionSystemHealth.totalMissions).toBeGreaterThanOrEqual(0);
    });

    it('should track missions by agent', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(typeof result.missionSystemHealth.missionsByAgent).toBe('object');
    });

    it('should track missions without category', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      expect(typeof result.missionSystemHealth.missionsWithoutCategory).toBe('number');
      expect(result.missionSystemHealth.missionsWithoutCategory).toBeGreaterThanOrEqual(0);
    });

    it('should validate mission categorization', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      const checks = result.missionSystemHealth.checks;
      const categoryCheck = checks.find(c => c.id === 'missions_have_category');
      
      expect(categoryCheck).toBeDefined();
      expect(categoryCheck?.name).toBe('Mission Categorization');
    });
  });

  describe('UI Coherence', () => {
    it('should validate semantic token usage', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      const checks = result.uiCoherence.checks;
      const tokensCheck = checks.find(c => c.id === 'semantic_tokens_only');
      
      expect(tokensCheck).toBeDefined();
      expect(tokensCheck?.name).toBe('Semantic Color Tokens');
    });

    it('should validate no generic placeholders', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      
      const checks = result.uiCoherence.checks;
      const genericCheck = checks.find(c => c.id === 'no_generic_names');
      
      expect(genericCheck).toBeDefined();
      expect(genericCheck?.name).toBe('No Generic Placeholders');
    });
  });

  describe('generateValidationReport', () => {
    it('should generate a readable report', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      const report = generateValidationReport(result);
      
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should include header', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      const report = generateValidationReport(result);
      
      expect(report).toContain('SYSTEM INTEGRITY VALIDATION REPORT');
    });

    it('should show overall status', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      const report = generateValidationReport(result);
      
      if (result.overallPassed) {
        expect(report).toContain('✅ PASSED');
      } else {
        expect(report).toContain('❌ FAILED');
      }
    });

    it('should list all validation sections', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      const report = generateValidationReport(result);
      
      expect(report).toContain('MASTER COORDINATOR HEALTH');
      expect(report).toContain('AGENT SYSTEM INTEGRITY');
      expect(report).toContain('DATA SYNCHRONIZATION');
      expect(report).toContain('MISSION SYSTEM HEALTH');
      expect(report).toContain('UI COHERENCE');
    });

    it('should include timestamp', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      const report = generateValidationReport(result);
      
      expect(report).toContain('Timestamp:');
    });

    it('should be properly formatted with separators', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      const report = generateValidationReport(result);
      
      expect(report).toContain('═══════════════════════════════════════════════════════');
    });
  });

  describe('Integration: Full validation flow', () => {
    it('should run complete validation without crashing', async () => {
      await expect(async () => {
        const result = await validateSystemIntegrity(mockUserId);
        const report = generateValidationReport(result);
      }).not.toThrow();
    });

    it('should produce consistent results on multiple runs', async () => {
      const result1 = await validateSystemIntegrity(mockUserId);
      const result2 = await validateSystemIntegrity(mockUserId);
      
      // Structure should be consistent
      expect(result1.masterCoordinatorHealth.checks.length).toBe(result2.masterCoordinatorHealth.checks.length);
      expect(result1.agentSystemIntegrity.checks.length).toBe(result2.agentSystemIntegrity.checks.length);
    });

    it('should generate consistent reports', async () => {
      const result = await validateSystemIntegrity(mockUserId);
      const report1 = generateValidationReport(result);
      const report2 = generateValidationReport(result);
      
      expect(report1).toBe(report2);
    });
  });
});
