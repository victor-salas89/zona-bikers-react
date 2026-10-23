import { useState, useEffect } from "react";
import { cargarProductos } from "../utils/catalogo";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import TarjetaProducto from "../components/TarjetaProducto";
import Form from 'react-bootstrap/Form';
import { useSearchParams } from 'react-router-dom';
import { categorias } from '../utils/categorias';
import { tieneOferta } from '../utils/precios';

/**
 * Página de catálogo: lista todos los productos de data/productos.json
 * con una tarjeta por cada uno. Muestra un mensaje si la carga falla.
 *
 * @returns {JSX.Element} Página de productos.
 */
function Productos({ soloOfertas = false }) {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [params, setParams] = useSearchParams();
  const categoria = params.get('categoria') || '';
  const busqueda = params.get('buscar') || '';
  const filtrar = (campo, valor) => {
    const nuevos = new URLSearchParams(params);
    if (valor) nuevos.set(campo, valor); else nuevos.delete(campo);
    setParams(nuevos, { replace: true });
  };

  useEffect(() => {
    cargarProductos()
      .then((datos) => setProductos(datos))
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, []);

  const visibles = productos.filter(p => (!soloOfertas || tieneOferta(p))
    && (!categoria || p.categoria === categoria)
    && p.nombre.toLocaleLowerCase('es').includes(busqueda.trim().toLocaleLowerCase('es')));

  return (
    <section>
      <h1>{soloOfertas ? 'Ofertas' : 'Productos'}</h1>
      <p>{soloOfertas ? 'Precios de oferta de demostración, sin cobros reales.' : 'Revisa nuestros accesorios disponibles para motociclistas.'}</p>
      <Row className="mb-4 g-3">
        <Col md={6}><Form.Group controlId="categoria-publica"><Form.Label>Categoría</Form.Label>
          <Form.Select value={categoria} onChange={e => filtrar('categoria', e.target.value)}>
            <option value="">Todos</option>{categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </Form.Select>
        </Form.Group></Col>
        <Col md={6}><Form.Group controlId="buscar-productos"><Form.Label>Buscar por nombre</Form.Label>
          <Form.Control type="search" value={busqueda} onChange={e => filtrar('buscar', e.target.value)} />
        </Form.Group></Col>
      </Row>
      {cargando && <p>Cargando productos...</p>}
      {error && <p>No se pudieron cargar los productos.</p>}
      <Row xs={1} sm={2} lg={4} className="g-4">
        {visibles.map((producto) => (
          <Col key={producto.id}>
            <TarjetaProducto producto={producto} />
          </Col>
        ))}
      </Row>
      {!cargando && !error && !visibles.length && <p role="status">No hay productos que coincidan con los filtros.</p>}
    </section>
  );
}

export default Productos; 
