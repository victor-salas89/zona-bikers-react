import { useState, useEffect } from "react";
import { cargarProductos } from "../utils/catalogo";
import { Link, useSearchParams } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import TarjetaProducto from "../components/TarjetaProducto";
import { useCarrito } from "../context/CarritoContext";
import { precioVigente, tieneOferta } from '../utils/precios';

/**
 * Página de detalle de un producto.
 * Toma el id de la dirección (/detalle-producto?id=...); si falta o no es válido,
 * usa 1, y si no existe un producto con ese id, muestra el primero.
 * Carga los datos desde data/productos.json, muestra imagen, descripción, precio
 * y stock, permite elegir la cantidad para agregar al carrito y lista los demás
 * productos como relacionados. Mientras carga muestra "Cargando producto..." y, si falla, un error.
 *
 * @returns {JSX.Element} Página de detalle del producto.
 */
function DetalleProducto() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [parametros] = useSearchParams();
  const { agregar, error: errorCarrito } = useCarrito();

  useEffect(() => {
    cargarProductos()
      .then((datos) => setProductos(datos))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  const id = Number(parametros.get("id")) || 1;
  const producto = productos.find((p) => p.id === id) || productos[0];

  if (!producto) {
    return (
      <section>
        <h1>Detalle del producto</h1>
        {error ? (
          <p>No se pudo cargar el producto.</p>
        ) : (
          <p>{cargando ? 'Cargando producto...' : 'No hay productos disponibles.'}</p>
        )}
      </section>
    );
  }

  const relacionados = productos.filter((p) => p.id !== producto.id);

  /**
   * Agrega al carrito la cantidad elegida. Si la cantidad es menor que 1 o no es
   * un número, avisa con un mensaje y no agrega nada.
   */
  const manejarAgregar = () => {
    const unidades = Number(cantidad);
    if (!Number.isInteger(unidades) || unidades < 1) {
      alert("La cantidad debe ser al menos 1.");
      return;
    }
    if (!agregar(producto, unidades)) return;
    alert(`¡${producto.nombre} agregado al carrito!`);
  };

  return (
    <>
      <section>
        <h1 className="mb-4">Detalle del producto</h1>
        <Row className="g-4 align-items-start">
          <Col md={5}>
            <img
              src={producto.imagen}
              alt={producto.alt}
              className="img-fluid rounded shadow-sm"
            />
          </Col>
          <Col md={7}>
            <h2>{producto.nombre}</h2>
            <p>{producto.descripcion}</p>
            {tieneOferta(producto) && <p>Oferta · Precio normal: <del>${producto.precio.toLocaleString('es-CL')}</del></p>}
            <p className="precio fs-4">
              Precio: ${precioVigente(producto).toLocaleString("es-CL")}
            </p>
            <p className="text-muted">
              Stock disponible: {producto.stock} unidades
            </p>
            <Row className="g-2 align-items-end mb-3">
              <Col xs={4} sm={3}>
                <Form.Label htmlFor="cantidad">Cantidad</Form.Label>
                <Form.Control
                  id="cantidad"
                  type="number"
                  min="1"
                  max={producto.stock}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </Col>
            </Row>
            {errorCarrito && <p role="alert">{errorCarrito}</p>}
            <div className="d-flex gap-2 flex-wrap">
              <Button disabled={producto.stock === 0} onClick={manejarAgregar}>Agregar al carrito</Button>
              <Button as={Link} to="/productos" variant="outline-secondary">
                Volver a productos
              </Button>
            </div>
          </Col>
        </Row>
      </section>

      <section className="my-5">
        <h2 className="mb-4">Productos relacionados</h2>
        <Row xs={1} sm={2} lg={4} className="g-4">
          {relacionados.map((p) => (
            <Col key={p.id}>
              <TarjetaProducto producto={p} />
            </Col>
          ))}
        </Row>
      </section>
    </>
  );
}

export default DetalleProducto;
