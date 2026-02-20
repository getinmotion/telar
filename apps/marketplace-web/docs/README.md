# 📚 Documentación del Proyecto - Marketplace Telar

Bienvenido a la documentación del proyecto Marketplace Telar. Esta carpeta contiene todas las guías, reglas y mejores prácticas para el desarrollo del proyecto.

---

## 📋 Contenido de la Documentación

### 1. [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) - Guía Completa de Desarrollo

**📖 Descripción**: Documento principal con todas las reglas, patrones y mejores prácticas del proyecto.

**👥 Audiencia**: Todo el equipo de desarrollo

**📌 Usar cuando**:
- Inicias a trabajar en el proyecto por primera vez
- Necesitas entender la arquitectura completa
- Tienes dudas sobre cómo estructurar código nuevo
- Quieres consultar patrones establecidos en detalle

**🔑 Contenido clave**:
- Arquitectura del proyecto
- Patrón de Services (.actions.ts)
- Contexts y State Management
- Custom Hooks
- Componentes
- TypeScript & Tipos
- Axios y configuración HTTP
- Manejo de errores
- Clean Code principles
- Convenciones de nomenclatura

**⏱️ Tiempo de lectura**: ~30-40 minutos (completo)

---

### 2. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Guía de Referencia Rápida

**📖 Descripción**: Cheat sheet para consultas rápidas durante el desarrollo.

**👥 Audiencia**: Desarrolladores activos en el proyecto

**📌 Usar cuando**:
- Necesitas un template rápido de código
- Olvidas la convención de nomenclatura
- Quieres recordar el patrón de error handling
- Necesitas un ejemplo de código al instante

**🔑 Contenido clave**:
- Templates de código listos para usar
- Tabla de convenciones de nomenclatura
- Checklist de clean code
- Guía rápida de Axios
- Patrón de error handling
- Imports order
- Tailwind common classes

**⏱️ Tiempo de lectura**: 5-10 minutos (completo) | Consulta instantánea

**💡 Pro Tip**: Mantén este archivo abierto en una pestaña mientras codificas.

---

### 3. [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guía de Migración Supabase → NestJS

**📖 Descripción**: Proceso paso a paso para migrar módulos de Supabase al backend NestJS.

**👥 Audiencia**: Desarrolladores trabajando en la migración

**📌 Usar cuando**:
- Vas a migrar un nuevo módulo de Supabase a NestJS
- Necesitas el checklist de migración
- Quieres entender el estado actual de la migración
- Necesitas estrategia de rollback

**🔑 Contenido clave**:
- Estado actual de la migración (✅ Migrado, 🔄 En progreso, ⏳ Pendiente)
- Proceso de migración paso a paso
- Checklist por módulo
- Testing strategy
- Rollback strategy
- Mapeo Supabase → NestJS
- Tabla de prioridades

**⏱️ Tiempo de lectura**: 20-30 minutos (completo) | Por módulo: 5-10 minutos

**⚠️ Importante**: Actualizar el estado de migración después de completar cada módulo.

---

## 🎯 Flujo de Trabajo Recomendado

### Para Nuevos Desarrolladores

