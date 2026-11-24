import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from 'react';
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { useUsuario } from '../utils/sesion';
import { cerrarSesion } from '../utils/cuentas';

/**
 * Barra de navegación principal de la tienda.
 * Enlaza a Inicio, Productos, Nosotros, Noticias, Contacto, Iniciar sesión y Carrito.
 * Resalta el enlace activo y se colapsa en pantallas angostas.
 *
 * @returns {JSX.Element} Barra de navegación superior.
 */
function NavbarSuperior() {
  const [expandido, setExpandido] = useState(false);
  useLocation();
  const navigate = useNavigate();
  const usuario = useUsuario();
  const [error, setError] = useState('');
  const salir = async () => {
    try { await cerrarSesion(); navigate('/login'); }
    catch (e) { setError(e.message); }
  };
  return (
    <Navbar expand="lg" expanded={expandido} onToggle={setExpandido} variant="dark" className="navbar-biker">
      <Container>
        {error && <p role="alert" className="text-white">{error}</p>}
        <Navbar.Brand as={Link} to="/">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5pjgqI8KZT4oPyWYDkjK8U14IbxiXeRyqSHTZCyQbVw&s=10" alt="" className="brand-logo" />
          Zona Bikers
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="menu-principal" aria-expanded={expandido} label="Abrir o cerrar menú" />
        <Navbar.Collapse id="menu-principal">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/">Inicio</Nav.Link>
            <Nav.Link as={NavLink} to="/productos">Productos</Nav.Link>
            <Nav.Link as={NavLink} to="/ofertas">Ofertas</Nav.Link>
            <Nav.Link as={NavLink} to="/nosotros">Nosotros</Nav.Link>
            <Nav.Link as={NavLink} to="/noticias">Noticias</Nav.Link>
            <Nav.Link as={NavLink} to="/contacto">Contacto</Nav.Link>
            {usuario ? <>
              {usuario.rol !== "cliente" && <Nav.Link as={NavLink} to="/admin">Administración</Nav.Link>}
              <Nav.Item><button type="button" className="btn btn-outline-light btn-sm" onClick={salir}>Cerrar sesión</button></Nav.Item>
            </> : <Nav.Link as={NavLink} to="/login">Iniciar sesión</Nav.Link>}
            <Nav.Link as={NavLink} to="/carrito">Carrito</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarSuperior;
