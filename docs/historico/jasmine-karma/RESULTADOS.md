# Resultados verificados

Fecha local de verificación: 22 de octubre de 2026, America/Santiago.

- Chrome: 101/101 casos, sin omitidos ni fallos.
- Edge: 101/101 casos, sin omitidos ni fallos.
- ESLint: sin errores.
- Compilación de producción: correcta.
- Catálogo y menú revisados en marco de 390 px; inicio y módulos en escritorio.
- Compilación probada en `/dist/index.html#/productos`, con recarga y JSON visibles.

## Cobertura y análisis

| Métrica | Porcentaje | Cubierto/total |
|---|---|---|
| Sentencias | 98.03% | 449/458 |
| Ramas | 94.46% | 273/289 |
| Funciones | 99.3% | 143/144 |
| Líneas | 98.44% | 379/385 |

Se instrumentan 33 archivos de aplicación: todos los componentes, páginas, contexto, datos JavaScript y utilidades, incluyendo App. `main.jsx` queda fuera de la cobertura unitaria; su montaje se verifica al abrir la aplicación compilada. No se mide CSS ni dependencias. El alcance ya no se limita a los cuatro archivos del proyecto recibido.

Se superan los umbrales de 90/85/90/90. Quedan ramas sin ejecutar, principalmente alternativas de presentación, cancelación de efectos y algunos fallos de almacenamiento administrativos. El porcentaje no demuestra ausencia de errores. Para la siguiente iteración conviene ampliar fallos de cuota y concurrencia, probar un dispositivo real y verificar el despliegue público. El frontend no representa seguridad ni inventario transaccional de producción.

## Casos ejecutados

El nombre de cada caso expresa el comportamiento esperado; PLAN_PRUEBAS.md detalla preparación, acciones y expectativas por funcionalidad. Ambos registros JSON permiten verificar la ejecución completa y el navegador real. El orden puede variar entre navegadores por la aleatorización de Jasmine.

