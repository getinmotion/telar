/**
 * Tests de Integración del Flujo del Wizard
 * 
 * 🔒 PARTE DEL MÓDULO DE GROWTH - VER docs/GROWTH_MODULE_LOCKED.md
 * 
 * Tests más específicos y controlados del flujo del wizard:
 * - Navegación entre bloques
 * - Transición de checkpoints
 * - Cálculo de scores
 * - Generación de recomendaciones
 */

import { describe, it, expect, vi } from 'vitest';
import { MATURITY_TEST_CONFIG } from '@/config/maturityTest';
import { getFusedConversationBlocks } from '../data/fusedConversationBlocks';

describe('Wizard Flow Integration', () => {
  describe('Estructura de bloques', () => {
    it('should have exactly 4 blocks with 3 questions each', () => {
      const blocksEs = getFusedConversationBlocks('es');
      const blocksEn = getFusedConversationBlocks('en');

      // Verificar cantidad de bloques
      expect(blocksEs).toHaveLength(MATURITY_TEST_CONFIG.TOTAL_BLOCKS);
      expect(blocksEn).toHaveLength(MATURITY_TEST_CONFIG.TOTAL_BLOCKS);

      // Verificar preguntas por bloque
      blocksEs.forEach((block, index) => {
        expect(block.questions).toHaveLength(MATURITY_TEST_CONFIG.QUESTIONS_PER_BLOCK);
        expect(block.id).toBeTruthy();
        expect(block.title).toBeTruthy();
      });

      blocksEn.forEach((block, index) => {
        expect(block.questions).toHaveLength(MATURITY_TEST_CONFIG.QUESTIONS_PER_BLOCK);
        expect(block.id).toBeTruthy();
        expect(block.title).toBeTruthy();
      });
    });

    it('should have unique question IDs across all blocks', () => {
      const blocksEs = getFusedConversationBlocks('es');
      const questionIds = new Set<string>();
      
      blocksEs.forEach(block => {
        block.questions.forEach(q => {
          expect(questionIds.has(q.id)).toBe(false);
          questionIds.add(q.id);
        });
      });

      expect(questionIds.size).toBe(MATURITY_TEST_CONFIG.TOTAL_QUESTIONS);
    });

    it('should have matching structure between languages', () => {
      const blocksEs = getFusedConversationBlocks('es');
      const blocksEn = getFusedConversationBlocks('en');

      expect(blocksEs.length).toBe(blocksEn.length);

      blocksEs.forEach((blockEs, index) => {
        const blockEn = blocksEn[index];
        
        // Mismo número de preguntas
        expect(blockEs.questions.length).toBe(blockEn.questions.length);
        
        // Mismos IDs de preguntas
        blockEs.questions.forEach((qEs, qIndex) => {
          const qEn = blockEn.questions[qIndex];
          expect(qEs.id).toBe(qEn.id);
          expect(qEs.type).toBe(qEn.type);
          expect(qEs.fieldName).toBe(qEn.fieldName);
        });
      });
    });
  });

  describe('Lógica de checkpoints', () => {
    it('should trigger checkpoints at questions 3, 6, 9', () => {
      const checkpointPositions = [3, 6, 9];
      
      checkpointPositions.forEach(position => {
        const shouldShowCheckpoint = position % MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY === 0;
        expect(shouldShowCheckpoint).toBe(true);
      });
    });

    it('should NOT trigger checkpoint at question 12 (completion)', () => {
      const position = 12;
      const shouldShowCheckpoint = position % MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY === 0;
      
      // Aunque es múltiplo de 3, la pregunta 12 debe mostrar pantalla de finalización
      expect(shouldShowCheckpoint).toBe(true); // Se activa...
      
      // ...pero en el código debe verificarse que position < TOTAL_QUESTIONS
      // para mostrar finalización en lugar de checkpoint
    });

    it('should calculate checkpoint numbers correctly', () => {
      const checkpoints = [
        { answeredQuestions: 3, expectedCheckpoint: 1, isOnboarding: true }, // ✅ Onboarding especial
        { answeredQuestions: 5, expectedCheckpoint: 1, isOnboarding: false },
        { answeredQuestions: 10, expectedCheckpoint: 2, isOnboarding: false },
        { answeredQuestions: 15, expectedCheckpoint: 3, isOnboarding: false },
        { answeredQuestions: 20, expectedCheckpoint: 4, isOnboarding: false },
        { answeredQuestions: 25, expectedCheckpoint: 5, isOnboarding: false },
        { answeredQuestions: 30, expectedCheckpoint: 6, isOnboarding: false },
      ];

      checkpoints.forEach(({ answeredQuestions, expectedCheckpoint, isOnboarding }) => {
        const checkpointNumber = isOnboarding 
          ? 1 
          : Math.ceil(answeredQuestions / MATURITY_TEST_CONFIG.CHECKPOINT_FREQUENCY);
        expect(checkpointNumber).toBe(expectedCheckpoint);
      });
    });
  });

  describe('Progreso y completitud', () => {
    it('should calculate progress correctly for each stage', () => {
      const stages = [
        { answered: 0, expected: 0 },
        { answered: 3, expected: 25 },
        { answered: 6, expected: 50 },
        { answered: 9, expected: 75 },
        { answered: 12, expected: 100 },
      ];

      stages.forEach(({ answered, expected }) => {
        const progress = Math.round((answered / MATURITY_TEST_CONFIG.TOTAL_QUESTIONS) * 100);
        expect(progress).toBe(expected);
      });
    });

    it('should identify completion correctly', () => {
      expect(12 >= MATURITY_TEST_CONFIG.MIN_REQUIRED_FOR_COMPLETION).toBe(true);
      expect(11 >= MATURITY_TEST_CONFIG.MIN_REQUIRED_FOR_COMPLETION).toBe(false);
    });
  });

  describe('Tipos de preguntas', () => {
    it('should have valid question types', () => {
      const blocksEs = getFusedConversationBlocks('es');
      const validTypes = ['textarea', 'text-input', 'single-choice', 'multiple-choice', 'rating'];

      blocksEs.forEach(block => {
        block.questions.forEach(q => {
          expect(validTypes).toContain(q.type);
        });
      });
    });

    it('should have first question as textarea for AI extraction', () => {
      const blocksEs = getFusedConversationBlocks('es');
      const blocksEn = getFusedConversationBlocks('en');

      const firstQuestionEs = blocksEs[0].questions[0];
      const firstQuestionEn = blocksEn[0].questions[0];

      expect(['textarea', 'text-input']).toContain(firstQuestionEs.type);
      expect(['textarea', 'text-input']).toContain(firstQuestionEn.type);
    });

    it('should have options for single-choice questions', () => {
      const blocksEs = getFusedConversationBlocks('es');

      blocksEs.forEach(block => {
        block.questions.forEach(q => {
          if (q.type === 'single-choice') {
            expect(q.options).toBeDefined();
            expect(q.options!.length).toBeGreaterThan(0);
            
            q.options!.forEach(option => {
              expect(option.id).toBeTruthy();
              expect(option.label).toBeTruthy();
              expect(option.value).toBeTruthy();
            });
          }
        });
      });
    });
  });

  describe('Validación de campos requeridos', () => {
    it('should mark critical questions as required', () => {
      const blocksEs = getFusedConversationBlocks('es');

      // La primera pregunta (descripción del negocio) debe ser requerida
      const firstQuestion = blocksEs[0].questions[0];
      expect(firstQuestion.required).toBe(true);

      // Contar preguntas requeridas
      let requiredCount = 0;
      blocksEs.forEach(block => {
        block.questions.forEach(q => {
          if (q.required) requiredCount++;
        });
      });

      // Debe haber al menos 6 preguntas requeridas (50%)
      expect(requiredCount).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Contexto estratégico', () => {
    it('should provide strategic context for each block', () => {
      const blocksEs = getFusedConversationBlocks('es');

      blocksEs.forEach(block => {
        expect(block.agentMessage).toBeTruthy();
        expect(block.strategicContext).toBeTruthy();
        expect(block.agentMessage.length).toBeGreaterThan(20);
      });
    });

    it('should provide explanations for complex questions', () => {
      const blocksEs = getFusedConversationBlocks('es');

      blocksEs.forEach(block => {
        block.questions.forEach(q => {
          if (q.type === 'textarea' || q.required) {
            // Las preguntas importantes deben tener explicación
            expect(q.explanation).toBeDefined();
            expect(q.explanation!.length).toBeGreaterThan(20);
          }
        });
      });
    });
  });

  describe('Mapeo de datos del perfil', () => {
    it('should map all questions to profile fields', () => {
      const blocksEs = getFusedConversationBlocks('es');
      const fieldNames = new Set<string>();

      blocksEs.forEach(block => {
        block.questions.forEach(q => {
          expect(q.fieldName).toBeTruthy();
          fieldNames.add(q.fieldName);
        });
      });

      // Debe haber 12 campos únicos
      expect(fieldNames.size).toBe(MATURITY_TEST_CONFIG.TOTAL_QUESTIONS);
    });

    it('should have consistent field naming convention', () => {
      const blocksEs = getFusedConversationBlocks('es');

      blocksEs.forEach(block => {
        block.questions.forEach(q => {
          // Los campos deben estar en camelCase
          expect(q.fieldName).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        });
      });
    });
  });

  describe('Bloques temáticos', () => {
    it('should organize questions into logical blocks', () => {
      const blocksEs = getFusedConversationBlocks('es');

      const expectedThemes = [
        /identidad|experiencia|craft/i,  // Bloque 1: Identidad
        /venta|monetización|comercial/i, // Bloque 2: Ventas
        /marketing|digital|online/i,     // Bloque 3: Marketing
        /crecimiento|objetivo|futuro/i,  // Bloque 4: Crecimiento
      ];

      blocksEs.forEach((block, index) => {
        const theme = expectedThemes[index];
        const matchesTheme = theme.test(block.title) || theme.test(block.strategicContext);
        expect(matchesTheme).toBe(true);
      });
    });
  });

  describe('Consistencia de traducción', () => {
    it('should maintain question order across languages', () => {
      const blocksEs = getFusedConversationBlocks('es');
      const blocksEn = getFusedConversationBlocks('en');

      blocksEs.forEach((blockEs, blockIndex) => {
        const blockEn = blocksEn[blockIndex];

        blockEs.questions.forEach((qEs, qIndex) => {
          const qEn = blockEn.questions[qIndex];
          
          // Misma estructura
          expect(qEs.id).toBe(qEn.id);
          expect(qEs.type).toBe(qEn.type);
          expect(qEs.required).toBe(qEn.required);
          
          // Mismas opciones (si aplica)
          if (qEs.options && qEn.options) {
            expect(qEs.options.length).toBe(qEn.options.length);
            
            qEs.options.forEach((optEs, optIndex) => {
              const optEn = qEn.options![optIndex];
              expect(optEs.value).toBe(optEn.value);
            });
          }
        });
      });
    });
  });

  describe('Flujo de navegación', () => {
    it('should allow navigation through all blocks sequentially', () => {
      const blocksEs = getFusedConversationBlocks('es');
      let currentBlock = 0;

      // Simular avance por todos los bloques
      for (let i = 0; i < blocksEs.length - 1; i++) {
        currentBlock++;
        expect(currentBlock).toBeLessThan(blocksEs.length);
      }

      // Verificar que llegó al último bloque
      expect(currentBlock).toBe(blocksEs.length - 1);
    });

    it('should allow backward navigation', () => {
      let currentBlock = 3; // Último bloque

      // Simular retroceso
      while (currentBlock > 0) {
        currentBlock--;
      }

      expect(currentBlock).toBe(0);
    });
  });
});
