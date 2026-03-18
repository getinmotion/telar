# TODO: Navbar Refactoring - Centralización de Lógica de Búsqueda

## Estado Actual

El componente `Navbar` está siendo importado individualmente en **20 páginas diferentes** con **32 instancias totales**, con patrones de uso inconsistentes:

### Páginas con búsqueda semántica completa (2):
- `src/pages/Index.tsx` - Búsqueda semántica con todos los props
- `src/pages/Products.tsx` - Búsqueda semántica con todos los props

### Páginas con búsqueda básica (5):
- `src/pages/Shops.tsx` - Solo searchQuery y onSearchChange
- `src/pages/FavoriteShops.tsx` - Solo searchQuery y onSearchChange
- `src/pages/Wishlist.tsx` - Solo searchQuery y onSearchChange
- `src/pages/ShopDetail.tsx` - Solo searchQuery y onSearchChange
- `src/pages/Categories.tsx` - Solo searchQuery y onSearchChange

### Páginas sin props de búsqueda (13):
- `src/pages/ProductDetail.tsx` - `<Navbar />`
- `src/pages/Cart.tsx` - `<Navbar />`
- `src/pages/Profile.tsx` - `<Navbar />`
- `src/pages/GiftCards.tsx` - `<Navbar />`
- `src/pages/ConfirmPurchase.tsx` - `<Navbar />`
- `src/pages/PaymentPending.tsx` - `<Navbar />`
- `src/pages/Privacy.tsx` - `<Navbar />`
- `src/pages/Terms.tsx` - `<Navbar />`
- `src/pages/DataTreatment.tsx` - `<Navbar />`
- `src/pages/ResetPassword.tsx` - `<Navbar />`
- `src/pages/Blog.tsx` - `<Navbar />`
- `src/pages/BlogArticle.tsx` - `<Navbar />`
- `src/pages/OrderConfirmed.tsx` - `<Navbar />`

---

## Problema

1. **Duplicación de lógica**: Cada página que necesita búsqueda duplica el mismo estado y handlers
2. **Inconsistencia**: Diferentes páginas implementan la búsqueda de formas diferentes
3. **Mantenibilidad**: Cambios en la lógica de búsqueda requieren actualizar múltiples archivos
4. **Complejidad innecesaria**: Navbar recibe props cuando podría manejar su propia lógica
5. **Acoplamiento**: Las páginas están acopladas a la implementación de búsqueda del Navbar

**Insight clave del usuario:**
> "Independientemente de qué componente estás, realiza la misma búsqueda, entonces pensaría que los props lo tenga el componente principal"

---

## Objetivo

**Centralizar toda la lógica de búsqueda en App.tsx e importar Navbar una sola vez.**

### Beneficios esperados:
- ✅ Navbar se importa una sola vez en App.tsx
- ✅ Toda la lógica de búsqueda vive en un solo lugar
- ✅ Las páginas individuales no necesitan manejar estado de búsqueda
- ✅ Consistencia en toda la aplicación
- ✅ Más fácil de mantener y actualizar
- ✅ Reducción de código duplicado

---

## Plan de Implementación

### Fase 1: Crear SearchContext (NUEVO)

**Archivo:** `src/contexts/SearchContext.tsx`

Este contexto manejará todo el estado global de búsqueda:

```typescript
interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  semanticSearchEnabled: boolean;
  setSemanticSearchEnabled: (enabled: boolean) => void;
  clearSearch: () => void;
}

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [semanticSearchEnabled, setSemanticSearchEnabled] = useState(true);

  const clearSearch = () => {
    setSearchQuery("");
    setSemanticSearchEnabled(true);
  };

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      semanticSearchEnabled,
      setSemanticSearchEnabled,
      clearSearch,
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};
```

**Características:**
- Estado global de searchQuery
- Estado global de semanticSearchEnabled
- Función clearSearch para resetear todo
- Hook useSearch para consumir el contexto

---

### Fase 2: Crear Layout con Navbar (NUEVO)

**Archivo:** `src/components/Layout.tsx`

Este componente será el wrapper que incluye el Navbar:

```typescript
import { Navbar } from "@/components/Navbar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery, semanticSearchEnabled, setSemanticSearchEnabled, clearSearch } = useSearch();

  const handleHomeClick = () => {
    clearSearch();
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSemanticToggle = (enabled: boolean) => {
    setSemanticSearchEnabled(enabled);
  };

  return (
    <>
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        semanticSearchEnabled={semanticSearchEnabled}
        onSemanticSearchToggle={handleSemanticToggle}
        onHomeClick={handleHomeClick}
      />
      <Outlet />
    </>
  );
};
```

