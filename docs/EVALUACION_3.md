# Evaluación 3 — guía de revisión

## Arquitectura y alcance

Frontend React existente, API REST Spring Boot 4.2.0 / Java 21 / paquete cl.duoc.zonabikers, MySQL 8.4.3 local y chat Node independiente.

La API usa DTO de entrada con Bean Validation, entidades JPA, repositorios y servicios transaccionales. Productos: código único, categoría, descripción, precio normal/oferta, stock y stock crítico. Usuarios: correo único normalizado, perfil, rol, hash BCrypt y versión de sesión. Pedidos: propietario, datos de entrega, fecha, estado simulado, totales y líneas con precio histórico. Sesiones: identificador JWT, propietario y vencimiento; permiten revocar tokens.

Roles conservados del frontend original: administrador y vendedor gestionan productos; solo administrador gestiona usuarios. Cliente compra; cada persona consulta únicamente sus pedidos. El servidor no confía en el rol almacenado por React. Al cambiar contraseña/perfil/rol se invalidan las sesiones de esa cuenta.

El checkout original permitía invitados y guardaba una simulación local. Ahora requiere sesión, conserva los datos de entrega y la opción aprobada/rechazada, persiste pedidos en MySQL y verifica precios y stock en el servidor. Aprobación descuenta stock de manera atómica; rechazo no descuenta. Los bloqueos se toman en orden de ID y los reintentos conservan la clave de la solicitud dentro del checkout. El carrito permanece local; no se sincroniza entre dispositivos. No hay pasarela de pagos ni cobros.

## Configuración y arranque

Seguir el README. Es obligatorio definir JWT_SECRET fuera del repositorio. El administrador inicial se crea con ADMIN_EMAIL / ADMIN_PASSWORD; esas variables no restablecen contraseñas de cuentas ya creadas. Swagger usa springdoc 3.2.1, compatible con Boot 4.2.

Los ejemplos del profesor son referencias de estructura, no dependencias copiadas:
- BackEnd-productos: Boot 3.2.0, Java 17, springdoc 2.3.0, servicios y repositorios JPA.
- carrito-JWT: Boot 3.5.6, Java 17, usuarios en memoria y JWT.
- Zona Bikers: usuarios persistentes, BCrypt, JWT firmado HS256, comprobación de sesión y roles actuales, documentación Boot 4.

## Contratos principales

| Método y ruta | Permiso / resultado |
|---|---|
| GET /api/prueba | Público, 200 |
| GET /api/productos y /api/productos/{id} | Público; 404 si no existe |
| POST /api/productos | Administrador/vendedor, 201 |
| PUT /api/productos/{id} | Administrador/vendedor, 200 |
| DELETE /api/productos/{id} | Administrador/vendedor, 204 |
| POST /api/auth/registro | Público, 201, rol cliente exclusivamente |
| POST /api/auth/login | Público, token + expira + usuario; 401 si credenciales incorrectas |
| GET /api/auth/me | Sesión vigente, perfil sin contraseña |
| POST /api/auth/logout | Sesión vigente, 204 y revocación |
| POST /api/auth/refresh | JWT vigente, 200 con token nuevo; revoca el anterior |
| GET/POST /api/usuarios | Administrador, listado/alta |
| GET/PUT/DELETE /api/usuarios/{id} | Administrador, lectura/edición/borrado |
| POST /api/pedidos | Autenticado, 201; transacción e idempotencia |
| GET /api/pedidos y /api/pedidos/{id} | Solo pedidos propios |

Errores: 400 datos inválidos, 401 sesión ausente/inválida, 403 rol sin permiso, 404 recurso no disponible, 409 duplicados/stock/conflictos. Respuestas de error contienen message; Bean Validation agrega errores por campo. Nunca se retorna passwordHash.

## Guion manual Swagger

Abrir http://localhost:8080/swagger-ui/index.html. La API debe estar iniciada y MySQL disponible. Usar datos ficticios. Las contraseñas siguientes son marcadores: elegir una propia.

1. GET /api/prueba y GET /api/productos sin Authorize: 200.
2. POST /api/auth/registro:

```json
{
  "correo": "cliente-prueba@gmail.com",
  "contrasena": "REEMPLAZAR_POR_UNA_CLAVE_PROPIA",
  "nombre": "Ana",
  "apellidos": "Prueba",
  "run": "123456785",
  "direccion": "Calle Prueba 123",
  "region": "Región Metropolitana",
  "comuna": "Santiago"
}
```

Esperado: 201, rol cliente, sin contraseña/hash. Repetir correo: 409. Añadir rol administrador: 400. RUN incorrecto, dominio no permitido o perfil incompleto: 400.

