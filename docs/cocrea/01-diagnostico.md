# CO-CREA · Diagnóstico

Generado por `apps/api/scripts/cocrea-completitud/01-diagnostico.ts` contra **prod**.
Convenio `CO-CREA` (`b7a6d812-5dd7-4d7b-bec4-687d65234f4f`).

Sin datos personales: el detalle por tienda queda en `state/diagnostico.json`, que no se versiona.

## Resumen

**16 de 73** tiendas cumplen hoy la meta del convenio (publicada + identidad artesanal + ≥1 producto).

| Métrica | Tiendas | % |
|---|---:|---:|
| Total en el convenio | 73 | 100% |
| publishStatus = published | 25 | 34% |
| active = true | 73 | 100% |
| marketplaceApproved = true | 45 | 62% |
| artisanProfileCompleted = true | 17 | 23% |
| Con ≥1 producto (cualquier estado) | 23 | 32% |
| Con ≥1 producto aprobado | 12 | 16% |
| **Cumplen la meta** | 16 | 22% |
| logoUrl | 17 | 23% |
| bannerUrl | 8 | 11% |
| brandClaim | 17 | 23% |
| description | 71 | 97% |
| story | 35 | 48% |
| aboutContent con contenido | 0 | 0% |
| contactConfig con contenido | 13 | 18% |
| Políticas/FAQ enlazadas | 0 | 0% |
| department | 0 | 0% |
| municipality | 0 | 0% |
| bankDataStatus = complete | 15 | 21% |
| idContraparty (Cobre) | 0 | 0% |

## Productos

110 productos en el convenio, repartidos en 23 tiendas.

| Estado | Productos |
|---|---:|
| `approved` | 84 |
| `draft` | 26 |

> `GET /products-new?agreementId=` **sin** parámetro `status` devuelve sólo los aprobados.
> Los borradores hay que pedirlos aparte; si no, se subestima cuántas tiendas tienen producto.

## Qué falta, por concepto

| Falta | Tiendas |
|---|---:|
| identidad artesanal | 56 |
| producto | 50 |
| publicar | 48 |
| logo | 56 |
| aboutContent | 73 |
| políticas/FAQ | 73 |
| contacto | 60 |
| brandClaim | 56 |
| ubicación | 73 |

## Sobre el "90 vs 77" del brief

El brief de entrada hablaba de 90 registros en base de datos contra 77 en el dashboard.
Ninguno de los dos números corresponde a las tiendas del convenio: hoy son **73**.

La explicación más probable es que se estuvieran comparando dos cosas distintas:
`artesanos.artisan_profile` cuenta **personas registradas**, mientras que el dashboard
cuenta **tiendas**. El registro (`auth.service.ts`) crea usuario y perfil pero **no**
crea tienda — esa se crea después, en el onboarding. Toda persona que se registró y
nunca terminó el onboarding suma en un lado y no en el otro.

Confirmarlo requiere consultar la base directamente; la API no expone un conteo de
perfiles por convenio.
