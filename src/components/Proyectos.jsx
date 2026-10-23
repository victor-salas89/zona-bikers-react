import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cargarLista } from '../utils/almacenamiento';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
/** Módulos demostrables del mismo proyecto académico, cargados desde JSON. */
export default function Proyectos() {
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    let activo = true;
    cargarLista('proyectos').then(datos => {
      if (activo) setProyectos(datos);
    }).catch(() => {
      if (activo) setError(true);
    });
    return () => {
      activo = false;
    };
  }, []);
  return <section className="my-5" aria-labelledby="proyectos-titulo">
  <h2 id="proyectos-titulo">Proyecto Zona Bikers: módulos desarrollados</h2>
  <p>Estas tres demostraciones pertenecen al mismo proyecto académico.</p>
  {error && <p role="alert">No se pudieron cargar los módulos del proyecto.</p>}
  <Row xs={1} md={3} className="g-4">{proyectos.map(p => <Col key={p.id}><Card as="article" className="h-100 card-biker">
   <Card.Img src={`${import.meta.env.BASE_URL}${p.imagen}`} alt={p.alt} loading="lazy" />
   <Card.Body><Card.Title as="h3" className="h5">{p.titulo}</Card.Title><Card.Text>{p.descripcion}</Card.Text>
    <p>Tecnologías: {p.tecnologias.join(', ')}</p><Link to={p.demo}>Probar {p.titulo.toLowerCase()}</Link>
   </Card.Body></Card></Col>)}</Row>
 </section>;
}
