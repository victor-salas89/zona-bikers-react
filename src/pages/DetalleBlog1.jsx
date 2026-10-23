import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";

/**
 * Artículo del blog: "Cómo elegir un casco adecuado".
 * Contenido estático con un encabezado temático y un botón para
 * volver a /noticias.
 *
 * @returns {JSX.Element} Página del artículo.
 */
function DetalleBlog1() {
  return (
    <article className="mx-auto" style={{ maxWidth: "760px" }}>
      <h1 className="mb-3">Cómo elegir un casco adecuado</h1>

      <div className="border rounded p-5 text-center text-muted mb-4">
        Consejos Zona Bikers · Seguridad y equipamiento
      </div>

      <p>
        Elegir un casco adecuado es una de las decisiones más importantes para
        cualquier motociclista, ya que este elemento cumple una función
        fundamental en la seguridad durante la conducción.
      </p>
      <p>
        Al momento de elegir un casco es importante revisar que tenga un tamaño
        adecuado. Un casco demasiado suelto puede moverse durante el trayecto,
        mientras que uno demasiado ajustado puede resultar incómodo.
      </p>
      <p>
        También es recomendable considerar el tipo de uso que tendrá. Para
        recorridos urbanos o viajes más largos pueden existir diferentes
        opciones, como cascos integrales, abatibles o abiertos.
      </p>
      <p>
        Otro aspecto importante es revisar el estado general del casco, sus
        correas, cierre y visor. Todos estos elementos ayudan a mejorar la
        experiencia y seguridad del motociclista.
      </p>
      <p>
        En Zona Bikers buscamos ofrecer alternativas que se adapten a las
        necesidades de quienes disfrutan el mundo de las motos.
      </p>

      <Button as={Link} to="/noticias" variant="outline-secondary" className="mt-3">
        Volver al blog
      </Button>
    </article>
  );
}

export default DetalleBlog1;