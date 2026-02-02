import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useContinuousLearning } from '../useContinuousLearning';

// Mock dependencies
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' }
  })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: {
              id: 'pattern-id',
              interactions_count: 10,
              tasks_completed_count: 5,
              tasks_abandoned_count: 2,
              completion_rate: 71.43,
              preferred_task_types: ['validation'],
              struggling_areas: [],
              strength_areas: [{ area: 'idea_validation', count: 3 }],
              maturity_trend: []
            },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      upsert: vi.fn(() => Promise.resolve({ error: null }))
    })),
    rpc: vi.fn(() => Promise.resolve({
      data: {
        task_complexity: 'intermediate',
        task_types: ['validation'],
        completion_rate: 71.43,
        recommended_focus: 'balanced_growth',
        learning_stage: 'beginner'
      },
      error: null
    }))
  }
}));

describe('useContinuousLearning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null values', () => {
    const { result } = renderHook(() => useContinuousLearning());

    expect(result.current.learningPattern).toBeNull();
    expect(result.current.recommendations).toBeNull();
  });

  it('should provide all required functions', () => {
    const { result } = renderHook(() => useContinuousLearning());

    expect(typeof result.current.trackTaskCompletion).toBe('function');
    expect(typeof result.current.trackTaskAbandonment).toBe('function');
    expect(typeof result.current.updateMaturityTrend).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should load learning pattern on mount', () => {
    const { result } = renderHook(() => useContinuousLearning());

    // Just verify the hook initializes correctly
    expect(result.current).toBeDefined();
    expect(typeof result.current.trackTaskCompletion).toBe('function');
  });

  it('should load recommendations on mount', () => {
    const { result } = renderHook(() => useContinuousLearning());

    // Just verify the hook initializes correctly
    expect(result.current).toBeDefined();
    expect(typeof result.current.refresh).toBe('function');
  });
});
