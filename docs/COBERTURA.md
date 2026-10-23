# Cobertura de testing

Ejecución: 23 de octubre de 2026 a las 3:48 a. m. (America/Santiago). Herramientas: Vitest 5.0.5, proveedor de navegador Playwright y cobertura V8. Los resultados proceden de los mismos casos que se ejecutan con `npm test`.

## Frontend en Chromium

| Métrica | Cobertura | Cubierto / total |
|---|---|---|
| Sentencias | 98.51% | 664 / 674 |
| Ramas | 96.76% | 449 / 464 |
| Funciones | 99.46% | 187 / 188 |
| Líneas | 98.89% | 536 / 542 |

El alcance incluye los archivos JS y JSX de `src/`, también los no importados por la suite. Se excluyen las pruebas, `src/test/` y `src/main.jsx` (arranque). No se miden CSS, SVG, JSON, dependencias, servicios externos ni una auditoría visual. Los informes HTML y LCOV se regeneran en `coverage/frontend/`.

Se comprueban renderizado, props, estado, DOM, eventos, navegación, permisos, formularios, CRUD, stock, persistencia y chat. Los mocks de fetch evitan usar redes o claves reales; los de Storage y diálogos reproducen fallos y confirmaciones. Los umbrales globales de 90/85/90/90 se mantienen, no se rebajan para hacer pasar la migración.

El checkout se verifica con validaciones, autocompletado, entrega, totales, aprobación, rechazo, persistencia, reintentos y carrito vacío. También se prueban categorías públicas, búsqueda combinada, ofertas administrables, compatibilidad con datos antiguos y precio consistente desde catálogo hasta pedido recargado. Quedan rutas de error y alternativas sin ejecutar: revisar el informe HTML. La cobertura no demuestra ausencia de errores. El proveedor V8 y sus mapas de código pueden producir denominadores distintos a los informes históricos de Istanbul; usar las cifras actuales, sin interpretar esa diferencia como nuevos casos.

## Servidor en Node

| Métrica | Cobertura | Cubierto / total |
|---|---|---|
| Sentencias | 80.26% | 61 / 76 |
| Ramas | 78.33% | 47 / 60 |
| Funciones | 100% | 14 / 14 |
| Líneas | 94.33% | 50 / 53 |

Se incluyen los casos de `server/chat.test.js` sobre `server/chat.js`. `server/index.js` no se mide: inicia el proceso HTTP y requiere una prueba de integración independiente. Los casos usan respuestas simuladas; no llaman a Google. Esta cobertura es independiente de la del frontend y no está sujeta a sus umbrales. Conviene ampliar errores de petición, límites de uso y fallos de transporte antes de afirmar cobertura exhaustiva de la API.

## Reproducir

```powershell
npm ci
npm run test:browser:install
npm test
```

`npm test` ejecuta las dos suites, genera JSON/HTML/LCOV y actualiza este documento, `RESULTADOS.md` y `resultados-migracion.json`. El generador falla si hay casos fallidos/omitidos o falta un caso original. No se mezclan los porcentajes del navegador y del servidor en un total ambiguo.
