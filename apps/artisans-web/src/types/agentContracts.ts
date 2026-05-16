import { SystemEvent } from '@/utils/eventBus';
import { CategoryScore } from './dashboard';
import { Deliverable } from './invisibleAgent';
import { ContactInfo, HeroConfig, HeroSlide, Product } from './artisan';

export type { HeroSlide };

export interface ProductVariant {
  id: string;
  product_id?: string;
  sku?: string;
  price?: number;
  stock?: number;
  attributes?: Record<string, string>;
}

export interface LowStockAlert {
  productId: string;
  productName?: string;
  currentStock: number;
  threshold: number;
}

export interface AgentInvocation {
  agent: string;
  action: string;
  payload?: Record<string, unknown>;
}

export interface AgentResponse {
  status: 'success' | 'error' | 'requires_input';
  data?: Record<string, unknown>;
  deliverables?: Deliverable[];
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
    theme?: Record<string, unknown>;
    published: boolean;
    products_count: number;
    has_shop: boolean;
    social_links?: Record<string, string>;
    contact_info?: ContactInfo;
    hero_config?: HeroConfig;
    story?: string;
    about_content?: { story?: string };
  };
  inventario: {
    productos: Product[];
    variantes: ProductVariant[];
    stock_total: number;
    low_stock: LowStockAlert[];
    sin_precio: Product[];
  };
  pricing: {
    reglas: Record<string, unknown>[];
    hojas_costos: Record<string, unknown>[];
    last_update: string | null;
  };
  presence: {
    redes: Record<string, unknown>[];
    engagement: number;
    links_tienda: string[];
  };
  growth: {
    nivel_madurez: CategoryScore;
    plan: string;
    misiones: Record<string, unknown>[];
  };
  i18n: {
    idioma_actual: 'es' | 'en';
  };
}
