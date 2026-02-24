/**
 * Tests de Snapshot para CulturalMaturityWizard
 * 
 * 🔒 PARTE DEL MÓDULO DE GROWTH - VER docs/GROWTH_MODULE_LOCKED.md
 * 
 * Detecta cambios no intencionados en:
 * - Estructura del wizard
 * - Banners de progreso
 * - Checkpoints visuales
 * - Indicadores de progreso
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CulturalMaturityWizard } from '../CulturalMaturityWizard';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock de usuario autenticado
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

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

describe('CulturalMaturityWizard - Snapshot Tests', () => {
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

  describe('Estructura inicial del wizard', () => {
    it('should match snapshot for initial wizard state', () => {
      const { container } = renderWizard();
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for wizard with no progress', () => {
      const { container } = renderWizard();
      const wizardElement = container.querySelector('[data-testid="wizard-container"]') || container.firstChild;
      expect(wizardElement).toMatchSnapshot();
    });
  });

  describe('Estados de progreso', () => {
    it('should match snapshot for wizard at 25% progress', () => {
      // Simular progreso guardado en localStorage
      localStorageMock.setItem(
        'test-user-id_fused_maturity_calculator_progress',
        JSON.stringify({
          answeredQuestions: 3,
          currentBlockIndex: 1,
          responses: {
            businessDescription: 'Test business',
            experienceTime: '3_to_5',
            workStructure: 'solo',
          },
        })
      );

      const { container } = renderWizard();
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for wizard at 50% progress', () => {
      localStorageMock.setItem(
        'test-user-id_fused_maturity_calculator_progress',
        JSON.stringify({
          answeredQuestions: 6,
          currentBlockIndex: 2,
          responses: {
            businessDescription: 'Test business',
            experienceTime: '3_to_5',
            workStructure: 'solo',
            salesStatus: 'occasional',
            pricingMethod: 'cost_plus_margin',
            profitClarity: 'somewhat_clear',
          },
        })
      );

      const { container } = renderWizard();
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for wizard at 75% progress', () => {
      localStorageMock.setItem(
        'test-user-id_fused_maturity_calculator_progress',
        JSON.stringify({
          answeredQuestions: 9,
          currentBlockIndex: 3,
          responses: {
            businessDescription: 'Test business',
            experienceTime: '3_to_5',
            workStructure: 'solo',
            salesStatus: 'occasional',
            pricingMethod: 'cost_plus_margin',
            profitClarity: 'somewhat_clear',
            mainChannel: 'instagram',
            websiteStatus: 'no_website',
            brandingLevel: 'basic_logo',
          },
        })
      );

      const { container } = renderWizard();
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Componentes visuales clave', () => {
    it('should match snapshot for progress indicator', () => {
      const { container } = renderWizard();
      const progressIndicator = container.querySelector('[role="progressbar"]');
      if (progressIndicator) {
        expect(progressIndicator).toMatchSnapshot();
      }
    });

    it('should match snapshot for wizard header', () => {
      const { container } = renderWizard();
      const header = container.querySelector('header') || container.querySelector('[role="banner"]');
      if (header) {
        expect(header).toMatchSnapshot();
      }
    });
  });

  describe('Responsive layout', () => {
    it('should match snapshot for mobile viewport', () => {
      // Simular viewport móvil
      global.innerWidth = 375;
      global.innerHeight = 667;
      global.dispatchEvent(new Event('resize'));

      const { container } = renderWizard();
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for tablet viewport', () => {
      // Simular viewport tablet
      global.innerWidth = 768;
      global.innerHeight = 1024;
      global.dispatchEvent(new Event('resize'));

      const { container } = renderWizard();
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for desktop viewport', () => {
      // Simular viewport desktop
      global.innerWidth = 1920;
      global.innerHeight = 1080;
      global.dispatchEvent(new Event('resize'));

      const { container } = renderWizard();
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe('Estados de idioma', () => {
    it('should match snapshot for Spanish language', () => {
      const { container } = renderWizard();
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for English language', () => {
      // Mock para cambiar idioma a inglés
      vi.mock('@/context/LanguageContext', () => ({
        useLanguage: () => ({
          language: 'en',
          setLanguage: vi.fn(),
        }),
        LanguageProvider: ({ children }: any) => children,
      }));

      const { container } = renderWizard();
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