1. **Día 1**: Lee [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) completo
2. **Día 2**: Mantén [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) abierto y empieza a codificar
3. **Semana 1**: Si trabajas en migración, lee [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

### Para Desarrolladores Activos

1. **Inicio de cada tarea**: Consulta [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) para templates
2. **Durante desarrollo**: Sigue los checklists de clean code
3. **Migración de módulos**: Sigue paso a paso [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
4. **Dudas**: Consulta [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) para detalles

### Para Code Review

1. Verificar que se siguen las convenciones de [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
2. Usar el checklist de clean code de [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
3. Si es migración, verificar que se completó el checklist de [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

## 🔍 Buscar Información Rápidamente

### "¿Cómo creo un service (.actions.ts)?"
→ [QUICK_REFERENCE.md - Templates Rápidos](./QUICK_REFERENCE.md#-templates-rápidos)

### "¿Cuál es el patrón de error handling?"
→ [QUICK_REFERENCE.md - Error Handling](./QUICK_REFERENCE.md#-error-handling)

### "¿Cuándo uso telarApi vs telarApiPublic?"
→ [DEVELOPMENT_RULES.md - Axios y Configuración HTTP](./DEVELOPMENT_RULES.md#axios-y-configuración-http)
→ [QUICK_REFERENCE.md - Axios Usage](./QUICK_REFERENCE.md#-axios-usage)

### "¿Cómo migro un módulo de Supabase?"
→ [MIGRATION_GUIDE.md - Proceso de Migración](./MIGRATION_GUIDE.md#proceso-de-migración)

### "¿Qué módulos están migrados?"
→ [MIGRATION_GUIDE.md - Estado Actual](./MIGRATION_GUIDE.md#estado-actual)

### "¿Cuál es la convención de nomenclatura para [X]?"
→ [QUICK_REFERENCE.md - Convenciones de Nomenclatura](./QUICK_REFERENCE.md#-convenciones-de-nomenclatura)

### "¿Puedo dejar console.log en el código?"
→ **NO** (salvo excepciones temporales durante debugging)
→ [DEVELOPMENT_RULES.md - Testing & Debugging](./DEVELOPMENT_RULES.md#testing--debugging)

---

## 📐 Arquitectura Visual

```
┌─────────────────────────────────────────────────────────────┐
│                         Component                            │
│  (src/components/ProductCard.tsx)                           │
│  - Renderiza UI                                             │
│  - Maneja eventos de usuario                               │
└──────────────────────┬──────────────────────────────────────┘
                       │ useContext()
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                          Context                             │
│  (src/contexts/ProductsContext.tsx)                         │
│  - Maneja estado global                                     │
│  - Muestra toasts                                           │
│  - Loading states                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ llama a
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service (.actions.ts)                     │
│  (src/services/products.actions.ts)                         │
│  - Lógica de negocio                                        │
│  - Llamadas a API                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP Request (axios)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend (NestJS)                        │
│  http://localhost:1010/telar/server                         │
│  - Endpoints REST                                           │
│  - Validación                                               │
│  - Base de datos                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist: "¿Estoy Siguiendo las Reglas?"

Antes de hacer commit, verifica:

- [ ] Lei y entiendo las reglas de [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
- [ ] Usé los templates de [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- [ ] No dejé `console.log` innecesarios
- [ ] Seguí las convenciones de nomenclatura
- [ ] Agregué JSDoc donde corresponde
- [ ] Implementé error handling correctamente
- [ ] Usé `finally` para loading states
- [ ] Los mensajes de toast están en español
- [ ] Definí tipos TypeScript
- [ ] Si es migración, completé el checklist de [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

---

## 🚀 Comandos Útiles

```bash
# Buscar todos los console.log en el proyecto (para limpiar antes de commit)
grep -r "console.log" src/

# Buscar TODOs pendientes
grep -r "TODO:" src/

# Buscar código comentado que debería eliminarse
grep -r "^[[:space:]]*//" src/ | grep -v "^[[:space:]]*/\*"

# Ver archivos modificados
git status

# Ver diferencias antes de commit
git diff
```

---

## 📝 Actualización de Documentación

Esta documentación es un documento vivo que debe actualizarse regularmente.

### ¿Cuándo actualizar?

1. **DEVELOPMENT_RULES.md**:
   - Cuando se establece un nuevo patrón en el proyecto
   - Cuando cambian las convenciones
   - Cuando se adopta una nueva herramienta o librería

2. **QUICK_REFERENCE.md**:
   - Cuando se crean nuevos templates útiles
   - Cuando se identifican anti-patterns comunes

3. **MIGRATION_GUIDE.md**:
   - Al completar la migración de un módulo (marcar como ✅)
   - Al iniciar la migración de un módulo (marcar como 🔄)
   - Cuando se identifican nuevos desafíos o soluciones

### ¿Cómo actualizar?

1. Editar el archivo correspondiente
2. Actualizar la fecha al final del documento
3. Comunicar cambios al equipo
4. Hacer commit con mensaje descriptivo:
   ```bash
   git commit -m "docs: actualizar [archivo] - [descripción del cambio]"
   ```

---

## 🤝 Contribuir a la Documentación

Si encuentras:
- ❌ Información incorrecta o desactualizada
- ❓ Secciones confusas o poco claras
- 💡 Oportunidades de mejora
- 📝 Información faltante importante

**Por favor:**
1. Crea un issue o
2. Actualiza la documentación directamente y crea un PR

La documentación clara beneficia a todo el equipo.

---

## 📧 Contacto y Soporte

**Dudas sobre el proyecto:**
- Consulta primero esta documentación
- Si no encuentras la respuesta, pregunta al equipo
- Documenta la respuesta si es algo que puede beneficiar a otros

**Dudas técnicas específicas:**
- Frontend: [Contacto frontend lead]
- Backend: [Contacto backend lead]
- DevOps: [Contacto DevOps]

---

## 📊 Resumen de Documentos

| Documento | Tipo | Uso | Frecuencia |
|-----------|------|-----|------------|
| [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md) | Guía completa | Consulta detallada | Ocasional |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | Cheat sheet | Consulta rápida | Diaria |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Proceso | Migración de módulos | Por módulo |
| README.md (este) | Índice | Navegación | Primera vez |

---

## 🎓 Recursos Adicionales

### Oficiales del Proyecto
- Repositorio Frontend: `[URL]`
- Repositorio Backend: `[URL]`
- Swagger API Docs: `http://localhost:1010/api/docs`

### Tecnologías Principales
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Axios](https://axios-http.com/docs/intro)
- [NestJS Documentation](https://docs.nestjs.com/)

### Clean Code
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Refactoring Guru](https://refactoring.guru/)
- [Patterns.dev](https://www.patterns.dev/)

---

**🎯 Objetivo**: Mantener un código limpio, consistente y fácil de mantener para todo el equipo.

**💪 Compromiso**: Seguir estas guías no es opcional, es parte del estándar de calidad del proyecto.

**🚀 Resultado**: Un proyecto escalable, mantenible y profesional.

---

**Última actualización**: 2026-02-14
**Versión**: 1.0.0
