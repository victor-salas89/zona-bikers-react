import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import AdminMenu from '../components/AdminMenu';
import CampoFormulario from '../components/CampoFormulario';
import { obtenerUsuarios, guardarUsuario } from '../utils/cuentas';
import { validarLogin, validarRut } from '../utils/validaciones';
import { regionesYComunas } from '../data/usuarios';
/** Crea o edita cuentas de demostración y evita correos duplicados. */
export default function AdminNuevoUsuario() {
  const [params] = useSearchParams();
  const anterior = params.get('correo');
  const navigate = useNavigate();
  const existente = anterior ? obtenerUsuarios().find(u => u.correo === anterior) : null;
  const [datos, setDatos] = useState(() => existente || {
    nombre: '',
    correo: '',
    contrasena: '',
    rol: 'cliente'
  });
  const [errores, setErrores] = useState({});
  const cambiar = e => setDatos({
    ...datos,
    [e.target.name]: e.target.value,
    ...(e.target.name === 'region' ? { comuna: '' } : {})
  });
  const enviar = e => {
    e.preventDefault();
    const errores = validarLogin(datos.correo, datos.contrasena);
    if (!datos.nombre?.trim()) errores.nombre = 'El nombre es requerido.';
    if (datos.run && !validarRut(datos.run)) errores.run = 'El RUN ingresado no es válido.';
    setErrores(errores);
    if (Object.keys(errores).length) return;
    try {
      guardarUsuario(datos, anterior);
      navigate('/admin-usuarios');
    } catch (error) {
      setErrores({
        correo: error.message
      });
    }
  };
  return <><AdminMenu /><section className="mx-auto" style={{
      maxWidth: 720
    }}><h1>{anterior ? 'Editar usuario' : 'Nuevo usuario'}</h1>
 {anterior && !existente ? <p role="alert">Usuario no encontrado.</p> : <Form noValidate onSubmit={enviar}>
  {[['nombre', 'Nombre'], ['apellidos', 'Apellidos'], ['run', 'RUN (opcional)'], ['correo', 'Correo', 'email'], ['contrasena', 'Contraseña', 'password'], ['fechaNacimiento', 'Fecha de nacimiento', 'date'], ['direccion', 'Dirección']].map(([id, etiqueta, tipo]) => <CampoFormulario key={id} id={id} etiqueta={etiqueta} tipo={tipo} valor={datos[id] || ''} onChange={cambiar} error={errores[id]} />)}
  <Form.Group controlId="region" className="mb-3"><Form.Label>Región</Form.Label><Form.Select name="region" value={datos.region || ''} onChange={cambiar}><option value="">Seleccione una región</option>{Object.keys(regionesYComunas).map(r => <option key={r}>{r}</option>)}</Form.Select></Form.Group>
  <Form.Group controlId="comuna" className="mb-3"><Form.Label>Comuna</Form.Label><Form.Select name="comuna" value={datos.comuna || ''} onChange={cambiar} disabled={!datos.region}><option value="">Seleccione una comuna</option>{(regionesYComunas[datos.region] || []).map(c => <option key={c}>{c}</option>)}</Form.Select></Form.Group>
  <Form.Group controlId="rol" className="mb-3"><Form.Label>Rol</Form.Label><Form.Select name="rol" value={datos.rol} onChange={cambiar}>{['cliente', 'vendedor', 'administrador'].map(r => <option key={r}>{r}</option>)}</Form.Select></Form.Group>
  <Button type="submit">Guardar usuario</Button> <Button as={Link} to="/admin-usuarios" variant="outline-secondary">Cancelar</Button>
 </Form>}</section></>;
}
