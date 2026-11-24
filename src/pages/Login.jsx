import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { iniciarSesion } from "../utils/cuentas";
import { validarLogin } from "../utils/validaciones";

/**
 * Autentica contra Spring Boot y persiste la sesión JWT con su vencimiento.
 * Retoma una ruta protegida o dirige al inicio según el rol devuelto por la API.
 *
 * @returns {JSX.Element} Formulario de inicio de sesión.
 */
function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const [ocupado, setOcupado] = useState(false);

  /**
   * Maneja el envío del formulario: valida, autentica y redirige.
   *
   * @param {Event} evento - Evento submit del formulario.
   */
  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    const nuevosErrores = validarLogin(correo, contrasena);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    if (ocupado) return;
    setOcupado(true);
    try {
      const usuario = await iniciarSesion(correo, contrasena);
      setErrores({});
      const volver = location.state?.volver;
      navigate(typeof volver === 'string' && volver.startsWith('/') && !volver.startsWith('//') ? volver : usuario.rol === 'cliente' ? '/' : '/admin');
    } catch (error) { setErrores({ contrasena: error.message }); }
    finally { setOcupado(false); }
  };

  return (
    <section>
      <h1 className="text-center">Iniciar sesión</h1>
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Form onSubmit={manejarEnvio} noValidate>
            <Form.Group className="mb-3" controlId="correoLogin">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                isInvalid={!!errores.correo}
              />
              <Form.Control.Feedback type="invalid">
                {errores.correo}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="contrasenaLogin">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                isInvalid={!!errores.contrasena}
              />
              <Form.Control.Feedback type="invalid">
                {errores.contrasena}
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" disabled={ocupado} className="w-100 mb-3">
              Entrar
            </Button>
            <p className="text-center">
              ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
            </p>
          </Form>
        </Col>
      </Row>
    </section>
  );
}

export default Login;