**Características:**
- Importa Navbar una sola vez
- Maneja todos los handlers de búsqueda centralizados
- Usa `<Outlet />` de react-router-dom para renderizar las páginas hijas
- Integra useSearch para conectar con el contexto global

---

### Fase 3: Refactorizar Navbar (MODIFICAR)

**Archivo:** `src/components/Navbar.tsx`

**Cambios mínimos** - El Navbar sigue recibiendo props pero ahora desde Layout:

```typescript
// MANTENER la interfaz actual
interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCategorySearch?: (category: string) => void;
  semanticSearchEnabled?: boolean;
  onSemanticSearchToggle?: (enabled: boolean) => void;
  onHomeClick?: () => void;
}

// El componente se mantiene igual
// Solo se asegura de que los defaults sigan funcionando
export const Navbar = ({
  searchQuery = "",
  onSearchChange = () => {},
  onCategorySearch,
  semanticSearchEnabled = true,
  onSemanticSearchToggle = () => {},
  onHomeClick,
}: NavbarProps) => {
  // Implementación actual se mantiene
  // ...
};
```

**Nota:** El Navbar NO necesita cambios significativos. Sigue siendo un componente controlado que recibe props, pero ahora esas props vienen del Layout centralizado.

---

### Fase 4: Actualizar App.tsx (MODIFICAR)

**Archivo:** `src/App.tsx`

**Cambios:**

1. Importar SearchProvider
2. Importar Layout
3. Envolver rutas en Layout

```typescript
import { SearchProvider } from "@/contexts/SearchContext";
import { Layout } from "@/components/Layout";

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ProductsProvider>
            <ArtisanShopsProvider>
              <CartProvider>
                <CheckoutProvider>
                  <SearchProvider>  {/* NUEVO */}
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        {/* Rutas con Layout (con Navbar) */}
                        <Route element={<Layout />}>  {/* NUEVO */}
                          <Route path="/" element={<Index />} />
                          <Route path="/productos" element={<Products />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/tienda/:shopSlug" element={<ShopDetail />} />
                          <Route path="/tiendas" element={<Shops />} />
                          <Route path="/tiendas-favoritas" element={<FavoriteShops />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/categorias" element={<Categories />} />
                          <Route path="/giftcards" element={<GiftCards />} />
                          <Route path="/confirm-purchase" element={<ConfirmPurchase />} />
                          <Route path="/payment-pending" element={<PaymentPending />} />
                          <Route path="/privacidad" element={<Privacy />} />
                          <Route path="/terminos" element={<Terms />} />
                          <Route path="/datos-personales" element={<DataTreatment />} />
                          <Route path="/blog" element={<Blog />} />
                          <Route path="/blog/:slug" element={<BlogArticle />} />
                          <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
                        </Route>

                        {/* Rutas SIN Layout (sin Navbar) */}
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/recategorize" element={<RecategorizeProducts />} />
                        <Route path="/create-view" element={<CreateMarketplaceView />} />

                        {/* Catch-all */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </SearchProvider>
                </CheckoutProvider>
              </CartProvider>
            </ArtisanShopsProvider>
          </ProductsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);
```

**Lógica de decisión:**
- Rutas con Navbar → dentro de `<Route element={<Layout />}>`
- Rutas sin Navbar (Auth, etc.) → fuera del Layout

---

### Fase 5: Actualizar páginas para usar useSearch (MODIFICAR)

Las páginas que actualmente manejan búsqueda necesitan ser refactorizadas para usar el contexto.

#### 5.1. Index.tsx (búsqueda semántica)

**Antes:**
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [semanticEnabled, setSemanticEnabled] = useState(true);

<Navbar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  semanticSearchEnabled={semanticEnabled}
  onSemanticSearchToggle={setSemanticEnabled}
  onHomeClick={handleHomeClick}
/>
```

**Después:**
```typescript
import { useSearch } from "@/contexts/SearchContext";

const { searchQuery, semanticSearchEnabled } = useSearch();

// ELIMINAR: <Navbar /> ya no se importa aquí
// El Navbar ya está en Layout
// Solo consumir searchQuery y semanticSearchEnabled del contexto
```

#### 5.2. Products.tsx (búsqueda semántica)

**Antes:**
```typescript
const [searchQuery, setSearchQuery] = useState("");
const [semanticEnabled, setSemanticEnabled] = useState(true);

