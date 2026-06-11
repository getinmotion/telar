# Auditoría Técnica — Moderación y Admin (API NestJS)

> Fecha: 2026-05-14  
> Rama auditada: `feat/generalFixes`  
> App: `apps/api` (NestJS TypeScript backend)

---

## Resumen Ejecutivo

La API NestJS contiene toda la lógica de moderación y administración del sistema. El modelo de control de acceso usa dos mecanismos paralelos: un campo booleano `isSuperAdmin` para super-administradores y un enum `AppRole` (`admin`, `artisan`, `moderator`, `user`) para roles granulares.

**El estado actual tiene vulnerabilidades de seguridad críticas:** todos los endpoints del módulo de moderación de productos son completamente públicos (sin autenticación), un endpoint financiero de admin tampoco tiene protección, y el campo `isSuperAdmin` existe en la base de datos pero no está mapeado en el ORM ni incluido en el JWT, lo que hace que la comprobación de super-admin sea inconsistente.

---

## 1. Módulos Relevantes

| Módulo | Ruta | Propósito |
|---|---|---|
| `user-roles` | `src/resources/user-roles/` | Asignación y consulta de roles de usuario |
| `product-moderation-history` | `src/resources/product-moderation-history/` | Registro de historial de moderación de productos |
| `users` | `src/resources/users/` | Gestión de usuarios, incluye listado admin |
| `blog-posts` | `src/resources/blog-posts/` | CMS de blog (write protegido, read público) |
| `cms-sections` | `src/resources/cms-sections/` | Secciones de contenido del sitio |
| `collections` | `src/resources/collections/` | Colecciones editoriales |
| `cobre` | `src/resources/cobre/` | Integración de pasarela de pagos Cobre |
| `auth` | `src/resources/auth/` | JWT, login, permisos |

---

## 2. Sistema de Control de Acceso

### 2.1 Roles definidos
Archivo: `src/resources/user-roles/enums/app-role.enum.ts`

```typescript
enum AppRole {
  ADMIN = 'admin',
  USER = 'user',
  ARTISAN = 'artisan',
  MODERATOR = 'moderator',
}
```

### 2.2 Super-admin
- Campo `is_super_admin` (BOOLEAN) en tabla `auth.users`
- Migración: `src/migrations/2026/1768326087139-CreateUsersTable.ts` (línea 32)
- **Problema:** No está mapeado en `User.entity.ts`
- **Problema:** No está incluido en el payload JWT

### 2.3 Patrón de guards (actual — inconsistente)

Cada controlador implementa su propia función local:

```typescript
// Patrón super-admin (blog-posts, users, user-roles)
function ensureSuperAdmin(req: Request) {
  const user: any = (req as any).user ?? {};
  if (user.isSuperAdmin === true) return;
  throw new ForbiddenException('Super-admin role required');
}

// Patrón admin/moderador (cms-sections)
const ADMIN_ROLES = new Set(['admin', 'moderator', 'super_admin']);
function ensureAdmin(req: Request) {
  const user: any = (req as any).user ?? {};
  const role = (user.role || '').toString().toLowerCase();
  if (ADMIN_ROLES.has(role) || user.isSuperAdmin === true) return;
  throw new ForbiddenException('Admin or moderator role required');
}
```

No existe un `RolesGuard` centralizado ni decorador `@Roles()`.

### 2.4 JWT Payload (actual)
Archivo: `src/resources/auth/auth.service.ts` (líneas 246–250)

```typescript
const payload = {
  sub: user.id,
  email: user.email,
  role: user.role,    // solo el rol principal, no el array de roles
};
// isSuperAdmin AUSENTE
```

---

## 3. Estado de Seguridad por Módulo

### product-moderation-history
Archivo: `src/resources/product-moderation-history/product-moderation-history.controller.ts`

| Endpoint | Método | Auth | Estado |
|---|---|---|---|
| `/product-moderation-history` | POST | Ninguna | 🔴 PÚBLICO |
| `/product-moderation-history` | GET | Ninguna | 🔴 PÚBLICO |
| `/product-moderation-history/product/:productId` | GET | Ninguna | 🔴 PÚBLICO |
| `/product-moderation-history/moderator/:moderatorId` | GET | Ninguna | 🔴 PÚBLICO |
| `/product-moderation-history/artisan/:artisanId` | GET | Ninguna | 🔴 PÚBLICO |
| `/product-moderation-history/:id` | GET | Ninguna | 🔴 PÚBLICO |
| `/product-moderation-history/:id` | PATCH | Ninguna | 🔴 PÚBLICO |
| `/product-moderation-history/:id` | DELETE | Ninguna | 🔴 PÚBLICO |

