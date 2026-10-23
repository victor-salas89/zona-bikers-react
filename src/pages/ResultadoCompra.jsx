import { Link, useParams } from 'react-router-dom';
import { leerPedido } from '../utils/pedidos';
import ResumenPedido from '../components/ResumenPedido';

export default function ResultadoCompra() {
  const { id } = useParams();
  const pedido = leerPedido(id);
  if (!pedido) return <section><h1>Pedido no disponible</h1><p>No se pudo recuperar el resumen.</p><Link to="/carrito">Volver al carrito</Link></section>;
  return <section><h1>Compra {pedido.estado}</h1><p>Simulación sin cobros. Pedido: {pedido.id}</p>
    {pedido.estado === 'rechazada' && <p>La compra fue rechazada. Tu carrito se conserva para reintentar.</p>}
    <p>{pedido.comprador.nombre} — {pedido.comprador.correo}</p><p>{pedido.comprador.direccion}, {pedido.comprador.comuna}, {pedido.comprador.region}</p>
    <ResumenPedido {...pedido} entrega={pedido.comprador.entrega} />
    {pedido.estado === 'rechazada' ? <Link to="/checkout">Reintentar compra</Link> : <Link to="/productos">Seguir comprando</Link>}
  </section>;
}
