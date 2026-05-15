# Auditoría Técnica — marketplace-web (Portal de Compradores)

> Fecha: 2026-05-14  
> Rama auditada: `feat/generalFixes`

---

## Resumen Ejecutivo

`marketplace-web` es la SPA de React que usan los compradores para descubrir y comprar productos de artesanos colombianos. Tiene 48 páginas, integración con CMS Storyblok, mapas interactivos (Deck.gl), búsqueda semántica y un flujo completo de checkout con múltiples pasarelas de pago.

La aplicación tiene una buena base de funcionalidades pero acumula problemas operacionales importantes: código de descuentos desactivado y comentado, archivos `.bak` en producción, una URL hardcodeada a un IP de staging, carrito y gift cards con lógica de sincronización frágil, y ausencia total de testing. El SEO está casi completamente sin implementar en páginas dinámicas.

---

## 1. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React | 18.3.1 |
| Bundler | Vite + SWC | 5.4.19 |
| Lenguaje | TypeScript | 5.8 |
| UI | ShadCN UI + Tailwind CSS | 3.4.17 |
| Estado global | React Context API | 6 providers |
| Estado servidor | TanStack React Query | 5.83.0 (subutilizado) |
| HTTP | Axios | 1.13.5 |
| Auth | Supabase JS + NestJS API | — |
| Routing | React Router DOM | 6.30.1 |
| CMS | Storyblok | — |
| Mapas | Maplibre GL + Deck.gl | — |
| Carrusel | Embla Carousel | — |
| SEO | React Helmet Async | — |
| Testing | — | No configurado |

---

## 2. Organización del Código

```
src/
├── components/      # 55+ componentes UI (ShadCN/Radix)
├── contexts/        # 6 Context providers
│   ├── AuthContext
│   ├── CartContext
│   ├── CheckoutContext
│   ├── ProductsContext
│   ├── ArtisanShopsContext
│   └── SearchContext
├── hooks/           # 28 custom hooks
├── integrations/    # Axios (telarApi, telarApiPublic), Supabase, Storyblok
├── lib/             # Utilidades (product mapping, search, analytics)
├── pages/           # 48 páginas
├── services/        # 18 archivos de servicios de API
└── types/           # Definiciones TypeScript
```

**Dos instancias de API:**
- `telarApi` — con token de autenticación
- `telarApiPublic` — sin autenticación (catálogo público)
- Base URL: `https://api.telar.store/telar/server`

---

## 3. Funcionalidades

### Descubrimiento y Catálogo
- Homepage con secciones desde CMS Storyblok
- Catálogo de productos (`/productos`, `/explorar`)
- Búsqueda semántica (servicio externo en `stage-agents.telar.co`)
- Filtros avanzados: precio, técnica, material, oficio, colecciones
- Páginas de categoría (`/categorias`, `/categoria/:slug`)
- Directorio de tiendas (`/tiendas`, `/tiendas-favoritas`)
- Perfiles de artesano con mapas y contenido de historia

### Contenido Editorial
- Blog (`/blog`, `/blog/:slug`)
- Historias (`/historias`)
- Técnicas (`/tecnicas`, `/tecnicas/:slug`)
- Territorios (`/territorios`, `/territorios/:slug`)
- Colecciones editoriales (`/colecciones`, `/colecciones/:slug`)

### Flujo de Compra
1. Agregar al carrito (guest o autenticado)
2. Vista del carrito (`/cart`)
3. Checkout (`/confirm-purchase`):
   - Datos personales
   - Selección/creación de dirección con lookup de municipios Colombia (DANE)
   - Cálculo de envío via Servientrega
   - Método de entrega: envío o retiro local
   - Selección de pasarela (Wompi / Cobre)
4. Procesamiento (`/payment-pending`)
5. Confirmación (`/order-confirmed/:orderId`)

### Cuenta de Usuario
- Registro / Login con email + OTP
- Google OAuth
- Gestión de perfil (`/profile`)
- Libreta de direcciones con dirección por defecto
- Historial y tracking de pedidos
- Seguimiento de saldo de gift cards
- Lista de deseos (`/wishlist`)
- Reset de contraseña

### Gift Cards
- Compra con montos personalizados
- Canje en checkout
- Seguimiento de saldo en perfil
- Email y mensaje para destinatario

### Centro de Ayuda
- Preguntas frecuentes, envíos, devoluciones, contacto

---

## 4. Flujo de Datos

### Auth Flow
```
Email/Password → POST /auth/login → localStorage.telar_token
Google OAuth → /auth/google → callback → token guardado
Interceptor Axios → agrega Authorization: Bearer en cada request
401 → limpia token (sin refresh silencioso)
```

