# Auditoría Técnica — artisans-web (Portal de Artesanos)

> Fecha: 2026-05-14  
> Rama auditada: `feat/generalFixes`

---

## Resumen Ejecutivo

`artisans-web` es el portal SPA de React que usan los artesanos para gestionar su tienda, productos, pedidos y crecimiento en la plataforma Telar. Con 1,132 archivos TypeScript y ~208,000 líneas de código, es la aplicación más grande del monorepo.

La aplicación está funcionalmente completa y tiene una arquitectura modular razonable, pero acumula deuda técnica significativa: credenciales expuestas en código, tres sistemas de estado paralelos que pueden desincronizarse, TypeScript sin modo estricto, y componentes de más de 1,400 líneas que son difíciles de mantener y depurar.

---

## 1. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React | 18.3.1 |
| Bundler | Vite + SWC | 5.4.1 |
| Lenguaje | TypeScript | 5.5.3 |
| UI | ShadCN UI + Tailwind CSS | 3.4.11 |
| Animaciones | Framer Motion | 12.12.1 |
| Estado global | Zustand | 5.0.10 |
| Estado servidor | TanStack React Query | 5.56.2 |
| Estado local | React Context API | 4 providers |
| Formularios | React Hook Form + Zod | 7.71.1 / 3.23.8 |
| HTTP | Axios | 1.13.2 |
| Auth legacy | Supabase JS | 2.49.5 |
| Routing | React Router | 6.26.2 |
| Gráficos | Recharts | 2.12.7 |
| Testing | Vitest + Testing Library | 4.0.4 / 16.3.0 |

---

## 2. Organización del Código

```
src/
├── agents/          # Definiciones de agentes IA
├── components/      # 43 directorios de componentes
├── context/         # 4 Context providers (Auth, DataCache, Language, MasterAgent)
├── contexts/        # 5 Context providers adicionales
├── hooks/           # 130+ custom hooks organizados por dominio
├── integrations/    # Clientes HTTP (telarApi, Supabase)
├── lib/             # Utilidades (brand, imageOptimizer, wizards)
├── pages/           # 27 páginas organizadas por feature/rol
├── services/        # 47 archivos de acciones de API (*.actions.ts)
├── stores/          # Zustand stores (authStore)
├── types/           # 30+ archivos de tipos TypeScript
└── utils/           # Funciones utilitarias
```

**Rutas definidas:** 100+ en `App.tsx` (26 KB). Incluye rutas protegidas por rol: `ProtectedRoute`, `AdminProtectedRoute`, `ModeratorProtectedRoute`.

---

## 3. Funcionalidades

### Autenticación y Onboarding
- Login / Registro con verificación de email
- Reset de contraseña
- Detección de subdominio para moderadores (`useSubdomain()`)
- Wizard de perfil de usuario
- Evaluación de madurez del negocio

### Gestión de Tienda
- Creación y configuración de tienda
- Wizard de identidad de marca (logo, colores, claim)
- Configuración de hero/slider
- Información de contacto
- Workflow de publicación de tienda
- Vista pública de la tienda con catálogo

### Gestión de Productos
- Carga individual y masiva (asistida por IA)
- Edición con detalles enriquecidos
- Sistema de variantes y precios
- Gestión de inventario y stock
- Moderación de productos
- Analytics y reseñas por producto

### Inteligencia de Negocio (IA)
- Master Coordinator: agente conversacional IA
- Generación y auto-completado de tareas
- Tracking de hitos de crecimiento
- Scoring de madurez en 4 dimensiones
- Framework de validación de crecimiento
- Sistema de gamificación / logros

### Operaciones de Tienda
- Gestión de pedidos y tracking
- Dashboard de envíos
- Integración de pagos (Cobre)
- Analytics de ventas
- Reseñas y calificaciones de clientes

### Admin / Moderación (integrado)
- Interfaz de moderación de productos
- Gestión de roles de usuarios
- CMS: blog posts, colecciones, secciones de contenido
- Editor del design system
- Dashboards de analytics
- Herramientas de debug de artesanos