3. POST /api/auth/login con correo y contrasena. Copiar token a Authorize; el esquema agrega Bearer automáticamente.
4. GET /api/auth/me: 200. GET /api/usuarios o POST /api/productos con cliente: 403.
5. Login administrador configurado por entorno. Crear vendedor mediante POST /api/usuarios usando correo, nombre, contrasena y rol vendedor. Listar, consultar, modificar y borrar un usuario de prueba; nunca usar la propia cuenta para borrado.
6. Con administrador o vendedor, POST /api/productos:

```json
{
  "codigo": "PRUEBA001",
  "nombre": "Casco de prueba",
  "descripcion": "Producto de prueba manual",
  "categoria": "cascos",
  "precio": 10000,
  "precioOferta": 8000,
  "stock": 3,
  "stockCritico": 1,
  "imagen": "/img/catalogo.svg",
  "alt": "Casco"
}
```

Guardar el ID devuelto. GET y PUT con ese ID: 200. Código repetido: 409. Precio negativo, oferta >= precio, stock negativo o fraccionario: 400. Vendedor consultando usuarios: 403.

7. Volver a Authorize como cliente y POST /api/pedidos (reemplazar ID; cambiar clave para cada compra diferente):

```json
{
  "clave": "manual-compra-001",
  "estado": "aprobada",
  "productos": [{"id": 1, "cantidad": 2}],
  "comprador": {
    "nombre": "Ana Prueba",
    "correo": "cliente-prueba@gmail.com",
    "direccion": "Calle Prueba 123",
    "region": "Región Metropolitana",
    "comuna": "Santiago",
    "entrega": "domicilio"
  }
}
```

Para el producto anterior: subtotal 16000, despacho 3990, total 19990 y stock restante 1. Añadir precio o total falsos al JSON no modifica el cálculo del servidor. Repetir con misma clave devuelve el mismo pedido sin descontar nuevamente. Una clave identifica un intento; no reutilizarla para modificar una compra.

8. GET /api/pedidos/{id}: 200 con comprador; 404 con otra cuenta, incluso administrador. Una nueva compra de dos unidades cuando queda una: 409, sin pedido nuevo. Cantidad cero/fraccionaria, estado/entrega inválidos: 400.
9. Probar estado rechazada con una clave nueva y stock suficiente: persiste resultado sin descontar.
10. POST /api/auth/refresh con token vigente: 200 con token diferente, nuevo vencimiento y mismo perfil. El anterior devuelve 401 y el nuevo permite GET /api/auth/me (200). Conserva las restricciones por rol. Renovar sin token, con uno alterado o después de revocarlo: 401. React renueva al realizar una solicitud privada cuando quedan menos de cinco minutos; no renueva por inactividad. No existe un refresh token independiente.
    POST /api/auth/logout: 204. GET /api/auth/me con ese token: 401. Para demostrar expiración, iniciar backend con JWT_MINUTES=1, hacer login en Swagger y reintentar después de un minuto sin renovar.
11. DELETE del producto de prueba como vendedor/administrador: 204. Las líneas de pedidos previos conservan nombre/precio aunque se elimine el producto.

Swagger muestra candados en operaciones del controlador; la tabla anterior describe cuáles son públicas. Authorize no altera permisos del usuario: el servidor decide.

## Evidencia y límites

- JUnit: servidor HTTP real, H2 de prueba, validación de JWT, BCrypt, CRUD, permisos, Swagger, CORS, idempotencia y concurrencia. Informes regenerables en Backend/target/surefire-reports.
- Vitest: casos originales adaptados a operaciones asíncronas y dobles HTTP; siete casos añadidos de sesión e importación. Ver RESULTADOS.md y COBERTURA.md para conteos y mediciones.
- Integración real con MySQL y Chromium: [resultado de ejecución](evaluacion3-integracion.json). El script crea una base temporal y la elimina; no modifica zona_bikers ni publica nada.
- Captura local del pedido: test-results/checkout-mysql.png, regenerable.
- No se ejecutaron llamadas reales a Gemini durante las pruebas; se conservó el servidor y pasaron sus casos.
- La guía manual de Swagger está preparada; el script integral también ejecuta Try it out / Execute de GET /api/prueba en Swagger UI. La grabación del recorrido/defensa sigue pendiente.
- El código de Evaluación 3 está integrado en main; EC2 y despliegue público no forman parte del alcance.

## Migración local

El panel de administrador ofrece importación cuando encuentra productosBikers o usuariosBikers. No autentica con esos datos. Solo crea registros que no existen; los conflictos permanecen para revisión manual. Las cuentas se importan con una contraseña nueva indicada por el administrador, nunca con las contraseñas débiles de la demostración anterior.

Los registros importados se retiran de las listas antiguas después del éxito HTTP. Se conserva lo no importado. No se importan pedidos locales como ventas. La carga inicial del catálogo ocurre solo si la tabla está vacía y SEED_CATALOG=true; desactivar esa opción si se desea conservar una tabla vacía después de borrar el catálogo.
