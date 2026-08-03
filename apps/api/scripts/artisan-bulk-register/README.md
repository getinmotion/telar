# Script de Registro Masivo de Artesanos

Este script permite registrar artesanos en la plataforma Telar de forma automatizada.

## 📋 Proceso de Registro

El script realiza los siguientes pasos por cada artesano:

1. **Crear usuario** en `auth.users`
   - Email
   - Contraseña genérica: `Telar123!`
   - Teléfono

2. **Crear perfil** en `artesanos.artisan_profile`
   - Información personal
   - Datos de contacto
   - Relación con convenios

3. **Clonar identity profile** de registro de referencia
   - `artisans_knowledge.artisans_identity_one`
   - `artisans_knowledge.artisans_commercial_two`
   - `artisans_knowledge.artisans_client_market_three`
   - `artisans_knowledge.artisans_operation_growth_four`
   - `artisans_knowledge.artisans_identity_profile`

4. **Crear tienda** en `store.stores`
   - Nombre de tienda
   - Slug generado automáticamente
   - Contactos en `store.store_contacts`

## 🚀 Instalación

```bash
cd /Users/CNARVA5/Documents/Proyectos/telar/apps/api/scripts/artisan-bulk-register

# Instalar dependencias
npm install
```

## 🧪 Prueba con UN Artesano

Antes de ejecutar el registro masivo, prueba con un solo artesano:

```bash
npm run register:test
```

Esto registrará a **Angela Ivonne Velasquez** como prueba.

### Verificar el Registro

Conéctate a la BD y verifica:

```sql
-- Usuario creado
SELECT * FROM auth.users WHERE email = 'ddyvonn7@gmail.com';

-- Perfil creado
SELECT * FROM artesanos.artisan_profile WHERE user_id = '...';

-- Identity profile creado
SELECT * FROM artisans_knowledge.artisans_identity_profile WHERE user_id = '...';

-- Tienda creada
SELECT * FROM store.stores WHERE user_id = '...';

-- Contactos de la tienda
SELECT * FROM store.store_contacts WHERE store_id = '...';
```

## 📊 Consultar Registro de Referencia

Para revisar la estructura del registro de referencia:

```bash
# Ejecuta las consultas en pgAdmin o tu cliente SQL
cat check-reference.sql
```

## 🔄 Registro Masivo (Todos los Artesanos)

Una vez validado el registro de prueba:

```bash
npm run register:all
```

## 📝 Datos de los Artesanos

El script registrará los siguientes artesanos:

| Email                            | Nombre                  | Tienda                             | Teléfono      |
| -------------------------------- | ----------------------- | ---------------------------------- | ------------- |
| ddyvonn7@gmail.com               | Angela Ivonne Velasquez | Ddyvonn Artesanal                  | +573166110413 |
| montalvotalaiguaarelys@gmail.com | Arelys Montalvo         | Taller de tejeduría en caña flecha | +573024846623 |
| tejeduriamontalvo@gmail.com      | Marcial Montalvo        | Taller de Tejeduría en Caña Flecha | +573134678418 |
| ... (17 artesanos en total)      |

**Contraseña para todos:** `Telar123!`

## ⚠️ Importante

- El script usa **transacciones**, si algo falla hace **rollback automático**
- Los emails deben ser únicos (el script falla si ya existe el usuario)
- La contraseña es la misma para todos: `Telar123!`
- Los artesanos deberán cambiar su contraseña en el primer login

## 🛠️ Configuración de BD

El script lee las credenciales del archivo `.env` en la raíz del proyecto API:

```env
HOST_DB=localhost
PORT_DB=5432
USER_DB=admin
PASS_DB=admin
NAME_DB=telar_1707_1
```

## 🔍 Troubleshooting

### Error: "No se encontró el perfil de referencia"

Verifica que existe el registro con ID `620fd05f-7dc9-4ebe-b3e5-8283e5d7f96a` en `artisans_knowledge.artisans_identity_profile`

### Error: "Email ya existe"

El artesano ya fue registrado. Puedes:

1. Eliminar el registro anterior
2. Comentar ese artesano del array de datos

### Error de conexión a BD

Verifica las credenciales en el `.env` y que la BD esté corriendo.

## 📞 Soporte

Si tienes problemas, revisa los logs del script que muestran cada paso en detalle.