<Navbar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  semanticSearchEnabled={semanticEnabled}
  onSemanticSearchToggle={setSemanticEnabled}
/>
```

**Después:**
```typescript
import { useSearch } from "@/contexts/SearchContext";

const { searchQuery, semanticSearchEnabled } = useSearch();

// ELIMINAR: <Navbar />
// Solo consumir del contexto
```

#### 5.3. Shops.tsx, Wishlist.tsx, etc. (búsqueda básica)

**Antes:**
```typescript
const [searchQuery, setSearchQuery] = useState("");

<Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
```

**Después:**
```typescript
import { useSearch } from "@/contexts/SearchContext";

const { searchQuery } = useSearch();

// ELIMINAR: <Navbar />
// Solo consumir searchQuery
```

#### 5.4. Todas las demás páginas (sin búsqueda)

**Antes:**
```typescript
<Navbar />
```

**Después:**
```typescript
// ELIMINAR completamente el import de Navbar
// ELIMINAR <Navbar />
// El Navbar ya está en Layout, no se necesita aquí
```

---

### Fase 6: Integración con useHybridSearch

**Archivo:** `src/hooks/useHybridSearch.ts`

Este hook ya existe y tiene debounce de 500ms. Debe actualizar para consumir del contexto:

**Antes:**
```typescript
const useHybridSearch = (
  products: Product[],
  searchQuery: string,  // Recibido como parámetro
  filters: ProductFilters,
  semanticEnabled: boolean  // Recibido como parámetro
) => {
  // ...
}
```

**Después:**
```typescript
import { useSearch } from "@/contexts/SearchContext";

