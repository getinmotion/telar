# Skill: create-resource

Crea un nuevo módulo/recurso NestJS completo en el proyecto `api/`, siguiendo el patrón establecido del proyecto (module, providers, controller, service, entity, DTOs). Opcionalmente crea una migración TypeORM si se requiere una nueva tabla en la base de datos.

## Paso 1: Recopilar Contexto

Antes de iniciar, pregunta al usuario la siguiente información:

1. **Nombre del recurso** (en kebab-case, ej: `order-reviews`, `shipping-quotes`)
2. **Descripción breve** del propósito del módulo
3. **¿Necesita una nueva tabla en la base de datos?** (Sí/No)
4. Si necesita tabla:
   - **Nombre de la tabla** (snake_case, ej: `order_reviews`)
   - **Schema de PostgreSQL** donde vivirá (ej: `shop`, `store`, `public`, o uno nuevo)
   - **Columnas** con sus tipos, nullable, defaults y constraints (pide al usuario que describa los campos que necesita)
   - **Relaciones** con otras tablas (FK, si aplica)
5. **¿Los endpoints requieren autenticación JWT?** (Sí/No, default: Sí)
6. **Tag de Swagger** para agrupar los endpoints (default: nombre del recurso)

No procedas sin tener al menos el nombre, la descripción y la decisión sobre la tabla.

## Paso 2: Crear la Migración (solo si necesita tabla nueva)

Si el usuario indicó que necesita una nueva tabla:

1. Genera un timestamp actual con formato `{unix_timestamp_ms}` (ej: `1785200000000`)
2. Crea el archivo de migración en `api/src/migrations/2026/{timestamp}-Create{PascalCaseName}Table.ts`
3. La migración debe:
   - Implementar `MigrationInterface` de TypeORM
   - Usar `queryRunner.query()` con SQL raw
   - Crear el schema si es necesario: `CREATE SCHEMA IF NOT EXISTS {schema}`
   - Crear la tabla con todas las columnas especificadas
   - Incluir siempre `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
   - Incluir siempre `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
   - Incluir siempre `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
   - Crear índices relevantes
   - Crear foreign keys si aplica
   - El método `down()` debe revertir todo (DROP TABLE, DROP INDEX, etc.)

**Importante:** NO ejecutar `npm run migration:run`. La migración se corre manualmente por el usuario.

Ejemplo de estructura:
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create{PascalName}Table{Timestamp} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS {schema}`);
    await queryRunner.query(`
      CREATE TABLE {schema}.{table_name} (
        id UUID NOT NULL DEFAULT uuid_generate_v4(),
        -- columnas aquí
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT {table_name}_pkey PRIMARY KEY (id)
      )
    `);
    // Índices y FKs...
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS {schema}.{table_name}`);
  }
}
```

## Paso 3: Verificar NestJS CLI

Antes de generar el módulo, verifica si NestJS CLI está disponible:

```bash
cd api && npx nest --version
```

Si no está disponible, instálalo:
```bash
cd api && npm install -D @nestjs/cli
```

## Paso 4: Generar el Módulo con NestJS CLI

Ejecuta el generador para crear la estructura base:

```bash
cd api && npx nest generate resource resources/{resource-name} --no-spec
```

Selecciona "REST API" cuando pregunte el tipo de transporte.
Selecciona "Yes" para generar CRUD entry points.

Esto generará la estructura en `api/src/resources/{resource-name}/`.

**Nota:** El CLI genera archivos base que luego necesitan ser adaptados al patrón del proyecto (providers custom, inyección de repositorios, etc.).

## Paso 5: Crear el Entity

Crea/modifica `api/src/resources/{resource-name}/entities/{entity-name}.entity.ts`:

- `@Entity({ name: '{table_name}', schema: '{schema}' })`
- Extiende `BaseEntity`
- `@PrimaryGeneratedColumn('uuid')` para el ID
- Cada `@Column` con `name` en snake_case explícito, `type` PostgreSQL, y `nullable` si corresponde
- `@CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })`
- `@UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })`
- `@ApiProperty` o `@ApiPropertyOptional` en cada campo con `description` y `example`
- Enums definidos como `enum` de TypeScript en el mismo archivo si aplica
- Relaciones con `@ManyToOne`, `@OneToMany`, `@JoinColumn` si aplica

## Paso 6: Crear el Providers

Crea `api/src/resources/{resource-name}/{resource-name}.providers.ts`:

```typescript
import { DataSource } from 'typeorm';
import { {EntityName} } from './entities/{entity-file}.entity';

export const {camelCaseName}Providers = [
  {
    provide: '{SCREAMING_SNAKE_NAME}_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository({EntityName}),
    inject: ['DATA_SOURCE'],
  },
];
```

## Paso 7: Crear los DTOs

### Create DTO (`dto/create-{resource-name}.dto.ts`):
- `@ApiProperty` / `@ApiPropertyOptional` con description y example en cada campo
- Validadores de `class-validator`: `@IsString`, `@IsUUID`, `@IsNotEmpty`, `@IsOptional`, `@IsEnum`, `@IsBoolean`, etc.
- Mensajes de validación en español
- NO incluir `id`, `createdAt`, `updatedAt` en el CreateDTO

### Update DTO (`dto/update-{resource-name}.dto.ts`):
```typescript
import { PartialType } from '@nestjs/swagger';
import { Create{PascalName}Dto } from './create-{resource-name}.dto';

export class Update{PascalName}Dto extends PartialType(Create{PascalName}Dto) {}
```

## Paso 8: Configurar el Module

Modifica `api/src/resources/{resource-name}/{resource-name}.module.ts`:

```typescript
import { Module, forwardRef } from '@nestjs/common';
import { {PascalName}Service } from './{resource-name}.service';
import { {PascalName}Controller } from './{resource-name}.controller';
import { DatabaseModule } from 'src/config/configOrm.module';
import { {camelName}Providers } from './{resource-name}.providers';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AuthModule)],
  controllers: [{PascalName}Controller],
  providers: [...{camelName}Providers, {PascalName}Service],
  exports: [{PascalName}Service, ...{camelName}Providers],
})
export class {PascalName}Module {}
```

## Paso 9: Crear el Service

Modifica `api/src/resources/{resource-name}/{resource-name}.service.ts` con:

- `@Injectable()`
- Constructor con `@Inject('{SCREAMING_SNAKE_NAME}_REPOSITORY')` del tipo `Repository<{Entity}>`
- Métodos CRUD estándar:
  - `create(createDto): Promise<{Entity}>` — crea el recurso, verifica duplicados si aplica
  - `findAll(): Promise<{Entity}[]>` — lista todos (con paginación si tiene sentido)
  - `findOne(id: string): Promise<{Entity}>` — busca por ID, lanza `NotFoundException` si no existe
  - `update(id: string, updateDto): Promise<{Entity}>` — actualiza, verifica existencia
  - `remove(id: string): Promise<void>` — elimina (soft o hard según contexto)
- Mensajes de error en español
- Comentarios JSDoc en español

## Paso 10: Crear el Controller

Modifica `api/src/resources/{resource-name}/{resource-name}.controller.ts` con:

- `@ApiTags('{tag-name}')`
- `@Controller('{resource-name}')`
- Endpoints estándar:
  - `POST /` — Crear (201)
  - `GET /` — Listar todos (200)
  - `GET /:id` — Obtener por ID (200, 404)
  - `PATCH /:id` — Actualizar (200, 404)
  - `DELETE /:id` — Eliminar (200, 404)
- Cada endpoint con:
  - `@HttpCode(HttpStatus.XXX)`
  - `@ApiOperation({ summary: '...' })`
  - `@ApiResponse({ status: XXX, description: '...' })`
  - `@UseGuards(JwtAuthGuard)` + `@ApiBearerAuth('access-token')` si requiere auth
  - `@ApiParam` para parámetros de ruta

## Paso 11: Registrar el Módulo

Verifica que el nuevo módulo esté importado en `api/src/app.module.ts`. Si el CLI no lo hizo automáticamente, agrégalo manualmente.

## Paso 12: Verificar Compilación

Ejecuta el build para confirmar que todo compila correctamente:

```bash
cd api && npm run build
```

Si hay errores, corrígelos antes de finalizar. Si compila exitosamente, la skill está completa.

**NO ejecutar** `npm run start:dev` ni `npm run migration:run`.

## Resumen de Archivos Generados

Al finalizar, el módulo debe tener esta estructura:

```
api/src/resources/{resource-name}/
├── {resource-name}.module.ts
├── {resource-name}.controller.ts
├── {resource-name}.service.ts
├── {resource-name}.providers.ts
├── entities/
│   └── {entity-name}.entity.ts
└── dto/
    ├── create-{resource-name}.dto.ts
    └── update-{resource-name}.dto.ts
```

Y opcionalmente:
```
api/src/migrations/2026/{timestamp}-Create{PascalName}Table.ts
```
