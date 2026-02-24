# 💡 Ejemplos de Prompts para Cursor

Esta colección de prompts está diseñada específicamente para el proyecto GetInMotion. Úsalos como referencia y adapta según tus necesidades.

---

## 🎨 UI Components

### Crear un Componente de Formulario

```
Crea un componente ProductForm en src/components/inventory/ que:
- Use react-hook-form con validación Zod
- Campos: nombre (requerido), descripción, precio (número > 0), categoría (select)
- Use componentes shadcn/ui: Form, FormField, Input, Button, Select
- Maneje submit y muestre errores de validación
- Use los colores del tema (bg-navy, text-golden)
- Sea responsive y accesible
- Siga el patrón de otros formularios del proyecto
```

### Crear un Modal/Dialog

```
Crea un componente ConfirmDialog usando shadcn/ui Dialog que:
- Reciba props: title, description, onConfirm, onCancel
- Muestre botones de confirmar y cancelar
- Use el estilo del tema (colores navy/golden)
- Sea accesible (ARIA labels, focus management)
- Siga el patrón de otros dialogs en src/components/modals/
```

### Crear un Card Component

```
Crea un componente ProductCard en src/components/products/ que:
- Muestre imagen, nombre, precio, descripción
- Use el componente Card de shadcn/ui como base
- Incluya hover effects con animaciones suaves
- Sea responsive (grid en desktop, stack en mobile)
- Use los colores del tema
- Incluya botón de acción (ej: "Ver detalles")
```

---

## 🔐 Autenticación y Supabase

### Crear Hook de Autenticación

```
Crea un custom hook useAuth en src/hooks/ que:
- Use el contexto AuthContext existente
- Proporcione funciones: login, logout, signup, resetPassword
- Maneje estados de loading y error
- Use el cliente de Supabase desde @/integrations/supabase/client
- Retorne { user, session, loading, error, login, logout, signup }
- Siga el patrón de otros hooks en src/hooks/
```

### Query de Supabase con React Query

```
Crea un hook useProducts en src/hooks/ que:
- Use @tanstack/react-query para cache y estado
- Consulte la tabla 'products' de Supabase
- Filtre por shop_id del usuario autenticado
- Maneje loading, error, y datos
- Incluya función de refetch
- Use tipos de @/integrations/supabase/types
```

### Mutación de Supabase

```
Crea una función createProduct en src/services/ que:
- Use el cliente de Supabase
- Inserte en la tabla 'products'
- Valide datos con Zod antes de insertar
- Maneje errores apropiadamente
- Retorne el producto creado
- Respete las políticas RLS
```

---

## 🤖 Sistema de Agentes

### Crear un Nuevo Agente

```
Crea un nuevo agente PricingAgent en src/agents/PricingAgent.ts que:
- Extienda la interfaz Agent de @/types/agentTypes
- Siga el patrón de GrowthAgent.ts
- Implemente métodos: analyze, generateTasks, executeTask
- Use el contexto MasterAgentContext cuando sea necesario
- Valide que esté en ALLOWED_AGENTS de @/config/allowedAgents
- Maneje errores y casos edge
- Exporte desde src/agents/index.ts
```

### Integrar Agente con UI

```
Crea un componente PricingAgentPanel en src/components/pricing/ que:
- Use el PricingAgent para análisis de precios
- Muestre resultados en formato visual (gráficos si es posible)
- Permita al usuario interactuar con recomendaciones
- Use el contexto MasterAgentContext
- Muestre estados de loading y error
- Sea responsive y accesible
```

---

## 📊 Dashboard y Analytics

### Crear Widget de Dashboard

```
Crea un componente SalesWidget en src/components/dashboard/ que:
- Muestre métricas de ventas (total, este mes, comparación)
- Use datos de Supabase (tabla 'orders')
- Incluya gráfico simple (puede ser con recharts)
- Sea responsive
- Use los colores del tema
- Muestre skeleton loading mientras carga
```

### Crear Tabla de Datos

```
Crea un componente DataTable en src/components/admin/ que:
- Use shadcn/ui Table como base
- Permita ordenamiento y filtrado
- Incluya paginación
- Sea genérico y reutilizable (usar generics de TypeScript)
- Muestre loading state
- Sea accesible (ARIA labels)
```

---

## 🌐 Internacionalización

### Agregar Traducciones

```
Agrega traducciones para [feature] en src/translations/:
- Español (es)
- Inglés (en)
- Usa el formato existente de otros archivos de traducción
- Incluye todas las strings del componente [ComponentName]
- Agrega keys descriptivas y organizadas
```

### Componente Multiidioma

```
Modifica [ComponentName] para usar traducciones:
- Importa useLanguage de @/context/LanguageContext
- Reemplaza strings hardcodeadas con traducciones
- Usa keys del archivo de traducciones
- Mantén la funcionalidad existente
```

---

