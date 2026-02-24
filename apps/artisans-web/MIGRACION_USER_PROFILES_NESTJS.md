# 🔄 Migración de User Profiles a NestJS Backend

## 📋 Resumen

Se creó un servicio centralizado para obtener perfiles de usuario desde el backend NestJS en lugar de consultas directas a Supabase.

---

## ✅ **CAMBIOS COMPLETADOS**

### **1. Tipos TypeScript Creados** - `src/types/userProfile.types.ts`

Se crearon las interfaces para la respuesta del backend NestJS:

```typescript
export interface UserProfile {
  id: string;
  userId: string;
  user: UserProfileUser;
  fullName: string;
  avatarUrl: string | null;
  brandName: string | null;
  businessDescription: string | null;
  // ... (más de 30 campos)
}

export type GetUserProfileByUserIdSuccessResponse = UserProfile;
export interface UserProfileErrorResponse { ... }
```

**Mapeo de Campos Supabase → NestJS:**
- `user_id` → `userId`
- `full_name` → `fullName`
- `avatar_url` → `avatarUrl`
- `brand_name` → `brandName`
- `business_description` → `businessDescription`
- `whatsapp_e164` → `whatsappE164`
- `rut_pendiente` → `rutPendiente`
- `newsletter_opt_in` → `newsletterOptIn`
- `account_type` → `accountType`
- `dane_city` → `daneCity`

---

### **2. Servicio de User Profiles** - `src/services/userProfiles.actions.ts`

Se crearon las funciones para interactuar con el backend NestJS:

#### **`getUserProfileByUserId(userId)`**

**Endpoint:** `GET /telar/server/user-profiles/by-user/{userId}`

**Uso:**
```typescript
import { getUserProfileByUserId } from '@/services/userProfiles.actions';

const profile = await getUserProfileByUserId(authUser.id);
console.log(profile.fullName); // "Lina Narvaez Reyes"
console.log(profile.brandName); // "Mi Marca"
```

**Respuesta Exitosa (200):**
```json
{
  "id": "5b84bf0b-986e-4d07-b560-332bbec57cfc",
  "userId": "e3c46008-1fd8-495b-aeec-0fbc2bf54e8a",
  "fullName": "Lina Narvaez Reyes",
  "brandName": "Mi Marca",
  "businessDescription": "...",
  ...
}
```

**Respuesta Error (500):**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

#### **`hasUserProfile(userId)`**

**Uso:**
```typescript
const exists = await hasUserProfile(authUser.id);
if (exists) {
  // El usuario tiene perfil creado
}
```

---

### **3. MasterAgentContext.tsx Actualizado**

Se actualizaron **2 casos** que consultaban `user_profiles`:

#### **Caso 1: `refreshModule('perfil')`** - Línea 110

**ANTES (Supabase directo):**
```typescript
const { data: profile, error: profileError } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', authUser.id)
  .single();

if (profile) {
  setMasterState(prev => ({
    ...prev,
    perfil: {
      nombre: profile.brand_name || profile.full_name || '',
      nit: profile.rut || '',
      nit_pendiente: profile.rut_pendiente || !profile.rut,
    },
  }));
}
```

**DESPUÉS (NestJS Backend):**
```typescript
try {
  const profile = await getUserProfileByUserId(authUser.id);

  if (profile) {
    setMasterState(prev => ({
      ...prev,
      perfil: {
        nombre: profile.brandName || profile.fullName || '',
        email: authUser.email || '',
        whatsapp: profile.whatsappE164 || '',
        nit: profile.rut || '',
        nit_pendiente: profile.rutPendiente || !profile.rut,
      },
    }));
  }
} catch (profileError) {
  console.error('[MasterAgent] Error loading profile:', profileError);
}
```

**Beneficios:**
- ✅ Usa el endpoint NestJS
- ✅ Incluye información de `whatsapp` ahora disponible
- ✅ Manejo de errores mejorado con try/catch

---

