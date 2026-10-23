import { entregas } from '../utils/pedidos';
import { precioVigente } from '../utils/precios';

export default function ResumenPedido({ productos, subtotal, costoEntrega, total, entrega }) {
  const moneda = valor => `$${valor.toLocaleString('es-CL')}`;
  return <section aria-label="Resumen del pedido" className="card-biker card p-3 mb-3">
    <h2 className="h4">Resumen del pedido</h2>
    <ul>{productos.map(p => <li key={p.id}>{p.nombre} — Cantidad: {p.cantidad} — {moneda(precioVigente(p))} c/u — {moneda(precioVigente(p) * p.cantidad)}</li>)}</ul>
    <p>Subtotal: {moneda(subtotal)}</p>
    <p>Entrega: {entregas[entrega]?.nombre || 'Por seleccionar'} — {moneda(costoEntrega)}</p>
    <p>Tarifas de demostración: retiro $0; despacho $3.990. No se realizan cobros.</p>
    <p className="fs-4">Total: <strong>{moneda(total)}</strong></p>
  </section>;
}
