# Stores Resource

Resource de NestJS para gestionar tiendas (`shop.stores`) con integración de datos legacy de `public.artisan_shops`.

## Arquitectura

### Tablas Involucradas

1. **shop.stores** (Nueva tabla principal)
   - `id` - UUID de la tienda
   - `user_id` - UUID del usuario dueño
   - `name` - Nombre de la tienda
   - `slug` - Slug único
   - `story` - Historia de la tienda
   - `legacy_id` - **UUID que apunta a public.artisan_shops** (datos legacy)

2. **shop.store_artisanal_profiles** (Perfil artesanal)
   - Relación 1:1 con stores
   - `primary_craft_id` - Artesanía principal
   - `is_collaboration_studio` - Si es taller colaborativo

3. **shop.store_contacts** (Contactos)
   - Relación 1:1 con stores
   - email, phone, whatsapp, address, department, municipality

4. **shop.store_awards** (Premios)
   - Relación 1:N con stores
   - title, year, issuer

5. **shop.store_badges** (Insignias)
   - Relación 1:N con stores
   - `badge_id` - Referencia a taxonomy.badges

6. **public.artisan_shops** (LEGACY - Tabla antigua)
   - Contiene todos los datos históricos de tiendas
   - 40+ columnas con información completa
   - Se accede mediante `store.legacy_id`

## Migración de Datos

### Flujo de Migración Legacy → Nuevo

```typescript
// 1. Crear nueva tienda en shop.stores
const newStore = await storesService.create({
  userId: artisanShop.userId,
  name: artisanShop.shopName,
  slug: artisanShop.shopSlug,
  story: artisanShop.story,
  legacyId: artisanShop.id, // ← IMPORTANTE: Guardar ID legacy
});

// 2. Ahora la tienda puede acceder a datos legacy automáticamente
const store = await storesService.findOne(newStore.id);
console.log(store.legacyShop.logoUrl); // ← Datos de artisan_shops
console.log(store.legacyShop.bannerUrl);
console.log(store.legacyShop.heroConfig);
```

### ¿Por qué legacy_id?

Durante la migración de `public.artisan_shops` → `shop.stores`, se mantiene una referencia al registro original mediante `legacy_id`. Esto permite:

1. ✅ Acceder a datos que aún no han migrado (logo, banner, hero_config, etc.)
2. ✅ Trazabilidad de qué registros provienen de dónde
3. ✅ Migración gradual sin perder información
4. ✅ Rollback fácil si es necesario

## Endpoints Disponibles

### GET /stores
Obtiene todas las tiendas con datos legacy cargados.

**Respuesta:**
```json
[
  {
    "id": "uuid-store",
    "userId": "uuid-user",
    "name": "Mi Tienda Artesanal",
    "slug": "mi-tienda",
    "story": "Historia de mi tienda...",
    "legacyId": "uuid-legacy",
    "artisanalProfile": { ... },
    "contacts": { ... },
    "awards": [ ... ],
    "badges": [ ... ],
    "legacyShop": {
      "shopName": "Mi Tienda Artesanal",
      "logoUrl": "https://...",
      "bannerUrl": "https://...",
      "heroConfig": { ... },
      "aboutContent": { ... },
      "marketplaceApproved": true,
      ...
    }
  }
]
```

### GET /stores/:id
Obtiene una tienda por su ID (UUID).

### GET /stores/slug/:slug
Obtiene una tienda por su slug único.

**Ejemplo:**
```bash
GET /stores/slug/telar-artesanal
```

### GET /stores/user/:userId
Obtiene la tienda de un usuario específico.

**Ejemplo:**
```bash
GET /stores/user/550e8400-e29b-41d4-a716-446655440000
```

### GET /stores/legacy/:legacyId
Obtiene SOLO los datos legacy de `public.artisan_shops`.

**Uso:** Para debugging o verificar datos de migración.

### POST /stores
Crea una nueva tienda.

**Body:**
```json
{
  "userId": "uuid-user",
  "name": "Nueva Tienda",
  "slug": "nueva-tienda",
  "story": "Historia opcional...",
  "legacyId": "uuid-legacy-opcional"
}
```

### PATCH /stores/:id
Actualiza una tienda existente.