#### **Caso 2: `refreshModule('marca')`** - Línea 133

**ANTES (Supabase directo):**
```typescript
const { data: profile, error: profileError } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', authUser.id)
  .single();

const logoUrl = profile?.avatar_url || brandEval?.logo_url || null;
```

**DESPUÉS (NestJS Backend):**
```typescript
try {
  const profile = await getUserProfileByUserId(authUser.id);

  const logoUrl = profile?.avatarUrl || brandEval?.logo_url || null;
  // ... resto del código
} catch (error) {
  console.error('[MasterAgent] Error loading brand:', error);
}
```

**Cambios en campos:**
- `profile.avatar_url` → `profile.avatarUrl`
- `profile.business_description` → `profile.businessDescription`
- `profile.updated_at` → `profile.updatedAt`

---

## 📊 **ARCHIVOS QUE AÚN NECESITAN ACTUALIZACIÓN**

Se detectaron **24 archivos adicionales** que hacen consultas directas a `user_profiles`:

### **Alta Prioridad (Core del sistema):**

1. ✅ **`src/context/MasterAgentContext.tsx`** - ✅ COMPLETADO
2. 🔄 **`src/components/cultural/hooks/useFusedMaturityAgent.ts`** - Maturity calculator
3. 🔄 **`src/hooks/user/useUnifiedUserData.ts`** - Datos unificados del usuario
4. 🔄 **`src/hooks/user/useUserBusinessProfile.ts`** - Perfil de negocio
5. 🔄 **`src/hooks/user/useProfileSync.ts`** - Sincronización de perfil

### **Media Prioridad (Features específicos):**

6. 🔄 **`src/components/cultural/conversational/components/IntelligentConversationFlow.tsx`**
7. 🔄 **`src/components/cultural/FusedMaturityCalculator.tsx`**
8. 🔄 **`src/hooks/useMasterCoordinator.ts`**
9. 🔄 **`src/hooks/useProfileCompleteness.ts`**
10. 🔄 **`src/components/profile/ForceCompleteProfileModal.tsx`**
11. 🔄 **`src/hooks/useFixedTasksManager.ts`**

### **Baja Prioridad (Admin, Debug, Utils):**

12. 🔄 **`src/hooks/useAdminStats.ts`**
13. 🔄 **`src/hooks/useAdminShops.ts`**
14. 🔄 **`src/utils/systemIntegrityValidator.ts`**
15. 🔄 **`src/utils/syncBrandToShop.ts`**
16. 🔄 **`src/utils/dataRepair.ts`**
17. 🔄 **`src/pages/DebugArtisanPage.tsx`**
18. 🔄 **`src/hooks/utils/agentTaskUtils.ts`**
19. 🔄 **`src/hooks/useTaskReconciliation.ts`**
20. 🔄 **`src/hooks/useOptimizedUserData.ts`**
21. 🔄 **`src/hooks/useDebugArtisanData.ts`**
22. 🔄 **`src/hooks/useDataRecovery.ts`**
23. 🔄 **`src/hooks/useAutoTaskCompletion.ts`**
24. 🔄 **`src/hooks/language/useLanguageSystem.ts`**
25. 🔄 **`src/components/coordinator/AgentInsights.tsx`**

---

## 🔧 **PATRÓN DE MIGRACIÓN**

Para cada archivo, seguir este patrón:

### **Paso 1: Agregar import**
```typescript
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
```

### **Paso 2: Reemplazar consulta Supabase**

**ANTES:**
```typescript
const { data: profile, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

if (error) {
  console.error('Error:', error);
  return;
}
```

**DESPUÉS:**
```typescript
try {
  const profile = await getUserProfileByUserId(userId);
  // Usar profile directamente
} catch (error) {
  console.error('Error:', error);
  return;
}
```

### **Paso 3: Actualizar nombres de campos (snake_case → camelCase)**

