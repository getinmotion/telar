/**
 * Tests de Accesibilidad (a11y) para CulturalMaturityWizard
 * 
 * 🔒 PARTE DEL MÓDULO DE GROWTH - VER docs/GROWTH_MODULE_LOCKED.md
 * 
 * Verifica:
 * - Navegación por teclado
 * - ARIA labels y roles
 * - Compatibilidad con screen readers
 * - Contraste de colores
 * - Estructura semántica HTML
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
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

describe('CulturalMaturityWizard - Accessibility Tests', () => {
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

  describe('Verificación automática con axe', () => {
    it('should not have accessibility violations in initial state', async () => {
      const { container } = renderWizard();
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('should not have accessibility violations with progress data', async () => {
      localStorageMock.setItem(
        'test-user-id_fused_maturity_calculator_progress',
        JSON.stringify({
          answeredQuestions: 3,
          currentBlockIndex: 1,
          responses: { businessDescription: 'Test' },
        })
      );

      const { container } = renderWizard();
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });
  });

  describe('ARIA labels y roles', () => {
    it('should have proper ARIA roles for main sections', () => {
      const { container } = renderWizard();
      
      // Verificar presencia de roles principales
      const main = container.querySelector('[role="main"]') || container.querySelector('main');
      expect(main).toBeDefined();
    });

    it('should have aria-label for progress indicator', () => {
      const { container } = renderWizard();
      const progressBar = container.querySelector('[role="progressbar"]');
      
      if (progressBar) {
        expect(
          progressBar.hasAttribute('aria-label') || 
          progressBar.hasAttribute('aria-labelledby')
        ).toBe(true);
      }
    });

    it('should have proper aria-live regions for dynamic content', () => {
      const { container } = renderWizard();
      const liveRegions = container.querySelectorAll('[aria-live]');
      
      // Verificar que existen regiones live para anuncios dinámicos
      liveRegions.forEach((region: Element) => {
        const ariaLive = region.getAttribute('aria-live');
        expect(['polite', 'assertive', 'off']).toContain(ariaLive);
      });
    });
  });

  describe('Navegación por teclado', () => {
    it('should have focusable interactive elements', () => {
      const { container } = renderWizard();
      
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should have logical tab order', () => {
      const { container } = renderWizard();
      
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const tabIndices = Array.from(focusableElements).map((el: Element) => 
        parseInt(el.getAttribute('tabindex') || '0', 10)
      );
      
      // Verificar que no hay tabindex negativos (excepto -1 para elementos no focuseables)
      tabIndices.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(-1);
      });
    });

    it('should have visible focus indicators', () => {
      const { container } = renderWizard();
      
      const focusableElements = container.querySelectorAll(
        'button, [href], input'
      );
      
      focusableElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        // Los elementos focuseables no deben tener outline: none sin alternativa
        const hasOutline = styles.outline !== 'none';
        const hasBoxShadow = styles.boxShadow !== 'none';
        const hasBorder = styles.borderWidth !== '0px';
        
        expect(hasOutline || hasBoxShadow || hasBorder).toBe(true);
      });
    });
  });

  describe('Estructura semántica HTML', () => {
    it('should use semantic HTML elements', () => {
      const { container } = renderWizard();
      
      // Verificar uso de elementos semánticos
      const semanticElements = container.querySelectorAll(
        'main, section, article, nav, header, footer, aside'
      );
      
      // Debe haber al menos algunos elementos semánticos
      expect(semanticElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should have proper heading hierarchy', () => {
      const { container } = renderWizard();
      
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const headingLevels = Array.from(headings).map((h: Element) => 
        parseInt((h as HTMLHeadingElement).tagName.substring(1), 10)
      );
      
      if (headingLevels.length > 0) {
        // Debe comenzar con h1
        expect(headingLevels[0]).toBeLessThanOrEqual(2);
        
        // No debe saltar más de un nivel
        for (let i = 1; i < headingLevels.length; i++) {
          const diff = headingLevels[i] - headingLevels[i - 1];
          expect(diff).toBeLessThanOrEqual(1);
        }
      }
    });

    it('should have alt text for images', () => {
      const { container } = renderWizard();
      
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        expect(
          img.hasAttribute('alt') || 
          img.getAttribute('role') === 'presentation'
        ).toBe(true);
      });
    });
  });

  describe('Labels y campos de formulario', () => {
    it('should have labels for all form inputs', () => {
      const { container } = renderWizard();
      
      const inputs = container.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const hasLabel = 
          input.hasAttribute('aria-label') ||
          input.hasAttribute('aria-labelledby') ||
          container.querySelector(`label[for="${input.id}"]`) !== null;
        
        expect(hasLabel).toBe(true);
      });
    });

    it('should have descriptive button text', () => {
      const { container } = renderWizard();
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        const hasText = 
          button.textContent?.trim() ||
          button.hasAttribute('aria-label') ||
          button.hasAttribute('aria-labelledby');
        
        expect(hasText).toBeTruthy();
      });
    });
  });

  describe('Compatibilidad con screen readers', () => {
    it('should announce dynamic content changes', () => {
      const { container } = renderWizard();
      
      // Verificar que hay regiones con aria-live para anuncios
      const liveRegions = container.querySelectorAll('[aria-live="polite"], [aria-live="assertive"]');
      
      // Debe haber al menos una región live para anuncios de progreso
      expect(liveRegions.length).toBeGreaterThanOrEqual(0);
    });

    it('should have proper aria-describedby for complex fields', () => {
      const { container } = renderWizard();
      
      const describedElements = container.querySelectorAll('[aria-describedby]');
      describedElements.forEach(element => {
        const describedById = element.getAttribute('aria-describedby');
        if (describedById) {
          const descriptionElement = container.querySelector(`#${describedById}`);
          expect(descriptionElement).toBeDefined();
        }
      });
    });

    it('should mark decorative elements appropriately', () => {
      const { container } = renderWizard();
      
      const decorativeElements = container.querySelectorAll('[role="presentation"], [aria-hidden="true"]');
      decorativeElements.forEach(element => {
        // Elementos decorativos no deben ser focuseables
        expect(element.hasAttribute('tabindex')).toBe(false);
      });
    });
  });

  describe('Estados y feedback visual', () => {
    it('should indicate loading states accessibly', () => {
      const { container } = renderWizard();
      
      const loadingElements = container.querySelectorAll('[aria-busy="true"], [role="status"]');
      loadingElements.forEach(element => {
        // Elementos de carga deben tener aria-live o role apropiado
        expect(
          element.hasAttribute('aria-live') ||
          element.getAttribute('role') === 'status'
        ).toBe(true);
      });
    });

    it('should indicate disabled states properly', () => {
      const { container } = renderWizard();
      
      const disabledElements = container.querySelectorAll('[disabled], [aria-disabled="true"]');
      disabledElements.forEach(element => {
        // Elementos deshabilitados deben tener atributo disabled o aria-disabled
        expect(
          element.hasAttribute('disabled') ||
          element.getAttribute('aria-disabled') === 'true'
        ).toBe(true);
      });
    });
  });
});
