# 🚀 Guía de Integración con Cursor

Esta guía te ayudará a configurar y optimizar tu proyecto GetInMotion para trabajar eficientemente con Cursor.

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Archivos de Configuración](#archivos-de-configuración)
3. [Prompts Recomendados](#prompts-recomendados)
4. [Estructura de Prompts](#estructura-de-prompts)
5. [Mejores Prácticas](#mejores-prácticas)
6. [Workflows Recomendados](#workflows-recomendados)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto (no lo commitees):

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publica

# OpenAI (si usas Edge Functions)
OPENAI_API_KEY=tu-clave-openai

# Backend Python (si usas)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
API_SECRET_KEY=tu-secret-key
```

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Configuración de TypeScript

El proyecto ya tiene `tsconfig.json` configurado. Asegúrate de que:
- El alias `@/` apunta a `./src/*`
- `strictNullChecks` está configurado según tus preferencias
- Los paths están correctamente configurados

---

## 📁 Archivos de Configuración

### `.cursorrules`

Ya está creado en la raíz del proyecto. Este archivo contiene:
- Convenciones de código
- Estructura del proyecto
- Mejores prácticas específicas
- Reglas de seguridad

**Cursor lee este archivo automáticamente** para entender el contexto de tu proyecto.

### `.cursorignore` (Opcional)

Crea este archivo si quieres excluir ciertos directorios de las búsquedas de Cursor:

```
node_modules/
dist/
build/
.vite/
*.log
.env.local
.env.*.local
```

### `tsconfig.json`

Ya configurado con:
- Path aliases (`@/` → `./src/*`)
- Configuración de TypeScript para React
- Opciones de compilación optimizadas

---

## 💬 Prompts Recomendados

### Prompts para Desarrollo

#### 1. Crear un Nuevo Componente

```
Crea un componente [NombreComponente] en [ruta] que:
- Use TypeScript con props tipadas
- Siga la estructura de componentes del proyecto
- Use shadcn/ui cuando sea apropiado
- Sea responsive y accesible
- Use los colores del tema (navy, golden, coral, cream)
```

#### 2. Integrar con Supabase

```
Crea una función que:
- Use el cliente de Supabase desde @/integrations/supabase/client
- Implemente [operación CRUD específica]
- Maneje errores apropiadamente
- Use tipos generados de Supabase
- Respete las políticas RLS
```

#### 3. Crear un Agente

```
Crea un nuevo agente [NombreAgente] que:
- Extienda la interfaz Agent de @/types/agentTypes
- Siga el patrón de los agentes existentes
- Valide que esté en ALLOWED_AGENTS
- Maneje errores y casos edge
- Use el contexto de MasterAgent cuando sea necesario
```

#### 4. Refactorizar Código

```
Refactoriza [archivo/función] para:
- Mejorar legibilidad
- Reducir complejidad
- Aplicar principios SOLID
- Mantener la funcionalidad existente
- Agregar tipos TypeScript donde falten
```

#### 5. Optimizar Performance

```
Optimiza [componente/función] para:
- Reducir re-renders innecesarios
- Implementar lazy loading si es apropiado
- Memoizar cálculos costosos
- Optimizar queries de Supabase
```

### Prompts para Debugging

```
Debug [problema específico]:
- Revisa los logs de consola
- Verifica las queries de Supabase
- Revisa la configuración de variables de entorno
- Verifica tipos TypeScript
```

### Prompts para Testing

```
Crea tests para [componente/función] que:
- Cubran casos felices y edge cases
- Usen React Testing Library
- Verifiquen accesibilidad con jest-axe
- Tengan al menos 80% de cobertura
```

---

## 📐 Estructura de Prompts

### Formato Recomendado

```
[Contexto] - Proporciona contexto sobre qué estás haciendo
[Objetivo] - Qué quieres lograr
[Requisitos] - Requisitos específicos
[Restricciones] - Limitaciones o consideraciones
[Ejemplos] - Ejemplos si es relevante
```

### Ejemplo Completo

```
Contexto: Estoy trabajando en el módulo de inventario para artesanos.

Objetivo: Crear un componente que permita a los artesanos agregar productos a su tienda.

Requisitos:
- Formulario con validación usando react-hook-form y Zod
- Campos: nombre, descripción, precio, categoría, imágenes
- Integración con Supabase para guardar productos
- Usar componentes shadcn/ui (Form, Input, Button, etc.)
- Manejar subida de imágenes a Supabase Storage
- Mostrar preview de imágenes antes de subir
- Validar que el usuario esté autenticado

Restricciones:
- Solo agentes con rol 'artisan' pueden crear productos
- Precio debe ser mayor a 0
- Máximo 5 imágenes por producto
- Usar el agente 'inventory' para tracking

Ejemplos:
- Ver ProductForm.tsx para referencia de estructura
- Ver cómo se manejan imágenes en ImageManager.tsx
```

---

## ✨ Mejores Prácticas

### 1. Usar Code References

Cuando Cursor muestre código existente, usa el formato de referencias:

```12:14:src/components/ProductForm.tsx
// código existente
```

### 2. Búsquedas Semánticas

Usa búsquedas semánticas en lugar de grep cuando busques:
- Funcionalidad específica
- Patrones de código
- Implementaciones similares

Ejemplo: "¿Cómo se maneja la autenticación de usuarios?"

### 3. Contexto Completo

Proporciona contexto completo en tus prompts:
- Archivos relevantes
- Funcionalidad relacionada
- Restricciones del sistema
- Estado actual del código

### 4. Iteración Incremental

- Empieza con funcionalidad básica
- Agrega features incrementales
- Refactoriza cuando sea necesario
- No intentes hacer todo en un solo prompt

### 5. Validación de Código

Después de que Cursor genere código:
- Revisa tipos TypeScript
- Verifica imports
- Prueba la funcionalidad
- Revisa errores de linting

---

## 🔄 Workflows Recomendados

### Workflow 1: Agregar Nueva Feature

1. **Planificación**
   ```
   "Necesito agregar [feature]. ¿Qué componentes/servicios necesito crear o modificar?"
   ```

2. **Crear Estructura**
   ```
   "Crea la estructura base para [feature] siguiendo la arquitectura del proyecto"
   ```

3. **Implementar Lógica**
   ```
   "Implementa la lógica de [feature] en [archivo]"
   ```

4. **Integrar con Supabase**
   ```
   "Integra [feature] con Supabase para persistir datos"
   ```

5. **UI/UX**
   ```
   "Crea la interfaz de usuario para [feature] usando shadcn/ui"
   ```

6. **Testing**
   ```
   "Crea tests para [feature]"
   ```

### Workflow 2: Debugging

1. **Identificar Problema**
   ```
   "Analiza [error/comportamiento] y explica qué está pasando"
   ```

2. **Buscar Causa**
   ```
   "Busca en el codebase dónde se maneja [funcionalidad relacionada]"
   ```

3. **Proponer Solución**
   ```
   "Propón una solución para [problema] que sea compatible con el código existente"
   ```

4. **Implementar Fix**
   ```
   "Implementa la solución propuesta"
   ```

5. **Verificar**
   ```
   "Verifica que la solución no rompa otras funcionalidades"
   ```

### Workflow 3: Refactoring

1. **Identificar Código a Refactorizar**
   ```
   "Identifica código duplicado o que necesite refactoring en [área]"
   ```

2. **Analizar Dependencias**
   ```
   "Analiza las dependencias de [código] antes de refactorizar"
   ```

3. **Refactorizar**
   ```
   "Refactoriza [código] mejorando [aspecto específico]"
   ```

4. **Actualizar Referencias**
   ```
   "Actualiza todas las referencias a [código refactorizado]"
   ```

---

## 🐛 Troubleshooting

### Problema: Cursor no entiende el contexto

**Solución:**
- Asegúrate de que `.cursorrules` está en la raíz
- Proporciona más contexto en tus prompts
- Usa referencias a archivos específicos

### Problema: Cursor sugiere código incompatible

**Solución:**
- Especifica restricciones claramente
- Menciona librerías/patrones específicos del proyecto
- Usa "siguiendo el patrón de [archivo existente]"

### Problema: Imports incorrectos

**Solución:**
- Verifica que los path aliases están configurados
- Usa `@/` para imports desde `src/`
- Revisa `tsconfig.json` y `vite.config.ts`

### Problema: Tipos TypeScript incorrectos

**Solución:**
- Especifica tipos explícitos en prompts
- Menciona interfaces/types existentes
- Pide que use tipos de `@/types/`

### Problema: Cursor no encuentra código relacionado

**Solución:**
- Usa búsquedas semánticas en lugar de grep
- Proporciona rutas de archivos relevantes
- Menciona nombres de funciones/componentes específicos

---

## 📚 Recursos Adicionales

### Documentación del Proyecto

- `MISSION_SYSTEM_REORGANIZATION.md` - Sistema de misiones
- `DEPLOYMENT_CHECKLIST.md` - Checklist de deployment
- `docs/WCAG_IMPLEMENTATION_STATUS.md` - Estado de accesibilidad
- `README.md` - Configuración de Supabase

### Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Linting
npm run lint

# Testing
npm test

# Type checking
npx tsc --noEmit
```

### Atajos de Cursor

- `Cmd/Ctrl + K` - Abrir comandos de Cursor
- `Cmd/Ctrl + L` - Chat con Cursor
- `Cmd/Ctrl + Shift + L` - Composer (multi-archivo)
- `Cmd/Ctrl + I` - Inline edit

---

## 🎯 Tips Finales

1. **Sé Específico**: Prompts específicos generan mejor código
2. **Proporciona Contexto**: Menciona archivos, funciones, o patrones relevantes
3. **Itera**: No intentes hacer todo en un solo prompt
4. **Valida**: Siempre revisa y prueba el código generado
5. **Aprende**: Observa cómo Cursor estructura el código para mejorar tus prompts

---

## 📝 Checklist de Integración

- [ ] Archivo `.cursorrules` creado y configurado
- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Dependencias instaladas (`npm install`)
- [ ] TypeScript configurado correctamente
- [ ] Supabase cliente configurado
- [ ] Estructura del proyecto entendida
- [ ] Prompts de ejemplo probados
- [ ] Workflows documentados

---

**Última actualización**: 2025-01-19  
**Versión**: 1.0.0

