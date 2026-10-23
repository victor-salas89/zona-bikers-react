import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { obtenerUsuarios } from "../utils/cuentas";
import { validarLogin } from "../utils/validaciones";

/**
 * Página de inicio de sesión (educativa).
 * Valida los campos con validarLogin y busca el usuario en las cuentas locales.
 * Si las credenciales son correctas, guarda { correo, rol } en sessionStorage
 * (clave "usuario") y redirige: clientes a "/", el resto a "/admin".
 * Si son incorrectas, muestra un mensaje de error en el campo de contraseña.
 *
 * @returns {JSX.Element} Formulario de inicio de sesión.
 */
function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  /**
   * Maneja el envío del formulario: valida, autentica y redirige.
   *
   * @param {Event} evento - Evento submit del formulario.
   */
  const manejarEnvio = (evento) => {
    evento.preventDefault();

    const nuevosErrores = validarLogin(correo, contrasena);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const usuario = obtenerUsuarios().find(
      (u) => u.correo === correo.trim().toLowerCase() && u.contrasena === contrasena.trim()
    );

    if (!usuario) {
      setErrores({ contrasena: "El correo o la contraseña son incorrectos." });
      return;
    }

    setErrores({});
    sessionStorage.setItem(
      "usuario",
      JSON.stringify({ correo: usuario.correo, rol: usuario.rol })
    );
    alert(`¡Inicio de sesión correcto! Bienvenido/a (${usuario.rol}).`);
    navigate(usuario.rol === "cliente" ? "/" : "/admin");
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
            <Button type="submit" className="w-100 mb-3">
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