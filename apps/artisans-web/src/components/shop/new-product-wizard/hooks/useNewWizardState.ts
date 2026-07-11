import { useState, useCallback } from 'react';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import type { ProductStatus, AvailabilityType } from '@/services/products-new.types';
import { deriveAvailabilityType, deriveProductionType } from '../utils/availability';
import type { FieldMetadata, IdentityFieldMetadata, MaterialFieldMetadata, Step1InitialCaptureResponse, Step1ConfirmResponse, Step2CaptureResponse } from '@/types/agent.types';

export type PieceStyle = 'tradicional' | 'contemporaneo' | 'fusion';
export type PiecePurpose = 'funcional' | 'decorativa' | 'ritual' | 'coleccionable';
export type ProductionType = 'unica' | 'limitada' | 'continua' | 'bajo_pedido';
export type ProcessMethodType =
  | 'hecho_a_mano'
  | 'herramientas_manuales'
  | 'moldes'
  | 'telar'
  | 'torno'
  | 'tallado'
  | 'ensamble';

export interface CollaborationData {
  type?: string;
  name?: string;
  role?: string;
  description?: string;
}

/** Una variante en el wizard (precio en COP del vendedor, sin recargo) */
export interface WizardVariant {
  /** id de backend cuando la variante ya existe (se preserva en edición) */
  id?: string;
  /** ej. {"talla":"M","color":"Rojo"} */
  optionValues: Record<string, string>;
  /** Precio del vendedor; undefined = hereda el precio base del producto */
  price?: number;
  stock?: number;
  minStock?: number;
  isActive: boolean;
  sku?: string;
}

export interface NewWizardState {
  // ── STEP 1: La pieza ──────────────────────────────────────
  images: (File | string)[];
  name: string;
  shortDescription: string;
  materials: string[];

  // ── STEP 2: Identidad Artesanal ───────────────────────────
  categoryId?: string;
  subcategoryId?: string;
  purpose?: PiecePurpose;
  style?: PieceStyle; // kept for backward-compat with localStorage; UI uses `styles`
  styles?: PieceStyle[];
  culturalDenomination?: string;
  collectionName?: string;
  // Origin
  country?: string;
  department?: string;
  municipality?: string;
  community?: string;
  workshopName?: string;
  ethnicGroup?: string;
  // Collaboration
  isCollaboration?: boolean;
  collaboration?: CollaborationData;
  // Technique
  craftId?: string;
  primaryTechniqueId?: string;
  secondaryTechniqueId?: string;
  elaborationTime?: string;
  productionType?: ProductionType;
  manualInterventionPercentage?: number;
  artisanalHistory?: string;

  // ── STEP 3: Proceso y Tiempo ──────────────────────────────
  processMethod?: ProcessMethodType;
  processStages?: string[];
  processDescription?: string;
  requiresDrying?: boolean;
  additionalDryingTime?: string;
  monthlyCapacity?: number;
  tools?: string[];
  processEvidenceUrls?: string[];
  careNotes?: string;

  // ── STEP 4: Precio, Disponibilidad y Logística ────────────
  price?: number;
  sku?: string;
  inventory?: number;
  minimumStockAlert?: number;
  availabilityType?: AvailabilityType;
  // Variantes (color/talla/material)
  hasVariants?: boolean;
  /** Ejes activos elegidos por la artesana, ej. ['talla','color'] */
  variantAxes?: string[];
  /** Valores elegidos por eje, ej. {talla:['S','M'], color:['Rojo']} */
  variantAxisValues?: Record<string, string[]>;
  variants?: WizardVariant[];
  /** id de la variante única original (modo simple / edición) */
  primaryVariantId?: string;
  // Physical specs
  heightCm?: number;
  widthCm?: number;
  lengthCm?: number;
  weightKg?: number;
  // Packaging / shipping
  packagedWeightKg?: number;
  packagedWidthCm?: number;
  packagedHeightCm?: number;
  packagedLengthCm?: number;
  shippingOrigin?: string;
  shippingRestrictions?: string;
  specialHandling?: boolean;

  // ── STEP 5: Pasaporte Digital ─────────────────────────────
  // Populated from previous steps; no new fields

  // ── META ──────────────────────────────────────────────────
  status?: ProductStatus;
  productId?: string; // set when editing

  // ── AI SUGGESTION TRACKING ─────────────────────────────────
  fieldMetadata?: {
    shortDescription?: FieldMetadata;
    artisanalHistory?: FieldMetadata;
    category?: IdentityFieldMetadata;
    oficio?: IdentityFieldMetadata;
    materials?: MaterialFieldMetadata[];
    // Step 3 fields
    processDescription?: FieldMetadata;
    elaborationTime?: FieldMetadata;
    monthlyCapacity?: FieldMetadata;
    careNotes?: FieldMetadata;
    // Step 4 fields
    price?: FieldMetadata;
    weightKg?: FieldMetadata;
    variants?: FieldMetadata;
  };
  agentStep1Response?: Step1InitialCaptureResponse;
  agentStep1ConfirmResponse?: Step1ConfirmResponse;
  agentStep2Response?: Step2CaptureResponse;
}

const STORAGE_KEY = 'new-product-wizard-state';

const initialState: NewWizardState = {
  images: [],
  name: '',
  shortDescription: '',
  materials: [],
  country: 'Colombia',
  processStages: [],
  tools: [],
  processEvidenceUrls: [],
};

export const useNewWizardState = (autoRestore = false) => {
  const userLocalStorage = useUserLocalStorage();

  const [state, setState] = useState<NewWizardState>(() => {
    if (autoRestore) {
      const saved = userLocalStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Partial<NewWizardState>;
          // La disponibilidad se deriva del tipo de producción; normaliza borradores viejos
          if (parsed.productionType) {
            parsed.availabilityType = deriveAvailabilityType(parsed.productionType);
          } else if (parsed.availabilityType) {
            parsed.productionType = deriveProductionType(parsed.availabilityType);
          }
          return { ...initialState, ...parsed, images: [] };
        } catch {
          // ignore corrupt data
        }
      }
    }
    return initialState;
  });

  const update = useCallback(
    (updates: Partial<NewWizardState>) => {
      setState(prev => {
        const next = { ...prev, ...updates };
        const toSave = { ...next };
        delete (toSave as Partial<NewWizardState>).images;
        userLocalStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
        return next;
      });
    },
    [userLocalStorage],
  );

  const reset = useCallback(() => {
    setState(initialState);
    userLocalStorage.removeItem(STORAGE_KEY);
  }, [userLocalStorage]);

  return { state, update, reset };
};
