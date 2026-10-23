export function obtenerUrlChat(entorno) {
  const url = entorno.VITE_CHAT_API_URL?.trim();
  return url || (entorno.PROD ? '' : '/api/chat');
}
