# 📊 Estado de Edge Functions - GetInMotion

**Última actualización**: 2025-01-19

---

## 📈 Resumen

- **Funciones locales**: 88
- **Funciones en config.toml**: 81
- **Funciones faltantes en local**: 5
- **Funciones locales no en config.toml**: 12

---

## ⚠️ Funciones Faltantes (en Cloud pero NO locales)

Estas funciones están configuradas en `supabase/config.toml` pero **NO existen localmente**:

1. **`approve-waitlist-user`** - Aprobar usuarios de la waitlist
2. **`create-dummy-users`** - Crear usuarios de prueba
3. **`delete-users`** - Eliminar usuarios
4. **`get-waitlist`** - Obtener lista de waitlist
5. **`validate-access-code`** - Validar código de acceso

### 🔽 Cómo Descargarlas

1. Ve al Dashboard de Supabase:
   ```
   https://supabase.com/dashboard/project/ylooqmqmoufqtxvetxuj/functions
   ```

2. Para cada función faltante:
   - Haz clic en la función
   - Copia todo el código
   - Crea el archivo: `supabase/functions/[nombre-funcion]/index.ts`
   - Pega el código

3. Verifica que funcionen:
   ```bash
   npm run list:functions
   ```

---

## 📝 Funciones Locales NO en config.toml

Estas funciones existen localmente pero **NO están en `config.toml`**:

1. `ai-recommendations`
2. `check-existing-user`
3. `checkout-link-cobre`
4. `create-intelligent-shop`
5. `generate-artisan-tasks`
6. `generate-brand-theme`
7. `generate-task-recommendations`
8. `manage-moderators`
9. `openai-chat`
10. `step-ai-assistant`
11. `sync-guest-cart`
12. `trigger-embedding-update`

### ⚙️ Agregar a config.toml

Si estas funciones están en producción, agrégalas a `supabase/config.toml`:

```toml
[functions.nombre-funcion]
verify_jwt = true  # o false según corresponda
```

---

## 🛠️ Comandos Útiles

### Listar y comparar funciones
```bash
npm run list:functions
```

### Sincronizar con Supabase CLI (si está configurado)
```bash
npm run sync:functions
```

### Sincronizar con API (requiere token)
```bash
npm run sync:functions:api
```

---

## 📋 Checklist de Sincronización

- [ ] Descargar `approve-waitlist-user`
- [ ] Descargar `create-dummy-users`
- [ ] Descargar `delete-users`
- [ ] Descargar `get-waitlist`
- [ ] Descargar `validate-access-code`
- [ ] Verificar que todas las funciones tengan `index.ts`
- [ ] Actualizar `config.toml` si es necesario
- [ ] Probar funciones localmente
- [ ] Commitear cambios a Git

---

## 🔗 Enlaces Útiles

- **Dashboard de Supabase**: https://supabase.com/dashboard/project/ylooqmqmoufqtxvetxuj
- **Edge Functions**: https://supabase.com/dashboard/project/ylooqmqmoufqtxvetxuj/functions
- **Documentación**: `docs/SYNC_EDGE_FUNCTIONS.md`

---

## 📝 Notas

- El script `list-functions.js` compara funciones locales vs config.toml
- Para obtener funciones desde cloud, usa el método manual del dashboard
- Mantén `config.toml` sincronizado con las funciones en producción

