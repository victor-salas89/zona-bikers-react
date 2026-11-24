import { api } from './api';
import { leerSesion } from './sesion';
import { regionesYComunas } from '../data/usuarios';
import { precioVigente } from './precios';

export const entregas = { retiro: { nombre: 'Retiro en tienda', costo: 0 }, domicilio: { nombre: 'Despacho a domicilio', costo: 3990 } };
export function datosComprador() {
  const datos = { nombre: '', correo: '', direccion: '', region: '', comuna: '', entrega: '' };
  try {
    const sesion = leerSesion()?.usuario;
    if (typeof sesion?.correo !== 'string') return datos;
    datos.correo = sesion.correo.trim().toLowerCase();
    const cuenta = sesion;
    for (const campo of ['nombre', 'direccion', 'region', 'comuna']) {
      if (typeof cuenta?.[campo] === 'string') datos[campo] = cuenta[campo];
    }
  } catch { /* Los campos quedan vacíos si no hay perfil disponible. */ }
  return datos;
}
export function validarCompra(datos) {
  const errores = {};
  if (datos.nombre.trim().length < 2) errores.nombre = 'Ingresa un nombre de al menos 2 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) errores.correo = 'Ingresa un correo válido.';
  if (datos.direccion.trim().length < 5) errores.direccion = 'Ingresa una dirección de al menos 5 caracteres.';
  if (!Object.hasOwn(regionesYComunas, datos.region)) errores.region = 'Selecciona una región.';
  if (!regionesYComunas[datos.region]?.includes(datos.comuna)) errores.comuna = 'Selecciona una comuna de la región.';
  if (!Object.hasOwn(entregas, datos.entrega)) errores.entrega = 'Selecciona una opción de entrega.';
  return errores;
}
export function resumenCompra(productos, entrega) {
  const subtotal = productos.reduce((suma, p) => suma + precioVigente(p) * p.cantidad, 0);
  const costoEntrega = entregas[entrega]?.costo || 0;
  return { subtotal, costoEntrega, total: subtotal + costoEntrega };
}
export async function guardarPedido(productos, comprador, estado, clave = crypto.randomUUID()) {
  if (!productos.length || Object.keys(validarCompra(comprador)).length || !['aprobada', 'rechazada'].includes(estado)) throw new Error('Compra inválida.');
  return api('/pedidos', { method: 'POST', body: { productos: productos.map(({ id, cantidad }) => ({ id, cantidad })), comprador, estado, clave } });
}
export const leerPedido = id => api('/pedidos/' + encodeURIComponent(id));
