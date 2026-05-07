# 🔧 Script para Agregar Logs de Supabase

Este script automáticamente agrega `console.log` a **todas** las peticiones de Supabase en la carpeta `src/`.

---

## 📋 Requisitos

- Node.js instalado
- Estar en la raíz del proyecto

---

## 🚀 Uso

### **1. Ver cambios sin aplicar (Recomendado primero)**

```bash
node add-supabase-logs.cjs --dry-run
```

Esto mostrará:
- ✅ Qué archivos serían modificados
- ✅ Cuántos logs se agregarían
- ✅ Sin hacer cambios reales

### **2. Aplicar cambios**

```bash
node add-supabase-logs.cjs --apply
```

Esto:
- ✍️ Modifica los archivos
- ✍️ Agrega console.log antes de cada petición a Supabase
- ✍️ Genera un reporte (`LOGS_SUPABASE_AGREGADOS.md`)

---

## 🎯 ¿Qué hace el script?

### Busca estos patrones:

```typescript
// Búsquedas en tablas
await supabase.from('tabla').select(...)
supabase.from('tabla').insert(...)

// Edge Functions
await supabase.functions.invoke('function-name', {...})
supabase.functions.invoke('function-name', {...})

// RPC
await supabase.rpc('function-name', {...})
supabase.rpc('function-name', {...})
```

### Agrega logs como:

```typescript
console.log('🔴 [SUPABASE] Petición en: src/components/Dashboard.tsx (línea 45) - supabase.from()');
await supabase.from('users').select('*');
```

---

## 📊 Ejemplo de Output

### Dry-run:
```
🚀 Iniciando script para agregar logs de Supabase...

🔍 MODO DRY-RUN

📂 Buscando archivos en: C:\proyecto\src

📄 Encontrados 91 archivos para procesar

─────────────────────────────────────────────────

📝 Sería modificado: src/hooks/useMasterCoordinator.ts (+3 logs)
📝 Sería modificado: src/components/Dashboard.tsx (+2 logs)
📝 Sería modificado: src/hooks/useArtisanShop.ts (+1 logs)

─────────────────────────────────────────────────

📊 ESTADÍSTICAS FINALES

Archivos procesados:  91
Archivos modificados: 25
Logs agregados:       67
Errores:              0

💡 TIP: Ejecuta con --apply para aplicar los cambios
```

### Apply:
```
🚀 Iniciando script para agregar logs de Supabase...

✍️  MODO APLICAR CAMBIOS

📂 Buscando archivos en: C:\proyecto\src

📄 Encontrados 91 archivos para procesar

─────────────────────────────────────────────────

✅ Modificado: src/hooks/useMasterCoordinator.ts (+3 logs)
✅ Modificado: src/components/Dashboard.tsx (+2 logs)
✅ Modificado: src/hooks/useArtisanShop.ts (+1 logs)

─────────────────────────────────────────────────

📊 ESTADÍSTICAS FINALES

Archivos procesados:  91
Archivos modificados: 25
Logs agregados:       67
Errores:              0

✅ Cambios aplicados exitosamente!

📄 Reporte generado: LOGS_SUPABASE_AGREGADOS.md
```

---

## ⚠️ Notas Importantes

1. **Siempre ejecuta `--dry-run` primero** para ver los cambios
2. **Haz commit antes** de ejecutar con `--apply`
3. **Revisa los cambios** con `git diff` después de aplicar
4. El script **NO modifica**:
   - Archivos fuera de `src/`
   - Archivos que ya tienen logs de Supabase
   - `node_modules`, `.git`, `dist`, `build`

---

## 🔄 Revertir Cambios

Si necesitas revertir:

```bash
git checkout src/
```

O revertir archivos específicos:

```bash
git checkout src/hooks/useMasterCoordinator.ts
```

---

## 📁 Archivos Generados

Después de ejecutar con `--apply`:

- ✅ `LOGS_SUPABASE_AGREGADOS.md` - Reporte detallado de cambios

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar el script con `--dry-run`
2. ✅ Revisar la lista de archivos
3. ✅ Hacer commit de tu trabajo actual
4. ✅ Ejecutar con `--apply`
5. ✅ Revisar cambios con `git diff`
6. ✅ Probar la aplicación
7. ✅ Ver logs en la consola del navegador
8. ✅ Identificar peticiones más frecuentes
9. ✅ Priorizar migraciones

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'fs'"
- Asegúrate de ejecutar con Node.js (no en el navegador)

### Error: "ENOENT: no such file or directory"
- Ejecuta desde la raíz del proyecto
- Verifica que la carpeta `src/` exista

### No se agregaron logs
- Verifica que haya archivos con peticiones a Supabase
- Revisa que no tengan logs previos

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa el archivo `REPORTE_PETICIONES_SUPABASE.md`
2. Verifica que Node.js esté instalado: `node --version`
3. Revisa permisos de escritura en la carpeta

---

**¡Listo para ejecutar! 🚀**
