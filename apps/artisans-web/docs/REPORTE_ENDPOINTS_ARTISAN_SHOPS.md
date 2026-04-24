# 📊 REPORTE: ENDPOINTS NECESARIOS PARA ARTISAN_SHOPS

**Fecha:** 2026-01-25  
**Estado:** Análisis completado  

---

## ✅ **SERVICIOS CREADOS**

### **`src/services/artisanShops.actions.ts`** ✅
6 funciones creadas:
- `getArtisanShopByUserId(userId)` - GET
- `hasArtisanShop(userId)` - Verificación
- `createArtisanShop(payload)` - POST
- `updateArtisanShop(shopId, payload)` - PATCH
- `updateArtisanShopByUserId(userId, payload)` - Helper
- `upsertArtisanShop(userId, payload)` - UPSERT

### **`src/types/artisanShop.types.ts`** ✅
Tipos completos con:
- `ArtisanShop` (35+ campos en camelCase)
- 5 Enums (PrivacyLevel, CreationStatus, etc.)
- 7 interfaces JSONB (ContactInfo, HeroConfig, etc.)
- Payloads de CREATE y UPDATE

---

## 🎯 **ENDPOINTS DISPONIBLES**

### **✅ Ya Implementados:**
1. `GET /telar/server/artisan-shops/user/:userId` ✅
2. `POST /telar/server/artisan-shops` ✅

---

## ⚠️ **ENDPOINTS NECESARIOS PARA MIGRACIÓN**

### **🔴 CRÍTICOS - Requeridos para migración:**

#### **1. PATCH /telar/server/artisan-shops/:shopId** 🔴 URGENTE

**Request (todos los campos opcionales):**
```json
{
  "shopName": "Nuevo Nombre",
  "description": "Nueva descripción",
  "logoUrl": "https://...",
  "brandClaim": "Nuevo claim",
  "primaryColors": ["#FF0000"],
  "secondaryColors": ["#00FF00"],
  "heroConfig": { /* ... */ },
  "aboutContent": { /* ... */ },
  "contactConfig": { /* ... */ },
  "socialLinks": { /* ... */ },
  "creationStatus": "complete",
  "publishStatus": "published",
  "active": true
  // ... cualquier otro campo de UpdateArtisanShopPayload
}
```

