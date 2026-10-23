import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cargarProductos } from "../utils/catalogo";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import TarjetaProducto from "../components/TarjetaProducto";
import Presentacion from "../components/Presentacion";
import Proyectos from "../components/Proyectos";

/**
 * Página de inicio de la tienda.
 * Muestra el encabezado con el logo, los productos del catálogo
 * como destacados y la sección de presentación.
 * Si la carga de datos falla, muestra un mensaje de error.
 *
 * @returns {JSX.Element} Página de inicio.
 */
function Inicio() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    cargarProductos()
      .then((datos) => setProductos(datos))
      .catch(() => setError(true));
  }, []);

  return (
    <>
      <header className="hero-biker">
        <div className="hero-copy">
          <p className="hero-eyebrow">Pasión por las dos ruedas</p>
          <h1>Zona Bikers</h1>
          <p className="lead">
            Tienda online de accesorios para motociclistas y motocicletas.
          </p>
          <Link to="/productos" className="btn btn-biker">Explorar productos <span aria-hidden="true">↗</span></Link>
        </div>
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5pjgqI8KZT4oPyWYDkjK8U14IbxiXeRyqSHTZCyQbVw&s=10"
          alt="Zona Bikers"
          className="img-fluid hero-logo"
        />
      </header>

      <section>
        <h2 className="text-center mb-4">Productos destacados</h2>
        {error && <p>No se pudieron cargar los productos.</p>}
        <Row xs={1} sm={2} lg={4} className="g-4">
          {productos.map((producto) => (
            <Col key={producto.id}>
              <TarjetaProducto producto={producto} />
            </Col>
          ))}
        </Row>
      </section>

      <Proyectos />
      <Presentacion
        nombre="Víctor Salas"
        foto={`${import.meta.env.BASE_URL}img/perfil.svg`}
        alt="Avatar ilustrado de perfil; no es una fotografía"
        biografia="Estudiante de Desarrollo Fullstack II. En Zona Bikers participo en la estructura e integración de una tienda de accesorios para motociclistas y su migración a React."
      />
    </>
  );
}

export default Inicio;