const useHybridSearch = (
  products: Product[],
  filters: ProductFilters
) => {
  const { searchQuery, semanticSearchEnabled } = useSearch();  // NUEVO

  // El resto del hook se mantiene igual
  // Ya usa searchQuery y semanticSearchEnabled pero ahora del contexto
}
```

**Impacto:**
- Index.tsx y Products.tsx ya no necesitan pasar searchQuery y semanticEnabled al hook
- La búsqueda sigue funcionando igual pero con datos centralizados

---

## Archivos a Crear

### 1. src/contexts/SearchContext.tsx
- [ ] Crear SearchContext con estado de búsqueda
- [ ] Implementar SearchProvider
- [ ] Implementar useSearch hook
- [ ] Exportar tipos e interfaces

### 2. src/components/Layout.tsx
- [ ] Crear componente Layout
- [ ] Importar Navbar
- [ ] Integrar useSearch
- [ ] Implementar handlers de búsqueda
- [ ] Usar Outlet para renderizar páginas hijas

---

## Archivos a Modificar

### 3. src/App.tsx
- [ ] Importar SearchProvider
- [ ] Importar Layout
- [ ] Envolver rutas con SearchProvider
- [ ] Agrupar rutas dentro de Layout (con Navbar)
- [ ] Mantener rutas de Auth fuera del Layout (sin Navbar)

### 4. src/components/Navbar.tsx
- [ ] Verificar que defaults de props sigan funcionando
- [ ] NO requiere cambios significativos
- [ ] Mantener interfaz NavbarProps actual

### 5. src/hooks/useHybridSearch.ts
- [ ] Importar useSearch
- [ ] Eliminar parámetros searchQuery y semanticEnabled
- [ ] Consumir directamente del contexto
- [ ] Mantener lógica de debounce (500ms)

### 6. Páginas con búsqueda semántica (2 archivos)
- [ ] **src/pages/Index.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX
  - Importar useSearch
  - Eliminar useState de searchQuery y semanticEnabled
  - Consumir del contexto
  - Actualizar useHybridSearch (no pasar parámetros de búsqueda)

- [ ] **src/pages/Products.tsx**
  - Mismos cambios que Index.tsx

### 7. Páginas con búsqueda básica (5 archivos)
- [ ] **src/pages/Shops.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX
  - Importar useSearch
  - Eliminar useState de searchQuery
  - Consumir searchQuery del contexto
  - Usar searchQuery para filtrar tiendas

- [ ] **src/pages/FavoriteShops.tsx**
  - Mismos cambios que Shops.tsx

- [ ] **src/pages/Wishlist.tsx**
  - Mismos cambios que Shops.tsx

- [ ] **src/pages/ShopDetail.tsx**
  - Mismos cambios que Shops.tsx

- [ ] **src/pages/Categories.tsx**
  - Mismos cambios que Shops.tsx

### 8. Páginas sin búsqueda (13 archivos)
- [ ] **src/pages/ProductDetail.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/Cart.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/Profile.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/GiftCards.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/ConfirmPurchase.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/PaymentPending.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/Privacy.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/Terms.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/DataTreatment.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/ResetPassword.tsx**
  - Verificar si debe tener Navbar o no
  - Actualmente tiene `<Navbar />`
  - Decisión: mantener sin Navbar (similar a Auth)

- [ ] **src/pages/Blog.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/BlogArticle.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

- [ ] **src/pages/OrderConfirmed.tsx**
  - Eliminar import de Navbar
  - Eliminar `<Navbar />` del JSX

---

## Orden de Implementación Recomendado

### Paso 1: Crear infraestructura base
1. Crear SearchContext.tsx ✅
2. Crear Layout.tsx ✅
3. Actualizar App.tsx para usar SearchProvider y Layout ✅

### Paso 2: Probar con una página de prueba
4. Actualizar Index.tsx como prueba piloto ✅
5. Verificar que búsqueda semántica funciona ✅
6. Verificar que clearSearch funciona al hacer clic en logo ✅

### Paso 3: Actualizar hook de búsqueda
7. Actualizar useHybridSearch.ts ✅
8. Verificar que búsqueda sigue funcionando en Index.tsx ✅

### Paso 4: Actualizar páginas con búsqueda semántica
9. Actualizar Products.tsx ✅
10. Verificar que búsqueda funciona correctamente ✅

### Paso 5: Actualizar páginas con búsqueda básica
11. Actualizar Shops.tsx ✅
12. Actualizar FavoriteShops.tsx ✅
13. Actualizar Wishlist.tsx ✅
14. Actualizar ShopDetail.tsx ✅
15. Actualizar Categories.tsx ✅

### Paso 6: Actualizar páginas sin búsqueda
16. Actualizar todas las 13 páginas restantes ✅
17. Eliminar imports y `<Navbar />` de cada una ✅

### Paso 7: Testing completo
18. Ejecutar test suite completo ✅
19. Verificar build production ✅

---

## Testing Checklist

### Búsqueda Semántica
- [ ] **Index.tsx**: Búsqueda funciona correctamente
- [ ] **Index.tsx**: Toggle semántico funciona
- [ ] **Index.tsx**: Resultados se filtran según searchQuery
- [ ] **Index.tsx**: Debounce de 500ms funciona (no busca en cada tecla)
- [ ] **Products.tsx**: Mismas verificaciones que Index.tsx

### Búsqueda Básica
- [ ] **Shops.tsx**: Búsqueda filtra tiendas por nombre
- [ ] **FavoriteShops.tsx**: Búsqueda filtra tiendas favoritas
- [ ] **Wishlist.tsx**: Búsqueda filtra productos en wishlist
- [ ] **ShopDetail.tsx**: Búsqueda funciona en detalle de tienda
- [ ] **Categories.tsx**: Búsqueda funciona en categorías

### Navegación y Estado Global
- [ ] Clic en logo limpia búsqueda (clearSearch)
- [ ] Clic en logo navega a home (/)
- [ ] searchQuery se mantiene al navegar entre páginas
- [ ] semanticSearchEnabled se mantiene al navegar
- [ ] Cambiar de página a página mantiene estado de búsqueda

### UI/UX
- [ ] Navbar aparece en todas las páginas apropiadas
- [ ] Navbar NO aparece en /auth, /auth/google/callback
- [ ] Campo de búsqueda mantiene valor al navegar
- [ ] Toggle semántico mantiene estado al navegar
- [ ] Mobile search funciona correctamente

### Performance
- [ ] No hay renders innecesarios del Navbar
- [ ] Debounce funciona correctamente (500ms)
- [ ] No hay memory leaks en SearchContext
- [ ] Build production no tiene warnings

### Edge Cases
- [ ] Búsqueda vacía muestra todos los productos
- [ ] Caracteres especiales en búsqueda no rompen la app
- [ ] Búsqueda con espacios funciona correctamente
- [ ] Búsqueda case-insensitive funciona

---

## Consideraciones Especiales

### 1. Rutas sin Navbar
Las siguientes rutas NO deben tener Navbar (fuera del Layout):
- `/auth` - Página de login/registro
- `/auth/google/callback` - Callback de Google OAuth
- `/reset-password` - Reset de contraseña (similar a auth)
- `/recategorize` - Herramienta admin
- `/create-view` - Herramienta admin

### 2. Persistencia del Estado de Búsqueda
El estado de búsqueda se mantiene al navegar entre páginas porque vive en SearchContext (nivel de App.tsx).

**Comportamiento esperado:**
- Usuario escribe "artesanía" en Index.tsx
- Usuario navega a Products.tsx
- El input sigue mostrando "artesanía"
- Los productos se filtran según "artesanía"

**Para limpiar búsqueda:**
- Clic en logo → ejecuta clearSearch()
- URL con `?reset=true` → puede ejecutar clearSearch()

### 3. Integración con URL Query Params (Opcional - Futuro)
Actualmente la búsqueda NO persiste en URL. En el futuro se podría:
- Sincronizar searchQuery con URL: `?q=artesania`
- Sincronizar semanticEnabled con URL: `?semantic=true`
- Usar useSearchParams de react-router-dom

**Ejemplo futuro:**
```typescript
const [searchParams, setSearchParams] = useSearchParams();

