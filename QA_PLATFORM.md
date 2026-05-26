# QA Integral — Plataforma Telar

**Versión:** 1.0 | **Fecha:** 2026-05-22 | **Rama base:** main

## Convenciones

| Símbolo | Significado |
|---------|-------------|
| 🔴 | Prioridad Alta — bloquea flujo principal |
| 🟡 | Prioridad Media — impacta experiencia |
| 🟢 | Prioridad Baja — mejora / edge case |
| ✅ | Pasa |
| ❌ | Falla |
| ⏸ | Bloqueado |
| ⬜ | Sin probar |

---

## HITO 1 — Registro y Autenticación

### 1.1 Comprador (marketplace-web)

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| M-AUTH-01 | Registro con email nuevo | Sin cuenta | Ir a /auth → Registrarse → llenar nombre, email, contraseña → Enviar | Cuenta creada, recibe email de verificación, redirige al inicio | 🔴 | ⬜ |
| M-AUTH-02 | Verificación de email | Registro previo | Abrir link del email de verificación | Email marcado como verificado, puede acceder a perfil | 🔴 | ⬜ |
| M-AUTH-03 | Login con email y contraseña | Cuenta verificada | Ir a /auth → Login → email + contraseña | Accede con sesión activa, navbar muestra avatar/nombre | 🔴 | ⬜ |
| M-AUTH-04 | Login con Google OAuth | Sin cuenta o con cuenta | Clic en "Continuar con Google" → seleccionar cuenta | Sesión iniciada, perfil creado/vinculado | 🟡 | ⬜ |
| M-AUTH-05 | Recuperación de contraseña | Cuenta existente | /auth → "Olvidé mi contraseña" → email → link → nueva contraseña | Contraseña actualizada, puede hacer login | 🔴 | ⬜ |
| M-AUTH-06 | Login con contraseña incorrecta | Cuenta existente | Ingresar contraseña equivocada | Mensaje de error claro, sin acceso | 🟡 | ⬜ |
| M-AUTH-07 | Registro con email duplicado | Email ya registrado | Intentar registrar el mismo email | Error indicando que el email ya existe | 🟡 | ⬜ |
| M-AUTH-08 | Persistencia de sesión | Sesión activa | Recargar página o abrir nueva pestaña | Sigue autenticado (token en localStorage) | 🔴 | ⬜ |
| M-AUTH-09 | Cierre de sesión | Sesión activa | Menú de usuario → "Cerrar sesión" | Token eliminado, redirige al inicio, sin acceso a rutas protegidas | 🔴 | ⬜ |

### 1.2 Artesano (artisans-web)

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| A-AUTH-01 | Registro como artesano | Sin cuenta | /register → llenar datos → enviar | Cuenta creada con rol ARTISAN, recibe email de bienvenida | 🔴 | ⬜ |
| A-AUTH-02 | Login artesano | Cuenta verificada | /login → credenciales | Accede al dashboard de artesano, sidebar con navegación correcta | 🔴 | ⬜ |
| A-AUTH-03 | Acceso sin autenticación a ruta protegida | Sin sesión | Navegar directo a /dashboard | Redirige a login (ProtectedRoute) | 🔴 | ⬜ |
| A-AUTH-04 | Artesano intenta acceder a backoffice | Rol ARTISAN | Navegar a /backoffice | Redirige o muestra error de acceso denegado | 🔴 | ⬜ |

### 1.3 Moderador / Admin

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| MOD-AUTH-01 | Login de moderador | Cuenta con rol MODERATOR | Ir a login de moderación → credenciales | Accede a vista de moderación, sin acceso a config de artesanos | 🔴 | ⬜ |
| ADMIN-AUTH-01 | Login de admin | Cuenta con rol ADMIN | Login → backoffice | Accede a /backoffice con todas las secciones disponibles | 🔴 | ⬜ |
| ADMIN-AUTH-02 | Super Admin login | Campo is_super_admin = true | Login → backoffice | Acceso completo con privilegios adicionales | 🟡 | ⬜ |

---

## HITO 2 — Onboarding del Artesano

