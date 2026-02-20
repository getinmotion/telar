# Quick Reference Guide - Marketplace Telar

Guía de referencia rápida para consultas durante el desarrollo.

---

## 📁 Estructura de Archivos

```
src/
├── services/            → *.actions.ts     (API calls)
├── contexts/            → *Context.tsx     (Global state + UI feedback)
├── hooks/               → use*.ts          (Reusable logic)
├── components/          → *.tsx            (UI components)
├── types/               → *.types.ts       (TypeScript definitions)
└── integrations/api/    → telarApi.ts      (Axios config)
```

---

## 🔄 Flujo de Datos

```
Component → useContext() → Context → Service.actions → Backend
                             ↓
                        toast feedback
```

---

## 📝 Templates Rápidos

### Service (.actions.ts)

```typescript
import { telarApi } from '@/integrations/api/telarApi';
import type { ResponseType } from '@/types/domain.types';

/**
 * [Descripción]
 * @param {type} param - Descripción
 * @returns {Promise<ResponseType>} Descripción
 * @endpoint POST /api/endpoint
 */
export const functionName = async (param: Type): Promise<ResponseType> => {
  try {
    const response = await telarApi.post<ResponseType>('/endpoint', param);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
```

### Context

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import * as Actions from '@/services/domain.actions';

interface ContextType {
  data: Type | null;
  loading: boolean;
  method: () => Promise<void>;
}

const Context = createContext<ContextType | undefined>(undefined);

export const Provider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<Type | null>(null);
  const [loading, setLoading] = useState(false);

  const method = async () => {
    setLoading(true);
    try {
      const result = await Actions.action();
      setData(result);
      toast.success('Éxito');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return <Context.Provider value={{ data, loading, method }}>{children}</Context.Provider>;
};

export const useHook = () => {
  const context = useContext(Context);
  if (!context) throw new Error('useHook debe usarse dentro de Provider');
  return context;
};
```

### Custom Hook

```typescript
import { useState, useEffect } from 'react';

export const useHookName = () => {
  const [data, setData] = useState<Type | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // logic
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, refetch: fetchData };
};
```

### Component

```typescript
interface Props {
  required: string;
  optional?: string;
}

export const Component = ({ required, optional = 'default' }: Props) => {
  const [state, setState] = useState('');

  return <div className="p-4">{/* JSX */}</div>;
};
```

---

## 🎯 Convenciones de Nomenclatura

| Elemento | Formato | Ejemplo |
|----------|---------|---------|
| **Archivos** |
| Component | PascalCase.tsx | `ProductCard.tsx` |
| Service | camelCase.actions.ts | `products.actions.ts` |
| Context | PascalCaseContext.tsx | `AuthContext.tsx` |
| Hook | useCamelCase.ts | `useProducts.ts` |
| Types | camelCase.types.ts | `products.types.ts` |
| **Variables** |
| Variable | camelCase | `userName` |
| Constante global | UPPER_SNAKE_CASE | `API_URL` |
| Boolean | is/has/should prefix | `isLoading` |
| Array | plural | `products` |
| **Funciones** |
| Function | camelCase + verbo | `getUser()` |
| Handler | handle + Action | `handleClick()` |
| Async | verbo descriptivo | `fetchProducts()` |
| **Types** |
| Interface | PascalCase | `User` |
| Request/Response | ActionDomainRequest | `CreateUserRequest` |
| Type | PascalCase | `UserRole` |

---

## 🔌 Axios Usage

```typescript
// ✅ Endpoints públicos (sin auth)
import { telarApiPublic } from '@/integrations/api/telarApi';
telarApiPublic.post('/auth/login', credentials);

// ✅ Endpoints privados (con auth)
import { telarApi } from '@/integrations/api/telarApi';
telarApi.get('/users/me');
telarApi.post('/orders', orderData);

// ❌ NO agregar headers manualmente
// El interceptor agrega el token automáticamente
```

---

## 🚨 Error Handling

```typescript
// Service (.actions.ts) - Solo re-throw
try {
  const response = await telarApi.post('/endpoint', data);
  return response.data;
} catch (error: any) {
  throw error; // No logging aquí
}

// Context - Toast + re-throw
try {
  const result = await Actions.action();
  toast.success('Éxito');
} catch (error: any) {
  toast.error(error.response?.data?.message || 'Error');
  throw error;
} finally {
  setLoading(false); // Siempre en finally
}

