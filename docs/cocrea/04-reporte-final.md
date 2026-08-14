# CO-CREA · Reporte final

Generado por `apps/api/scripts/cocrea-completitud/05-reporte.ts` contra **local**.

## Resultado

| | Tiendas |
|---|---:|
| En el convenio | 55 |
| Cumplían la meta al empezar | 16 de 55 |
| **Cumplen la meta ahora** | **23** |
| Meta | 80 |

⚠️ Faltan **57** tiendas para la meta.

"Cumplir la meta" es: tienda publicada + identidad artesanal completa + al menos un producto.

## Qué hizo esta corrida

| Acción | Artesanos |
|---|---:|
| Cuentas creadas | 0 |
| Correos verificados sin intervención | 0 |
| Tiendas creadas | 0 |
| Identidad artesanal completada | 38 |
| Políticas y FAQ | 39 |
| Logo | 0 |
| Productos creados | 0 |
| Tiendas publicadas | 30 |
| **Con algún error** | **39** |

### Errores

El detalle lleva correos, así que está en `state/ledger.local.json`. Por tipo:

- imágenes de tienda: 39
- producto: 32

## Credenciales

`state/credenciales.csv` — correo, contraseña, si el correo es un alias, y la tienda.
**No se versiona**: lleva datos personales y contraseñas.

Todas las cuentas nuevas usan `Telar123!`. No es `telar123` porque `RegisterDto`
exige mayúscula, minúscula, dígito y carácter especial, y la API rechaza la otra con un 400.
El correo queda verificado, así que el artesano puede entrar y cambiarla sin pasos previos.

## Lo que quedó fuera, a propósito

- **Datos bancarios.** `bankDataStatus` e `idContraparty` no se tocan: los pone el artesano.
- **Las tiendas que ya cumplían.** No se les modificó ningún campo.
- **Cualquier campo con contenido.** El parche sólo rellena huecos; lo que el artesano escribió gana.

## Advertencias para quien reciba esto

- Los productos se crearon con **stock 0**: son piezas representativas, no están a la venta. Aparecen en el marketplace porque están aprobados y la tienda publicada.
- Las cédulas del rango `99000000xx` y los teléfonos `+5739xxxxxxxx` son **sintéticos**: el Excel no traía el dato. Hay que reemplazarlos cuando el equipo consiga los reales.
- Algunos municipios son la **capital del departamento**, no el municipio real, porque el Excel lo traía mal escrito o fuera del catálogo DANE. Están listados en `docs/cocrea/03-contenido.md`.