### Cart Flow
```
Guest:
  Agregar → localStorage.telar_guest_cart

Autenticado:
  Agregar → POST /cart/sync-guest → crear/actualizar en BD
  Leer → GET /cart/buyer/{userId}/open → GET /cart-items/cart/{cartId}

Gift Cards (separadas):
  Agregar → state en memoria → sessionStorage.telar_gift_cards

Al login (Guest → Usuario):
  Sincronizar carrito local → POST /cart/sync-guest
  Limpiar localStorage, preservar activeCartId en state
```

### Checkout/Payment Flow
```
Formulario de envío → Servientrega API (por tienda)
Seleccionar método → Calcular total con descuentos de gift card
Crear checkout → POST /payment/checkouts → abrir ventana Wompi/Cobre
Esperar pago → /payment-pending (polling)
Éxito → crear orden → /order-confirmed/{orderId}
```

---

## 5. Problemas Encontrados

### 🔴 Crítico

**[C-1] Código de promociones completamente desactivado**
- Archivos: `src/contexts/CheckoutContext.tsx`, `src/pages/ConfirmPurchase.tsx` (líneas 10–13, 37–89)
- `validatePromoCode()` retorna `false` con `console.warn`
- `applyPromoToOrder()` retorna `true` (bypass silencioso)
- Hay bloques enteros comentados con TODOs: "migrar a nuevo endpoint"
- **Impacto:** Los descuentos por código no funcionan pero la UI puede sugerir lo contrario

**[C-2] URL hardcodeada a IP de staging**
- Archivo: `src/integrations/api/telarApi.ts`
- `http://52.7.98.126:8090` está hardcodeado como fallback o en algún servicio
- Si esa IP es de staging, podría usarse en producción sin querer

**[C-3] Archivos `.bak` en el repositorio**
- `src/pages/TecnicaDetail.tsx.bak`
- `src/pages/Tecnicas.tsx.bak`
- Archivos de backup que no deben existir en un repositorio de producción

---

### 🟠 Alto

**[A-1] Token de autenticación en localStorage (vulnerable a XSS)**
- Archivo: `src/integrations/api/telarApi.ts` (líneas 13–22)
- Sin mecanismo de refresh silencioso (401 solo limpia el token)
- Sin rotación de tokens
- La sesión no persiste correctamente entre recargas si el token expira

**[A-2] Race condition en sincronización de carrito guest→usuario**
- Archivo: `src/contexts/CartContext.tsx` (líneas 143–244)
- `syncGuestCartToUser()` es async pero se llama en navegación sin await
- Riesgo: gift cards huérfanas, ítems duplicados

**[A-3] Gift cards en sessionStorage (datos efímeros)**
- Las gift cards se guardan en `sessionStorage.telar_gift_cards`
- Se pierden al recargar la página antes de completar el checkout
- Triple almacenamiento: localStorage + sessionStorage + state React

**[A-4] Sin code splitting**
- 40+ páginas cargadas en un único bundle
- No hay `React.lazy()` ni `Suspense` en todo el código
- El tiempo de carga inicial escala con cada nueva página

**[A-5] Sin SEO en páginas dinámicas**
- Solo 3 componentes con `<Helmet>` meta tags visibles
- Páginas de producto (`/product/:id`) sin Open Graph, ni structured data (JSON-LD)
- Sin sitemap ni robots.txt
- Sin pre-rendering para buscadores
- **Impacto:** El catálogo de productos y artesanos es prácticamente invisible para Google

**[A-6] Sin testing configurado**
- Sin Jest, Vitest ni ningún framework de tests
- Sin tests unitarios, de integración ni end-to-end
- El flujo de checkout crítico no tiene cobertura

---

### 🟡 Medio

**[M-1] Componentes de gran tamaño**
- `ConfirmPurchase.tsx` — 1,180 LOC (formulario, envío, pago todo inline)
- `Profile.tsx` — 874 LOC (tabs, formularios, pedidos, direcciones)
- `ExploreProducts.tsx` — 1,000+ LOC (filtros, ordenamiento, búsqueda semántica)
- `Tecnicas.tsx` — 1,014 LOC

**[M-2] React Query instalado pero casi sin usar**
- 36 instancias de `useQuery` vs. 6 Context providers con fetch propio
- El patrón Context hace refetch en cada navegación sin cache
- Existe la infraestructura para caching pero no se usa

**[M-3] Inconsistencia en naming de ítems de carrito**
- En algunos lugares se usa `product_id`, en otros `productId`
- `CartItem` vs. `LocalCartItem` — definiciones duplicadas

