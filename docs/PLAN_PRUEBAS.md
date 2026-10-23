# Plan de pruebas

## Objetivo y entorno

Comprobar IL2.1, IL2.2 e IL2.3 de la evaluación mediante pruebas reproducibles de componentes, lógica, estado, DOM y eventos. Herramientas: Vitest, React Testing Library, Playwright con Chromium real y cobertura V8. El servidor se prueba con Vitest en Node. Las versiones y resultados actuales se generan en RESULTADOS.md y resultados-migracion.json. Los escenarios trabajan con datos ficticios y limpian localStorage/sessionStorage y el DOM entre casos.

## Casos y resultados esperados por funcionalidad

| Área | Preparación y acción | Resultado esperado |
|---|---|---|
| Tarjeta de producto | Renderizar producto, revisar texto, imagen y enlace; hacer clic una y dos veces | Datos correctos, alt y enlace correctos, una línea de carrito con cantidad 1 y luego 2 |
| Carrito compartido | Agregar, cambiar cantidad, quitar, vaciar y restaurar | Cantidades y totales exactos; los demás productos no cambian; persiste el estado |
| Cantidades y stock | Agregar cero, fracción, negativo o cantidad superior a stock | Se rechazan sin modificar el pedido; se informa cuando excede stock |
| Almacenamiento | Simular JSON inválido, objeto distinto de lista, entradas incompletas y permisos bloqueados | No se cae la aplicación por los datos inválidos probados; informa fallo de guardado |
| Protección de rutas | Entrar sin sesión, con cliente, vendedor y administrador; roles personalizados | Redirige a login o inicio cuando corresponde; muestra solo las páginas permitidas |
| Catálogo JSON | Simular éxito, error HTTP, JSON de formato incorrecto y rechazo de red | Renderiza datos correctos; muestra mensaje de error en las rutas probadas |
| Validaciones | RUN con dígito correcto/incorrecto; correos válidos/inválidos; campos vacíos y límites | Acepta datos válidos y muestra errores en casos inválidos |
| Registro y login | Crear cuenta ficticia, iniciar sesión, probar duplicado y credenciales erróneas | Cuenta local utilizable; sin duplicados; credenciales erróneas no crean sesión |
| Contacto | Enviar vacío, correo incorrecto y finalmente datos válidos | Muestra errores; confirma validación sin afirmar envío real y limpia campos |
| Inicio, equipo y noticias | Cargar JSON ficticio y simular error | Presentación, módulos, tecnologías, equipo, fechas y artículos visibles; errores comunicados |
| Detalle de producto | Abrir id válido/inexistente; agregar cantidad válida e inválida | Datos y relacionados correctos; fallback documentado; respeta cantidad y stock |
| Pantalla de carrito | Cambiar cantidad, cancelar/confirmar vaciado, eliminar y finalizar | DOM y total actualizados; botones deshabilitados al quedar vacío; compra declarada simulada |
| Administración de productos | Crear, editar, duplicar código, eliminar y buscar id inexistente | Persistencia compartida con tienda, códigos únicos y mensajes de error |
| Administración de cuentas | Crear, editar, duplicar correo y eliminar | Cuenta persistente utilizable en login, rol elegido y sin duplicados |
| Metadatos administrativos | Cambiar región y RUN; ingresar stock crítico negativo/bajo | Reinicia comuna, rechaza RUN incorrecto y stock negativo; informa stock bajo |
| Navegación y accesibilidad | Abrir menú, cerrar sesión, usar salto al contenido y ruta inexistente | aria-expanded correcto, sesión eliminada, foco en main y mensaje de página no encontrada |

## Mocks y aislamiento

- `vi.spyOn(window, 'fetch')`: entrega listas controladas, HTTP fallido o rechazo de red sin depender de servidores.
- `vi.spyOn(Storage.prototype, 'getItem'/'setItem')`: reproduce datos corruptos o almacenamiento bloqueado.
- `vi.spyOn(window, 'alert'/'confirm')`: observa avisos y controla confirmación/cancelación.
- `MemoryRouter`: reproduce rutas y roles sin cambiar la dirección del navegador.
- Proveedor del carrito: permite probar tanto hooks como componentes reales dentro de su contexto.

## Ejecución, criterio de aceptación y evidencia

