export type QuestionType = 
  | 'single-choice' 
  | 'multiple-choice' 
  | 'text-input'
  | 'textarea'
  | 'slider' 
  | 'button-group'
  | 'yes-no'
  | 'long_text_with_ai'; // ✨ Nuevo tipo para pregunta con IA

export interface QuestionOption {
  id: string;
  label: string;
  value: string | number;
  icon?: string;
  description?: string;
}

export interface ConversationQuestion {
  id: string;
  question: string;
  type: QuestionType;
  fieldName: string;
  options?: QuestionOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  explanation: string;
  required: boolean;
  enableDictation?: boolean; // ✨ Nuevo: habilitar dictado en esta pregunta
  aiExtraction?: {
    enabled: boolean;
    fields: string[];
  }; // ✨ Nuevo: configuración de extracción con IA
  // New conditional logic properties
  showIf?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'includes' | 'greater_than' | 'less_than' | 'exists' | 'not_exists';
    value: any;
  };
  skipTo?: string; // Skip to specific question/block based on answer
}

export interface ConversationBlock {
  id: string;
  title: string;
  subtitle: string;
  agentMessage: string;
  strategicContext?: string;
  questions: ConversationQuestion[];
  insights?: string[];
}

export interface MaturityLevel {
  id: string;
  level: number;
  name: string;
  description: string;
  characteristics: string[];
  nextSteps: string[];
}

export interface PersonalizedTask {
  id: string;
  title: string;
  description: string;
  agentId: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  category: string;
}

export interface ConversationalAgentState {
  currentBlockIndex: number;
  profileData: any;
  insights: string[];
  completedBlocks: string[];
  isCompleted: boolean;
  maturityLevel: MaturityLevel | null;
  personalizedTasks: PersonalizedTask[];
  lastUpdated: string;
}