### 2.1 Creación de tienda

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| ONBOARD-01 | Crear tienda nueva | Artesano sin tienda | Dashboard → "Crear tienda" → llenar nombre, descripción | Tienda creada en estado borrador, acceso al dashboard de tienda | 🔴 | ⬜ |
| ONBOARD-02 | Wizard de marca (IntelligentBrandWizard) | Tienda creada | Config → Marca → completar nombre, claim, colores | Marca guardada, se refleja en vista pública de tienda | 🟡 | ⬜ |
| ONBOARD-03 | Upload de logo | Tienda creada | Config → Logo → subir imagen (PNG/JPG) | Logo guardado en S3, visible en shop y marketplace | 🔴 | ⬜ |
| ONBOARD-04 | Configurar hero/slider | Tienda creada | Config → Hero → subir imagen principal | Hero visible en página pública de la tienda | 🟡 | ⬜ |
| ONBOARD-05 | Datos de contacto | Tienda creada | Config → Contacto → email, teléfono, dirección | Datos guardados, visibles en perfil público | 🟡 | ⬜ |
| ONBOARD-06 | Redes sociales | Tienda creada | Config → Redes → Instagram, Facebook, etc. | Links guardados y funcionales en perfil público | 🟢 | ⬜ |
| ONBOARD-07 | Datos bancarios (Cobre) | Tienda creada | Config → Datos bancarios → idContraparty | BankDataStatus cambia a PENDING, admin puede aprobar | 🔴 | ⬜ |
| ONBOARD-08 | Configuración de envíos | Tienda creada | Config → Envíos → zonas, tiempos, método | Configuración guardada, usada en checkout | 🔴 | ⬜ |
| ONBOARD-09 | Políticas de tienda | Tienda creada | Config → Políticas → devoluciones, despacho | Políticas guardadas y visibles para compradores | 🟡 | ⬜ |

### 2.2 Perfil del artesano

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| ONBOARD-10 | Historia de origen (artisan-origin) | Artesano registrado | Perfil → Historia → llenar origen, significado cultural | Historia guardada, visible en perfil público | 🟡 | ⬜ |
| ONBOARD-11 | Foto de perfil del artesano | Artesano registrado | Perfil → Foto → subir imagen | Foto guardada y visible en marketplace y tienda | 🟡 | ⬜ |
| ONBOARD-12 | Ubicación / territorio | Artesano registrado | Perfil → Territorio → seleccionar municipio/región | Territorio guardado, artesano aparece en /territorios | 🟡 | ⬜ |

---

## HITO 3 — Gestión de Productos

### 3.1 Creación de producto

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| PROD-01 | Crear producto básico | Tienda configurada | Inventario → "Crear producto" → nombre, descripción, precio | Producto creado en estado DRAFT | 🔴 | ⬜ |
| PROD-02 | Upload de imágenes | Producto en borrador | Editor → Imágenes → subir mínimo 3 fotos | Imágenes subidas a S3 y asociadas al producto | 🔴 | ⬜ |
| PROD-03 | Asignar categoría | Producto en borrador | Editor → Categoría → seleccionar de lista | Categoría asignada, visible en filtros del marketplace | 🔴 | ⬜ |
| PROD-04 | Asignar materiales | Producto en borrador | Editor → Materiales → seleccionar uno o más | Materiales asignados correctamente | 🟡 | ⬜ |
| PROD-05 | Asignar técnicas artesanales | Producto en borrador | Editor → Técnicas → seleccionar | Técnicas asignadas, producto aparece en /tecnicas | 🟡 | ⬜ |
| PROD-06 | Asignar oficio (craft) | Producto en borrador | Editor → Oficio → seleccionar | Oficio/craft principal asignado | 🟡 | ⬜ |
| PROD-07 | Especificaciones físicas | Producto en borrador | Editor → Specs → dimensiones, peso | Datos guardados, usados en cotización de envío | 🟡 | ⬜ |
| PROD-08 | Crear variantes (talla, color, etc.) | Producto base guardado | Editor → Variantes → agregar variante con SKU y precio | Variante creada, visible en selector de producto | 🔴 | ⬜ |
| PROD-09 | Gestión de inventario | Producto con variantes | Inventario → ajustar cantidad | Stock actualizado, reflejado en disponibilidad | 🔴 | ⬜ |
| PROD-10 | Enviar a moderación | Producto completo | Editor → "Enviar a revisión" | Estado cambia de DRAFT a PENDING_MODERATION | 🔴 | ⬜ |

