# Migración de Datos: Producción → Local

Scripts para sincronizar datos desde la base de datos de **producción en AWS Lightsail** hacia la **base de datos local** de desarrollo.

## Requisitos Previos

1. **Node.js** v16+ y npm
2. **PostgreSQL** local instalado y ejecutándose
3. **Acceso a la base de datos de producción** (credenciales de AWS Lightsail)
4. **Base de datos local creada**:
   ```bash
   createdb getinmotion
   ```
5. **Migraciones de TypeORM ejecutadas localmente**:
   ```bash
   cd ../../
   npm run migration:run
   ```

## Configuración

### 1. Crear archivo .env

```bash
cp .env.example .env
```

### 2. Completar credenciales

Editar `.env` con:
- Credenciales de producción (`PROD_*`)
- Credenciales de local (`LOCAL_*`)

⚠️ **NUNCA commitear el archivo .env al repositorio**

## Uso

### Ejecutar todas las migraciones

```bash
# Desde la carpeta raíz del proyecto
cd scripts/prod-to-local-migration
npx ts-node run-all.ts
```

### Ejecutar migración individual

```bash
npx ts-node migrations/01-migrate-users.ts
```

## Estrategia de Migración

- **Origen**: Base de datos de producción (AWS Lightsail)
- **Destino**: Base de datos local
- **Método**: `INSERT ... ON CONFLICT DO NOTHING`
  - Solo inserta registros que NO existan en local
  - Preserva datos locales existentes (no sobrescribe)
  - Ideal para setup inicial sin perder cambios de desarrollo

## Orden de Ejecución

Las migraciones se ejecutan en orden respetando dependencias:

1. `01-users` → Usuarios base
2. `02-user-profiles` → Perfiles (depende users)
3. `03-user-progress` → Progreso de usuarios
4. `04-agent-tasks` → Tareas de agentes
5. `05-email-verifications` → Verificaciones de email
6. `06-master-coordinator-context` → Contexto del coordinador
7. `07-user-achievements` → Logros de usuarios
8. `08-user-master-context` → Contexto maestro de usuarios
9. `09-user-maturity-scores` → Puntuaciones de madurez
10. `10-artisan-shops` → Tiendas artesanales
11. `11-product-categories` → Categorías de productos
12. `12-products` → Productos
13. `13-user-roles` → Roles de usuarios
14. `14-product-moderation-history` → Historial de moderación
15. `15-product-variants` → Variantes de productos
16. `16-inventory-movements` → Movimientos de inventario

## Logs

Los logs se generan en `logs/` con formato:
```
logs/users-2026-03-23T15-30-45.log
```

## Troubleshooting

### Error de conexión a producción

Verificar:
- VPN o acceso de red a AWS
- Credenciales correctas en `.env`
- SSL habilitado para producción

### Duplicados al migrar

Normal si ejecutas múltiples veces. `ON CONFLICT DO NOTHING` evita errores por duplicados.

### Faltan tablas en local

Ejecutar migraciones de TypeORM:
```bash
cd ../../
npm run migration:run
```

## Seguridad

⚠️ **IMPORTANTE:**
- No ejecutar en producción (solo local)
- No compartir credenciales
- Usar solo para desarrollo/testing
- Revisar logs antes de commitear

## Comandos Útiles

### Verificar conteos de registros

```sql
-- En producción
SELECT COUNT(*) FROM auth.users;

-- En local
SELECT COUNT(*) FROM auth.users;
```

### Limpiar datos locales (opcional)

```sql
TRUNCATE TABLE auth.users CASCADE;
```

## Soporte

Para problemas o preguntas, contactar al equipo de desarrollo.
