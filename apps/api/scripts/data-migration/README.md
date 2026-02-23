# Scripts de Migración de Datos

Scripts para migrar datos de Supabase a la nueva base de datos de producción.

## 📋 Requisitos Previos

1. Tener acceso a ambas bases de datos (Supabase y Producción)
2. Variables de entorno configuradas en `.env`
3. Backup de la base de datos de producción

## 🔧 Configuración

### Variables de Entorno (.env)

Agrega estas variables a tu archivo `.env`:

```env
# Base de Datos Origen (Supabase)
SUPABASE_DB_HOST=db.xxxxxxxxxxxx.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=tu-password-supabase
SUPABASE_DB_NAME=postgres

# Base de Datos Destino (Producción)
DB_HOST=tu-servidor-produccion.com
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu-password-produccion
DB_DATABASE=telar_production
DB_SSL=true

# Opciones de migración (opcional)
CONTINUE_ON_ERROR=false  # true para continuar si falla una migración
```

## 🚀 Ejecución

### Ejecutar Todas las Migraciones

```bash
npm run data-migration:all
```

### Ejecutar Migración Individual

```bash
# Migrar solo usuarios
npm run data-migration:users

# Migrar solo perfiles de usuario
npm run data-migration:user-profiles

# Migrar solo progreso de usuario
npm run data-migration:user-progress

# Migrar solo tareas de agentes
npm run data-migration:agent-tasks

# Migrar solo verificaciones de email
npm run data-migration:email-verifications

# Migrar solo contexto de coordinador maestro
npm run data-migration:master-coordinator-context

# Migrar solo logros de usuario
npm run data-migration:user-achievements

# Migrar solo contexto maestro de usuario
npm run data-migration:user-master-context

# Migrar solo puntuaciones de madurez
npm run data-migration:user-maturity-scores

# Migrar solo tiendas artesanas
npm run data-migration:artisan-shops

# Migrar solo categorías de productos
npm run data-migration:product-categories

# Migrar solo productos
npm run data-migration:products
```

## 📁 Estructura

```
scripts/data-migration/
├── config.ts                    # Configuración de conexiones
├── utils.ts                     # Utilidades (logging, progreso)
├── migrations/
│   ├── 01-migrate-users.ts      # Migración de usuarios (auth.users)
│   ├── 02-migrate-user-profiles.ts  # Migración de perfiles (artesanos.user_profiles)
│   ├── 03-migrate-user-progress.ts  # Migración de progreso (artesanos.user_progress)
│   ├── 04-migrate-agent-tasks.ts    # Migración de tareas de agentes (public.agent_tasks)
│   ├── 05-migrate-email-verifications.ts  # Migración de verificaciones email (public.email_verifications)
│   ├── 06-migrate-master-coordinator-context.ts  # Migración de contexto coordinador (public.master_coordinator_context)
│   ├── 07-migrate-user-achievements.ts  # Migración de logros de usuario (public.user_achievements)
│   ├── 08-migrate-user-master-context.ts  # Migración de contexto maestro (public.user_master_context)
│   ├── 09-migrate-user-maturity-scores.ts  # Migración de puntuaciones madurez (public.user_maturity_scores)
│   ├── 10-migrate-artisan-shops.ts  # Migración de tiendas artesanas (shop.artisan_shops)
│   ├── 11-migrate-product-categories.ts  # Migración de categorías (shop.product_categories)
│   ├── 12-migrate-products.ts   # Migración de productos
│   └── ...
├── logs/                        # Logs de migración (generado)
├── run-all.ts                   # Orquestador principal
└── README.md                    # Esta documentación
```

## 📝 Logs

Los logs se generan automáticamente en `scripts/data-migration/logs/`:

- Cada migración crea su propio archivo de log
- Formato: `{migration-name}-{timestamp}.log`
- Incluye errores detallados con stack traces

## ✅ Validación Post-Migración

Después de ejecutar la migración, valida que los datos se migraron correctamente:

```bash
npm run migrate:validate
```

## 🛡️ Mejores Prácticas

1. **Siempre haz backup antes de migrar:**
   ```bash
   pg_dump -h production-host -U user -d db > backup-before-migration.sql
   ```

2. **Ejecuta primero en ambiente de staging/test**

3. **Revisa los logs después de cada migración**

4. **Valida los conteos de registros:**
   ```sql
   -- En Supabase
   SELECT COUNT(*) FROM auth.users;

   -- En Producción
   SELECT COUNT(*) FROM public.users;
   ```

## 🔄 Re-ejecutar Migraciones

Los scripts usan `ON CONFLICT DO UPDATE`, por lo que son **seguros de re-ejecutar**. Si falla una migración, puedes volver a ejecutarla sin duplicar datos.

## ⚠️ Troubleshooting

### Error: "Cannot find module 'dotenv'"

```bash
npm install dotenv
```

### Error: "Connection timeout"

Verifica que:
- Las credenciales en `.env` sean correctas
- El servidor de BD permita conexiones desde tu IP
- El firewall permite el puerto 5432

### Error: "Relation does not exist"

Ejecuta primero las migraciones de schema con TypeORM:
```bash
npm run migration:run
```

## 📊 Orden de Migración Recomendado

1. Users (sin dependencias) - `auth.users`
2. User Profiles (depende de Users) - `artesanos.user_profiles`
3. User Progress (depende de User Profiles) - `artesanos.user_progress`
4. Agent Tasks (depende de Users) - `public.agent_tasks`
5. Email Verifications (depende de Users) - `public.email_verifications`
6. Master Coordinator Context (depende de Users) - `public.master_coordinator_context`
7. User Achievements (depende de Users) - `public.user_achievements`
8. User Master Context (depende de Users) - `public.user_master_context`
9. User Maturity Scores (depende de Users) - `public.user_maturity_scores`
10. Artisan Shops (depende de Users) - `shop.artisan_shops`
11. Product Categories (sin dependencias externas) - `shop.product_categories`
12. Products (depende de Artisan Shops, Product Categories)
13. Orders (depende de Users, Products)
14. Checkouts (depende de Orders)

## 📞 Soporte

Si encuentras problemas, revisa:
1. Logs en `scripts/data-migration/logs/`
2. Variables de entorno en `.env`
3. Conexión a ambas bases de datos
