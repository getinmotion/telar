# CO-CREA · Diagnóstico

Generado por `apps/api/scripts/cocrea-completitud/01-diagnostico.ts` contra **local**.
Convenio `CO-CREA` (`b7a6d812-5dd7-4d7b-bec4-687d65234f4f`).

Sin datos personales: el detalle por tienda queda en `state/diagnostico.json`, que no se versiona.

## Resumen

**18 de 75** tiendas cumplen hoy la meta del convenio (publicada + identidad artesanal + ≥1 producto).

| Métrica | Tiendas | % |
|---|---:|---:|
| Total en el convenio | 75 | 100% |
| publishStatus = published | 74 | 99% |
| active = true | 75 | 100% |
| marketplaceApproved = true | 74 | 99% |
| artisanProfileCompleted = true | 20 | 27% |
| Con ≥1 producto (cualquier estado) | 25 | 33% |
| Con ≥1 producto aprobado | 12 | 16% |
| **Cumplen la meta** | 18 | 24% |
| logoUrl | 18 | 24% |
| bannerUrl | 8 | 11% |
| brandClaim | 18 | 24% |
| description | 73 | 97% |
| story | 37 | 49% |
| aboutContent con contenido | 0 | 0% |
| contactConfig con contenido | 14 | 19% |
| Políticas/FAQ enlazadas | 0 | 0% |
| department | 0 | 0% |
| municipality | 0 | 0% |
| bankDataStatus = complete | 17 | 23% |
| idContraparty (Cobre) | 0 | 0% |

## Productos

117 productos en el convenio, repartidos en 25 tiendas.

| Estado | Productos |
|---|---:|
| `approved` | 88 |
| `draft` | 29 |

> `GET /products-new?agreementId=` **sin** parámetro `status` devuelve sólo los aprobados.
> Los borradores hay que pedirlos aparte; si no, se subestima cuántas tiendas tienen producto.

## Qué falta, por concepto

| Falta | Tiendas |
|---|---:|
| identidad artesanal | 55 |
| producto | 50 |
| publicar | 1 |
| logo | 57 |
| aboutContent | 75 |
| políticas/FAQ | 75 |
| contacto | 61 |
| brandClaim | 57 |
| ubicación | 75 |

## Sobre el "90 vs 77" del brief

El brief de entrada hablaba de 90 registros en base de datos contra 77 en el dashboard.
Ninguno de los dos números corresponde a las tiendas del convenio: hoy son **75**.

La explicación más probable es que se estuvieran comparando dos cosas distintas:
`artesanos.artisan_profile` cuenta **personas registradas**, mientras que el dashboard
cuenta **tiendas**. El registro (`auth.service.ts`) crea usuario y perfil pero **no**
crea tienda — esa se crea después, en el onboarding. Toda persona que se registró y
nunca terminó el onboarding suma en un lado y no en el otro.

Confirmarlo requiere consultar la base directamente; la API no expone un conteo de
perfiles por convenio.
