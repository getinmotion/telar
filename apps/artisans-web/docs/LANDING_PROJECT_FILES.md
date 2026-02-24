# Archivos para Copiar al Nuevo Proyecto Landing

## Estructura de Archivos a Copiar

### 1. Página Principal
```
src/pages/Index.tsx → src/pages/Home.tsx (renombrar)
```

### 2. Componentes del Landing (carpeta completa)
```
src/components/home/modern/
├── AnimatedGradientBackground.tsx
├── AnimatedStatsSection.tsx
├── AICapabilitiesSection.tsx
├── BentoFeaturesGrid.tsx
├── FinalCTASection.tsx
├── HowItWorksSection.tsx
├── ModernFooter.tsx
├── ModernHeroContent.tsx
├── ModernNavbar.tsx
├── ModernTestimonialsCarousel.tsx
└── ProductDemoSection.tsx
```

### 3. Configuración SEO
```
src/config/seo.ts
```

### 4. Assets (si tienes imágenes del landing)
```
src/assets/ (revisar y copiar solo las del landing)
```

---

## Cambios Necesarios en el Nuevo Proyecto

### En `src/pages/Home.tsx` (el antiguo Index.tsx):
1. No requiere cambios de estructura, solo asegúrate del nombre correcto

### En `src/components/home/modern/ModernNavbar.tsx`:
Actualizar los botones de CTA para apuntar a la app:

```typescript
import { useNavigate } from 'react-router-dom';

// Cambiar esto:
const navigate = useNavigate();
onClick={() => navigate('/login')}

// Por esto:
const APP_URL = 'https://app.telar.app'; // o tu dominio personalizado
onClick={() => window.location.href = `${APP_URL}/login`}
```

### En `src/components/home/modern/ModernHeroContent.tsx`:
Actualizar los botones principales:

```typescript
const APP_URL = 'https://app.telar.app';

// Botón "Comenzar Ahora"
onClick={() => window.location.href = `${APP_URL}/register`}

// Botón "Iniciar Sesión"
onClick={() => window.location.href = `${APP_URL}/login`}
```

### En `src/components/home/modern/FinalCTASection.tsx`:
Actualizar el botón de registro:

```typescript
const APP_URL = 'https://app.telar.app';
onClick={() => window.location.href = `${APP_URL}/register`}
```

### En `App.tsx` del nuevo proyecto:
```tsx
import Home from './pages/Home';

// ...

<Routes>
  <Route path="/" element={<Home />} />
  {/* Opcionalmente páginas adicionales */}
  <Route path="/precios" element={<PricingPage />} />
  <Route path="/contacto" element={<ContactPage />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

## Configuración de Dominios

### Proyecto Landing (nuevo):
- **Dominio principal**: `telar.app` o `www.telar.app`
- En Lovable: Settings → Domains → Add custom domain
- **DNS Records**:
  ```
  Type: A
  Name: @ (para root) o www
  Value: 76.76.21.21 (Lovable IP)
  ```

### Proyecto App (este proyecto actual):
- **Subdominio app**: `app.telar.app`
- En Lovable: Settings → Domains → Add custom domain
- **DNS Record**:
  ```
  Type: CNAME
  Name: app
  Value: [tu-proyecto-app].lovable.app
  ```

---

## Backend Compartido (Supabase)

Ambos proyectos pueden usar el mismo backend de Supabase:

### En el proyecto landing (si necesitas autenticación):
Copia el archivo `src/integrations/supabase/client.ts` del proyecto actual

O simplemente deja que todos los flujos de auth redirijan a la app.

---

## Checklist de Implementación

### Fase 1: Crear Proyecto Landing ✓
- [ ] Crear nuevo proyecto en Lovable llamado "Telar Landing"
- [ ] Copiar todos los archivos listados arriba
- [ ] Renombrar `Index.tsx` a `Home.tsx`
- [ ] Actualizar imports en `Home.tsx`
- [ ] Actualizar todos los CTAs para apuntar a `app.telar.app`
- [ ] Configurar routing con `Home` en la ruta `/`

### Fase 2: Limpiar Proyecto App Actual ✓
- [x] Eliminar `src/pages/Index.tsx`
- [x] Eliminar carpeta `src/components/home/modern/`
- [x] Actualizar App.tsx para redirigir `/` a `/login`
- [ ] Añadir link de regreso al landing en el header/navbar

### Fase 3: Configurar Dominios
- [ ] Landing: Conectar `telar.app` o `www.telar.app`
- [ ] App: Conectar `app.telar.app`
- [ ] Configurar DNS records
- [ ] Esperar propagación DNS (hasta 72 horas)
- [ ] Verificar SSL activo en ambos dominios

### Fase 4: Testing Final
- [ ] Probar navegación landing → app (botones CTA)
- [ ] Verificar registro funciona desde landing
- [ ] Verificar login funciona desde landing
- [ ] Verificar que después de login redirige al dashboard
- [ ] Probar que `/` en app redirige a `/login` correctamente
- [ ] Verificar meta tags SEO en landing
- [ ] Verificar ambos proyectos responsive

---

## Constante para URLs entre Proyectos

Crea un archivo de configuración en ambos proyectos:

### En proyecto landing: `src/config/urls.ts`
```typescript
export const APP_URL = import.meta.env.PROD 
  ? 'https://app.telar.app' 
  : 'http://localhost:8080';
```

### En proyecto app: `src/config/urls.ts`
```typescript
export const LANDING_URL = import.meta.env.PROD 
  ? 'https://telar.app' 
  : 'http://localhost:8081'; // puerto diferente para desarrollo
```

---

## Notas Importantes

1. **No necesitas duplicar el backend**: Ambos proyectos comparten la misma configuración de Supabase
2. **El landing puede ser más simple**: No necesitas toda la lógica de autenticación, solo los botones que redirijan a la app
3. **Publicación independiente**: Cada proyecto se publica por separado
4. **Desarrollo local**: Usa puertos diferentes si quieres correr ambos simultáneamente

---

## Siguiente Paso Inmediato

1. **Crear el nuevo proyecto "Telar Landing" en Lovable**
2. **Copiar los archivos listados arriba**
3. **Hacer las modificaciones de URLs en los CTAs**
4. **Configurar los dominios personalizados**
