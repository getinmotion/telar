# 📈 Incremento Temporal de Precios 20%

## 🎯 Objetivo
Incrementar temporalmente el `base_price_minor` de todos los productos en la tabla `shop.product_variants` en un 20% durante 2 días, y luego revertir a los precios originales.

## 📋 Migraciones Creadas

### 1️⃣ Migration 1: ApplyTempPriceIncrease20Percent
**Archivo:** `src/migrations/2026/1780118319749-ApplyTempPriceIncrease20Percent.ts`

**Qué hace:**
- ✅ Crea columna temporal `temp_original_price_minor`
- ✅ Guarda todos los precios originales
- ✅ Incrementa precios en 20%
- ✅ Muestra estadísticas y verificaciones detalladas

**Cuándo ejecutar:** HOY (antes de que necesites el incremento)

### 2️⃣ Migration 2: RevertTempPriceIncrease20Percent
**Archivo:** `src/migrations/2026/1780118325886-RevertTempPriceIncrease20Percent.ts`

**Qué hace:**
- ✅ Restaura precios originales desde columna temporal
- ✅ Verifica que todo se restauró correctamente
- ✅ Elimina columna temporal
- ✅ Muestra estadísticas finales

**Cuándo ejecutar:** DESPUÉS DE 2 DÍAS

## 🚀 Instrucciones de Uso

### PASO 1: Aplicar Incremento (HOY)

```bash
# 1. Ejecutar migration
npm run migration:run

# Esto ejecutará solo ApplyTempPriceIncrease20Percent
# porque es la siguiente migration pendiente
```

**Salida esperada:**
```
🔄 Iniciando incremento temporal de precios 20%...

📊 Estadísticas ANTES del cambio:
┌─────┬────────────────────┬────────────────┬────────────────┬──────────────────┐
│total_variantes │ precio_minimo  │ precio_maximo  │ precio_promedio │ ...
└─────┴────────────────────┴────────────────┴────────────────┴──────────────────┘

✅ Backup verificado
✅ X variantes actualizadas

📊 Verificación del incremento:
┌─────┬──────────────────────────────────┐
│incremento_promedio_porcentaje: 20.00│
└─────┴──────────────────────────────────┘

✅ Incremento de precios aplicado exitosamente!
⏰ Recuerda ejecutar la migration de reversión después de 2 días
```

### PASO 2: Verificar que Funcionó

```bash
# Conectarte a la BD y ejecutar:
SELECT
  id,
  temp_original_price_minor as original,
  base_price_minor as actual,
  ROUND(((base_price_minor::NUMERIC / temp_original_price_minor - 1) * 100), 2) as porcentaje
FROM shop.product_variants
WHERE base_price_minor IS NOT NULL
LIMIT 10;
```

Deberías ver que `porcentaje` es aproximadamente `20.00` para todos.

### PASO 3: Revertir Precios (DESPUÉS DE 2 DÍAS)

```bash
# 1. Ejecutar migration
npm run migration:run

# Esto ejecutará RevertTempPriceIncrease20Percent
# porque es la siguiente migration pendiente
```

**Salida esperada:**
```
🔄 Iniciando reversión de incremento de precios...

✅ Columna temporal encontrada

📊 Estadísticas ANTES de revertir:
[muestra precios incrementados vs originales]

✅ X variantes restauradas

🔍 Verificando que los precios se restauraron correctamente:
┌─────┬───────────────────────────────────┬──────────────────┐
│precios_restaurados_correctamente: X   │ precios_diferentes: 0│
└─────┴───────────────────────────────────┴──────────────────┘

🗑️ Eliminando columna temporal...
✅ Columna temporal eliminada

✅ Reversión de precios completada exitosamente!
✅ Los precios han vuelto a sus valores originales
```

## 🔙 Rollback de Emergencia

### Si necesitas revertir ANTES de los 2 días:

```bash
# Revertir la última migration
npm run migration:revert
```

Esto ejecutará el método `down()` de la migration `ApplyTempPriceIncrease20Percent`, que:
1. Restaura los precios desde la columna temporal
2. Elimina la columna temporal
3. Vuelve todo a como estaba

### Si algo sale mal después de revertir:

Si ejecutaste la migration 2 (RevertTempPriceIncrease20Percent) y algo salió mal, **NO puedes hacer `migration:revert`** porque ya se eliminó la columna temporal.