useEffect(() => {
  const query = searchParams.get('q');
  if (query) {
    setSearchQuery(query);
  }
}, [searchParams]);
```

### 4. Compatibilidad con useHybridSearch
El hook useHybridSearch ya tiene debounce de 500ms y debe seguir funcionando igual.

**Cambio clave:**
- Antes: recibía searchQuery y semanticEnabled como parámetros
- Después: los consume directamente del contexto

**Ventaja:**
- Cualquier componente que use useHybridSearch automáticamente usa la búsqueda global
- No hay riesgo de desincronización

### 5. Mobile Search
El Navbar tiene un toggle para mobile search. Esta funcionalidad debe seguir funcionando igual:
- Clic en ícono de búsqueda (mobile) → abre input expandido
- Input expandido usa el mismo searchQuery del contexto
- Cambios en mobile search actualizan el contexto global

---

## Beneficios Post-Refactorización

### 1. Código más Limpio
**Antes:**
```typescript
// En cada página (repetido 20 veces)
import { Navbar } from "@/components/Navbar";
const [searchQuery, setSearchQuery] = useState("");
<Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
```

**Después:**
```typescript
// En la página (solo si necesita usar el valor)
import { useSearch } from "@/contexts/SearchContext";
const { searchQuery } = useSearch();
// Navbar ya está en Layout, no se importa aquí
```

### 2. Single Source of Truth
- Todo el estado de búsqueda vive en SearchContext
- No hay riesgo de desincronización entre páginas
- Más fácil de debuggear

### 3. Mantenibilidad
- Cambios en lógica de búsqueda → solo actualizar SearchContext y Layout
- Nuevas páginas → solo consumen useSearch si necesitan
- No hay que recordar pasar props en cada página

### 4. Escalabilidad
Fácil agregar nuevas features de búsqueda:
- Historial de búsquedas → agregar al contexto
- Sugerencias de búsqueda → agregar al contexto
- Filtros avanzados → agregar al contexto
- Todo disponible globalmente sin pasar props

### 5. Performance
- Menos re-renders innecesarios
- Estado centralizado con context API optimizado
- Debounce centralizado en useHybridSearch

---

## Rollback Plan (Si algo sale mal)

1. **Revertir commit**: `git revert <commit-hash>`
2. **Eliminar archivos nuevos**:
   - Eliminar SearchContext.tsx
   - Eliminar Layout.tsx
3. **Restaurar App.tsx** a versión anterior
4. **Restaurar páginas** a versión con `<Navbar />` individual

**Puntos de verificación antes de merge:**
- [ ] Todas las páginas renderizan correctamente
- [ ] Búsqueda funciona en Index.tsx y Products.tsx
- [ ] Build production exitoso
- [ ] No hay warnings en consola
- [ ] Tests pasan (si existen)

---

## Notas Finales

- Esta refactorización es **NO-BREAKING** si se hace correctamente
- El Navbar sigue siendo el mismo componente, solo cambia de dónde vienen sus props
- Las páginas que no usan búsqueda simplemente eliminan el import de Navbar
- Las páginas que usan búsqueda cambian de estado local a contexto global
- La UX para el usuario final **no cambia**, solo la arquitectura interna

**Tiempo estimado:** 2-3 horas para implementación completa + testing

---

**Fecha de creación:** 2026-03-15
**Estado:** PENDIENTE
**Prioridad:** MEDIA-ALTA
**Responsable:** TBD
