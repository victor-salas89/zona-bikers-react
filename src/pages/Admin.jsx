import { Link } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import AdminMenu from "../components/AdminMenu";

/**
 * Panel principal de administración.
 * Muestra el menú del administrador y dos tarjetas con accesos a la gestión
 * de productos (/admin-productos) y de usuarios (/admin-usuarios).
 *
 * @returns {JSX.Element} Página de inicio del panel de administración.
 */
function Admin() {
  return (
    <>
      <AdminMenu />
      <section>
        <h1>Panel de administración</h1>
        <p>Bienvenido al área administrativa de Zona Bikers.</p>
        <p>Desde este panel podrás gestionar los productos y usuarios del sistema.</p>
      </section>

      <section>
        <h2 className="mb-4">Gestión del sistema</h2>
        <Row xs={1} md={2} className="g-4">
          <Col>
            <Card className="card-biker h-100">
              <Card.Body>
                <h3 className="h5">Productos</h3>
                <Card.Text>
                  Permite visualizar y administrar los productos disponibles en la tienda.
                </Card.Text>
                <Button as={Link} to="/admin-productos">Administrar productos</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="card-biker h-100">
              <Card.Body>
                <h3 className="h5">Usuarios</h3>
                <Card.Text>
                  Permite visualizar y administrar los usuarios registrados en el sistema.
                </Card.Text>
                <Button as={Link} to="/admin-usuarios">Administrar usuarios</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
    </>
  );
}

export default Admin;