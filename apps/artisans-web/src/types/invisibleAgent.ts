/**
 * Invisible Agent System - Base Interfaces
 * 
 * Todos los agentes internos (Growth, Pricing, Brand, Digital Presence, Inventory, Legal)
 * implementan esta interfaz. El usuario nunca interactúa directamente con estos agentes,
 * solo con el Coordinador Maestro que los orquesta.
 */

import { CategoryScore } from './dashboard';

export interface UserContext {
  userId: string;
  businessName?: string;
  craftType?: string;
  maturityScores?: CategoryScore;
  hasShop: boolean;
  productsCount: number;
  hasCompletedOnboarding: boolean;
  language: 'es' | 'en' | 'pt' | 'fr';
  profileData?: any;
}

export interface AgentAnalysis {
  agentId: string;
  score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
}

export interface TaskStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
  inputType?: 'text' | 'file' | 'selection' | 'chat';
  validationCriteria?: string;
  aiContextPrompt?: string;
}

export interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  agentId: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  steps: TaskStep[];
  category: string;
  deliverableType?: string;
  isUnlocked: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  nextSteps?: string[];
  deliverable?: Deliverable;
}

export interface Deliverable {
  id: string;
  taskId?: string;
  title: string;
  description: string;
  type: 'pdf' | 'json' | 'report' | 'guide' | 'image';
  agentId: string;
  agentName: string;
  content?: any;
  createdAt: Date;
  downloadUrl?: string;
}

/**
 * Interfaz base que todos los agentes invisibles deben implementar
 */
export interface InvisibleAgent {
  id: string;
  name: string;
  description: string;
  
  /**
   * Analiza el contexto del usuario y genera insights
   */
  analyze: (userContext: UserContext) => Promise<AgentAnalysis>;
  
  /**
   * Genera tareas específicas basadas en el análisis
   */
  generateTasks: (analysis: AgentAnalysis, userContext: UserContext) => Promise<GeneratedTask[]>;
  
  /**
   * Valida si una tarea está completa y genera entregables si aplica
   */
  validateCompletion: (task: GeneratedTask, userContext: UserContext) => Promise<ValidationResult>;
  
  /**
   * Proporciona respuestas contextuales para el chat del Coordinador
   */
  getContextualResponse?: (question: string, userContext: UserContext) => Promise<string>;
}

/**
 * Sistema de priorización de tareas
 */
export interface TaskPrioritization {
  taskId: string;
  urgencyScore: number; // 0-100
  impactScore: number; // 0-100
  complexityScore: number; // 0-100
  overallPriority: 'critical' | 'high' | 'medium' | 'low';
  suggestedOrder: number;
}
