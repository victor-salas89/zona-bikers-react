# ChatBiker: frontend y servidor separados

## Desarrollo local

Copia `.env.example` como `.env.local`. Deja `VITE_CHAT_API_URL` vacía y configura `GEMINI_API_KEY` y `GEMINI_MODEL` solo para el servidor local. Ejecuta `npm.cmd run dev`: Vite sirve el frontend y el endpoint `/api/chat`. Reinicia Vite después de cambiar las variables.

## Frontend en GitHub Pages

Pages sirve los archivos estáticos de `dist`; no ejecuta el servidor Node ni Gemini.

Antes de ejecutar `npm.cmd run build`, configura únicamente la URL pública completa del endpoint:

```env
VITE_CHAT_API_URL=https://api.example.com/api/chat
```

Sustituye el dominio de ejemplo por el del servidor que alojes. Usa HTTPS, sin claves, credenciales ni tokens en la URL. Las variables VITE son públicas y quedan incorporadas al JavaScript durante la compilación. Si cambias la dirección, debes reconstruir el frontend. En GitHub Actions puedes definirla como variable del repositorio y pasarla al entorno del paso de build.

No configures `GEMINI_API_KEY` en el build de Pages, ni crees una variable `VITE_GEMINI_API_KEY`. No subas `.env.local`. Una URL vacía o de espacios en producción muestra un aviso y bloquea cualquier envío. `npm.cmd run preview` usa el build de producción, por lo que también requiere una URL configurada; no activa automáticamente el chat local.

## Servidor Gemini independiente

El proveedor elegido debe ejecutar Node 22.9 o superior con salida HTTPS a Google. El código necesario está en `server/`; el arranque en producción es `node server/index.js` con variables privadas configuradas en el proveedor:

- `GEMINI_API_KEY`: secreto de Google, exclusivamente en el servidor.
- `GEMINI_MODEL`: modelo habilitado para tu proyecto.
- `CHAT_ALLOWED_ORIGIN`: origen exacto del frontend, por ejemplo `https://usuario.github.io`, sin nombre del repositorio ni barra final. El servidor admite el preflight OPTIONS para POST JSON y permite ese origen mediante CORS.
- `HOST`: `0.0.0.0` si el alojamiento requiere escuchar conexiones externas; el valor local predeterminado es `127.0.0.1`.
- `PORT`: puerto asignado por el proveedor (3001 por defecto).

El dominio público HTTPS debe dirigir `/api/chat` a este proceso, con un tiempo de espera superior a 60 segundos. CORS no autentica clientes: conserva límites de uso y configura cuotas de Google para el despliegue público. El límite actual es de 20 solicitudes/minuto y 3 simultáneas por proceso, sin almacenamiento compartido.

Todavía falta elegir alojamiento, dominio, origen de Pages y configurar estas variables. No se ha publicado ni contratado ningún servicio.

## Comportamiento y pruebas

El chat mantiene el historial solo en memoria y envía hasta 15 mensajes recientes al servidor. Las respuestas se presentan como texto. Las instrucciones limitan la orientación a motocicletas, pero no garantizan una restricción temática infalible ni sustituyen una revisión en taller.

`npm test` ejecuta Vitest con Chromium real para el frontend y Vitest en Node para el servidor, y actualiza resultados y cobertura. ChatBiker mantiene fetch simulado: prueba URL pública, desarrollo local, producción sin configurar, interacción, errores y limpieza sin claves ni llamadas a Gemini. `npm run test:chat` ejecuta solo los seis casos del servidor con respuestas simuladas. Primero instala el navegador con `npm run test:browser:install`. Ejecuta también `npm run lint` y `npm run build`.

Referencias de API: https://ai.google.dev/api/generate-content y https://ai.google.dev/gemini-api/docs/api-key.
