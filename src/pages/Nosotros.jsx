import { cargarLista } from "../utils/almacenamiento";
import { useState, useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import TarjetaMiembro from "../components/TarjetaMiembro";

/**
 * Página "Nosotros": presenta al equipo con una tarjeta por integrante.
 * Carga los datos desde data/equipo.json y muestra un mensaje si la carga falla.
 *
 * @returns {JSX.Element} Página del equipo.
 */
function Nosotros() {
  const [equipo, setEquipo] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    cargarLista("equipo")
      .then((datos) => setEquipo(datos))
      .catch(() => setError(true));
  }, []);

  return (
    <section>
      <h1>Nosotros</h1>
      <p>Conoce al equipo que construyó Zona Bikers.</p>
      {error && <p>No se pudo cargar la información del equipo.</p>}
      <Row xs={1} md={3} className="g-4">
        {equipo.map((miembro) => (
          <Col key={miembro.id}>
            <TarjetaMiembro miembro={miembro} />
          </Col>
        ))}
      </Row>
    </section>
  );
}

export default Nosotros;