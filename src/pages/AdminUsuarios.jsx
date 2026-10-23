import { useState } from 'react';
import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import AdminMenu from '../components/AdminMenu';
import { obtenerUsuarios, eliminarUsuario } from '../utils/cuentas';
/** Administración de las mismas cuentas locales utilizadas para iniciar sesión. */
export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState(obtenerUsuarios);
  const [error, setError] = useState('');
  const eliminar = correo => {
    if (!window.confirm('¿Eliminar esta cuenta local?')) return;
    try {
      eliminarUsuario(correo);
      setUsuarios(obtenerUsuarios());
    } catch {
      setError('No se pudo eliminar la cuenta.');
    }
  };
  return <><AdminMenu /><h1>Administración de usuarios</h1><Button as={Link} to="/admin-nuevo-usuario">Nuevo usuario</Button>
 {error && <p role="alert">{error}</p>}
 <Table striped responsive className="mt-4"><caption>Cuentas de demostración de este navegador</caption><thead><tr><th scope="col">Nombre</th><th scope="col">Correo</th><th scope="col">Rol</th><th scope="col">Acciones</th></tr></thead>
 <tbody>{usuarios.map(u => <tr key={u.correo}><td>{u.nombre || 'Cuenta de prueba'}</td><th scope="row">{u.correo}</th><td>{u.rol}</td><td>
 <Link className="btn btn-outline-secondary btn-sm me-2" to={`/admin-nuevo-usuario?correo=${encodeURIComponent(u.correo)}`}>Editar {u.correo}</Link>
 <Button variant="outline-danger" size="sm" onClick={() => eliminar(u.correo)}>Eliminar {u.correo}</Button></td></tr>)}</tbody></Table></>;
}
