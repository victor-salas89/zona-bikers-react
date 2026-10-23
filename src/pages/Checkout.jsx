import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Row, Col } from 'react-bootstrap';
import CampoFormulario from '../components/CampoFormulario';
import ResumenPedido from '../components/ResumenPedido';
import { useCarrito } from '../context/CarritoContext';
import { regionesYComunas } from '../data/usuarios';
import { datosComprador, entregas, guardarPedido, resumenCompra, validarCompra } from '../utils/pedidos';

export default function Checkout() {
  const { carrito, vaciar } = useCarrito();
  const [datos, setDatos] = useState(datosComprador);
  const [errores, setErrores] = useState({});
  const [error, setError] = useState('');
  const [estado, setEstado] = useState('aprobada');
  const ocupado = useRef(false);
  const navigate = useNavigate();
  const cambiar = ({ target: { name, value } }) => setDatos(anterior => ({ ...anterior, [name]: value, ...(name === 'region' ? { comuna: '' } : {}) }));
  const confirmar = evento => {
    evento.preventDefault();
    if (ocupado.current || !carrito.length) return;
    const validacion = validarCompra(datos);
    setErrores(validacion);
    if (Object.keys(validacion).length) return;
    ocupado.current = true;
    try {
      const pedido = guardarPedido(carrito, datos, estado);
      if (estado === 'aprobada') vaciar();
      navigate(`/compra/${pedido.id}`, { replace: true });
    } catch {
      setError('No se pudo guardar el pedido. Tu carrito se conserva; vuelve a intentarlo.');
      ocupado.current = false;
    }
  };
  if (!carrito.length) return <section><h1>Checkout</h1><p>Tu carrito está vacío.</p><Link to="/productos">Ver productos</Link></section>;
  return <section><h1>Checkout</h1><p>Compra de demostración, sin pagos ni pedidos reales.</p>
    <Row><Col md={6}><Form noValidate onSubmit={confirmar}>
      {['nombre', 'correo', 'direccion'].map((campo, i) => <CampoFormulario key={campo} id={campo} etiqueta={['Nombre', 'Correo', 'Dirección'][i]} tipo={campo === 'correo' ? 'email' : 'text'} valor={datos[campo]} onChange={cambiar} error={errores[campo]} />)}
      {['region', 'comuna', 'entrega'].map((campo, i) => <Form.Group key={campo} controlId={campo} className="mb-3">
        <Form.Label>{['Región', 'Comuna', 'Opción de entrega'][i]}</Form.Label>
        <Form.Select name={campo} value={datos[campo]} onChange={cambiar} disabled={campo === 'comuna' && !datos.region} isInvalid={!!errores[campo]} aria-invalid={!!errores[campo]} aria-describedby={`${campo}-error`}>
          <option value="">Selecciona una opción</option>
          {(campo === 'region' ? Object.keys(regionesYComunas) : campo === 'comuna' ? regionesYComunas[datos.region] || [] : Object.keys(entregas)).map(valor => <option key={valor} value={valor}>{campo === 'entrega' ? entregas[valor].nombre : valor}</option>)}
        </Form.Select><Form.Control.Feedback id={`${campo}-error`} type="invalid" role="alert">{errores[campo]}</Form.Control.Feedback>
      </Form.Group>)}
      <Form.Group controlId="simulacion" className="mb-3"><Form.Label>Resultado a simular</Form.Label><Form.Select value={estado} onChange={e => setEstado(e.target.value)}><option value="aprobada">Compra aprobada</option><option value="rechazada">Compra rechazada</option></Form.Select></Form.Group>
      {error && <p role="alert">{error}</p>}<Button type="submit">Confirmar compra simulada</Button> <Link to="/carrito">Volver al carrito</Link>
    </Form></Col><Col md={6}><ResumenPedido productos={carrito} {...resumenCompra(carrito, datos.entrega)} entrega={datos.entrega} /></Col></Row>
  </section>;
}
