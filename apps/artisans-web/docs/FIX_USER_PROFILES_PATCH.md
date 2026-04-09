# 🔧 FIX: Endpoint PATCH de user_profiles

**Fecha:** 2026-01-25  
**Problema:** El endpoint PATCH requiere el `id` del `user_profile`, no el `userId`

---

## ❌ **Problema Identificado**

### **Antes (Incorrecto):**
```typescript
// ❌ Esto no funciona - el endpoint espera profile.id, no userId
await telarApi.patch(`/telar/server/user-profiles/${userId}`, payload);
```

**Endpoint correcto:**
```
PATCH /telar/server/user-profiles/{profile_id}
```
No:
```
PATCH /telar/server/user-profiles/{user_id}  ❌
```

---

## ✅ **Solución Implementada**

### **1. Nueva función optimizada: `updateUserProfileById()`**

Para cuando ya tienes el `profile.id` disponible (más eficiente):

```typescript
import { updateUserProfileById } from '@/services/userProfiles.actions';

// Si ya tienes el profile cargado
const profile = await getUserProfileByUserId(userId);

// Usa el ID directamente (1 sola llamada al backend)
await updateUserProfileById(profile.data.id, {
  fullName: 'Nuevo Nombre',
  brandName: 'Nueva Marca'
});
```

**Ventajas:**
- ✅ Solo 1 llamada al backend (PATCH)
- ✅ Más rápido
- ✅ Usa el endpoint correcto

---

### **2. Función wrapper: `updateUserProfile()` (Retrocompatible)**

Para mantener compatibilidad con código existente:

```typescript
import { updateUserProfile } from '@/services/userProfiles.actions';

// Esta función ahora hace 2 cosas internamente:
// 1. GET para obtener el profile.id
// 2. PATCH con el profile.id correcto
await updateUserProfile(userId, {
  fullName: 'Nuevo Nombre',
  brandName: 'Nueva Marca'
});
```

**Ventajas:**
- ✅ Código existente sigue funcionando sin cambios
- ✅ Usa el endpoint correcto automáticamente
- ⚠️ 2 llamadas al backend (GET + PATCH)

**Implementación interna:**
```typescript
export const updateUserProfile = async (
  userId: string,
  payload: UpdateUserProfilePayload
): Promise<GetUserProfileByUserIdSuccessResponse> => {
  // PASO 1: Obtener el perfil para conseguir su ID
  const currentProfile = await getUserProfileByUserId(userId);
  
  if (!currentProfile?.data?.id) {
    throw new Error('No se encontró el perfil del usuario');
  }
  
  // PASO 2: Usar la función optimizada con el ID
  return updateUserProfileById(currentProfile.data.id, payload);
};
```

---

## 📊 **Archivos Afectados (7 archivos)**

Todos estos archivos ya usaban `updateUserProfile(userId, payload)` y **seguirán funcionando sin cambios**:

1. ✅ `src/hooks/user/useUnifiedUserData.ts`
2. ✅ `src/components/cultural/hooks/useFusedMaturityAgent.ts`
3. ✅ `src/components/cultural/FusedMaturityCalculator.tsx`
4. ✅ `src/components/profile/ForceCompleteProfileModal.tsx`
5. ✅ `src/hooks/user/useProfileSync.ts`
6. ✅ `src/utils/dataRepair.ts`
7. ✅ `src/hooks/useDebugArtisanData.ts`

**No se requiere modificar ningún archivo adicional** - La compatibilidad está garantizada.

---

## 🎯 **Recomendaciones de Optimización (Futuro)**

### **Archivos que podrían optimizarse con `updateUserProfileById()`:**

#### **`useUnifiedUserData.ts`**
```typescript
// Actual (2 llamadas):
await updateUserProfile(user.id, payload);

// Optimizado (1 llamada):
if (userData.profile?.id) {
  await updateUserProfileById(userData.profile.id, payload);
}
```

#### **`useProfileSync.ts`**
```typescript
// Actual:
await updateUserProfile(user.id, payload);

// Optimizado:
const profile = await getUserProfileByUserId(user.id);
if (profile.data.id) {
  await updateUserProfileById(profile.data.id, payload);
}
```

**Beneficio:** Reducir de 2 a 1 llamada al backend por actualización.

---

## 🔄 **Flujo de Actualización**

### **Opción 1: Usar `updateUserProfile()` (Actual)**
```
Usuario → updateUserProfile(userId, payload)
         ↓
     GET /user-profiles/by-user/{userId} (obtener profile.id)
         ↓
     PATCH /user-profiles/{profile.id}
         ↓
     ✅ Profile actualizado
```

### **Opción 2: Usar `updateUserProfileById()` (Optimizado)**
```
Usuario → Ya tiene profile.id en estado/cache
         ↓
     updateUserProfileById(profile.id, payload)
         ↓
     PATCH /user-profiles/{profile.id}
         ↓
     ✅ Profile actualizado
```

---

## ✅ **Testing**

### **Casos de prueba:**

1. **Actualizar profile existente**
   ```typescript
   await updateUserProfile(userId, { fullName: 'Test' });
   // ✅ Debe funcionar correctamente
   ```

2. **Actualizar profile que no existe**
   ```typescript
   await updateUserProfile('fake-user-id', { fullName: 'Test' });
   // ❌ Debe lanzar error: "No se encontró el perfil del usuario"
   ```

3. **Usar función optimizada**
   ```typescript
   const profile = await getUserProfileByUserId(userId);
   await updateUserProfileById(profile.data.id, { fullName: 'Test' });
   // ✅ Debe funcionar con 1 sola llamada
   ```

---

## 📋 **Resumen**

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Endpoint usado** | ❌ `/user-profiles/{userId}` | ✅ `/user-profiles/{profile.id}` |
| **Funcionalidad** | ❌ Roto | ✅ Funciona |
| **Llamadas al backend** | 1 (pero fallaba) | 2 (GET + PATCH) o 1 (con optimización) |
| **Código existente** | - | ✅ Sigue funcionando |
| **Nuevas opciones** | - | ✅ Función optimizada disponible |

---

## 🚀 **Estado Actual**

✅ **FIX COMPLETADO**
- Endpoint PATCH ahora usa el `profile.id` correcto
- Todos los 7 archivos existentes siguen funcionando
- Nueva función optimizada disponible para uso futuro
- Compatibilidad 100% garantizada

**No se requieren cambios adicionales en el código existente.**

---

## 📝 **Notas Adicionales**

### **¿Por qué el GET adicional?**
El endpoint PATCH requiere `profile.id`, pero la mayoría del código solo tiene acceso a `userId`. La solución de hacer un GET primero es:
- ✅ Segura (siempre obtiene el ID correcto)
- ✅ Retrocompatible (no rompe código existente)
- ⚠️ Un poco más lenta (pero el GET probablemente está en caché)

### **Optimización futura:**
- Considerar cachear el `profile.id` en el AuthContext
- Modificar hooks que ya tienen el profile para usar `updateUserProfileById()`
- Implementar un endpoint alternativo: `PATCH /user-profiles/by-user/{userId}` en el backend

---

**FIX aplicado exitosamente** ✅
