import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { useCarrito } from "../context/CarritoContext";
import { precioVigente, tieneOferta } from '../utils/precios';

/**
 * Tarjeta de un producto con imagen, nombre, descripción y precio en pesos chilenos.
 * Incluye el botón "Agregar al carrito", que usa el contexto del carrito,
 * y un enlace a la página de detalle (/detalle-producto?id=...).
 * Debe usarse dentro de un CarritoProvider y de un Router.
 *
 * @param {Object} props
 * @param {Object} props.producto - Datos del producto.
 * @param {number} props.producto.id - Identificador único.
 * @param {string} props.producto.nombre - Nombre del producto.
 * @param {string} props.producto.descripcion - Descripción corta.
 * @param {number} props.producto.precio - Precio; se muestra con separador de miles.
 * @param {string} props.producto.imagen - URL de la imagen.
 * @param {string} props.producto.alt - Texto alternativo de la imagen.
 * @returns {JSX.Element} Tarjeta del producto.
 */
function TarjetaProducto({ producto }) {
  const { agregar, error } = useCarrito();

  return (
    <Card as="article" className="card-biker h-100">
      <Card.Img
        loading="lazy"
        variant="top"
        src={producto.imagen}
        alt={producto.alt}
        className="card-img-biker"
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title as="h2" className="h5">
          {producto.nombre}
        </Card.Title>
        <Card.Text>{producto.descripcion}</Card.Text>
        {tieneOferta(producto) && <p>Oferta · Precio normal: <del>${producto.precio.toLocaleString('es-CL')}</del></p>}
        <p className="precio">${precioVigente(producto).toLocaleString("es-CL")}</p>
        <div className="mt-auto d-grid gap-2">
          {error && <p role="alert">{error}</p>}
          <Button disabled={producto.stock === 0} onClick={() => agregar(producto)}>Agregar al carrito</Button>
          <Button
            as={Link}
            to={`/detalle-producto?id=${producto.id}`}
            variant="outline-secondary"
            size="sm"
          >
            Ver detalle
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default TarjetaProducto;
