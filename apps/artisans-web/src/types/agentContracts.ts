import { SystemEvent } from '@/utils/eventBus';
import { CategoryScore } from './dashboard';

export interface AgentInvocation {
  agent: string;
  action: string;
  payload?: any;
}

export interface AgentResponse {
  status: 'success' | 'error' | 'requires_input';
  data?: any;
  deliverables?: any[];
  messages: string[];
  events: SystemEvent[];
}

export interface MaestroContract {
  invoke(invocation: AgentInvocation): Promise<AgentResponse>;
}

export interface MasterAgentState {
  perfil: {
    nombre: string;
    email: string;
    whatsapp: string;
    nit: string;
    nit_pendiente: boolean;
  };
  marca: {
    logo: string | null;
    colores: string[];
    claim: string;
    score: number;
    updated_at: string | null;
  };
  tienda: {
    id: string | null;
    url: string | null;
    shop_name: string | null;
    theme: any;
    published: boolean;
    products_count: number;
    has_shop: boolean;
    social_links?: Record<string, string>;
    contact_info?: any;
    hero_config?: { slides?: any[] };
    story?: string;
    about_content?: { story?: string };
  };
  inventario: {
    productos: any[];
    variantes: any[];
    stock_total: number;
    low_stock: any[];
    sin_precio: any[];
  };
  pricing: {
    reglas: any[];
    hojas_costos: any[];
    last_update: string | null;
  };
  presence: {
    redes: any[];
    engagement: number;
    links_tienda: string[];
  };
  growth: {
    nivel_madurez: CategoryScore;
    plan: string;
    misiones: any[];
  };
  i18n: {
    idioma_actual: 'es' | 'en';
  };
}
