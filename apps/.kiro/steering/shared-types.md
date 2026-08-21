---
inclusion: fileMatch
fileMatchPattern: "shared-types/**"
---

# shared-types/ — Tipos TypeScript Compartidos

## Descripción

Paquete npm local (`@telar/shared-types`) con definiciones de tipos TypeScript compartidos entre `artisans-web/` y `marketplace-web/`. Garantiza consistencia de tipos entre ambos frontends.

## Package

- **Nombre:** `@telar/shared-types`
- **Versión:** 1.0.0
- **Enlace:** `"file:../shared-types"` en los package.json de los frontends

## Estructura

```
shared-types/
├── package.json
├── tsconfig.json
├── products/              # Tipos de productos
│   └── index.ts
├── stores/                # Tipos de tiendas/shops
│   └── index.ts
├── taxonomy/              # Categorías, técnicas, materiales
│   └── index.ts
└── common/                # Tipos comunes/utilitarios
    └── index.ts
```

## Exports (package.json)

```json
{
  "exports": {
    "./products": "./products/index.ts",
    "./stores": "./stores/index.ts",
    "./taxonomy": "./taxonomy/index.ts",
    "./common": "./common/index.ts"
  }
}
```

## Uso en Frontends

```typescript
import type { Product } from '@telar/shared-types/products';
import type { ArtisanShop } from '@telar/shared-types/stores';
import type { Category, Technique } from '@telar/shared-types/taxonomy';
```

## Convenciones

- Solo tipos e interfaces (no lógica, no valores runtime)
- Exportar con `export type` / `export interface`
- Cambios aquí afectan ambos frontends — verificar compatibilidad
- Nombres de tipos: PascalCase
- Archivos: kebab-case si se agregan más módulos
- Al agregar un tipo nuevo, verificar que ambos frontends compilen correctamente
