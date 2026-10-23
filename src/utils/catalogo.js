import { cargarLista, leerLista, guardarLista } from './almacenamiento.js';
import { categorias, categoriaProducto } from './categorias';
import { validarOferta } from './precios';

/** El JSON inicial es la fuente del catálogo hasta que se guarda una edición local. */
export async function cargarProductos() {
  const iniciales = await cargarLista('productos');
  return leerLista('productosBikers', iniciales).map(p => ({ ...p, categoria: categoriaProducto(p) }));
}

/** Guarda altas y ediciones usando el mismo catálogo que ve la tienda. */
export async function guardarProducto(datos, id) {
  const errorOferta = validarOferta(datos.precio, datos.precioOferta);
  if (errorOferta) throw new Error(errorOferta);
  if (datos.categoria !== undefined && !categorias.includes(datos.categoria)) throw new Error('Selecciona una categoría válida.');
  const productos = await cargarProductos();
  if (productos.some(p => p.codigo === datos.codigo && p.id !== id)) {
    throw new Error('Ya existe un producto con ese código.');
  }
  const producto = {
    ...datos,
    categoria: categoriaProducto(datos),
    precioOferta: datos.precioOferta === '' || datos.precioOferta == null ? null : Number(datos.precioOferta),
    id: id ?? Math.max(0, ...productos.map(p => p.id)) + 1
  };
  guardarLista('productosBikers', id ? productos.map(p => p.id === id ? producto : p) : [...productos, producto]);
}

/** Elimina del catálogo persistente. */
export async function eliminarProducto(id) {
  guardarLista('productosBikers', (await cargarProductos()).filter(p => p.id !== id));
}