### 3.2 Edición y reenvío

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| PROD-11 | Editar producto aprobado | Producto APPROVED | Editar campo y guardar | Puede editar sin cambiar estado (depende de política) | 🟡 | ⬜ |
| PROD-12 | Reenviar tras cambios solicitados | Producto CHANGES_REQUESTED | Artesano edita → "Reenviar a revisión" | Estado vuelve a PENDING_MODERATION | 🔴 | ⬜ |
| PROD-13 | Producto con menos de 3 imágenes | Borrador sin imágenes suficientes | Intentar enviar a moderación | Sistema advierte o bloquea sin mínimo de imágenes | 🟡 | ⬜ |
| PROD-14 | Ver analytics de producto | Producto publicado | ProductAnalyticsPage → ver métricas | Muestra vistas, favoritos, ventas por producto | 🟡 | ⬜ |

---

## HITO 4 — Moderación y Aprobación

### 4.1 Cola de moderación de productos

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| MOD-01 | Ver cola de moderación | Moderador logueado | ModerationPage → tab Productos | Lista de productos en PENDING_MODERATION ordenados por score de prioridad | 🔴 | ⬜ |
| MOD-02 | Score de prioridad correcto | Productos con distintas fechas y estados | Ver orden en la cola | Productos más antiguos y reenvíos tienen mayor prioridad | 🟡 | ⬜ |
| MOD-03 | Filtrar por estado | Cola cargada | Filtros → seleccionar "changes_requested" | Lista muestra solo productos en ese estado | 🟡 | ⬜ |
| MOD-04 | Filtrar por categoría | Cola cargada | Filtros → categoría específica | Lista reducida a esa categoría | 🟡 | ⬜ |
| MOD-05 | Buscar producto en cola | Cola cargada | Búsqueda por nombre o artesano | Resultados filtrados correctamente | 🟡 | ⬜ |
| MOD-06 | Aprobar producto | Producto PENDING_MODERATION | Revisar producto → clic "Aprobar" | Estado cambia a APPROVED, artesano notificado, historial registrado | 🔴 | ⬜ |
| MOD-07 | Rechazar producto | Producto PENDING_MODERATION | Revisar → clic "Rechazar" → agregar comentario | Estado cambia a REJECTED, artesano notificado con razón | 🔴 | ⬜ |
| MOD-08 | Solicitar cambios | Producto PENDING_MODERATION | Revisar → "Solicitar cambios" → comentario | Estado cambia a CHANGES_REQUESTED, artesano notificado | 🔴 | ⬜ |
| MOD-09 | Aprobar con ediciones (moderador edita) | Producto PENDING_MODERATION | Revisar → editar campo → "Aprobar con ediciones" | Estado APPROVED_WITH_EDITS, historial registra cambios hechos | 🟡 | ⬜ |
| MOD-10 | Ver historial de moderación del producto | Producto con historial | ModerationHistory → abrir producto | Muestra cadena de decisiones con fechas y moderador | 🟡 | ⬜ |
| MOD-11 | Producto aprobado visible en marketplace | Producto APPROVED + tienda PUBLISHED | Ir a marketplace-web y buscar | Producto aparece en búsqueda y categorías | 🔴 | ⬜ |
| MOD-12 | Producto rechazado no visible | Producto REJECTED | Buscar en marketplace | Producto NO aparece en ninguna búsqueda ni filtro | 🔴 | ⬜ |