En ese caso:
1. Si aún tienes backup de la BD, restaura desde ahí
2. Si no, los precios YA están restaurados (esa es la función de la migration 2)

## ⚠️ PRECAUCIONES IMPORTANTES

### Antes de Ejecutar en Producción:

1. **✅ HACER BACKUP COMPLETO DE LA BASE DE DATOS**
   ```bash
   # Ejemplo con pg_dump
   pg_dump -h HOST -U USER -d DATABASE > backup_antes_incremento.sql
   ```

2. **✅ Probar en ambiente local/desarrollo primero**
   ```bash
   # Copiar BD de prod a local
   # Ejecutar migrations
   # Verificar resultados
   ```

3. **✅ Ejecutar en horario de bajo tráfico** (madrugada)

4. **✅ Tener acceso SSH/consola listo** por si necesitas intervenir

5. **✅ Avisar al equipo** que habrá cambio de precios

### Durante la Ejecución:

- ✅ Monitorear los logs de la migration
- ✅ Verificar que el porcentaje de incremento sea ~20%
- ✅ Si algo se ve raro, tienes tiempo de hacer rollback
- ✅ Los cambios son atómicos (todo o nada)

### Después de Aplicar:

- ✅ Verificar en la app que los precios se vean correctos
- ✅ Revisar algunas órdenes de prueba
- ✅ **NO OLVIDAR** revertir después de 2 días

## 📊 Consultas Útiles

### Ver estado de la columna temporal
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'shop'
  AND table_name = 'product_variants'
  AND column_name = 'temp_original_price_minor';
```

### Ver comparación de precios
```sql
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE base_price_minor IS NOT NULL) as con_precio,
  MIN(base_price_minor) as min_precio,
  MAX(base_price_minor) as max_precio,
  AVG(base_price_minor) as avg_precio
FROM shop.product_variants;
```

### Ver diferencias (después de aplicar incremento)
```sql
SELECT
  id,
  temp_original_price_minor,
  base_price_minor,
  ROUND(((base_price_minor::NUMERIC / temp_original_price_minor - 1) * 100), 2) as porcentaje_cambio
FROM shop.product_variants
WHERE base_price_minor IS NOT NULL
  AND temp_original_price_minor IS NOT NULL
ORDER BY porcentaje_cambio DESC
LIMIT 20;
```

## 🔍 Verificar Estado de Migraciones

### Ver migraciones ejecutadas
```bash
npm run migration:show
```

Deberías ver:
```
[X] ApplyTempPriceIncrease20Percent1780118319749 (ejecutada)
[ ] RevertTempPriceIncrease20Percent1780118325886 (pendiente)
```

Después de los 2 días:
```
[X] ApplyTempPriceIncrease20Percent1780118319749
[X] RevertTempPriceIncrease20Percent1780118325886
```

## 📝 Notas Adicionales

- Las migraciones son **idempotentes**: Si algo falla, puedes volver a ejecutarlas
- Todos los cambios se hacen en **transacciones**: Si algo falla, se hace rollback automático
- Las verificaciones son **detalladas**: Verás exactamente qué está pasando
- Los logs son **informativos**: Te muestran estadísticas en cada paso

## 🆘 Problemas Comunes

### "La columna temp_original_price_minor ya existe"
**Solución:** Ya aplicaste la migration 1. Ejecuta la migration 2 para revertir.

### "La columna temp_original_price_minor no existe"
**Solución:** No has ejecutado la migration 1 todavía. Ejecuta `npm run migration:run`.

### "El porcentaje de incremento no es 20%"
**Solución:** Verifica que no haya cambios manuales en los precios. Revisa los logs detallados.

### "Quiero cancelar todo antes de los 2 días"
**Solución:** Ejecuta `npm run migration:revert` y listo.

## ✅ Checklist

### Día 1 (HOY):
- [ ] Backup completo de BD realizado
- [ ] Migrations probadas en local
- [ ] Equipo notificado
- [ ] `npm run migration:run` ejecutado
- [ ] Verificaciones revisadas (incremento ~20%)
- [ ] Precios verificados en la app
- [ ] Calendario marcado para revertir en 2 días

### Día 3 (DESPUÉS DE 2 DÍAS):
- [ ] `npm run migration:run` ejecutado
- [ ] Verificaciones revisadas (precios restaurados)
- [ ] Precios verificados en la app
- [ ] Columna temporal eliminada
- [ ] Todo funcionando normal

¡Listo! 🎉
