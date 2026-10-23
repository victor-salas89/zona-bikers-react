# Categorías y ofertas de demostración

En Productos y Ofertas, seleccionar una categoría y escribir un nombre combina ambos filtros. Todos elimina el filtro de categoría; borrar la búsqueda muestra todos los nombres de esa categoría. Los filtros se guardan en los parámetros `categoria` y `buscar` de la URL. Ofertas tiene acceso público desde el menú y muestra solo productos con descuento válido.

## Datos y precios

- Categorías: cascos, guantes, chaquetas, protecciones y otros. Los cuatro productos iniciales tienen categoría explícita.
- `precio` es el precio normal. `precioOferta` es un importe opcional positivo y menor al normal. Vaciarlo en administración retira la oferta. Casco Integral: $79.990 → $69.990; Guantes Biker: $29.990 → $24.990. Son datos de demostración.
- `precioVigente` es la única regla de selección: oferta válida o precio normal. Se utiliza en tarjetas, detalle, carrito, cálculo del checkout y resumen.
- Un carrito conserva los datos de precio que tenía al agregar el producto, incluso al recargar. Al volver a agregar ese mismo producto desde el catálogo se actualizan sus precios a los del catálogo y se suman las unidades. No se realizan consultas ni cambios silenciosos de precio durante la confirmación.
- El pedido guarda una copia del precio final en `precio`, sin `precioOferta`, y sus totales. Una modificación posterior del catálogo no altera pedidos emitidos ni aplica el descuento de nuevo.

## Compatibilidad

No se borra localStorage ni se reemplazan los productos locales por los iniciales. Al leer productos sin categoría válida, los códigos iniciales CAS001/GUA001/CHA001/PRO001 reciben su categoría correspondiente en memoria; los demás usan otros. El formulario permite corregirlos y guardar explícitamente.

Los productos y carritos anteriores sin `precioOferta` usan su `precio` original. Se conservan unidades y datos. No se inyectan las ofertas iniciales en un catálogo previamente guardado. Los pedidos anteriores siguen siendo legibles con su precio final histórico.

## Archivos de esta implementación

- `public/data/productos.json`: categorías y dos ofertas iniciales.
- `src/utils/categorias.js`, `src/utils/precios.js`: categorías, compatibilidad, validación y regla de precio.
- `src/utils/catalogo.js`: normalización al leer y validación/persistencia de categoría y oferta.
- `src/pages/Productos.jsx`, `src/App.jsx`, `src/components/NavbarSuperior.jsx`: filtros públicos y ruta/menú Ofertas.
- `src/pages/AdminNuevoProducto.jsx`: administrar categoría y precio de oferta.
- `src/components/TarjetaProducto.jsx`, `src/pages/DetalleProducto.jsx`: precio vigente y normal tachado.
- `src/context/CarritoContext.jsx`, `src/pages/Carrito.jsx`, `src/utils/pedidos.js`, `src/components/ResumenPedido.jsx`: misma regla de precio en toda la compra.
- `src/ofertas.spec.jsx`: 12 pruebas nuevas; todos los escenarios anteriores se mantienen.
- `README.md`, `docs/ENTREGA.md`, `docs/PLAN_PRUEBAS.md`, este documento y `scripts/actualizar-resultados.mjs`: alcance y documentación actualizados.
- `docs/RESULTADOS.md`, `docs/COBERTURA.md`, los tres informes JSON de resultados y `coverage/`: evidencias regeneradas por las pruebas.

## Verificación

`npm.cmd test`, `npm.cmd run lint` y `npm.cmd run build`: código 0. Pasaron 142 pruebas en Chromium y 6 en Node. Cobertura frontend: 98,51% sentencias; 96,76% ramas; 99,46% funciones; 98,89% líneas. Se conservan Vitest, Chromium, umbrales y diseño. Sin publicación ni cambios en Gemini, ChatBiker, servidor, variables de entorno o sus pruebas.
