import { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import CampoFormulario from "../components/CampoFormulario";
import { regionesYComunas } from "../data/usuarios";
import { guardarUsuario } from "../utils/cuentas";
import { validarRegistro, validarLogin } from "../utils/validaciones";

/** Valores iniciales (vacíos) del formulario de registro. */
const datosIniciales = {
  contrasena: "",
  run: "",
  nombre: "",
  apellidos: "",
  correo: "",
  region: "",
  comuna: "",
  direccion: "",
};

/**
 * Página de registro de usuario.
 * Mantiene los datos en un solo estado, valida con validarRegistro al enviar
 * y crea una cuenta local si el registro es válido. La lista de comunas depende
 * de la región elegida; al cambiar de región, la comuna se reinicia.
 *
 * @returns {JSX.Element} Formulario de registro.
 */
function Registro() {
  const [datos, setDatos] = useState(datosIniciales);
  const [errores, setErrores] = useState({});

  const comunas = regionesYComunas[datos.region] || [];

  /**
   * Actualiza el campo modificado. Si cambia la región, reinicia la comuna.
   *
   * @param {Event} evento - Evento change del campo.
   */
  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setDatos((anterior) => ({
      ...anterior,
      [name]: value,
      ...(name === "region" ? { comuna: "" } : {}),
    }));
  };

  /**
   * Valida los datos; si no hay errores, confirma el registro y limpia el formulario.
   *
   * @param {Event} evento - Evento submit del formulario.
   */
  const manejarEnvio = (evento) => {
    evento.preventDefault();
    const nuevosErrores = { ...validarRegistro(datos), ...validarLogin(datos.correo, datos.contrasena) };
    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length === 0) {
      try { guardarUsuario({ ...datos, rol: "cliente" }); }
      catch (error) { setErrores({ correo: error.message }); return; }
      alert("Cuenta local creada. Ya puedes iniciar sesión en este navegador.");
      setDatos(datosIniciales);
    }
  };

  return (
    <section>
      <h1 className="text-center">Registro de usuario</h1>
      <p className="text-center">
        Completa tus datos para crear una cuenta en Zona Bikers.
      </p>
      <Row className="justify-content-center">
        <Col md={8} lg={7}>
          <Card className="card-biker p-4">
            <Form onSubmit={manejarEnvio} noValidate>
              <CampoFormulario id="run" etiqueta="RUN" valor={datos.run}
                onChange={manejarCambio} error={errores.run}
                placeholder="Sin puntos ni guión" />
              <CampoFormulario id="nombre" etiqueta="Nombre" valor={datos.nombre}
                onChange={manejarCambio} error={errores.nombre} />
              <CampoFormulario id="apellidos" etiqueta="Apellidos" valor={datos.apellidos}
                onChange={manejarCambio} error={errores.apellidos} />
              <CampoFormulario id="correo" etiqueta="Correo" tipo="email" valor={datos.correo}
                onChange={manejarCambio} error={errores.correo} />

              <CampoFormulario id="contrasena" etiqueta="Contraseña" tipo="password" valor={datos.contrasena}
                onChange={manejarCambio} error={errores.contrasena} autoComplete="new-password" />
              <Form.Group className="mb-3" controlId="region">
                <Form.Label>Región</Form.Label>
                <Form.Select name="region" value={datos.region} onChange={manejarCambio}>
                  <option value="">Seleccione una región</option>
                  {Object.keys(regionesYComunas).map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="comuna">
                <Form.Label>Comuna</Form.Label>
                <Form.Select name="comuna" value={datos.comuna}
                  onChange={manejarCambio} disabled={!datos.region}>
                  <option value="">Seleccione una comuna</option>
                  {comunas.map((comuna) => (
                    <option key={comuna} value={comuna}>{comuna}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <CampoFormulario id="direccion" etiqueta="Dirección" valor={datos.direccion}
                onChange={manejarCambio} error={errores.direccion} />

              <Button type="submit" className="w-100">Registrarme</Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </section>
  );
}

export default Registro;