import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";

/**
 * Artículo del blog: "5 accesorios importantes para salir a la ruta".
 * Contenido estático con un encabezado temático y un botón para
 * volver a /noticias.
 *
 * @returns {JSX.Element} Página del artículo.
 */
function DetalleBlog2() {
  return (
    <article className="mx-auto" style={{ maxWidth: "760px" }}>
      <h1 className="mb-3">5 accesorios importantes para salir a la ruta</h1>

      <div className="border rounded p-5 text-center text-muted mb-4">
        Consejos Zona Bikers · Seguridad y equipamiento
      </div>

      <p>
        Antes de salir a recorrer la ruta en motocicleta, es importante contar
        con algunos accesorios que ayuden a mejorar la seguridad y comodidad
        durante el viaje.
      </p>

      <h2 className="h4">1. Casco</h2>
      <p>
        El casco es uno de los elementos más importantes para cualquier
        motociclista. Debe ajustarse correctamente y encontrarse en buenas
        condiciones.
      </p>

      <h2 className="h4">2. Guantes</h2>
      <p>
        Los guantes ayudan a proteger las manos y también permiten tener un
        mejor agarre durante la conducción.
      </p>

      <h2 className="h4">3. Chaqueta</h2>
      <p>
        Una chaqueta adecuada puede entregar mayor protección y comodidad
        frente al viento y las condiciones del camino.
      </p>

      <h2 className="h4">4. Protección para rodillas</h2>
      <p>
        Las protecciones para rodillas ayudan a reducir el impacto frente a
        posibles caídas o golpes.
      </p>

      <h2 className="h4">5. Mochila o bolso</h2>
      <p>
        Una mochila o bolso diseñado para motociclistas permite transportar
        objetos personales de manera más cómoda durante el viaje.
      </p>

      <p>
        Preparar correctamente cada salida puede ayudar a disfrutar mejor la
        experiencia sobre la motocicleta.
      </p>

      <Button as={Link} to="/noticias" variant="outline-secondary" className="mt-3">
        Volver al blog
      </Button>
    </article>
  );
}

export default DetalleBlog2;