**Response en éxito:**
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "shopName": "Nuevo Nombre",
    // ... toda la entidad actualizada
  },
  "message": "Shop updated successfully"
}
```

**Response en error:**
```json
{
  "statusCode": 400,
  "timestamp": "2026-01-25T...",
  "path": "/telar/server/artisan-shops/:shopId",
  "message": {
    "response": {
      "message": ["Error message"],
      "error": "Bad Request",
      "statusCode": 400
    },
    // ...
  }
}
```

**Archivos que lo necesitan (10+ archivos):**
- `MasterAgentContext.tsx` (UPDATE shop_name, description)
- `syncBrandToShop.ts` (UPDATE logo, colors, claim)
- `useArtisanShop.ts` (UPDATE múltiples campos)
- Wizards (Hero, About, Contact, Social Links)
- `useAutoHeroGeneration.ts`

---

#### **2. DELETE /telar/server/artisan-shops/:shopId** 🟡 IMPORTANTE

**Request:** Solo el shopId en la URL

**Response en éxito:**
```json
{
  "message": "Shop deleted successfully",
  "shopId": "uuid"
}
```

**Archivos que lo necesitan:**
- `useDebugArtisanData.ts` (función `resetAllProgress`)

**Prioridad:** Media - Solo usado en funciones de debug/reset

---

### **🟡 OPCIONALES - Para Admin/Estadísticas:**

#### **3. GET /telar/server/artisan-shops (Lista con filtros)**

**Query Params sugeridos:**
```typescript
?active=true
?marketplace_approval_status=pending
?publish_status=published
?featured=true
?count=true  // Para obtener solo el conteo
?limit=10&offset=0  // Para paginación
```

**Response:**
```json
{
  "data": [/* array de shops */],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

**Archivos que lo necesitan:**
- `useAdminShops.ts`
- `useAdminStats.ts` (5 consultas con count y filtros)

**Prioridad:** Media - Solo para admin panel

---

#### **4. GET /telar/server/artisan-shops/:shopId** 🟢 BAJA

**Uso:** Obtener tienda por ID directo (menos común)

**Prioridad:** Baja - Se puede usar `getByUserId` en la mayoría de casos

---

## 📊 **ANÁLISIS DE ARCHIVOS (74 archivos totales)**

### **Por Prioridad:**

| Prioridad | Archivos | % | Endpoints Necesarios |
|-----------|----------|---|---------------------|
| **Alta** | 7 | 9% | GET ✅, PATCH 🔴 |
| **Media** | 15 | 20% | GET ✅, PATCH 🔴, DELETE 🟡 |
| **Baja** | 52 | 70% | Variados |

### **Por Tipo de Operación:**

| Operación | Cantidad | Endpoint Necesario | Estado |
|-----------|----------|-------------------|--------|
| **SELECT** | ~60 | GET by userId | ✅ Listo |
| **UPDATE** | ~10 | PATCH by shopId | ⚠️ Falta |
| **INSERT** | ~5 | POST | ✅ Listo |
| **DELETE** | ~2 | DELETE by shopId | ⚠️ Falta |
| **COUNT** | ~5 | GET lista con ?count | ⚠️ Falta |

---

## 🔥 **ARCHIVOS CRÍTICOS IDENTIFICADOS**

### **1. `src/context/MasterAgentContext.tsx`** 🔴
**5 operaciones detectadas:**
- SELECT logo_url (módulo 'marca')
- SELECT * (módulo 'tienda')
- SELECT id (módulo 'inventario')
- SELECT id, shop_name (verificación en EventBus)
- UPDATE shop_name, description (sincronización de marca)

**Endpoints necesarios:** GET ✅, PATCH ⚠️

---

### **2. `src/utils/syncBrandToShop.ts`** 🔴
**3 operaciones detectadas:**
- SELECT para verificar tienda existente
- INSERT para crear tienda nueva
- UPDATE para sincronizar logo, brand_claim, colors

**Endpoints necesarios:** GET ✅, POST ✅, PATCH ⚠️

**Uso:** Sincronización automática de marca → tienda

---

### **3. `src/hooks/useFixedTasksManager.ts`** 🟡
**1 operación detectada:**
- SELECT campos específicos (id, hero_config, logo_url, story, about_content, etc.)

**Endpoints necesarios:** GET ✅

**Uso:** Validar estado de tareas según contenido de tienda

---

### **4. `src/hooks/useArtisanShop.ts`** 🔴
**Uso detectado:** Carga y gestión de tienda (ver línea 49-50)
- SELECT * para cargar tienda
- Probablemente UPDATE para guardar cambios

**Endpoints necesarios:** GET ✅, PATCH ⚠️

**Importancia:** Hook principal para gestión de tiendas

---

### **5. `src/hooks/useTaskReconciliation.ts`** 🟡
**1 operación detectada:**
- SELECT para reconciliar estado de tareas

**Endpoints necesarios:** GET ✅

---

### **6. `src/hooks/useDebugArtisanData.ts`** 🟢
**1 operación detectada:**
- DELETE para resetear tienda

**Endpoints necesarios:** DELETE ⚠️

**Uso:** Debug/testing (baja prioridad)

---

### **7. `src/utils/systemIntegrityValidator.ts`** 🟡
**1 operación detectada:**
- SELECT * para validación de integridad

**Endpoints necesarios:** GET ✅

---

## 🎯 **RESUMEN DE NECESIDADES**

### **Para migrar archivos críticos necesitas:**

1. **PATCH /telar/server/artisan-shops/:shopId** 🔴 CRÍTICO
   - Sin este endpoint, **NO se pueden migrar 10+ archivos**
   - Afecta funcionalidad core (wizards, sync, updates)
   - **PRIORIDAD MÁXIMA**

2. **DELETE /telar/server/artisan-shops/:shopId** 🟡 OPCIONAL
   - Solo necesario para funciones de debug/reset
   - Se puede omitir inicialmente
   - Afecta 1-2 archivos no críticos

3. **GET /telar/server/artisan-shops (lista)** 🟡 OPCIONAL
   - Solo para admin panels y estadísticas
   - Se puede implementar después
   - Afecta 3-5 archivos de admin

---

## 📋 **EJEMPLO DE USO DEL SERVICIO**

### **Lectura (GET):**
```typescript
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';

// Obtener tienda del usuario
const shop = await getArtisanShopByUserId(user.id);

if (shop) {
  // Acceso en camelCase
  console.log(shop.shopName, shop.logoUrl, shop.brandClaim);
}
```

### **Creación (POST):**
```typescript
import { createArtisanShop } from '@/services/artisanShops.actions';

const newShop = await createArtisanShop({
  userId: user.id,
  shopName: 'Mi Tienda',
  shopSlug: 'mi-tienda-123',
  description: 'Descripción',
  craftType: 'Cerámica',
  active: true,
  publishStatus: 'pending_publish'
});
```

### **Actualización (PATCH - cuando esté disponible):**
```typescript
import { updateArtisanShop, updateArtisanShopByUserId } from '@/services/artisanShops.actions';

// Opción 1: Por shopId (si ya lo tienes)
await updateArtisanShop(shopId, {
  shopName: 'Nuevo Nombre',
  logoUrl: 'https://...'
});

// Opción 2: Por userId (helper)
await updateArtisanShopByUserId(user.id, {
  shopName: 'Nuevo Nombre',
  brandClaim: 'Nuevo claim'
});
```

### **UPSERT (cuando PATCH esté disponible):**
```typescript
import { upsertArtisanShop } from '@/services/artisanShops.actions';

// Crea o actualiza automáticamente
await upsertArtisanShop(user.id, {
  shopName: 'Mi Tienda',
  logoUrl: 'https://...'
});
```

---

## 🔧 **PATRÓN DE MIGRACIÓN**

### **SELECT → GET:**
```typescript
// ANTES ❌
const { data: shop, error } = await supabase
  .from('artisan_shops')
  .select('*')
  .eq('user_id', userId)
  .single();

// Acceso snake_case
const name = shop?.shop_name;
const logo = shop?.logo_url;

// DESPUÉS ✅
const shop = await getArtisanShopByUserId(userId);

// Acceso camelCase
const name = shop?.shopName;
const logo = shop?.logoUrl;
```

### **UPDATE → PATCH:**
```typescript
// ANTES ❌
await supabase
  .from('artisan_shops')
  .update({
    shop_name: 'Nuevo',
    logo_url: 'https://...'
  })
  .eq('id', shopId);

// DESPUÉS ✅
await updateArtisanShop(shopId, {
  shopName: 'Nuevo',
  logoUrl: 'https://...'
});
```

### **INSERT → POST:**
```typescript
// ANTES ❌
await supabase
  .from('artisan_shops')
  .insert({
    user_id: userId,
    shop_name: 'Tienda',
    shop_slug: 'tienda-123'
  });

// DESPUÉS ✅
await createArtisanShop({
  userId,
  shopName: 'Tienda',
  shopSlug: 'tienda-123'
});
```

---

## 🎉 **ESTADO ACTUAL**

✅ **Completado:**
- Tipos TypeScript (35+ campos)
- Servicio con 6 funciones
- Endpoint GET implementado
- Endpoint POST implementado

⏳ **Pendiente:**
- Endpoint PATCH (crítico para migración)
- Endpoint DELETE (opcional)
- Endpoint GET lista (opcional para admin)

---

## 📝 **PRÓXIMA ACCIÓN RECOMENDADA**

### **Si tienes el endpoint PATCH listo:**
**→ Comenzar migración inmediatamente** de 7 archivos críticos

### **Si NO tienes el endpoint PATCH:**
**→ Opción A:** Solicitar al backend el endpoint PATCH  
**→ Opción B:** Migrar solo lecturas (SELECT) mientras tanto  
**→ Opción C:** Continuar con otra tabla (products, orders, etc.)

---

## 📋 **ARCHIVOS LISTOS PARA MIGRAR (7 archivos críticos)**

Estos archivos están esperando el endpoint PATCH para completar su migración:

1. 🔄 `MasterAgentContext.tsx` - 5 operaciones
2. 🔄 `syncBrandToShop.ts` - 3 operaciones
3. 🔄 `useFixedTasksManager.ts` - 1 operación
4. 🔄 `useTaskReconciliation.ts` - 1 operación
5. 🔄 `systemIntegrityValidator.ts` - 1 operación
6. 🔄 `useArtisanShop.ts` - Múltiples operaciones
7. 🔄 `useDebugArtisanData.ts` - 1 operación (DELETE)

**Total operaciones:** ~15 operaciones en archivos críticos

---

## 💡 **RECOMENDACIÓN FINAL**

**Para avanzar con artisan_shops necesitas:**

1. **PATCH /telar/server/artisan-shops/:shopId** 🔴
   - DTO: Similar al CreateDto pero todos los campos opcionales
   - Request body: Partial de todos los campos
   - Response: Shop actualizado completo

2. **DELETE /telar/server/artisan-shops/:shopId** 🟡 (opcional)
   - Response: Success message

Con estos 2 endpoints podrías migrar los 7 archivos críticos (100% de funcionalidad core).

---

**¿Tienes ya estos endpoints en NestJS o necesitas las especificaciones para crearlos?** 🤔
