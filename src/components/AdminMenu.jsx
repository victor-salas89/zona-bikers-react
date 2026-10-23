import { NavLink } from "react-router-dom";
import { useState } from 'react';
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";

/**
 * Barra de navegación del panel de administración.
 * Enlaza a Inicio, Productos y Usuarios del panel y permite volver a la tienda.
 * Se colapsa en un menú desplegable en pantallas angostas.
 *
 * @returns {JSX.Element} Barra de navegación del administrador.
 */
function AdminMenu() {
  const [expandido, setExpandido] = useState(false);
  return (
    <Navbar expand="lg" expanded={expandido} onToggle={setExpandido} variant="dark" className="navbar-admin mb-4">
      <Container>
        <Navbar.Brand as="span">Zona Bikers - Administración</Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-admin" aria-expanded={expandido} label="Abrir o cerrar menú de administración" />
        <Navbar.Collapse id="menu-admin">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/admin" end>Inicio</Nav.Link>
            <Nav.Link as={NavLink} to="/admin-productos">Productos</Nav.Link>
            <Nav.Link as={NavLink} to="/admin-usuarios">Usuarios</Nav.Link>
            <Nav.Link as={NavLink} to="/">Volver a la tienda</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AdminMenu;
