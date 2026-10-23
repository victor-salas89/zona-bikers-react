import { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { validarDominioCorreo } from "../utils/validaciones";

/**
 * Página de contacto con formulario de nombre, correo y comentario.
 * Reglas: los tres campos son obligatorios; nombre y correo admiten hasta 100
 * caracteres y el comentario hasta 500; el correo debe ser @duoc.cl, @profesor.duoc.cl
 * o @gmail.com. Al enviar con éxito, limpia el formulario.
 *
 * @returns {JSX.Element} Formulario de contacto.
 */
function Contacto() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [comentario, setComentario] = useState("");
  const [errores, setErrores] = useState({});

  /**
   * Revisa los tres campos y arma los mensajes de error.
   *
   * @returns {Object} Errores por campo (nombre, correo, comentario); vacío si todo es válido.
   */
  const validar = () => {
    const nuevos = {};
    const n = nombre.trim();
    const c = correo.trim();
    const m = comentario.trim();

    if (n === "") nuevos.nombre = "El nombre es requerido.";
    else if (n.length > 100)
      nuevos.nombre = "El nombre no puede superar los 100 caracteres.";

    if (c === "") nuevos.correo = "El correo es requerido.";
    else if (c.length > 100)
      nuevos.correo = "El correo no puede superar los 100 caracteres.";
    else if (!validarDominioCorreo(c))
      nuevos.correo =
        "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";

    if (m === "") nuevos.comentario = "El comentario es requerido.";
    else if (m.length > 500)
      nuevos.comentario = "El comentario no puede superar los 500 caracteres.";

    return nuevos;
  };

  /**
   * Maneja el envío: valida y, si no hay errores, confirma el envío y limpia el formulario.
   *
   * @param {Event} evento - Evento submit del formulario.
   */
  const manejarEnvio = (evento) => {
    evento.preventDefault();
    const nuevos = validar();
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    alert("Mensaje validado. Esta demostración no envía correos.");
    setNombre("");
    setCorreo("");
    setComentario("");
  };

  return (
    <section>
      <h1>Contacto</h1>
      <p>Prueba el formulario de contacto. Esta versión valida los datos, sin enviar correos.</p>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="card-biker p-4">
            <Form onSubmit={manejarEnvio} noValidate>
              <Form.Group className="mb-3" controlId="nombreContacto">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  maxLength={100}
                  placeholder="Ingrese su nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  isInvalid={!!errores.nombre}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.nombre}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="correoContacto">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control
                  type="email"
                  maxLength={100}
                  placeholder="Ingrese su correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  isInvalid={!!errores.correo}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.correo}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="comentarioContacto">
                <Form.Label>Comentario</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  maxLength={500}
                  placeholder="Escriba su mensaje"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  isInvalid={!!errores.comentario}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.comentario}
                </Form.Control.Feedback>
              </Form.Group>

              <Button type="submit">Enviar mensaje</Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </section>
  );
}

export default Contacto;