### user-roles
Archivo: `src/resources/user-roles/user-roles.controller.ts`

| Endpoint | Método | Auth | Estado |
|---|---|---|---|
| `/user-roles` | POST | JWT + ensureSuperAdmin | ✅ Protegido |
| `/user-roles` | GET | Ninguna | 🟠 PÚBLICO |
| `/user-roles/:id` | GET | Ninguna | 🟠 PÚBLICO |
| `/user-roles/user/:userId` | GET | Ninguna | 🟠 PÚBLICO |
| `/user-roles/user/:userId/has-role/:role` | GET | Ninguna | 🟠 PÚBLICO |
| `/user-roles/:id` | PATCH | JWT + ensureSuperAdmin | ✅ Protegido |
| `/user-roles/:id` | DELETE | JWT + ensureSuperAdmin | ✅ Protegido |
| `/user-roles/user/:userId/role/:role` | DELETE | JWT + ensureSuperAdmin | ✅ Protegido |

### users (admin)
Archivo: `src/resources/users/users.controller.ts`

| Endpoint | Método | Auth | Estado |
|---|---|---|---|
| `/users` | GET | JWT + ensureSuperAdmin | ✅ Protegido |
| `/users/:id` | PATCH | JWT + ensureSuperAdmin | ✅ Protegido |

### blog-posts
Archivo: `src/resources/blog-posts/blog-posts.controller.ts`

| Endpoint | Método | Auth | Estado |
|---|---|---|---|
| `/blog-posts` | GET | Ninguna | ✅ Público correcto |
| `/blog-posts/slug/:slug` | GET | Ninguna | ✅ Público correcto |
| `/blog-posts` | POST | JWT + ensureSuperAdmin | ✅ Protegido |
| `/blog-posts/:id` | PATCH | JWT + ensureSuperAdmin | ✅ Protegido |
| `/blog-posts/:id` | DELETE | JWT + ensureSuperAdmin | ✅ Protegido |

### cms-sections
Archivo: `src/resources/cms-sections/cms-sections.controller.ts`

| Endpoint | Método | Auth | Estado |
|---|---|---|---|
| `/cms/sections` | GET | Ninguna | ✅ Público correcto |
| `/cms/sections/:id` | GET | JWT + ensureAdmin | ✅ Admin/Moderador |
| `/cms/sections` | POST | JWT + ensureAdmin | ✅ Admin/Moderador |
| `/cms/sections/:id` | PATCH | JWT + ensureAdmin | ✅ Admin/Moderador |
| `/cms/sections/:id` | DELETE | JWT + ensureAdmin | ✅ Admin/Moderador |
| `/cms/sections/reorder` | POST | JWT + ensureAdmin | ✅ Admin/Moderador |

### cobre (pagos)
Archivo: `src/resources/cobre/cobre.controller.ts`

| Endpoint | Método | Auth | Estado |
|---|---|---|---|
| `/cobre/counterparty` | POST | Ninguna | 🟠 Sin auth |
| `/cobre/counterparty-admin` | POST | Ninguna | 🔴 ADMIN SIN AUTH |
| `/cobre/counterparty-self` | POST | Ninguna | 🟠 Sin auth |

---

## 4. Modelo de Datos de Moderación

### product-moderation-history entity
Archivo: `src/resources/product-moderation-history/entities/product-moderation-history.entity.ts`

```
id            UUID (PK)
productId     UUID (FK → ProductCore)
previousStatus text (nullable)
newStatus      text (required)
moderatorId    UUID (nullable) — quién hizo el cambio
artisanId      UUID (nullable) — dueño del producto
comment        text (nullable) — nota de moderación
editsMade      JSONB — qué cambió
createdAt      timestamp — fecha del registro
```

**Capacidades del servicio** (`product-moderation-history.service.ts`):
- `create()` — crear registro
- `findAll()` — listar todos
- `findByProductId()` — historial de un producto
- `findByModeratorId()` — acciones de un moderador
- `findByArtisanId()` — historial de productos de un artesano
- `update()` — modificar registro existente ⚠️
- `remove()` — eliminar registro ⚠️

