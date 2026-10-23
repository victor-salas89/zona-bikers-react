import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";

/**
 * Tarjeta de un integrante del equipo, con foto, nombre, rol, biografía y tecnologías.
 * La ruta de la foto se arma a partir de la base de la aplicación (BASE_URL).
 *
 * @param {Object} props
 * @param {Object} props.miembro - Datos del integrante.
 * @param {string} props.miembro.nombre - Nombre del integrante.
 * @param {string} props.miembro.rol - Rol dentro del equipo.
 * @param {string} props.miembro.bio - Breve biografía.
 * @param {string} props.miembro.foto - Ruta de la foto relativa a la base de la app.
 * @param {string} props.miembro.alt - Texto alternativo de la foto.
 * @param {string[]} props.miembro.tecnologias - Tecnologías que maneja; se muestran como etiquetas.
 * @returns {JSX.Element} Tarjeta del integrante.
 */
function TarjetaMiembro({ miembro }) {
  return (
    <Card as="article" className="card-biker h-100 text-center">
      <Card.Img
        loading="lazy"
        variant="top"
        src={`${import.meta.env.BASE_URL}${miembro.foto}`}
        alt={miembro.alt}
      />
      <Card.Body>
        <Card.Title as="h2" className="h5">
          {miembro.nombre}
        </Card.Title>
        <p className="text-muted small">{miembro.rol}</p>
        <Card.Text>{miembro.bio}</Card.Text>
        {miembro.tecnologias.map((tec) => (
          <Badge key={tec} bg="secondary" className="me-1">
            {tec}
          </Badge>
        ))}
      </Card.Body>
    </Card>
  );
}

export default TarjetaMiembro;