**[M-4] Sin imágenes optimizadas**
- Todos los `<img>` usan URLs sin `srcset`, sin `loading="lazy"`, sin WebP
- `ProductImageGallery` precarga todas las variantes de imagen en state
- Fallback hardcodeado a `/placeholder.svg`

**[M-5] 140+ console.log/error/warn**
- Presente en `ExploreProducts.tsx`, `ProductDetail.tsx`, `Profile.tsx`, `ConfirmPurchase.tsx`
- Sin servicio de logging ni niveles de log

**[M-6] Integración Storyblok sin fallback**
- La homepage depende completamente de que existan páginas en el CMS
- Si el CMS no responde, la homepage queda en blanco sin error manejado
- `StoryblokBridgeListener.tsx` activa live editing sin guardia de entorno

**[M-7] Validación de stock no implementada**
- El stock se muestra en los productos pero no se valida antes de completar la compra
- Un usuario puede comprar un producto fuera de stock si la BD no está actualizada

---

### 🟢 Bajo

**[B-1] Sin accesibilidad básica**
- Sin etiquetas ARIA en elementos interactivos
- Alt text genérico o ausente en imágenes
- `GuestAuthModal` sin navegación por teclado

**[B-2] Sin Core Web Vitals ni monitoreo de performance**
- Sin Google Analytics ni equivalente
- Sin presupuesto de bundle
- Sin tracking de LCP, FID, CLS

**[B-3] Features "coming soon" sin comunicación clara**
- Certificado de autenticidad: botón activo que abre modal "Próximamente"
- Huella digital: ídem
- Genera expectativas falsas en el usuario

**[B-4] Sin paginación real en listados**
- `ExploreProducts` carga 24 ítems pero los renderiza todos sin virtualización
- Mapas en Técnicas/Territorios renderizan 100+ marcadores sin clustering

---

## 6. Recomendaciones Priorizadas

| # | Prioridad | Acción | Archivo(s) |
|---|---|---|---|
| 1 | 🔴 Crítico | Eliminar o implementar correctamente el código de promociones | `CheckoutContext.tsx`, `ConfirmPurchase.tsx` |
| 2 | 🔴 Crítico | Eliminar archivos `.bak` y URL de IP hardcodeada | `pages/*.bak`, `telarApi.ts` |
| 3 | 🟠 Alto | Migrar token a httpOnly cookie + implementar refresh silencioso | `telarApi.ts`, auth flow |
| 4 | 🟠 Alto | Persistir gift cards en BD, no en sessionStorage | `CartContext.tsx` |
| 5 | 🟠 Alto | Implementar code splitting con `React.lazy()` | `src/App.tsx` |
| 6 | 🟠 Alto | Agregar SEO completo: Helmet, Open Graph, JSON-LD en páginas clave | Todas las páginas de producto/artesano |
| 7 | 🟠 Alto | Configurar Vitest + testing mínimo para flujo de checkout | Nuevo |
| 8 | 🟡 Medio | Dividir `ConfirmPurchase.tsx` en componentes de máx. 200 LOC | `pages/ConfirmPurchase.tsx` |
| 9 | 🟡 Medio | Migrar fetching de Context a React Query con caching | `contexts/` |
| 10 | 🟡 Medio | Agregar `loading="lazy"` y srcset a todas las imágenes | Global |

---

## 7. Archivos Clave

| Archivo | Por qué es importante |
|---|---|
| [`src/contexts/CheckoutContext.tsx`](../apps/marketplace-web/src/contexts/CheckoutContext.tsx) | Promo codes desactivados |
| [`src/pages/ConfirmPurchase.tsx`](../apps/marketplace-web/src/pages/ConfirmPurchase.tsx) | 1,180 LOC — checkout completo |
| [`src/contexts/CartContext.tsx`](../apps/marketplace-web/src/contexts/CartContext.tsx) | Lógica de carrito y gift cards |
| [`src/integrations/api/telarApi.ts`](../apps/marketplace-web/src/integrations/api/telarApi.ts) | Cliente HTTP, token management |
| [`src/pages/Profile.tsx`](../apps/marketplace-web/src/pages/Profile.tsx) | 874 LOC — candidato a split |
| [`src/pages/ExploreProducts.tsx`](../apps/marketplace-web/src/pages/ExploreProducts.tsx) | 1,000+ LOC, sin virtualización |
| [`src/pages/TecnicaDetail.tsx.bak`](../apps/marketplace-web/src/pages/TecnicaDetail.tsx.bak) | Archivo bak — eliminar |
