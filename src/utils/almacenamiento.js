/** Lee una lista local sin aceptar datos corruptos ni estructuras inesperadas. */
export function leerLista(clave, respaldo = []) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave));
    return Array.isArray(datos) ? datos : respaldo;
  } catch {
    return respaldo;
  }
}

/** Guarda datos de la demostración. Comunica errores de cuota o permisos. */
export function guardarLista(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

/** Lee JSON estático y rechaza respuestas HTTP fallidas y listas inválidas. */
export async function cargarLista(archivo) {
  const respuesta = await fetch(`${import.meta.env.BASE_URL}data/${archivo}.json`);
  if (respuesta.ok === false) throw new Error('No se pudieron cargar los datos.');
  const datos = await respuesta.json();
  if (!Array.isArray(datos)) throw new Error('Formato de datos incorrecto.');
  return datos;
}
