import { useNavigate } from "react-router-dom";
import { precioVigente } from '../utils/precios';
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useCarrito } from "../context/CarritoContext";

/**
 * Página del carrito de compras.
 * Lista los productos del carrito (CarritoContext) con su precio, un campo para
 * cambiar la cantidad y un botón para eliminarlos. Muestra el total y permite
 * vaciar el carrito (con confirmación) o finalizar la compra.
 * Los botones se deshabilitan si el carrito está vacío.
 *
 * @returns {JSX.Element} Página del carrito.
 */
function Carrito() {
  const { carrito, cambiarCantidad, eliminar, vaciar, total, error } = useCarrito();

  /** Vacía el carrito si la persona lo confirma en el cuadro de diálogo. */
  const manejarVaciar = () => {
    if (window.confirm("¿Estás seguro de vaciar todo tu carrito?")) vaciar();
  };

  const navigate = useNavigate();
  const manejarFinalizar = () => navigate("/checkout");

  return (
    <section>
      <h1>Carrito de compras</h1>
      <p>Demostración de compra: no se realizan cobros ni pedidos reales.</p>
      {error && <p role="alert">{error}</p>}

      {carrito.length === 0 && (
        <p className="text-muted fs-5">Tu carrito está vacío.</p>
      )}

      {carrito.map((producto) => (
        <Card as="article" key={producto.id} className="card-biker mb-3">
          <Row className="g-0 align-items-center">
            <Col xs={3} sm={2}>
              <img
                src={producto.imagen}
                alt={producto.alt || producto.nombre}
                className="img-fluid rounded-start p-2"
              />
            </Col>
            <Col xs={9} sm={10}>
              <Card.Body className="d-flex flex-wrap align-items-center gap-3">
                <h2 className="h6 mb-0 flex-grow-1">{producto.nombre}</h2>
                <p className="precio mb-0">
                  Precio: ${precioVigente(producto).toLocaleString("es-CL")}
                </p>
                <div className="d-flex align-items-center gap-2">
                  <Form.Label htmlFor={`cant-${producto.id}`} className="mb-0">
                    Cantidad
                  </Form.Label>
                  <Form.Control
                    id={`cant-${producto.id}`}
                    type="number"
                    min="1"
                    max={producto.stock}
                    size="sm"
                    style={{ width: "5rem" }}
                    value={producto.cantidad}
                    onChange={(e) =>
                      cambiarCantidad(producto.id, Number(e.target.value))
                    }
                  />
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => eliminar(producto.id)}
                >
                  Eliminar
                </Button>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      ))}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-4">
        <p className="fs-4 mb-0">
          Total: <strong>${total.toLocaleString("es-CL")}</strong>
        </p>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={manejarVaciar}
            disabled={carrito.length === 0}
          >
            Vaciar carrito
          </Button>
          <Button onClick={manejarFinalizar} disabled={carrito.length === 0}>
            Finalizar compra
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Carrito;
