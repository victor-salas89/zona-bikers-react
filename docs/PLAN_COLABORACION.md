# Plan de cierre colaborativo de Zona Bikers

## Punto de partida

La base compartida ya incluye migración a React, CRUD de productos y cuentas, carrito, checkout, resultados de compra, categorías públicas, búsqueda y ofertas. Fue revisada con 142 pruebas frontend en Chromium y 6 del servidor, lint y compilación correctos. Se conserva el código de Gemini tal como fue recibido. El autor de un commit de importación incorpora los archivos al repositorio; ese commit no atribuye a esa persona la creación de todo el código.

Este reparto propone trabajo pendiente real, no reconstruye la autoría anterior. Ajustar los responsables si el equipo lo acuerda. En el ERS o README debe indicarse quién implementó qué de la base original, de acuerdo con lo que realmente ocurrió.

## Cómo se cargarán las tres partes

1. Crear un único repositorio público llamado zona-bikers. Subir la base completa en main con un commit de importación conjunta. Mantener siempre una versión ejecutable como base.
2. Invitar a los otros dos integrantes como colaboradores. Cada integrante acepta la invitación y clona ese mismo repositorio en su equipo.
3. Cada integrante abre su rama desde main, realiza su parte y la sube con su identidad Git y su cuenta de GitHub.
4. Cada rama tiene una pull request hacia main, con descripción del cambio, pruebas realizadas y evidencia. Otro integrante la revisa antes de integrarla.
5. Conservar las tres pull requests y sus revisiones como evidencia, junto con los commits reales. No cambiar nombres de autor, crear cuentas ficticias, alterar fechas ni presentar una importación como desarrollo que no ocurrió.

## Parte 1 Camilo interfaz y evidencia visual

Rama propuesta: camilo-interfaz-evidencias.

Trabajo:
- Revisar inicio, catálogo, ofertas, carrito, checkout, resultado aprobado/rechazado y panel administrativo en 390, 768 y 1366 píxeles.
- Recorrer los formularios con teclado y revisar etiquetas, foco y mensajes de error. Corregir los problemas observados, conservando el diseño.
- Actualizar las capturas de docs/capturas: las existentes no prueban las pantallas nuevas ni el diseño final completo.
- Documentar ancho, página, resultado y hallazgos en docs/REVISION_RESPONSIVA.md. No afirmar pruebas que no se hayan hecho.

Archivos principales: src/estilos.css, componentes visuales que realmente necesiten ajuste, docs/capturas y docs/REVISION_RESPONSIVA.md. Coordinar antes de editar App.jsx o NavbarSuperior.jsx porque son archivos compartidos.

Criterio de cierre: pantallas legibles, sin desbordamientos que impidan usarlas; teclado funcional; capturas actuales; problemas encontrados y correcciones descritos.

Posibles commits, solo cuando exista el cambio correspondiente:
- fix: corregir problemas responsive encontrados en checkout
- docs: actualizar capturas y revisión de interfaz

Pull request: Interfaz final y evidencia responsive. Revisor propuesto: Víctor.

## Parte 2 Kevin validación de datos pruebas y alcance administrativo

Rama propuesta: kevin-validacion-pruebas.

Trabajo:
- Revisar con el equipo qué módulos administrativos exige el ERS V2. Hoy existen productos y cuentas; la categoría es una lista fija y los pedidos se guardan, pero faltan pantallas administrativas de consulta de pedidos, historial, reportes y perfil.
- Implementar los módulos realmente comprometidos en el ERS y agregar sus pruebas. No agregar módulos ni declararlos opcionales sin contrastar el alcance acordado con el docente.
- Si no hay módulos adicionales comprometidos, hacer revisión funcional real de CRUD, persistencia, stock, checkout rechazado/aprobado y consistencia de descuentos; corregir solo defectos encontrados y registrar resultados.
- Preparar docs/DEFENSA_PRUEBAS.md con diez casos relevantes: escenario, datos, acción, resultado esperado, archivo y explicación del mock cuando exista.
- Ejecutar npm test, npm run lint y npm run build sobre la rama integrada. Regenerar resultados y cobertura, sin reducir umbrales ni eliminar casos previos.

Archivos principales: páginas administrativas comprometidas, utilidades de datos afectadas, suites asociadas y docs/DEFENSA_PRUEBAS.md. Mantener Gemini, su servidor y sus pruebas sin modificaciones.

