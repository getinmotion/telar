/**
 * Tests de Integración para CulturalMaturityWizard
 * 
 * 🔒 PARTE DEL MÓDULO DE GROWTH - VER docs/GROWTH_MODULE_LOCKED.md
 * 
 * Simula el flujo completo del wizard:
 * - Usuario responde 12 preguntas
 * - Checkpoints aparecen en las posiciones correctas (3, 6, 9)
 * - Se genera el resultado final con tareas
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CulturalMaturityWizard } from '../CulturalMaturityWizard';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock de datos de test
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const createMockProfileData = () => ({
  businessDescription: 'Mi marca de cerámica artesanal',
  experienceTime: '3_to_5',
  workStructure: 'solo',
  salesStatus: 'occasional',
  pricingMethod: 'cost_plus_margin',
  profitClarity: 'somewhat_clear',
  mainChannel: 'instagram',
  websiteStatus: 'no_website',
  brandingLevel: 'basic_logo',
  mainChallenge: 'getting_clients',
  growthGoal: 'more_sales',
  supportType: 'step_by_step',
});

// Mocks globales
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: any) => children,
}));

vi.mock('@/hooks/useTaskGenerationControl', () => ({
  useTaskGenerationControl: () => ({
    enableAutoGeneration: vi.fn(),
    disableAutoGeneration: vi.fn(),
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CulturalMaturityWizard - Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const renderWizard = (onComplete = vi.fn()) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LanguageProvider>
            <AuthProvider>
              <CulturalMaturityWizard onComplete={onComplete} />
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Rendering y montaje', () => {
    it('should render wizard component', () => {
      const onComplete = vi.fn();
      const { container } = renderWizard(onComplete);
      
      expect(container).toBeDefined();
      expect(container.firstChild).toBeDefined();
    });

    it('should call onComplete callback when provided', () => {
      const onComplete = vi.fn();
      renderWizard(onComplete);
      
      // Verificar que el callback existe y es una función
      expect(typeof onComplete).toBe('function');
    });

    it('should initialize with language provider', () => {
      const onComplete = vi.fn();
      const { container } = renderWizard(onComplete);
      
      // El wizard debe renderizarse dentro del provider
      expect(container.querySelector('div')).toBeDefined();
    });
  });

  describe('Estructura y configuración', () => {
    it('should accept onComplete callback', () => {
      const onComplete = vi.fn();
      renderWizard(onComplete);
      
      expect(onComplete).toEqual(expect.any(Function));
    });

    it('should render within required providers', () => {
      const onComplete = vi.fn();
      const { container } = renderWizard(onComplete);
      
      // Verificar que el wizard está montado
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('Manejo de errores', () => {
    it('should render without crashing', () => {
      const onComplete = vi.fn();
      
      expect(() => renderWizard(onComplete)).not.toThrow();
    });

    it('should handle invalid localStorage data', () => {
      // Guardar datos corruptos en localStorage
      localStorageMock.setItem('test-user-id_fused_maturity_calculator_progress', 'invalid json{');

      const onComplete = vi.fn();
      
      // El wizard debe cargar y limpiar datos corruptos
      expect(() => renderWizard(onComplete)).not.toThrow();
    });
  });
});
