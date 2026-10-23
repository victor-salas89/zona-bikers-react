# Migración a Vitest y Chromium

Se conservaron los ocho archivos y los 120 casos frontend existentes, más los seis casos del servidor. Solo se renombra el grupo inicial «Karma + Jasmine» a «Vitest + Chromium»; su comprobación de 1 + 1 se mantiene.

## Cambios

- vitest.config.js configura React, Browser Mode, Playwright y Chromium headless real; no usa Edge/Chrome instalado ni jsdom.
- vitest.server.config.js ejecuta con Vitest en Node los casos que usan HTTP y streams de Node.
- Imports explícitos de Vitest, vi.spyOn, mockImplementation, mockReturnValue, mock.calls y rejects sustituyen las APIs de Jasmine. Los espías que antes no llamaban a la función original conservan esa semántica mediante un mock vacío.
- src/test/setup.js desmonta el DOM, restaura espías y limpia ambos almacenamientos. Los archivos de navegador se ejecutan secuencialmente porque comparten localStorage del mismo origen.
- Cobertura V8 en carpetas separadas. Los umbrales frontend no se rebajan; el servidor se informa sin inventar un umbral previo.
- npm test verifica ambas suites y después genera documentos y metadatos. Falla si falta un caso original o hay casos fallidos/omitidos.
- GitHub instala Chromium y sus dependencias antes de ejecutar las pruebas.
- Se retiran Karma y sus dependencias de prueba exclusivas. Vite y la configuración de la aplicación se conservan.

## Conservación verificable

casos-originales.json contiene los nombres de los 120 casos del navegador y los seis del servidor recibidos. El generador compara esa lista con el resultado actual, permitiendo solo el cambio de nombre del grupo inicial y espacios. Se permiten casos nuevos, pero no omitir los originales. Actualizar esa lista solo ante un cambio de alcance deliberado y documentado.

Los registros recibidos se movieron a historico/jasmine-karma. Las cifras vigentes se generan desde Vitest y no se copian de ellos. Las diferencias de denominador entre V8 e Istanbul no significan por sí mismas que se agregaron pruebas.

## Reproducir

```powershell
npm ci
npm run test:browser:install
npm test
npm run lint
npm run build
```

En Linux/CI, usar npx playwright install --with-deps chromium para instalar las bibliotecas del sistema. La primera instalación necesita Internet; los casos del chat no usan credenciales ni llaman al proveedor real.

## Referencias oficiales

- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [Proveedor Playwright](https://vitest.dev/config/browser/playwright)
- [Cobertura V8](https://vitest.dev/guide/coverage.html)
