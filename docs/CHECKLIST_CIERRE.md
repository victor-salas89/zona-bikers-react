# Estado revisado antes de crear GitHub

Fecha de revisión: 23 de octubre de 2026.

## Verificado en la copia de revisión

- 142/142 casos frontend en Chromium real con Vitest y 6/6 del servidor, sin llamadas reales a Gemini.
- npm test completo con salida cero; lint y build con salida cero.
- Cobertura frontend: 98,51% sentencias; 96,76% ramas; 99,46% funciones; 98,89% líneas.
- El código incluye filtros por categoría y nombre, vista Ofertas, administración de oferta y precio único compartido.
- El checkout recoge dirección y entrega, autocompleta la cuenta, guarda pedido y muestra resultado aprobado/rechazado; las pruebas verifican orden de guardado y vaciado y reintentos.
- Gemini no fue modificado ni se usaron claves reales. Sus funciones no se consideran pendientes de esta evaluación en este plan.

## Pendiente de acreditar y completar

- [ ] ERS V2: no viene en el ZIP revisado. Usar el ERS real anterior y actualizarlo.
- [ ] Contrastar las vistas administrativas de la propuesta con el ERS y el alcance acordado: categorías administrables, listado crítico, órdenes/boletas, historial, reportes y perfil. El código actual solo ofrece panel, productos y cuentas.
- [ ] Actualizar las capturas de las pantallas nuevas y revisar responsividad y teclado de la versión integrada. Esta revisión no acredita una inspección visual completa de todas las pantallas nuevas.
- [ ] Crear el repositorio público, añadir colaboradores y registrar aportes y revisiones reales.
- [ ] Integrar las tres partes y ejecutar verificaciones en GitHub Actions. Un flujo YAML preparado no demuestra una ejecución en GitHub.
- [ ] Preparar ERS y cobertura para AVA en el formato que indique el docente; los Markdown y HTML existentes contienen evidencia técnica, pero debe adjuntarse el entregable solicitado.
- [ ] Preparar ZIP final desde la misma revisión de main que se entregue al profesor.
- [ ] Ensayar defensa individual y diez pruebas relevantes por integrante.

No se requieren una foto profesional ni tres proyectos de portafolio con esta pauta. GitHub Pages es opcional; sí se solicita un repositorio público. Las funcionalidades adicionales del diagrama administrativo dependen del alcance confirmado: no se dan por cumplidas ni se descartan sin ERS.

## Carpeta preparada

Esta carpeta contiene el proyecto completo y dos documentos de organización. El código de aplicación coincide con el ZIP recibido. Solo se ha organizado la automatización de GitHub para verificar contribuciones sin publicar automáticamente, y se han añadido los documentos de cierre y reparto. La importación inicial describe una base de trabajo conjunta, no acredita quién escribió cada archivo previamente.