### 4.2 Moderación de tiendas

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| MOD-SHOP-01 | Ver cola de tiendas | Moderador logueado | ModerationPage → tab Tiendas | Lista de tiendas pendientes con info de completitud | 🔴 | ⬜ |
| MOD-SHOP-02 | Score comercial de tienda | Tiendas con distintos estados | Ver puntuación en cola | Tiendas con datos bancarios y más productos aprobados tienen mayor score | 🟡 | ⬜ |
| MOD-SHOP-03 | Aprobar tienda para marketplace | Tienda con ≥5 productos aprobados + datos bancarios | Revisar tienda → "Aprobar para marketplace" | marketplace_approved = true, tienda live en /tiendas | 🔴 | ⬜ |
| MOD-SHOP-04 | Rechazar tienda | Tienda incompleta | Revisar → "Rechazar" + motivo | marketplace_approved queda false, artesano notificado | 🔴 | ⬜ |
| MOD-SHOP-05 | Acciones bulk de tiendas | Múltiples tiendas seleccionadas | Seleccionar varias → acción masiva | Acción aplicada a todas las seleccionadas | 🟢 | ⬜ |
| MOD-SHOP-06 | Tienda sin datos bancarios no puede aprobarse | BankDataStatus = NOT_SET | Intentar aprobar | Bloqueo o advertencia de que faltan datos bancarios | 🔴 | ⬜ |
| MOD-SHOP-07 | Historial de moderación de tienda | Tienda con decisiones previas | Ver historial del shop | Muestra log de aprobaciones/rechazos con fechas | 🟡 | ⬜ |

---

## HITO 5 — Marketplace Público (Comprador)

### 5.1 Homepage y navegación general

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| MKTPLACE-01 | Homepage carga correctamente | - | Visitar raíz del dominio | CMS renderiza secciones: hero, featured products, artisans, etc. | 🔴 | ⬜ |
| MKTPLACE-02 | Navbar visible y funcional | - | Ver navbar en desktop y mobile | Links de categorías, búsqueda, carrito, perfil funcionan | 🔴 | ⬜ |
| MKTPLACE-03 | Menú mobile | Viewport < 768px | Abrir hamburger menu | MobileMenu muestra todas las secciones correctamente | 🟡 | ⬜ |
| MKTPLACE-04 | Footer con links funcionales | - | Scroll al pie → clic en links | Terms, Privacy, About, Help navegan correctamente | 🟢 | ⬜ |

### 5.2 Exploración y búsqueda

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| MKTPLACE-05 | Búsqueda semántica | Productos publicados | Barra de búsqueda → "bolso de cuero" | Resultados relevantes usando búsqueda semántica | 🔴 | ⬜ |
| MKTPLACE-06 | Explorar por categoría | Categorías con productos | /categorias → seleccionar una | Grid de productos filtrados por categoría | 🔴 | ⬜ |
| MKTPLACE-07 | Filtros en exploración | /explorar | Filtrar por precio, técnica, material, región | Productos actualizados al aplicar cada filtro | 🔴 | ⬜ |
| MKTPLACE-08 | Explorar tiendas | Tiendas publicadas | /tiendas | Grid de shops con logo, nombre, descripción | 🟡 | ⬜ |
| MKTPLACE-09 | Ver técnicas artesanales | - | /tecnicas | Lista de técnicas con historias asociadas | 🟢 | ⬜ |
| MKTPLACE-10 | Ver territorios | - | /territorios | Mapa o lista de regiones con artesanos | 🟢 | ⬜ |
| MKTPLACE-11 | Ver blog/historias | - | /historias, /blog | Artículos renderizados correctamente | 🟢 | ⬜ |

### 5.3 Detalle de producto

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| PROD-DETAIL-01 | Abrir detalle de producto | Producto APPROVED + tienda PUBLISHED | Clic en producto desde cualquier lista | Página carga con galería, descripción, precio, variantes | 🔴 | ⬜ |
| PROD-DETAIL-02 | Selector de variantes | Producto con variantes | Clic en variante (talla/color) | Precio e imagen actualiza al seleccionar variante | 🔴 | ⬜ |
| PROD-DETAIL-03 | Ajustar cantidad | Detalle de producto | Botones +/- de cantidad | Cantidad dentro del stock disponible, sin exceder máximo | 🟡 | ⬜ |
| PROD-DETAIL-04 | Agregar a carrito desde detalle | Producto disponible | Seleccionar variante → "Agregar al carrito" | Item añadido, badge del carrito en navbar actualiza | 🔴 | ⬜ |
| PROD-DETAIL-05 | Agregar a wishlist | Sesión activa | Clic en corazón/guardar | Producto guardado en /wishlist del usuario | 🟡 | ⬜ |
| PROD-DETAIL-06 | Info del artesano en detalle | - | Ver sección de artesano en la página | Foto, nombre, historia, link a tienda del artesano | 🟡 | ⬜ |
| PROD-DETAIL-07 | Producto sin stock | Variante con stock = 0 | Ver variante agotada | Botón "Agregar al carrito" deshabilitado, texto "Agotado" | 🔴 | ⬜ |
| PROD-DETAIL-08 | Reseñas del producto | Producto con compras previas | Ver sección reseñas | Lista de ratings y comentarios de compradores | 🟡 | ⬜ |