## 🎯 Features Específicas

### Sistema de Misiones

```
Crea un componente MissionCard en src/components/tasks/ que:
- Muestre información de una misión (task)
- Indique el agente responsable
- Muestre progreso y estado
- Permita acciones (completar, cancelar, ver detalles)
- Use los colores del tema según estado
- Valide que el agente esté en ALLOWED_AGENTS
```

### Sistema de Gamificación

```
Integra el sistema de gamificación en [ComponentName]:
- Use las constantes de @/constants/gamification
- Muestre puntos y badges cuando corresponda
- Actualice progreso en Supabase
- Use animaciones suaves para feedback visual
- Siga el patrón de otros componentes con gamificación
```

### Carrito de Compras

```
Mejora el componente CartSidebar en src/components/cart/ para:
- Mostrar items del carrito del contexto ShoppingCartContext
- Permitir actualizar cantidades
- Mostrar total calculado
- Incluir botón de checkout
- Manejar estado vacío
- Ser responsive y accesible
```

---

## 🔧 Utilidades y Helpers

### Función de Formateo

```
Crea una función formatPrice en src/lib/utils/ que:
- Reciba un número (precio)
- Formatee según locale (es-CO o en-US)
- Incluya símbolo de moneda
- Maneje decimales apropiadamente
- Retorne string formateado
- Use Intl.NumberFormat
```

### Validación con Zod

```
Crea un schema Zod para [entidad] en src/lib/validations/ que:
- Valide todos los campos requeridos
- Incluya mensajes de error en español e inglés
- Use tipos apropiados (string, number, email, etc.)
- Incluya validaciones custom si es necesario
- Siga el patrón de otros schemas en el proyecto
```

---

## 🧪 Testing

### Test de Componente

```
Crea tests para [ComponentName] en src/components/[ruta]/__tests__/ que:
- Usen React Testing Library
- Prueben renderizado básico
- Prueben interacciones del usuario
- Prueben casos edge y errores
- Verifiquen accesibilidad con jest-axe
- Tengan buena cobertura (>80%)
```

### Test de Hook

```
Crea tests para el hook [HookName] que:
- Prueben todos los casos de uso
- Mockeen dependencias externas (Supabase, etc.)
- Verifiquen estados de loading y error
- Prueben edge cases
```

---

## 🐛 Debugging

### Analizar Error

```
Analiza este error: [mensaje de error]
- Busca en el codebase dónde se origina
- Identifica la causa raíz
- Propón una solución
- Verifica que no afecte otras funcionalidades
```

### Optimizar Performance

```
Optimiza [ComponentName] para mejorar performance:
- Identifica re-renders innecesarios
- Implementa React.memo si es apropiado
- Optimiza queries de Supabase
- Implementa lazy loading si es necesario
- Mide mejoras con React DevTools Profiler
```

---

## 🔄 Refactoring

### Extraer Lógica a Hook

```
Refactoriza [ComponentName] extrayendo lógica a un custom hook:
- Crea use[FeatureName] en src/hooks/
- Mueve lógica de estado y efectos al hook
- Mantén la UI en el componente
- Asegura que la funcionalidad se mantenga igual
- Actualiza tests si es necesario
```

### Consolidar Código Duplicado

```
Identifica y consolida código duplicado en [área]:
- Crea funciones/componentes reutilizables
- Actualiza todas las referencias
- Mantén la funcionalidad existente
- Mejora tipos TypeScript si es necesario
```

---

## 📱 Responsive Design

### Hacer Componente Responsive

```
Hace [ComponentName] completamente responsive:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Ajusta layout, spacing, y tipografía
- Prueba en diferentes tamaños de pantalla
- Usa Tailwind responsive utilities
```

---

## ♿ Accesibilidad

### Mejorar Accesibilidad

```
Mejora la accesibilidad de [ComponentName]:
- Agrega ARIA labels donde falten
- Asegura navegación por teclado
- Verifica contraste de colores
- Agrega focus management
- Prueba con screen reader
- Sigue WCAG 2.1 AA
```

---

## 🚀 Deployment

### Preparar para Producción

```
Prepara [feature] para producción:
- Revisa y optimiza imports
- Verifica que no haya console.logs
- Optimiza imágenes y assets
- Verifica variables de entorno
- Revisa errores de TypeScript y ESLint
- Prueba build de producción
```

---

## 💡 Tips para Usar Estos Prompts

1. **Personaliza**: Adapta los prompts a tu caso específico
2. **Combina**: Puedes combinar múltiples prompts para features complejas
3. **Itera**: Empieza simple y agrega complejidad gradualmente
4. **Especifica**: Menciona archivos, funciones, o patrones específicos del proyecto
5. **Valida**: Siempre revisa y prueba el código generado

---

**Nota**: Estos prompts están diseñados para el proyecto GetInMotion. Ajusta según tus necesidades específicas.

