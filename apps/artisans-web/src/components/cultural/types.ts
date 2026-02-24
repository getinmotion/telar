import { LucideIcon } from 'lucide-react';

// Tipos de artesanía disponibles en la plataforma
export type ArtisanCraftType = 
  | 'ceramic'       // Cerámica
  | 'textile'       // Textiles y Tejidos
  | 'woodwork'      // Trabajo en Madera
  | 'leather'       // Marroquinería y Cuero
  | 'jewelry'       // Joyería Artesanal
  | 'fiber'         // Fibras Naturales (cestería, etc.)
  | 'metal'         // Metalistería
  | 'stone'         // Piedra Tallada
  | 'mixed';        // Técnicas Mixtas

export interface CulturalAgent {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;  // Cambio a LucideIcon para componentes de Lucide
  color: string;
  craftTypes: ArtisanCraftType[];
  priority: number;
}

export interface CulturalAgentTranslations {
  title: string;
  description: string;
}

export interface ArtisanCraftTranslations {
  ceramic: string;
  textile: string;
  woodwork: string;
  leather: string;
  jewelry: string;
  fiber: string;
  metal: string;
  stone: string;
  mixed: string;
}

export interface CategoryTranslations {
  financial: string;
  legal: string;
  commercial: string;
  diagnosis: string;
  operational: string;
  community: string;
}

export interface ButtonTranslations {
  selectButton: string;
  comingSoon: string;
  viewShop: string;
  createShop: string;
}
