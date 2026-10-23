import { obtenerUsuarios } from './cuentas';
import { regionesYComunas } from '../data/usuarios';
import { precioVigente } from './precios';

export const entregas = { retiro: { nombre: 'Retiro en tienda', costo: 0 }, domicilio: { nombre: 'Despacho a domicilio', costo: 3990 } };
export function datosComprador() {
  const datos = { nombre: '', correo: '', direccion: '', region: '', comuna: '', entrega: '' };
  try {
    const sesion = JSON.parse(sessionStorage.getItem('usuario'));
    if (typeof sesion?.correo !== 'string') return datos;
    datos.correo = sesion.correo.trim().toLowerCase();
    const cuenta = obtenerUsuarios().find(u => u?.correo?.toLowerCase() === datos.correo);
    for (const campo of ['nombre', 'direccion', 'region', 'comuna']) {
      if (typeof cuenta?.[campo] === 'string') datos[campo] = cuenta[campo];
    }
  } catch { /* Sin sesión utilizable se permite comprar como invitado. */ }
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
export function guardarPedido(productos, comprador, estado) {
  if (!productos.length || Object.keys(validarCompra(comprador)).length || !['aprobada', 'rechazada'].includes(estado)) throw new Error('Compra inválida.');
  // El pedido conserva el precio final pactado, sin oferta que se pueda aplicar otra vez.
  const pedido = { id: crypto.randomUUID(), fecha: new Date().toISOString(), estado, comprador: { ...comprador }, productos: productos.map(p => ({ id: p.id, nombre: p.nombre, precio: precioVigente(p), cantidad: p.cantidad })), ...resumenCompra(productos, comprador.entrega) };
  localStorage.setItem(`pedidoBikers:${pedido.id}`, JSON.stringify(pedido));
  return pedido;
}
export function leerPedido(id) {
  try {
    const p = JSON.parse(localStorage.getItem(`pedidoBikers:${id}`));
    return p?.id === id && ['aprobada', 'rechazada'].includes(p.estado) && p.comprador && Array.isArray(p.productos) && p.productos.length && Number.isFinite(p.total) ? p : null;
  } catch { return null; }
}
