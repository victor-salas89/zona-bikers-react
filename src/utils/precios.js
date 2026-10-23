/** precio conserva el valor normal; precioOferta es un importe, nunca un porcentaje. */
export function tieneOferta(producto) {
  return Number.isFinite(producto.precioOferta) && producto.precioOferta > 0 && producto.precioOferta < producto.precio;
}

/** Única regla de precio para catálogo, carrito y compra. Los datos antiguos usan precio. */
export function precioVigente(producto) {
  return tieneOferta(producto) ? producto.precioOferta : producto.precio;
}

export function validarOferta(precio, precioOferta) {
  if (precioOferta === '' || precioOferta === undefined || precioOferta === null) return '';
  return Number.isFinite(Number(precioOferta)) && Number(precioOferta) > 0 && Number(precioOferta) < Number(precio)
    ? '' : 'El precio de oferta debe ser positivo y menor al precio normal.';
}