### 5.4 Perfil de artesano y tienda

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| SHOP-01 | Página de tienda pública | Tienda PUBLISHED | /tiendas/[slug] | Hero, logo, descripción, productos del artesano visibles | 🔴 | ⬜ |
| SHOP-02 | Artisan profile | Artesano con perfil completo | /artesanos/[id] | Historia, foto, mapa de territorio, productos, link a tienda | 🟡 | ⬜ |
| SHOP-03 | Guardar tienda favorita | Sesión activa | Clic en "Guardar tienda" | Tienda añadida a /tiendas-favoritas | 🟢 | ⬜ |

---

## HITO 6 — Flujo de Compra

### 6.1 Carrito de compras

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| CART-01 | Ver carrito con ítems | Producto añadido | Ir a /carrito | Lista de ítems con imagen, nombre, variante, precio, cantidad | 🔴 | ⬜ |
| CART-02 | Cambiar cantidad en carrito | Ítem en carrito | Botones +/- en cantidad | Cantidad y subtotal actualizan correctamente | 🔴 | ⬜ |
| CART-03 | Eliminar ítem del carrito | Ítem en carrito | Clic en eliminar / X | Ítem removido, total recalculado | 🔴 | ⬜ |
| CART-04 | Carrito vacío | Sin ítems | Ir a /carrito | Mensaje de carrito vacío + CTA para explorar | 🟡 | ⬜ |
| CART-05 | Productos de múltiples tiendas | Ítems de 2+ tiendas | Ver carrito | Agrupados por tienda, totales por tienda y global | 🟡 | ⬜ |
| CART-06 | Botón "Ir a pagar" | Carrito con ítems | Clic en "Ir a pagar" | Navega al flujo de checkout correctamente | 🔴 | ⬜ |

### 6.2 Checkout

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| CHECKOUT-01 | Crear sesión de checkout | Carrito activo | Iniciar checkout | POST /checkouts exitoso, sesión creada con estado CREATED | 🔴 | ⬜ |
| CHECKOUT-02 | Ingresar dirección nueva | Sin dirección guardada | Checkout → llenar ciudad (DANE), barrio, calle | Dirección guardada, municipio validado con datos DANE | 🔴 | ⬜ |
| CHECKOUT-03 | Seleccionar dirección guardada | Dirección previa | Checkout → seleccionar de lista | Dirección seleccionada, listo para cotizar envío | 🔴 | ⬜ |
| CHECKOUT-04 | Cotización de envío (Servientrega) | Dirección seleccionada + producto con peso/dims | Ver opciones de envío | Muestra costo y tiempo estimado de Servientrega | 🔴 | ⬜ |
| CHECKOUT-05 | Recogida en tienda | Tienda con opción habilitada | Seleccionar "Recoger en tienda" | Costo de envío = 0, instrucciones de recogida visibles | 🟡 | ⬜ |
| CHECKOUT-06 | Resumen de orden antes de pago | Paso final de checkout | Ver resumen | Productos, cantidades, subtotal, envío, total en COP | 🔴 | ⬜ |
| CHECKOUT-07 | Aplicar gift card | Gift card con saldo | Ingresar código → aplicar | Descuento aplicado, total reducido correctamente | 🟡 | ⬜ |

