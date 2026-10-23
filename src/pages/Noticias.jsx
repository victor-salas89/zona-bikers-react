import { cargarLista } from "../utils/almacenamiento";
import { useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import TarjetaNoticia from "../components/TarjetaNoticias";

/**
 * Página del blog: lista las noticias con una tarjeta por cada una.
 * Carga los datos desde data/noticias.json y muestra un mensaje si la carga falla.
 *
 * @returns {JSX.Element} Página de noticias.
 */
function Noticias() {
  const [noticias, setNoticias] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    cargarLista("noticias")
      .then((datos) => setNoticias(datos))
      .catch(() => setError(true));
  }, []);

  return (
    <section>
      <h1>Blog Zona Bikers</h1>
      <p>Consejos, novedades y datos útiles para motociclistas.</p>
      {error && <p>No se pudieron cargar las noticias.</p>}
      <Row xs={1} md={3} className="g-4">
        {noticias.map((noticia) => (
          <Col key={noticia.id}>
            <TarjetaNoticia noticia={noticia} />
          </Col>
        ))}
      </Row>
    </section>
  );
}

export default Noticias;