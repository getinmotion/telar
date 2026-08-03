# CO-CREA · Clasificación

Generado por `apps/api/scripts/cocrea-completitud/02-cruce.ts` contra **prod**.
Fuente: `TELAR Cruce 85 vs Cocrea.xlsx` (98 personas) × 73 tiendas del convenio `CO-CREA`.

Sin datos personales: el plan persona a persona está en `state/plan.json`, que no se versiona.

## Qué se hace con cada quien

| Cubeta | Personas | Acción |
|---|---:|---|
| **A · No tocar** | 16 | Ya cumplen la meta. No se les modifica ningún campo. |
| **B · Completar** | 57 | Tienen tienda; se rellenan **sólo los campos vacíos**. |
| **C · Crear** | 23 | No tienen tienda en el convenio; se les crea cuenta, tienda y producto. |
| **D · Revisar a mano** | 21 | Emparejamientos inferidos y duplicados del Excel. |

Techo alcanzable: **96** tiendas (73 existentes + 23 nuevas). Meta: 80. ✅ Alcanzable.

## Cómo se emparejó

Emparejar sólo por correo no sirve: 27 filas del Excel vienen **sin correo**
(los portadores de Viche) y algunas lo traen con typo. Varias de esas personas **sí** tienen
tienda en la BD, así que emparejar por correo las daría por faltantes y crearía cuentas duplicadas.

Se puntúa cada par (persona, tienda) con cuatro señales y se asignan de mayor a menor puntaje,
de forma global — no fila por fila. Esto importa porque dos personas distintas declaran la misma
marca ("Viche Ulaita") y, resolviendo por orden de aparición, la primera se quedaba con la tienda
de la otra.

| Señal | Peso |
|---|---:|
| Correo idéntico | 100 |
| Correo con la misma raíz (typo) | 80 |
| Solapamiento de marca (incluye `artisanProfile.artisticName`) | hasta 40 |
| Nombre de la persona en marca / perfil / correo | 12 por palabra |
| Apellido pegado en la parte local del correo | 10 por apellido |

Resultado: 72 emparejadas (54 por correo idéntico, 18 inferidas),
26 filas del Excel sin tienda, 1 tiendas del convenio que no aparecen en el Excel
(existen y se respetan).

> Buscar la marca también en `artisanProfile.artisticName` no es un detalle: hay tiendas cuyo
> `shopName` es un placeholder ("Telar") y cuya marca real sólo vive en el perfil. Sin eso,
> esas personas se contaban como faltantes.

## Correos para quien no tiene

13 personas no tienen correo en el Excel. Se les asigna un subdireccionamiento del buzón
real de GET IN MOTION: `aloha+<marca>@getinmotion.io`. Llega a un buzón que el equipo controla,
así que la verificación de correo y la recuperación de contraseña funcionan de verdad, y queda
trazado a qué taller corresponde cada uno.

## Advertencias sobre la fuente

- **0 filas traen una "cédula" de 3–4 dígitos** (213, 219, 223…). Son índices de fila, no documentos: `213` se repite en cuatro personas distintas. Muchos teléfonos tienen el mismo corrimiento de columnas. **Esas cédulas no se pueden usar.**
- **36 personas no declaran marca ni taller.** Hay que derivarla del oficio y el territorio.
- 3 pares parecen la misma persona repetida dentro del Excel.

## Duplicados detectados

3 pares. El detalle lleva nombres y correos, así que vive en `state/plan.json` (`duplicados`) y no aquí.

Criterio: se consideran la misma persona si comparten la raíz del correo (ignorando dígitos
y separadores) o **tres** nombres/apellidos. Con dos bastaba para confundir a personas
distintas que comparten un nombre de pila común y un apellido frecuente. De cada par se
conserva la fila que trae correo propio, heredando de la descartada la marca, la cédula,
el municipio y el origen que le falten.
