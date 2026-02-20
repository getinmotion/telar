# Marketplace Telar - Development Rules & Best Practices

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Patrón de Services (.actions.ts)](#patrón-de-services-actionsts)
4. [Contexts y State Management](#contexts-y-state-management)
5. [Custom Hooks](#custom-hooks)
6. [Componentes](#componentes)
7. [TypeScript & Tipos](#typescript--tipos)
8. [Axios y Configuración HTTP](#axios-y-configuración-http)
9. [Manejo de Errores](#manejo-de-errores)
10. [Estilo de Código](#estilo-de-código)
11. [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
12. [Clean Code Principles](#clean-code-principles)
13. [Testing & Debugging](#testing--debugging)

---

## Introducción

Este documento establece las reglas y mejores prácticas para el desarrollo del proyecto **Marketplace Telar**. El proyecto está en proceso de migración de Supabase a un backend en NestJS, manteniendo una arquitectura clara y escalable.

**Principios fundamentales:**
- **Clean Code**: Código legible, mantenible y autodocumentado
- **Separación de responsabilidades**: Services, Contexts, Hooks y Components con roles claros
- **Consistencia**: Seguir patrones establecidos en el código existente
- **DRY (Don't Repeat Yourself)**: Evitar duplicación de lógica
- **KISS (Keep It Simple, Stupid)**: Soluciones simples sobre soluciones complejas

---

## Arquitectura del Proyecto

### Estructura de Carpetas

```
src/
├── services/           # Lógica de negocio y llamadas a API
│   └── *.actions.ts    # Servicios por dominio (auth, products, orders, etc.)
├── contexts/           # Context API de React para estado global
│   └── *Context.tsx    # Providers que envuelven services con UI feedback
├── hooks/              # Custom React hooks
│   └── use*.ts(x)      # Hooks reutilizables
├── components/         # Componentes React
│   ├── ui/             # Componentes base de shadcn/ui
│   └── *.tsx           # Componentes de features
├── pages/              # Componentes de páginas (routes)
├── integrations/       # Integraciones externas
│   ├── api/            # Configuración de clientes HTTP
│   └── supabase/       # Cliente y tipos de Supabase
├── types/              # Definiciones de tipos TypeScript
├── lib/                # Utilidades y helpers
└── assets/             # Recursos estáticos
```

### Flujo de Datos

```
Component → Hook → Context → Service (.actions.ts) → Backend API
                                ↓
                          Toast Feedback
```

---

## Patrón de Services (.actions.ts)

Los archivos `.actions.ts` son la **capa de servicios** que encapsula todas las llamadas a la API del backend.

### Estructura Base

```typescript
/**
 * [Dominio] Service Actions
 *
 * Este archivo contiene todas las operaciones relacionadas con [dominio]
 * que se comunican con el backend NestJS.
 */

import { telarApi, telarApiPublic } from '@/integrations/api/telarApi';
import type { ResponseType, RequestType } from '@/types/domain.types';

/**
 * [Descripción de la función]
 *
 * @param {type} paramName - Descripción del parámetro
 * @returns {Promise<ResponseType>} Descripción del retorno
 *
 * @endpoint POST /api/endpoint
 */
export const functionName = async (
  paramName: RequestType
): Promise<ResponseType> => {
  try {
    const response = await telarApi.post<ResponseType>(
      '/endpoint',
      paramName
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
```

### Reglas para .actions.ts

1. **Naming**: Archivo nombrado como `[dominio].actions.ts` (ej: `auth.actions.ts`, `products.actions.ts`)

2. **Exports**: Solo exportar funciones async individuales (no clases ni objetos)

3. **JSDoc obligatorio**: Cada función debe tener:
   - Descripción de la función
   - `@param` para cada parámetro
   - `@returns` con descripción del tipo de retorno
   - `@endpoint` indicando el método HTTP y ruta

4. **Generic Typing**: Usar tipos genéricos en axios
   ```typescript
   telarApi.post<AuthResponse>('/auth/login', credentials)
   ```

5. **Error Handling**:
   - Solo re-throw del error (no logging en .actions.ts)
   - El logging se hace en el Context que consume el service

6. **No Side Effects**:
   - No modificar localStorage directamente (excepto tokens de auth)
   - No mostrar toasts
   - No modificar el DOM

7. **Use telarApiPublic** para endpoints públicos (sin auth)

8. **Use telarApi** para endpoints que requieren autenticación

---

## Contexts y State Management

Los Contexts envuelven los services para agregar:
- Manejo de estado React
- Feedback visual (toasts)
- Loading states
- Gestión de errores con mensajes al usuario

### Estructura de un Context

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import * as DomainActions from '@/services/domain.actions';
import type { DomainType } from '@/types/domain.types';

interface DomainContextType {
  data: DomainType | null;
  loading: boolean;
  methodName: (params: any) => Promise<void>;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export const DomainProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<DomainType | null>(null);
  const [loading, setLoading] = useState(false);

  const methodName = async (params: any) => {
    setLoading(true);
    try {
      const result = await DomainActions.actionName(params);
      setData(result);
      toast.success('Operación exitosa');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error en la operación';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DomainContext.Provider value={{ data, loading, methodName }}>
      {children}
    </DomainContext.Provider>
  );
};

export const useDomain = () => {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomain debe usarse dentro de DomainProvider');
  }
  return context;
};
```

### Reglas para Contexts

1. **Responsabilidades**:
   - Envolver services (.actions.ts)
   - Manejar estado relacionado
   - Mostrar feedback con toasts
   - Proveer loading states

2. **Naming**:
   - Archivo: `[Dominio]Context.tsx`
   - Provider: `[Dominio]Provider`
   - Hook: `use[Dominio]`

3. **Error Handling**:
   - Try-catch en cada método
   - Toast.error con mensaje del backend o fallback
   - Re-throw del error para que el componente pueda manejarlo si es necesario

4. **Loading States**: Usar `finally` para garantizar que loading se desactive

5. **Export**: Exportar tanto el Provider como el hook custom

---

## Custom Hooks

Los hooks encapsulan lógica reutilizable y efectos secundarios.

### Estructura Base

```typescript
import { useState, useEffect } from 'react';

interface UseHookResult {
  data: any;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHookName = (): UseHookResult => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Lógica de fetching
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
```

### Reglas para Hooks

1. **Naming**: `use[Nombre]` en camelCase

2. **Return Type**: Siempre definir un tipo o interface para el retorno

3. **Error Handling**: Capturar errores y exponerlos como estado

4. **Dependencies**: Ser explícito con las dependencias en useEffect

5. **Cleanup**: Agregar cleanup en useEffect cuando sea necesario

6. **Single Responsibility**: Un hook debe hacer una sola cosa bien

---

## Componentes

### Estructura de un Componente

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ComponentProps {
  requiredProp: string;
  optionalProp?: string;
}

export const ComponentName = ({
  requiredProp,
  optionalProp = 'default value'
}: ComponentProps) => {
  const [localState, setLocalState] = useState<string>('');

  const handleAction = () => {
    // Handler logic
  };

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold">{requiredProp}</h2>
      <Button onClick={handleAction}>Acción</Button>
    </Card>
  );
};
```

### Reglas para Componentes

1. **Functional Components**: Siempre usar functional components con hooks

2. **Props Interface**: Definir interface para las props antes del componente

3. **Destructuring**: Destructurar props en los parámetros con valores por defecto

4. **Naming**:
   - PascalCase para componentes
   - camelCase para handlers (handleClick, handleSubmit)

5. **Export**: Usar named exports, no default exports

6. **UI Components**: Usar componentes de shadcn/ui cuando sea posible

7. **Styling**: Usar Tailwind CSS con utility classes

8. **No Business Logic**: La lógica de negocio va en hooks o contexts

---

## TypeScript & Tipos

### Organización de Tipos

```typescript
// src/types/domain.types.ts

/**
 * Response del endpoint GET /api/users/:id
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

/**
 * Request body para POST /api/users
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Response del endpoint POST /api/users
 */
export interface CreateUserResponse {
  user: User;
  token: string;
}

export type UserRole = 'admin' | 'artisan' | 'customer';
```

### Reglas para Tipos

1. **Archivos separados**: Tipos en `src/types/[dominio].types.ts`

2. **Naming**:
   - Interfaces: PascalCase (User, Product, Order)
   - Request/Response: `[Acción][Dominio]Request/Response`
   - Enums: PascalCase con valores en snake_case

3. **JSDoc**: Documentar interfaces complejas indicando su origen (endpoint)

4. **Type vs Interface**:
   - Usar `interface` para objetos y estructuras
   - Usar `type` para unions, literals y composiciones

5. **Avoid Any**: Evitar `any`, usar `unknown` si no se conoce el tipo

6. **Null handling**: Usar `Type | null` en lugar de undefined cuando sea apropiado

---

## Axios y Configuración HTTP

### Configuración de Cliente

El proyecto usa dos instancias de axios:

```typescript
// src/integrations/api/telarApi.ts

import axios from 'axios';

// Para endpoints públicos (sin autenticación)
export const telarApiPublic = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Para endpoints privados (requieren token)
export const telarApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

// Request interceptor: agrega token automáticamente
telarApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('telar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: maneja errores 401
telarApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('telar_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);
```

### Reglas para HTTP

1. **Use telarApiPublic** para:
   - Login
   - Registro
   - Password reset
   - Endpoints públicos sin autenticación

2. **Use telarApi** para:
   - Operaciones con autenticación requerida
   - CRUD de recursos del usuario
   - Llamadas que requieren token

3. **Token Storage**:
   - Guardar token en `localStorage.getItem('telar_token')`
   - Solo en auth.actions.ts

4. **Headers**: No agregar headers manualmente, el interceptor lo hace

5. **Base URL**: Siempre usar rutas relativas (el baseURL está configurado)

---

## Manejo de Errores

### En Services (.actions.ts)

```typescript
export const createProduct = async (data: CreateProductRequest) => {
  try {
    const response = await telarApi.post<Product>('/products', data);
    return response.data;
  } catch (error: any) {
    // Solo re-throw, no logging aquí
    throw error;
  }
};
```

### En Contexts

```typescript
const createProduct = async (data: CreateProductRequest) => {
  setLoading(true);
  try {
    const product = await ProductActions.createProduct(data);
    setProducts([...products, product]);
    toast.success('Producto creado exitosamente');
    return product;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message ||
                        'Error al crear el producto';
    toast.error(errorMessage);
    throw error; // Re-throw para que el componente pueda manejarlo
  } finally {
    setLoading(false);
  }
};
```

### En Componentes

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await createProduct(data);
    navigate('/products');
  } catch (error) {
    // El error ya fue mostrado en el Context con toast
    // Aquí solo manejar lógica adicional si es necesario
  }
};
```

### Reglas de Error Handling

1. **.actions.ts**: Solo re-throw, sin logging ni toasts

2. **Contexts**:
   - Try-catch-finally
   - Toast.error con mensaje del backend
   - Re-throw si el componente necesita manejar algo adicional

3. **Componentes**:
   - Try-catch solo si hay lógica adicional
   - No duplicar toasts (ya están en Context)

4. **Mensajes de Error**:
   - Preferir mensaje del backend: `error.response?.data?.message`
   - Fallback a mensaje genérico en español

5. **Finally**: Siempre usar `finally` para resetear loading states

---

## Estilo de Código

### Formato General

1. **Indentación**: 2 espacios

2. **Punto y coma**: Opcional (el proyecto no los usa consistentemente)

3. **Comillas**: Usar comillas simples `'` preferentemente

4. **Imports**: Ordenar por:
   - React y librerías externas
   - Componentes propios
   - Hooks personalizados
   - Tipos
   - Utilidades

```typescript
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types/auth.types';
import { formatDate } from '@/lib/utils';
```

5. **Líneas en blanco**: Separar bloques lógicos con una línea en blanco

### Comentarios

1. **JSDoc**: Obligatorio para funciones exportadas en .actions.ts

2. **Comentarios inline**: Solo cuando la lógica no es obvia

3. **TODO/FIXME**: Usar formato estándar
   ```typescript
   // TODO: Implementar paginación
   // FIXME: Bug con fechas en timezone diferente
   ```

4. **Evitar comentarios obvios**:
   ```typescript
   // ❌ Malo
   const user = data.user; // Asignar usuario

   // ✅ Bueno
   // Extraer usuario del response para validación
   const user = data.user;
   ```

---

## Convenciones de Nomenclatura

### Archivos

| Tipo | Formato | Ejemplo |
|------|---------|---------|
| Componentes | PascalCase.tsx | `ProductCard.tsx` |
| Services | camelCase.actions.ts | `auth.actions.ts` |
| Contexts | PascalCase + Context.tsx | `AuthContext.tsx` |
| Hooks | camelCase con 'use' prefix | `useAuth.ts` |
| Tipos | camelCase.types.ts | `auth.types.ts` |
| Utilidades | camelCase.ts | `formatters.ts` |
| Pages | PascalCase.tsx | `ProductDetail.tsx` |

### Variables y Funciones

```typescript
// Variables: camelCase
const userName = 'Juan';
const isLoading = false;
const hasPermission = true;

// Constantes globales: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// Funciones: camelCase con verbo
const getUserById = (id: string) => { };
const validateEmail = (email: string) => { };

// Event handlers: 'handle' prefix
const handleClick = () => { };
const handleSubmit = () => { };

// Async functions: verbo descriptivo
const fetchProducts = async () => { };
const createOrder = async () => { };

// Booleans: 'is', 'has', 'should' prefix
const isValid = true;
const hasAccess = false;
const shouldRender = true;

// Arrays: plural
const products = [];
const users = [];

// Interfaces: PascalCase con descriptivo
interface User { }
interface ProductCardProps { }
interface CreateOrderRequest { }
```

---

## Clean Code Principles

### 1. Nombres Significativos

```typescript
// ❌ Evitar
const d = new Date();
const tmp = user.name;

// ✅ Preferir
const currentDate = new Date();
const userName = user.name;
```

### 2. Funciones Pequeñas

```typescript
// ❌ Función muy grande
const processOrder = (order: Order) => {
  // Validar orden (10 líneas)
  // Calcular total (15 líneas)
  // Aplicar descuentos (20 líneas)
  // Crear factura (10 líneas)
  // Enviar email (5 líneas)
};

// ✅ Dividir en funciones pequeñas
const validateOrder = (order: Order) => { /* ... */ };
const calculateTotal = (items: Item[]) => { /* ... */ };
const applyDiscounts = (total: number, coupons: Coupon[]) => { /* ... */ };
const createInvoice = (order: Order) => { /* ... */ };
const sendOrderEmail = (order: Order) => { /* ... */ };

const processOrder = (order: Order) => {
  validateOrder(order);
  const subtotal = calculateTotal(order.items);
  const total = applyDiscounts(subtotal, order.coupons);
  const invoice = createInvoice({ ...order, total });
  sendOrderEmail(order);
};
```

### 3. DRY (Don't Repeat Yourself)

```typescript
// ❌ Duplicación
const formatUserName = (user: User) => `${user.firstName} ${user.lastName}`;
const formatAuthorName = (author: Author) => `${author.firstName} ${author.lastName}`;

// ✅ Reutilización
const formatFullName = (firstName: string, lastName: string) =>
  `${firstName} ${lastName}`;
```

### 4. Single Responsibility

```typescript
// ❌ Múltiples responsabilidades
const UserCard = ({ user }: { user: User }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch orders
    fetch(`/orders?userId=${user.id}`)
      .then(res => res.json())
      .then(setOrders);
  }, [user.id]);

  return (
    <Card>
      {/* Renderizar usuario y órdenes */}
    </Card>
  );
};

// ✅ Una sola responsabilidad
const useUserOrders = (userId: string) => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    fetchUserOrders(userId).then(setOrders);
  }, [userId]);
  return orders;
};

const UserCard = ({ user }: { user: User }) => {
  const orders = useUserOrders(user.id);
  return <Card>{/* Renderizar usuario */}</Card>;
};

const UserOrders = ({ userId }: { userId: string }) => {
  const orders = useUserOrders(userId);
  return <OrderList orders={orders} />;
};
```

### 5. Evitar Comentarios Innecesarios

```typescript
// ❌ Comentario obvio
// Función para obtener el usuario por ID
const getUserById = (id: string) => { };

// ✅ Código autodocumentado
const getUserById = (id: string) => { };
```

### 6. Manejo de Null/Undefined

```typescript
// ❌ Evitar múltiples checks
if (user && user.address && user.address.city) {
  console.log(user.address.city);
}

// ✅ Optional chaining
console.log(user?.address?.city);

// ✅ Nullish coalescing
const city = user?.address?.city ?? 'Ciudad no disponible';
```

---

## Testing & Debugging

### Logging en Desarrollo

**REGLA FUNDAMENTAL**: NO dejar `console.log` en el código de producción a menos que sea explícitamente solicitado.

```typescript
// ❌ Evitar en código final
console.log('user:', user);
console.log('response:', response);

// ✅ Solo si es necesario para debugging temporal (eliminar después)
// Si debugging es requerido, usar prefijos descriptivos:
console.log('[ProductCard] Rendering product:', product.id);
console.error('[auth.actions] Login failed:', error);
```

### Debugging Temporal

Si necesitas debugging:

1. Usar prefijos descriptivos con el nombre del componente/archivo
2. Agregar un comentario `// DEBUG:` para facilitar búsqueda y eliminación
3. Eliminar antes de commit final

```typescript
// DEBUG: Verificar estructura del response
console.log('[auth.actions] Response:', response);
```

### Testing

1. **Test unitarios**: (Cuando se implementen)
   - Un archivo de test por archivo de código
   - Naming: `[archivo].test.ts`

2. **Test de integración**: Probar flujos completos

3. **E2E Testing**: (Cuando se implemente) Para flujos críticos

---

## Checklist antes de Commit

Antes de hacer commit, verificar:

- [ ] No hay `console.log` innecesarios
- [ ] Código sigue las convenciones de nomenclatura
- [ ] Funciones tienen JSDoc donde corresponde
- [ ] No hay código comentado (eliminar, no comentar)
- [ ] Imports están organizados
- [ ] No hay código duplicado
- [ ] Error handling está implementado correctamente
- [ ] Loading states están manejados con `finally`
- [ ] Toasts tienen mensajes en español
- [ ] Tipos TypeScript están definidos
- [ ] Componentes siguen el patrón establecido

---

## Preguntas Frecuentes

### ¿Cuándo crear un nuevo .actions.ts?

Cuando hay un nuevo dominio o entidad en la aplicación (productos, órdenes, usuarios, etc.)

### ¿Context o Hook personalizado?

- **Context**: Para estado global que muchos componentes necesitan
- **Hook**: Para lógica reutilizable sin estado global

### ¿Dónde va la lógica de negocio?

1. Llamadas a API → `.actions.ts`
2. Estado global + UI feedback → `Context`
3. Lógica reutilizable → Custom hooks
4. Formateo y validación → `lib/utils.ts`

### ¿Cuándo usar telarApi vs telarApiPublic?

- **telarApiPublic**: Login, registro, endpoints públicos
- **telarApi**: Todo lo que requiere autenticación

### ¿Cómo manejar migraciones de Supabase?

1. Crear el endpoint equivalente en NestJS
2. Crear/actualizar el .actions.ts
3. Actualizar el Context que usa ese servicio
4. Probar que funciona correctamente
5. Eliminar código legacy de Supabase

---

## Recursos Adicionales

- [React Best Practices](https://react.dev/learn)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

**Última actualización**: 2026-02-14
**Versión**: 1.0.0