| ID | Caso / comportamiento esperado | Chrome | Edge |
|---|---|---|---|
| CP-001 | Validaciones y límites rechaza RUN 12.345.678-5 | Pasó | Pasó |
| CP-002 | Validaciones y límites rechaza límites de longitud | Pasó | Pasó |
| CP-003 | Validaciones y límites rechaza correo inválido a@@gmail.com | Pasó | Pasó |
| CP-004 | Validaciones y límites exige credenciales | Pasó | Pasó |
| CP-005 | Validaciones y límites rechaza RUN abcdefgh | Pasó | Pasó |
| CP-006 | Validaciones y límites rechaza RUN 12345K | Pasó | Pasó |
| CP-007 | Validaciones y límites acepta a@profesor.duoc.cl | Pasó | Pasó |
| CP-008 | Validaciones y límites rechaza RUN 123456789012 | Pasó | Pasó |
| CP-009 | Validaciones y límites acepta RUN de dígito correcto y rechaza uno alterado | Pasó | Pasó |
| CP-010 | Validaciones y límites rechaza correo inválido @gmail.com | Pasó | Pasó |
| CP-011 | Validaciones y límites acepta A@GMAIL.COM | Pasó | Pasó |
| CP-012 | Validaciones y límites rechaza correo inválido  | Pasó | Pasó |
| CP-013 | Validaciones y límites rechaza RUN 12 | Pasó | Pasó |
| CP-014 | Validaciones y límites rechaza dominio y contraseña corta | Pasó | Pasó |
| CP-015 | Validaciones y límites rechaza credenciales largas | Pasó | Pasó |
| CP-016 | Validaciones y límites rechaza correo inválido a b@gmail.com | Pasó | Pasó |
| CP-017 | Validaciones y límites rechaza RUN  | Pasó | Pasó |
| CP-018 | Validaciones y límites acepta credenciales válidas | Pasó | Pasó |
| CP-019 | Validaciones y límites acepta registro válido | Pasó | Pasó |
| CP-020 | Validaciones y límites acepta a@duoc.cl | Pasó | Pasó |
| CP-021 | Validaciones y límites acepta a@gmail.com | Pasó | Pasó |
| CP-022 | Validaciones y límites rechaza correo inválido a@example.com | Pasó | Pasó |
| CP-023 | Validaciones y límites rechaza RUN y dominio inválidos | Pasó | Pasó |
| CP-024 | Validaciones y límites exige campos del registro | Pasó | Pasó |
| CP-025 | Validaciones administrativas adicionales expone y cambia el estado del menú administrativo | Pasó | Pasó |
| CP-026 | Validaciones administrativas adicionales informa catálogo vacío en vez de permanecer cargando | Pasó | Pasó |
| CP-027 | Validaciones administrativas adicionales rechaza stock crítico negativo y avisa cuando el stock es bajo | Pasó | Pasó |
| CP-028 | Validaciones administrativas adicionales conserva región y comuna y rechaza RUN incorrecto | Pasó | Pasó |
| CP-029 | TarjetaProducto muestra la imagen con su texto alternativo | Pasó | Pasó |
| CP-030 | TarjetaProducto enlaza a la página de detalle con el id del producto | Pasó | Pasó |
| CP-031 | TarjetaProducto agrega el producto al carrito al hacer clic | Pasó | Pasó |
| CP-032 | TarjetaProducto suma la cantidad si se agrega dos veces el mismo producto | Pasó | Pasó |
| CP-033 | TarjetaProducto muestra nombre, descripción y precio formateado | Pasó | Pasó |
| CP-034 | Formularios públicos valida login vacío y rechaza credenciales incorrectas | Pasó | Pasó |
| CP-035 | Formularios públicos registra una cuenta que puede iniciar sesión | Pasó | Pasó |
| CP-036 | Formularios públicos inicia sesión como administrador | Pasó | Pasó |
| CP-037 | Formularios públicos valida y limpia el contacto explicando su alcance | Pasó | Pasó |
| CP-038 | Formularios públicos no registra campos vacíos ni un correo repetido | Pasó | Pasó |
| CP-039 | Productos pide los datos a la ruta data/productos.json | Pasó | Pasó |
| CP-040 | Productos no muestra el mensaje de error cuando la carga resulta bien | Pasó | Pasó |
| CP-041 | Productos muestra un mensaje de error si fetch falla (mock de fetch rechazado) | Pasó | Pasó |
| CP-042 | Productos muestra una tarjeta por cada producto recibido (mock de fetch) | Pasó | Pasó |
| CP-043 | ProtectedRoute redirige a /login si no hay sesión | Pasó | Pasó |
| CP-044 | ProtectedRoute redirige a inicio si el rol no está permitido | Pasó | Pasó |
| CP-045 | ProtectedRoute respeta una lista de roles personalizada | Pasó | Pasó |
| CP-046 | ProtectedRoute redirige a /login si lo guardado no es JSON válido (mock de getItem) | Pasó | Pasó |
| CP-047 | ProtectedRoute muestra el contenido a un administrador | Pasó | Pasó |
| CP-048 | ProtectedRoute muestra el contenido a un vendedor (roles por defecto) | Pasó | Pasó |
| CP-049 | Navegación, contenido y acceso permite saltar al contenido sin cambiar de ruta | Pasó | Pasó |
| CP-050 | Navegación, contenido y acceso limita la gestión de cuentas al administrador | Pasó | Pasó |
| CP-051 | Navegación, contenido y acceso muestra presentación, módulos y pie de página | Pasó | Pasó |
| CP-052 | Navegación, contenido y acceso carga el equipo desde JSON | Pasó | Pasó |
| CP-053 | Navegación, contenido y acceso carga dos noticias y sus fechas | Pasó | Pasó |
| CP-054 | Navegación, contenido y acceso muestra el panel y cierra sesión | Pasó | Pasó |
| CP-055 | Navegación, contenido y acceso abre y cierra el menú móvil mediante su botón | Pasó | Pasó |
| CP-056 | Navegación, contenido y acceso informa error de red en /nosotros | Pasó | Pasó |
| CP-057 | Navegación, contenido y acceso informa error de red en /noticias | Pasó | Pasó |
| CP-058 | Navegación, contenido y acceso informa error de red en / | Pasó | Pasó |
| CP-059 | Navegación, contenido y acceso renderiza /detalle-blog1 | Pasó | Pasó |
| CP-060 | Navegación, contenido y acceso renderiza /detalle-blog2 | Pasó | Pasó |
| CP-061 | Navegación, contenido y acceso renderiza /no-existe | Pasó | Pasó |
| CP-062 | Navegación, contenido y acceso impide entrar al administrador sin sesión | Pasó | Pasó |
| CP-063 | Carrito: casos de error y stock descarta objetos JSON y entradas incompletas | Pasó | Pasó |
| CP-064 | Carrito: casos de error y stock rechaza cantidades fraccionarias, negativas y superiores al stock | Pasó | Pasó |
| CP-065 | Carrito: casos de error y stock comunica almacenamiento bloqueado | Pasó | Pasó |
| CP-066 | Persistencia y catálogo rechaza JSON corrupto y estructuras distintas de lista | Pasó | Pasó |
| CP-067 | Persistencia y catálogo guarda y recupera listas | Pasó | Pasó |
| CP-068 | Persistencia y catálogo rechaza un JSON con estructura incorrecta | Pasó | Pasó |
| CP-069 | Persistencia y catálogo rechaza un HTTP fallido | Pasó | Pasó |
| CP-070 | Persistencia y catálogo permite guardar un catálogo vacío | Pasó | Pasó |
| CP-071 | Persistencia y catálogo crea, impide código duplicado y elimina | Pasó | Pasó |
| CP-072 | Persistencia y catálogo crea, normaliza, modifica y elimina cuentas | Pasó | Pasó |
| CP-073 | Persistencia y catálogo usa el JSON inicial y luego la edición local | Pasó | Pasó |
| CP-074 | CarritoContext carga el carrito guardado en localStorage al iniciar | Pasó | Pasó |
| CP-075 | CarritoContext guarda el carrito en localStorage al agregar (mock de setItem) | Pasó | Pasó |
| CP-076 | CarritoContext al sumar cantidad no modifica los otros productos del carrito | Pasó | Pasó |
| CP-077 | CarritoContext cambia la cantidad de un producto | Pasó | Pasó |
| CP-078 | CarritoContext al cambiar la cantidad no modifica los otros productos del carrito | Pasó | Pasó |
| CP-079 | CarritoContext elimina un producto por id | Pasó | Pasó |
| CP-080 | CarritoContext agrega con la cantidad indicada | Pasó | Pasó |
| CP-081 | CarritoContext ignora un cambio de cantidad a 0 o negativo | Pasó | Pasó |
| CP-082 | CarritoContext calcula el total y la cantidad total | Pasó | Pasó |
| CP-083 | CarritoContext vacía el carrito | Pasó | Pasó |
| CP-084 | CarritoContext agrega un producto nuevo con cantidad 1 | Pasó | Pasó |
| CP-085 | CarritoContext inicia vacío | Pasó | Pasó |
| CP-086 | CarritoContext usa un carrito vacío si lo guardado no es JSON válido (mock de getItem) | Pasó | Pasó |
| CP-087 | CarritoContext suma la cantidad si el producto ya estaba en el carrito | Pasó | Pasó |
| CP-088 | Karma + Jasmine funciona | Pasó | Pasó |
| CP-089 | Detalle y pantalla del carrito modifica, cancela vaciado, elimina y finaliza compra simulada | Pasó | Pasó |
| CP-090 | Detalle y pantalla del carrito confirma vaciado y elimina un producto | Pasó | Pasó |
| CP-091 | Detalle y pantalla del carrito informa un fallo de carga del detalle | Pasó | Pasó |
| CP-092 | Detalle y pantalla del carrito renderiza relacionados y fallback de id | Pasó | Pasó |
| CP-093 | Detalle y pantalla del carrito agrega desde detalle, impide exceder stock y valida cantidades | Pasó | Pasó |
| CP-094 | Administración persistente impide correos duplicados | Pasó | Pasó |
| CP-095 | Administración persistente informa id de producto inexistente | Pasó | Pasó |
| CP-096 | Administración persistente crea una cuenta y vuelve al listado | Pasó | Pasó |
| CP-097 | Administración persistente informa usuario inexistente | Pasó | Pasó |
| CP-098 | Administración persistente crea un producto y lo muestra en el catálogo | Pasó | Pasó |
| CP-099 | Administración persistente edita un producto existente | Pasó | Pasó |
| CP-100 | Administración persistente lista, cancela y confirma la eliminación de un producto | Pasó | Pasó |
| CP-101 | Administración persistente edita una cuenta y elimina con confirmación | Pasó | Pasó |
