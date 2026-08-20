# Completitud de tiendas · convenio CO-CREA

Inyección de datos para llevar las tiendas del convenio CO-CREA a estado publicado,
con identidad artesanal y al menos un producto. **No** crea funcionalidades ni toca
el esquema: todo pasa por la API que ya existe.

Convenio: `CO-CREA` · `b7a6d812-5dd7-4d7b-bec4-687d65234f4f` (el mismo id que hornea
el micrositio `cocrea.telar.co`; en `marketplace-web` se llama `VILLA_ADELAIDA_AGREEMENT_ID`).

## Orden

Todo se corre desde `apps/api`. El entorno va como `--target`, no como variable
de entorno: `COCREA_TARGET=prod cmd` es sintaxis de bash y **falla en PowerShell**,
que es donde se trabaja esto (`&&` tampoco existe en PowerShell 5.1).

```
cd apps/api

# 0 · ensayo end-to-end con artesanos de prueba. Nunca contra prod.
npm run cocrea:ensayo -- --target stage --apply

# 1 · fotografía del convenio
npm run cocrea:diagnostico -- --target prod

# 2 · cruce del Excel con la base: quién está, quién falta, quién sobra
npm run cocrea:cruce -- --target prod

# 3 · contenido por tienda (determinista, revisable)
npm run cocrea:contenido -- --target prod

# 4 · inyección. Sin --apply no escribe nada.
npm run cocrea:inyectar -- --target prod
npm run cocrea:inyectar -- --target prod --apply --limite 5

# 5 · reporte final y credenciales
npm run cocrea:reporte -- --target prod
```

El `--` después del nombre del script es de npm: separa los argumentos del script
de los de npm. Sin él, `--target` se lo queda npm y el script no lo ve.

Desde la raíz del repo hay que pasar el prefijo, porque el monorepo **no tiene
`package.json` en la raíz** y npm falla con `ENOENT ... package.json`:

```
npm --prefix apps/api run cocrea:inyectar -- --target prod --apply --limite 5
```

`--target` es `prod`, `stage` o `local` (por defecto `local`). También se acepta
la variable `COCREA_TARGET` si prefieres exportarla.
`COCREA_XLSX` apunta al Excel del padrón; por defecto lo busca en `~/Downloads`.

Banderas de `04-inyectar.ts`: `--apply` (escribe), `--limite N` (N altas y N
completaciones), `--solo-crear`, `--solo-completar`.

El contenido y el entorno tienen que coincidir: `contenido.json` guarda contra qué
entorno se generó y la inyección se detiene si no cuadra, porque los ids de
taxonomía difieren entre entornos y la API respondería un 500 sin explicación.

## Qué NO toca

- Las tiendas que ya cumplen la meta: ni un campo.
- Cualquier campo con contenido. El parche sólo rellena huecos; lo que el artesano
  escribió gana siempre.
- Datos bancarios (`bankDataStatus`, `idContraparty`).

## Reejecutar

`state/ledger.json` registra cada paso cumplido por artesano, así que volver a
correr `--apply` retoma donde quedó en vez de duplicar. El dry-run escribe en
`ledger.dry-run.json` aparte: si volcara sobre el real, marcaría como hechos pasos
que nunca se enviaron y el siguiente `--apply` se los saltaría.

Además, la API colabora: `POST /auth/register` y `POST /artisan-shops` responden
409 si el correo, el teléfono o el slug ya existen, y eso se trata como "ya estaba",
no como fallo.

## Cuenta operador

Completar una tienda ajena exige un JWT (`PATCH /artisan-shops/:id`,
`POST /store-policies-config`) y no tenemos la contraseña de los artesanos ya
registrados. Define en `.env` (no se versiona):

```
COCREA_OPERADOR_EMAIL=...
COCREA_OPERADOR_PASSWORD=...
```

Si no está, se reutiliza el token de una cuenta creada en la misma corrida — por eso
las altas se ejecutan antes que las completaciones. Funciona porque
`PATCH /artisan-shops/:id` **no comprueba la propiedad de la tienda**, sólo que el JWT
sea válido; conviene usar una cuenta operador identificable.

## Datos personales

Todo lo que lleva correos, cédulas o contraseñas vive en `state/`, que está en
`.gitignore`. Los reportes de `docs/cocrea/` son sólo agregados y metodología.

## Cosas de la API que cuesta descubrir

- `GET /products-new?agreementId=` **sin** `status` devuelve sólo los aprobados. Los
  borradores hay que pedirlos aparte o se subestima qué tiendas ya tienen producto.
- La contraseña debe llevar mayúscula, minúscula, dígito y carácter especial.
  `telar123` da 400.
- El correo se puede dejar verificado sin que el artesano haga nada: login (no exige
  correo confirmado) → `POST /email-verifications/generate/:userId` →
  `POST /email-verifications/verify/:token`. El correo de alta sale igual.
- El teléfono es único en `auth.users`: repetirlo da 409.
- Un usuario no puede tener dos tiendas: `POST /artisan-shops` da 409.
- `production` sin `availabilityType` da 400.
- `upsertVariants` borra (soft) las variantes que no vengan en el payload.
- La validación del padrón `users_id_agreement` es **sólo del frontend**;
  `/auth/register` no la aplica.
- `daneCity` sale de `apps/artisans-web/public/ciudades_dane.json`, no de la API.
- Un producto es visible en el marketplace si `status` es `approved` **y** la tienda
  está en `publish_status = 'published'`.

## Pendiente de seguridad (no se toca aquí)

`POST /products-new`, `PATCH /products-new/:id/status` y `POST /file-upload/image` no
llevan guard, y `PATCH /artisan-shops/:id` no comprueba propiedad. Es lo que hace
viable esta inyección y a la vez un agujero: cualquiera puede crear un producto,
aprobarlo y editar la tienda de otro. Merece su propio arreglo.