### 6.3 Pago

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| PAY-01 | Seleccionar Wompi | Checkout listo | Seleccionar Wompi → "Pagar" | Redirige a pasarela Wompi con monto correcto | 🔴 | ⬜ |
| PAY-02 | Seleccionar Cobre | Checkout listo | Seleccionar Cobre → "Pagar" | Redirige a pasarela Cobre correctamente | 🔴 | ⬜ |
| PAY-03 | Pago exitoso vía Wompi | En pasarela Wompi | Completar pago con tarjeta de prueba | Webhook recibido → orden CREATED, checkout PAID, redirige a /orden-confirmada/:id | 🔴 | ⬜ |
| PAY-04 | Pago exitoso vía Cobre | En pasarela Cobre | Completar pago | Webhook recibido → mismo flujo que Wompi | 🔴 | ⬜ |
| PAY-05 | Pago fallido | En pasarela | Cancelar o usar tarjeta inválida | Checkout FAILED, usuario regresa a checkout con mensaje de error | 🔴 | ⬜ |
| PAY-06 | Página de pago pendiente | Pago en proceso | PaymentPending page | Spinner de espera, mensaje claro de procesando pago | 🟡 | ⬜ |
| PAY-07 | Página de confirmación de orden | Pago exitoso | /orden-confirmada/:orderId | Resumen de orden, número de pedido, pasos siguientes | 🔴 | ⬜ |
| PAY-08 | Pago cubierto totalmente con gift card | Gift card con saldo suficiente | Aplicar gift card que cubre total → confirmar | Sin redirect a pasarela, orden creada directamente | 🟡 | ⬜ |
| PAY-09 | Stock decrementado al pagar | Producto con stock = 1 | Comprar último ítem disponible | Stock = 0 tras pago exitoso, variante aparece como agotada | 🔴 | ⬜ |

---

## HITO 7 — Post-Compra y Operaciones

### 7.1 Comprador — Seguimiento de pedidos

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| ORDER-01 | Ver historial de órdenes | Usuario con compras | /mis-pedidos | Lista de órdenes con estado, fecha, total | 🔴 | ⬜ |
| ORDER-02 | Detalle de orden | Orden existente | Clic en orden | Productos, cantidades, envío, estado, número de tracking | 🔴 | ⬜ |
| ORDER-03 | Seguimiento de envío | Orden marcada como enviada | Ver tracking en detalle | Número Servientrega visible, link a seguimiento | 🟡 | ⬜ |
| ORDER-04 | Ver gift cards del usuario | Usuario con gift card | /gift-cards | Saldo disponible, historial de uso | 🟢 | ⬜ |

### 7.2 Artesano — Gestión de ventas

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| SALES-01 | Ver dashboard de ventas | Ventas realizadas | ShopSalesPage | Métricas: revenue total, órdenes, top productos | 🔴 | ⬜ |
| SALES-02 | Ver órdenes recibidas | Orden nueva | ShippingDashboard o lista de órdenes | Nueva orden visible con detalle del comprador y producto | 🔴 | ⬜ |
| SALES-03 | Marcar orden como enviada | Orden PENDING_FULFILLMENT | Ingresar tracking number → marcar enviada | Estado orden actualiza, comprador notificado | 🔴 | ⬜ |
| SALES-04 | Ver analytics por producto | Ventas históricas | ProductAnalyticsPage | Vistas, conversiones, ingresos por producto | 🟡 | ⬜ |
| SALES-05 | Notificación de nueva orden | Venta realizada | Panel de notificaciones | Notificación in-app visible con detalle de la orden | 🟡 | ⬜ |

### 7.3 Admin — Gestión de órdenes y pagos

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| ADMIN-ORDERS-01 | Ver todas las órdenes | Admin logueado | BackofficeOrdenesPage | Todas las órdenes de todas las tiendas con filtros | 🔴 | ⬜ |
| ADMIN-ORDERS-02 | Ver estado de pagos | Admin logueado | BackofficePagosPage | Estado de pagos de Cobre/Wompi por orden | 🔴 | ⬜ |
| ADMIN-ORDERS-03 | Conciliación de pago | Webhook recibido | Ver payment_intents y attempts | Estados reflejan la realidad de la pasarela de pago | 🟡 | ⬜ |

---

## HITO 8 — Backoffice y Administración

### 8.1 Dashboard de admin

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| BACK-01 | Dashboard principal | Admin logueado | /backoffice | Métricas clave: tiendas activas, órdenes, revenue, salud | 🔴 | ⬜ |
| BACK-02 | Marketplace health | Admin | BackofficeMarketplaceHealthPage | Indicadores de salud: % tiendas aprobadas, productos, etc. | 🟡 | ⬜ |
| BACK-03 | Gestión de tiendas | Admin | BackofficeTiendasPage | Lista de todas las tiendas con estado, filtros | 🔴 | ⬜ |
| BACK-04 | Detalle de tienda | Admin | BackofficeTiendaDetailPage | Info completa: productos, ventas, artesano, historial | 🟡 | ⬜ |

