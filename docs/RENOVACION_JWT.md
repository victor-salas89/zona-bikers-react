# Renovacion del JWT — Evaluacion 3

## Comportamiento

`POST /api/auth/refresh` requiere `Authorization: Bearer <JWT vigente>`, sin cuerpo. Devuelve `token`, `expira` y `usuario`, igual que el login. La operacion consulta el usuario actual, bloquea la cuenta durante la transaccion y comprueba que la sesion no haya vencido ni cambiado de version. Revoca el identificador anterior y crea uno nuevo. Repetir el token anterior no permite renovarlo nuevamente.

React solicita la renovacion antes de una peticion privada si quedan menos de cinco minutos de vigencia. Las peticiones concurrentes comparten una renovacion; Web Locks la coordina entre pestanas cuando el navegador lo admite. Al terminar se guarda el nuevo token y vencimiento. Una respuesta tardia no restaura una sesion cerrada ni reemplaza otra cuenta.

No hay un refresh token independiente. La renovacion solo prolonga una sesion todavia vigente y usada activamente. Si vence por inactividad o fue revocada, es necesario ingresar otra vez. Se conservan los roles del servidor, el control 401/403 y BCrypt. No se almacenan contrasenas para renovar.

## Demostracion en Swagger

1. Login con una cuenta de cliente y autorizar con su token.
2. Ejecutar POST /api/auth/refresh: 200 con token distinto y vencimiento nuevo.
3. Conservar por separado el anterior y el nuevo para la prueba, sin publicarlos.
4. Autorizar con el anterior y ejecutar GET /api/auth/me: 401.
5. Autorizar con el nuevo y ejecutar GET /api/auth/me: 200.
6. Con el nuevo, GET /api/usuarios: 403 si es cliente.
7. POST /api/auth/logout: 204; POST /api/auth/refresh con ese token: 401.
8. Sin token, alterado o vencido: POST /api/auth/refresh devuelve 401.

Para probar React rapidamente, iniciar con JWT_MINUTES=1 antes del login. Cada solicitud privada dentro de esa ventana solicita una renovacion. Para probar vencimiento por inactividad, no realizar solicitudes hasta transcurrir el minuto. Restablecer luego el valor normal.

## Validacion

- ESLint y compilacion Vite: correctos.
- Compilacion Java y compilacion de pruebas: correctas.
- Siete pruebas de transporte/sesion ejecutadas con Vitest en Node y almacenamiento simulado: correctas. Incluyen renovacion concurrente y respuesta tardia tras logout. Esta ejecucion no reemplaza Chromium.
- La ejecucion HTTP de JUnit no puede completarse en el entorno de revision porque bloquea sockets locales. Ejecutar la suite completa en la terminal del proyecto antes de integrar.
- Los informes anteriores en RESULTADOS.md y evaluacion3-integracion.json corresponden a la version previa a este cambio; no acreditan por si solos la renovacion.

Comandos desde la raiz, con JAVA_HOME configurado:

```powershell
npm test
npm run lint
npm run build
Backend/mvnw.cmd -f Backend/pom.xml test
```

Se agregaron escenarios HTTP de renovacion, permisos y revocacion a ApiIntegrationTests y pruebas del servicio con H2 en JwtRenovacionTests.