Criterio de cierre: alcance administrativo trazable al ERS, pruebas y recorridos reproducibles, errores corregidos y evidencia actual.

Posibles commits, solo cuando correspondan a trabajo realizado:
- feat: completar consulta administrativa de pedidos comprometida en ERS
- test: cubrir errores encontrados en el flujo comercial
- docs: documentar diez pruebas para la defensa

Pull request: Validación funcional y evidencia de pruebas. Revisor propuesto: Camilo.

## Parte 3 Víctor ERS integración y entrega

Rama propuesta: victor-ers-entrega.

Trabajo:
- Completar el ERS V2 usando el documento previo real y la pauta de la Evaluación Parcial 2. En el ZIP revisado no viene un ERS V2.
- Incluir requisitos verificables, roles, navegación, persistencia local, categorías, ofertas, compra simulada, autocompletado, entrega, resumen y resultado, límites y herramientas de pruebas.
- Crear trazabilidad requisito -> ruta/componente -> prueba/evidencia, y documentar el alcance administrativo acordado. No omitir funciones comprometidas previamente para declarar cumplimiento.
- Añadir al README la URL pública real del repositorio cuando exista y los aportes que el equipo pueda acreditar. No inventar la autoría de código anterior.
- Integrar las otras dos pull requests y verificar la versión final en conjunto.
- Exportar el ERS y el documento de cobertura en el formato requerido por AVA, si se necesita, y preparar el ZIP final y la presentación de equipo con defensa individual.

Archivos principales: documento ERS V2, docs/TRAZABILIDAD.md, README.md, docs/ENTREGA.md y documentación de presentación. Los conflictos en App.jsx, NavbarSuperior.jsx y datos se resuelven coordinando con el responsable del cambio.

Criterio de cierre: ERS V2 completo y consistente, tres contribuciones reales integradas, verificaciones correctas, repositorio público y ZIP coincidentes, y cada integrante capaz de defender diez pruebas relevantes.

Posibles commits:
- docs: actualizar ERS V2 y matriz de trazabilidad
- docs: cerrar instrucciones y evidencia de entrega

Pull request: ERS V2 y cierre de entrega. Revisor propuesto: Kevin.

## Comandos de cada integrante

Después de clonar el repositorio y situarse en su carpeta:

```powershell
git switch main
git pull --ff-only origin main
git switch -c NOMBRE-DE-SU-RAMA
npm ci
npm run test:browser:install
```

Sustituir NOMBRE-DE-SU-RAMA por la rama asignada. Antes de confirmar, ejecutar git diff y revisar exactamente qué se modificó. Añadir solo los archivos del trabajo realizado y usar un mensaje que describa ese trabajo.

```powershell
git status
git add RUTAS-DE-LOS-ARCHIVOS-REVISADOS
git commit -m "descripcion concreta del cambio realizado"
git push -u origin HEAD
```

Sustituir RUTAS-DE-LOS-ARCHIVOS-REVISADOS por rutas reales, sin copiar ese texto literalmente. Abrir la pull request en GitHub y pedir revisión al compañero. Cada persona usa su propia identidad Git. No establecer el correo o nombre de otra persona para simular aportes.

## Archivos compartidos y verificación automática

- Coordinar cambios en App.jsx, NavbarSuperior.jsx, package.json, package-lock.json y scripts/actualizar-resultados.mjs.
- La integración de precioVigente afecta catálogo, detalle, carrito y pedido; toda modificación debe comprobar esos cuatro puntos.
- El flujo verificar.yml valida las pull requests y main. El flujo pages.yml es manual y opcional: crear el repositorio no publica la web ni requiere desplegar Gemini.
- No subir node_modules, .env.local, .git, dist ni artefactos de fallos de Vitest. .env.example contiene solo valores de ejemplo.
- Los informes HTML se regeneran con npm test; GitHub Actions conserva cobertura y resultados como artefactos. Las capturas antiguas de fallos no son evidencia de un fallo actual si la ejecución final pasó.

## Guion breve de presentación

La pauta asigna 40% al encargo y 60% a la presentación individual. Preparar unos 15 minutos de exposición de equipo y 5 de preguntas: Camilo muestra interfaz y Bootstrap; Kevin explica lógica, pruebas, mocks y cobertura; Víctor muestra trazabilidad, componentes, estado, integración y repositorio. Todos deben comprender el flujo de compra y poder explicar diez casos de prueba; el reparto de exposición no limita las preguntas individuales.
