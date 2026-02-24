/**
 * Master Context - Contexto Unificado del Coordinador Maestro
 * 
 * Centraliza TODA la información del usuario para que el Coordinador Maestro
 * pueda tomar decisiones inteligentes y orquestar los agentes invisibles.
 */

import { CategoryScore } from './dashboard';
import { GeneratedTask, Deliverable } from './invisibleAgent';

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  whatsapp?: string;
  department?: string;
  city?: string;
  hasRUT: boolean;
  rut?: string;
  createdAt: Date;
  language: 'es' | 'en' | 'pt' | 'fr';
}

export interface BusinessProfile {
  brandName?: string;
  businessDescription?: string;
  craftType?: string;
  foundingYear?: number;
  numberOfEmployees?: number;
  targetMarket?: string;
  uniqueValueProposition?: string;
  logoUrl?: string;
  colors?: string[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    website?: string;
  };
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  productsCount: number;
  theme?: any;
  bannerUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  inventory: number;
  category?: string;
  isActive: boolean;
}

export interface BrandEvaluation {
  hasLogo: boolean;
  hasColors: boolean;
  hasDescription: boolean;
  hasSocialLinks: boolean;
  overallScore: number; // 0-100
  lastUpdated?: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'coordinator' | 'agent';
  content: string;
  agentId?: string;
  timestamp: Date;
  metadata?: any;
}

/**
 * Contexto completo del Master Coordinator
 */
export interface MasterContext {
  user: UserProfile;
  business: BusinessProfile;
  maturity: CategoryScore;
  tasks: GeneratedTask[];
  deliverables: Deliverable[];
  shop: Shop | null;
  products: Product[];
  brand: BrandEvaluation | null;
  conversationHistory: Message[];
  lastSync: Date;
  contextVersion: number;
}

/**
 * Estado de sincronización
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncedModule?: string;
  error?: string;
}
