# Completitud de tiendas · convenio CO-CREA

Inyección de datos para llevar las tiendas del convenio CO-CREA a estado publicado,
con identidad artesanal y al menos un producto. **No** crea funcionalidades ni toca
el esquema: todo pasa por la API que ya existe.

Convenio: `CO-CREA` · `b7a6d812-5dd7-4d7b-bec4-687d65234f4f` (el mismo id que hornea
el micrositio `cocrea.telar.co`; en `marketplace-web` se llama `VILLA_ADELAIDA_AGREEMENT_ID`).

## Orden

```bash
cd apps/api

# 0 · ensayo end-to-end con artesanos de prueba. Nunca contra prod.
COCREA_TARGET=stage npx ts-node scripts/cocrea-completitud/00-ensayo.ts --apply

# 1 · fotografía del convenio
COCREA_TARGET=prod npx ts-node scripts/cocrea-completitud/01-diagnostico.ts

# 2 · cruce del Excel con la base: quién está, quién falta, quién sobra
COCREA_TARGET=prod npx ts-node scripts/cocrea-completitud/02-cruce.ts

# 3 · contenido por tienda (determinista, revisable)
COCREA_TARGET=prod npx ts-node scripts/cocrea-completitud/03-contenido.ts

# 4 · inyección. Sin --apply no escribe nada.
COCREA_TARGET=prod npx ts-node scripts/cocrea-completitud/04-inyectar.ts
COCREA_TARGET=prod npx ts-node scripts/cocrea-completitud/04-inyectar.ts --apply --limite 5

# 5 · reporte final y credenciales
COCREA_TARGET=prod npx ts-node scripts/cocrea-completitud/05-reporte.ts
```

`COCREA_TARGET` es `prod`, `stage` o `local` (por defecto `local`).
`COCREA_XLSX` apunta al Excel del padrón; por defecto lo busca en `~/Downloads`.

Banderas de `04-inyectar.ts`: `--apply` (escribe), `--limite N` (N altas y N
completaciones), `--solo-crear`, `--solo-completar`.

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