Instalar Chromium con `npm run test:browser:install`. Ejecutar `npm run lint`, `npm test` y `npm run build`; todos deben terminar con código cero. El frontend se ejecuta en Chromium headless y el servidor en Node, ambos con Vitest. Revisar coverage/frontend/index.html y coverage/server/index.html. Los umbrales automáticos son 90% de sentencias, funciones y líneas y 85% de ramas. El registro detallado está en `resultados-vitest-chromium.json` y `resultados-vitest-servidor.json`; RESULTADOS.md incluye todos los casos y COBERTURA.md explica el alcance. El generador comprueba que se conserven los 120 casos frontend y los seis del servidor registrados en casos-originales.json. Los umbrales anteriores se aplican al frontend; el servidor se mide por separado, sin introducir un umbral que antes no existía.

## Inspección manual complementaria

Comprobar escritorio y marco de 390 px, abrir/cerrar menú, revisar orden de lectura, textos alternativos y foco de teclado. Abrir la compilación en una subcarpeta y recargar `#/productos`: debe mantener navegación y JSON. Las capturas incluidas registran esas vistas. Queda por comprobar la URL pública final y, de ser posible, un teléfono real. La cobertura no sustituye auditoría completa de accesibilidad ni pruebas visuales de todas las combinaciones de pantalla.

## Aislamiento y alcance

`src/test/setup.js` desmonta el DOM, restaura todos los espías y limpia ambos almacenamientos después de cada caso. Los archivos del navegador se ejecutan secuencialmente para evitar interferencia en localStorage. No se llama a la API real del chat. Los escenarios de lista, errores condicionales, props, formulario y clic del Anexo 1 se mantienen; cambian las APIs de simulación y el ejecutor.

## Checkout — Anexo 1

Implementado: navegación desde carrito sin vaciado, formulario validado y editable, búsqueda de cuenta por correo de sesión, resumen con productos/cantidades y tarifas de demostración (retiro $0; domicilio $3.990), simulación aprobada/rechazada y resultado persistente por identificador. Se guarda el pedido antes de vaciar; los rechazos y fallos conservan el carrito. No se integra una pasarela.

Pruebas en src/pages/Checkout.spec.jsx: campos vacíos y correo inválido; cuenta completa/parcial/ausente y sesión corrupta; cambio de región y comuna; ambas entregas y totales; aprobación y orden de persistencia; doble clic; rechazo con reintento; almacenamiento fallido con reintento; recuperación al remontar; carrito vacío y pedido inexistente/corrupto. La prueba anterior de finalizar compra ahora verifica navegación y conservación del carrito.

Verificación requerida: npm.cmd test, npm.cmd run lint y npm.cmd run build, manteniendo Chromium y umbrales 90/85/90/90. Resultados finales en RESULTADOS.md.

Resultado de la etapa de checkout: pasaron 130 pruebas frontend (10 nuevas de checkout) y 6 del servidor. Los tres comandos terminaron con código 0. No se modificaron las configuraciones de Vitest, Gemini, ChatBiker, el servidor, sus variables ni sus pruebas.

## Categorías públicas y ofertas — Anexo 1

Estado: completado. Se añaden 12 casos en `src/ofertas.spec.jsx`, sin quitar ni omitir casos anteriores. Resultado actual: 142 pruebas frontend en Chromium y 6 del servidor. `npm.cmd test`, `npm.cmd run lint` y `npm.cmd run build` terminaron con código 0. Cobertura frontend: 98,51% sentencias, 96,76% ramas, 99,46% funciones y 98,89% líneas; umbrales 90/85/90/90 intactos.

| Escenario | Resultado esperado |
|---|---|
| Datos iniciales | Cada producto tiene categoría válida; ofertas positivas menores al precio normal |
| Categoría y búsqueda | Filtros combinados, búsqueda por nombre sin distinguir mayúsculas, opción Todos y filtros recuperables desde URL |
| Catálogo u ofertas sin coincidencias | Mensaje explícito; los errores de carga se distinguen de resultados vacíos |
| Acceso público a Ofertas | Enlace del menú, solo ofertas válidas, precio normal tachado y precio vigente |
| Administración | Crear, editar y retirar oferta; conservar categoría; rechazar oferta cero, negativa, igual/superior al normal o no numérica |
| Compra | Mismo precio en catálogo, detalle, carrito restaurado, checkout y pedido recargado; cantidad y entrega incluidas; sin doble descuento |
| Rechazo | Conservar unidades y precio de oferta para reintentar |
| Compatibilidad | Leer productos sin categoría/oferta sin sobrescribir almacenamiento; conservar cantidades y precio de carritos antiguos |

Contrato de datos y archivos modificados: [CATEGORIAS_OFERTAS.md](CATEGORIAS_OFERTAS.md). No se publicaron cambios ni se modificaron chat, servidor, variables o pruebas del chat.
