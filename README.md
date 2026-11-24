# Zona Bikers — Evaluación 3, Full Stack II

React + API REST Spring Boot + MySQL. Se mantiene el diseño, catálogo, ofertas, carrito y chat de Zona Bikers. Los productos, usuarios, sesiones y pedidos se persisten en el servidor. El pago sigue siendo una **simulación sin cobros**.

## Equipo

- Camilo Contreras: estilos y vistas.
- Víctor Salas: estructura e integración.
- Kevin Valdes: lógica y validaciones.

## Requisitos

- Node.js y npm compatibles con el package-lock (verificado con Node 26.7.0).
- **JDK 21**, `JAVA_HOME` apuntando a su carpeta.
- MySQL local, puerto 3306 (Laragon). Base creada: `zona_bikers`.
- Backend en **Backend/**, artifact `zona-bikers-backend`, paquete real `cl.duoc.zonabikers`.
- Spring Boot **4.2.0**, springdoc **3.2.1**. No copiar las dependencias Boot 3 de los ejemplos del profesor.

## MySQL y backend

Si la base aún no existe, ejecutar en MySQL:

```sql
CREATE DATABASE IF NOT EXISTS zona_bikers CHARACTER SET utf8mb4;
```

Copiar `Backend/.env.example` a `Backend/.env.local` y completar:

| Variable | Uso |
|---|---|
| `DB_URL` | `jdbc:mysql://127.0.0.1:3306/zona_bikers` |
| `DB_USERNAME`, `DB_PASSWORD` | Credenciales de MySQL; Laragon local puede usar root y contraseña vacía. |
| `JWT_SECRET` | Secreto aleatorio de al menos 32 bytes, obligatorio. |
| `JWT_MINUTES` | Duración de sesión, 60 por defecto; entre 1 y 1440. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Creación inicial opcional de administrador. No modifica una cuenta existente. Correo @duoc.cl, @profesor.duoc.cl o @gmail.com; contraseña de 8 caracteres como mínimo, hasta 72 bytes. |
| `FRONTEND_ORIGINS` | Orígenes CORS exactos separados por coma; localhost:5173 y 127.0.0.1:5173 por defecto. |
| `SERVER_PORT` | 8080 por defecto. |
| `SEED_CATALOG` | true carga los cuatro productos originales si la tabla está vacía. Poner false después de la primera carga si se desea mantener un catálogo vacío. |

Generar un secreto local, copiarlo a `JWT_SECRET` y no compartirlo:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
```

Arrancar desde la raíz:

```powershell
$env:JAVA_HOME = 'RUTA_A_TU_JDK_21'
powershell -ExecutionPolicy Bypass -File Backend/run.ps1
```

El script lee `Backend/.env.local` sin ejecutar su contenido y lanza el Maven Wrapper. Como alternativa, definir las variables en el entorno/IDE y ejecutar `Backend/mvnw.cmd -f Backend/pom.xml spring-boot:run`. Spring Boot por sí solo **no lee archivos .env**.

Comprobar `http://localhost:8080/api/prueba`. Hibernate crea las tablas mediante `ddl-auto=update`; esta configuración está destinada al desarrollo local. Para un entorno productivo serían necesarias migraciones versionadas y HTTPS.

Los archivos .env.local, logs y target están ignorados por Git. No poner secretos en variables `VITE_`. Después de crear el administrador se pueden retirar ADMIN_EMAIL y ADMIN_PASSWORD del entorno; la cuenta y su hash permanecen en MySQL. No hay contraseñas predeterminadas en el código.

## Frontend y chat

En otra terminal, desde la raíz:

```powershell
npm ci
npm.cmd run dev -- --port 5173 --strictPort
```

Por defecto React usa `http://localhost:8080/api`. Para cambiarlo, copiar `.env.example` a `.env.local` en la raíz y configurar `VITE_API_URL`. Reiniciar Vite tras editar variables.

Abrir la URL que indica Vite. Se conserva HashRouter: por ejemplo `http://localhost:5173/#/login`. Si Vite cambia de puerto, agregar ese origen a FRONTEND_ORIGINS y reiniciar Spring Boot.

El chat sigue usando `server/chat.js`: Vite conserva su middleware `/api/chat`, independiente de la API de negocio. Para ejecutar el servidor Node separado: `npm run server`. Configurar GEMINI_API_KEY únicamente en el entorno del servidor o .env.local de la raíz. Ver [configuración del chat](docs/chat-gemini.md). Las pruebas del chat no llaman a Google ni necesitan una clave.

## Permisos y sesión

| Acción | Visitante | Cliente | Vendedor | Administrador |
|---|---|---|---|---|
| Consultar catálogo/ofertas y preparar carrito | Sí | Sí | Sí | Sí |
| Registro público | Solo crea cliente | Solo crea cliente | Solo crea cliente | Solo crea cliente |
| Crear y consultar pedidos propios | No | Sí | Sí | Sí |
| Crear/editar/eliminar productos | No | No | Sí | Sí |
| CRUD de usuarios y asignación de roles | No | No | No | Sí |
| Importación de datos locales antiguos | No | No | No | Sí |

La API aplica las restricciones independientemente del navegador. Las contraseñas se guardan con BCrypt y nunca aparecen en respuestas. El registro público rechaza roles privilegiados.

React persiste token, vencimiento y perfil en `sesionBikers`; no guarda contraseñas. La sesión sobrevive a recargas y cierres del navegador hasta expirar. El servidor verifica firma, emisor, expiración, sesión vigente y usuario actual. Logout revoca la sesión en MySQL; editar una cuenta invalida sus sesiones. Un 401 limpia la sesión de React. El administrador no puede eliminarse ni cambiar su propio rol.

La renovación usa `POST /api/auth/refresh` con el JWT vigente. Entrega un JWT nuevo y revoca el anterior dentro de una transacción. React la solicita antes de una operación privada cuando quedan menos de cinco minutos y coordina solicitudes simultáneas. Una sesión inactiva vence; un token vencido, revocado o alterado no permite renovar y requiere iniciar sesión otra vez. Este mecanismo no usa un refresh token separado ni almacena la contraseña.

## Migración y compra

El catálogo inicial se copia desde `Backend/src/main/resources/catalogo-inicial.json`. Los JSON de noticias/equipo siguen siendo recursos estáticos.

Los datos antiguos de localStorage **no autorizan acceso ni se usan como catálogo activo**. En el mismo navegador que contiene `productosBikers` o `usuariosBikers`, iniciar sesión como administrador y abrir el panel. La sección de importación:

- Importa nuevos códigos y correos usando la API protegida.
- No sobrescribe registros existentes; muestra los conflictos para resolverlos desde los formularios.
- Solicita una contraseña nueva para las cuentas importadas y no envía las antiguas.
- Retira de las listas antiguas únicamente los registros importados con éxito; conserva fallos para reintentar.

El carrito continúa en localStorage para poder prepararlo sin sesión. Al confirmar se exige login y se vuelve al checkout. El navegador envía IDs y cantidades, nunca precios como autoridad. El servidor valida datos, entrega, región/comuna, stock y cantidades; aplica la oferta vigente y calcula despacho ($3.990) o retiro ($0).

Una compra simulada aprobada guarda pedido y líneas históricas y descuenta stock en una transacción. Una rechazada guarda el resultado sin descontar ni vaciar el carrito. Los bloqueos impiden sobreventa concurrente; la clave de intento evita duplicados al reintentar una solicitud desde el checkout. Los pedidos solo pueden leerse por su propietario, incluso si quien consulta es administrador.

El resumen previo del carrito es orientativo: el total definitivo usa los precios vigentes del servidor. No se integró pasarela de pago, despacho real ni envío de correos. Los pedidos antiguos del navegador no se importan como ventas. No se necesita EC2; el video de defensa sigue pendiente.

## Swagger y pruebas manuales

Abrir [Swagger UI local](http://localhost:8080/swagger-ui/index.html). OpenAPI JSON: `/v3/api-docs`.

1. Consultar GET /api/prueba y GET /api/productos sin token.
2. Registrar un cliente en POST /api/auth/registro.
3. Hacer login en POST /api/auth/login y copiar solo el campo token.
4. En **Authorize**, pegar el JWT (sin escribir Bearer) y probar GET /api/auth/me.
5. Con cliente, POST /api/productos y GET /api/usuarios deben devolver 403.
6. Con vendedor, probar CRUD de productos; usuarios debe seguir devolviendo 403.
7. Con administrador, probar CRUD de usuarios y productos. No se devuelven hashes.
8. Crear un pedido, consultar su ID y comprobar stock; probar cantidades inválidas, falta de stock y otro propietario.
9. Cerrar sesión con POST /api/auth/logout; reutilizar ese token debe devolver 401.
10. Con una sesión nueva, ejecutar POST /api/auth/refresh. Debe devolver 200 con un token diferente y vencimiento nuevo. El anterior debe devolver 401 en /api/auth/me; el nuevo debe devolver 200 y conservar los permisos. Cerrar la sesión nueva y comprobar que tampoco permite renovar.

Ver [guion completo, cuerpos de ejemplo y evidencias](docs/EVALUACION_3.md).

## Verificación automatizada

```powershell
npm run test:browser:install
npm test
npm run lint
npm run build
Backend/mvnw.cmd -f Backend/pom.xml test
Backend/mvnw.cmd -f Backend/pom.xml package
```

- Vitest: casos frontend en Chromium y del chat en Node, incluidos renovación concurrente y respuestas tardías después de cerrar sesión. Los dobles HTTP prueban la UI; no se presentan como prueba del servidor. Ver conteos de la última ejecución en docs/RESULTADOS.md.
- JUnit: servidor HTTP real y H2 aislada, incluyendo CRUD, BCrypt, JWT, renovación y revocación, roles, CORS, Swagger, stock y concurrencia. Nunca borran zona_bikers.
- Se mantienen umbrales de cobertura frontend: 90% sentencias/funciones/líneas y 85% ramas.
- `npm test` actualiza resultados y cobertura en docs. [Resultados Vitest](docs/RESULTADOS.md).
- JUnit genera `Backend/target/surefire-reports/`.

Prueba integral opcional (requiere JAR generado, MySQL local y Chromium):

```powershell
node scripts/verificar-integracion.mjs
```

Usa JAVA_HOME, DB_USERNAME y DB_PASSWORD del entorno. MYSQL_BIN permite indicar otra ruta del cliente mysql.exe. Crea una base aleatoria `zona_bikers_test_*` y la elimina al terminar; requiere permisos para crear bases. Inicia servicios en 18080 y 15173, los cierra al finalizar y no modifica zona_bikers. La evidencia se guarda en `docs/evaluacion3-integracion.json`, sin secretos. Captura local: `test-results/checkout-mysql.png`.

## Estructura y referencias

```text
Backend/src/main/java/cl/duoc/zonabikers/
  api/          controladores, DTO y errores
  model/        entidades persistentes
  repository/   Spring Data JPA
  service/      reglas y transacciones
  security/     JWT, sesiones y permisos
  config/       Swagger y datos iniciales
src/pages/      pantallas React existentes
src/utils/      cliente HTTP, sesión, catálogo, cuentas, pedidos
server/         chat Node existente
docs/           evidencias y guiones
```

Referencias revisadas: [BackEnd-productos del profesor](https://github.com/marihuertas-ui/CarritoCompra-react/tree/main/BackEnd-productos/productos), [carrito-JWT](https://github.com/marihuertas-ui/CarritoCompra-react/tree/main/carrito-JWT/carrito-JWT) y [compatibilidad springdoc](https://springdoc.org/#what-is-the-compatibility-matrix-of-springdoc-openapi-with-spring-boot).

El código de la Evaluación 3 está integrado en la rama main. La aplicación se ejecuta localmente; el workflow de GitHub Pages no despliega Spring Boot ni MySQL. Los documentos de Evaluación 2 se conservan como antecedentes; el alcance vigente es este README y docs/EVALUACION_3.md.