### 8.2 Taxonomía y catálogo

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| TAXO-01 | Gestión de categorías | Admin | BackofficeTaxonomiaPage | CRUD de categorías disponibles para artesanos | 🟡 | ⬜ |
| TAXO-02 | Gestión de oficios/crafts | Admin | Taxonomía → Oficios | CRUD de oficios artesanales | 🟡 | ⬜ |
| TAXO-03 | Gestión de materiales | Admin | Taxonomía → Materiales | CRUD de materiales | 🟡 | ⬜ |
| TAXO-04 | Gestión de técnicas | Admin | Taxonomía → Técnicas | CRUD de técnicas artesanales | 🟡 | ⬜ |
| TAXO-05 | Aliases de taxonomía | Admin | Aliases → crear alias | Alias guardado, productos con alias agrupados correctamente | 🟢 | ⬜ |
| TAXO-06 | Colecciones editoriales | Admin | Colecciones → crear/editar | Colección visible en marketplace | 🟡 | ⬜ |
| TAXO-07 | Colecciones featured | Admin | Featured Collections → asignar | Aparecen en homepage según configuración CMS | 🟡 | ⬜ |

### 8.3 CMS y contenido

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| CMS-01 | Editor de CMS | Admin | BackofficeCmsPage | Puede editar secciones de homepage y guardar cambios | 🟡 | ⬜ |
| CMS-02 | Blog posts | Admin | BlogPostsAdminPage | CRUD de artículos de blog funcional | 🟡 | ⬜ |
| CMS-03 | Cambio CMS reflejado en homepage | Edición publicada | Visitar marketplace-web homepage | Sección actualizada visible para usuarios | 🟡 | ⬜ |

### 8.4 Cupones y convenios

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| COUP-01 | Crear cupón | Admin | BackofficeCuponesPage → crear | Cupón con código, descuento, fechas creado correctamente | 🟡 | ⬜ |
| CONV-01 | Ver convenios | Admin | BackofficeConveniosPage | Lista de convenios activos con info completa | 🟢 | ⬜ |

### 8.5 Auditoría

| ID | Caso de prueba | Precondiciones | Pasos | Resultado esperado | P | Estado |
|----|----------------|----------------|-------|-------------------|---|--------|
| AUDIT-01 | Logs de auditoría | Admin | BackofficeAuditoriaPage | Registro de acciones con usuario, timestamp, acción | 🟡 | ⬜ |
| AUDIT-02 | Historial de moderación | Productos moderados | Ver historial | Cadena completa de decisiones append-only e inmutable | 🟡 | ⬜ |

---

## Checklist de regresión rápida (Smoke Test)

Para validar que una release no rompe los flujos críticos antes de deploy:

- [ ] Homepage carga en menos de 3 segundos
- [ ] Login de comprador funciona
- [ ] Login de artesano funciona
- [ ] Login de moderador funciona
- [ ] Producto APPROVED en tienda PUBLISHED es visible en marketplace
- [ ] Agregar al carrito funciona y badge actualiza
- [ ] Checkout llega correctamente a pasarela de pago
- [ ] Cola de moderación carga con productos pendientes
- [ ] Moderador puede aprobar un producto y estado cambia
- [ ] Artesano puede ver su dashboard y sus ventas

---

## Ambientes de prueba

| Ambiente | Marketplace | Artesanos/Admin | Propósito |
|----------|-------------|-----------------|-----------|
| Local | localhost:5173 | localhost:5174 | Desarrollo |
| Stage | stage.telar.co | stage-artisans.telar.co | QA e integración |
| Prod | telar.co | artisans.telar.co | Validación final |

## Datos de prueba recomendados

| Tipo | Descripción |
|------|-------------|
| Tarjeta Wompi test | 4242 4242 4242 4242 — exp 12/30 — CVV 123 |
| Artesano de prueba | Cuenta con tienda configurada y ≥5 productos en borrador |
| Producto completo | Con 3+ imágenes, categoría, materiales, especificaciones físicas |
| Gift card activa | Código con saldo > 0 en ambiente de prueba |

---

*QA v1.0 — Telar 2026 — Actualizar con cada sprint o release*