---

## 4. Flujo de Datos y Autenticación

### Auth Flow
```
Login → POST /auth/login → NestJS
Response: { user, userMasterContext, artisanShop, access_token }
      ↓
AuthContext syncs from localStorage (fallback)
      ↓
Zustand authStore (persistido en localStorage)
Token refresh: cada 3.5 horas (AuthContext.tsx:215-221)
```

### API Client
- Archivo: `src/integrations/api/telarApi.ts`
- Axios con interceptor: adjunta `Authorization: Bearer <token>` automáticamente
- Base URL: `VITE_BACKEND_URL`
- Error handling: toast genérico en errores de respuesta

### Patrón de servicios
Cada dominio tiene un archivo `*.actions.ts` en `src/services/`:
- Importan `telarApi`
- Definen tipos request/response
- Exportan funciones async
- Usan Zod para validación donde aplica
- Lanzan errores (el caller maneja)

---

## 5. Problemas Encontrados

### 🔴 Crítico

**[C-1] Credenciales Supabase hardcodeadas en código fuente**
- Archivo: `src/integrations/supabase/client.ts` (líneas 8–12)
- URL y clave pública de Supabase están hardcodeadas como fallback
- Aunque la clave sea "pública", su exposición en el repositorio facilita ataques dirigidos
- **Acción requerida:** Mover a variables de entorno exclusivamente, verificar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén en `.env` y no en el código

---

### 🟠 Alto

**[A-1] TypeScript sin modo estricto**
- Archivo: `tsconfig.json` (líneas 14, 19)
- `noImplicitAny: false` y `strictNullChecks: false`
- Resultado: 1,346 usos del tipo `any` en toda la codebase
- Aumenta probabilidad de bugs de runtime difíciles de detectar

**[A-2] Triple sistema de estado — riesgo de desincronización**
- Zustand (`authStore`) + Context API (4 providers) + React Query operan en paralelo
- Auth se almacena simultáneamente en localStorage, Zustand y AuthContext
- Riesgo real: stale state entre sistemas, re-renders innecesarios
- Archivos: `src/stores/authStore.ts`, `src/context/AuthContext.tsx`

**[A-3] Componentes "dios" — mantenimiento imposible**
- `CommercialDashboard.tsx` — 1,451 LOC
- `DebugArtisanPage.tsx` — 1,429 LOC (expone operaciones sensibles)
- `NewMasterCoordinatorDashboard.tsx` — 1,533 LOC
- `useFusedMaturityAgent.ts` — 2,099 LOC (hook gigante)
- `App.tsx` — 26 KB con 100+ rutas inline

**[A-4] Sin code splitting ni lazy loading**
- Todas las páginas cargadas en el bundle principal
- Con 27 páginas y componentes pesados, el tiempo de carga inicial es innecesariamente alto
- No hay instancias de `React.lazy()` o `Suspense`

**[A-5] Sin error boundaries**
- Un error en un componente puede colapsar toda la aplicación
- No hay componentes `ErrorBoundary` visibles
- Los `try-catch` en servicios no tienen estrategias de recovery

**[A-6] Migraciones de API incompletas (37 TODOs)**
- `services/products.actions.ts`: comentarios "TODO: Migrate to /products-new"
- `services/moderation.actions.ts`: endpoints de variantes faltantes
- `hooks/useInventory.ts`: "TODO: pendiente de resource NestJS"
- `hooks/useAdminStats.ts`: "TODO: Crear endpoint para conteo"
- Product tags no implementados
- Campos featured/SEO sin implementar

---

### 🟡 Medio

**[M-1] 793 console.log en código de producción**
- Sin servicio de logging centralizado
- Sin distinción por nivel (debug, info, error)
- Overhead de I/O innecesario en producción

**[M-2] Imports legacy de Supabase en 20+ archivos**
- Auth migrado a NestJS pero código Supabase permanece
- Dead code que confunde y aumenta el bundle

