/**
 * wizardProgressStore
 *
 * Store de Zustand para persistir el progreso de cualquier wizard
 * en sessionStorage. El progreso sobrevive recargas de página pero
 * no persiste entre sesiones del browser (a diferencia de localStorage).
 *
 * Resuelve: wizard de 20+ pasos pierde datos al recargar la página.
 *
 * Uso:
 *   const { saveProgress, getProgress, clearProgress } = useWizardProgressStore();
 *
 *   // Guardar estado en cada paso
 *   saveProgress('shop-creation', { currentStep: 3, data: { name: 'Mi tienda' } });
 *
 *   // Recuperar al montar el componente
 *   const saved = getProgress('shop-creation');
 *   if (saved) setStep(saved.currentStep);
 *
 *   // Limpiar al completar o cancelar el wizard
 *   clearProgress('shop-creation');
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WizardProgress {
  /** ID único del wizard (ej: 'shop-creation', 'brand-wizard') */
  wizardId: string;
  /** Número del paso actual (base 1) */
  currentStep: number;
  /** Datos acumulados del wizard */
  data: Record<string, any>;
  /** Timestamp de la última actualización (ISO) */
  savedAt: string;
}

interface WizardProgressState {
  /** Mapa de wizardId → progreso guardado */
  progresses: Record<string, WizardProgress>;

  /** Guarda o actualiza el progreso de un wizard */
  saveProgress: (
    wizardId: string,
    update: { currentStep?: number; data?: Record<string, any> },
  ) => void;

  /** Recupera el progreso de un wizard (null si no existe o expiró) */
  getProgress: (wizardId: string) => WizardProgress | null;

  /** Elimina el progreso de un wizard específico */
  clearProgress: (wizardId: string) => void;

  /** Elimina el progreso de todos los wizards */
  clearAll: () => void;
}

/** El progreso expira después de 8 horas (en ms) */
const PROGRESS_TTL_MS = 8 * 60 * 60 * 1000;

export const useWizardProgressStore = create<WizardProgressState>()(
  persist(
    (set, get) => ({
      progresses: {},

      saveProgress: (wizardId, update) => {
        set((state) => {
          const existing = state.progresses[wizardId] ?? {
            wizardId,
            currentStep: 1,
            data: {},
            savedAt: new Date().toISOString(),
          };

          return {
            progresses: {
              ...state.progresses,
              [wizardId]: {
                ...existing,
                currentStep: update.currentStep ?? existing.currentStep,
                data: { ...existing.data, ...(update.data ?? {}) },
                savedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      getProgress: (wizardId) => {
        const progress = get().progresses[wizardId];
        if (!progress) return null;

        // Verificar que no haya expirado
        const savedAt = new Date(progress.savedAt).getTime();
        if (Date.now() - savedAt > PROGRESS_TTL_MS) {
          // Expirado — limpiar y retornar null
          set((state) => {
            const { [wizardId]: _, ...rest } = state.progresses;
            return { progresses: rest };
          });
          return null;
        }

        return progress;
      },

      clearProgress: (wizardId) => {
        set((state) => {
          const { [wizardId]: _, ...rest } = state.progresses;
          return { progresses: rest };
        });
      },

      clearAll: () => set({ progresses: {} }),
    }),
    {
      name: 'telar-wizard-progress',
      // sessionStorage: el progreso sobrevive recargas pero no cierre del browser
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
