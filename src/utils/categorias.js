export const categorias = ['cascos', 'guantes', 'chaquetas', 'protecciones', 'otros'];

/** Compatibilidad en memoria: no sustituye ni borra el catálogo guardado. */
export function categoriaProducto(producto) {
  if (categorias.includes(producto.categoria)) return producto.categoria;
  return { CAS001: 'cascos', GUA001: 'guantes', CHA001: 'chaquetas', PRO001: 'protecciones' }[producto.codigo] || 'otros';
}
