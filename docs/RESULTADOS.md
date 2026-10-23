# Resultados de Vitest con Chromium

Generado por `npm test`. Última ejecución: 23 de octubre de 2026 a las 3:48 a. m. (America/Santiago).

## Entorno y resultado

- Vitest 5.0.5, Playwright 1.64.1, Node v24.19.0.
- Frontend: **142/142 casos pasaron** en **Chromium 156.0.8078.4 headless**. No se usa Edge, Chrome instalado ni jsdom.
- Servidor: **6/6 casos pasaron** en Vitest con Node.
- Se conservaron los 120 casos originales del frontend y los 6 del servidor. Se verifica su identidad contra `casos-originales.json`; solo se renombra el grupo inicial Karma + Jasmine a Vitest + Chromium.
- Sin casos omitidos ni pendientes. Un caso frontend verifica la configuración; los otros cubren comportamiento de la aplicación.

## Cobertura del frontend

| Métrica | Cobertura | Cubierto / total |
|---|---|---|
| Sentencias | 98.51% | 664 / 674 |
| Ramas | 96.76% | 449 / 464 |
| Funciones | 99.46% | 187 / 188 |
| Líneas | 98.89% | 536 / 542 |

Informe HTML: [frontend](../coverage/frontend/index.html). Umbrales mantenidos: 90% de sentencias, funciones y líneas; 85% de ramas. Si no se alcanzan, la prueba falla. [Alcance y análisis](COBERTURA.md).

## Cobertura del servidor

| Métrica | Cobertura | Cubierto / total |
|---|---|---|
| Sentencias | 80.26% | 61 / 76 |
| Ramas | 78.33% | 47 / 60 |
| Funciones | 100% | 14 / 14 |
| Líneas | 94.33% | 50 / 53 |

Informe HTML: [servidor](../coverage/server/index.html). Se mide por separado; el proyecto anterior no tenía un umbral de cobertura para el servidor.

## Evidencia verificable

- [Resultados frontend](resultados-vitest-chromium.json) y [resultados servidor](resultados-vitest-servidor.json): salida JSON de Vitest con cada caso y su estado.
- [Metadatos de ejecución](resultados-migracion.json): versiones, navegador, cantidades y cobertura.
- Los resultados antiguos de Jasmine/Karma quedan en `historico/jasmine-karma/` y no describen esta ejecución.

## Casos del frontend