### user-roles entity
Archivo: `src/resources/user-roles/entities/user-role.entity.ts`

```
id          UUID (PK)
userId      UUID (FK → User)
role        AppRole enum
grantedAt   timestamp
grantedBy   UUID (FK → User) — auditoría
createdAt   timestamp
```

---

## 5. Problemas Encontrados

### 🔴 Crítico

**[C-1] Todos los endpoints de product-moderation-history son públicos**
- Archivo: `product-moderation-history.controller.ts`
- Cualquier persona sin autenticación puede:
  - Crear registros de moderación falsos (POST)
  - Ver todo el historial de moderación (GET)
  - Modificar registros existentes (PATCH)
  - **Eliminar el rastro de auditoría** (DELETE)
- Este módulo es la única fuente de verdad de decisiones de moderación — su exposición completa es un riesgo operacional y de reputación

**[C-2] Endpoint financiero admin sin autenticación**
- Archivo: `cobre.controller.ts`
- `/cobre/counterparty-admin` no tiene ningún guard
- Cualquiera puede asociar cuentas bancarias con tiendas
- Riesgo de fraude financiero directo

**[C-3] isSuperAdmin existe en BD pero no en ORM ni JWT**
- La columna `is_super_admin` está en la BD pero no está mapeada en `User.entity.ts`
- No se incluye en el payload del JWT al generar tokens (`auth.service.ts` líneas 246–250)
- `ensureSuperAdmin()` comprueba `user.isSuperAdmin` en el objeto request, pero si no viene en el JWT, siempre será `undefined`
- **Resultado posible:** la comprobación de super-admin puede fallar silenciosamente para todos los usuarios

---

### 🟠 Alto

**[A-1] Endpoints GET de user-roles son públicos**
- Archivo: `user-roles.controller.ts`
- Cualquiera puede listar todos los usuarios y sus roles asignados
- Permite enumerar qué usuarios son admin/moderador sin autenticación
- Information leakage sobre la estructura de operaciones internas

**[A-2] Sin RolesGuard centralizado**
- Cada controlador duplica su propia función `ensureSuperAdmin()` o `ensureAdmin()`
- Sin decorador `@Roles()` ni `RolesGuard` implementado
- Patrón inconsistente: algunos módulos usan `ensureSuperAdmin`, otros usan `ensureAdmin`, el módulo de moderación no usa ninguno
- Alta probabilidad de que un nuevo endpoint quede desprotegido por omisión

**[A-3] Historial de moderación es mutable y eliminable**
- El endpoint PATCH permite modificar `newStatus`, `comment`, `editsMade` de un registro existente
- El endpoint DELETE permite borrar registros de auditoría
- Un registro de auditoría debe ser append-only por principio de integridad

**[A-4] Sin token refresh ni revocación de tokens**
- Si se cambia `isSuperAdmin` o un rol en la BD, los JWTs existentes siguen válidos hasta su expiración
- Sin lista negra de tokens ni versionado de sesión

---

### 🟡 Medio

**[M-1] Roles del usuario ausentes en el JWT**
- El JWT solo incluye `role` (singular), no el array de `roles[]` de la tabla `user_roles`
- Un usuario puede tener múltiples roles en la BD que no se reflejan en las comprobaciones de acceso

**[M-2] Sin audit log para acciones de admin**
- La asignación de roles tiene rastro (`grantedBy`, `grantedAt`) ✅
- Pero no hay registro de: eliminaciones de usuarios, cambios de estado de tiendas, acciones de moderación en masa

**[M-3] Roles de endpoint /cobre/counterparty sin validación**
- `/cobre/counterparty` y `/cobre/counterparty-self` no verifican si el usuario autenticado tiene permisos para crear contrapartes
- Un artesano podría crear contrapartes para otra tienda que no es suya

**[M-4] Filtrado de datos por rol no implementado**
- Los moderadores pueden ver los nombres de otros moderadores en el historial
- Los artesanos pueden consultar el historial de moderación de otros artesanos (si saben el artisanId)

---

### 🟢 Bajo

**[B-1] Inconsistencia en la respuesta de errores de autorización**
- Algunos módulos lanzan `ForbiddenException`, otros no responden con nada (públicos)
- No hay un formato unificado de error de autorización

