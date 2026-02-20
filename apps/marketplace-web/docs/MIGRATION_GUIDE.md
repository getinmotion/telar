# Guía de Migración: Supabase → NestJS Backend

Esta guía documenta el proceso de migración del proyecto desde Supabase hacia el backend en NestJS.

---

## 📋 Tabla de Contenidos

1. [Estado Actual](#estado-actual)
2. [Proceso de Migración](#proceso-de-migración)
3. [Módulos a Migrar](#módulos-a-migrar)
4. [Checklist por Módulo](#checklist-por-módulo)
5. [Compatibilidad Durante la Migración](#compatibilidad-durante-la-migración)
6. [Testing](#testing)
7. [Rollback Strategy](#rollback-strategy)

---

## Estado Actual

### ✅ Migrado

- **Auth Module**
  - ✅ Email/Password authentication
  - ✅ Google OAuth
  - ✅ OTP verification
  - ✅ Password reset
  - ✅ Get current user
  - ✅ Logout
  - 📄 Archivo: `src/services/auth.actions.ts`
  - 📄 Context: `src/contexts/AuthContext.tsx`

### 🔄 En Progreso

- (Agregar módulos en progreso aquí)

### ⏳ Pendiente

- **Products Module**
  - Listado de productos
  - Detalle de producto
  - Búsqueda y filtros
  - Categorías

- **Orders Module**
  - Crear orden
  - Historial de órdenes
  - Estado de orden
  - Notificaciones

- **Cart Module**
  - Agregar al carrito
  - Actualizar cantidades
  - Remover items
  - Sincronización guest → user

- **Shops Module**
  - Listado de tiendas
  - Detalle de tienda
  - Productos por tienda

- **Wishlist Module**
  - Agregar a favoritos
  - Remover de favoritos
  - Listar favoritos

- **Checkout Module**
  - Proceso de checkout
  - Validación de promos
  - Cálculo de totales

- **Profile Module**
  - Información de usuario
  - Actualizar perfil
  - Direcciones de envío

---

## Proceso de Migración

### Paso 1: Preparación Backend (NestJS)

Antes de migrar en el frontend, asegurar que el backend tenga:

1. **Endpoints equivalentes implementados**
   ```typescript
   // Ejemplo para Products
   GET    /products              → Listar productos
   GET    /products/:id          → Detalle de producto
   POST   /products              → Crear producto (admin)
   PUT    /products/:id          → Actualizar producto (admin)
   DELETE /products/:id          → Eliminar producto (admin)
   GET    /products/search       → Búsqueda de productos
   ```

2. **DTOs definidos** (Data Transfer Objects)
   ```typescript
   // CreateProductDto, UpdateProductDto, ProductResponseDto
   ```

3. **Validación y error handling** implementados

4. **Documentación Swagger** actualizada

5. **Tests del backend** pasando

### Paso 2: Crear Types en Frontend

Crear archivo de tipos en `src/types/[dominio].types.ts`

```typescript
// src/types/products.types.ts

/**
 * Producto retornado por GET /products/:id
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request para POST /products
 */
export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  shopId: string;
}

/**
 * Response de POST /products
 */
export interface CreateProductResponse {
  product: Product;
  message: string;
}

/**
 * Filtros para GET /products
 */
export interface ProductFilters {
  categoryId?: string;
  shopId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Response paginado de productos
 */
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Paso 3: Crear Service (.actions.ts)

Crear archivo en `src/services/[dominio].actions.ts`

```typescript
// src/services/products.actions.ts

import { telarApi, telarApiPublic } from '@/integrations/api/telarApi';
import type {
  Product,
  ProductsResponse,
  ProductFilters,
  CreateProductRequest,
  CreateProductResponse,
} from '@/types/products.types';

/**
 * Obtiene el listado de productos con filtros opcionales
 *
 * @param {ProductFilters} filters - Filtros para la búsqueda
 * @returns {Promise<ProductsResponse>} Listado paginado de productos
 *
 * @endpoint GET /products
 */
export const getProducts = async (
  filters?: ProductFilters
): Promise<ProductsResponse> => {
  try {
    const response = await telarApiPublic.get<ProductsResponse>('/products', {
      params: filters,
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Obtiene el detalle de un producto por su ID
 *
 * @param {string} id - ID del producto
 * @returns {Promise<Product>} Detalle del producto
 *
 * @endpoint GET /products/:id
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await telarApiPublic.get<Product>(`/products/${id}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Crea un nuevo producto (requiere autenticación y rol admin)
 *
 * @param {CreateProductRequest} data - Datos del producto a crear
 * @returns {Promise<CreateProductResponse>} Producto creado
 *
 * @endpoint POST /products
 */
export const createProduct = async (
  data: CreateProductRequest
): Promise<CreateProductResponse> => {
  try {
    const response = await telarApi.post<CreateProductResponse>('/products', data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
```

### Paso 4: Actualizar o Crear Context

Actualizar el Context existente o crear uno nuevo si no existe.

```typescript
// src/contexts/ProductsContext.tsx

import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import * as ProductActions from '@/services/products.actions';
import type { Product, ProductsResponse, ProductFilters } from '@/types/products.types';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  totalPages: number;
  currentPage: number;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  getProduct: (id: string) => Promise<Product>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = async (filters?: ProductFilters) => {
    setLoading(true);
    try {
      const response = await ProductActions.getProducts(filters);
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar productos';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (id: string): Promise<Product> => {
    setLoading(true);
    try {
      const product = await ProductActions.getProductById(id);
      return product;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar el producto';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductsContext.Provider
      value={{ products, loading, totalPages, currentPage, fetchProducts, getProduct }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts debe usarse dentro de ProductsProvider');
  }
  return context;
};
```

### Paso 5: Actualizar Componentes

Actualizar componentes para usar el nuevo Context en lugar de Supabase.

```typescript
// Antes (con Supabase)
import { supabase } from '@/integrations/supabase/client';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      setProducts(data);
    };
    fetchProducts();
  }, []);

  // ...
};

// Después (con NestJS)
import { useProducts } from '@/contexts/ProductsContext';

const ProductList = () => {
  const { products, loading, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, []);

  // ...
};
```

### Paso 6: Testing

1. **Probar endpoints manualmente** con Postman/Insomnia
2. **Probar en la UI** todas las operaciones
3. **Verificar manejo de errores** (conexión fallida, 404, 401, etc.)
4. **Validar loading states** funcionan correctamente
5. **Comprobar toasts** se muestran adecuadamente

### Paso 7: Eliminar Código Legacy

Una vez confirmado que todo funciona:

1. **Remover imports de Supabase** en ese módulo
2. **Eliminar funciones legacy** (comentar primero, eliminar después)
3. **Limpiar código no utilizado**
4. **Actualizar tests** si existen

### Paso 8: Documentar

1. Actualizar esta guía marcando el módulo como ✅ Migrado
2. Documentar cualquier cambio significativo en el comportamiento
3. Actualizar README si es necesario

---

## Checklist por Módulo

Copiar esta checklist para cada módulo a migrar:

### [Nombre del Módulo]

**Backend (NestJS)**
- [ ] Endpoints implementados
- [ ] DTOs definidos
- [ ] Validación implementada
- [ ] Error handling implementado
- [ ] Documentación Swagger actualizada
- [ ] Tests del backend pasando

**Frontend (React)**
- [ ] Types creados en `src/types/[dominio].types.ts`
- [ ] Service creado en `src/services/[dominio].actions.ts`
- [ ] Context actualizado/creado en `src/contexts/[Dominio]Context.tsx`
- [ ] Componentes actualizados para usar Context
- [ ] Imports de Supabase removidos
- [ ] Testing manual completado
- [ ] Loading states verificados
- [ ] Error handling verificado
- [ ] Toasts funcionan correctamente
- [ ] Código legacy eliminado
- [ ] Documentación actualizada

---

## Compatibilidad Durante la Migración

Durante la migración, pueden coexistir llamadas a Supabase y al backend NestJS:

```typescript
// products.actions.ts (durante la migración)

// Endpoint ya migrado a NestJS
export const getProducts = async () => {
  const response = await telarApiPublic.get('/products');
  return response.data;
};

// Endpoint aún en Supabase (marcar con comentario)
// TODO: Migrar a NestJS cuando el endpoint /products/:id/reviews esté listo
export const getProductReviews = async (productId: string) => {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId);
  return data;
};
```

**Importante**: Usar comentarios `TODO:` para identificar código pendiente de migración.

---

## Testing

### Testing Manual

Para cada endpoint migrado, probar:

1. **Happy path**: Operación exitosa
2. **Validación**: Datos inválidos
3. **Autenticación**: Sin token / token inválido
4. **Autorización**: Usuario sin permisos
5. **Not found**: Recurso no existe
6. **Server error**: Simular error del servidor

### Testing Checklist

```typescript
// Ejemplo para Products Module

✅ GET /products
  ✅ Sin filtros → Retorna todos los productos
  ✅ Con filtros → Retorna productos filtrados
  ✅ Página inválida → Retorna error 400
  ✅ Sin productos → Retorna array vacío

✅ GET /products/:id
  ✅ ID válido → Retorna producto
  ✅ ID inválido → Retorna error 400
  ✅ ID no existe → Retorna error 404

✅ POST /products
  ✅ Sin token → Retorna error 401
  ✅ Con token usuario normal → Retorna error 403
  ✅ Con token admin + datos válidos → Crea producto
  ✅ Con token admin + datos inválidos → Retorna error 400
```

---

## Rollback Strategy

Si algo falla después de la migración:

### Opción 1: Rollback Inmediato

```typescript
// Revertir a Supabase temporalmente
// Comentar código NestJS
/*
export const getProducts = async () => {
  const response = await telarApiPublic.get('/products');
  return response.data;
};
*/

// Descomentar código Supabase
export const getProducts = async () => {
  const { data } = await supabase.from('products').select('*');
  return data;
};
```

### Opción 2: Feature Flag

```typescript
// lib/config.ts
export const USE_NESTJS_BACKEND = import.meta.env.VITE_USE_NESTJS_BACKEND === 'true';

// products.actions.ts
export const getProducts = async () => {
  if (USE_NESTJS_BACKEND) {
    const response = await telarApiPublic.get('/products');
    return response.data;
  } else {
    const { data } = await supabase.from('products').select('*');
    return data;
  }
};
```

### Opción 3: Git Revert

```bash
# Revertir último commit
git revert HEAD

# O revertir a commit específico
git revert <commit-hash>
```

---

## Mapeo Supabase → NestJS

### Queries Comunes

```typescript
// Supabase
const { data } = await supabase
  .from('products')
  .select('*, shops(*)')
  .eq('category_id', categoryId)
  .gte('price', minPrice)
  .lte('price', maxPrice)
  .order('created_at', { ascending: false })
  .range(0, 9);

// NestJS (usando query params)
const response = await telarApiPublic.get('/products', {
  params: {
    categoryId: categoryId,
    minPrice: minPrice,
    maxPrice: maxPrice,
    sortBy: 'createdAt',
    order: 'DESC',
    page: 1,
    limit: 10,
    include: 'shop', // Para relaciones
  }
});
```

### Auth Token

```typescript
// Supabase
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// NestJS
const token = localStorage.getItem('telar_token');
// El interceptor de axios lo agrega automáticamente
```

### Realtime Subscriptions

```typescript
// Supabase Realtime
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => {
      console.log('New order:', payload.new);
    }
  )
  .subscribe();

// NestJS (implementar con WebSockets o SSE)
// TODO: Definir estrategia para realtime (WebSockets, SSE, polling)
```

**Nota**: Las subscriptions en tiempo real requieren implementación específica en NestJS (WebSockets o Server-Sent Events).

---

## Mejores Prácticas Durante la Migración

1. **Migrar por módulos completos**, no funciones individuales
2. **Probar exhaustivamente** antes de eliminar código Supabase
3. **Mantener commits pequeños** y descriptivos
4. **Documentar cambios** en esta guía
5. **Comunicar con el equipo** sobre módulos en progreso
6. **No dejar código comentado** por más de 1 sprint
7. **Actualizar la sección "Estado Actual"** después de cada módulo

---

## Tabla de Prioridades

| Prioridad | Módulo | Complejidad | Dependencias | Status |
|-----------|--------|-------------|--------------|--------|
| 🔴 Alta | Auth | Media | Ninguna | ✅ Completado |
| 🔴 Alta | Products | Media | Auth | ⏳ Pendiente |
| 🔴 Alta | Cart | Media | Products, Auth | ⏳ Pendiente |
| 🟡 Media | Orders | Alta | Cart, Products, Auth | ⏳ Pendiente |
| 🟡 Media | Checkout | Alta | Cart, Orders | ⏳ Pendiente |
| 🟢 Baja | Wishlist | Baja | Products, Auth | ⏳ Pendiente |
| 🟢 Baja | Profile | Baja | Auth | ⏳ Pendiente |
| 🟢 Baja | Shops | Media | Products | ⏳ Pendiente |

---

## Contactos y Recursos

**Backend NestJS:**
- Repositorio: `[URL del repo]`
- URL Dev: `http://localhost:1010/telar/server`
- URL Staging: `[URL staging]`
- URL Production: `[URL production]`
- Swagger Docs: `http://localhost:1010/api/docs`

**Frontend React:**
- Repositorio: `[URL del repo]`
- Docs: `/docs/`

---

**Última actualización**: 2026-02-14
**Versión**: 1.0.0