| ID | Caso ejecutado | Resultado |
|---|---|---|
| FE-001 | Validaciones administrativas adicionales informa catálogo vacío en vez de permanecer cargando | Pasó |
| FE-002 | Validaciones administrativas adicionales expone y cambia el estado del menú administrativo | Pasó |
| FE-003 | Validaciones administrativas adicionales conserva región y comuna y rechaza RUN incorrecto | Pasó |
| FE-004 | Validaciones administrativas adicionales rechaza stock crítico negativo y avisa cuando el stock es bajo | Pasó |
| FE-005 | Validaciones y límites acepta a@gmail.com | Pasó |
| FE-006 | Validaciones y límites acepta a@duoc.cl | Pasó |
| FE-007 | Validaciones y límites acepta a@profesor.duoc.cl | Pasó |
| FE-008 | Validaciones y límites acepta A@GMAIL.COM | Pasó |
| FE-009 | Validaciones y límites rechaza correo inválido @gmail.com | Pasó |
| FE-010 | Validaciones y límites rechaza correo inválido a b@gmail.com | Pasó |
| FE-011 | Validaciones y límites rechaza correo inválido a@@gmail.com | Pasó |
| FE-012 | Validaciones y límites rechaza correo inválido a@example.com | Pasó |
| FE-013 | Validaciones y límites rechaza correo inválido  | Pasó |
| FE-014 | Validaciones y límites acepta RUN de dígito correcto y rechaza uno alterado | Pasó |
| FE-015 | Validaciones y límites rechaza RUN  | Pasó |
| FE-016 | Validaciones y límites rechaza RUN 12 | Pasó |
| FE-017 | Validaciones y límites rechaza RUN 12.345.678-5 | Pasó |
| FE-018 | Validaciones y límites rechaza RUN abcdefgh | Pasó |
| FE-019 | Validaciones y límites rechaza RUN 123456789012 | Pasó |
| FE-020 | Validaciones y límites rechaza RUN 12345K | Pasó |
| FE-021 | Validaciones y límites exige credenciales | Pasó |
| FE-022 | Validaciones y límites acepta credenciales válidas | Pasó |
| FE-023 | Validaciones y límites rechaza credenciales largas | Pasó |
| FE-024 | Validaciones y límites rechaza dominio y contraseña corta | Pasó |
| FE-025 | Validaciones y límites acepta registro válido | Pasó |
| FE-026 | Validaciones y límites exige campos del registro | Pasó |
| FE-027 | Validaciones y límites rechaza límites de longitud | Pasó |
| FE-028 | Validaciones y límites rechaza RUN y dominio inválidos | Pasó |
| FE-029 | Persistencia y catálogo rechaza JSON corrupto y estructuras distintas de lista | Pasó |
| FE-030 | Persistencia y catálogo guarda y recupera listas | Pasó |
| FE-031 | Persistencia y catálogo rechaza un HTTP fallido | Pasó |
| FE-032 | Persistencia y catálogo rechaza un JSON con estructura incorrecta | Pasó |
| FE-033 | Persistencia y catálogo usa el JSON inicial y luego la edición local | Pasó |
| FE-034 | Persistencia y catálogo crea, impide código duplicado y elimina | Pasó |
| FE-035 | Persistencia y catálogo permite guardar un catálogo vacío | Pasó |
| FE-036 | Persistencia y catálogo crea, normaliza, modifica y elimina cuentas | Pasó |
| FE-037 | Carrito: casos de error y stock descarta objetos JSON y entradas incompletas | Pasó |
| FE-038 | Carrito: casos de error y stock rechaza cantidades fraccionarias, negativas y superiores al stock | Pasó |
| FE-039 | Carrito: casos de error y stock comunica almacenamiento bloqueado | Pasó |
| FE-040 | Navegación, contenido y acceso permite saltar al contenido sin cambiar de ruta | Pasó |
| FE-041 | Navegación, contenido y acceso muestra presentación, módulos y pie de página | Pasó |
| FE-042 | Navegación, contenido y acceso carga el equipo desde JSON | Pasó |
| FE-043 | Navegación, contenido y acceso carga dos noticias y sus fechas | Pasó |
| FE-044 | Navegación, contenido y acceso informa error de red en /nosotros | Pasó |
| FE-045 | Navegación, contenido y acceso informa error de red en /noticias | Pasó |
| FE-046 | Navegación, contenido y acceso informa error de red en / | Pasó |
| FE-047 | Navegación, contenido y acceso renderiza /detalle-blog1 | Pasó |
| FE-048 | Navegación, contenido y acceso renderiza /detalle-blog2 | Pasó |
| FE-049 | Navegación, contenido y acceso renderiza /no-existe | Pasó |
| FE-050 | Navegación, contenido y acceso impide entrar al administrador sin sesión | Pasó |
| FE-051 | Navegación, contenido y acceso muestra el panel y cierra sesión | Pasó |
| FE-052 | Navegación, contenido y acceso limita la gestión de cuentas al administrador | Pasó |
| FE-053 | Navegación, contenido y acceso abre y cierra el menú móvil mediante su botón | Pasó |
| FE-054 | Formularios públicos valida login vacío y rechaza credenciales incorrectas | Pasó |
| FE-055 | Formularios públicos inicia sesión como administrador | Pasó |
| FE-056 | Formularios públicos registra una cuenta que puede iniciar sesión | Pasó |
| FE-057 | Formularios públicos no registra campos vacíos ni un correo repetido | Pasó |
| FE-058 | Formularios públicos valida y limpia el contacto explicando su alcance | Pasó |
| FE-059 | Detalle y pantalla del carrito agrega desde detalle, impide exceder stock y valida cantidades | Pasó |
| FE-060 | Detalle y pantalla del carrito informa un fallo de carga del detalle | Pasó |
| FE-061 | Detalle y pantalla del carrito renderiza relacionados y fallback de id | Pasó |
| FE-062 | Detalle y pantalla del carrito modifica, cancela vaciado, elimina y finaliza compra simulada | Pasó |
| FE-063 | Detalle y pantalla del carrito confirma vaciado y elimina un producto | Pasó |
| FE-064 | Administración persistente lista, cancela y confirma la eliminación de un producto | Pasó |
| FE-065 | Administración persistente crea un producto y lo muestra en el catálogo | Pasó |
| FE-066 | Administración persistente edita un producto existente | Pasó |
| FE-067 | Administración persistente informa id de producto inexistente | Pasó |
| FE-068 | Administración persistente crea una cuenta y vuelve al listado | Pasó |
| FE-069 | Administración persistente edita una cuenta y elimina con confirmación | Pasó |
| FE-070 | Administración persistente impide correos duplicados | Pasó |
| FE-071 | Administración persistente informa usuario inexistente | Pasó |
| FE-072 | Categorías públicas y ofertas asigna categorías válidas a todos los productos iniciales y ofertas coherentes | Pasó |
| FE-073 | Categorías públicas y ofertas filtra por categoría, combina búsqueda sin distinguir mayúsculas y vuelve a Todos | Pasó |
| FE-074 | Categorías públicas y ofertas restaura filtros de la URL y muestra resultados vacíos por categoría o búsqueda | Pasó |
| FE-075 | Categorías públicas y ofertas abre Ofertas desde el menú y permite combinar categoría y búsqueda | Pasó |
| FE-076 | Categorías públicas y ofertas muestra Ofertas vacía cuando ninguna oferta es válida y comunica errores de carga | Pasó |
| FE-077 | Categorías públicas y ofertas mantiene productos locales antiguos sin escribir ni borrar almacenamiento al leerlos | Pasó |
| FE-078 | Categorías públicas y ofertas rechaza ofertas no positivas, iguales, superiores o no numéricas sin guardar | Pasó |
| FE-079 | Categorías públicas y ofertas crea producto con categoría y oferta desde administración y lo publica en Ofertas | Pasó |
| FE-080 | Categorías públicas y ofertas edita categoría y oferta, valida bajar el precio normal y permite retirar la oferta | Pasó |
| FE-081 | Categorías públicas y ofertas usa el mismo precio en catálogo, detalle, carrito, checkout y pedido recargado | Pasó |
| FE-082 | Categorías públicas y ofertas restaura carrito antiguo sin descuento y actualiza el precio al agregar desde el catálogo | Pasó |
| FE-083 | Categorías públicas y ofertas conserva precio y unidades de oferta ante rechazo y permite reintentar | Pasó |
| FE-084 | Vitest + Chromium funciona | Pasó |
| FE-085 | ChatBiker usa /api/chat en desarrollo local sin URL pública | Pasó |
| FE-086 | ChatBiker usa la URL pública configurada con PROD=false | Pasó |
| FE-087 | ChatBiker usa la URL pública configurada con PROD=true | Pasó |
| FE-088 | ChatBiker avisa y bloquea solicitudes en producción con URL undefined | Pasó |
| FE-089 | ChatBiker avisa y bloquea solicitudes en producción con URL "" | Pasó |
| FE-090 | ChatBiker avisa y bloquea solicitudes en producción con URL "   " | Pasó |
| FE-091 | ChatBiker abre, enfoca la entrada y alterna el chat desde el acceso flotante | Pasó |
| FE-092 | ChatBiker cierra con botón y devuelve el foco al acceso flotante | Pasó |
| FE-093 | ChatBiker cierra con Escape y devuelve el foco al acceso flotante | Pasó |
| FE-094 | ChatBiker impide mensajes vacíos o de espacios, incluso al enviar el formulario directamente | Pasó |
| FE-095 | ChatBiker envía la consulta recortada, muestra ambas intervenciones y conserva el historial para el seguimiento | Pasó |
| FE-096 | ChatBiker muestra espera, bloquea edición y envíos duplicados y vuelve a habilitar los controles | Pasó |
| FE-097 | ChatBiker muestra el error de servidor, conserva la consulta y permite reintentar | Pasó |
| FE-098 | ChatBiker muestra el error de conexión, conserva la consulta y permite reintentar | Pasó |
| FE-099 | ChatBiker muestra el error de tiempo agotado, conserva la consulta y permite reintentar | Pasó |
| FE-100 | ChatBiker muestra el error de error sin mensaje, conserva la consulta y permite reintentar | Pasó |
| FE-101 | ChatBiker muestra el error de JSON inválido, conserva la consulta y permite reintentar | Pasó |
| FE-102 | ChatBiker muestra el error de respuesta vacía, conserva la consulta y permite reintentar | Pasó |
| FE-103 | ChatBiker limpia conversación y errores, devuelve el foco y no reenvía el historial borrado | Pasó |
| FE-104 | ProtectedRoute redirige a /login si no hay sesión | Pasó |
| FE-105 | ProtectedRoute muestra el contenido a un administrador | Pasó |
| FE-106 | ProtectedRoute muestra el contenido a un vendedor (roles por defecto) | Pasó |
| FE-107 | ProtectedRoute redirige a inicio si el rol no está permitido | Pasó |
| FE-108 | ProtectedRoute respeta una lista de roles personalizada | Pasó |
| FE-109 | ProtectedRoute redirige a /login si lo guardado no es JSON válido (mock de getItem) | Pasó |
| FE-110 | TarjetaProducto muestra nombre, descripción y precio formateado | Pasó |
| FE-111 | TarjetaProducto muestra la imagen con su texto alternativo | Pasó |
| FE-112 | TarjetaProducto enlaza a la página de detalle con el id del producto | Pasó |
| FE-113 | TarjetaProducto agrega el producto al carrito al hacer clic | Pasó |
| FE-114 | TarjetaProducto suma la cantidad si se agrega dos veces el mismo producto | Pasó |
| FE-115 | CarritoContext inicia vacío | Pasó |
| FE-116 | CarritoContext agrega un producto nuevo con cantidad 1 | Pasó |
| FE-117 | CarritoContext suma la cantidad si el producto ya estaba en el carrito | Pasó |
| FE-118 | CarritoContext agrega con la cantidad indicada | Pasó |
| FE-119 | CarritoContext cambia la cantidad de un producto | Pasó |
| FE-120 | CarritoContext ignora un cambio de cantidad a 0 o negativo | Pasó |
| FE-121 | CarritoContext elimina un producto por id | Pasó |
| FE-122 | CarritoContext vacía el carrito | Pasó |
| FE-123 | CarritoContext calcula el total y la cantidad total | Pasó |
| FE-124 | CarritoContext carga el carrito guardado en localStorage al iniciar | Pasó |
| FE-125 | CarritoContext usa un carrito vacío si lo guardado no es JSON válido (mock de getItem) | Pasó |
| FE-126 | CarritoContext guarda el carrito en localStorage al agregar (mock de setItem) | Pasó |
| FE-127 | CarritoContext al sumar cantidad no modifica los otros productos del carrito | Pasó |
| FE-128 | CarritoContext al cambiar la cantidad no modifica los otros productos del carrito | Pasó |
| FE-129 | Checkout de demostración navega desde carrito sin vaciarlo | Pasó |
| FE-130 | Checkout de demostración valida campos vacíos y correo incorrecto antes de comprar | Pasó |
| FE-131 | Checkout de demostración autocompleta por correo de sesión y permite corregir datos | Pasó |
| FE-132 | Checkout de demostración acepta sesión parcial, cuenta ausente y sesión corrupta | Pasó |
| FE-133 | Checkout de demostración reinicia comuna al cambiar región y actualiza entrega y total | Pasó |
| FE-134 | Checkout de demostración guarda antes de vaciar, evita doble envío y restaura resultado al remontar | Pasó |
| FE-135 | Checkout de demostración rechaza, conserva carrito y permite reintentar con aprobación | Pasó |
| FE-136 | Checkout de demostración conserva carrito cuando falla guardado y permite reintentar | Pasó |
| FE-137 | Checkout de demostración impide compra vacía y muestra resultado inexistente o corrupto sin caerse | Pasó |
| FE-138 | Checkout de demostración rechaza región, comuna, entrega y estado inválidos; calcula ambas tarifas | Pasó |
| FE-139 | Productos muestra una tarjeta por cada producto recibido (mock de fetch) | Pasó |
| FE-140 | Productos pide los datos a la ruta data/productos.json | Pasó |
| FE-141 | Productos no muestra el mensaje de error cuando la carga resulta bien | Pasó |
| FE-142 | Productos muestra un mensaje de error si fetch falla (mock de fetch rechazado) | Pasó |

## Casos del servidor

| ID | Caso ejecutado | Resultado |
|---|---|---|
| API-001 | rechaza roles privilegiados, historial inválido y mensajes excesivos | Pasó |
| API-002 | sin clave comunica indisponibilidad sin llamar a Google | Pasó |
| API-003 | distingue bloqueo local, DNS, certificados y tiempo agotado sin filtrar errores crudos | Pasó |
| API-004 | identifica saturación de Google como 503, sin confundirla con un bloqueo local | Pasó |
| API-005 | conserva instrucciones del servidor y extrae respuesta sin exponer la clave | Pasó |
| API-006 | no entrega respuestas truncadas ni detalles de errores del proveedor | Pasó |
