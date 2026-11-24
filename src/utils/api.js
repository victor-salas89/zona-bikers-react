import { leerSesion, limpiarSesion } from './sesion';
const base = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');
export async function api(ruta, { method = 'GET', body, publico = false } = {}) {
  const sesion = publico ? null : leerSesion();
  let respuesta;
  try {
    respuesta = await fetch(base + ruta, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(sesion ? { Authorization: `Bearer ${sesion.token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch { throw new Error('No se pudo conectar con la API. Comprueba que el backend esté iniciado.'); }
  if (respuesta.status === 204) return null;
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    if (respuesta.status === 401 && !publico) limpiarSesion();
    throw new Error(datos?.message || (respuesta.status === 403 ? 'No tienes permisos para esta acción.' : 'No se pudo completar la solicitud.'));
  }
  return datos;
}