**[B-2] Sin paginación en endpoints de listado admin**
- `findAll()` en `product-moderation-history` no tiene límite
- Puede generar respuestas de miles de registros sin paginación

---

## 6. Recomendaciones Priorizadas

### Prioridad 1 — Implementar de inmediato

**1. Proteger todos los endpoints de product-moderation-history**
```typescript
// product-moderation-history.controller.ts
@UseGuards(JwtAuthGuard)
@Controller('product-moderation-history')
export class ProductModerationHistoryController {
  // POST/PATCH/DELETE → requerir rol admin o moderator
  // GET → opcional: autenticar para ver moderadorId
}
```

**2. Proteger el endpoint /cobre/counterparty-admin**
```typescript
// cobre.controller.ts
@UseGuards(JwtAuthGuard)
@Post('counterparty-admin')
async createAdminCounterparty(@Req() req: Request, ...) {
  ensureSuperAdmin(req);
  ...
}
```

**3. Mapear isSuperAdmin en el ORM y el JWT**
```typescript
// user.entity.ts
@Column({ name: 'is_super_admin', type: 'boolean', nullable: false, default: false })
isSuperAdmin: boolean;

// auth.service.ts
const payload = {
  sub: user.id,
  email: user.email,
  role: user.role,
  isSuperAdmin: user.isSuperAdmin,  // agregar
};
```

**4. Proteger endpoints GET de user-roles**
```typescript
// user-roles.controller.ts
@UseGuards(JwtAuthGuard)
@Get()
async findAll(@Req() req: Request) {
  ensureSuperAdmin(req);
  ...
}
```

### Prioridad 2 — Dentro del próximo sprint

**5. Crear RolesGuard y decorador @Roles() centralizados**
```typescript
// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean { ... }
}

// decorators/roles.decorator.ts
export const Roles = (...roles: AppRole[]) => SetMetadata('roles', roles);

// Uso en controladores:
@Roles(AppRole.ADMIN, AppRole.MODERATOR)
@UseGuards(JwtAuthGuard, RolesGuard)
```

**6. Hacer el historial de moderación append-only**
- Eliminar el endpoint PATCH de `product-moderation-history`
- El endpoint DELETE solo disponible para super-admin como operación de emergencia, con registro de la eliminación

**7. Agregar roles[] al JWT**
```typescript
// auth.service.ts
const userRoles = await this.userRolesService.findByUserId(user.id);
const payload = {
  sub: user.id,
  email: user.email,
  role: user.role,
  isSuperAdmin: user.isSuperAdmin,
  roles: userRoles.map(r => r.role),
};
```

### Prioridad 3 — Deuda técnica

**8. Implementar audit log de acciones admin**
- Registrar: quién hizo qué, cuándo, sobre qué entidad
- Módulo sugerido: `admin-audit-log`

**9. Invalidación de tokens al cambiar roles**
- Implementar versionado de sesión o lista negra de tokens
- Cuando cambia `isSuperAdmin` o roles, invalidar sesiones activas

**10. Agregar paginación a endpoints de listado**
- `product-moderation-history` findAll
- `user-roles` findAll

---

## 7. Archivos Clave a Modificar

| Archivo | Cambio necesario |
|---|---|
| [`src/resources/users/entities/user.entity.ts`](../apps/api/src/resources/users/entities/user.entity.ts) | Mapear `isSuperAdmin` en el ORM |
| [`src/resources/auth/auth.service.ts`](../apps/api/src/resources/auth/auth.service.ts) | Incluir `isSuperAdmin` y `roles[]` en JWT |
| [`src/resources/product-moderation-history/product-moderation-history.controller.ts`](../apps/api/src/resources/product-moderation-history/product-moderation-history.controller.ts) | Agregar guards a todos los endpoints |
| [`src/resources/cobre/cobre.controller.ts`](../apps/api/src/resources/cobre/cobre.controller.ts) | Proteger `/counterparty-admin` |
| [`src/resources/user-roles/user-roles.controller.ts`](../apps/api/src/resources/user-roles/user-roles.controller.ts) | Proteger endpoints GET |
| `src/guards/roles.guard.ts` | Crear (nuevo) — guard centralizado |
| `src/decorators/roles.decorator.ts` | Crear (nuevo) — decorador @Roles() |
