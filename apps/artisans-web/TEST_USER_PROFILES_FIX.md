# 🧪 TEST: Validación del Fix de user_profiles PATCH

## ✅ **Checklist de Validación**

### **1. Verificar que el servicio funciona correctamente**

```typescript
// En la consola del navegador o en un componente de prueba:

import { getUserProfileByUserId, updateUserProfile, updateUserProfileById } from '@/services/userProfiles.actions';

// TEST 1: Obtener profile actual
const profile = await getUserProfileByUserId('USER_ID_AQUI');
console.log('Profile ID:', profile.data.id);
console.log('User ID:', profile.data.userId);

// TEST 2: Actualizar usando userId (función wrapper)
await updateUserProfile('USER_ID_AQUI', {
  fullName: 'Test Update ' + Date.now()
});
// ✅ Debe funcionar - hace GET + PATCH internamente

// TEST 3: Actualizar usando profile.id directamente (optimizado)
await updateUserProfileById(profile.data.id, {
  fullName: 'Test Direct ' + Date.now()
});
// ✅ Debe funcionar - hace solo PATCH
```

---

### **2. Verificar en archivos existentes**

#### **A. `useUnifiedUserData.ts`**
```bash
# Navegar a una página que use este hook
# Abrir DevTools → Console
# Ejecutar una actualización de perfil
# Verificar que no hay errores
```

**Esperado:**
- ✅ Red Tab debe mostrar:
  1. `GET /telar/server/user-profiles/by-user/{userId}`
  2. `PATCH /telar/server/user-profiles/{profile.id}` (NO userId)

---

#### **B. `FusedMaturityCalculator.tsx`**
```bash
# Completar el test de madurez
# Verificar que guarda el brandName correctamente
```

**Esperado:**
- ✅ El perfil se actualiza correctamente
- ✅ No hay errores en consola
- ✅ El brandName aparece en el profile después

---

#### **C. `ForceCompleteProfileModal.tsx`**
```bash
# Abrir el modal de completar perfil
# Llenar datos requeridos (nombre, WhatsApp, ciudad, etc.)
# Guardar
```

**Esperado:**
- ✅ Modal se cierra
- ✅ Datos guardados correctamente
- ✅ PATCH usa profile.id (verificar en Network tab)

---

### **3. Verificar logs del backend**

En los logs del servidor NestJS, verificar:

```bash
# Logs esperados:
[UserProfilesController] PATCH /user-profiles/{profile.id}
# ✅ El ID debe ser el profile.id (UUID del registro user_profile)

# NO debe aparecer:
[UserProfilesController] PATCH /user-profiles/{userId} ❌
# (Si aparece esto, el userId está llegando en lugar del profile.id)
```

---

### **4. Verificar errores comunes**

#### **Caso 1: Profile no existe**
```typescript
await updateUserProfile('fake-user-id-123', { fullName: 'Test' });
```
**Esperado:**
- ❌ Error: "No se encontró el perfil del usuario para actualizar"

#### **Caso 2: Payload inválido**
```typescript
await updateUserProfile(userId, { invalidField: 'test' });
```
**Esperado:**
- ❌ Error 400 del backend con mensaje de validación

#### **Caso 3: Token inválido**
```typescript
// Sin token de autenticación
await updateUserProfile(userId, { fullName: 'Test' });
```
**Esperado:**
- ❌ Error 401: "Token no proporcionado"

---

## 🔍 **Debugging**

### **Si algo falla, verificar:**

1. **El profile.id se obtiene correctamente:**
   ```typescript
   const profile = await getUserProfileByUserId(userId);
   console.log('Profile data:', profile.data);
   console.log('Profile ID exists?', !!profile.data?.id);
   ```

2. **El endpoint PATCH recibe el profile.id:**
   ```typescript
   // En userProfiles.actions.ts, agregar console.log temporal:
   console.log('[DEBUG] Updating profile with ID:', currentProfile.data.id);
   ```

3. **Network tab muestra el request correcto:**
   - URL debe ser: `/telar/server/user-profiles/{PROFILE_UUID}`
   - Método: PATCH
   - Payload: Campos a actualizar en camelCase

4. **Respuesta del backend:**
   - Status: 200 OK
   - Body: Profile actualizado completo

---

## 📊 **Comparación Antes vs Después**

### **ANTES (Roto):**
```
Request: PATCH /user-profiles/{userId}
         ↓
Backend: ❌ No encuentra el registro (userId ≠ profile.id)
         ↓
Error: 404 o 500
```

### **DESPUÉS (Funcionando):**
```
Request 1: GET /user-profiles/by-user/{userId}
         ↓
Backend: ✅ Retorna profile con profile.id
         ↓
Request 2: PATCH /user-profiles/{profile.id}
         ↓
Backend: ✅ Actualiza el registro correctamente
         ↓
Success: Profile actualizado
```

---

## ✅ **Checklist Final**

Marcar cada item después de validarlo:

- [ ] `updateUserProfile(userId, payload)` funciona correctamente
- [ ] `updateUserProfileById(profileId, payload)` funciona correctamente
- [ ] Network tab muestra PATCH con profile.id (no userId)
- [ ] `useUnifiedUserData.ts` actualiza perfiles sin errores
- [ ] `FusedMaturityCalculator.tsx` guarda brandName correctamente
- [ ] `ForceCompleteProfileModal.tsx` guarda datos requeridos
- [ ] No hay errores 404/500 en las actualizaciones
- [ ] Backend logs muestran PATCH con profile.id
- [ ] Todos los 7 archivos que usan updateUserProfile funcionan

---

## 🎯 **Resultado Esperado**

Después de aplicar el fix:

✅ **Todas las actualizaciones de user_profiles deben funcionar**
✅ **No más errores 404/500 en PATCH**
✅ **El endpoint correcto se usa en todas partes**
✅ **Código existente sigue funcionando sin cambios**

---

## 📝 **Notas de Testing**

- **Tiempo estimado:** 15-20 minutos
- **Prioridad:** Alta (bloquea funcionalidad crítica)
- **Rollback:** Si falla, revertir a versión anterior en git

---

**Testing completado:** [ ] SÍ / [ ] NO  
**Fecha de validación:** _____________  
**Testeado por:** _____________

---

## 🚨 **Si encuentras problemas:**

1. Revisar logs del backend
2. Verificar Network tab en DevTools
3. Comprobar que el token JWT es válido
4. Verificar que el userId corresponde a un perfil existente
5. Contactar al desarrollador del backend si el endpoint no existe

---

**Fix ready for testing** ✅
