import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import AdminMenu from '../components/AdminMenu';
import { cargarProductos, eliminarProducto } from '../utils/catalogo';
/** Lista el catálogo persistente y permite editar y eliminar productos. */
export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    cargarProductos().then(setProductos).catch(() => setError('No se pudo cargar el catálogo.'));
  }, []);
  const eliminar = async id => {
    if (!window.confirm('¿Eliminar este producto del catálogo?')) return;
    try {
      await eliminarProducto(id);
      setProductos(await cargarProductos());
    } catch {
      setError('No se pudo eliminar el producto.');
    }
  };
  return <><AdminMenu /><h1>Administración de productos</h1>
  <Button as={Link} to="/admin-nuevo-producto">Crear nuevo producto</Button>
  {error && <p role="alert">{error}</p>}
  <Table striped bordered responsive className="mt-4"><caption>Catálogo guardado en este navegador</caption>
   <thead><tr><th scope="col">Código</th><th scope="col">Nombre</th><th scope="col">Precio</th><th scope="col">Stock</th><th scope="col">Acciones</th></tr></thead>
   <tbody>{productos.map(p => <tr key={p.id}><td>{p.codigo}</td><th scope="row">{p.nombre}</th><td>${p.precio.toLocaleString('es-CL')}</td><td>{p.stock}</td><td>
    <Link className="btn btn-outline-secondary btn-sm me-2" to={`/admin-nuevo-producto?id=${p.id}`}>Editar {p.nombre}</Link>
    <Button size="sm" variant="outline-danger" onClick={() => eliminar(p.id)}>Eliminar {p.nombre}</Button>
   </td></tr>)}</tbody></Table></>;
}
