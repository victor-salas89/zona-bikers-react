import { leerSesion, limpiarSesion, guardarSesion } from './sesion';
const base = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');
let renovacionPendiente;
async function solicitar(ruta, { method = 'GET', body, publico = false } = {}, sesion = null) {
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
    if (respuesta.status === 401 && !publico && leerSesion()?.token === sesion?.token) limpiarSesion();
    throw new Error(datos?.message || (respuesta.status === 403 ? 'No tienes permisos para esta acción.' : 'No se pudo completar la solicitud.'));
  }
  return datos;
}

export function renovarSesion() {
  if (renovacionPendiente) return renovacionPendiente;
  const esperado = leerSesion()?.token;
  const renovar = async () => {
    const actual = leerSesion();
    if (!actual) throw new Error('Debes iniciar sesion.');
    // Otra pestana puede haber completado la rotacion mientras esperabamos.
    if (actual.token !== esperado) return actual;
    const nueva = await solicitar('/auth/refresh', { method: 'POST' }, actual);
    if (!nueva?.token || !nueva.usuario || !(Date.parse(nueva.expira) > Date.now())) {
      throw new Error('La respuesta de renovacion no es valida.');
    }
    // Nunca restaurar una cuenta que cerro sesion mientras esperaba la red.
    if (leerSesion()?.token !== actual.token) return leerSesion();
    guardarSesion(nueva);
    return nueva;
  };
  // Web Locks coordina la rotacion entre pestanas del mismo navegador.
  renovacionPendiente = Promise.resolve().then(() => globalThis.navigator?.locks
    ? navigator.locks.request('zona-bikers-renovar', renovar)
    : renovar()).finally(() => { renovacionPendiente = undefined; });
  return renovacionPendiente;
}

export async function api(ruta, opciones = {}) {
  if (!opciones.publico && renovacionPendiente) await renovacionPendiente;
  let sesion = opciones.publico ? null : leerSesion();
  const autenticacion = ruta.startsWith('/auth/') && ruta !== '/auth/me';
  if (sesion && !autenticacion && Date.parse(sesion.expira) - Date.now() < 5 * 60 * 1000) {
    sesion = await renovarSesion();
  }
  return solicitar(ruta, opciones, sesion);
}
