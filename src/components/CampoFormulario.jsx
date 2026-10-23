import Form from "react-bootstrap/Form";

/**
 * Campo de formulario reutilizable con etiqueta y mensaje de error.
 * Marca el campo como inválido cuando recibe un texto en `error`.
 *
 * @param {Object} props
 * @param {string} props.id - Identificador del campo; se usa también como `name`.
 * @param {string} props.etiqueta - Texto de la etiqueta visible.
 * @param {string} props.valor - Valor actual del campo (componente controlado).
 * @param {Function} props.onChange - Manejador que se ejecuta al escribir.
 * @param {string} [props.error] - Mensaje de error; si está vacío, el campo es válido.
 * @param {string} [props.tipo="text"] - Tipo del input (text, email, password, etc.).
 * @param {Object} [props.resto] - Otras propiedades que se pasan al input (placeholder, etc.).
 * @returns {JSX.Element} Grupo de formulario con etiqueta, input y retroalimentación.
 */
function CampoFormulario({ id, etiqueta, valor, onChange, error, tipo = "text", ...resto }) {
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{etiqueta}</Form.Label>
      <Form.Control
        name={id}
        type={tipo}
        value={valor}
        onChange={onChange}
        isInvalid={!!error}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...resto}
      />
      <Form.Control.Feedback id={`${id}-error`} type="invalid" role="alert">{error}</Form.Control.Feedback>
    </Form.Group>
  );
}

export default CampoFormulario;