**[M-3] API client sin resilencia**
- Sin retry con backoff exponencial
- Sin timeout configurable por request
- Sin cancelación de requests al desmontar componentes
- Sin deduplicación de requests paralelos idénticos

**[M-4] Estado de wizard no persistido**
- 20+ páginas de wizard sin persistencia de progreso
- El usuario pierde el progreso si recarga la página
- `AgentActionRouter` tiene 81 mapeos keyword→acción hardcodeados

**[M-5] Transformaciones de datos con pérdida de información**
- `ProductResponse` (arquitectura nueva) → `Product` (formato legacy) en `services/products.actions.ts`
- Conversión de precios: centavos ↔ decimal sin validación
- Campos de la nueva arquitectura pueden perderse silenciosamente

**[M-6] DataCacheContext sin documentación**
- No está claro qué cachea ni cuándo se invalida
- Sin estrategia explícita de stale-while-revalidate

---

### 🟢 Bajo

**[B-1] Sin service worker / PWA**
- No hay soporte offline
- Sin precaching de assets

**[B-2] Sin integración de error reporting**
- No hay Sentry, LogRocket ni similar
- Los errores de producción son invisibles

**[B-3] Sin analytics client-side**
- Las métricas se recopilan pero no se envían a ningún servicio

**[B-4] Sin documentación de contratos de API**
- No hay OpenAPI/Swagger para el contrato frontend↔backend

---

## 6. Recomendaciones Priorizadas

| # | Prioridad | Acción | Archivo(s) |
|---|---|---|---|
| 1 | 🔴 Crítico | Eliminar credenciales hardcodeadas, usar solo env vars | `src/integrations/supabase/client.ts` |
| 2 | 🟠 Alto | Activar `noImplicitAny: true` y `strictNullChecks: true` en tsconfig | `tsconfig.json` |
| 3 | 🟠 Alto | Unificar sistema de estado: elegir Zustand O Context, no ambos | `src/stores/`, `src/context/` |
| 4 | 🟠 Alto | Dividir componentes >500 LOC en partes más pequeñas | `CommercialDashboard.tsx`, `useFusedMaturityAgent.ts` |
| 5 | 🟠 Alto | Implementar lazy loading con `React.lazy()` para todas las rutas | `src/App.tsx` |
| 6 | 🟠 Alto | Agregar `ErrorBoundary` por sección de feature | Por definir |
| 7 | 🟠 Alto | Completar migraciones pendientes (37 TODOs) | `src/services/`, `src/hooks/` |
| 8 | 🟡 Medio | Agregar retry + timeout + cancelación al cliente Axios | `src/integrations/api/telarApi.ts` |
| 9 | 🟡 Medio | Eliminar imports muertos de Supabase | 20+ archivos |
| 10 | 🟡 Medio | Reemplazar `console.log` con servicio de logging estructurado | Global |

---

## 7. Archivos Clave

| Archivo | Por qué es importante |
|---|---|
| [`src/App.tsx`](../apps/artisans-web/src/App.tsx) | 100+ rutas, 26 KB — centro de routing |
| [`src/integrations/supabase/client.ts`](../apps/artisans-web/src/integrations/supabase/client.ts) | Credenciales expuestas |
| [`src/integrations/api/telarApi.ts`](../apps/artisans-web/src/integrations/api/telarApi.ts) | Cliente HTTP principal |
| [`src/context/AuthContext.tsx`](../apps/artisans-web/src/context/AuthContext.tsx) | Lógica de auth, estado dual |
| [`src/stores/authStore.ts`](../apps/artisans-web/src/stores/authStore.ts) | Zustand auth store |
| [`src/components/dashboard/CommercialDashboard.tsx`](../apps/artisans-web/src/components/dashboard/CommercialDashboard.tsx) | 1,451 LOC — candidato a refactor |
| [`src/services/products.actions.ts`](../apps/artisans-web/src/services/products.actions.ts) | Mapeo de datos con pérdidas |
| [`tsconfig.json`](../apps/artisans-web/tsconfig.json) | Config laxa de TypeScript |
