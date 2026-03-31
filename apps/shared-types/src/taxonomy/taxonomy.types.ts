/**
 * Taxonomy Types - Tipos para las tablas de taxonomía
 *
 * Incluye: Categories, Crafts, Techniques, Materials, Badges
 */

// ============= Category (taxonomy.categories) =============

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============= Craft (taxonomy.crafts) =============

export interface Craft {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============= Technique (taxonomy.techniques) =============

export interface Technique {
  id: string;
  craftId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============= Material (taxonomy.materials) =============

export interface Material {
  id: string;
  name: string;
  category?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============= Badge (taxonomy.badges) =============

export interface Badge {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