// Component - Solo si hay lógica adicional
try {
  await method();
  navigate('/success');
} catch (error) {
  // Ya se mostró el toast en Context
}
```

---

## 📦 Imports Order

```typescript
// 1. React y librerías externas
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// 2. Componentes UI
import { Button } from '@/components/ui/button';

// 3. Componentes propios
import { ProductCard } from '@/components/ProductCard';

// 4. Hooks
import { useAuth } from '@/contexts/AuthContext';

// 5. Types
import type { Product } from '@/types/products.types';

// 6. Utilidades
import { formatPrice } from '@/lib/utils';
```

---

## ✅ Clean Code Checklist

- [ ] Nombres descriptivos (no `tmp`, `data`, `x`)
- [ ] Funciones pequeñas (< 20 líneas idealmente)
- [ ] Una responsabilidad por función
- [ ] No duplicar código (DRY)
- [ ] **NO dejar console.log**
- [ ] Comentarios solo cuando es necesario
- [ ] JSDoc en funciones exportadas de .actions.ts
- [ ] Error handling con try-catch-finally
- [ ] Loading states manejados
- [ ] Tipos TypeScript definidos
- [ ] Optional chaining: `user?.address?.city`
- [ ] Nullish coalescing: `value ?? 'default'`

---

## 🎨 Tailwind Common Classes

```typescript
// Layout
"flex items-center justify-between"
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Spacing
"p-4" "px-6 py-4" "space-y-4" "gap-4"

// Typography
"text-sm text-gray-600" "text-xl font-bold" "text-center"

// Interactive
"hover:shadow-lg transition-all" "cursor-pointer"

// Responsive
"hidden md:block" "w-full md:w-1/2"
```

---

## 🔑 Tokens & Auth

```typescript
// Guardar token (solo en auth.actions.ts)
localStorage.setItem('telar_token', token);

// Leer token (automático en interceptor)
// NO necesitas leer manualmente, telarApi lo hace

// Remover token
localStorage.removeItem('telar_token');
```

---

## 📋 JSDoc Template

```typescript
/**
 * [Descripción breve de qué hace la función]
 *
 * [Descripción más detallada si es necesario]
 *
 * @param {Type} paramName - Descripción del parámetro
 * @param {Type} [optionalParam] - Parámetro opcional
 * @returns {Promise<ReturnType>} Descripción de lo que retorna
 *
 * @endpoint POST /api/resource
 *
 * @example
 * const user = await createUser({ email: 'test@example.com' });
 */
```

---

## 🚫 Anti-Patterns a Evitar

```typescript
// ❌ Console.log sin prefijo o innecesario
console.log(data);

// ❌ Any sin necesidad
const data: any = response;

// ❌ Duplicación de código
const formatName1 = (user: User) => `${user.firstName} ${user.lastName}`;
const formatName2 = (author: Author) => `${author.firstName} ${author.lastName}`;

// ❌ Funciones muy largas
const processEverything = () => {
  // 100 líneas de código...
};

// ❌ Nombres crípticos
const d = new Date();
const tmp = user.name;

// ❌ Headers manuales (el interceptor los agrega)
telarApi.post('/endpoint', data, {
  headers: { Authorization: `Bearer ${token}` }
});

// ❌ No manejar loading states
const submit = async () => {
  await action(); // Sin setLoading
};
```

---

## 💡 Pro Tips

1. **telarApi vs telarApiPublic**: Si requiere auth → `telarApi`, si no → `telarApiPublic`
2. **Loading states**: Siempre usar `finally` para garantizar que se desactive
3. **Toast messages**: Preferir mensaje del backend: `error.response?.data?.message`
4. **Re-throw errors**: Permite que el caller maneje el error si es necesario
5. **Optional chaining**: Usar `?.` para evitar errores de null/undefined
6. **Destructuring**: Extraer props directamente en los parámetros
7. **Named exports**: Usar `export const` en lugar de `export default`
8. **Single file per domain**: Un archivo .actions.ts por dominio/entidad

---

## 🔍 Debugging Permitido (Temporalmente)

```typescript
// Si es ABSOLUTAMENTE necesario para debugging
// DEBUG: [Descripción de qué estás debuggeando]
console.log('[ComponentName] Variable:', variable);

// Eliminar antes de commit
```

---

## 📞 ¿Cuándo Preguntar?

Pregunta antes de implementar si:
- Hay múltiples formas válidas de hacerlo
- No estás seguro de qué patrón seguir
- La implementación afecta la arquitectura
- Ves una mejor forma pero cambiaría la estructura actual

---

**Mantén esta guía abierta mientras codificas** 🚀