### DELETE /stores/:id
Soft delete de una tienda (marca `deleted_at`).

## Uso en el Código

### Inyectar el servicio

```typescript
import { StoresService } from './resources/stores/stores.service';

constructor(private readonly storesService: StoresService) {}
```

### Obtener tienda con datos legacy

```typescript
const store = await this.storesService.findOne(storeId);

// Acceder a datos nuevos
console.log(store.name);
console.log(store.slug);

// Acceder a datos legacy (si existe legacyId)
if (store.legacyShop) {
  console.log(store.legacyShop.logoUrl);
  console.log(store.legacyShop.heroConfig);
  console.log(store.legacyShop.socialLinks);
}
```

### Buscar por usuario

```typescript
const userStore = await this.storesService.findByUserId(userId);
console.log(`Tienda: ${userStore.name}`);
console.log(`Logo: ${userStore.legacyShop?.logoUrl}`);
```

## Estructura de Archivos

```
src/resources/stores/
├── entities/
│   └── store.entity.ts           # Todas las entidades (Store, StoreArtisanalProfile, etc.)
├── dto/
│   ├── create-store.dto.ts       # DTO para crear tienda
│   ├── update-store.dto.ts       # DTO para actualizar
│   └── store-response.dto.ts     # DTO de respuesta combinada
├── stores.controller.ts          # Controlador con endpoints
├── stores.service.ts             # Lógica de negocio + JOIN con legacy
├── stores.module.ts              # Módulo con TypeORM entities
└── README.md                     # Este archivo
```

## Consideraciones de Performance

### N+1 Query Problem

⚠️ **Actualmente**, el servicio carga `legacyShop` en un loop para `findAll()`:

```typescript
for (const store of stores) {
  if (store.legacyId) {
    store.legacyShop = await this.artisanShopRepository.findOne({
      where: { id: store.legacyId },
    });
  }
}
```

**Optimización futura:** Usar un solo query con LEFT JOIN:

```typescript
const stores = await this.storeRepository
  .createQueryBuilder('store')
  .leftJoinAndMapOne(
    'store.legacyShop',
    'artisan_shops',
    'legacy',
    'legacy.id = store.legacy_id'
  )
  .getMany();
```

## Migración Completa de Datos

Para migrar datos de `public.artisan_shops` → `shop.stores`:

1. Crear script de migración en `scripts/prod-to-local-migration/migrations/`
2. Leer todos los registros de `artisan_shops`
3. Crear registros en `stores` con `legacy_id = artisan_shop.id`
4. Opcionalmente, migrar datos específicos a las nuevas tablas relacionadas

**Ejemplo:**

```typescript
const artisanShops = await artisanShopRepository.find();

for (const shop of artisanShops) {
  // Crear store principal
  const store = await storeRepository.save({
    userId: shop.userId,
    name: shop.shopName,
    slug: shop.shopSlug,
    story: shop.story,
    legacyId: shop.id,
  });

  // Crear contactos
  if (shop.contactInfo && Object.keys(shop.contactInfo).length > 0) {
    await storeContactsRepository.save({
      storeId: store.id,
      email: shop.contactInfo.email,
      phone: shop.contactInfo.phone,
      whatsapp: shop.contactInfo.whatsapp,
      department: shop.department,
      municipality: shop.municipality,
    });
  }

  // Migrar craft_type → artisanal_profile
  if (shop.craftType) {
    const craft = await findCraftByName(shop.craftType);
    await storeArtisanalProfileRepository.save({
      storeId: store.id,
      primaryCraftId: craft?.id,
    });
  }
}
```

## Testing

```bash
# Iniciar servidor de desarrollo
npm run start:dev

# Probar endpoints
curl http://localhost:3000/stores
curl http://localhost:3000/stores/slug/mi-tienda
curl http://localhost:3000/stores/user/550e8400-e29b-41d4-a716-446655440000
```

## Roadmap

- [ ] Optimizar queries para evitar N+1 problem
- [ ] Crear script de migración completa de artisan_shops → stores
- [ ] Implementar paginación en `findAll()`
- [ ] Agregar filtros por department, municipality, featured
- [ ] Crear endpoint para sincronizar datos legacy → nuevas tablas
- [ ] Deprecar `public.artisan_shops` una vez migrado todo
