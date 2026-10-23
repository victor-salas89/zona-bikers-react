import { Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Ratio from "react-bootstrap/Ratio";

/**
 * Tarjeta de una noticia con video incrustado, título, fecha y contenido.
 *
 * @param {Object} props
 * @param {Object} props.noticia - Datos de la noticia.
 * @param {string} props.noticia.video - URL del video que se incrusta.
 * @param {string} props.noticia.tituloVideo - Título accesible del video.
 * @param {string} props.noticia.titulo - Título de la noticia.
 * @param {string} props.noticia.fecha - Fecha que se muestra bajo el título.
 * @param {string} props.noticia.contenido - Texto de la noticia.
 * @returns {JSX.Element} Tarjeta de la noticia.
 */
function TarjetaNoticia({ noticia }) {
  return (
    <Card as="article" className="card-biker h-100">
      <Ratio aspectRatio="16x9">
        <iframe
          src={noticia.video}
          title={noticia.tituloVideo}
          loading="lazy"
          allowFullScreen
        ></iframe>
      </Ratio>
      <Card.Body>
        <Card.Title as="h2" className="h5">
          {noticia.titulo}
        </Card.Title>
        <p className="text-muted small"><time dateTime={noticia.fecha}>{noticia.fecha}</time></p>
        <Card.Text>{noticia.contenido}</Card.Text>
        {noticia.id < 3 && <Link to={noticia.enlace}>Leer artículo: {noticia.titulo}</Link>}
      </Card.Body>
    </Card>
  );
}

export default TarjetaNoticia;