| Supabase (snake_case) | NestJS (camelCase) |
|-----------------------|--------------------|
| `profile.user_id` | `profile.userId` |
| `profile.full_name` | `profile.fullName` |
| `profile.avatar_url` | `profile.avatarUrl` |
| `profile.brand_name` | `profile.brandName` |
| `profile.business_description` | `profile.businessDescription` |
| `profile.business_type` | `profile.businessType` |
| `profile.target_market` | `profile.targetMarket` |
| `profile.current_stage` | `profile.currentStage` |
| `profile.business_goals` | `profile.businessGoals` |
| `profile.monthly_revenue_goal` | `profile.monthlyRevenueGoal` |
| `profile.time_availability` | `profile.timeAvailability` |
| `profile.team_size` | `profile.teamSize` |
| `profile.current_challenges` | `profile.currentChallenges` |
| `profile.sales_channels` | `profile.salesChannels` |
| `profile.social_media_presence` | `profile.socialMediaPresence` |
| `profile.business_location` | `profile.businessLocation` |
| `profile.years_in_business` | `profile.yearsInBusiness` |
| `profile.initial_investment_range` | `profile.initialInvestmentRange` |
| `profile.primary_skills` | `profile.primarySkills` |
| `profile.language_preference` | `profile.languagePreference` |
| `profile.user_type` | `profile.userType` |
| `profile.first_name` | `profile.firstName` |
| `profile.last_name` | `profile.lastName` |
| `profile.whatsapp_e164` | `profile.whatsappE164` |
| `profile.rut_pendiente` | `profile.rutPendiente` |
| `profile.newsletter_opt_in` | `profile.newsletterOptIn` |
| `profile.account_type` | `profile.accountType` |
| `profile.dane_city` | `profile.daneCity` |
| `profile.created_at` | `profile.createdAt` |
| `profile.updated_at` | `profile.updatedAt` |

---

## 📝 **CHECKLIST DE MIGRACIÓN**

### **Completados:**
- ✅ Tipos TypeScript (`src/types/userProfile.types.ts`)
- ✅ Servicio (`src/services/userProfiles.actions.ts`)
- ✅ `MasterAgentContext.tsx` - case 'perfil'
- ✅ `MasterAgentContext.tsx` - case 'marca'

### **Pendientes:**
- ⏳ 24 archivos adicionales con consultas a `user_profiles`

---

## 🚀 **PRÓXIMOS PASOS RECOMENDADOS**

1. **Migrar hooks de usuario (Alta prioridad):**
   - `useUnifiedUserData.ts`
   - `useUserBusinessProfile.ts`
   - `useProfileSync.ts`

2. **Migrar Maturity Calculator:**
   - `useFusedMaturityAgent.ts`
   - `IntelligentConversationFlow.tsx`
   - `FusedMaturityCalculator.tsx`

3. **Migrar hooks secundarios:**
   - `useMasterCoordinator.ts`
   - `useProfileCompleteness.ts`
   - `useFixedTasksManager.ts`

4. **Migrar utilidades y admin (Baja prioridad):**
   - Archivos de debug
   - Archivos de admin
   - Utilidades de validación

---

## 🔍 **VERIFICACIÓN**

Para verificar que un archivo ya no usa consultas directas:

```bash
# Buscar consultas directas a user_profiles
grep -r "\.from('user_profiles')" src/
grep -r '\.from("user_profiles")' src/
```

Si retorna el archivo, aún necesita migración.

---

## ⚠️ **NOTAS IMPORTANTES**

1. **Token requerido:** Todas las llamadas a `getUserProfileByUserId()` requieren un token válido en `localStorage` (`telar_token`)
2. **Manejo de errores:** Siempre usar `try/catch` para capturar errores de red o autenticación
3. **Campos anidados:** El campo `user` dentro de `UserProfile` contiene la info completa del usuario de auth
4. **Compatibilidad:** El endpoint retorna `null` para campos vacíos, no `undefined`

---

**Última actualización:** 2026-01-25  
**Estado:** 1/25 archivos migrados (4%)
