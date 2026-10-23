/**
 * Sección de presentación de una persona (foto, nombre y biografía).
 * Si no se entrega foto, muestra el texto "[Foto por definir]".
 *
 * @param {Object} props
 * @param {string} props.nombre - Nombre de la persona.
 * @param {string} [props.foto] - Ruta de la foto; si falta, se muestra un marcador.
 * @param {string} [props.alt] - Texto alternativo de la foto.
 * @param {string} props.biografia - Texto de la biografía.
 * @returns {JSX.Element} Sección de presentación.
 */
function Presentacion({ nombre, foto, alt, biografia }) {
  return (
    <section className="my-5">
      <h2 className="text-center mb-4">Presentación</h2>
      <div className="row align-items-center justify-content-center g-4">
        <div className="col-md-4 text-center">
          {foto ? (
            <img src={foto} alt={alt} className="img-fluid rounded" />
          ) : (
            <p className="text-muted">[Foto por definir]</p>
          )}
        </div>
        <div className="col-md-6">
          <h3 className="h4">{nombre}</h3>
          <p>{biografia}</p>
        </div>
      </div>
    </section>
  );
}

export default Presentacion;