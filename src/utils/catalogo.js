import { api } from './api';
import { categoriaProducto, categorias } from './categorias';
import { validarOferta } from './precios';
export async function cargarProductos() {
  const productos = await api('/productos', { publico: true });
  if (!Array.isArray(productos)) throw new Error('Formato de catálogo incorrecto.');
  return productos.map(p => ({ ...p, categoria: categoriaProducto(p) }));
}
export async function guardarProducto(datos, id) {
  const error = validarOferta(datos.precio, datos.precioOferta);
  if (error) throw new Error(error);
  if (!categorias.includes(datos.categoria ?? categoriaProducto(datos))) throw new Error('Selecciona una categoría válida.');
  return api(id ? '/productos/' + id : '/productos', { method: id ? 'PUT' : 'POST', body: {
    ...datos, categoria: categoriaProducto(datos), precioOferta: datos.precioOferta === '' || datos.precioOferta == null ? null : Number(datos.precioOferta),
    stockCritico: datos.stockCritico === '' || datos.stockCritico == null ? null : Number(datos.stockCritico),
  } });
}
export const eliminarProducto = id => api('/productos/' + id, { method: 'DELETE' });
