import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import AdminMenu from '../components/AdminMenu';
import { obtenerUsuarios, eliminarUsuario } from '../utils/cuentas';
/** Administración de cuentas persistentes; el servidor decide permisos y duplicados. */
export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { obtenerUsuarios().then(setUsuarios).catch(e => setError(e.message)); }, []);
  const eliminar = async id => {
    if (!window.confirm('¿Eliminar esta cuenta?')) return;
    try {
      await eliminarUsuario(id);
      setUsuarios(await obtenerUsuarios());
    } catch (e) {
      setError(e.message);
    }
  };
  return <><AdminMenu /><h1>Administración de usuarios</h1><Button as={Link} to="/admin-nuevo-usuario">Nuevo usuario</Button>
 {error && <p role="alert">{error}</p>}
 <Table striped responsive className="mt-4"><caption>Cuentas registradas en Zona Bikers</caption><thead><tr><th scope="col">Nombre</th><th scope="col">Correo</th><th scope="col">Rol</th><th scope="col">Acciones</th></tr></thead>
 <tbody>{usuarios.map(u => <tr key={u.correo}><td>{u.nombre || 'Cuenta de prueba'}</td><th scope="row">{u.correo}</th><td>{u.rol}</td><td>
 <Link className="btn btn-outline-secondary btn-sm me-2" to={`/admin-nuevo-usuario?id=${u.id}`}>Editar {u.correo}</Link>
 <Button variant="outline-danger" size="sm" onClick={() => eliminar(u.id)}>Eliminar {u.correo}</Button></td></tr>)}</tbody></Table></>;
}
