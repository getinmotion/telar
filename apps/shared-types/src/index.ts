/**
 * @telar/shared-types - Barrel Export
 * Punto de entrada principal para tipos compartidos del monorepo Telar
 *
 * Uso:
 * import { ProductResponse, StoreResponse } from '@telar/shared-types';
 * import { ProductCore } from '@telar/shared-types/products';
 * import { Store } from '@telar/shared-types/stores';
 * import { Category, Material } from '@telar/shared-types/taxonomy';
 * import { PaginatedResponse } from '@telar/shared-types/common';
 */

// Products
export * from './products';

// Stores
export * from './stores';

// Taxonomy
export * from './taxonomy';

// Common
export * from './common';
